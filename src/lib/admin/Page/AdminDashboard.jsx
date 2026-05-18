import React, { useState, useEffect } from 'react';
import { supabase } from '../../hooks/supabase';
import {
  Users,
  School,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck,
  XCircle,
  FileText,
  BookOpen,
  Star,
  Activity,
  ShieldAlert,
  Award,
  Lock,
  UserCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import UserManagement from '../components/UserManagement';
import CollegeManagement from '../components/CollegeManagement';
import ReviewManagement from '../components/ReviewManagement';
import ThreadManagement from '../components/ThreadManagement';

/* ─── Sidebar Item Component ─────────────────────────────────── */
const SidebarItem = ({ id, label, icon: Icon, active, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        padding: '14px 20px',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: active ? 'rgba(255, 153, 51, 0.3)' : (hovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
        background: active ? 'linear-gradient(90deg, rgba(255, 153, 51, 0.15) 0%, rgba(255, 153, 51, 0.02) 100%)' : (hovered ? 'rgba(255,255,255,0.03)' : 'transparent'),
        color: "white",
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered && !active ? 'translateX(6px)' : 'none',
        marginBottom: '8px',
        textAlign: 'left',
        boxShadow: active ? '0 4px 12px rgba(255, 153, 51, 0.1)' : 'none'
      }}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} style={{
        transition: 'transform 0.3s ease',
        transform: active ? 'scale(1.1)' : (hovered ? 'scale(1.05)' : 'scale(1)')
      }} />
      <span style={{ fontSize: '16px', fontWeight: active ? 700 : 500, fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>{label}</span>
      {active && (
        <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--saffron)', boxShadow: '0 0 8px var(--saffron)' }} />
      )}
    </button>
  );
};

/* ─── Main Admin Dashboard Page ───────────────────────────────── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState({
    users: [],
    colleges: [],
    reviews: [],
    threads: []
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    blockedUsers: 0,
    adminUsers: 0,
    totalColleges: 0,
    featuredColleges: 0,
    totalCourses: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    openThreads: 0,
    closedThreads: 0,
    totalReplies: 0
  });
  const { showToast } = useToast();

  const fetchStats = async () => {
    try {
      const [
        uCount, uVerified, uBlocked, uAdmin,
        cCount, cFeatured,
        courseCount,
        rPending, rApproved,
        tOpen, tClosed,
        replyCount
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_blocked', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', true),
        supabase.from('colleges').select('*', { count: 'exact', head: true }),
        supabase.from('colleges').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
        supabase.from('forum_replies').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: uCount.count || 0,
        verifiedUsers: uVerified.count || 0,
        blockedUsers: uBlocked.count || 0,
        adminUsers: uAdmin.count || 0,
        totalColleges: cCount.count || 0,
        featuredColleges: cFeatured.count || 0,
        totalCourses: courseCount.count || 0,
        pendingReviews: rPending.count || 0,
        approvedReviews: rApproved.count || 0,
        openThreads: tOpen.count || 0,
        closedThreads: tClosed.count || 0,
        totalReplies: replyCount.count || 0
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let result;
      if (tab === 'users') {
        result = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
      } else if (tab === 'colleges') {
        result = await supabase.from('colleges').select('id, name, short_name, city, state, is_active').order('name', { ascending: true });
      } else if (tab === 'reviews') {
        result = await supabase.from('reviews').select('*, colleges(name), profiles(full_name)').order('created_at', { ascending: false });
      } else if (tab === 'threads') {
        result = await supabase.from('forum_threads').select('*, colleges(name), profiles(full_name)').order('created_at', { ascending: false });
      }

      if (result?.data) {
        setData(prev => ({ ...prev, [tab]: result.data }));
      }
    } catch (err) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Live Clock Interval
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  }, [activeTab]);

  /* ─── Action Handlers ─── */
  const toggleReviewApproval = async (id, currentStatus) => {
    const { error } = await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
    if (!error) {
      showToast(`Review ${!currentStatus ? 'approved' : 'unapproved'}`, 'success');
      fetchData('reviews');
      fetchStats();
    }
  };

  const deleteItem = async (table, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      showToast('Item deleted', 'success');
      fetchData(activeTab);
      fetchStats();
    }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', background: 'var(--mild-accent6)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '300px',
        background: 'var(--oxford-deep)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '48px', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--saffron) 0%, #FFB067 100%)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(255, 153, 51, 0.25)'
            }}>
              <ShieldCheck color="var(--oxford)" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>CV Admin</div>
              <div style={{ color: 'var(--saffron)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>CONTROL PANEL</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarItem id="overview" label="Dashboard Overview" icon={LayoutDashboard} active={activeTab === 'overview'} onClick={setActiveTab} />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '24px 8px' }} />
          <SidebarItem id="users" label="User Management" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
          <SidebarItem id="colleges" label="College Directory" icon={School} active={activeTab === 'colleges'} onClick={setActiveTab} />
          <SidebarItem id="reviews" label="Reviews & Ratings" icon={MessageSquare} active={activeTab === 'reviews'} onClick={setActiveTab} />
          <SidebarItem id="threads" label="Forum Content" icon={FileText} active={activeTab === 'threads'} onClick={setActiveTab} />
        </nav>


      </aside>


      <main style={{ marginLeft: '300px', flex: 1, padding: '48px', minWidth: 0, transition: 'padding 0.3s ease' }}>


        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--oxford)', marginBottom: '4px' }}>
              {activeTab === 'overview' && 'Administrative Overview'}
              {activeTab === 'users' && 'Manage Users'}
              {activeTab === 'colleges' && 'College Directory Management'}
              {activeTab === 'reviews' && 'Review Moderation'}
              {activeTab === 'threads' && 'Forum Content Management'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '21px' }}>
              {activeTab === 'overview' && 'Monitor platform growth and activity in real-time.'}
              {activeTab !== 'overview' && `Currently viewing all ${activeTab} records.`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              background: '#fff', padding: '10px 18px', borderRadius: '12px',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                <Calendar size={18} color="#3b82f6" />
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--oxford)', fontSize: '15px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                <Clock size={18} color="#10b981" />
                {currentTime.toLocaleTimeString('en-US', { hour12: true })}
              </div>
            </div>
          </div>
        </header>


        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--oxford)" />
              <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--oxford)' }}>Platform Metrics</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
              {[
                { label: 'Registered Users', val: stats.totalUsers, icon: Users, color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
                { label: 'Institutions', val: stats.totalColleges, icon: School, color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' },
                { label: 'Total Courses', val: stats.totalCourses, icon: BookOpen, color: '#8b5cf6', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' },
              ].map((s, idx) => (
                <div key={`core-${idx}`} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', border: `1px solid ${s.color}30`, background: s.bg, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div style={{ color: '#475569', fontSize: '14px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                      <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--oxford)' }}>{s.val.toLocaleString()}</div>
                    </div>
                    <div style={{
                      width: '54px', height: '54px', borderRadius: '14px',
                      background: '#fff', color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 12px ${s.color}20`
                    }}>
                      <s.icon size={28} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ color: '#475569', fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform Health & Moderation</div>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              {[
                { label: 'Admin Staff', val: stats.adminUsers, icon: ShieldAlert, color: '#3b82f6' },
                { label: 'Verified Accounts', val: stats.verifiedUsers, icon: UserCheck, color: '#10b981' },
                { label: 'Blocked Accounts', val: stats.blockedUsers, icon: Lock, color: '#ef4444' },
                { label: 'Featured Colleges', val: stats.featuredColleges, icon: Award, color: '#eab308' },
                { label: 'Pending Reviews', val: stats.pendingReviews, icon: MessageSquare, color: '#f59e0b' },
                { label: 'Approved Reviews', val: stats.approvedReviews, icon: Star, color: '#8b5cf6' },
                { label: 'Open Threads', val: stats.openThreads, icon: FileText, color: '#14b8a6' },
                { label: 'Closed Threads', val: stats.closedThreads, icon: XCircle, color: '#64748b' },
              ].map((s, idx) => (
                <div key={`mod-${idx}`} className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--oxford)' }}>{s.val.toLocaleString()}</div>
                    </div>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: `${s.color}15`, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <s.icon size={20} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: s.color, opacity: 0.8 }} />
                </div>
              ))}
            </div>
          </div>
        )}


        {activeTab !== 'overview' && (
          <>
            {activeTab === 'users' ? (
              <UserManagement />
            ) : activeTab === 'colleges' ? (
              <CollegeManagement />
            ) : activeTab === 'reviews' ? (
              <ReviewManagement />
            ) : activeTab === 'threads' ? (
              <ThreadManagement />
            ) : (
              <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
                {loading ? (
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Fetching records...</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                      </tr>
                    </thead>
                    <tbody>
                      {data[activeTab].map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fcfcfc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!loading && data[activeTab].length === 0 && (
                  <div style={{ padding: '80px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No records found in this category.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

    </div>
  );
}

const thStyle = { padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '16px 24px', fontSize: '14px', color: 'var(--text-primary)' };
const btnIconStyle = { width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' };
const btnDelStyle = { ...btnIconStyle, border: '1px solid #fee2e2', color: '#ef4444' };
