import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Share2, Check ,MapPin} from 'lucide-react';
import StarRating from './StarRating';
import { useToast } from './Toast';
import { useCollegeReviews } from '../hooks/useColleges';

export default function CollegeCard({ college, isSaved, onSave }) {
  const {
    id, name, short_name, slug, logo_url,
    college_type, ownership, state, city,
    nirf_ranking, naac_grade,
    avg_annual_fees, avg_package_lpa,
    placement_rate_pct, avg_rating, total_reviews,
    entrance_exams = [], is_featured,
  } = college;

  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/college/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  const { reviews } = useCollegeReviews(id);

  const dynamicRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const total = reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
    return {
      avg: (total / reviews.length).toFixed(1),
      count: reviews.length
    };
  }, [reviews]);


  const fees = avg_annual_fees
    ? avg_annual_fees >= 100000
      ? `₹${(avg_annual_fees / 100000).toFixed(1)}L`
      : `₹${Math.round(avg_annual_fees / 1000)}K`
    : '—';

  const pkg = (avg_package_lpa)
    ? (avg_package_lpa >= 100
      ? `${parseFloat((avg_package_lpa / 100).toFixed(2))} Cr`
      : `${avg_package_lpa} LPA`)
    : '—';
  const initials = (short_name || name || '?').slice(0, 2).toUpperCase();

  return (
    <article className="card card-hover animate-in" style={{ display: 'flex', flexDirection: 'column',backgroundColor: 'var(--surface-hover)', position: 'relative', overflow: 'hidden' }}>

    
      {is_featured && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, var(--saffron), #e07a00)',
        }} />
      )}

   
      <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
   
        <div style={{
          width: 54, height: 54, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--oxford) 0%, #1a3a5c 100%)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-heading)', color: '#fff', fontSize: 18, fontWeight: 700,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {logo_url
            ? <img src={logo_url} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-oxford">{college_type}</span>
            <span className="badge badge-saffron">{ownership}</span>
            {is_featured && (
              <span className="badge" style={{ background: 'linear-gradient(90deg,#fff3e0,#ffe0b2)', color: '#b45309' }}>
                ★ Featured
              </span>
            )}
          </div>

          
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600,
            color: 'var(--text-primary)', lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {name}
          </h3>


          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span><MapPin/></span> {city}, {state}
          </p>
        </div>
      </div>

 
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        {[
          { label: 'NIRF Rank', value: nirf_ranking ? `#${nirf_ranking}` : '—', color: 'var(--oxford)' },
          { label: 'NAAC', value: naac_grade || '—', color: 'var(--green)' },
          { label: 'Avg Fees', value: `${fees}/yr`, color: 'var(--text-primary)' },
          { label: 'Avg Pkg', value: pkg, color: 'var(--saffron-deep)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '12px 8px', textAlign: 'center',
            borderRight: '1px solid var(--border)',
          }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>


      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minHeight: 40 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          {(entrance_exams || []).slice(0, 3).map(e => (
            <span key={e} className="chip" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{e}</span>
          ))}
        </div>
        {placement_rate_pct > 0 && (
          <span style={{ 
            fontSize: 11, fontWeight: 700, 
            color: 'var(--green)', background: 'var(--green-bg)', 
            padding: '4px 12px', borderRadius: 'var(--r-full)', 
            border: '1px solid #bbf7d0',
            whiteSpace: 'nowrap',
            marginLeft: 'auto'
          }}>
            {placement_rate_pct}% Placed
          </span>
        )}
      </div>


      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 16px',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarRating rating={parseFloat(dynamicRating ? dynamicRating.avg : (avg_rating || 0))} size={14} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {dynamicRating ? dynamicRating.avg : (avg_rating > 0 ? Number(avg_rating).toFixed(1) : '—')}
          </span>
          {(dynamicRating ? dynamicRating.count : total_reviews) > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ({dynamicRating ? dynamicRating.count : total_reviews})
            </span>
          )}
        </div>


        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={handleShare}
            style={{
              width: 32, height: 32, borderRadius: 'var(--r-md)',
              border: '1.5px solid var(--border)',
              background: copied ? 'var(--green)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: copied ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
            title="Share college"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
          </button>
          <button
            onClick={() => onSave?.(id)}
            style={{
              width: 32, height: 32, borderRadius: 'var(--r-md)',
              border: '1.5px solid var(--border)',
              background: isSaved ? 'var(--saffron-light)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 15,
              transition: 'all 0.15s',
            }}
            title={isSaved ? 'Saved' : 'Save college'}
          >
            <Bookmark 
              size={16} 
              fill={isSaved ? 'var(--saffron)' : 'none'} 
              color={isSaved ? 'var(--saffron)' : 'var(--text-muted)'} 
            />
          </button>
          <Link
            to={`/college/${slug}`}
            className="btn btn-saffron btn-sm"
            style={{ height: 32, fontSize: 12, padding: '0 14px', borderRadius: 'var(--r-md)' }}
          >
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
