CREATE OR REPLACE FUNCTION public.seed_forum_threads_per_college(
    p_min_threads INTEGER DEFAULT 7,
    p_max_threads INTEGER DEFAULT 8,
    p_seed INTEGER DEFAULT NULL
)
RETURNS TABLE(total_colleges_processed INTEGER, total_threads_inserted INTEGER)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_college RECORD;
    v_thread_count INTEGER;
    i INTEGER;
    thread_id UUID;
    selected_author_id UUID;
    selected_college_short TEXT;
    generated_title TEXT;
    generated_body TEXT;
    selected_tags TEXT[];
    tag_count INTEGER;
    j INTEGER;
    selected_status TEXT;
    generated_reply_count INTEGER;
    generated_created_at TIMESTAMPTZ;
    generated_updated_at TIMESTAMPTZ;
    
    -- Title templates with {college_short} placeholder
    title_templates TEXT[] := ARRAY[
        'Delhi University Cut-off Trends 2026 - {college_short}',
        'CUET Subject Combination Guide - {college_short}',
        'Placement Scenarios for BA/BSc Graduates - {college_short}',
        'Extracurricular Societies and Clubs - {college_short}',
        'Scholarship Application Deadlines - {college_short}',
        'North Campus vs South Campus Life - {college_short}',
        'Library Timings and Study Environment - {college_short}',
        'Research Opportunities for Undergrads - {college_short}',
        'Hostel Allotment Process for Freshers - {college_short}',
        'Coding Clubs and Competitive Programming Scene - {college_short}',
        'Best Branch for Core Placements: CSE vs ECE? - {college_short}',
        'Campus Placement Statistics for 2025 Batch - {college_short}',
        'JEE Advanced Cutoff Prediction 2026? - {college_short}',
        'Inter-College Tech Fest Participation - {college_short}'
    ];
    
    -- Body templates with {topic} placeholder
    body_templates TEXT[] := ARRAY[
        'Hi everyone, I am looking for some guidance regarding {topic}. Any recent experiences would be helpful!',
        'Hello folks! Could someone share their insights on {topic}? Would really appreciate it.',
        'Hey all, I have a question about {topic}. Has anyone gone through this recently?',
        'Hi community, seeking advice on {topic}. Any tips or experiences to share?'
    ];
    
    -- Topics matching the title themes
    body_topics TEXT[] := ARRAY[
        'delhi university cut-off trends 2026', 'cuet subject combination guide',
        'placement scenarios for ba/bsc graduates', 'extracurricular societies and clubs',
        'scholarship application deadlines', 'north campus vs south campus life',
        'library timings and study environment', 'research opportunities for undergrads',
        'hostel allotment process for freshers', 'coding clubs and competitive programming scene',
        'best branch for core placements: cse vs ece', 'campus placement statistics for 2025 batch',
        'jee advanced cutoff prediction 2026', 'inter-college tech fest participation'
    ];
    
    -- Available tags
    tag_options TEXT[] := ARRAY[
        'Admission', 'Placements', 'Fees', 'Hostel', 'Academics', 'Events', 
        'Q&A', 'Campus Life', 'Scholarships', 'Research', 'Internships'
    ];

    v_total_colleges INTEGER := 0;
    v_total_threads INTEGER := 0;
    
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    IF p_seed IS NOT NULL THEN
        PERFORM setseed(p_seed::FLOAT / 2147483647);
    END IF;
    
    -- Safety Check
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE is_verified = TRUE AND COALESCE(NULLIF(trim(is_blocked), '')::boolean, FALSE) = FALSE LIMIT 1) THEN
        RAISE EXCEPTION 'No active verified profiles found. Please seed profiles first.';
    END IF;

    -- Loop through EVERY college in the database
    FOR v_college IN SELECT id, name, short_name, slug FROM public.colleges LOOP
        
        v_total_colleges := v_total_colleges + 1;
        
        -- Determine random thread count between min and max (e.g., 7 or 8)
        v_thread_count := floor(random() * (p_max_threads - p_min_threads + 1)) + p_min_threads;
        
        -- Get college short name for titles
        selected_college_short := COALESCE(v_college.short_name, v_college.slug, 'College');
        
        FOR i IN 1..v_thread_count LOOP
            
            thread_id := gen_random_uuid();
            
            -- Select random verified, unblocked author
            SELECT id INTO selected_author_id
            FROM profiles
            WHERE is_verified = TRUE
              AND COALESCE(NULLIF(trim(is_blocked), '')::boolean, FALSE) = FALSE
            ORDER BY random() 
            LIMIT 1;
            
            -- Generate realistic content
            generated_title := REPLACE(
                title_templates[floor(random() * array_length(title_templates, 1)) + 1],
                '{college_short}', selected_college_short
            );
            generated_body := REPLACE(
                body_templates[floor(random() * array_length(body_templates, 1)) + 1],
                '{topic}', body_topics[floor(random() * array_length(body_topics, 1)) + 1]
            );
            
            -- Generate 2-3 random tags
            tag_count := floor(random() * 2) + 2;
            selected_tags := ARRAY[]::TEXT[];
            FOR j IN 1..tag_count LOOP
                selected_tags := array_append(selected_tags, tag_options[floor(random() * array_length(tag_options, 1)) + 1]);
            END LOOP;
            
            -- Other fields
            selected_status := CASE WHEN random() < 0.9 THEN 'open' ELSE 'closed' END;
            generated_reply_count := floor(random() * 5); -- 0 to 4 initial replies
            generated_created_at := NOW() - (random() * INTERVAL '120 days');
            generated_updated_at := generated_created_at + (random() * INTERVAL '7 days');
            IF generated_updated_at > NOW() THEN generated_updated_at := NOW() - (random() * INTERVAL '1 day'); END IF;
            
            -- Insert thread
            INSERT INTO "public"."forum_threads" (
                id, college_id, author_id, title, body, tags, status, 
                reply_count, is_approved, created_at, updated_at
            ) VALUES (
                thread_id, v_college.id, selected_author_id,
                generated_title, generated_body, selected_tags, selected_status::public.thread_status,
                generated_reply_count, TRUE, generated_created_at, generated_updated_at
            );
            
            v_total_threads := v_total_threads + 1;
            
        END LOOP;
        
    END LOOP;
    
    RETURN QUERY SELECT v_total_colleges, v_total_threads;
    
END;
$function$;


-- This will add 100 random threads to the 'Public' forum to random colleges
-- SELECT * FROM seed_forum_threads_per_college(7, 9);

