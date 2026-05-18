import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useColleges, useSavedColleges } from '../hooks/useColleges';
import { useAuth } from '../lib/auth/core/useAuth';
import CollegeCard from '../components/CollegeCard';
import { useToast } from '../components/Toast';
import { LayoutGrid, List, Search, Filter, BookOpenText, University, MapPin } from 'lucide-react';

const PAGE_SIZE = 16;

const SORT_OPTIONS = [
  { value: 'nirf_ranking', label: 'NIRF Rank (Best First)', },
  { value: 'avg_rating', label: 'Highest Rated', },
  { value: 'avg_package_lpa', label: 'Highest Package', },
  { value: 'avg_annual_fees_asc', label: 'Lowest Fees', },
  { value: 'avg_annual_fees_desc', label: 'Highest Fees', },
  { value: 'total_reviews', label: 'Most Reviewed', },
];

const COLLEGE_TYPES = [
  'IIT', 'IIM', 'NIT', 'AIIMS',
  'Central University', 'State University',
  'Deemed', 'Private', 'Government', 'Autonomous',
];

const STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu',
  'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'West Bengal',
  'Telangana', 'Kerala', 'Madhya Pradesh', 'Andhra Pradesh',
];

const EXAMS = [
  { value: 'JEE Advanced', label: 'JEE Advanced', tag: 'Engineering' },
  { value: 'JEE Main', label: 'JEE Main', tag: 'Engineering' },
  { value: 'NEET', label: 'NEET', tag: 'Medical' },
  { value: 'CAT', label: 'CAT', tag: 'Management' },
  { value: 'GATE', label: 'GATE', tag: 'PG Engg' },
  { value: 'XAT', label: 'XAT', tag: 'Management' },
  { value: 'CLAT', label: 'CLAT', tag: 'Law' },
  { value: 'CUET', label: 'CUET', tag: 'Central Univ' },
  { value: 'NATA', label: 'NATA', tag: 'Architecture' },
  { value: 'MAT', label: 'MAT', tag: 'Management' },
];

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const WINDOW = 2;
  const rawPages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - WINDOW && p <= page + WINDOW)) {
      rawPages.push(p);
    }
  }
  const items = [];
  for (let i = 0; i < rawPages.length; i++) {
    if (i > 0 && rawPages[i] - rawPages[i - 1] > 1) items.push('…');
    items.push(rawPages[i]);
  }

  const PageBtn = ({ children, target, disabled = false, active = false }) => (
    <button
      onClick={() => !disabled && target && onChange(target)}
      disabled={disabled}
      style={{
        minWidth: 40, height: 40,
        borderRadius: 'var(--r-md)',
        border: active ? '2px solid var(--oxford)' : '1.5px solid var(--border)',
        background: active ? 'var(--oxford)' : disabled ? 'transparent' : '#fff',
        color: active ? '#fff' : disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: 'var(--font-ui)', fontWeight: active ? 700 : 500, fontSize: 14,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 8px',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {children}
    </button>
  );

  return (
    <nav aria-label="Pagination" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, marginTop: 40, flexWrap: 'wrap',
    }}>
      <PageBtn target={page - 1} disabled={page === 1}>‹ Prev</PageBtn>
      {items.map((item, idx) =>
        item === '…'
          ? <span key={`e${idx}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 14 }}>…</span>
          : <PageBtn key={item} target={item} active={item === page}>{item}</PageBtn>
      )}
      <PageBtn target={page + 1} disabled={page === totalPages}>Next ›</PageBtn>
    </nav>
  );
}

export default function CollegesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('nirf_ranking');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [stateFilter, setStateFilter] = useState('');
  const [examFilter, setExamFilter] = useState(searchParams.get('exam') || '');
  const { user } = useAuth();
  const { showToast } = useToast();
  const { savedIds: savedColleges, toggleSave: toggleSavePersisted } = useSavedColleges(user?.id);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setTypeFilter(searchParams.get('type') || '');
    setExamFilter(searchParams.get('exam') || '');
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [search, sortBy, typeFilter, stateFilter, examFilter]);

  const { colleges, loading, error, totalCount, totalPages } = useColleges({
    sortBy, search, collegeType: typeFilter, state: stateFilter,
    examFilter, page, pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const el = document.getElementById('colleges-results');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  const toggleSave = async (id) => {
    if (!user) {
      showToast('Please sign in to save colleges', 'warning');
      return;
    }
    await toggleSavePersisted(id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(p => { p.set('search', search); return p; });
  };

  const clearFilters = () => {
    setSearch(''); setTypeFilter(''); setStateFilter('');
    setExamFilter(''); setSortBy('nirf_ranking');
    setSearchParams({});
  };

  const hasFilters = search || typeFilter || stateFilter || examFilter;
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);
  const countLabel = loading ? 'Loading…'
    : totalCount === 0 ? 'No colleges found'
      : `${totalCount} colleges found`;

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

        <div style={{
          background: 'linear-gradient(135deg, var(--oxford-deep) 0%, var(--oxford) 100%)',
          padding: '48px 0 32px',
        }}>
          <div className="container">
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 40, fontWeight: 700,
              color: '#fff', marginBottom: 6,
            }}>
              Colleges Catered to You
            </h1>
            <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span>{countLabel}</span>
              {typeFilter && <span style={{ background: 'rgba(255,153,51,0.2)', color: 'var(--saffron)', padding: '1px 10px', borderRadius: 'var(--r-full)', fontWeight: 600, fontSize: 13 }}>{typeFilter}</span>}
              {stateFilter && <span style={{ background: 'rgba(255,153,51,0.2)', color: 'var(--saffron)', padding: '1px 10px', borderRadius: 'var(--r-full)', fontWeight: 600, fontSize: 13 }}>{stateFilter}</span>}
              {examFilter && <span style={{ background: 'rgba(255,153,51,0.2)', color: 'var(--saffron)', padding: '1px 10px', borderRadius: 'var(--r-full)', fontWeight: 600, fontSize: 13 }}>{examFilter}</span>}
            </p>

            <form onSubmit={handleSearch} style={{
              display: 'flex', background: '#fff',
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
              maxWidth: 620, boxShadow: 'var(--shadow-lg)',
            }}>
              <span style={{ padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 18, color: 'var(--text-muted)' }}><Search /></span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, city, or entrance exam..."
                style={{
                  flex: 1, height: 52, border: 'none', outline: 'none',
                  fontSize: 17, fontFamily: 'var(--font-ui)',
                  color: 'var(--text-primary)', background: 'transparent',
                }}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} style={{
                  padding: '0 12px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)',
                }}>✕</button>
              )}
              <button type="submit" className="btn btn-saffron" style={{
                margin: 6, borderRadius: 'var(--r-lg)',
                height: 40, padding: '0 16px', fontSize: 16, fontWeight: 700,
              }}>
                Search
              </button>
            </form>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xs)',
          position: 'sticky', top: 'var(--nav-h)', zIndex: 20,
        }}>
          <div className="container" style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24, padding: '14px 24px',
            minHeight: '72px', flexWrap: 'wrap',
          }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 280 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--oxford)', whiteSpace: 'nowrap' }}>
                Sort by:
              </span>
              <div style={{
                display: 'flex', gap: 10, overflowX: 'auto', flex: 1,
                paddingBottom: 6, scrollbarWidth: 'none', msOverflowStyle: 'none',
              }}>
                {SORT_OPTIONS.map(o => {
                  const active = sortBy === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => setSortBy(o.value)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        height: 42, padding: '0 20px',
                        borderRadius: 'var(--r-full)',
                        border: active ? '2px solid var(--oxford)' : '1.5px solid var(--border)',
                        background: active ? 'var(--oxford)' : '#fff',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: active ? 700 : 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        boxShadow: active ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      <span>{o.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
              <div style={{ width: 1, height: 36, background: 'var(--border)', margin: '0 4px' }} />
              {!loading && totalCount > 0 && (
                <span style={{ fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{rangeStart}–{rangeEnd}</span>
                  {' '}of{' '}
                  <strong style={{ color: 'var(--oxford)' }}>{totalCount}</strong>
                </span>
              )}
              <div style={{
                display: 'flex', gap: 6,
                background: '#f8f9fa', padding: 4,
                borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
              }}>
                {['grid', 'list'].map(m => (
                  <button key={m} onClick={() => setViewMode(m)} title={m === 'grid' ? 'Grid view' : 'List view'} style={{
                    width: 36, height: 36, borderRadius: 'var(--r-md)', border: 'none',
                    background: viewMode === m ? 'var(--saffron)' : 'transparent',
                    color: viewMode === m ? 'var(--oxford)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: viewMode === m ? 'var(--shadow-sm)' : 'none',
                  }}>
                    {m === 'grid' ? <LayoutGrid size={18} /> : <List size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '32px 24px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 36, alignItems: 'start' }}>


            <aside style={{ position: 'sticky', top: 'calc(var(--nav-h) + 72px + 16px)' }}>

              <div style={{
                background: '#fff',
                borderRadius: 'var(--r-xl)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
               
              }}>


                <div style={{
                  padding: '20px 22px 16px',
                  borderBottom: '2px solid var(--border)',
                  background: 'linear-gradient(135deg, var(--oxford-deep) 0%, var(--oxford) 100%)',
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 'var(--r-md)',
                        background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}> <Filter /> </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                          Filters
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontWeight: 500 }}>
                          Narrow down your results
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                      {hasFilters && (
                        <button onClick={clearFilters} style={{
                          fontSize: 14, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--r-full)',
                          padding: '4px 12px', cursor: 'pointer', fontWeight: 600,
                          transition: 'all 0.15s',
                        }}>
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {hasFilters && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                      {examFilter && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'rgba(255,153,51,0.25)', color: 'var(--saffron)',
                          border: '1px solid rgba(255,153,51,0.4)',
                          borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 600,
                          padding: '3px 10px',
                        }}>
                          {examFilter}
                          <button onClick={() => setExamFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--saffron)', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                        </span>
                      )}
                      {typeFilter && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600,
                          padding: '3px 10px',
                        }}>
                          {typeFilter}
                          <button onClick={() => setTypeFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                        </span>
                      )}
                      {stateFilter && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600,
                          padding: '3px 10px',
                        }}>
                          {stateFilter}
                          <button onClick={() => setStateFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{
                  overflowY: 'auto',
                  flex: 1,
                  padding: '0',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#c4c9d4 transparent',
                }}>


                  <div style={{ padding: '20px 22px 4px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                      paddingBottom: 10, borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--r-sm)',
                        background: 'white', border: '3px solid var(--oxford)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}><BookOpenText /></div>
                      <div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                          Entrance Exam
                        </div>
                        <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4, }}>
                          Filter by accepted exam
                        </div>
                      </div>

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                      {EXAMS.map(({ value, label, icon, tag }) => {
                        const active = examFilter === value;
                        return (
                          <label
                            key={value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: 'var(--r-lg)',
                              cursor: 'pointer',
                              background: active ? 'rgba(0,33,71,0.06)' : 'transparent',
                              borderLeft: active ? '3px solid var(--oxford)' : '3px solid transparent',
                              transition: 'all 0.13s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <input
                                type="radio"
                                name="exam_filter"
                                checked={active}
                                onChange={() => setExamFilter(active ? '' : value)}
                                style={{ accentColor: 'var(--oxford)', width: 18, height: 18, flexShrink: 0 }}
                              />
                              <span style={{
                                fontSize: 16,
                                fontWeight: active ? 700 : 500,
                                color: active ? 'var(--oxford)' : 'var(--text-secondary)'
                              }}>
                                {label}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '3px 9px',
                              borderRadius: 'var(--r-full)',
                              background: active ? 'var(--oxford)' : 'var(--surface-muted)',
                              color: active ? 'white' : 'var(--text-muted)',
                            }}>
                              {tag}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>


                  <div style={{ padding: '20px 22px 4px', borderTop: '1px solid var(--surface-muted)' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                      paddingBottom: 10, borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--r-sm)',
                        background: 'white', border: '3px solid var(--oxford)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}><University /></div>
                      <div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                          College Type
                        </div>
                        <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
                          Filter by institution category
                        </div>
                      </div>

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                      {COLLEGE_TYPES.map(t => {
                        const active = typeFilter === t;
                        return (
                          <label key={t} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 'var(--r-lg)',
                            cursor: 'pointer',
                            background: active ? 'rgba(0,33,71,0.06)' : 'transparent',
                            borderLeft: active ? '3px solid var(--oxford)' : '3px solid transparent',
                            transition: 'all 0.13s',
                          }}>
                            <input
                              type="radio"
                              name="college_type"
                              checked={active}
                              onChange={() => setTypeFilter(active ? '' : t)}
                              style={{ accentColor: 'var(--oxford)', width: 18, height: 18, flexShrink: 0 }}
                            />
                            <span style={{
                              fontSize: 18, fontWeight: active ? 700 : 500,
                              color: active ? 'var(--oxford)' : 'var(--text-secondary)',
                            }}>
                              {t}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ padding: '20px 22px 24px', borderTop: '1px solid var(--surface-muted)' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                      paddingBottom: 10, borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--r-sm)',
                        background: 'white', border: '3px solid var(--oxford)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}><MapPin /></div>
                      <div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                          State / Region
                        </div>
                        <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
                          Filter by college location
                        </div>
                      </div>

                    </div>

                    <select
                      value={stateFilter}
                      onChange={e => setStateFilter(e.target.value)}
                      className="input select"
                      style={{ height: 48, fontSize: 18, fontWeight: 500 }}
                    >
                      <option value="">All States</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                </div>
              </div>
            </aside>

            <main id="colleges-results">
              {error && (
                <div style={{
                  background: 'var(--red-bg)', border: '1px solid #fca5a5',
                  borderRadius: 'var(--r-lg)', padding: '16px 20px',
                  marginBottom: 20, color: 'var(--red)', fontSize: 14,
                }}>
                  Failed to load colleges. Please check your connection.
                </div>
              )}

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(320px,1fr))' : '1fr', gap: 16, backgroundColor: 'white', }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--r-xl)' }} />
                  ))}
                </div>
              ) : colleges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🔎</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    No colleges found
                  </h3>
                  <p style={{ fontSize: 14 }}>Try adjusting your search or filters.</p>
                  <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: 24 }}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    backgroundColor: 'var(--oxford-light)',
                    padding: '14px',
                    borderRadius: '10px',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(320px,1fr))' : '1fr',
                    gap: 16,
                  }}>
                    {colleges.map((c, i) => (
                      <div key={c.id} className="animate-in" style={{ animationDelay: `${i * 35}ms` }}>
                        <CollegeCard college={c} isSaved={savedColleges.includes(c.id)} onSave={toggleSave} />
                      </div>
                    ))}
                  </div>

                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />

                  {totalPages > 1 && (
                    <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                      Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of {totalPages}
                      &ensp;·&ensp;
                      Showing {rangeStart}–{rangeEnd} of {totalCount} colleges
                    </p>
                  )}
                </>
              )}
            </main>

          </div>
        </div>
      </div>
    </div>
  )
}
