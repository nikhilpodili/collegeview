import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/hooks/supabase';
import { useToast } from '../components/Toast';
export default function useReviewVotes(reviewId, initialCount = 0, currentUserId = null) {
  const [hasVoted, setHasVoted] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
  // Fetch initial state
  const fetchData = useCallback(async () => {
    if (!reviewId || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      // Check if current user has already voted
      const { data: voteData, error } = await supabase
        .from('review_votes')
        .select('review_id')
        .eq('review_id', reviewId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;
      setHasVoted(!!voteData);
    } catch (error) {
      console.error('Error fetching vote data:', error);
    } finally {
      setLoading(false);
    }
  }, [reviewId, currentUserId]);

  const toggleVote = async () => {
    if (!currentUserId) {
      showToast('Please sign in to mark a review as helpful.', 'warning');
      return;
    }

    try {
      if (hasVoted) {
        // Remove Vote
        const { error } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', currentUserId);

        if (!error) {
          setHasVoted(false);
          setHelpfulCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Add Vote
        const { error } = await supabase
          .from('review_votes')
          .insert({ review_id: reviewId, user_id: currentUserId });

        if (!error) {
          setHasVoted(true);
          setHelpfulCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  return { hasVoted, helpfulCount, toggleVote, loading };
}