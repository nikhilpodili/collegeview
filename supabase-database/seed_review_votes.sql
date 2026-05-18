CREATE OR REPLACE FUNCTION seed_review_votes(
    p_min_votes INTEGER DEFAULT 5,
    p_max_votes INTEGER DEFAULT 15,
    p_seed INTEGER DEFAULT NULL
)
RETURNS TABLE(total_reviews_processed INTEGER, total_votes_inserted INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_review RECORD;
    v_vote_count INTEGER;
    i INTEGER;
    v_user_id UUID;
    v_created_at TIMESTAMPTZ;
    
    -- Track inserted votes to prevent duplicate votes by same user on same review
    -- Using a temp table for efficiency within the session
    v_total_reviews INTEGER := 0;
    v_total_votes INTEGER := 0;
    
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    IF p_seed IS NOT NULL THEN
        PERFORM setseed(p_seed::FLOAT / 2147483647);
    END IF;
    
    -- Safety Check
    IF NOT EXISTS (SELECT 1 FROM reviews LIMIT 1) THEN
        RAISE EXCEPTION 'No reviews found. Please seed the reviews table first.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE (is_blocked)::boolean IS FALSE LIMIT 1) THEN
        RAISE EXCEPTION 'No active profiles found.';
    END IF;

    -- Create temp table to track unique (review_id, user_id) pairs for this session
    CREATE TEMP TABLE temp_used_votes (
        review_id UUID,
        user_id UUID,
        PRIMARY KEY (review_id, user_id)
    ) ON COMMIT DROP;

    -- Loop through EVERY existing review
    FOR v_review IN SELECT id, created_at FROM public.reviews LOOP
        
        v_total_reviews := v_total_reviews + 1;
        
        -- Determine random vote count between min and max
        v_vote_count := floor(random() * (p_max_votes - p_min_votes + 1)) + p_min_votes;
        
        FOR i IN 1..v_vote_count LOOP
            
            -- Pick a random active profile
            SELECT id INTO v_user_id
            FROM profiles 
            WHERE (is_blocked)::boolean IS FALSE
            ORDER BY random() 
            LIMIT 1;
            
            -- Ensure the user hasn't already voted on this specific review in this batch
            -- (In a real app, you'd also check existing votes in the main table)
            IF NOT EXISTS (SELECT 1 FROM temp_used_votes WHERE review_id = v_review.id AND user_id = v_user_id) THEN
                
                -- Mark as used
                INSERT INTO temp_used_votes (review_id, user_id) VALUES (v_review.id, v_user_id);
                
                -- Generate timestamp: Randomly between review creation and now
                v_created_at := v_review.created_at + (random() * (NOW() - v_review.created_at));
                
                -- Insert Vote
                INSERT INTO public.review_votes (
                    review_id, 
                    user_id, 
                    created_at
                ) VALUES (
                    v_review.id, 
                    v_user_id, 
                    v_created_at
                );
                
                v_total_votes := v_total_votes + 1;
            END IF;
            
        END LOOP;
        
    END LOOP;
    
    RETURN QUERY SELECT v_total_reviews, v_total_votes;
    
END;
$$;


-- This will add 5-15 random votes to EVERY existing review
-- SELECT * FROM seed_review_votes(5, 15);