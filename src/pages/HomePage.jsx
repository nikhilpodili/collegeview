import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/hooks/supabase';
import CollegeCard from '../components/CollegeCard';
import { Cpu, Briefcase, Activity, Landmark, Building2, GraduationCap, MapPin, BarChart3, Star, IndianRupee, ArrowLeftRight, Search } from 'lucide-react';
const STATS = [
  { value: '5,000+', label: 'Colleges Listed' },
  { value: '50L+', label: 'Students Helped' },
  { value: '1,200+', label: 'Student Reviews' },
  { value: '28', label: 'States Covered' },
];

const CATEGORIES = [
  { label: 'Engineering', icon: <Cpu size={32} strokeWidth={1.5} />, type: 'IIT' },
  { label: 'Management', icon: <Briefcase size={32} strokeWidth={1.5} />, type: 'IIM' },
  { label: 'Medical', icon: <Activity size={32} strokeWidth={1.5} />, type: 'AIIMS' },
  { label: 'Government', icon: <Landmark size={32} strokeWidth={1.5} />, type: 'Government' },
  { label: 'Private', icon: <Building2 size={32} strokeWidth={1.5} />, type: 'Private' },
  { label: 'Deemed', icon: <GraduationCap size={32} strokeWidth={1.5} />, type: 'Deemed' },
];

const TOP_LOCATIONS = [
  { name: 'Delhi NCR', count: '450+ Colleges', image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bangalore', count: '320+ Colleges', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Mumbai', count: '280+ Colleges', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&q=80&w=400' },
  { name: 'Pune', count: '210+ Colleges', image: 'https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?auto=format&fit=crop&q=80&w=400' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState([]);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('colleges')
        .select('id,name,short_name,slug,logo_url,college_type,ownership,state,city,nirf_ranking,naac_grade,avg_annual_fees,avg_package_lpa,highest_package_lpa,placement_rate_pct,avg_rating,total_reviews,entrance_exams,is_featured,established_year,description,campus_area_acres')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('nirf_ranking', { ascending: true, nullsFirst: false })
        .limit(6);
      setFeatured(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleSave = (id) => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="page-wrapper">
      <section style={{
        background: 'linear-gradient(160deg, var(--oxford-deep) 0%, var(--oxford) 45%, #1a3a5c 100%)',
        minHeight: 520, display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>

        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,153,51,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div className="container" style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 940 }}>
           
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,153,51,0.15)', border: '1px solid rgba(255,153,51,0.3)', borderRadius: 'var(--r-full)', padding: '4px 14px', marginBottom: 20 }}>
              <span style={{ color: 'var(--saffron)', fontSize: 16, fontWeight: 700, letterSpacing: '0.5px' }}> INDIA'S MOST TRUSTED COLLEGE NAVIGATOR</span>
            </div>

            <h1 style={{ color: '#fff', lineHeight: 1.15, marginBottom: 16, fontSize: "70px" }}>
              Find Your Perfect<br />
              <span style={{ color: 'var(--saffron)' }}>College in India</span>
            </h1>

            <p style={{ fontSize: "23px", color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, marginBottom: 36 }}>
              Compare 5,000+ colleges on NIRF rankings, fees, placements, and real student reviews. Make the right choice for your future.
            </p>

    
            <div style={{ display: 'flex', gap: 0, background: '#fff', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', maxWidth: 560 }}>
              <span style={{ padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 18 }}><Search /></span>
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/colleges?search=${encodeURIComponent(searchQ)}`; }}
                placeholder="Search by college, city, course or exam..."
                style={{ flex: 1, height: 54, border: 'none', outline: 'none', fontSize: 18, fontFamily: 'var(--font-ui)', color: 'var(--text-primary)', background: 'transparent' }}
              />
              <Link
                to={`/colleges?search=${encodeURIComponent(searchQ)}`}
                className="btn btn-saffron"
                style={{ margin: 6, borderRadius: 'var(--r-lg)', height: 42, padding: '0 20px', fontSize: 18, fontWeight: 700 }}
              >
                Search
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {['JEE Advanced', 'NEET', 'JEE Main', 'CAT', 'GATE', 'CUET'].map(exam => (
                <Link key={exam} to={`/colleges?exam=${exam}`} style={{
                  fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  padding: '4px 12px', borderRadius: 'var(--r-full)',
                  transition: 'all 0.15s',
                }}>
                  {exam}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--oxford)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ display: 'flex', padding: '20px 24px', gap: 0 }}>
          {STATS.map(({ value, label }, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', padding: '4px 0' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--saffron)' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>


      <section style={{ padding: '64px 0 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(255, 153, 51, 0.1)',
              color: 'var(--saffron)',
              borderRadius: 'var(--r-full)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Explore Options
            </div>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 900,
              color: 'var(--oxford)',
              lineHeight: 1.2,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-1px'
            }}>
              Browse by <span style={{
                background: 'linear-gradient(135deg, var(--saffron) 0%, #e66a00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>Category</span>
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '18px',
              marginTop: '16px',
              maxWidth: '600px',
              margin: '16px auto 0',
              lineHeight: 1.6
            }}>
              Find the right college type for your academic and career goals.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 ,}}>
            {CATEGORIES.map(({ label, icon, type }) => (
              <Link key={type} to={`/colleges?type=${type}`} style={{ textDecoration: 'none', }}>
                <div className="card" style={{
                  padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--border)',backgroundColor : 'var(--surface-muted',
                  boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--r-xl)', background: '#fff'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'var(--saffron)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,153,51,0.15)'; e.currentTarget.querySelector('.cat-icon').style.color = 'var(--saffron)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.querySelector('.cat-icon').style.color = 'var(--text-secondary)'; }}
                >
                  <div className="cat-icon" style={{ marginBottom: 16, color: 'var(--text-secondary)', transition: 'color 0.3s', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--oxford)' }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section style={{ padding: '20px 0 64px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 className="h2">Top Study Destinations</h2>
              <p className="body-sm" style={{ marginTop: 6, fontSize: "15px", fontWeight: "600", color: "var(--oxford)" }}>Explore colleges in India's major educational hubs</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {TOP_LOCATIONS.map((loc) => (
              <Link key={loc.name} to={`/colleges?search=${loc.name}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', height: '240px',
                  boxShadow: 'var(--shadow-md)', cursor: 'pointer', transition: 'transform 0.3s'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img src={loc.image} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,33,71,0.9) 0%, rgba(0,33,71,0.3) 50%, transparent 100%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--saffron)', marginBottom: 4 }}>
                      <MapPin size={16} strokeWidth={2.5} />
                      <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{loc.count}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{loc.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 0 64px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 className="h2">Featured Colleges</h2>
              <p className="body-sm" style={{ marginTop: 4, fontSize: "15px", fontWeight: "600", color: "var(--oxford)" }}>Top-ranked institutions across India</p>
            </div>
            <Link to="/colleges" className="btn btn-outline" style={{ fontSize: 13 }}>
              View All Colleges →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card" style={{ height: 260 }}>
                  <div className="skeleton" style={{ height: '100%', borderRadius: 'var(--r-xl)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 20 }}>
              {featured.map(c => (
                <CollegeCard key={c.id} college={c} isSaved={saved.includes(c.id)} onSave={toggleSave} />
              ))}
            </div>
          )}
        </div>
      </section>


      <section style={{ background: '#f8fafc', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(255, 153, 51, 0.1)',
              color: 'var(--saffron)',
              borderRadius: 'var(--r-full)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              The CollegeView Advantage
            </div>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 900,
              color: 'var(--oxford)',
              lineHeight: 1.2,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-1px'
            }}>
              Why Choose <span style={{
                background: 'linear-gradient(135deg, var(--saffron) 0%, #e66a00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>CollegeView?</span>
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '18px',
              marginTop: '16px',
              maxWidth: '600px',
              margin: '16px auto 0',
              lineHeight: 1.6
            }}>
              We combine verified institutional data with authentic student voices to give you everything you need to make the right choice for your future.
            </p>
          </div>

          <style>{`
            .bento-grid {
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              gap: 24px;
              grid-auto-rows: minmax(240px, auto);
            }
            .bento-col-8 { grid-column: span 8; }
            .bento-col-4 { grid-column: span 4; }
            
            /* Responsive */
            @media (max-width: 900px) {
              .bento-col-8, .bento-col-4 {
                grid-column: span 12;
              }
            }
            
            /* Card Hover Effects */
            .bento-card {
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .bento-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 16px 32px rgba(0, 33, 71, 0.1) !important;
            }
          `}</style>

          <div className="bento-grid">

            <div className="bento-col-8 bento-card" style={{
              background: 'linear-gradient(135deg, var(--saffron) 0%, #e66a00 100%)',
              borderRadius: 'var(--r-2xl)', padding: '48px', color: '#fff',
              position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <BarChart3 size={160} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15, transform: 'rotate(-10deg)' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>Verified NIRF & NAAC Rankings</h3>
              <p style={{ fontSize: '18px', opacity: 0.95, maxWidth: '400px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                Access the most accurate and up-to-date institutional rankings. We aggregate data from official sources so you can trust the numbers.
              </p>
            </div>

        
            <div className="bento-col-4 bento-card" style={{
              background: '#fff', borderRadius: 'var(--r-2xl)', padding: '40px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
            }}>
              <div style={{ background: 'rgba(255,153,51,0.1)', padding: '16px', borderRadius: 'var(--r-xl)', marginBottom: '24px' }}>
                <Star size={36} color="var(--saffron)" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--oxford)', marginBottom: '12px' }}>Real Reviews</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
                Only verified students & alumni can write reviews. Get the unfiltered truth about campus life, academics, and placements.
              </p>
            </div>


            <div className="bento-col-4 bento-card" style={{
              background: 'var(--oxford)', borderRadius: 'var(--r-2xl)', padding: '40px',
              boxShadow: 'var(--shadow-md)', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,153,51,0.2) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--r-xl)', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                <IndianRupee size={36} color="var(--saffron)" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', position: 'relative', zIndex: 1 }}>Fee Transparency</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                Complete fee structures including tuition, hostel, and hidden costs to help you plan your finances better.
              </p>
            </div>
            <div className="bento-col-8 bento-card" style={{
              background: '#fff', borderRadius: 'var(--r-2xl)', padding: '48px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--oxford)', marginBottom: '16px', lineHeight: 1.2 }}>Smart Compare</h3>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Compare up to 5 colleges side-by-side on all parameters including placements, infrastructure, and faculty to make the perfect choice.
                </p>
              </div>
              <div style={{ flex: '0 0 auto', background: '#f8fafc', padding: '32px', borderRadius: '50%', border: '1px solid var(--border)' }}>
                <ArrowLeftRight size={56} color="var(--saffron)" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
