import { mikroOrmConfig } from "@game-watch/database";
import { createQueue, createWorkerForQueue, QueueType } from "@game-watch/queue";
import { createLogger } from "@game-watch/service";
import { MikroORM } from "@mikro-orm/core";
import { Worker } from "bullmq";

import { searchForGame } from "./search-for-game";
import { SearchService } from "./search-service";
import { EpicSearcher } from "./searchers/epic-searcher";
import { MetacriticSearcher } from "./searchers/metacritic-searcher";
import { PsStoreSearcher } from "./searchers/ps-store-searcher";
import { SteamSearcher } from "./searchers/steam-searcher";
import { SwitchSearcher } from "./searchers/switch-searcher";

const logger = createLogger("Searcher");

let worker: Worker | undefined;

const searchService = new SearchService([
    new EpicSearcher(),
    new MetacriticSearcher(),
    new PsStoreSearcher(),
    new SteamSearcher(),
    new SwitchSearcher()
]);

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    const resolveGameQueue = createQueue(QueueType.ResolveGame);
    const resolveSourceQueue = createQueue(QueueType.ResolveSource);

    worker = createWorkerForQueue(QueueType.SearchGame, async ({ data: { gameId } }) => {
        const gameScopedLogger = logger.child({ gameId });
        try {
            await searchForGame({
                gameId,
                searchService,
                logger: gameScopedLogger,
                em: orm.em.fork(),
                resolveSourceQueue
            });

            await resolveGameQueue.add(QueueType.ResolveGame, { gameId });
        } catch (error) {
            // Need to wrap this because otherwise the error is swallowed by the worker.
            logger.error(error);
            throw error;
        }
    });

    logger.info("Listening for events");
};

main().catch(error => {
    if (worker) {
        worker.close();
    }
    logger.error(error);
    process.exit(1);
});
