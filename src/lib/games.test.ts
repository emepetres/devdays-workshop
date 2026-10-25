import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
} from './games';

async function seedFilterGames(db: Database): Promise<{ strategyId: number; puzzleId: number; codeForgeId: number }> {
    const insertedCategories = await db
        .insert(categories)
        .values([
            { name: 'Strategy', description: 'strategy' },
            { name: 'Puzzle', description: 'puzzle' },
        ])
        .returning({ id: categories.id });
    const insertedPublishers = await db
        .insert(publishers)
        .values([
            { name: 'CodeForge Studios', description: 'publisher' },
            { name: 'DevMasters Inc.', description: 'publisher' },
        ])
        .returning({ id: publishers.id });

    await db.insert(games).values([
        {
            title: 'DevOps Dominion',
            description: 'A strategy game',
            starRating: 4.2,
            categoryId: insertedCategories[0].id,
            publisherId: insertedPublishers[0].id,
        },
        {
            title: 'Code Puzzle Chronicles',
            description: 'A puzzle game',
            starRating: 4.3,
            categoryId: insertedCategories[1].id,
            publisherId: insertedPublishers[0].id,
        },
        {
            title: 'Server Siege',
            description: 'Another strategy game',
            starRating: 4.4,
            categoryId: insertedCategories[0].id,
            publisherId: insertedPublishers[1].id,
        },
    ]);

    return {
        strategyId: insertedCategories[0].id,
        puzzleId: insertedCategories[1].id,
        codeForgeId: insertedPublishers[0].id,
    };
}

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('filters by one or more categories and publisher', async () => {
        const { strategyId, puzzleId, codeForgeId } = await seedFilterGames(db);

        const categoryMatches = await getAllGames(db, { categoryIds: [strategyId, puzzleId] });
        expect(categoryMatches.map((game) => game.title)).toEqual([
            'Code Puzzle Chronicles',
            'DevOps Dominion',
            'Server Siege',
        ]);

        const publisherMatches = await getAllGames(db, { publisherId: codeForgeId });
        expect(publisherMatches.map((game) => game.title)).toEqual([
            'Code Puzzle Chronicles',
            'DevOps Dominion',
        ]);
    });

    it('combines category and publisher filters', async () => {
        const { strategyId, puzzleId, codeForgeId } = await seedFilterGames(db);

        const filtered = await getAllGames(db, {
            categoryIds: [strategyId, puzzleId],
            publisherId: codeForgeId,
        });

        expect(filtered.map((game) => game.title)).toEqual([
            'Code Puzzle Chronicles',
            'DevOps Dominion',
        ]);
    });
});
