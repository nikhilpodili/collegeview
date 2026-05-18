export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const WINDOW = 2;
  const rawPages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - WINDOW && p <= page + WINDOW)) {
      rawPages.push(p);
    }
  }
  const items = [];
  for (let i = 0; i < rawPages.length; i++) {
    if (i > 0 && rawPages[i] - rawPages[i - 1] > 1) items.push('…');
    items.push(rawPages[i]);
  }

  const PageBtn = ({ children, target, disabled = false, active = false }) => (
    <button
      onClick={() => !disabled && target && onChange(target)}
      disabled={disabled}
      style={{
        minWidth: 40, height: 40,
        borderRadius: 'var(--r-md)',
        border: active ? '2px solid var(--oxford)' : '1.5px solid var(--border)',
        background: active ? 'var(--oxford)' : disabled ? 'transparent' : '#fff',
        color: active ? '#fff' : disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: 'var(--font-ui)', fontWeight: active ? 700 : 500, fontSize: 16,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 8px',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {children}
    </button>
  );

  return (
    <nav aria-label="Pagination" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, marginTop: 40, flexWrap: 'wrap',
    }}>
      <PageBtn target={page - 1} disabled={page === 1}>‹ Prev</PageBtn>
      {items.map((item, idx) =>
        item === '…'
          ? <span key={`e${idx}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 14 }}>…</span>
          : <PageBtn key={item} target={item} active={item === page}>{item}</PageBtn>
      )}
      <PageBtn target={page + 1} disabled={page === totalPages}>Next ›</PageBtn>
    </nav>
  );
}