
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../hooks/supabase';

export const THREAD_COLUMNS = [
    { id: 'id', label: 'ID', width: 150 },
    { id: 'author', label: 'Author', width: 220 },
    { id: 'college', label: 'College', width: 220 },
    { id: 'title', label: 'Title', width: 250 },
    { id: 'body', label: 'Body', width: 300 },
    { id: 'tags', label: 'Tags', width: 150 },
    { id: 'status', label: 'Status', width: 120 },
    { id: 'reply_count', label: 'Replies', width: 100 },
    { id: 'is_approved', label: 'Approved', width: 120 },
    { id: 'created_at', label: 'Created At', width: 150 },
    { id: 'updated_at', label: 'Updated At', width: 150 },
];

export function useThreadData({
    sortKey = 'created_at',
    sortDir = 'desc',
    searchQuery = '',
    filterStatus = 'all', 
    page = 0,
    pageSize = 15,
} = {}) {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchThreads = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            let effectiveSortKey = sortKey;
            if (sortKey === 'author') effectiveSortKey = 'author_name';
            if (sortKey === 'college') effectiveSortKey = 'college_name';

            let query = supabase
                .from('forum_threads')
                .select(`
                    *,
                    profiles:profiles!author_id ( avatar_url )
                `, { count: 'exact' })
                .order(effectiveSortKey, { ascending: sortDir === 'asc' })
                .range(from, to);

            if (searchQuery) {
                const sanitizedQuery = searchQuery.trim();
                if (sanitizedQuery) {
                    query = query.or(`title.ilike.%${sanitizedQuery}%,body.ilike.%${sanitizedQuery}%,author_name.ilike.%${sanitizedQuery}%,college_name.ilike.%${sanitizedQuery}%`);
                }
            }

            if (filterStatus === 'pending') {
                query = query.eq('is_approved', false);
            } else if (filterStatus === 'approved') {
                query = query.eq('is_approved', true);
            } else if (filterStatus === 'open') {
                query = query.eq('status', 'open');
            } else if (filterStatus === 'closed') {
                query = query.eq('status', 'closed');
            }

            const { data, count, error: queryError } = await query;

            if (queryError) throw queryError;

            const processedThreads = (data || []).map(thread => ({
                ...thread,
                is_approved: Boolean(thread.is_approved),
            }));

            setThreads(processedThreads);
            setTotalCount(count || 0);

        } catch (err) {
            console.error('Error fetching threads:', err);
            setError(err.message);
            setThreads([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [sortKey, sortDir, searchQuery, filterStatus, page, pageSize]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    const updateThread = async (id, updates) => {
        try {
            const { error: updateError } = await supabase
                .from('forum_threads')
                .update(updates)
                .eq('id', id);
            if (updateError) throw updateError;
            fetchThreads();
        } catch (err) {
            console.error('Update Thread Error:', err);
            throw err;
        }
    };

    const deleteThread = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from('forum_threads')
                .delete()
                .eq('id', id);
            if (deleteError) throw deleteError;
            fetchThreads();
        } catch (err) {
            console.error('Delete Thread Error:', err);
            throw err;
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        threads,
        loading,
        error,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        refetch: fetchThreads,
        updateThread,
        deleteThread,
    };
}
