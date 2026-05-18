import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function LegalPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const sectionStyle = {
    marginBottom: '48px',
    background: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '20px',
    fontFamily: 'var(--font-heading)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const subTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginTop: '24px',
    marginBottom: '12px',
  };

  const textStyle = {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#475569',
    marginBottom: '16px',
  };

  const listStyle = {
    marginLeft: '20px',
    marginBottom: '16px',
    color: '#475569',
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Legal <span style={{ color: 'var(--saffron)' }}>Information</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to know about our terms, privacy policies, and refund rules.
          </p>
        </div>

        <section id="terms-and-conditions" style={sectionStyle}>
          <h2 style={titleStyle}>
            <div style={{ width: '8px', height: '32px', background: 'var(--saffron)', borderRadius: '4px' }} />
            Terms and Conditions
          </h2>
          <div style={textStyle}>
            Welcome to CollegeView. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions of use.
          </div>
          
          <h3 style={subTitleStyle}>1. Acceptance of Terms</h3>
          <p style={textStyle}>
            By creating an account or using our services, you confirm that you are at least 18 years old or have parental consent to use this platform. You agree to provide accurate and complete information during the registration process.
          </p>

          <h3 style={subTitleStyle}>2. User Content</h3>
          <p style={textStyle}>
            Users are responsible for the content they post, including reviews and forum discussions. CollegeView reserves the right to remove any content that is deemed inappropriate, offensive, or in violation of our community guidelines.
          </p>

          <h3 style={subTitleStyle}>3. Intellectual Property</h3>
          <p style={textStyle}>
            The content, logos, and features of CollegeView are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our platform without express written permission.
          </p>
        </section>

        <section id="privacy-policy" style={sectionStyle}>
          <h2 style={titleStyle}>
            <div style={{ width: '8px', height: '32px', background: '#3b82f6', borderRadius: '4px' }} />
            Privacy Policy
          </h2>
          <p style={textStyle}>
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
          </p>

          <h3 style={subTitleStyle}>Information We Collect</h3>
          <ul style={listStyle}>
            <li>Account Information: Name, email address, and profile details.</li>
            <li>Usage Data: Information on how you interact with our website.</li>
            <li>Cookies: We use cookies to enhance your browsing experience.</li>
          </ul>

          <h3 style={subTitleStyle}>How We Use Your Information</h3>
          <p style={textStyle}>
            We use your data to provide and improve our services, communicate with you regarding updates, and personalize your experience on CollegeView. We do not sell your personal information to third parties.
          </p>
        </section>

        <section id="refund-policy" style={sectionStyle}>
          <h2 style={titleStyle}>
            <div style={{ width: '8px', height: '32px', background: '#10b981', borderRadius: '4px' }} />
            Refund Policy
          </h2>
          <p style={textStyle}>
            We strive for total satisfaction with our premium services. This policy explains our stance on refunds.
          </p>

          <h3 style={subTitleStyle}>Premium Subscriptions</h3>
          <p style={textStyle}>
            Refunds for premium subscriptions are generally available within 7 days of purchase if the service has not been substantially utilized. To request a refund, please contact our support team.
          </p>

          <h3 style={subTitleStyle}>Exceptions</h3>
          <p style={textStyle}>
            Refunds will not be issued for accounts that have been terminated due to violations of our Terms and Conditions.
          </p>
        </section>

        <div style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '14px' }}>
          Last Updated: May 15, 2026
        </div>
      </div>
    </div>
  );
}
