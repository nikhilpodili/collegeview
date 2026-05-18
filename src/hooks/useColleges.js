import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/hooks/supabase';

/**
 * useColleges — fetch + sort + filter colleges from Supabase
 */
export function useColleges({ sortBy = 'nirf_ranking', order = 'asc', search = '', collegeType = '', state = '', examFilter = '', page = 1, pageSize = 15 } = {}) {
  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchColleges = useCallback(async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('colleges')
        .select(`
          id, name, short_name, slug, logo_url,
          college_type, ownership, state, city,
          nirf_ranking, naac_grade,
          avg_annual_fees, avg_package_lpa, highest_package_lpa,
          placement_rate_pct, avg_rating, total_reviews,
          entrance_exams, top_recruiters, is_featured,
          established_year, description, campus_area_acres
        `, { count: 'exact' })
        .eq('is_active', true);

      if (search) {
        query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,short_name.ilike.%${search}%`);
      }
      if (collegeType) {
        query = query.eq('college_type', collegeType);
      }
      if (state) {
        query = query.eq('state', state);
      }
      if (examFilter) {
        query = query.contains('entrance_exams', [examFilter]);
      }

      // Sorting
      const ascending = order === 'asc';
      if (sortBy === 'nirf_ranking') {
        query = query.order('nirf_ranking', { ascending: true, nullsFirst: false });
      } else if (sortBy === 'avg_rating') {
        query = query.order('avg_rating', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'avg_annual_fees_asc') {
        query = query.order('avg_annual_fees', { ascending: true, nullsFirst: false });
      } else if (sortBy === 'avg_annual_fees_desc') {
        query = query.order('avg_annual_fees', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'avg_package_lpa') {
        query = query.order('avg_package_lpa', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'total_reviews') {
        query = query.order('total_reviews', { ascending: false, nullsFirst: false });
      } else {
        query = query.order(sortBy, { ascending });
      }

      query = query.range(from, to);

      const { data, error: err, count } = await query;
      if (err) throw err;
      setColleges(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, order, search, collegeType, state, examFilter, page, pageSize]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const totalPages = Math.ceil(totalCount / pageSize);
  return { colleges, loading, error, totalCount, totalPages, refetch: fetchColleges };
}


/**
 * useCollege — fetch a single college by slug with full details
 */
export function useCollege(slug) {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('colleges')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();
        if (err) throw err;
        setCollege(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { college, loading, error };
}

/**
 * useCollegeReviews — fetch reviews for a college with pagination
 */
export function useCollegeReviews(collegeId, { page = 1, pageSize = 5, sortBy = 'newest' } = {}) {
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!collegeId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles:profiles!reviews_user_id_fkey (
            id, full_name, username, avatar_url, city, state, current_college, graduation_year, bio, is_verified
          )
        `, { count: 'exact' })
        .eq('college_id', collegeId)
        .eq('is_approved', true);

      // Sorting Logic
      if (sortBy === 'rating_high') {
        query = query.order('overall_rating', { ascending: false });
      } else if (sortBy === 'rating_low') {
        query = query.order('overall_rating', { ascending: true });
      } else if (sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else {
        // default: newest
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setReviews(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Review Fetch Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collegeId, page, pageSize, sortBy]);

  const deleteReview = useCallback(async (reviewId) => {
    if (!reviewId) return { error: 'Review ID is required' };
    try {
      const { data, error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Permission denied or review not found.');
      }

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setTotalCount(prev => Math.max(0, prev - 1));
      return { success: true };
    } catch (err) {
      console.error('Review Delete Error:', err.message);
      return { error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const totalPages = Math.ceil(totalCount / pageSize);
  return { reviews, totalCount, totalPages, loading, error, deleteReview, refetch: fetchReviews };
}


/**
 * useCollegeReviewStats — fetch all ratings for a college to compute stats
 */
export function useCollegeReviewStats(collegeId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!collegeId) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          overall_rating, academic_rating, placement_rating,
          infrastructure_rating, social_life_rating, faculty_rating,
          value_for_money_rating
        `)
        .eq('college_id', collegeId)
        .eq('is_approved', true);

      if (error) throw error;

      if (!data || data.length === 0) {
        setStats(null);
        return;
      }

      const totals = {
        overall: 0, academic: 0, placement: 0, infra: 0, social: 0, faculty: 0, vfm: 0
      };
      data.forEach(r => {
        totals.overall += r.overall_rating || 0;
        totals.academic += r.academic_rating || 0;
        totals.placement += r.placement_rating || 0;
        totals.infra += r.infrastructure_rating || 0;
        totals.social += r.social_life_rating || 0;
        totals.faculty += r.faculty_rating || 0;
        totals.vfm += r.value_for_money_rating || 0;
      });

      const count = data.length;
      setStats({
        overall: (totals.overall / count).toFixed(1),
        academic: (totals.academic / count).toFixed(1),
        placement: (totals.placement / count).toFixed(1),
        infra: (totals.infra / count).toFixed(1),
        social: (totals.social / count).toFixed(1),
        faculty: (totals.faculty / count).toFixed(1),
        vfm: (totals.vfm / count).toFixed(1),
        count
      });
    } catch (err) {
      console.error('Error fetching review stats:', err);
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}


/**
 * useForumThreads — fetch forum threads for a college with pagination
 */
/**
 * useForumThreads — fetch forum threads for a college with pagination
 */
/**
 * useForumThreads — fetch forum threads for a college
 */
/**
 * useForumThreads — fetch forum threads for a college
 */
/**
 * useForumThreads — fetch forum threads for a college
 */
export function useForumThreads(collegeId, { page = 1, pageSize = 5, sortBy = 'latest', tagFilter = '' } = {}) {
  const [threads, setThreads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!collegeId) {
      setThreads([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('college_id', collegeId)
        .eq('is_approved', true);

      // Filtering by Tag
      if (tagFilter) {
        query = query.contains('tags', [tagFilter]);
      }

      // Sorting & Filtering by Status
      if (sortBy === 'open') {
        query = query.eq('status', 'open').order('created_at', { ascending: false });
      } else if (sortBy === 'closed') {
        query = query.eq('status', 'closed').order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'most_replies') {
        query = query.order('reply_count', { ascending: false });
      } else {
        // default: latest
        query = query.order('created_at', { ascending: false });
      }

      const { data, count, error: err } = await query.range(from, to);

      if (err) throw err;

      const mappedData = (data || []).map(thread => ({
        ...thread,
        profiles: thread.author
      }));

      setThreads(mappedData);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Forum Threads Fetch Error:', err.message);
      setError(err.message);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [collegeId, page, pageSize, sortBy, tagFilter]);

  const deleteThread = useCallback(async (id) => {
    if (!id) return { error: 'Thread ID is required' };
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Permission denied or thread not found. Deletion failed in database.');
      }

      setThreads(prev => prev.filter(t => t.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      return { success: true };
    } catch (err) {
      console.error('Thread Delete Error:', err.message);
      return { error: err.message };
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { threads, totalCount, totalPages, loading, error, deleteThread, refetch: fetch };
}

/**
 * useForumReplies — fetch replies for a thread and provide a createReply action
 */
export function useForumReplies(threadId) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sanitize = (text) => {
    if (!text) return '';
    return text
      .trim()
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '');
  };

  const fetchReplies = useCallback(async () => {
    if (!threadId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('forum_replies')
        .select(`*, profiles(full_name, username, avatar_url)`)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (err) throw err;
      setReplies(data || []);
    } catch (err) {
      console.error('Forum Reply Fetch Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const createReply = async (body, userId) => {
    if (!userId) throw new Error("Authentication required to post a reply.");
    if (!threadId) throw new Error("Thread ID is missing. Please refresh the page.");

    const cleanBody = sanitize(body);
    if (!cleanBody || cleanBody.length < 2) {
      throw new Error("Reply must be at least 2 characters long.");
    }
    if (cleanBody.length > 1000) {
      throw new Error("Reply cannot exceed 1000 characters.");
    }

    try {

      const { data, error: err } = await supabase
        .from('forum_replies')
        .insert({
          thread_id: threadId,
          author_id: userId,
          body: cleanBody
        })
        .select(`*, profiles(full_name, username, avatar_url)`)
        .single();

      if (err) {
        console.error("Forum Reply Insertion Error:", err);
        throw err;
      }

      setReplies(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Forum Reply Creation Exception:", err.message);
      throw err;
    }
  };

  const deleteReply = useCallback(async (replyId) => {
    if (!replyId) return { error: 'Reply ID is required' };
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', replyId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Permission denied or reply not found. Deletion failed in database.');
      }

      setReplies(prev => prev.filter(r => r.id !== replyId));
      return { success: true };
    } catch (err) {
      console.error('Reply Delete Error:', err.message);
      return { error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  return { replies, loading, error, createReply, deleteReply, refetch: fetchReplies };
}
/**
 * useCollegeCourses — fetch courses for a given college ID.
 * Returns { courses, loading, error }.
 */
export function useCollegeCourses(collegeId, { sortBy = 'name', order = 'asc', filterExam = '' } = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    if (!collegeId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .eq('college_id', collegeId);

      if (filterExam) {
        query = query.eq('entrance_exam', filterExam);
      }

      // Apply sorting
      if (sortBy === 'annual_fees') {
        query = query.order('annual_fees', { ascending: order === 'asc', nullsFirst: false });
      } else if (sortBy === 'duration_years') {
        query = query.order('duration_years', { ascending: order === 'asc', nullsFirst: false });
      } else if (sortBy === 'entrance_exam') {
        query = query.order('entrance_exam', { ascending: order === 'asc', nullsFirst: false });
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data, error: err } = await query;
      if (err) throw err;

      setCourses(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load courses');
      console.error('Error fetching courses:', e);
    } finally {
      setLoading(false);
    }
  }, [collegeId, sortBy, order, filterExam]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error };
}

/**
 * useUserReviews — fetch all reviews by a specific user
 */
export function useUserReviews(userId, { page = 1, pageSize = 5, order = 'desc' } = {}) {
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, count, error } = await supabase
        .from('reviews')
        .select('*, college:colleges(name, short_name)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: order === 'asc' })
        .range(from, to);

      if (error) throw error;
      setReviews(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize, order]);

  const deleteReview = async (id) => {
    const { data, error } = await supabase.from('reviews').delete().eq('id', id).select();
    if (error) return { error: error.message };
    if (!data || data.length === 0) return { error: 'Failed to delete review.' };
    setReviews(prev => prev.filter(r => r.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
    return { success: true };
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { reviews, totalCount, loading, deleteReview, totalPages: Math.ceil(totalCount / pageSize) };
}

/**
 * useUserThreads — fetch all threads by a specific user
 */
export function useUserThreads(userId, { page = 1, pageSize = 5, order = 'desc' } = {}) {
  const [threads, setThreads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, count, error } = await supabase
        .from('forum_threads')
        .select('*, college:colleges(name, short_name)', { count: 'exact' })
        .eq('author_id', userId)
        .order('created_at', { ascending: order === 'asc' })
        .range(from, to);

      if (error) throw error;
      setThreads(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching user threads:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize, order]);

  const deleteThread = async (id) => {
    const { data, error } = await supabase.from('forum_threads').delete().eq('id', id).select();
    if (error) return { error: error.message };
    if (!data || data.length === 0) return { error: 'Failed to delete thread.' };
    setThreads(prev => prev.filter(t => t.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
    return { success: true };
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { threads, totalCount, loading, deleteThread, totalPages: Math.ceil(totalCount / pageSize) };
}

/**
 * useUserReplies — fetch all replies by a specific user
 */
export function useUserReplies(userId, { page = 1, pageSize = 5, order = 'desc' } = {}) {
  const [replies, setReplies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, count, error } = await supabase
        .from('forum_replies')
        .select('*, thread:forum_threads(title)', { count: 'exact' })
        .eq('author_id', userId)
        .order('created_at', { ascending: order === 'asc' })
        .range(from, to);

      if (error) throw error;
      setReplies(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching user replies:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize, order]);

  const deleteReply = async (id) => {
    const { data, error } = await supabase.from('forum_replies').delete().eq('id', id).select();
    if (error) return { error: error.message };
    if (!data || data.length === 0) return { error: 'Failed to delete reply.' };
    setReplies(prev => prev.filter(r => r.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
    return { success: true };
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { replies, totalCount, loading, deleteReply, totalPages: Math.ceil(totalCount / pageSize) };
}

/**
 * useSavedColleges — fetch and manage user's saved colleges (ids only)
 */
export function useSavedColleges(userId) {
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) {
      setSavedIds([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('saved_colleges')
        .select('college_id')
        .eq('user_id', userId);
      if (error) throw error;
      setSavedIds(data.map(item => item.college_id));
    } catch (err) {
      console.error('Error fetching saved colleges:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleSave = async (collegeId) => {
    if (!userId) return { error: 'Authentication required' };
    const isSaved = savedIds.includes(collegeId);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_colleges')
          .delete()
          .eq('user_id', userId)
          .eq('college_id', collegeId);
        if (error) throw error;
        setSavedIds(prev => prev.filter(id => id !== collegeId));
        return { success: true, saved: false };
      } else {
        const { error } = await supabase
          .from('saved_colleges')
          .insert({ user_id: userId, college_id: collegeId });
        if (error) throw error;
        setSavedIds(prev => [...prev, collegeId]);
        return { success: true, saved: true };
      }
    } catch (err) {
      console.error('Error toggling saved college:', err);
      return { error: err.message };
    }
  };

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  return { savedIds, loading, toggleSave, refetch: fetchSaved };
}

/**
 * useUserSavedColleges — fetch full college details for user's saved list
 */
export function useUserSavedColleges(userId, { page = 1, pageSize = 10 } = {}) {
  const [colleges, setColleges] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) {
      setColleges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, count, error } = await supabase
        .from('saved_colleges')
        .select('college_id, college:colleges(*)', { count: 'exact' })
        .eq('user_id', userId)
        .range(from, to);
      if (error) throw error;
      // Map to the nested college objects
      setColleges(data.map(item => item.college).filter(Boolean));
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching user saved colleges:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize]);

  const removeSaved = async (collegeId) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('saved_colleges')
        .delete()
        .eq('user_id', userId)
        .eq('college_id', collegeId);
      if (error) throw error;
      setColleges(prev => prev.filter(c => c.id !== collegeId));
    } catch (err) {
      console.error('Error removing saved college:', err);
    }
  };

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { colleges, loading, removeSaved, totalCount, totalPages, refetch: fetch };
}