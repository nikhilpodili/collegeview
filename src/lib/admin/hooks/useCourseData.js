
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../hooks/supabase'; 


export const COURSE_COLUMNS = [
  { id: 'id', label: 'ID', width: 150 },
  { id: 'name', label: 'Course Name', width: 300 },
  { id: 'short_name', label: 'Short Name', width: 180 },
  { id: 'level', label: 'Level', width: 120 },
  { id: 'stream', label: 'Stream', width: 150 },
  { id: 'duration_years', label: 'Duration (Years)', width: 120 },
  { id: 'total_seats', label: 'Seats', width: 100 },
  { id: 'annual_fees', label: 'Annual Fees', width: 120 },
  { id: 'entrance_exam', label: 'Entrance Exam', width: 150 },
  { id: 'min_cutoff', label: 'Min Cutoff', width: 120 },
  { id: 'is_active', label: 'Active?', width: 100 },
  { id: 'created_at', label: 'Created At', width: 180 },
];

export function useCourseData(collegeId) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!collegeId) {
      setCourses([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('college_id', collegeId)
        .order('name', { ascending: true }); 

      if (fetchError) throw fetchError;

      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses in useCourseData:', err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  const createCourse = useCallback(async (courseData) => {
    if (!courseData.college_id) {
      throw new Error('college_id is required to create a course.');
    }
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select('*')
        .single();

      if (error) throw error;
      console.log('Created Course:', data);
      fetchCourses(); 
      return data;
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  }, [fetchCourses]);

  const updateCourse = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      console.log('Updated Course:', data);
      fetchCourses(); 
      return data;
    } catch (err) {
      console.error('Error updating course:', err);
      throw err;
    }
  }, [fetchCourses]);

  const deleteCourse = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('Deleted Course with ID:', id);
      fetchCourses(); 
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}