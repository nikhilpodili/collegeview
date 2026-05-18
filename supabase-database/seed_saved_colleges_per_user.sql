CREATE OR REPLACE FUNCTION seed_saved_colleges_per_user(
    p_min_colleges INTEGER DEFAULT 7,
    p_max_colleges INTEGER DEFAULT 15,
    p_seed INTEGER DEFAULT NULL
)
RETURNS TABLE(total_users_processed INTEGER, total_saves_inserted INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
    v_save_count INTEGER;
    i INTEGER;
    v_college_id UUID;
    v_created_at TIMESTAMPTZ;
    
    -- Track inserted saves to prevent duplicate saves by same user for same college
    v_total_users INTEGER := 0;
    v_total_saves INTEGER := 0;
    
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    IF p_seed IS NOT NULL THEN
        PERFORM setseed(p_seed::FLOAT / 2147483647);
    END IF;
    
    -- Safety Check
    IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        RAISE EXCEPTION 'No profiles found. Please seed the profiles table first.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM colleges LIMIT 1) THEN
        RAISE EXCEPTION 'No colleges found. Please seed the colleges table first.';
    END IF;

    -- Create temp table to track unique (user_id, college_id) pairs for this session
    CREATE TEMP TABLE temp_used_saves (
        user_id UUID,
        college_id UUID,
        PRIMARY KEY (user_id, college_id)
    ) ON COMMIT DROP;

    -- Loop through EVERY existing profile
    FOR v_user IN SELECT id FROM public.profiles LOOP
        
        v_total_users := v_total_users + 1;
        
        -- Determine random save count between min and max
        v_save_count := floor(random() * (p_max_colleges - p_min_colleges + 1)) + p_min_colleges;
        
        FOR i IN 1..v_save_count LOOP
            
            -- Pick a random college
            SELECT id INTO v_college_id
            FROM colleges 
            ORDER BY random() 
            LIMIT 1;
            
            -- Ensure the user hasn't already saved this specific college in this batch
            IF NOT EXISTS (SELECT 1 FROM temp_used_saves WHERE user_id = v_user.id AND college_id = v_college_id) THEN
                
                -- Mark as used
                INSERT INTO temp_used_saves (user_id, college_id) VALUES (v_user.id, v_college_id);
                
                -- Generate timestamp: Randomly within the last year
                v_created_at := NOW() - (random() * INTERVAL '365 days');
                
                -- Insert Save
                INSERT INTO public.saved_colleges (
                    user_id, 
                    college_id, 
                    created_at
                ) VALUES (
                    v_user.id, 
                    v_college_id, 
                    v_created_at
                );
                
                v_total_saves := v_total_saves + 1;
            END IF;
            
        END LOOP;
        
    END LOOP;
    
    RETURN QUERY SELECT v_total_users, v_total_saves;
    
END;
$$;

-- This will add 7-15 random college saves to EVERY existing user
--SELECT * FROM seed_saved_colleges_per_user(7, 15);