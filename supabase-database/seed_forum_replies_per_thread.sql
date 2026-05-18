CREATE OR REPLACE FUNCTION seed_forum_replies_per_thread(
    p_replies_per_thread_min INTEGER DEFAULT 7,
    p_replies_per_thread_max INTEGER DEFAULT 8,
    p_seed INTEGER DEFAULT NULL
)
RETURNS TABLE(total_threads_processed INTEGER, total_replies_inserted INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_thread RECORD;
    v_reply_count INTEGER;
    i INTEGER;
    v_reply_id UUID;
    v_author_id UUID;
    v_author_name TEXT;
    v_parent_id UUID;
    v_prev_reply_id UUID; -- Tracks the ID of the previous reply in the current thread
    v_body TEXT;
    v_upvotes INTEGER;
    v_is_approved BOOLEAN;
    v_created_at TIMESTAMPTZ;
    v_updated_at TIMESTAMPTZ;
    
    body_templates TEXT[] := ARRAY[
        'Thanks for sharing this! Really helpful.',
        'I had a similar experience last semester. The process was actually quite smooth.',
        'Could you clarify which department you''re referring to?',
        'Join the official Telegram group for real-time updates.',
        'The faculty here is very supportive regarding this.',
        'Check the official website for the latest notification.',
        'I reached out to the alumni association and they gave me some great tips.',
        'Make sure to keep all your documents digitized.',
        'Has anyone faced issues with the scholarship disbursement this year?',
        'Great question! Check the student handbook chapter 4.',
        'I''m also waiting for the final list. Let me know when you get an update.',
        'This is exactly what I was looking for. Bookmarked!',
        'Would you mind sharing the direct link?',
        'Same here. I submitted mine last week and still no confirmation email.',
        'Pro tip: Fill out the form during off-peak hours.'
    ];
    
    v_total_threads INTEGER := 0;
    v_total_replies INTEGER := 0;
    
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    IF p_seed IS NOT NULL THEN
        PERFORM setseed(p_seed::FLOAT / 2147483647);
    END IF;

    -- Loop through every existing thread
    FOR v_thread IN SELECT id, created_at FROM public.forum_threads LOOP
        
        v_total_threads := v_total_threads + 1;
        
        -- Reset previous reply ID for each new thread
        v_prev_reply_id := NULL;
        
        -- Determine random number of replies (e.g., 7 or 8)
        v_reply_count := floor(random() * (p_replies_per_thread_max - p_replies_per_thread_min + 1)) + p_replies_per_thread_min;
        
        FOR i IN 1..v_reply_count LOOP
            
            v_reply_id := gen_random_uuid();
            
            -- 1. Pick a random active profile
            SELECT id, full_name 
            INTO v_author_id, v_author_name
            FROM profiles 
             WHERE (is_blocked)::boolean IS FALSE
            ORDER BY random() 
            LIMIT 1;
            
            IF v_author_id IS NULL THEN
                RAISE EXCEPTION 'No active profiles found.';
            END IF;

            -- 2. Handle Parent ID (Threading)
            IF i = 1 THEN
                v_parent_id := NULL; -- First reply is always top-level
            ELSIF random() < 0.30 THEN
                v_parent_id := v_prev_reply_id; -- 30% chance to reply to the previous message
            ELSE
                v_parent_id := NULL; -- Otherwise top-level
            END IF;

            -- 3. Content & Metadata
            v_body := body_templates[floor(random() * array_length(body_templates, 1)) + 1];
            v_upvotes := floor(random() * 10);
            v_is_approved := CASE WHEN random() < 0.95 THEN true ELSE false END;
            
            -- 4. Timestamps
            v_created_at := v_thread.created_at + (random() * INTERVAL '2 days');
            IF v_created_at > NOW() THEN 
                v_created_at := NOW() - (random() * INTERVAL '1 day'); 
            END IF;
            
            v_updated_at := v_created_at + (random() * INTERVAL '1 hour');
            IF v_updated_at > NOW() THEN v_updated_at := v_created_at; END IF;
            
            -- 5. Insert
            INSERT INTO public.forum_replies (
                id, thread_id, author_id, author_name, parent_id, 
                body, upvotes, is_approved, created_at, updated_at
            ) VALUES (
                v_reply_id, v_thread.id, v_author_id, v_author_name, v_parent_id,
                v_body, v_upvotes, v_is_approved, v_created_at, v_updated_at
            );
            
            -- Update tracking
            v_prev_reply_id := v_reply_id;
            v_total_replies := v_total_replies + 1;
            
        END LOOP;
        
    END LOOP;
    
    RETURN QUERY SELECT v_total_threads, v_total_replies;
    
END;
$$;

-- This will add 7-8 random replies to EVERY existing thread
-- SELECT * FROM seed_forum_replies_per_thread(7, 8);