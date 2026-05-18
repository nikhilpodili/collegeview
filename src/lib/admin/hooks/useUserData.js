import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../hooks/supabase'; 

export const USER_COLUMNS = [
    { id: 'id', label: 'ID', width: 150 },
    { id: 'full_name', label: 'Full Name', width: 250 },
    { id: 'username', label: 'Username', width: 180 },
    { id: 'email', label: 'Email', width: 280 },
    { id: 'bio', label: 'Bio', width: 250 },
    { id: 'gender', label: 'Gender', width: 120 },
    { id: 'current_college', label: 'Current College', width: 200 },
    { id: 'graduation_year', label: 'Year', width: 100 },
    { id: 'saved_colleges', label: 'Saved Colleges', width: 160 },
    { id: 'state', label: 'State', width: 150 },
    { id: 'city', label: 'City', width: 150 },
    { id: 'is_admin', label: 'Is Admin', width: 120 },
    { id: 'is_verified', label: 'Verified', width: 120 },
    { id: 'is_blocked', label: 'Status', width: 120 },
    { id: 'created_at', label: 'Joined Date', width: 200 },
];

export function useUserData({
    sortKey = 'created_at',
    sortDir = 'desc',
    searchQuery = '',
    page = 0,
    pageSize = 15,
} = {}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    console.log("useUserData: Initial state - users:", users, "loading:", loading, "error:", error); 

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from('profiles')
                .select(`
                    id, 
                    username, 
                    gender,
                    full_name, 
                    avatar_url, 
                    bio, 
                    current_college, 
                    graduation_year, 
                    state, 
                    city, 
                    is_verified, 
                    is_admin, 
                    is_blocked, 
                    created_at, 
                    email,
                    saved_colleges (
                        college_id,
                        colleges (
                            name,
                            short_name
                        )
                    )
                `, { count: 'exact' })    
                .order(sortKey, { ascending: sortDir === 'asc' })
                .range(from, to); 

            if (searchQuery) {
                const sanitizedQuery = searchQuery.trim();
                if (sanitizedQuery) {
                    const searchFilters = [
                        `full_name.ilike.%${sanitizedQuery}%`,
                        `username.ilike.%${sanitizedQuery}%`,
                        `bio.ilike.%${sanitizedQuery}%`,
                        `current_college.ilike.%${sanitizedQuery}%`,
                        `state.ilike.%${sanitizedQuery}%`,
                        `city.ilike.%${sanitizedQuery}%`,
                        `email.ilike.%${sanitizedQuery}%`,
                        `gender.ilike.%${sanitizedQuery}%`
                    ].join(',');

                    query = query.or(searchFilters);
                }
            }

            const { data, count, error: queryError } = await query;

            if (queryError) throw queryError;

            const processedUsers = (data || []).map(user => ({
                ...user,
                gender: (user.gender === 'null' || !user.gender) ? '—' : user.gender.trim(),
                is_admin: user.is_admin === true || user.is_admin === 'true',
                is_verified: user.is_verified === true || user.is_verified === 'true',
                is_blocked: user.is_blocked === true || user.is_blocked === 'true' || user.is_blocked === 'TRUE',
                saved_colleges: user.saved_colleges || [],
            }));

            console.log("useUserData: Fetched data - raw:", data, "processed:", processedUsers); 


            setUsers(processedUsers);
            setTotalCount(count || 0);

        } catch (err) {
            console.error('Error fetching users in useUserData:', err);
            setError(err.message);
            setUsers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [sortKey, sortDir, searchQuery, page, pageSize]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    console.log("useUserData: Returning - users:", users, "loading:", loading, "error:", error); 

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        users,
        loading,
        error,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        refetch: fetchUsers, 
    };
}