
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../hooks/supabase';

export const REPLY_COLUMNS = [
    { id: 'id', label: 'ID', width: 100 },
    { id: 'author', label: 'Author', width: 220 },
    { id: 'body', label: 'Body', width: 400 },
    { id: 'upvotes', label: 'Upvotes', width: 100 },
    { id: 'is_approved', label: 'Approved', width: 120 },
    { id: 'created_at', label: 'Date', width: 150 },
];

export function useReplyData(threadId, {
    sortKey = 'created_at',
    sortDir = 'asc',
    searchQuery = '',
    page = 0,
    pageSize = 15,
} = {}) {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchReplies = useCallback(async () => {
        if (!threadId) {
            setReplies([]);
            setTotalCount(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            let effectiveSortKey = sortKey;
            if (sortKey === 'author') effectiveSortKey = 'author_name';

            let query = supabase
                .from('forum_replies')
                .select(`
                    *,
                    profiles:profiles!author_id ( avatar_url )
                `, { count: 'exact' })
                .eq('thread_id', threadId)
                .order(effectiveSortKey, { ascending: sortDir === 'asc' })
                .range(from, to);

            if (searchQuery) {
                const sanitizedQuery = searchQuery.trim();
                if (sanitizedQuery) {
                    query = query.or(`body.ilike.%${sanitizedQuery}%,author_name.ilike.%${sanitizedQuery}%`);
                }
            }

            const { data, count, error: queryError } = await query;

            if (queryError) throw queryError;

            setReplies(data || []);
            setTotalCount(count || 0);

        } catch (err) {
            console.error('Error fetching replies:', err);
            setError(err.message);
            setReplies([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [threadId, sortKey, sortDir, searchQuery, page, pageSize]);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies]);

    const updateReply = async (id, updates) => {
        try {
            const { error: updateError } = await supabase
                .from('forum_replies')
                .update(updates)
                .eq('id', id);
            if (updateError) throw updateError;
            fetchReplies();
        } catch (err) {
            throw err;
        }
    };

    const deleteReply = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from('forum_replies')
                .delete()
                .eq('id', id);
            if (deleteError) throw deleteError;
            fetchReplies();
        } catch (err) {
            throw err;
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        replies,
        loading,
        error,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        refetch: fetchReplies,
        updateReply,
        deleteReply,
    };
}
