import { useState, useEffect } from 'react';
import { getCompanyLogo, fetchWorldVectorLogo } from '../lib/hooks/logo-api';

const COMPANY_LOGOS = {
    // Tech Hardware & Giants
    'Google': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/google.svg',
    'Microsoft': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/microsoft.svg',
    'Amazon': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/amazon.svg',
    'Apple': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/apple.svg',
    'Meta': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/meta.svg',
    'NVIDIA': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/nvidia.svg',
    'Intel': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/intel.svg',

    // Software & SaaS
    'Adobe': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/adobe.svg',
    'Salesforce': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/salesforce.svg',
    'Oracle': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/oracle.svg',
    'SAP': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/sap.svg',

    // Finance & Banking
    'Goldman Sachs': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs_Logo.svg',
    'JP Morgan': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/jpmorgan.svg',
    'Morgan Stanley': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/morganstanley.svg',
    'Citi': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/citi.svg',
    'HSBC': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/hsbc.svg',

    // Fintech & Payments
    'Visa': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/visa.svg',
    'Mastercard': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/mastercard.svg',
    'American Express': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/americanexpress.svg',
    'PayPal': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/paypal.svg',
    'Stripe': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/stripe.svg',

    // Consulting & Audit
    'McKinsey': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/mckinsey.svg',
    'Bain & Company': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Bain_%26_Company_logo.svg',
    'Deloitte': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/deloitte.svg',
    'PwC': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/pwc.svg',
    'EY': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/ey.svg',
    'KPMG': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/kpmg.svg',

    // IT Services
    'TCS': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Tata_Consultancy_Services_Logo.svg',
    'Infosys': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/infosys.svg',
    'Wipro': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/wipro.svg',
    'HCL': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/hcl.svg',
    'Tech Mahindra': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Tech_Mahindra_Logo.svg',
    'Cognizant': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/cognizant.svg',
    'Accenture': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/accenture.svg',
    'Capgemini': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/capgemini.svg',

    // E-commerce & Retail
    'Flipkart': 'https://upload.wikimedia.org/wikipedia/commons/3/31/Flipkart_logo.svg',
    'Myntra': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Myntra_Logo.svg',
    'Walmart': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/walmart.svg',
    'Shopify': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/shopify.svg',

    // Social Media & Entertainment
    'LinkedIn': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/linkedin.svg',
    'X': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/x.svg',
    'TikTok': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/tiktok.svg',
    'Netflix': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/netflix.svg',
    'Spotify': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/spotify.svg',

    // Startups / Mobility / Delivery
    'Uber': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/uber.svg',
    'Airbnb': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/airbnb.svg',
    'Zomato': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Zomato_logo_2021.svg',
    'Swiggy': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Swiggy_logo.svg',
    'Ola': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Ola_Cabs_Logo.svg',
    'Paytm': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Paytm_Logo.svg',
    'PhonePe': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/PhonePe_Logo.svg',

    // Automotive
    'Tesla': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/tesla.svg',
    'Toyota': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/toyota.svg',
    'Ferrari': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/ferrari.svg',
};

// ── Enhanced Recruiter Card ─────────────────────────────────
export default function RecruiterCard({ name, logoUrl}) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const [imgError, setImgError] = useState(false);
    const [fetchedLogo, setFetchedLogo] = useState(null);

    // Fetch dynamic logo if not provided or hardcoded
    useEffect(() => {
        if (!logoUrl && !COMPANY_LOGOS[name]) {
            // Priority 1: Clearbit
            const clearbitUrl = getCompanyLogo(name);
            setFetchedLogo(clearbitUrl);

            // Priority 2: World Vector Logo 
            fetchWorldVectorLogo(name).then(url => {
                if (url) setFetchedLogo(url);
            });
        }
    }, [name, logoUrl]);

    const finalLogoUrl = logoUrl || COMPANY_LOGOS[name] || fetchedLogo || null;

    return (
        <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'all 0.25s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
            }}
        >
          
            <div style={{
                display: 'flex',
                alignItems: 'center', gap: '14px'
            }}>

              
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: finalLogoUrl ? '#f8fafc' : '#eff6ff',
                    border: `1.5px solid ${finalLogoUrl ? '#e2e8f0' : '#bfdbfe'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                }}>
                    {!imgError && finalLogoUrl ? (
                        <img
                            src={finalLogoUrl}
                            alt={name}
                            style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span style={{
                            fontSize: '16px',
                            fontWeight: '800',
                            color: '#1e40af',
                            lineHeight: 1
                        }}>
                            {initials}
                        </span>
                    )}
                </div>
    
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '700',

                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {name}
                    </div>
                </div>
            </div>


        </div>
    );
}