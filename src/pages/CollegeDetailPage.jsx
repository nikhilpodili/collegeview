import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';

import {
  Bookmark, Share2, Check, Star, Calendar, Trophy as RankingIcon,
  Award as GradeIcon,
  IndianRupee as FeesIcon,
  Briefcase as PackageIcon,
  TrendingUp as HighestIcon,
  CheckCircle as PlacementIcon,
  Building2 as CampusIcon,
  BookOpen as CoursesIcon,
  Users as SeatsIcon,
  UserCog as RatioIcon,
  Globe, CircleQuestionMark,
  Phone, Mail,
  User, IndianRupee,
  Bed, BedDouble, Dumbbell, BookOpen, Wifi, Stethoscope,
  ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { useCollege, useCollegeReviews, useCollegeReviewStats, useForumThreads, useCollegeCourses, useSavedColleges } from '../hooks/useColleges';
import { useAuth } from '../lib/auth/core/useAuth';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import RatingBreakdown from '../components/RatingBreakdown';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import ForumThreadCard from '../components/ForumThreadCard';
import NewThreadForm from '../components/NewThreadForm';
import RecruiterCard from '../components/RecruiterCard';
import Pagination from '../components/Pagination';
import PremiumStatCard from '../components/PremiumStatCard';
import { supabase } from '../lib/hooks/supabase';
import { Briefcase, TrendingUp, Award, Users, } from '../components/icons';
import CourseCard from '../components/CourseCard';
import img1 from '../assets/college_gallery/img1.jpg';
import img2 from '../assets/college_gallery/img2.jpg';
import img3 from '../assets/college_gallery/img3.jpg';
import img4 from '../assets/college_gallery/img4.jpg';

const galleryImages = [img1, img2, img3, img4];


const TABS = ['Overview', 'Courses', 'Reviews', 'Forum', 'Placements'];

export default function CollegeDetailPage() {
  const { slug } = useParams();
  const [tab, setTab] = useState('Overview');
  const [copied, setCopied] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [courseSort, setCourseSort] = useState('name');
  const [courseExamFilter, setCourseExamFilter] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [forumPage, setForumPage] = useState(1);
  const [reviewSort, setReviewSort] = useState('newest');
  const [forumSort, setForumSort] = useState('latest');
  const [forumTag, setForumTag] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  useEffect(() => {
    if (urlTab && TABS.includes(urlTab)) {
      setTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };
  const { user } = useAuth();
  const { showToast } = useToast();

  const { college, loading, error } = useCollege(slug);
  const { savedIds, toggleSave } = useSavedColleges(user?.id);
  const isSaved = college?.id && savedIds.includes(college.id);

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Please sign in to save this college.', 'warning');
      return;
    }
    const result = await toggleSave(college.id);
    if (result.error) showToast(result.error, 'error');
    else showToast(result.saved ? 'College saved to your profile.' : 'College removed from saved list.', 'success');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  const { stats: dynamicRatings, refetch: refetchStats } = useCollegeReviewStats(college?.id);
  const { reviews, totalCount, totalPages: reviewTotalPages, loading: rLoading, deleteReview, refetch: refetchReviews } = useCollegeReviews(college?.id, {
    page: reviewPage,
    pageSize: 5,
    sortBy: reviewSort
  });

  const { courses, loading: coursesLoading, error: coursesError } = useCollegeCourses(college?.id, {
    sortBy: courseSort,
    filterExam: courseExamFilter
  });


  const { threads, totalPages: forumTotalPages, loading: tLoading, deleteThread, refetch: refetchThreads } = useForumThreads(college?.id, {
    page: forumPage,
    pageSize: 5,
    sortBy: forumSort,
    tagFilter: forumTag
  });

  const handleDeleteThread = async (id) => {
    const { error } = await deleteThread(id);
    if (error) showToast(error, 'error');
    else showToast('Discussion thread deleted successfully.', 'success');
  };

  const handleDeleteReview = async (id) => {
    const { error } = await deleteReview(id);
    if (error) showToast(error, 'error');
    else {
      showToast('Review deleted successfully.', 'success');
      await refetchStats(); // Update ratings summary
    }
  };

  const handleReviewSubmit = async (data) => {
    if (!user) {
      showToast('Please sign in to submit a review.', 'warning');
      return;
    }


    if (!college?.id) {
      showToast('Error: College data is missing. Please refresh the page.', 'error');
      return;
    }

    setReviewLoading(true);


    const { error } = await supabase
      .from('reviews')
      .upsert({
        ...data,
        user_id: user.id,
        college_id: college.id,
      }, {
        onConflict: 'college_id,user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Review submission error:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      await refetchReviews();
      showToast('Review submitted successfully!', 'success');
    }

    setReviewLoading(false);
  };

  const handleThreadSubmit = async (data) => {
    if (!user) {
      showToast('Please sign in to post a thread.', 'warning');
      return;
    }
    setThreadLoading(true);
    await supabase.from('forum_threads').insert({ ...data, author_id: user.id });
    await refetchThreads();
    setThreadLoading(false);
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 'var(--r-lg)', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: 300, height: 28, borderRadius: 'var(--r-md)', margin: '0 auto 10px' }} />
        <div className="skeleton" style={{ width: 200, height: 18, borderRadius: 'var(--r-md)', margin: '0 auto' }} />
      </div>
    </div>
  );

  if (error || !college) return (
    <div className="page-wrapper container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56 }}>😕</div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--oxford)', marginTop: 16 }}>College not found</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 24 }}>The college you're looking for doesn't exist or has been removed.</p>
      <Link to="/colleges" className="btn btn-primary">← Back to Colleges</Link>
    </div>
  );

  const { name, short_name, logo_url, college_type, ownership, state, city, address,
    established_year, nirf_ranking, naac_grade, avg_annual_fees, min_fees, max_fees,
    hostel_fees_per_year, avg_package_lpa, highest_package_lpa, median_package_lpa,
    placement_rate_pct, avg_rating, total_reviews, description, entrance_exams = [],
    top_recruiters = [], approvals = [], campus_area_acres, student_faculty_ratio,
    total_courses, has_hostel, has_girls_hostel, has_sports_complex, has_library, has_wifi,
    avg_academic_rating, avg_placement_rating, avg_infrastructure_rating,
    avg_social_life_rating, avg_faculty_rating, avg_value_for_money_rating, website_url,
    email, phone, total_seats, has_medical_facility, nirf_rank_category, banner_url,
    is_featured, updated_at,
  } = college;


  const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
  const fmtL = (n) => n ? (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}K`) : '—';
  const fmtPkg = (v) => v ? (v >= 100 ? `${parseFloat((v / 100).toFixed(2))} Cr` : `${v} LPA`) : '—';

  const facilities = [
    { icon: Bed, label: 'Hostel', value: has_hostel },
    { icon: BedDouble, label: 'Girls Hostel', value: has_girls_hostel },
    { icon: Dumbbell, label: 'Sports', value: has_sports_complex },
    { icon: BookOpen, label: 'Library', value: has_library },
    { icon: Wifi, label: 'Wi-Fi', value: has_wifi },
    { icon: Stethoscope, label: 'Medical', value: has_medical_facility },
    { icon: User, label: 'Student:Faculty', value: student_faculty_ratio }
  ];

  const statsData = [
    { show: nirf_ranking, icon: RankingIcon, value: `#${nirf_ranking}`, label: "NIRF Rank", color: "#0f172a", bg: "#fef3c7" },
    { show: naac_grade, icon: GradeIcon, value: naac_grade, label: "NAAC Grade", color: "#059669", bg: "#d1fae5" },
    { show: avg_annual_fees, icon: FeesIcon, value: fmtL(avg_annual_fees), label: "Avg Fees/yr", color: "#6366f1", bg: "#e0e7ff" },
    { show: avg_package_lpa, icon: PackageIcon, value: fmtPkg(avg_package_lpa), label: "Avg Package", color: "#ea580c", bg: "#ffedd5" },
    { show: highest_package_lpa, icon: HighestIcon, value: fmtPkg(highest_package_lpa), label: "Highest Pkg", color: "#0891b2", bg: "#cffafe" },
    { show: placement_rate_pct, icon: PlacementIcon, value: `${placement_rate_pct}%`, label: "Placement", color: "#059669", bg: "#d1fae5" },
    { show: campus_area_acres, icon: CampusIcon, value: `${campus_area_acres} Ac`, label: "Campus Area", color: "#0f172a", bg: "#f3f4f6" },
    { show: total_courses > 0, icon: CoursesIcon, value: total_courses, label: "Courses", color: "#7c3aed", bg: "#ede9fe" },
    { show: total_seats > 0, icon: SeatsIcon, value: total_seats.toLocaleString('en-IN'), label: "Total Seats", color: "#0284c7", bg: "#e0f2fe" },
    { show: student_faculty_ratio, icon: RatioIcon, value: `${student_faculty_ratio}:1`, label: "Student:Faculty", color: "#d97706", bg: "#fef3c7" }
  ];


  return (

    <div className="page-wrapper" style={{ position: 'relative', overflow: 'hidden', background: 'var(--mild-accent6)', borderRadius: 'var(--r-xl)' }} >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
    linear-gradient(to right, rgba(0,0,0,0.06) 2px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.06) 2px, transparent 1px)
  `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, }}>

        <div className="breadcrumb-wrapper">
          <div className="container breadcrumb-container">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/colleges" className="breadcrumb-link">Colleges</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{short_name || name}</span>
          </div>
        </div>


        <div style={{
          background: banner_url
            ? `linear-gradient(135deg, rgba(0,21,46,0.9) 0%, rgba(0,33,71,0.85) 100%), url(${banner_url}) center/cover no-repeat`
            : 'linear-gradient(135deg,var(--oxford-deep),var(--oxford))',
          padding: '40px 0',
          margin: '0 20px',
          borderRadius: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div className="container" style={{}}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', padding: '0 20px' }}>

              <div style={{
                width: 100, height: 100, flexShrink: 0, borderRadius: '24px',
                background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', color: '#fff', fontSize: 28, fontWeight: 700, overflow: 'hidden',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}>
                {logo_url ? <img src={logo_url} alt={short_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (short_name || name).slice(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {is_featured && <span className="badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, borderRadius: '8px' }}><Star size={11} fill="#fff" /> Featured</span>}
                  <span className="badge badge-oxford" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px' }}>{college_type}</span>
                  <span className="badge badge-saffron" style={{ borderRadius: '8px' }}>{ownership}</span>
                  {established_year && <span className="badge badge-green" style={{ borderRadius: '8px' }}>Est. {established_year}</span>}
                  {nirf_rank_category && <span className="badge" style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px' }}>📊 {nirf_rank_category}</span>}
                  {(approvals || []).map(a => <span key={a} className="badge badge-gold" style={{ borderRadius: '8px' }}>{a}</span>)}
                </div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>{name}</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>📍 {address || `${city}, ${state}`}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  {website_url && (
                    <a
                      href={website_url.startsWith('http') ? website_url : `https://${website_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 14, color: 'var(--saffron)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      <Globe size={20} /> {website_url.replace(/^https?:\/\//, '')} ↗
                    </a>
                  )}
                  {phone && <a href={`tel:${phone}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}><Phone size={20} />{phone}</a>}
                  {email && <a href={`mailto:${email}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}><Mail size={20} />{email}</a>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={handleShare}
                    style={{
                      width: 52, height: 52, borderRadius: '16px',
                      background: copied ? 'var(--green)' : 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      color: '#fff',
                    }}
                    title="Share College"
                  >
                    {copied ? <Check size={24} /> : <Share2 size={24} />}
                  </button>

                  <button
                    onClick={handleToggleSave}
                    style={{
                      width: 52, height: 52, borderRadius: '16px',
                      background: isSaved ? 'var(--saffron)' : 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 24, transition: 'all 0.2s ease',
                      color: isSaved ? 'var(--oxford)' : '#fff',
                    }}
                    title={isSaved ? 'Remove from Saved' : 'Save College'}
                  >
                    <Bookmark
                      size={24}
                      fill={isSaved ? 'currentColor' : 'none'}
                      color="currentColor"
                    />
                  </button>
                </div>


                <div style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  padding: '16px 24px',
                  textAlign: 'center',
                  flexShrink: 0,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {dynamicRatings ? dynamicRatings.overall : (avg_rating > 0 ? Number(avg_rating).toFixed(1) : '—')}
                  </div>
                  <div style={{ margin: '6px 0' }}>
                    <StarRating rating={parseFloat(dynamicRatings ? dynamicRatings.overall : (avg_rating || 0))} size={14} />
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{dynamicRatings ? dynamicRatings.count : (total_reviews || 0)} Reviews</div>
                </div>
              </div>
            </div>


            <nav style={{
              display: 'flex',
              margin: '24px 20px 0',
              gap: 8,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              padding: '6px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflowX: 'auto',
            }}>
              {TABS.map(t => (
                <button key={t} onClick={() => handleTabChange(t)} style={{
                  flex: 1,
                  padding: '10px 20px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 18,
                  fontWeight: tab === t ? 700 : 600,
                  border: 'none',
                  borderRadius: '12px',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? 'var(--oxford)' : 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  boxShadow: tab === t ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}>{t}</button>
              ))}
            </nav>
          </div>
        </div>


        <div className="container" style={{ padding: '15px 12px' }}>


          {tab === 'Overview' && (
            <div>
              <>

                <style>{`
    .stat-pill {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-pill:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.12) !important; background-color: #f8fafc; }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>


                <div style={{ position: 'relative', marginBottom: '32px' }}>
                  <div style={{
                    position: 'absolute', left: '3px', top: '3px', bottom: '3px', width: '24px',
                    background: '#f8fafc',
                    zIndex: 2, pointerEvents: 'none', borderRadius: '14px 0 0 14px'
                  }} />


                  <div className="hide-scrollbar" style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    height: '140px',
                    padding: '10px 0',
                    gap: '12px',
                    borderRadius: '16px',
                    border: '3px solid var(--mild-accent5)',
                    backgroundColor: '#f8fafc',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>

                    <div style={{ flex: '0 0 32px' }} />

                    {statsData.map((stat, i) => stat.show && (
                      <div
                        key={i}
                        className="stat-pill"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          flex: '0 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '110px',
                          height: '96px',
                          padding: '10px 12px',
                          borderRadius: '14px',
                          backgroundColor: hovered === i ? 'var(--saffron-light)' : '#ffffff',
                          border: hovered === i ? "3px solid var(--saffron)" : "2px solid var(--saffron)",
                          boxShadow: hovered === i ? '0 8px 16px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
                          transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
                          transition: 'all 0.2s ease',
                          gap: '6px',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: stat.bg || '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <stat.icon size={16} color={stat.color} strokeWidth={2.5} />
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: stat.color || '#0f172a',
                          lineHeight: '1.2'
                        }}>
                          {stat.value}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}


                    <div style={{ flex: '0 0 32px' }} />
                  </div>


                  <div style={{
                    position: 'absolute', right: '3px', top: '3px', bottom: '3px', width: '24px',
                    background: '#f8fafc',
                    zIndex: 2, pointerEvents: 'none', borderRadius: '0 14px 14px 0'
                  }} />
                </div>
              </>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, }}>
                  {description && (
                    <div className="card" style={{ padding: '28px', borderRadius: 14, border: "3px solid var(--mild-accent5)" }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--oxford), #1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 14, color: '#fff', display: 'flex', justifyContent: 'center' }}><CircleQuestionMark /></span>
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--oxford)', margin: 0 }}>About {short_name || name}</h2>
                      </div>
                      <p style={{ fontSize: 20, fontFamily: 'var(--font-heading)', lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{description}</p>
                    </div>
                  )}
                  {entrance_exams.length > 0 && (
                    <section className="card" style={{
                      padding: '32px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      background: '#fff',
                      border: "3px solid var(--mild-accent5)"
                    }}>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <h2 style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '22px',
                          fontWeight: '700',
                          color: 'var(--oxford)',
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Award size={14} color="#fff" />
                          </span>
                          Entrance Exams Accepted
                        </h2>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: 'var(--text-muted)',
                          background: 'var(--surface)',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}>
                          {entrance_exams.length} {entrance_exams.length === 1 ? 'Exam' : 'Exams'}
                        </span>
                      </div>


                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                      }}>
                        {entrance_exams.map((examName) => {
                          // Define exam-specific data for better visualization
                          const examData = {
                            'JEE Advanced': { color: '#1e40af', difficulty: 'Very Hard', desc: 'National Level Engineering' },
                            'JEE Main': { color: '#2563eb', difficulty: 'Hard', desc: 'National Level Engineering' },
                            'NEET': { color: '#15803d', difficulty: 'Hard', desc: 'National Level Medical' },
                            'CAT': { color: '#7c3aed', difficulty: 'Very Hard', desc: 'Management Aptitude' },
                            'GATE': { color: '#b45309', difficulty: 'Hard', desc: 'Graduate Aptitude Test' },
                            'BITSAT': { color: '#be185d', difficulty: 'Hard', desc: 'Birla Institute Tech' },
                            'VITEEE': { color: '#0369a1', difficulty: 'Medium', desc: 'VIT Entrance' },
                            'CUET': { color: '#065f46', difficulty: 'Medium', desc: 'Common University Entry' },
                            'CLAT': { color: '#4338ca', difficulty: 'Hard', desc: 'Law Entrance' },
                            'NATA': { color: '#db2777', difficulty: 'Medium', desc: 'Architecture Aptitude' },
                          };

                          const data = examData[examName] || {
                            color: '#374151',
                            difficulty: 'Medium',
                            desc: 'Entrance Examination'
                          };

                          return (
                            <div key={examName} style={{
                              background: '#fff',
                              border: `2px solid var(--mild-accent3)`,
                              borderRadius: '10px',
                              padding: '10px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              position: 'relative',
                              overflow: 'hidden',
                              cursor: 'default',
                              borderLeft: `4px solid ${data.color}`
                            }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = data.color;
                                e.currentTarget.style.boxShadow = `0 4px 12px ${data.color}10`;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = `${data.color}15`;
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <h3 style={{
                                  fontFamily: 'var(--font-heading)',
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: 'var(--oxford)',
                                  margin: 0,
                                  lineHeight: 1.2
                                }}>
                                  {examName}
                                </h3>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: `${data.color}10`,
                                  color: data.color,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.4px',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {data.difficulty}
                                </span>
                              </div>

                              <p style={{
                                fontSize: '13px',
                                color: 'var(--text-muted)',
                                fontWeight: '500',
                                margin: 0,
                                lineHeight: 1.4,
                                opacity: 0.8
                              }}>
                                {data.desc}
                              </p>
                            </div>

                          );
                        })}
                      </div>
                    </section>
                  )}
                  {top_recruiters.length > 0 && (
                    <section className="card" style={{
                      padding: '32px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      background: '#fff',
                      border: "3px solid var(--mild-accent5)",

                    }}>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <h3 style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '20px',
                          fontWeight: '700',
                          color: 'var(--oxford)',
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--saffron) 0%, #e07a00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Briefcase size={14} color="#fff" />
                          </span>
                          Top Recruiters
                        </h3>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: 'var(--text-muted)',
                          background: 'var(--surface)',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}>
                          {top_recruiters.length} {top_recruiters.length === 1 ? 'Company' : 'Companies'}
                        </span>
                      </div>


                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '16px'
                      }}>
                        {top_recruiters.map((r, i) => {
                          const isObj = typeof r === 'object' && r !== null;
                          return (
                            <RecruiterCard
                              key={isObj ? r.id || r.name : r}
                              name={isObj ? r.name : r}
                              logoUrl={isObj ? r.logo_url || r.logo : null}
                              industry={isObj ? r.industry : null}
                              avgPackage={isObj ? r.avg_package : null}
                              hires={isObj ? r.hires : null}
                            />
                          );
                        })}
                      </div>
                    </section>
                  )}


                  <section className="card" style={{
                    padding: '32px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    background: 'var(--oxford)',
                    border: "3px solid var(--mild-accent5)",
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px'
                    }}>
                      <h3 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '22px',
                        fontWeight: '700',
                        color: 'white',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                        }}>
                          <ImageIcon size={16} color="#fff" />
                        </span>
                        Campus Gallery
                      </h3>

                    </div>
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '320px', background: '#f8fafc', border: '3px solid' }}>

                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
                        background: '#f8fafc', zIndex: 12, pointerEvents: 'none'
                      }} />

                      <div style={{
                        display: 'flex',
                        height: '100%',
                        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `translateX(calc(50% - ${(galleryIndex * 65) + 32.5}%))`, // 65% is image width, 32.5% is half of it
                        alignItems: 'center',
                        gap: '20px',
                        padding: '0 20px'
                      }}>
                        {galleryImages.map((imgSrc, i) => {
                          const isActive = i === galleryIndex;
                          return (
                            <div
                              key={i}
                              style={{
                                minWidth: '65%',
                                height: isActive ? '100%' : '85%',
                                position: 'relative',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: isActive ? 1 : 0.4,
                                transform: isActive ? 'scale(1)' : 'scale(0.95)',
                                boxShadow: isActive ? '0 12px 30px rgba(0,0,0,0.15)' : 'none'
                              }}
                            >
                              <img
                                src={imgSrc}
                                alt={`Campus View ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div style={{
                                display: 'none', position: 'absolute', inset: 0,
                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: '#f8fafc', color: '#94a3b8', gap: '12px',
                                border: '2px dashed #e2e8f0', borderRadius: '12px'
                              }}>
                                <ImageIcon size={48} strokeWidth={1} />
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>Image {i + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>


                      <div style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px',
                        background: '#f8fafc', zIndex: 12, pointerEvents: 'none'
                      }} />


                      <div
                        onClick={() => setGalleryIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)}
                        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%', cursor: 'pointer', zIndex: 5 }}
                      />
                      <div
                        onClick={() => setGalleryIndex(prev => (prev + 1) % galleryImages.length)}
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%', cursor: 'pointer', zIndex: 5 }}
                      />

                      <button
                        onClick={() => setGalleryIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)}
                        style={{
                          position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                          width: '44px', height: '44px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                          border: '3px solid ', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          cursor: 'pointer', transition: 'all 0.2s', color: 'var(--oxford)',
                          zIndex: 19
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => setGalleryIndex(prev => (prev + 1) % galleryImages.length)}
                        style={{
                          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                          width: '44px', height: '44px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                          border: '3px solid', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          cursor: 'pointer', transition: 'all 0.2s', color: 'var(--oxford)',
                          zIndex: 19
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>

                    <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                      Take a virtual tour of our state-of-the-art campus facilities and student life.
                    </p>
                  </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  <div className="card" style={{ padding: '24px', borderRadius: 14, border: "3px solid var(--mild-accent5)", }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={16} color="#fff" fill="#fff" />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--oxford)', margin: 0 }}>Rating Breakdown</h3>
                    </div>
                    <RatingBreakdown ratings={dynamicRatings ? {
                      academic_rating: dynamicRatings.academic,
                      placement_rating: dynamicRatings.placement,
                      infrastructure_rating: dynamicRatings.infra,
                      social_life_rating: dynamicRatings.social,
                      faculty_rating: dynamicRatings.faculty,
                      value_for_money_rating: dynamicRatings.vfm
                    } : {
                      academic_rating: avg_academic_rating,
                      placement_rating: avg_placement_rating,
                      infrastructure_rating: avg_infrastructure_rating,
                      social_life_rating: avg_social_life_rating,
                      faculty_rating: avg_faculty_rating,
                      value_for_money_rating: avg_value_for_money_rating
                    }} />
                  </div>

                  <div className="card" style={{ padding: '24px', borderRadius: 14, border: "3px solid var(--mild-accent5)", }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={16} color="#fff" />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--oxford)', margin: 0 }}>Facilities</h3>
                    </div>
                    {facilities.map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, padding: '8px 0', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon size={24} strokeWidth={2} style={{ opacity: 0.7 }} />
                          {label}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: value ? '#059669' : '#dc2626', background: value ? '#dcfce7' : '#fee2e2', padding: '3px 10px', borderRadius: 20 }}>
                          {value ? '✓ Yes' : ' No'}
                        </span>
                      </div>
                    ))}

                  </div>

                  <div className="card" style={{ padding: '24px', borderRadius: 14, border: "3px solid var(--mild-accent5)", }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 14, color: '#fff' }}><IndianRupee /></span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--oxford)', margin: 0 }}>Fee Structure</h3>
                    </div>
                    {[['Min Fees/yr', min_fees, '#e0f2fe'], ['Avg Fees/yr', avg_annual_fees, '#fef3c7'], ['Max Fees/yr', max_fees, '#fce7f3'], ['Hostel/yr', hostel_fees_per_year, '#ecfdf5']].map(([l, v, bg]) => v && (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', marginBottom: 6, background: bg, borderRadius: 8 }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 19, fontWeight: 500 }}>{l}</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--oxford)', fontSize: 18 }}>{fmt(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {updated_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 18px', background: 'var(--surface)', border: "3px solid var(--mild-accent5)", borderRadius: 10 }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Last updated: {new Date(updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          )}


          {tab === 'Reviews' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
              <div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                  borderRadius: '10px',
                  gap: 16,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                  background: 'linear-gradient(to bottom, #fff, var(--surface))'
                }}>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 56,
                        fontWeight: 800,
                        color: 'var(--oxford)',
                        lineHeight: 1,
                        letterSpacing: '-1px'
                      }}>
                        {dynamicRatings ? dynamicRatings.overall : (avg_rating > 0 ? Number(avg_rating).toFixed(1) : '—')}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: 8 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <StarRating rating={parseFloat(dynamicRatings ? dynamicRatings.overall : (avg_rating || 0))} size={20} />
                        </div>

                        <span style={{
                          fontSize: 13,
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                          Based on {dynamicRatings ? dynamicRatings.count : (total_reviews || 0)} verified reviews
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      width: '100%',
                      marginTop: 12,
                      gap: 12
                    }}>
                      <label htmlFor="review-sort" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-muted)' }}>Sort by:</label>
                      <select
                        id="review-sort"
                        value={reviewSort}
                        onChange={(e) => {
                          setReviewSort(e.target.value);
                          setReviewPage(1);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border)',
                          fontSize: 14,
                          fontFamily: 'var(--font-ui)',
                          color: 'var(--text-primary)',
                          background: '#fff',
                          cursor: 'pointer',
                          outline: 'none',
                          minWidth: '160px'
                        }}
                      >
                        <option value="newest">Latest First</option>
                        <option value="rating_high">Ratings: High to Low</option>
                        <option value="rating_low">Ratings: Low to High</option>
                        <option value="helpful">Most Helpful</option>
                      </select>
                    </div>


                    <h2 className="h3" style={{ margin: 0, fontSize: 18, fontWeight: 600, marginTop: "20px", color: 'var(--text-secondary)' }}>
                      Student Reviews & Ratings
                    </h2>
                  </div>

                  {reviews.length > 0 && (
                    <div style={{
                      width: '100%',
                      maxWidth: 600,
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '16px 24px',
                      boxShadow: '0 2px 8px rgba(218, 42, 42, 0.03)'
                    }}>
                      <RatingBreakdown ratings={dynamicRatings ? {
                        academic_rating: dynamicRatings.academic,
                        placement_rating: dynamicRatings.placement,
                        infrastructure_rating: dynamicRatings.infra,
                        social_life_rating: dynamicRatings.social,
                        faculty_rating: dynamicRatings.faculty,
                        value_for_money_rating: dynamicRatings.vfm
                      } : {}} />
                    </div>
                  )}
                </div>

                {rLoading ? <div className="skeleton" style={{ height: 200, borderRadius: 'var(--r-xl)' }} /> :
                  reviews.length === 0 ? (
                    <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {reviews.map(r => (
                        <ReviewCard
                          key={r.id}
                          review={r}
                          currentUserId={user?.id}
                          onDelete={handleDeleteReview}
                        />
                      ))}
                      <Pagination page={reviewPage} totalPages={reviewTotalPages} onChange={setReviewPage} />
                    </div>
                  )
                }
              </div>
              <ReviewForm collegeId={college.id} onSubmit={handleReviewSubmit} loading={reviewLoading} />
            </div>
          )}

          {tab === 'Forum' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 className="h2" style={{ margin: 0 }}>Discussion Forum</h2>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 17, color: 'var(--text-muted)', fontWeight: 900 }}>Sort:</span>
                    <select
                      value={forumSort}
                      onChange={e => { setForumSort(e.target.value); setForumPage(1); }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                        fontSize: 13, fontWeight: 600, color: 'var(--oxford)', outline: 'none'
                      }}
                    >
                      <option value="latest">Latest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="most_replies">Most Replies</option>
                      <option value="open">Status: Open</option>
                      <option value="closed">Status: Closed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, padding: '14px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => { setForumTag(''); setForumPage(1); }}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                      background: forumTag === '' ? 'var(--oxford)' : '#fff',
                      color: forumTag === '' ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border)', transition: 'all 0.2s'
                    }}
                  >
                    All Topics
                  </button>
                  {['Admission', 'Hostel', 'Placements', 'Q&A', 'Academics', 'Fees', 'Scholarships', 'Campus Life', 'Faculty'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setForumTag(tag); setForumPage(1); }}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        background: forumTag === tag ? 'var(--oxford)' : '#fff',
                        color: forumTag === tag ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border)', transition: 'all 0.2s'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {tLoading ? <div className="skeleton" style={{ height: 200, borderRadius: 'var(--r-xl)' }} /> :
                  threads.length === 0 ? (
                    <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                      <p>No discussions yet. Start the first thread!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {threads.map(t => (
                        <ForumThreadCard
                          key={t.id}
                          thread={t}
                          currentUser={user}
                          onDeleteThread={handleDeleteThread}
                        />
                      ))}
                      <Pagination page={forumPage} totalPages={forumTotalPages} onChange={setForumPage} />
                    </div>
                  )
                }
              </div>
              <NewThreadForm collegeId={college.id} onSubmit={handleThreadSubmit} loading={threadLoading} />
            </div>
          )}

          {tab === 'Placements' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '36px',
                    fontWeight: 800,
                    color: 'var(--oxford)',
                    marginBottom: '8px'
                  }}>
                    Placement Statistics
                  </h2>
                  <p style={{ fontSize: '22px', color: 'var(--text-muted)' }}>
                    Latest placement data for {college.short_name || college.name}
                  </p>
                </div>

              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                {[
                  {
                    Icon: Briefcase,
                    label: 'Average Package',
                    value: avg_package_lpa,
                    accent: 'orange',
                    sub: 'Across all branches',
                    trend: 8
                  },
                  {
                    Icon: TrendingUp,
                    label: 'Highest Package',
                    value: highest_package_lpa,
                    accent: 'green',
                    sub: 'Top offer this year'
                  },
                  {
                    Icon: Award,
                    label: 'Median Package',
                    value: median_package_lpa,
                    accent: 'purple',
                    sub: '50th percentile'
                  },
                  {
                    Icon: Users,
                    label: 'Placement Rate',
                    value: placement_rate_pct ? `${placement_rate_pct}%` : '—',
                    accent: 'teal',
                    sub: 'Of eligible students',
                    trend: 3
                  },
                ].map(({ Icon: Ico, label, value, accent, sub, trend }) => {
                  let displayValue = value;
                  if (label.toLowerCase().includes('package') && typeof value === 'number') {
                    displayValue = fmtPkg(value);
                  } else if (!value) {
                    displayValue = '—';
                  }

                  return (
                    <PremiumStatCard
                      key={label}
                      Icon={Ico}
                      label={label}
                      value={displayValue}
                      sub={sub}
                      accent={accent}
                      trend={trend}
                    />
                  );
                })}
              </div>

              {(avg_package_lpa || median_package_lpa || highest_package_lpa) && (
                <div className="card" style={{ padding: '28px 32px', marginBottom: '32px', background: '#fff', border: '1px solid var(--border)', borderRadius: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--oxford)', marginBottom: '24px' }}>Salary Distribution</h3>
                  <div style={{ position: 'relative', height: '8px', background: '#e5e7eb', borderRadius: '99px', marginBottom: '32px' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', background: 'linear-gradient(90deg, #e0f2fe 0%, #38bdf8 40%, #0ea5e9 70%, #7c3aed 100%)', borderRadius: '99px' }} />
                    {avg_package_lpa && highest_package_lpa && (
                      <div style={{ position: 'absolute', top: '-4px', left: `${Math.min((avg_package_lpa / highest_package_lpa) * 100, 100)}%`, transform: 'translateX(-50%)' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0ea5e9', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(14,165,233,0.4)' }} />
                      </div>
                    )}
                    {median_package_lpa && highest_package_lpa && (
                      <div style={{ position: 'absolute', top: '-4px', left: `${Math.min((median_package_lpa / highest_package_lpa) * 100, 100)}%`, transform: 'translateX(-50%)' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#7c3aed', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(124,58,237,0.4)' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    {avg_package_lpa && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0ea5e9' }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average</div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--oxford)' }}>{fmtPkg(avg_package_lpa)}</div>
                        </div>
                      </div>
                    )}
                    {median_package_lpa && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7c3aed' }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Median</div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--oxford)' }}>{fmtPkg(median_package_lpa)}</div>
                        </div>
                      </div>
                    )}
                    {highest_package_lpa && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--saffron)' }} />
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Highest</div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--oxford)' }}>{fmtPkg(highest_package_lpa)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {top_recruiters.length > 0 && (
                <section className="card" style={{
                  padding: '32px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: 'var(--oxford)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--saffron) 0%, #e07a00 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Briefcase size={14} color="#fff" />
                      </span>
                      Top Recruiters
                    </h3>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--text-muted)',
                      background: 'var(--surface)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}>
                      {top_recruiters.length} {top_recruiters.length === 1 ? 'Company' : 'Companies'}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px'
                  }}>
                    {top_recruiters.map((r, i) => {
                      const isObj = typeof r === 'object' && r !== null;
                      return (
                        <RecruiterCard
                          key={isObj ? r.id || r.name : r}
                          name={isObj ? r.name : r}
                          logoUrl={isObj ? r.logo_url || r.logo : null}
                          industry={isObj ? r.industry : null}
                          avgPackage={isObj ? r.avg_package : null}
                          hires={isObj ? r.hires : null}
                        />
                      );
                    })}
                  </div>
                </section>
              )}


            </div>
          )}


          {tab === 'Courses' && (
            <div className="animate-in">
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '32px', flexWrap: 'wrap', gap: '20px',
                background: '#f8fafc', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20, color: '#fff' }}>📚</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'var(--oxford)', fontFamily: 'var(--font-heading)' }}>
                    Courses & Fees
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Filter by Exam</span>
                    <select
                      value={courseExamFilter}
                      onChange={(e) => setCourseExamFilter(e.target.value)}
                      style={{
                        width: '180px', height: '42px', fontSize: '15px', padding: '0 36px 0 16px',
                        borderRadius: '10px', border: '2px solid #e2e8f0', background: '#fff',
                        fontWeight: 600, color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s ease',
                        outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <option value="">All Exams</option>
                      <option value="JEE Advanced">JEE Advanced</option>
                      <option value="JEE Main">JEE Main</option>
                      <option value="NEET">NEET</option>
                      <option value="CAT">CAT</option>
                      <option value="GATE">GATE</option>
                      <option value="CUET">CUET</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Sort by</span>
                    <select
                      value={courseSort}
                      onChange={(e) => setCourseSort(e.target.value)}
                      style={{
                        width: '180px', height: '42px', fontSize: '15px', padding: '0 36px 0 16px',
                        borderRadius: '10px', border: '2px solid #e2e8f0', background: '#fff',
                        fontWeight: 600, color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s ease',
                        outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    >
                      <option value="name">Alphabetical</option>
                      <option value="entrance_exam">Entrance Exam</option>
                      <option value="annual_fees">Annual Fees</option>
                      <option value="duration_years">Duration</option>
                    </select>
                  </div>
                </div>
              </div>


              {coursesLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />)}
                </div>
              ) : coursesError ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}></div>
                  <h3 style={{ fontSize: '18px', color: 'var(--oxford)', marginBottom: '8px' }}>Failed to load courses</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{coursesError}</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="card" style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '50px', marginBottom: '20px' }}>📚</div>
                  <h3 style={{ fontSize: '20px', color: 'var(--oxford)', marginBottom: '8px' }}>No Courses Found</h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                    We couldn't find any courses listed for this college in our database yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          )}




        </div>
      </div>

    </div>
  );
}
