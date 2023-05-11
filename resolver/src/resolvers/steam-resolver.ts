import {
    Country,
    InfoSourceType,
    SteamGameData,
    StorePriceInformation,
    StoreReleaseDateInformation,
} from '@game-watch/shared';
import { AxiosInstance } from 'axios';

import { InfoResolver, InfoResolverContext } from '../resolve-service';
import { getSteamApiData } from '../util/get-steam-api-data';
import { parseDate } from '../util/parse-date';

export class SteamResolver implements InfoResolver {
    public type = InfoSourceType.Steam;

    public constructor(private readonly axios: AxiosInstance) { }

    public async resolve({ source }: InfoResolverContext): Promise<SteamGameData> {
        const data = await getSteamApiData({ axios: this.axios, source });

        return {
            id: source.data.id,
            fullName: source.data.fullName,
            url: `https://store.steampowered.com/app/${source.data.id}`,
            thumbnailUrl: data.header_image,
            releaseDate: this.getReleaseDateInformation(data.release_date.date, source.country),
            priceInformation: data.is_free
                ? { final: 0 }
                : this.getPriceInformation(data.price_overview ?? {}),
            isEarlyAccess: data.genres.some(genre => genre.id === '70')
        };
    }

    private getReleaseDateInformation(
        date: string,
        userCountry: Country
    ): StoreReleaseDateInformation | undefined {
        if (date === 'Coming soon') {
            return undefined;
        }

        const parsedDate = this.parseReleaseDate(date, userCountry);
        if (!parsedDate) {
            return {
                isExact: false,
                date
            };
        } else {
            return {
                isExact: true,
                date: parsedDate
            };
        }
    }

    private parseReleaseDate(releaseDate: string, userCountry: Country) {
        // Transforms `CH-DE` to `de`
        const locale = (userCountry.split('-')[1] ?? userCountry.split('-')[0]).toLowerCase();

        const cleanedReleaseDate = releaseDate
            // The dots create problems with dayjs parsing.
            .replace(/\.|\,/g, '')
            // Portuguese release dates will come in the format: 1\/set.\/2011
            .replace(/\\\//g, ' ')
            // For some reason "Okt" and "Dez" is leading to an invalid date.
            // So we use the english one.
            .replace('Okt', 'Oct')
            .replace('Dez', 'Dec');

        // Sometimes the locale does not match the return value. Then we try other formats.
        return parseDate(cleanedReleaseDate, ['D MMM YYYY', 'D MMMM YYYY'], locale)
            ?? parseDate(cleanedReleaseDate, ['D MMM YYYY', 'D MMMM YYYY'])
            ?? parseDate(cleanedReleaseDate);
    }

    private getPriceInformation(
        { initial, final }: Record<string, any>
    ): StorePriceInformation | undefined {
        if (!initial || !final) {
            return undefined;
        }

        // Those values are returned in cents. So we need to convert them.
        return {
            initial: initial / 100,
            final: final / 100,
        };
    }
}
