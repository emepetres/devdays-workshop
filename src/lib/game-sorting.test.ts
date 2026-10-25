/**
 * Verifies the public game sorting behavior used by the catalog listing.
 */
import { describe, expect, it } from 'vitest';
import { sortGames, type GameSortOrder } from './game-sorting';

interface SortableGame {
    title: string;
    starRating: number | null;
}

const collator = new Intl.Collator('en-US', { numeric: true, sensitivity: 'base' });

const games: SortableGame[] = [
    { title: 'Game 10', starRating: 4.1 },
    { title: 'Zulu Rated', starRating: 4.8 },
    { title: 'Game 2', starRating: null },
    { title: 'Alpha Rated', starRating: 4.8 },
    { title: 'Middle Rated', starRating: 3.9 },
    { title: 'Zulu Unrated', starRating: null },
];

describe('sortGames', () => {
    it.each([
        ['title-asc', ['Alpha Rated', 'Game 2', 'Game 10', 'Middle Rated', 'Zulu Rated', 'Zulu Unrated']],
        ['title-desc', ['Zulu Unrated', 'Zulu Rated', 'Middle Rated', 'Game 10', 'Game 2', 'Alpha Rated']],
    ] as const satisfies readonly (readonly [GameSortOrder, readonly string[]])[])(
        'sorts titles in %s order using locale-aware numeric collation',
        (order, expectedTitles) => {
            expect(sortGames(games, order, collator).map((game) => game.title)).toEqual(expectedTitles);
        },
    );

    it('orders rated games highest-first, breaks rating ties by title, and puts unrated games last', () => {
        expect(sortGames(games, 'rating-desc', collator).map((game) => game.title)).toEqual([
            'Alpha Rated',
            'Zulu Rated',
            'Game 10',
            'Middle Rated',
            'Game 2',
            'Zulu Unrated',
        ]);
    });
});
