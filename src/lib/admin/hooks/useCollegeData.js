
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../hooks/supabase';

export const COLLEGE_COLUMNS = [
    { id: 'id', label: 'ID', width: 150 },
    { id: 'name', label: 'Name', width: 300 },
    { id: 'short_name', label: 'Short Name', width: 180 },
    { id: 'slug', label: 'Slug', width: 200 },
    { id: 'logo_url', label: 'Logo URL', width: 200 },
    { id: 'banner_url', label: 'Banner URL', width: 200 },
    { id: 'established_year', label: 'Est. Year', width: 100 },
    { id: 'college_type', label: 'Type', width: 120 },
    { id: 'ownership', label: 'Ownership', width: 150 },
    { id: 'address', label: 'Address', width: 250 },
    { id: 'city', label: 'City', width: 120 },
    { id: 'state', label: 'State', width: 120 },
    { id: 'website_url', label: 'Website', width: 200 },
    { id: 'email', label: 'Email', width: 200 },
    { id: 'phone', label: 'Phone', width: 140 },
    { id: 'nirf_ranking', label: 'NIRF Rank', width: 130 },
    { id: 'nirf_rank_category', label: 'NIRF Cat', width: 150 },
    { id: 'naac_grade', label: 'NAAC Grade', width: 150 },
    { id: 'total_courses', label: 'Total Courses', width: 220 },
    { id: 'total_seats', label: 'Total Seats', width: 100 },
    { id: 'student_faculty_ratio', label: 'SFR', width: 100 },
    { id: 'avg_annual_fees', label: 'Avg Fees', width: 100 },
    { id: 'min_fees', label: 'Min Fees', width: 140 },
    { id: 'max_fees', label: 'Max Fees', width: 140 },
    { id: 'hostel_fees_per_year', label: 'Hostel Fees', width: 150 },
    { id: 'avg_package_lpa', label: 'Avg Package LPA', width: 180 },
    { id: 'highest_package_lpa', label: 'Highest Package LPA', width: 180 },
    { id: 'median_package_lpa', label: 'Median Package LPA', width: 180 },
    { id: 'placement_rate_pct', label: 'Placement Rate %', width: 200 },
    { id: 'campus_area_acres', label: 'Campus Area (Acres)', width: 200 },
    { id: 'has_hostel', label: 'Has Hostel?', width: 150 },
    { id: 'has_girls_hostel', label: 'Has Girls Hostel?', width: 150 },
    { id: 'has_sports_complex', label: 'Has Sports Complex?', width: 200 },
    { id: 'has_library', label: 'Has Library?', width: 150 },
    { id: 'has_medical_facility', label: 'Has Medical Facility?', width: 150 },
    { id: 'has_wifi', label: 'Has Wi-Fi?', width: 150 },
    { id: 'avg_rating', label: 'Avg Rating', width: 150 },
    { id: 'is_featured', label: 'Featured?', width: 150 },
    { id: 'is_active', label: 'Active?', width: 150 },
    { id: 'created_at', label: 'Created At', width: 180 },
    { id: 'updated_at', label: 'Updated At', width: 180 },
];

export function useCollegeData({
    sortKey = 'name',
    sortDir = 'asc',
    searchQuery = '',
    page = 0,
    pageSize = 15,
} = {}) {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchColleges = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from('colleges')
                .select('*', { count: 'exact' }) 
                .order(sortKey, { ascending: sortDir === 'asc' })
                .range(from, to);

            if (searchQuery) {
                const trimmedSearchQuery = searchQuery.trim();
                if (trimmedSearchQuery) {
                    const searchFields = [
                        'name', 'short_name', 'city', 'state', 'slug',
                        'address', 'nirf_rank_category', 'naac_grade'
                    ];

                    const searchFilters = searchFields.map(field => `${field}.ilike.%${trimmedSearchQuery}%`);
                    const searchFilterString = searchFilters.join(',');

                    query = query.or(searchFilterString);
                }
            }

            const { data: collegesData, count, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const collegesWithCounts = await Promise.all(
                collegesData.map(async (college) => {
                    const { count: courseCount, error: countError } = await supabase
                        .from('courses')
                        .select('*', { count: 'exact', head: true })
                        .eq('college_id', college.id)
                        .eq('is_active', true);

                    if (countError) {
                        console.error(`Error fetching course count for college ${college.id}:`, countError);
                        return { ...college, total_courses: 0 };
                    }
                    return { ...college, total_courses: courseCount || 0 };
                })
            );

            setColleges(collegesWithCounts);
            setTotalCount(count || 0);

        } catch (err) {
            console.error('Error fetching colleges in useCollegeData:', err);
            setError(err.message);
            setColleges([]); 
            setTotalCount(0); 
        } finally {
            setLoading(false);
        }
    }, [sortKey, sortDir, searchQuery, page, pageSize]); 

    const createCollege = useCallback(async (collegeData) => {
        try {
            const { data, error } = await supabase
                .from('colleges')
                .insert([collegeData])
                .select('*')
                .single(); 

            if (error) throw error;
            console.log('Created College:', data);
            fetchColleges(); 
            return data;
        } catch (err) {
            console.error('Error creating college:', err);
            throw err;
        }
    }, [fetchColleges]);

    const updateCollege = useCallback(async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('colleges')
                .update(updates)
                .eq('id', id)
                .select('*')
                .single(); 

            if (error) throw error;
            console.log('Updated College:', data);
            fetchColleges();
            return data;
        } catch (err) {
            console.error('Error updating college:', err);
            throw err;
        }
    }, [fetchColleges]);

    const deleteCollege = useCallback(async (id) => {
        try {
            const { error } = await supabase
                .from('colleges')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('Deleted College with ID:', id);
            fetchColleges(); 
        } catch (err) {
            console.error('Error deleting college:', err);
            throw err;
        }
    }, [fetchColleges]);

    useEffect(() => {
        fetchColleges();
    }, [fetchColleges]); 

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        colleges,
        loading,
        error,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        refetch: fetchColleges,
        createCollege,
        updateCollege,
        deleteCollege,
    };
}