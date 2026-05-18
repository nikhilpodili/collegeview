


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."approval_status" AS ENUM (
    'UGC',
    'AICTE',
    'MCI',
    'BCI',
    'PCI',
    'NAAC',
    'NBA'
);


ALTER TYPE "public"."approval_status" OWNER TO "postgres";


CREATE TYPE "public"."college_type" AS ENUM (
    'Government',
    'Private',
    'Deemed',
    'Central University',
    'State University',
    'Autonomous',
    'Affiliated',
    'IIT',
    'IIM',
    'NIT',
    'AIIMS'
);


ALTER TYPE "public"."college_type" OWNER TO "postgres";


CREATE TYPE "public"."ownership_type" AS ENUM (
    'Government',
    'Private',
    'PPP'
);


ALTER TYPE "public"."ownership_type" OWNER TO "postgres";


CREATE TYPE "public"."review_tag" AS ENUM (
    'Academics',
    'Campus Life',
    'Faculty',
    'Placements',
    'Infrastructure',
    'Hostel',
    'Food',
    'Sports',
    'Library',
    'Research'
);


ALTER TYPE "public"."review_tag" OWNER TO "postgres";


CREATE TYPE "public"."thread_status" AS ENUM (
    'open',
    'closed',
    'pinned'
);


ALTER TYPE "public"."thread_status" OWNER TO "postgres";


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."colleges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "short_name" "text",
    "slug" "text" NOT NULL,
    "logo_url" "text",
    "banner_url" "text",
    "description" "text",
    "established_year" integer,
    "college_type" "public"."college_type" NOT NULL,
    "ownership" "public"."ownership_type" NOT NULL,
    "approvals" "public"."approval_status"[],
    "address" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "website_url" "text",
    "email" "text",
    "phone" "text",
    "nirf_ranking" integer,
    "nirf_rank_category" "text",
    "naac_grade" "text",
    "total_courses" integer DEFAULT 0,
    "total_seats" integer,
    "student_faculty_ratio" numeric(5,2),
    "entrance_exams" "text"[],
    "avg_annual_fees" numeric(12,2),
    "min_fees" numeric(12,2),
    "max_fees" numeric(12,2),
    "hostel_fees_per_year" numeric(12,2),
    "avg_package_lpa" numeric(6,2),
    "highest_package_lpa" numeric(6,2),
    "median_package_lpa" numeric(6,2),
    "placement_rate_pct" numeric(5,2),
    "top_recruiters" "text"[],
    "campus_area_acres" numeric(8,2),
    "has_hostel" boolean DEFAULT false,
    "has_girls_hostel" boolean DEFAULT false,
    "has_sports_complex" boolean DEFAULT false,
    "has_library" boolean DEFAULT false,
    "has_medical_facility" boolean DEFAULT false,
    "has_wifi" boolean DEFAULT false,
    "avg_rating" numeric(3,2) DEFAULT 0,
    "avg_academic_rating" numeric(3,2) DEFAULT 0,
    "avg_placement_rating" numeric(3,2) DEFAULT 0,
    "avg_infrastructure_rating" numeric(3,2) DEFAULT 0,
    "avg_social_life_rating" numeric(3,2) DEFAULT 0,
    "avg_faculty_rating" numeric(3,2) DEFAULT 0,
    "avg_value_for_money_rating" numeric(3,2) DEFAULT 0,
    "total_reviews" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "colleges_avg_academic_rating_check" CHECK ((("avg_academic_rating" >= (0)::numeric) AND ("avg_academic_rating" <= (5)::numeric))),
    CONSTRAINT "colleges_avg_faculty_rating_check" CHECK ((("avg_faculty_rating" >= (0)::numeric) AND ("avg_faculty_rating" <= (5)::numeric))),
    CONSTRAINT "colleges_avg_infrastructure_rating_check" CHECK ((("avg_infrastructure_rating" >= (0)::numeric) AND ("avg_infrastructure_rating" <= (5)::numeric))),
    CONSTRAINT "colleges_avg_placement_rating_check" CHECK ((("avg_placement_rating" >= (0)::numeric) AND ("avg_placement_rating" <= (5)::numeric))),
    CONSTRAINT "colleges_avg_rating_check" CHECK ((("avg_rating" >= (0)::numeric) AND ("avg_rating" <= (5)::numeric))),
    CONSTRAINT "colleges_avg_social_life_rating_check" CHECK ((("avg_social_life_rating" >= (0)::numeric) AND ("avg_social_life_rating" <= (5)::numeric))),
    CONSTRAINT "colleges_avg_value_for_money_rating_check" CHECK ((("avg_value_for_money_rating" >= (0)::numeric) AND ("avg_value_for_money_rating" <= (5)::numeric)))
);


ALTER TABLE "public"."colleges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "college_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "short_name" "text",
    "level" "text" NOT NULL,
    "stream" "text",
    "duration_years" numeric(3,1),
    "total_seats" integer,
    "annual_fees" numeric(12,2),
    "entrance_exam" "text",
    "min_cutoff" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."courses" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" ,
    "full_name" "text",
    "gender" "text" DEFAULT '''''''other''''::text''::text'::"text",
    "email" "text",
    "avatar_url" "text",
    "bio" "text",
    "current_college" "text",
    "graduation_year" integer,
    "state" "text",
    "city" "text",
    "is_admin" boolean DEFAULT false,
    "is_blocked" character varying DEFAULT 'FALSE'::character varying NOT NULL,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_graduation_year_check" CHECK ((("graduation_year" >= 1950) AND ("graduation_year" <= 2040)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."is_blocked" IS 'IS user blocked';



CREATE TABLE IF NOT EXISTS "public"."forum_threads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "college_id" "uuid",
    "college_name" "text"NOT NULL,
    "author_name" "text"NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "tags" "text"[],
    "status" "public"."thread_status" DEFAULT 'open'::"public"."thread_status",
    "reply_count" integer DEFAULT 0,
    "is_approved" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."forum_threads" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."forum_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "author_name" "text"NOT NULL,
    "parent_id" "uuid",
    "body" "text" NOT NULL,
    "upvotes" integer DEFAULT 0,
    "is_approved" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."forum_replies" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "college_id" "uuid" NOT NULL,
    "college_name" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL,
    "course_studied" "text",
    "overall_rating" numeric(2,1) NOT NULL,
    "academic_rating" numeric(2,1),
    "placement_rating" numeric(2,1),
    "infrastructure_rating" numeric(2,1),
    "social_life_rating" numeric(2,1),
    "faculty_rating" numeric(2,1),
    "value_for_money_rating" numeric(2,1),
    "title" "text" NOT NULL,
    "pros" "text",
    "cons" "text",
    "body" "text",
    "tags" "public"."review_tag"[],
    "is_alumni" boolean DEFAULT false,
    "batch_year" integer,
    "helpful_count" integer DEFAULT 0,
    "is_verified" boolean DEFAULT false,
    "is_approved" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_academic_rating_check" CHECK ((("academic_rating" >= (1)::numeric) AND ("academic_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_faculty_rating_check" CHECK ((("faculty_rating" >= (1)::numeric) AND ("faculty_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_infrastructure_rating_check" CHECK ((("infrastructure_rating" >= (1)::numeric) AND ("infrastructure_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_overall_rating_check" CHECK ((("overall_rating" >= (1)::numeric) AND ("overall_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_placement_rating_check" CHECK ((("placement_rating" >= (1)::numeric) AND ("placement_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_social_life_rating_check" CHECK ((("social_life_rating" >= (1)::numeric) AND ("social_life_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_value_for_money_rating_check" CHECK ((("value_for_money_rating" >= (1)::numeric) AND ("value_for_money_rating" <= (5)::numeric)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."review_votes" (
    "review_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_votes" OWNER TO "postgres";



CREATE TABLE IF NOT EXISTS "public"."saved_colleges" (
    "user_id" "uuid" NOT NULL,
    "college_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_colleges" OWNER TO "postgres";


ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."colleges"
    ADD CONSTRAINT "colleges_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_threads"
    ADD CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_pkey" PRIMARY KEY ("review_id", "user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_college_id_user_id_key" UNIQUE ("college_id", "user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_colleges"
    ADD CONSTRAINT "saved_colleges_pkey" PRIMARY KEY ("user_id", "college_id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_replies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."forum_replies"
    ADD CONSTRAINT "forum_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_threads"
    ADD CONSTRAINT "forum_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_threads"
    ADD CONSTRAINT "forum_threads_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_colleges"
    ADD CONSTRAINT "saved_colleges_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_colleges"
    ADD CONSTRAINT "saved_colleges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;




CREATE INDEX "idx_colleges_avg_fees" ON "public"."colleges" USING "btree" ("avg_annual_fees");



CREATE INDEX "idx_colleges_avg_rating" ON "public"."colleges" USING "btree" ("avg_rating" DESC);



CREATE INDEX "idx_colleges_city" ON "public"."colleges" USING "btree" ("city");



CREATE INDEX "idx_colleges_featured" ON "public"."colleges" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_colleges_nirf" ON "public"."colleges" USING "btree" ("nirf_ranking");



CREATE INDEX "idx_colleges_slug" ON "public"."colleges" USING "btree" ("slug");



CREATE INDEX "idx_colleges_state" ON "public"."colleges" USING "btree" ("state");



CREATE INDEX "idx_colleges_type" ON "public"."colleges" USING "btree" ("college_type");



CREATE INDEX "idx_courses_college" ON "public"."courses" USING "btree" ("college_id");



CREATE INDEX "idx_courses_level" ON "public"."courses" USING "btree" ("level");


    
CREATE INDEX "idx_saved_colleges_college" ON "public"."saved_colleges" USING "btree" ("college_id");



CREATE INDEX "idx_replies_author" ON "public"."forum_replies" USING "btree" ("author_id");



CREATE INDEX "idx_replies_parent" ON "public"."forum_replies" USING "btree" ("parent_id") WHERE ("parent_id" IS NOT NULL);



CREATE INDEX "idx_replies_thread" ON "public"."forum_replies" USING "btree" ("thread_id");



CREATE INDEX "idx_reviews_college" ON "public"."reviews" USING "btree" ("college_id");



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("overall_rating" DESC);



CREATE INDEX "idx_reviews_user" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_review_votes_user" ON "public"."review_votes" USING "btree" ("user_id");



CREATE INDEX "idx_threads_author" ON "public"."forum_threads" USING "btree" ("author_id");



CREATE INDEX "idx_threads_college" ON "public"."forum_threads" USING "btree" ("college_id");



CREATE INDEX "idx_threads_created" ON "public"."forum_threads" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_threads_status" ON "public"."forum_threads" USING "btree" ("status");


CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id)
  DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY INVOKER
    SET "search_path" TO 'public'
    AS $$
  -- Runs as postgres user → bypasses RLS internally → NO RECURSION
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1), false);
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_user_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY INVOKER
    SET "search_path" TO ''
    AS $$
DECLARE
    is_admin_status BOOLEAN;
BEGIN
    -- Attempt to fetch the is_admin flag for the current user ID
    -- This SELECT inside the function bypasses RLS due to SECURITY DEFINER
    SELECT is_admin INTO is_admin_status
    FROM public.profiles
    WHERE id = auth.uid(); -- auth.uid() gets the current authenticated user's ID

    -- Return the status, defaulting to FALSE if the user has no profile row or is_admin is NULL/FALSE
    RETURN COALESCE(is_admin_status, FALSE);
END;
$$;


ALTER FUNCTION "public"."is_current_user_admin"() OWNER TO "postgres";



CREATE OR REPLACE FUNCTION "public"."sync_review_helpful_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."sync_review_helpful_count"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."sync_review_helpful_count"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."sync_review_helpful_count"() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION "public"."update_college_ratings"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  UPDATE public.colleges
  SET
    avg_rating                 = (SELECT ROUND(AVG(overall_rating)::numeric, 2)        FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    avg_academic_rating        = (SELECT ROUND(AVG(academic_rating)::numeric, 2)       FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    avg_placement_rating       = (SELECT ROUND(AVG(placement_rating)::numeric, 2)      FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    avg_infrastructure_rating  = (SELECT ROUND(AVG(infrastructure_rating)::numeric, 2) FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    avg_social_life_rating     = (SELECT ROUND(AVG(social_life_rating)::numeric, 2)    FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    avg_faculty_rating         = (SELECT ROUND(AVG(faculty_rating)::numeric, 2)        FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    avg_value_for_money_rating = (SELECT ROUND(AVG(value_for_money_rating)::numeric, 2) FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    total_reviews              = (SELECT COUNT(*)                                       FROM public.reviews WHERE college_id = COALESCE(NEW.college_id, OLD.college_id) AND is_approved = TRUE),
    updated_at                 = NOW()
  WHERE id = COALESCE(NEW.college_id, OLD.college_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_college_ratings"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."update_college_ratings"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."update_college_ratings"() FROM anon, authenticated;


CREATE OR REPLACE FUNCTION "public"."update_review_helpful_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_count = (SELECT COUNT(*) FROM public.review_votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id))
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_review_helpful_count"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."update_review_helpful_count"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."update_review_helpful_count"() FROM anon, authenticated;


CREATE OR REPLACE FUNCTION "public"."update_thread_reply_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  UPDATE public.forum_threads
  SET
    reply_count = (SELECT COUNT(*) FROM public.forum_replies WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id) AND is_approved = TRUE),
    updated_at  = NOW()
  WHERE id = COALESCE(NEW.thread_id, OLD.thread_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_thread_reply_count"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."update_thread_reply_count"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."update_thread_reply_count"() FROM anon, authenticated;



CREATE OR REPLACE FUNCTION "public"."sync_names_on_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  IF TG_TABLE_NAME = 'forum_threads' OR TG_TABLE_NAME = 'forum_replies' THEN
    SELECT full_name INTO NEW.author_name FROM public.profiles WHERE id = NEW.author_id;
  ELSIF TG_TABLE_NAME = 'reviews' THEN
    SELECT full_name INTO NEW.user_name FROM public.profiles WHERE id = NEW.user_id;
  END IF;

  IF TG_TABLE_NAME = 'forum_threads' OR TG_TABLE_NAME = 'reviews' THEN
    IF NEW.college_id IS NOT NULL THEN
      SELECT name INTO NEW.college_name FROM public.colleges WHERE id = NEW.college_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."sync_names_on_change"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."sync_names_on_change"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."sync_names_on_change"() FROM anon, authenticated;


CREATE OR REPLACE FUNCTION "public"."propagate_profile_name_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN 
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    UPDATE public.forum_threads SET author_name = NEW.full_name WHERE author_id = NEW.id;
    UPDATE public.forum_replies SET author_name = NEW.full_name WHERE author_id = NEW.id;
    UPDATE public.reviews SET user_name = NEW.full_name WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."propagate_profile_name_change"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."propagate_profile_name_change"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."propagate_profile_name_change"() FROM anon, authenticated;


CREATE OR REPLACE FUNCTION "public"."propagate_college_name_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    UPDATE public.forum_threads SET college_name = NEW.name WHERE college_id = NEW.id;
    UPDATE public.reviews SET college_name = NEW.name WHERE college_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."propagate_college_name_change"() OWNER TO "postgres";

REVOKE EXECUTE ON FUNCTION "public"."propagate_college_name_change"() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."propagate_college_name_change"() FROM anon, authenticated;

CREATE TRIGGER trg_sync_profile_email AFTER INSERT OR UPDATE OF email ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."sync_profile_from_auth_user"();

CREATE OR REPLACE TRIGGER "on_review_vote_change" AFTER INSERT OR DELETE ON "public"."review_votes" FOR EACH ROW EXECUTE FUNCTION "public"."sync_review_helpful_count"();


CREATE OR REPLACE TRIGGER "trg_reply_count" AFTER INSERT OR DELETE ON "public"."forum_replies" FOR EACH ROW EXECUTE FUNCTION "public"."update_thread_reply_count"();



CREATE OR REPLACE TRIGGER "trg_review_votes_insert" AFTER INSERT OR DELETE ON "public"."review_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_helpful_count"();



CREATE OR REPLACE TRIGGER "trg_update_ratings_on_delete" AFTER DELETE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_college_ratings"();



CREATE OR REPLACE TRIGGER "trg_update_ratings_on_insert" AFTER INSERT ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_college_ratings"();



CREATE OR REPLACE TRIGGER "trg_update_ratings_on_update" AFTER UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_college_ratings"();


CREATE OR REPLACE TRIGGER "trg_sync_names_forum_threads" BEFORE INSERT OR UPDATE ON "public"."forum_threads" FOR EACH ROW EXECUTE FUNCTION "public"."sync_names_on_change"();
 

CREATE OR REPLACE TRIGGER "trg_sync_names_forum_replies" BEFORE INSERT OR UPDATE ON "public"."forum_replies" FOR EACH ROW EXECUTE FUNCTION "public"."sync_names_on_change"();


 
CREATE OR REPLACE TRIGGER "trg_sync_names_reviews" BEFORE INSERT OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."sync_names_on_change"();



CREATE OR REPLACE TRIGGER "trg_propagate_profile_name" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."propagate_profile_name_change"();



CREATE OR REPLACE TRIGGER "trg_propagate_college_name" AFTER UPDATE ON "public"."colleges" FOR EACH ROW EXECUTE FUNCTION "public"."propagate_college_name_change"();




CREATE POLICY "Admins: Delete all colleges" ON "public"."colleges" FOR DELETE USING ("public"."is_admin"());

CREATE POLICY "Admins: Delete all courses" ON "public"."courses" FOR DELETE USING ("public"."is_admin"());

CREATE POLICY "Admins: Insert all colleges" ON "public"."colleges" FOR INSERT WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins: Insert all courses" ON "public"."courses" FOR INSERT WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins: Update all colleges" ON "public"."colleges" FOR UPDATE USING ("public"."is_admin"());

CREATE POLICY "Admins: Update all courses" ON "public"."courses" FOR UPDATE USING ("public"."is_admin"());

CREATE POLICY "Colleges: Viewable if active or by admin" ON "public"."colleges" FOR SELECT USING (("is_active" = true) OR ("public"."is_admin"()));

CREATE POLICY "Courses: Viewable by all" ON "public"."courses" FOR SELECT USING (true);

CREATE POLICY "Forum Replies: Delete own or by admin" ON "public"."forum_replies" FOR DELETE USING ((((select "auth"."uid"()) = "author_id") OR ("public"."is_admin"())));

CREATE POLICY "Forum Replies: Insert by admin or open thread" ON "public"."forum_replies" FOR INSERT WITH CHECK ((("public"."is_admin"()) OR ((((select "auth"."uid"()) = "author_id") AND (EXISTS ( SELECT 1 FROM "public"."forum_threads" WHERE (("forum_threads"."id" = "forum_replies"."thread_id") AND ("forum_threads"."status" = ANY (ARRAY['open'::"public"."thread_status", 'pinned'::"public"."thread_status"])))))))));

CREATE POLICY "Forum Replies: Update own or by admin" ON "public"."forum_replies" FOR UPDATE USING ((((select "auth"."uid"()) = "author_id") OR ("public"."is_admin"())));

CREATE POLICY "Forum Replies: View approved or by admin" ON "public"."forum_replies" FOR SELECT USING (("is_approved" = true) OR ("public"."is_admin"()));

CREATE POLICY "Forum Threads: Delete own or by admin" ON "public"."forum_threads" FOR DELETE USING ((((select "auth"."uid"()) = "author_id") OR ("public"."is_admin"())));

CREATE POLICY "Forum Threads: Insert own or by admin" ON "public"."forum_threads" FOR INSERT WITH CHECK ((((select "auth"."uid"()) = "author_id") OR ("public"."is_admin"())));

CREATE POLICY "Forum Threads: Update own or by admin" ON "public"."forum_threads" FOR UPDATE USING ((((select "auth"."uid"()) = "author_id") OR ("public"."is_admin"())));

CREATE POLICY "Forum Threads: View approved, own, or by admin" ON "public"."forum_threads" FOR SELECT USING ((("is_approved" = true) OR (((select "auth"."uid"()) = "author_id") OR ("public"."is_admin"()))));

CREATE POLICY "Profiles: Delete by admin" ON "public"."profiles" FOR DELETE USING ("public"."is_admin"());

CREATE POLICY "Profiles: Insert own or by admin" ON "public"."profiles" FOR INSERT WITH CHECK ((((select "auth"."uid"()) = "id") OR ("public"."is_admin"())));

CREATE POLICY "Profiles: Update own or by admin" ON "public"."profiles" FOR UPDATE USING ((((select "auth"."uid"()) = "id") OR ("public"."is_admin"())));

CREATE POLICY "Profiles: Viewable by all" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Review Votes: Delete own or by admin" ON "public"."review_votes" FOR DELETE USING ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Review Votes: Insert own or by admin" ON "public"."review_votes" FOR INSERT WITH CHECK ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Review Votes: Viewable by all" ON "public"."review_votes" FOR SELECT USING (true);

CREATE POLICY "Reviews: Delete own or by admin" ON "public"."reviews" FOR DELETE USING ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Reviews: Insert own or by admin" ON "public"."reviews" FOR INSERT WITH CHECK ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Reviews: Update own or by admin" ON "public"."reviews" FOR UPDATE USING ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Reviews: View approved, own, or by admin" ON "public"."reviews" FOR SELECT USING ((("is_approved" = true) OR (((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"()))));

CREATE POLICY "Saved Colleges: Delete own or by admin" ON "public"."saved_colleges" FOR DELETE USING ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Saved Colleges: Insert own or by admin" ON "public"."saved_colleges" FOR INSERT WITH CHECK ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));

CREATE POLICY "Saved Colleges: View own or by admin" ON "public"."saved_colleges" FOR SELECT USING ((((select "auth"."uid"()) = "user_id") OR ("public"."is_admin"())));



ALTER TABLE "public"."colleges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_replies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_colleges" ENABLE ROW LEVEL SECURITY;



ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_review_helpful_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_college_ratings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_review_helpful_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_thread_reply_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_names_on_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."propagate_profile_name_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."propagate_college_name_change"() TO "service_role";



GRANT ALL ON TABLE "public"."colleges" TO "anon";
GRANT ALL ON TABLE "public"."colleges" TO "authenticated";
GRANT ALL ON TABLE "public"."colleges" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."forum_replies" TO "anon";
GRANT ALL ON TABLE "public"."forum_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_replies" TO "service_role";



GRANT ALL ON TABLE "public"."forum_threads" TO "anon";
GRANT ALL ON TABLE "public"."forum_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_threads" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."review_votes" TO "anon";
GRANT ALL ON TABLE "public"."review_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."review_votes" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."saved_colleges" TO "anon";
GRANT ALL ON TABLE "public"."saved_colleges" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_colleges" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

