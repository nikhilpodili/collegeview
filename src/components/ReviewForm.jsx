import { useState } from 'react';
import { useToast } from './Toast';
import { PencilLine } from 'lucide-react';
const RATING_LABELS = {
  overall_rating: 'Overall Experience',
  academic_rating: 'Academics',
  placement_rating: 'Placements',
  infrastructure_rating: 'Infrastructure',
  social_life_rating: 'Social Life',
  faculty_rating: 'Faculty',
  value_for_money_rating: 'Value for Money',
};

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{ cursor: 'pointer', fontSize: 22, color: i <= (hover || value) ? '#f59e0b' : 'var(--outline-variant)', transition: 'color 0.15s' }}
        >★</span>
      ))}
    </span>
  );
}

const AVAILABLE_TAGS = ['Academics', 'Campus Life', 'Faculty', 'Placements', 'Infrastructure', 'Hostel', 'Food', 'Sports', 'Research', 'Library'];


export default function ReviewForm({ collegeId, onSubmit, loading }) {
  const [form, setForm] = useState({
    overall_rating: 0, academic_rating: 0, placement_rating: 0,
    infrastructure_rating: 0, social_life_rating: 0,
    faculty_rating: 0, value_for_money_rating: 0,
    title: '', pros: '', cons: '', body: '',
    course_studied: '', start_year: '', end_year: '', is_alumni: false, tags: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const { showToast } = useToast();

  const validate = () => {
    if (!form.overall_rating) {
      showToast('Please provide an overall rating.', 'warning');
      return false;
    }
    if (!form.course_studied.trim()) {
      showToast('Please enter the course you studied.', 'warning');
      return false;
    }
    if (!form.start_year || !form.end_year || form.start_year < 1950 || form.end_year > new Date().getFullYear() + 6 || parseInt(form.start_year) > parseInt(form.end_year)) {
      showToast('Please enter a valid study period (e.g. 2023 - 2027).', 'warning');
      return false;
    }
    if (form.title.trim().length < 10) {
      showToast('Review title must be at least 10 characters.', 'warning');
      return false;
    }
    if (form.title.trim().length > 100) {
      showToast('Review title is too long (max 100 chars).', 'warning');
      return false;
    }
    if (form.pros.trim().length < 8) {
      showToast('Pros section must be at least 8 characters.', 'warning');
      return false;
    }
    if (form.cons.trim().length < 8) {
      showToast('Cons section must be at least 8 characters.', 'warning');
      return false;
    }
    if (form.body.trim().length > 0 && form.body.trim().length < 20) {
      showToast('Detailed review must be at least 20 characters if provided.', 'warning');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCourseStudied = `${form.course_studied.trim()} (${form.start_year}-${form.end_year})`;
    const submitData = { ...form, course_studied: finalCourseStudied, college_id: collegeId, batch_year: null };
    delete submitData.start_year;
    delete submitData.end_year;

    onSubmit?.(submitData);
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
    <form onSubmit={handleSubmit} className="card" style={{ 
      padding: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: 22, fontWeight: 700, color: 'var(--primary-container)', margin: 0 }}>
          Write a Review
        </h2>
      </div>

      <div style={{ padding: '16px 20px', overflowY: 'auto', flexGrow: 1 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {Object.entries(RATING_LABELS).map(([key, label]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 2 }}>
                {label} {key === 'overall_rating' && <span style={{ color: 'var(--error)' }}>*</span>}
              </label>
              <StarPicker value={form[key]} onChange={v => set(key, v)} />
            </div>
          ))}
        </div>

    
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Course Studied</label>
            <input style={inputStyle} placeholder="e.g. B.Tech CE" value={form.course_studied} onChange={e => set('course_studied', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>From Year</label>
              <input style={inputStyle} type="number" placeholder="e.g. 2023" min="1950" max="2040" value={form.start_year} onChange={e => set('start_year', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>To Year</label>
              <input style={inputStyle} type="number" placeholder="e.g. 2027" min="1950" max="2040" value={form.end_year} onChange={e => set('end_year', e.target.value)} />
            </div>
          </div>
        </div>

      
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
          <input type="checkbox" checked={form.is_alumni} onChange={e => set('is_alumni', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary-container)' }} />
          <span style={{ color: 'var(--on-surface-variant)' }}>I am an alumni of this college</span>
        </label>

       
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>
            Review Title <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            style={inputStyle}
            placeholder="Summarise your experience..."
            value={form.title}
            onChange={e => set('title', e.target.value)}
            maxLength={100}
            required
          />
          <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            {form.title.length}/100
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#005c2b', display: 'block', marginBottom: 4 }}>👍 Pros</label>
            <textarea
              style={{ ...inputStyle, minHeight: 50, fontSize: 13 }}
              placeholder="What did you like?"
              value={form.pros}
              onChange={e => set('pros', e.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label style={{ fontSize: 15, fontWeight: 600, color: 'var(--error)', display: 'block', marginBottom: 4 }}>👎 Cons</label>
            <textarea
              style={{ ...inputStyle, minHeight: 50, fontSize: 13 }}
              placeholder="What could be better?"
              value={form.cons}
              onChange={e => set('cons', e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

  
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 8 }}>Tags (Select up to 5)</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {AVAILABLE_TAGS.map(tag => {
              const isSelected = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      set('tags', form.tags.filter(t => t !== tag));
                    } else if (form.tags.length < 5) {
                      set('tags', [...form.tags, tag]);
                    }
                  }}
                  className={`chip ${isSelected ? 'chip-active' : ''}`}
                  style={{
                    fontSize: 13, padding: '4px 12px', borderRadius: 'var(--r-full)',
                    border: `1px solid ${isSelected ? 'var(--oxford)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--oxford)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    fontWeight: isSelected ? 600 : 500
                  }}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Detailed Review</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100 }}
            placeholder="Share your full experience... "
            value={form.body}
            onChange={e => set('body', e.target.value)}
            maxLength={1000}
          />
          <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            {form.body.length}/1000
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface-container-lowest)' }}>
        <button type="submit" className="btn btn-saffron" disabled={loading || !form.overall_rating || !form.title.trim()} style={{ fontSize: 15, padding: '12px 28px', width: '100%', justifyContent: 'center' }}>
          {loading ? 'Submitting…' : <><PencilLine />Submit Review</>}
        </button>
      </div>
    </form>
  );
}
