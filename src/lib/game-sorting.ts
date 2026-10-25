/**
 * Locale-aware ordering rules for games shown in the catalog.
 */
export type GameSortOrder = 'title-asc' | 'title-desc' | 'rating-desc';

/**
 * Sorts games without changing the input collection.
 * @param games Games to order.
 * @param order Selected title or rating order.
 * @param collator Locale-aware title comparator; defaults to the runtime locale.
 * @returns A new array in the selected order.
 */
export function sortGames<T extends { title: string; starRating: number | null }>(
    games: readonly T[],
    order: GameSortOrder,
    collator: Intl.Collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }),
): T[] {
    const compareTitles = (left: T, right: T): number =>
        collator.compare(left.title, right.title) ||
        (left.title < right.title ? -1 : left.title > right.title ? 1 : 0);

    return [...games].sort((left, right) => {
        if (order === 'rating-desc') {
            if (left.starRating === null && right.starRating !== null) return 1;
            if (left.starRating !== null && right.starRating === null) return -1;

            if (left.starRating !== null && right.starRating !== null) {
                const ratingOrder = right.starRating - left.starRating;
                if (ratingOrder !== 0) return ratingOrder;
            }

            return compareTitles(left, right);
        }

        const titleOrder = compareTitles(left, right);
        return order === 'title-desc' ? -titleOrder : titleOrder;
    });
}
