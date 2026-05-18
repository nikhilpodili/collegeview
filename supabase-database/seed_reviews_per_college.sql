CREATE OR REPLACE FUNCTION seed_reviews_per_college(
    p_min_reviews INTEGER DEFAULT 10,
    p_max_reviews INTEGER DEFAULT 20,
    p_seed INTEGER DEFAULT NULL
)
RETURNS TABLE(total_colleges_processed INTEGER, total_reviews_inserted INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    v_college RECORD;
    v_review_count INTEGER;
    i INTEGER;
    
    -- Array to hold pre-selected distinct users for the current college
    v_users UUID[];
    v_user_names TEXT[];
    v_current_user_id UUID;
    v_current_user_name TEXT;
    
    v_course TEXT;
    v_overall NUMERIC;
    v_academic NUMERIC;
    v_placement NUMERIC;
    v_infrastructure NUMERIC;
    v_social NUMERIC;
    v_faculty NUMERIC;
    v_value NUMERIC;
    v_title TEXT;
    v_pros TEXT;
    v_cons TEXT;
    v_body TEXT;
    v_tags public.review_tag[];
    v_is_alumni BOOLEAN;
    v_batch_year INTEGER;
    v_helpful_count INTEGER;
    v_is_verified BOOLEAN;
    v_is_approved BOOLEAN;
    v_created_at TIMESTAMPTZ;
    v_updated_at TIMESTAMPTZ;
    
    -- Data Arrays
    courses TEXT[] := ARRAY['B.Tech CSE','B.Tech ECE','B.Tech Mechanical','M.Tech SE','MBA','BCA','B.Sc Math','BBA','Ph.D.','M.Tech AI','B.A. Economics','B.Des','LLB'];
    titles TEXT[] := ARRAY['Honest review of my college','Great infrastructure but high fees','Amazing placement support','Average experience overall','Excellent faculty, poor hostel','Best college for CSE','Worth every penny','Strict rules but good discipline','Campus life is vibrant','Could be better for research','Highly recommend for engineering','Decent but needs improvement'];
    pros TEXT[] := ARRAY['Helpful seniors','Great faculty','Vibrant campus','Good placements','Active clubs','Modern labs','Excellent infrastructure','Supportive administration'];
    cons TEXT[] := ARRAY['High fees','Crowded hostels','Limited parking','Strict rules','Heavy workload','Traffic issues','Poor maintenance','Outdated syllabus'];
    bodies TEXT[] := ARRAY['Overall a transformative experience. The exposure, industry connections, and peer learning were exceptional.','The academic rigor is commendable, but the hostel facilities need improvement.','Placements were decent, with top companies visiting campus regularly.','Faculty members are highly qualified and approachable.','Campus life is vibrant with numerous fests and clubs to join.','The curriculum is outdated in some branches, needs modernization.','Great environment for research and innovation. Labs are well-equipped.','Management could be more responsive to student feedback.'];
    tags_pool TEXT[] := ARRAY['Academics','Placements','Campus Life','Hostel','Faculty','Infrastructure','Library','Sports','Research','Food'];
    
    v_total_colleges INTEGER := 0;
    v_total_reviews INTEGER := 0;
    
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    IF p_seed IS NOT NULL THEN
        PERFORM setseed(p_seed::FLOAT / 2147483647);
    END IF;
    
    -- Safety Check
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE (is_blocked)::boolean IS FALSE LIMIT 1) THEN
        RAISE EXCEPTION 'No active profiles found.';
    END IF;

    -- Loop through EVERY college
    FOR v_college IN SELECT id, name FROM public.colleges LOOP
        
        v_total_colleges := v_total_colleges + 1;
        
        -- Determine random count between min and max
        v_review_count := floor(random() * (p_max_reviews - p_min_reviews + 1)) + p_min_reviews;
        
        -- 1. PRE-SELECT DISTINCT USERS for this college
        -- We fetch v_review_count unique users in one go
        SELECT ARRAY_AGG(u.id ORDER BY random()), ARRAY_AGG(u.full_name ORDER BY random())
        INTO v_users, v_user_names
        FROM (
            SELECT id, full_name 
            FROM profiles 
            WHERE (is_blocked)::boolean IS FALSE
            ORDER BY random() 
            LIMIT v_review_count
        ) u;
        
        -- Safety check if we couldn't find enough users
        IF array_length(v_users, 1) < v_review_count THEN
            RAISE NOTICE 'College %: Only found % users, inserting fewer reviews.', v_college.name, array_length(v_users, 1);
            v_review_count := array_length(v_users, 1);
        END IF;
        
        -- 2. Loop through the pre-selected users
        FOR i IN 1..v_review_count LOOP
            
            v_current_user_id := v_users[i];
            v_current_user_name := v_user_names[i];
            
            -- 3. Generate Content
            v_course := courses[floor(random() * array_length(courses, 1)) + 1];
            v_title := titles[floor(random() * array_length(titles, 1)) + 1];
            v_pros := pros[floor(random() * array_length(pros, 1)) + 1];
            v_cons := cons[floor(random() * array_length(cons, 1)) + 1];
            v_body := bodies[floor(random() * array_length(bodies, 1)) + 1];
            
            -- 4. Generate Ratings (1.0 to 5.0)
            v_overall := ROUND((random() * 4 + 1)::numeric, 1);
            v_academic := ROUND((random() * 4 + 1)::numeric, 1);
            v_placement := ROUND((random() * 4 + 1)::numeric, 1);
            v_infrastructure := ROUND((random() * 4 + 1)::numeric, 1);
            v_social := ROUND((random() * 4 + 1)::numeric, 1);
            v_faculty := ROUND((random() * 4 + 1)::numeric, 1);
            v_value := ROUND((random() * 4 + 1)::numeric, 1);
            
            -- 5. Generate Tags (2 unique)
            v_tags := ARRAY[
                tags_pool[floor(random() * array_length(tags_pool, 1)) + 1],
                tags_pool[floor(random() * array_length(tags_pool, 1)) + 1]
            ];
            IF v_tags[1] = v_tags[2] THEN
                v_tags[2] := tags_pool[1 + floor(random() * (array_length(tags_pool, 1) - 1))];
            END IF;
            
            -- 6. Metadata
            v_is_alumni := random() < 0.7;
            v_batch_year := floor(random() * 7) + 2018;
            v_helpful_count := floor(random() * 16);
            v_is_verified := random() < 0.8;
            v_is_approved := random() < 0.9;
            
            v_created_at := NOW() - (random() * INTERVAL '730 days');
            v_updated_at := v_created_at + (random() * INTERVAL '30 days');
            IF v_updated_at > NOW() THEN v_updated_at := NOW() - (random() * INTERVAL '1 day'); END IF;
            
            -- 7. Insert Review
            INSERT INTO public.reviews (
                id, college_id, college_name, user_id, user_name, course_studied,
                overall_rating, academic_rating, placement_rating, infrastructure_rating,
                social_life_rating, faculty_rating, value_for_money_rating,
                title, pros, cons, body, tags, is_alumni, batch_year,
                helpful_count, is_verified, is_approved, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), v_college.id, v_college.name, v_current_user_id, v_current_user_name, v_course,
                v_overall, v_academic, v_placement, v_infrastructure,
                v_social, v_faculty, v_value,
                v_title, v_pros, v_cons, v_body, v_tags, v_is_alumni, v_batch_year,
                v_helpful_count, v_is_verified, v_is_approved, v_created_at, v_updated_at
            );
            
            v_total_reviews := v_total_reviews + 1;
            
        END LOOP;
        
    END LOOP;
    
    RETURN QUERY SELECT v_total_colleges, v_total_reviews;
    
END;
$$;
-- This ensures every college gets 10-20 reviews from DIFFERENT users
-- SELECT * FROM seed_reviews_per_college(10, 20);