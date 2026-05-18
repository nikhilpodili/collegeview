import { useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
const THREAD_TAGS = ['Admission', 'Hostel', 'Placements', 'Q&A', 'Academics', 'Fees', 'Scholarships', 'Campus Life', 'Faculty'];

export default function NewThreadForm({ collegeId, onSubmit, loading }) {
  const [form, setForm] = useState({ title: '', body: '', tags: [] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleTag = (tag) => {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    onSubmit?.({ ...form, college_id: collegeId });
    setForm({ title: '', body: '', tags: [] });
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--outline-variant)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14, fontFamily: 'var(--font-body)',
    color: 'var(--on-surface)', background: 'var(--surface-container-lowest)',
    outline: 'none', resize: 'vertical',
    transition: 'border-color 0.2s',
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
      <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: 20, fontWeight: 700, color: 'var(--primary-container)', marginBottom: 18 }}>
        💬 Start a Discussion
      </h3>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
          Thread Title <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <input
          style={inputStyle}
          placeholder="e.g. What is the hostel condition like?"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
          Your Message <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <textarea
          style={{ ...inputStyle, minHeight: 100 }}
          placeholder="Share your question or experience..."
          value={form.body}
          onChange={e => set('body', e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 8 }}>
          Tags
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {THREAD_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`chip ${form.tags.includes(tag) ? 'chip-active' : ''}`}
              style={{
                cursor: 'pointer',
                border: '1px solid',
                borderColor: form.tags.includes(tag) ? 'var(--primary-container)' : 'transparent',
                background: form.tags.includes(tag) ? 'rgba(0,33,71,0.1)' : 'var(--surface-container)',
                fontWeight: form.tags.includes(tag) ? 700 : 500,
                transition: 'all 0.15s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading || !form.title.trim() || !form.body.trim()} style={{ fontSize: 14, padding: '10px 22px' }}>
        {loading ? 'Posting…' : <><CornerDownLeft  />Post Thread</>}
      </button>
    </form>
  );
}
