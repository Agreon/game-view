import { EpicGameData, InfoSourceType } from "@game-watch/shared";
import axios from "axios";
import * as cheerio from 'cheerio';

import { InfoResolver } from "../resolve-service";

export class EpicResolver implements InfoResolver {
    public type = InfoSourceType.Epic;

    public async resolve(id: string): Promise<EpicGameData> {
        const { data } = await axios.get<string>(id);

        const $ = cheerio.load(data);

        const fullName = $("div[data-component=PDPTitleHeader] > span").first().text().trim();
        const discountedFromPrice = $("div[data-component=PDPDiscountedFromPrice]").first().text().trim();
        const price = $("div[data-component=PriceLayout] span[data-component=Text]").last().text().trim();
        const releaseDate = $("time").first().attr("datetime")?.trim();
        const thumbnailUrl = $("div[data-component=PDPSidebarLogo] img").attr("src");

        return {
            id,
            fullName,
            url: id,
            thumbnailUrl,
            releaseDate: releaseDate ?? "TBD",
            priceInformation: price !== "" ? {
                initial: discountedFromPrice ?? price,
                final: price,
            } : undefined
        };

    }
}