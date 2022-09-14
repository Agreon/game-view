import * as t from "io-ts";
import { IntFromString } from "io-ts-types";

export const EnvironmentStructure = t.type({
    SEARCH_GAME_CONCURRENCY: IntFromString,
    SYNC_SOURCES_AT: t.string,
    REDIS_HOST: t.string,
    REDIS_PASSWORD: t.string,
    REDIS_PORT: IntFromString,
    CACHING_ENABLED: t.boolean
});

export type Environment = t.TypeOf<typeof EnvironmentStructure>;
