import StarRating from './StarRating';

const DIMS = [
  { key: 'academic_rating', label: 'Academics' },
  { key: 'placement_rating', label: 'Placements' },
  { key: 'infrastructure_rating', label: 'Infrastructure' },
  { key: 'social_life_rating', label: 'Social Life' },
  { key: 'faculty_rating', label: 'Faculty' },
  { key: 'value_for_money_rating', label: 'Value for Money' },
];

export default function RatingBreakdown({ ratings = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {DIMS.map(({ key, label }) => {
        const val = parseFloat(ratings[key] || 0);
        const hasData = val > 0;

        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
           
            <span style={{
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--text-secondary)',
              minWidth: 100
            }}>
              {label}
            </span>

        
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StarRating
                rating={val}
                size={26}
                readOnly
                style={{ opacity: hasData ? 1 : 0.3 }}
              />
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: hasData ? 'var(--oxford)' : 'var(--text-muted)',
                minWidth: 30,
                textAlign: 'right'
              }}>
                {hasData ? val.toFixed(1) : '—'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}