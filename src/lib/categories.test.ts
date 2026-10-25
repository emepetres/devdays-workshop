import { beforeEach, describe, expect, it } from 'vitest';
import { categories } from '../../db/schema';
import { createTestDatabase } from '../../db/test-helpers';
import type { Database } from './db';
import { getAllCategories } from './categories';

describe('getAllCategories', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns categories ordered by name with only their ids and names', async () => {
        const [zeta] = await db
            .insert(categories)
            .values({ name: 'Zeta Category' })
            .returning({ id: categories.id });
        const [alpha] = await db
            .insert(categories)
            .values({ name: 'Alpha Category' })
            .returning({ id: categories.id });

        expect(await getAllCategories(db)).toEqual([
            { id: alpha.id, name: 'Alpha Category' },
            { id: zeta.id, name: 'Zeta Category' },
        ]);
    });

    it('returns an empty list when there are no categories', async () => {
        expect(await getAllCategories(db)).toEqual([]);
    });
});
