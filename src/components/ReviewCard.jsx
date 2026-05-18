
import StarRating from './StarRating';
import useReviewVotes from '../hooks/useReviewVote';
import { ThumbsUp } from './icons';
import { GraduationCap, MapPin } from 'lucide-react';

const TAGS = ['Academics', 'Campus Life', 'Faculty', 'Placements', 'Infrastructure', 'Hostel', 'Food', 'Sports'];

export default function ReviewCard({ review, currentUserId, onHelpful, onDelete }) {
  const {
    id, user_id, overall_rating, title, pros, cons, body,
    course_studied, batch_year, is_alumni, tags = [],
    helpful_count, is_verified, created_at,
    profiles,
    academic_rating, placement_rating, infrastructure_rating,
    social_life_rating, faculty_rating, value_for_money_rating,
  } = review;

  const author = (Array.isArray(profiles) ? profiles[0] : profiles) || {};
  const date = created_at ? new Date(created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  const { hasVoted, helpfulCount, toggleVote, loading } = useReviewVotes(id, helpful_count || 0, currentUserId);

  const miniRatings = [
    ['Academics', academic_rating],
    ['Placements', placement_rating],
    ['Infrastructure', infrastructure_rating],
    ['Faculty', faculty_rating],
    ['Social Life', social_life_rating],
    ['Value for Money', value_for_money_rating],
  ].filter(([, v]) => v);

  return (
    <article className="card animate-in" style={{ padding: 22, marginBottom: 24 }}>
 
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
      
        <div style={{
          width: 52, height: 52, flexShrink: 0,
          background: 'var(--oxford)',
          borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 20,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {author.avatar_url
            ? <img src={author.avatar_url} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (author.full_name || author.username || 'U').slice(0, 1).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--oxford)', fontFamily: 'var(--font-ui)' }}>
              {author.full_name || 'Anonymous User'}
            </span>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', opacity: 0.9 }}>
              @{author.username || 'anonymous'}
            </span>
            {author.is_verified && <span className="badge badge-blue" style={{ fontSize: 13, padding: '3px 8px' }}>✓ Verified User</span>}
            {is_verified && <span className="badge badge-green" style={{ fontSize: 13, padding: '3px 8px' }}>✓ Verified Review</span>}
            {is_alumni && <span className="badge badge-saffron" style={{ fontSize: 13, padding: '3px 8px' }}>Alumni</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
            {(author.city || author.state) && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ opacity: 0.8,display : 'flex', alignItems : 'center',gap : 4 }}><MapPin size={14}/></span> {author.city}{author.city && author.state ? ', ' : ''}{author.state}
              </div>
            )}
            {author.current_college && (
              <div style={{ fontSize: 12, color: 'var(--oxford)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ opacity: 0.8, display : 'flex', alignItems : 'center',gap : 4 }}><GraduationCap size={14}/> Studying At </span> {author.current_college}
                {author.graduation_year && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}> · Graduating In {author.graduation_year}</span>}
              </div>
            )}
            {author.bio && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6, fontStyle: 'italic', marginTop: 2 }}>
               <span>{author.bio}</span>
              </div>
            )}
            {course_studied && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontStyle: 'italic', fontWeight: 500 }}>
                Studied: {course_studied}{batch_year ? ` (${batch_year})` : ''}
              </p>
            )}
          </div>
        </div>

      
        <div style={{
          background: getRatingColor(overall_rating),
          color: '#fff',
          borderRadius: 'var(--r-md)',
          padding: '8px 14px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          flexShrink: 0,
        }}>
          <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-ui)', lineHeight: 1 }}>
            {Number(overall_rating).toFixed(1)}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.5px' }}>Rating</div>
        </div>
      </div>

     
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--oxford)', marginBottom: 12, lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        {title}
      </h3>

      {(pros || cons) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
          {pros && (
            <div style={{ background: 'var(--green-bg)', borderLeft: '4px solid var(--green)', borderRadius: 'var(--r-sm) var(--r-md) var(--r-md) var(--r-sm)', padding: '14px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>✅ Pros</p>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{pros}</p>
            </div>
          )}
          {cons && (
            <div style={{ background: 'var(--red-bg)', borderLeft: '4px solid var(--red)', borderRadius: 'var(--r-sm) var(--r-md) var(--r-md) var(--r-sm)', padding: '14px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Cons</p>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{cons}</p>
            </div>
          )}
        </div>
      )}

  
      {body && <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-line', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{body}</p>}

   
      {miniRatings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          columnGap: 24,
          rowGap: 12,
          marginBottom: 20,
          padding: '16px',
          background: 'var(--surface-muted)',
          borderRadius: 'var(--r-lg)',
        }}>
          {miniRatings.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StarRating rating={parseFloat(val)} size={11} />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--oxford)', minWidth: 20, textAlign: 'right' }}>{Number(val).toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {tags.map(t => <span key={t} className="chip chip-active" style={{ fontSize: 14, padding: '4px 10px' }}>#{t}</span>)}
        </div>
      )}


      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid var(--border)'
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Published on {date}
        </span>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {currentUserId === user_id && (
            <button
              onClick={() => {
                {
                  onDelete?.(id);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🗑️ Delete
            </button>
          )}

          <button
            onClick={toggleVote}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--r-full)',
              border: '1px solid var(--border)',
              background: hasVoted ? 'var(--oxford)' : 'transparent',
              color: hasVoted ? '#fff' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1
            }}
          >
            <ThumbsUp size={16} fill={hasVoted ? "currentColor" : "none"} />

            {hasVoted ? 'Helpful' : 'Mark as Helpful'}
            {helpfulCount > 0 && (
              <span style={{
                background: hasVoted ? 'rgba(255,255,255,0.2)' : 'var(--surface-muted)',
                padding: '2px 8px',
                borderRadius: 'var(--r-full)',
                fontSize: 12,
                fontWeight: 700
              }}>
                {helpfulCount}
              </span>
            )}
          </button>
        </div>
      </div>


    </article>
  );
}

function getRatingColor(rating) {
  if (rating >= 4) return 'var(--green)';
  if (rating >= 3) return 'var(--gold)';
  if (rating >= 2) return '#ea580c';
  return 'var(--red)';
}
