import { BookOpen, Award, DollarSign, Clock, Users } from './icons';
export default function CourseCard({ course }) {
  const {
    name,
    level,
    stream,
    duration_years,
    total_seats,
    annual_fees,
    entrance_exam,
    min_cutoff,
  } = course;

  const levelColors = {
    UG: { bg: '#3b82f6', text: '#fff' },
    PG: { bg: '#8b5cf6', text: '#fff' },
    Diploma: { bg: '#f59e0b', text: '#fff' },
    PhD: { bg: '#10b981', text: '#fff' },
  };
  const levelColor = levelColors[level] || { bg: '#6b7280', text: '#fff' };

  return (
    <div
      style={{
        background: '#d7daeaff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = levelColor.bg;
        e.currentTarget.style.boxShadow = `0 8px 16px ${levelColor.bg}20`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: `${levelColor.bg}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <BookOpen size={22} color={levelColor.bg} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              background: levelColor.bg,
              color: levelColor.text,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {level}
          </span>
          {stream && (
            <span style={{ fontSize: '14px', color: '#444040ff', fontWeight: 800 }}>
              {stream}
            </span>
          )}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '10px',
          }}
        >
          {name}
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {duration_years && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Clock size={14} color="var(--text-muted)" />
              {duration_years} {duration_years === 1 ? 'Year' : 'Years'}
            </div>
          )}
          {total_seats && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Users size={14} color="var(--text-muted)" />
              {total_seats} Seats
            </div>
          )}
          {annual_fees && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
              <DollarSign size={14} color="#10b981" />
              ₹{Number(annual_fees).toLocaleString('en-IN')}/yr
            </div>
          )}
          {entrance_exam && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#8b5cf6', fontWeight: 600 }}>
              <Award size={14} color="#8b5cf6" />
              {entrance_exam}
            </div>
          )}
          {min_cutoff && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{min_cutoff}</div>
          )}
        </div>
      </div>
    </div>
  );
}
