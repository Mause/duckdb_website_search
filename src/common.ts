const queryBuilder = (index_schema: string, index_name: string) => `
SELECT title, score
FROM (SELECT *, fts_${index_schema}_${index_name}.match_bm25(title, ?) AS score
    FROM ${index_name}) sq
WHERE score IS NOT NULL
ORDER BY score DESC
LIMIT 10;
`;
export const query = queryBuilder('main', 'search_index');
