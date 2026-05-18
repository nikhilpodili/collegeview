import { useState } from 'react';
import ForumReplyCard from './ForumReplyCard';
import { useForumReplies } from '../hooks/useColleges';
import { Lock } from './icons';
import { useToast } from './Toast';
import { supabase } from '../lib/hooks/supabase';
import { forumReplySchema } from '../lib/auth/components/validation';
export default function ForumThreadCard({ thread: initialThread, currentUser, onDeleteThread, expanded = false }) {
  const [thread, setThread] = useState(initialThread);
  const [showReplies, setShowReplies] = useState(expanded);
  const [replyText, setReplyText] = useState('');
  const { showToast } = useToast();

  const ADMIN_EMAILS = ['admin@collegeview.com'];
  const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

  const {
    id, title, body, tags = [], status, reply_count, is_pinned,
    created_at, author_id, profiles,
  } = thread;

  const { replies, loading: repliesLoading, createReply, deleteReply } = useForumReplies(showReplies ? id : null);

  const author = profiles || {};
  const date = created_at ? new Date(created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const isOwn = currentUser?.id === author_id;
  const isClosed = thread.status === 'closed';

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    const validation = forumReplySchema.safeParse({ body: replyText });
    if (!validation.success) {
      showToast(validation.error.errors[0].message, 'error');
      return;
    }
    try {
      await createReply(replyText, currentUser?.id);
      setReplyText('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteThread = () => {
    onDeleteThread?.(id);
  };

  const handleCloseThread = async () => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;

      setThread({ ...thread, status: 'closed' });
      showToast('Discussion thread closed.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteReply = async (replyId) => {
    await deleteReply(replyId);
  };

  return (
    <article className="card" style={{
      padding: 0,
      overflow: 'visible',
      marginBottom: '16px',
      border: is_pinned ? '1px solid var(--saffron)' : '1px solid var(--border)',
      boxShadow: is_pinned ? '0 0 10px rgba(232, 168, 41, 0.1)' : 'var(--shadow-sm)'
    }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 42, height: 42, flexShrink: 0,
            background: 'var(--oxford)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, overflow: 'hidden',
          }}>
            {author.avatar_url
              ? <img src={author.avatar_url} alt={author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (author.full_name || author.username || 'U').slice(0, 1).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              {is_pinned && <span style={{ fontSize: 10, background: 'var(--saffron)', color: 'var(--oxford)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>📌 PINNED</span>}
              <span style={{
                fontSize: 10,
                background: status === 'open' ? '#ecfdf5' : '#fef2f2',
                color: status === 'open' ? '#059669' : '#dc2626',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {status || 'OPEN'}
              </span>
              {isClosed && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600
                }}>
                  <Lock size={14} />
                  <span>Closed</span>
                </div>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {date}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700,
                  color: 'var(--oxford)', cursor: 'pointer',
                  marginBottom: 8, lineHeight: 1.3,
                  flex: 1
                }}
                onClick={() => setShowReplies(s => !s)}
              >
                {title}
              </h3>

              {(isOwn || isAdmin) && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {!isClosed && (
                    <button
                      onClick={handleCloseThread}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--oxford)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Close Thread"
                    >
                      <Lock size={16} />
                    </button>
                  )}
                  <button
                    onClick={handleDeleteThread}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: 14,
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title="Delete Thread"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
              {body}
            </p>

            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {Array.from(new Set(tags)).map(t => <span key={t} style={{
                  fontSize: 11,
                  background: 'var(--surface)',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  border: '1px solid var(--border)'
                }}>#{t}</span>)}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--surface)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                {author.full_name || author.username || 'Anonymous'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <span>📅 {date}</span>
              </div>

              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  color: showReplies ? 'var(--saffron-deep)' : 'var(--oxford)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                  marginLeft: 'auto'
                }}
                onClick={() => setShowReplies(s => !s)}
              >
                💬 {reply_count || 0} {reply_count === 1 ? 'Reply' : 'Replies'} {showReplies ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReplies && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>

          {repliesLoading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: 20, width: '60%', margin: '0 auto 12px' }} />
              <div className="skeleton" style={{ height: 20, width: '40%', margin: '0 auto' }} />
            </div>
          ) : replies.length > 0 ? (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {replies.map(reply => (
                <ForumReplyCard key={reply.id} reply={reply} currentUserId={currentUser?.id} onDelete={handleDeleteReply} depth={0} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: 14 }}>No replies yet. Start the conversation!</p>
            </div>
          )}

          {isClosed ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-muted)', background: '#fff', borderTop: '1px solid var(--border)' }}>
              <Lock size={24} style={{ marginBottom: 8, opacity: 0.5, margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>This discussion is closed. No new replies can be added.</p>
            </div>
          ) : currentUser ? (
            <form onSubmit={handleReplySubmit} style={{
              padding: '20px 24px',
              background: '#fff',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                background: 'var(--oxford)', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 14,
              }}>
                {(currentUser.full_name || currentUser.username || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={2}
                  maxLength={1000}
                  style={{
                    width: '100%', padding: '12px 16px', resize: 'vertical',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: 14, fontFamily: 'var(--font-ui)',
                    color: 'var(--text-primary)', background: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--oxford)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: replyText.length > 950 ? 'var(--error)' : 'var(--text-muted)' }}>
                    {replyText.length}/1000
                  </span>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={repliesLoading || !replyText.trim() || replyText.length < 2 || replyText.length > 1000}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '8px 24px',
                      borderRadius: '6px',
                      cursor: (repliesLoading || !replyText.trim() || replyText.length < 2 || replyText.length > 1000) ? 'default' : 'pointer',
                      opacity: (repliesLoading || !replyText.trim() || replyText.length < 2 || replyText.length > 1000) ? 0.6 : 1
                    }}
                  >
                    {repliesLoading ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', background: '#fff', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Please <a href="/auth?tab=signin" style={{ color: 'var(--oxford)', fontWeight: 700 }}>Sign in</a> to join this discussion.
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

