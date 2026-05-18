import { useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/core/useAuth';
import cvlogo from '../assets/cvlogo.png'; 

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, signOut, isLoading } = useAuth();

  const examParam = searchParams.get('exam') || '';
  const sortParam = searchParams.get('sort') || '';

  const isActive = (href) => {
    const isExamsActive = (pathname === '/colleges' && !!examParam);
    const isRankingsActive = pathname === '/rankings' || (pathname === '/colleges' && sortParam === 'nirf_ranking');
    const isCompareActive = pathname.startsWith('/compare');
    const isCollegesActive = (pathname.startsWith('/college/')) || (pathname === '/colleges' && !isExamsActive && !isRankingsActive);

    if (href.includes('exam=')) return isExamsActive;
    if (href === '/rankings') return isRankingsActive;
    if (href === '/compare') return isCompareActive;
    if (href === '/colleges') return isCollegesActive;

    return pathname === href;
  };

  const NAV_LINKS = [
    { label: 'Colleges', href: '/colleges' },
    { label: 'Rankings', href: '/rankings' },
    { label: 'Compare', href: '/compare' },
    { label: 'Exams', href: '/colleges?exam=JEE%20Main' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const linkStyle = (href) => ({
    padding: '8px 16px',
    borderRadius: 'var(--r-md)',
    fontSize: 15, fontWeight: 600,
    color: isActive(href) ? '#fff' : 'rgba(255,255,255,0.65)',
    background: isActive(href) ? 'rgba(255,255,255,0.12)' : 'transparent',
    borderBottom: isActive(href) ? '2px solid var(--saffron)' : '2px solid transparent',
    transition: 'all 0.15s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-h)',
      background: 'rgba(0, 33, 71, 0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
    }}>
      <div className="container" style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        padding: '0 clamp(1rem, 4vw, 2.5rem)',
      }}>


        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
          <img src={cvlogo} alt="CollegeView" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        <nav style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center',overflowX: 'auto',whiteSpace: 'nowrap', }} className="hide-mobile">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              style={linkStyle(href)}
              onMouseEnter={e => { if (!isActive(href)) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!isActive(href)) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            >
              {label}
              {isActive(href) && (
                <span style={{
                  display: 'inline-block', width: 4, height: 4,
                  borderRadius: '50%', background: 'var(--saffron)',
                  marginLeft: 6, verticalAlign: 'middle',
                }} />
              )}
            </Link>
          ))}
          {user && (
            <Link to="/profile" style={{ ...linkStyle('/profile'), display: 'flex', alignItems: 'center', gap: 6 }}>
              My Profile
              {isAdmin && (
                <span style={{
                  background: 'var(--saffron)',
                  color: 'var(--oxford)',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Admin</span>
              )}
            </Link>
          )}
          {isAdmin && <Link to="/admin" style={linkStyle('/admin')}>Dashboard</Link>}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }} className="hide-mobile">
          <a
            href="mailto:contact@collegeview.com"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--r-md)',
              fontSize: 14, fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Contact
          </a>

          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

          <div style={{ display: 'flex', gap: 8 }}>
            {isLoading ? (
              <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
            ) : user ? (
              <button onClick={handleLogout} className="btn" style={{ color: 'red', fontWeight: 900, fontSize: 16 }}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/auth?mode=signin" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.75)', fontSize : " 16px" }}>
                  Sign In
                </Link>
                <Link to="/auth?mode=signup" className="btn btn-saffron btn-sm" style={{ fontSize : " 16px" }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>


      </div>
    </header>
  );
}