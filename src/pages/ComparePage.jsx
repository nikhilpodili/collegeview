import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/hooks/supabase';
import StarRating from '../components/StarRating';
import { useCollegeReviewStats } from '../hooks/useColleges';
function DynamicRating({ collegeId, fallbackRating, dimension = 'overall' }) {
  const { stats, loading } = useCollegeReviewStats(collegeId);

  if (loading) return <div className="skeleton" style={{ width: 40, height: 18, borderRadius: 4 }} />;

  const val = stats ? parseFloat(stats[dimension]) : fallbackRating;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      <span style={{ fontWeight: 700 }}>{val > 0 ? val.toFixed(1) : '—'}</span>
      <StarRating rating={val} size={12} />
    </div>
  );
}

const fmtPkg = (v) => v ? (v >= 100 ? `${parseFloat((v / 100).toFixed(2))} Cr` : `${v} LPA`) : '—';

const PARAMETERS = [
  {
    section: 'General', fields: [
      { label: 'Type', key: 'college_type' },
      { label: 'Ownership', key: 'ownership' },
      { label: 'Established', key: 'established_year' },
      { label: 'Location', key: 'location', render: (c) => `${c.city}, ${c.state}` },
    ]
  },
  {
    section: 'Academic', fields: [
      { label: 'NIRF Rank', key: 'nirf_ranking', render: (c) => c.nirf_ranking ? `#${c.nirf_ranking}` : '—' },
      { label: 'NAAC Grade', key: 'naac_grade' },
      { label: 'Avg Rating', key: 'avg_rating', render: (c) => <DynamicRating collegeId={c.id} fallbackRating={c.avg_rating} /> },
      { label: 'Academics', render: (c) => <DynamicRating collegeId={c.id} fallbackRating={c.avg_academic_rating} dimension="academic" /> },
      { label: 'Infrastructure', render: (c) => <DynamicRating collegeId={c.id} fallbackRating={c.avg_infrastructure_rating} dimension="infra" /> },
      { label: 'Faculty', render: (c) => <DynamicRating collegeId={c.id} fallbackRating={c.avg_faculty_rating} dimension="faculty" /> },
    ]
  },
  {
    section: 'Placement', fields: [
      { label: 'Avg Package', key: 'avg_package_lpa', render: (c) => fmtPkg(c.avg_package_lpa) },
      { label: 'Highest Package', key: 'highest_package_lpa', render: (c) => fmtPkg(c.highest_package_lpa) },
      { label: 'Placement Rate', key: 'placement_rate_pct', render: (c) => c.placement_rate_pct ? `${c.placement_rate_pct}%` : '—' },
    ]
  },
  {
    section: 'Fees (Annual)', fields: [
      { label: 'Avg Annual Fees', key: 'avg_annual_fees', render: (c) => c.avg_annual_fees ? `₹${(c.avg_annual_fees / 100000).toFixed(1)}L` : '—' },
      { label: 'Hostel Fees', key: 'hostel_fees_per_year', render: (c) => c.hostel_fees_per_year ? `₹${(c.hostel_fees_per_year / 1000).toFixed(0)}K` : '—' },
    ]
  },
  {
    section: 'Infrastructure', fields: [
      { label: 'Campus Size', key: 'campus_area_acres', render: (c) => c.campus_area_acres ? `${c.campus_area_acres} Acres` : '—' },
      { label: 'Library', key: 'has_library', render: (c) => c.has_library ? '✅' : '❌' },
      { label: 'Wi-Fi', key: 'has_wifi', render: (c) => c.has_wifi ? '✅' : '❌' },
      { label: 'Hostel', key: 'has_hostel', render: (c) => c.has_hostel ? '✅' : '❌' },
    ]
  },
];

function CollegeSearch({ onSelect, onClear, selectedCollege }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('colleges')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);
      setResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (selectedCollege) {
    return (
      <div style={{
        padding: '12px', background: '#fff', borderRadius: '12px', border: '2px solid var(--oxford)',
        display: 'flex', alignItems: 'center', gap: 10, position: 'relative'
      }}>
        <div style={{ width: 32, height: 32, background: 'var(--oxford)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
          {selectedCollege.logo_url ? <img src={selectedCollege.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedCollege.short_name?.[0] || 'C'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--oxford)' }}>{selectedCollege.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedCollege.city}, {selectedCollege.state}</div>
        </div>
        <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>✕</button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setShowResults(true); }}
        onFocus={() => setShowResults(true)}
        placeholder="Search college..."
        style={{
          width: '100%', height: '48px', padding: '0 16px', borderRadius: '12px',
          border: '1px solid var(--border)', fontSize: 14, outline: 'none',
        }}
      />
      {showResults && (query.length >= 2 || results.length > 0) && (
        <div style={{
          position: 'absolute', top: '105%', left: 0, right: 0, background: '#fff',
          borderRadius: '12px', zIndex: 100,
          border: '1px solid var(--saffron-light)', overflow: 'hidden'
        }}>
          {loading && <div style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>No results found</div>
          )}
          {results.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setShowResults(false); setQuery(''); }}
              style={{
                width: '100%', padding: '10px 14px', border: 'none', background: 'none',
                textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: 24, height: 24, background: 'var(--oxford)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>
                {c.short_name?.[0] || 'C'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.city}, {c.state}</div>
              </div>
            </button>
          ))}
        </div>
      )
      }
    </div >
  );
}

export default function ComparePage() {
  const [colleges, setColleges] = useState([null, null, null, null, null]);

  const setCollegeAt = (index, college) => {
    const newColleges = [...colleges];
    newColleges[index] = college;
    setColleges(newColleges);
  };

  const activeCollegesCount = colleges.filter(Boolean).length;

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
      <div className="container" style={{ marginTop: '2rem' }}>
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
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--saffron)', marginBottom: '8px', fontSize: '2.5rem', fontWeight: 700 }}>Compare Colleges</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Choose up to 5 colleges to compare side-by-side and find the best one for you.
            </p>
          </div>
        </header>
      </div>

      <div className="container" style={{ padding: '0 24px', marginBottom: '4rem' }}>
        <div style={{
          background: 'var(--saffron)',
          borderRadius: 'var(--r-2xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '240px repeat(5, 280px)',
              background: 'var(--border)',
              gap: '1px',
              minWidth: 'fit-content'
            }}>


              <div style={{
                position: 'sticky',
                top: 'var(--nav-h)',
                left: 0,
                zIndex: 30,
                background: 'var(--oxford)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '2px solid var(--border)',
                borderBottom: '2px solid var(--border)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, fontWeight: 600, color: "var(--saffron" }}>Compare</div>

              </div>
              {colleges.map((c, idx) => (
                <div key={idx} style={{
                  position: 'sticky',
                  top: 'var(--nav-h)',
                  zIndex: 25,
                  background: 'var(--oxford)',
                  padding: '16px',
                  borderLeft: '1px solid var(--border)',
                  borderBottom: '2px solid var(--border)',
                }}>
                  <CollegeSearch
                    selectedCollege={c}
                    onSelect={(selected) => setCollegeAt(idx, selected)}
                    onClear={() => setCollegeAt(idx, null)}
                  />
                  {c && (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <Link to={`/college/${c.slug}`} style={{ fontSize: 12, fontWeight: 700, color: 'var(--saffron)', textDecoration: 'none' }}>View Profile →</Link>
                    </div>
                  )}
                </div>
              ))}

              {PARAMETERS.map((section, sIdx) => (
                <React.Fragment key={sIdx}>

                  <div style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 15,
                    background: 'var(--oxford)',
                    padding: '14px 24px',
                    fontWeight: 700,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRight: '2px solid var(--border)',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--saffron)' }} />
                    {section.section}
                  </div>
                  {colleges.map((_, i) => (
                    <div key={i} style={{ background: 'var(--oxford)', opacity: 0.95 }} />
                  ))}

                  {section.fields.map((field, fIdx) => (
                    <React.Fragment key={fIdx}>
                      <div style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 10,
                        background: '#fcfcfc',
                        padding: '18px 24px',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--oxford)',
                        display: 'flex',
                        alignItems: 'center',
                        borderRight: '2px solid var(--border)',
                        borderBottom: '1px solid rgba(0,0,0,0.03)'
                      }}>
                        {field.label}
                      </div>

                      {colleges.map((c, cIdx) => (
                        <div key={cIdx} style={{
                          background: '#fff',
                          padding: '16px',
                          textAlign: 'center',
                          fontSize: 14,
                          color: c ? 'var(--text-primary)' : '#e0e0e0',
                          borderBottom: '1px solid rgba(0,0,0,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: c ? 500 : 400
                        }}>
                          {c ? (field.render ? field.render(c) : (c[field.key] || '—')) : '—'}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {activeCollegesCount === 0 && (
          <div style={{
            marginTop: 40, textAlign: 'center', padding: '60px',
            background: '#fff', borderRadius: '16px', border: '1px dashed var(--border)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: 'var(--oxford)', marginBottom: 8 }}>Ready to compare?</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
              Search and add colleges in the slots above to see how they stack up against each other across various parameters.
            </p>
          </div>
        )}
      </div>
   </div>
    </div>
  );
}
