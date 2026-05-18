
export default function StarRating({ rating = 0, size = 14, showValue = false }) {
  const pct = Math.max(0, Math.min(5, parseFloat(rating) || 0));
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ position:'relative', display:'inline-flex' }}>

        <span style={{ display:'inline-flex', gap:2 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </span>
        <span style={{ position:'absolute', top:0, left:0, overflow:'hidden', width:`${(pct/5)*100}%`, display:'inline-flex', gap:2 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" style={{ flexShrink:0 }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </span>
      </span>
      {showValue && pct > 0 && (
        <span style={{ fontSize:size, fontWeight:700, color:'var(--oxford)', fontFamily:'var(--font-ui)' }}>
          {pct.toFixed(1)}
        </span>
      )}
    </span>
  );
}
