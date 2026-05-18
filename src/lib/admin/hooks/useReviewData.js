
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../hooks/supabase';

export const REVIEW_COLUMNS = [
    { id: 'id', label: 'ID', width: 150 },
    { id: 'user', label: 'User', width: 220 },
    { id: 'college', label: 'College', width: 220 },
    { id: 'course_studied', label: 'Course', width: 150 },
    { id: 'title', label: 'Title', width: 250 },
    { id: 'body', label: 'Body', width: 300 },
    { id: 'pros', label: 'Pros', width: 200 },
    { id: 'cons', label: 'Cons', width: 200 },
    { id: 'overall_rating', label: 'Overall', width: 180 },
    { id: 'academic_rating', label: 'Academic', width: 160 },
    { id: 'placement_rating', label: 'Placement', width: 160 },
    { id: 'infrastructure_rating', label: 'Infrastructure', width: 180 },
    { id: 'social_life_rating', label: 'Social Life', width: 180 },
    { id: 'faculty_rating', label: 'Faculty', width: 180 },
    { id: 'value_for_money_rating', label: 'Value/Money', width: 180 },
    { id: 'tags', label: 'Tags', width: 150 },
    { id: 'is_alumni', label: 'Alumni', width: 100 },
    { id: 'batch_year', label: 'Batch Year', width: 100 },
    { id: 'helpful_count', label: 'Helpful Votes', width: 120 },
    { id: 'is_approved', label: 'Approved', width: 140 },
    { id: 'is_verified', label: 'Verified', width: 120 },
    { id: 'created_at', label: 'Created At', width: 150 },
    { id: 'updated_at', label: 'Updated At', width: 150 },
];

export function useReviewData({
    sortKey = 'created_at',
    sortDir = 'desc',
    searchQuery = '',
    filterStatus = 'all', 
    page = 0,
    pageSize = 15,
} = {}) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            let effectiveSortKey = sortKey;
            if (sortKey === 'user') effectiveSortKey = 'user_name';
            if (sortKey === 'college') effectiveSortKey = 'college_name';

            let query = supabase
                .from('reviews')
                .select(`
                    *,
                    profiles:profiles!user_id ( avatar_url )
                `, { count: 'exact' })
                .order(effectiveSortKey, { ascending: sortDir === 'asc' })
                .range(from, to);

            if (searchQuery) {
                const sanitizedQuery = searchQuery.trim();
                if (sanitizedQuery) {
                    query = query.or(`title.ilike.%${sanitizedQuery}%,course_studied.ilike.%${sanitizedQuery}%,college_name.ilike.%${sanitizedQuery}%,user_name.ilike.%${sanitizedQuery}%`);
                }
            }

            if (filterStatus === 'pending') {
                query = query.eq('is_approved', false);
            } else if (filterStatus === 'approved') {
                query = query.eq('is_approved', true);
            }

            const { data, count, error: queryError } = await query;

            if (queryError) throw queryError;

                const processedReviews = (data || []).map(review => ({
                ...review,
                is_approved: Boolean(review.is_approved),
                is_verified: Boolean(review.is_verified),
            }));

            setReviews(processedReviews);
            setTotalCount(count || 0);

        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err.message);
            setReviews([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [sortKey, sortDir, searchQuery, filterStatus, page, pageSize]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const updateReview = async (id, updates) => {
        try {
            const { error: updateError } = await supabase
                .from('reviews')
                .update(updates)
                .eq('id', id);
            if (updateError) throw updateError;
            fetchReviews();
        } catch (err) {
            console.error('Update Review Error:', err);
            throw err;
        }
    };

    const deleteReview = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);
            if (deleteError) throw deleteError;
            fetchReviews();
        } catch (err) {
            console.error('Delete Review Error:', err);
            throw err;
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        reviews,
        loading,
        error,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        refetch: fetchReviews,
        updateReview,
        deleteReview,
    };
}
