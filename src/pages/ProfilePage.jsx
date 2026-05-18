import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/hooks/supabase';
import { useAuth } from '../lib/auth/core/useAuth';
import { useLocation, Link } from 'react-router-dom';
import { profileSchema } from '../lib/auth/components/validation';
import { User, Mail, MapPin, GraduationCap, Info, Bookmark } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useUserReviews, useUserThreads, useUserReplies, useUserSavedColleges } from '../hooks/useColleges';
import { Trash2, ExternalLink, Lock } from 'lucide-react';
import { generateAvatarUrl } from '../lib/hooks/avatarUtils';
import Pagination from '../components/Pagination';
export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasExistingUsername, setHasExistingUsername] = useState(false);
  const { showToast } = useToast();

  const [activeActivityTab, setActiveActivityTab] = useState('reviews');
  const [activityOrder, setActivityOrder] = useState('desc');
  const [reviewPage, setReviewPage] = useState(1);
  const [threadPage, setThreadPage] = useState(1);
  const [replyPage, setReplyPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);

  const { reviews, totalPages: rTotal, loading: rLoading, deleteReview } = useUserReviews(user?.id, { page: reviewPage, pageSize: 10, order: activityOrder });
  const { threads, totalPages: tTotal, loading: tLoading, deleteThread } = useUserThreads(user?.id, { page: threadPage, pageSize: 10, order: activityOrder });
  const { replies, totalPages: repTotal, loading: repLoading, deleteReply } = useUserReplies(user?.id, { page: replyPage, pageSize: 10, order: activityOrder });
  const { colleges: savedColleges, totalPages: sTotal, loading: sLoading, removeSaved } = useUserSavedColleges(user?.id, { page: savedPage, pageSize: 10 });

  // Reset pagination when sort order changes
  useEffect(() => {
    setReviewPage(1);
    setThreadPage(1);
    setReplyPage(1);
    setSavedPage(1);
  }, [activityOrder]);

  const handleDeleteReview = async (id) => {
    const { error } = await deleteReview(id);
    if (error) showToast(error, 'error');
    else showToast('Review deleted', 'success');
  };

  const handleDeleteThread = async (id) => {
    const { error } = await deleteThread(id);
    if (error) showToast(error, 'error');
    else showToast('Thread deleted', 'success');
  };

  const handleDeleteReply = async (id) => {
    const { error } = await deleteReply(id);
    if (error) showToast(error, 'error');
    else showToast('Reply deleted', 'success');
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
  });



  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (data) {
          let currentAvatar = data.avatar_url || '';


          setHasExistingUsername(!!data.username);

          reset({
            username: data.username || '',
            full_name: data.full_name || '',
            bio: data.bio || '',
            current_college: data.current_college || '',
            graduation_year: data.graduation_year ?? null,
            state: data.state || '',
            city: data.city || '',
            avatar_url: currentAvatar,
            gender: data.gender || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, reset]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, 'warning');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  const onSubmit = async (data) => {
    if (!user) return;
    setUpdating(true);
    try {
      // 1. Generate Avatar URL based on Gender before saving (Frontend-only)
      const avatarUrl = generateAvatarUrl(user.id, data.gender);

      // 2. Prepare payload: ensure username is included for not-null constraint
      // and sanitize graduation_year
      const payload = {
        ...data,
        avatar_url: avatarUrl,
        graduation_year: data.graduation_year ? Number(data.graduation_year) : null,
        id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      await refreshProfile();
      showToast('Profile updated successfully!', 'success');
      reset({ ...data, avatar_url: avatarUrl });

    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.message?.includes('profiles_username_key')) {
        showToast('This username is already taken. Please choose another one.', 'error');
      } else {
        showToast(err.message || 'Failed to update profile.', 'error');
      }
    } finally {
      setUpdating(false);
    }
  };

  const onValidationError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError && firstError.message) {
      showToast(firstError.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px' }} />
          <div className="skeleton" style={{ width: 250, height: 32, borderRadius: '8px', margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: 180, height: 20, borderRadius: '8px', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px', marginTop: '3rem', background: 'var(--mild-accent6)', borderRadius: 'var(--r-xl)' }}>
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

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <header style={{
          padding: '32px 40px',
          borderRadius: 'var(--r-2xl)',
          background: 'linear-gradient(135deg, var(--oxford-deep) 0%, var(--oxford) 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--saffron)', marginBottom: '8px', fontSize: '2.5rem', fontWeight: 700 }}>My Profile</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Manage your academic identity, track your contributions, and view your saved colleges.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit, onValidationError)}>
          <div className="profile-grid">
            <aside>
              <div className="card" style={{ padding: '24px', textAlign: 'center', position: 'sticky', top: '100px', background: 'var(--saffron-light' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                  {watch('avatar_url') ? (
                    <img
                      src={watch('avatar_url')}
                      alt="User Avatar"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--surface-muted)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--border)' }}>
                      <User size={60} color="var(--text-muted)" />
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--oxford)', marginBottom: '4px' }}>
                  {watch('full_name') || user?.email?.split('@')[0]}
                </h3>

                {watch('username') && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--saffron)', fontWeight: 600, marginBottom: '12px' }}>
                    @{watch('username')}
                  </p>
                )}

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>
                  {watch('current_college') ? `Student at ${watch('current_college')}` : 'India'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Joined {new Date(user?.created_at || '').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden' }}>
                      <Mail size={16} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
                    </div>
                  </div>
                  {(watch('city') || watch('state')) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <MapPin size={16} />
                      <span>{[watch('city'), watch('state')].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {watch('graduation_year') && (
                    <div style={{ display: 'flex', alignItems: 'center',justifyContent:'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <GraduationCap size={16} />
                      <span>Class of {watch('graduation_year')}</span>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ padding: '32px', background: 'var(--saffron-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <User size={20} style={{ color: 'var(--oxford)' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--oxford)' }}>Personal Identity</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '16px' }}>
                    <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      padding: '16px',
                      background: '#fff',
                      borderRadius: 'var(--r-lg)',
                      border: '1.5px solid var(--border)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail size={18} style={{ color: 'var(--oxford)' }} />
                        <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.email}</span>
                      </div>
                      <Link
                        to="/auth/change-email"
                        style={{
                          fontSize: '14px',
                          color: '#fff',
                          fontWeight: 600,
                          textDecoration: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: 'var(--oxford)',
                          width: 'fit-content',
                          boxShadow: '0 2px 4px rgba(0,33,71,0.15)',
                          textAlign: 'center'
                        }}
                      >
                        Change Account Email
                      </Link>
                    </div>
                  </div>
                  <div className="form-group" >
                    <label className="label" style={{ fontSize: "1.15rem", display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      Username
                      {hasExistingUsername && <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
                      <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <input
                      {...register('username')}
                      className="input"
                      placeholder="john_doe"
                      readOnly={hasExistingUsername}
                      style={{
                        background: hasExistingUsername ? 'var(--surface-muted)' : 'transparent',
                        cursor: hasExistingUsername ? 'not-allowed' : 'text',
                        opacity: hasExistingUsername ? 0.8 : 1
                      }}
                    />
                    {hasExistingUsername && (
                      <p style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '4px' }}>
                        Username cannot be changed once set.
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>Full Name <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input {...register('full_name')} className="input" placeholder="John Doe" />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>Gender <span style={{ color: 'var(--red)' }}>*</span></label>
                  <select {...register('gender')} className="input" style={{ appearance: 'auto' }}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>Bio</label>
                  <textarea {...register('bio')} className="input" rows={3} placeholder="Tell us about yourself..." style={{ height: 'auto', paddingTop: '10px' }} />
                </div>
              </div>

              <div className="card" style={{ padding: '32px', background: 'var(--saffron-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <GraduationCap size={20} style={{ color: 'var(--oxford)' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--oxford)' }}>Academic Background</h2>
                </div>
                <div className="form-group">
                  <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>Current College / University</label>
                  <input {...register('current_college')} className="input" placeholder="e.g. IIT Delhi" />
                </div>
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>Graduation Year</label>
                  <input
                    type="number"
                    {...register('graduation_year')}
                    className="input"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="card" style={{ padding: '32px', background: 'var(--saffron-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <MapPin size={20} style={{ color: 'var(--oxford)' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Location Details</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>State <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input {...register('state')} className="input" placeholder="e.g. Delhi" />
                  </div>
                  <div className="form-group">
                    <label className="label" style={{ fontSize: "1.15rem", color: 'var(--text-primary)' }}>City <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input {...register('city')} className="input" placeholder="e.g. New Delhi" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => reset()} disabled={!isDirty || updating}>Discard</button>
                <button type="submit" className="btn btn-primary" disabled={!isDirty || updating} style={{ minWidth: '160px' }}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </main>

            <aside className="activity-feed">
              <div className="card" style={{ padding: '24px', minHeight: '600px', display: 'flex', flexDirection: 'column', position: 'sticky', top: '100px', background: 'var(--saffron-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={20} style={{ color: 'var(--oxford)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Activity</h2>
                  </div>

                  {activeActivityTab !== 'saved' && (
                    <select
                      value={activityOrder}
                      onChange={(e) => setActivityOrder(e.target.value)}
                      style={{
                        padding: '6px 10px', borderRadius: '8px', fontSize: '14px', border: '1px solid var(--border)',
                        background: 'var(--surface-muted)', cursor: 'pointer', fontWeight: 600, color: 'var(--oxford)'
                      }}
                    >
                      <option value="desc">Latest</option>
                      <option value="asc">Oldest</option>
                    </select>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--surface-muted)', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
                  {['reviews', 'threads', 'replies', 'saved'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveActivityTab(t)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '6px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: activeActivityTab === t ? 'var(--saffron-light)' : 'transparent',
                        color: activeActivityTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                        boxShadow: activeActivityTab === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        textTransform: 'capitalize'
                      }}
                    >
                      {t === 'saved' ? 'Saved' : t}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '4px', background: 'var(--surface-muted)', borderRadius: 'var(--r-md)' }}>
                  {activeActivityTab === 'reviews' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rLoading ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>Loading...</div>
                      ) : reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 600 }}>
                          No reviews yet.
                        </div>
                      ) : (
                        <>
                          {reviews.map(r => (
                            <div key={r.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{r.title}</h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.college?.short_name || r.college?.name}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '11px' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                <button type="button" onClick={() => handleDeleteReview(r.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                          <Pagination page={reviewPage} totalPages={rTotal} onChange={setReviewPage} />
                        </>
                      )}
                    </div>
                  )}

                  {activeActivityTab === 'threads' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tLoading ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>Loading...</div>
                      ) : threads.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 600 }}>
                          No threads yet.
                        </div>
                      ) : (
                        <>
                          {threads.map(t => (
                            <div key={t.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{t.title}</h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.college?.short_name || t.college?.name}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '11px' }}>{new Date(t.created_at).toLocaleDateString()}</span>
                                <button type="button" onClick={() => handleDeleteThread(t.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                          <Pagination page={threadPage} totalPages={tTotal} onChange={setThreadPage} />
                        </>
                      )}
                    </div>
                  )}

                  {activeActivityTab === 'replies' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {repLoading ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>Loading...</div>
                      ) : replies.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 600 }}>
                          No replies yet.
                        </div>
                      ) : (
                        <>
                          {replies.map(rep => (
                            <div key={rep.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                              <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                "{rep.body}"
                              </p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Re: {rep.thread?.title}</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <span style={{ fontSize: '11px' }}>{new Date(rep.created_at).toLocaleDateString()}</span>
                                <button type="button" onClick={() => handleDeleteReply(rep.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                          <Pagination page={replyPage} totalPages={repTotal} onChange={setReplyPage} />
                        </>
                      )}
                    </div>
                  )}

                  {activeActivityTab === 'saved' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {sLoading ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>Loading...</div>
                      ) : savedColleges.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 600 }}>
                          No saved colleges.
                        </div>
                      ) : (
                        <>
                          {savedColleges.map(c => (
                            <div key={c.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff' }}>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--oxford)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                  {c.logo_url ? <img src={c.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : (c.short_name || c.name).slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h4>
                                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.city}, {c.state}</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--surface-muted)' }}>
                                <Link to={`/college/${c.slug}`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--oxford)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  Visit Page <ExternalLink size={12} />
                                </Link>
                                <button type="button" onClick={() => removeSaved(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                                  <Bookmark size={16} fill="var(--saffron)" color="var(--saffron)" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <Pagination page={savedPage} totalPages={sTotal} onChange={setSavedPage} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </form>

        <style>{`
         .profile-grid { display: grid; grid-template-columns: 300px 1fr 380px; gap: 32px; }
         @media (max-width: 1200px) { .profile-grid { grid-template-columns: 300px 1fr; } .activity-feed { grid-column: span 2; } }
         @media (max-width: 850px) { .profile-grid { grid-template-columns: 1fr; } .activity-feed { grid-column: span 1; } }
      `}</style>
      </div>
    </div>
  );
}
