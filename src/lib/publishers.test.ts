import { beforeEach, describe, expect, it } from 'vitest';
import { publishers } from '../../db/schema';
import { createTestDatabase } from '../../db/test-helpers';
import type { Database } from './db';
import { getAllPublishers } from './publishers';

describe('getAllPublishers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns publishers ordered by name with only their ids and names', async () => {
        const [zeta] = await db
            .insert(publishers)
            .values({ name: 'Zeta Games' })
            .returning({ id: publishers.id });
        const [alpha] = await db
            .insert(publishers)
            .values({ name: 'Alpha Games' })
            .returning({ id: publishers.id });

        expect(await getAllPublishers(db)).toEqual([
            { id: alpha.id, name: 'Alpha Games' },
            { id: zeta.id, name: 'Zeta Games' },
        ]);
    });

    it('returns an empty list when there are no publishers', async () => {
        expect(await getAllPublishers(db)).toEqual([]);
    });
});
