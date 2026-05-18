
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import cvlogo from '../assets/cvlogo.png';

export default function Footer() {
  const location = useLocation();

  // Don't show footer on admin dashboard to save space
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{ background: 'var(--oxford)', color: '#fff', padding: '60px 5% 24px 5%', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <img src={cvlogo} alt="CollegeView" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            Your ultimate destination for college discovery, real student reviews, and comprehensive admission guidance in India.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--saffron)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Twitter</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--saffron)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Facebook</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--saffron)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Instagram</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--saffron)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>LinkedIn</a>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Home</Link></li>
            <li><Link to="/colleges" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Top Colleges</Link></li>
            <li><Link to="/compare" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Compare Colleges</Link></li>
            <li><Link to="/rankings" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>NIRF Rankings</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resources</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/colleges?exam=JEE%20Main" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Entrance Exams</Link></li>
            <li><Link to="/colleges" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Admission {new Date().getFullYear()}</Link></li>
            <li><Link to="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Legal Information</Link></li>
            <li><Link to="/auth" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Student Login</Link></li>

          </ul>
        </div>

       
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
              <MapPin size={18} color="var(--saffron)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>123 Education Hub, Knowledge Park<br />Mumbai, India 400005</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
              <Phone size={18} color="var(--saffron)" style={{ flexShrink: 0 }} />
              <span>+91 98765 43210</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
              <Mail size={18} color="var(--saffron)" style={{ flexShrink: 0 }} />
              <span>support@collegeview.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} CollegeView Inc. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/legal#privacy-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Privacy Policy</Link>
          <Link to="/legal#terms-and-conditions" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Terms of Service</Link>
          <Link to="/legal#refund-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
