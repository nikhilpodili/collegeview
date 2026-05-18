
export default function ForumReplyCard({ reply, currentUserId, onDelete, depth = 0 }) {
  const { id, body, created_at, author_id, profiles, children = [] } = reply;
  const author = profiles || {};
  const date = created_at ? new Date(created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';
  const isOwn = currentUserId === author_id;

  const handleDelete = () => {
    onDelete?.(id);
  };

  return (
    <div style={{
      display: 'flex', gap: 12,
      marginLeft: depth > 0 ? 32 : 0,
      paddingLeft: depth > 0 ? 16 : 0,
      borderLeft: depth > 0 ? '2px solid var(--border)' : 'none',
      marginBottom: depth === 0 ? '8px' : '4px'
    }}>

      <div style={{
        width: depth === 0 ? 34 : 28,
        height: depth === 0 ? 34 : 28,
        flexShrink: 0,
        background: isOwn ? 'var(--saffron-light)' : 'var(--surface)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isOwn ? 'var(--saffron-deep)' : 'var(--oxford)',
        fontWeight: 700, fontSize: depth === 0 ? 14 : 12, overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        {author.avatar_url
          ? <img src={author.avatar_url} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (author.full_name || author.username || 'U').slice(0, 1).toUpperCase()}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          background: isOwn ? '#fffbf2' : '#fff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--oxford)' }}>
              {author.full_name || author.username || 'Anonymous'}
            </span>
            {isOwn && (
              <span style={{
                fontSize: 9,
                background: 'var(--saffron)',
                color: 'var(--oxford)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 800
              }}>YOU</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{date}</span>
          </div>
          <p style={{
            fontSize: 14,
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'pre-wrap'
          }}>
            {body}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, paddingLeft: 4 }}>


          {isOwn && (
            <button
              onClick={handleDelete}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>

        {depth < 2 && children.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {children.map(child => (
              <ForumReplyCard key={child.id} reply={child} currentUserId={currentUserId} onDelete={onDelete} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

