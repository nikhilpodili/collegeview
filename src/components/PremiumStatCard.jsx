import { TrendingUp} from 'lucide-react';

export default function PremiumStatCard({ Icon: Ico, label, value, sub, accent = 'blue', trend }) {
  const colorSchemes = {
    blue: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: '#667eea15', icon: '#667eea' },
    green: { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', light: '#38ef7d15', icon: '#38ef7d' },
    orange: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', light: '#f5576c15', icon: '#f5576c' },
    purple: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: '#4facfe15', icon: '#4facfe' },
    gold: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', light: '#fee14015', icon: '#fee140' },
    teal: { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', light: '#30cfd015', icon: '#30cfd0' },
  };
  const scheme = colorSchemes[accent] || colorSchemes.blue;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
        background: scheme.light, borderRadius: '50%',
        transform: 'translate(30%, -30%)', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: scheme.bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
          <Ico size={24} color="#fff" />
        </div>

        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
          {label}
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '4px' }}>
          {value}
        </div>

        {sub && <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>}

        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px',
            fontSize: '12px', fontWeight: 600,
            color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : 'var(--text-muted)',
          }}>
            {trend > 0 ? <TrendingUp size={14} color="#10b981" /> : trend < 0 ? <TrendingDown size={14} color="#ef4444" /> : null}
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
}