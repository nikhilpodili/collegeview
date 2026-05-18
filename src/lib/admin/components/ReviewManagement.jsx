import { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Columns,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Copy,
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useReviewData, REVIEW_COLUMNS } from '../hooks/useReviewData';

const PAGE_SIZE = 15;

const INITIAL_VISIBLE_COLUMNS = ['id', 'user', 'college', 'course_studied', 'title', 'overall_rating', 'is_approved', 'created_at'];

export default function ReviewManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const pickerRef = useRef(null);
  const { showToast } = useToast();

  const {
    reviews,
    loading,
    error,
    totalCount,
    totalPages,
    refetch,
    updateReview,
    deleteReview,
  } = useReviewData({
    sortKey: sortConfig.key,
    sortDir: sortConfig.direction,
    searchQuery,
    filterStatus,
    page,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleApprove = async (id, isApproved) => {
    try {
      await updateReview(id, { is_approved: isApproved });
      showToast(`Review ${isApproved ? 'approved' : 'rejected'} successfully`, 'success');
      setOpenActionMenuId(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      showToast('Review deleted successfully', 'success');
      setOpenActionMenuId(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const tableMinWidth = visibleColumns.reduce((sum, id) => {
    const col = REVIEW_COLUMNS.find(c => c.id === id);
    return sum + (col?.width || 150);
  }, 100);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderCell = (review, colId) => {
    const val = review[colId];

    if (colId === 'user') {
      const avatarUrl = review.profiles?.avatar_url;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
              alt=""
            />
          ) : (
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--oxford)', color: '#fff', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800
            }}>
              {(review.user_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {review.user_name || 'Unknown User'}
            </span>
          </div>
        </div>
      );
    }

    if (colId === 'college') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {review.college_name || 'Unknown College'}
          </span>
        </div>
      );
    }

    if (['overall_rating', 'academic_rating', 'placement_rating', 'infrastructure_rating', 'social_life_rating', 'faculty_rating', 'value_for_money_rating'].includes(colId)) {
      const numVal = parseFloat(val);
      return (
        <span style={{
          padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
          background: numVal >= 7 ? '#f0fdf4' : numVal >= 4 ? '#fefce8' : '#fef2f2',
          color: numVal >= 7 ? '#166534' : numVal >= 4 ? '#854d0e' : '#991b1b',
          display: 'inline-flex', alignItems: 'center'
        }}>
          ⭐ {val ? `${val}/10` : 'N/A'}
        </span>
      );
    }

    if (['is_approved', 'is_verified', 'is_alumni'].includes(colId)) {
      return (
        <span style={{
          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
          background: val ? '#dcfce7' : '#f1f5f9', color: val ? '#15803d' : '#64748b',
          display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
          {val ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {val ? 'YES' : 'NO'}
        </span>
      );
    }

    if (colId === 'tags') {
      const tags = val || [];
      return (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: '8px', fontSize: '16px', color: '#64748b', whiteSpace: 'nowrap' }}>{tag}</span>
          ))}
          {tags.length > 2 && <span style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontSize: '11px', color: '#475569' }}>+{tags.length - 2}</span>}
          {tags.length === 0 && <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>}
        </div>
      );
    }

    if (['pros', 'cons', 'body'].includes(colId)) {
      return <div style={{ wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.4', maxHeight: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#475569' }}>{val || '—'}</div>;
    }

    if (colId === 'helpful_count') {
      return <span style={{ fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', display: 'inline-block' }}>👍 {val || 0}</span>;
    }

    if (['created_at', 'updated_at'].includes(colId)) {
      return <span style={{ color: '#64748b', fontSize: '13px' }}>{val ? new Date(val).toLocaleDateString() : '—'}</span>;
    }

    if (colId === 'id') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>
            {val.substring(0, 8)}...
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(val)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            title="Copy full ID"
          >
            <Copy size={14} />
          </button>
        </div>
      );
    }

    return <div style={{ wordBreak: 'break-word', fontSize: '14px', lineHeight: '1.4' }}>{val || '—'}</div>;
  };

  const thStyle = { padding: '18px 24px', textAlign: 'left', fontSize: '14px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', border: '1px solid #e2e8f0' };
  const tdStyle = { padding: '18px 24px', fontSize: '14px', color: '#334155', border: '1px solid #e2e8f0', verticalAlign: 'top' };
  const pageBtnStyle = { width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' };

  if (error) {
    return <div>Error loading reviews: {error}</div>;
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '700px', background: '#fff',
      borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative'
    }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', gap: '16px', background: '#f8fafc', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 12px', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            style={{ border: 'none', outline: 'none', padding: '8px 12px', fontSize: '14px', width: '100%' }}
          />

        </form>

        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px', gap: '4px' }}>
          <button
            onClick={() => { setFilterStatus('all'); setPage(0); }}
            style={{ padding: '6px 12px', border: 'none', background: filterStatus === 'all' ? '#e2e8f0' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: filterStatus === 'all' ? '#1e293b' : '#64748b' }}
          >
            All
          </button>
          <button
            onClick={() => { setFilterStatus('pending'); setPage(0); }}
            style={{ padding: '6px 12px', border: 'none', background: filterStatus === 'pending' ? '#fef3c7' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: filterStatus === 'pending' ? '#b45309' : '#64748b' }}
          >
            Pending
          </button>
          <button
            onClick={() => { setFilterStatus('approved'); setPage(0); }}
            style={{ padding: '6px 12px', border: 'none', background: filterStatus === 'approved' ? '#dcfce7' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: filterStatus === 'approved' ? '#15803d' : '#64748b' }}
          >
            Approved
          </button>
        </div>

        <div style={{ position: 'relative' }} ref={pickerRef}>
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', fontSize: '13px' }}
          >
            <Columns size={16} /> Columns <ChevronDown size={14} />
          </button>

          {showColumnPicker && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#fff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px',
              zIndex: 200, minWidth: '250px', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Select Columns</div>
                <button
                  onClick={() => setVisibleColumns(visibleColumns.length === REVIEW_COLUMNS.length ? INITIAL_VISIBLE_COLUMNS : REVIEW_COLUMNS.map(c => c.id))}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {visibleColumns.length === REVIEW_COLUMNS.length ? 'Reset' : 'Select All'}
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {REVIEW_COLUMNS.map(col => (
                  <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.id)}
                      onChange={() => setVisibleColumns(prev => prev.includes(col.id) ? prev.filter(c => c !== col.id) : [...prev, col.id])}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={refetch} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b' }}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Table Container ── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <table style={{ minWidth: `${tableMinWidth + 100}px`, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 100, background: '#f8fafc' }}>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ ...thStyle, width: '60px' }}> <input type="checkbox" /> </th>
              {visibleColumns.map(colId => {
                const col = REVIEW_COLUMNS.find(c => c.id === colId);
                return (
                  <th key={colId} style={{ ...thStyle, width: `${col?.width}px` }} onClick={() => toggleSort(colId)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col?.label}
                      {sortConfig.key === colId && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </div>
                  </th>
                );
              })}
              <th style={{ ...thStyle, width: '120px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading Reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No records found.</td></tr>
            ) : reviews.map((review, idx) => (
              <tr key={review.id} style={{
                background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <td style={tdStyle}> <input type="checkbox" /> </td>
                {visibleColumns.map(colId => (
                  <td key={colId} style={tdStyle}>
                    {renderCell(review, colId)}
                  </td>
                ))}
                <td style={{ ...tdStyle, textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => setOpenActionMenuId(openActionMenuId === review.id ? null : review.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '8px' }}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openActionMenuId === review.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: '0', zIndex: 150,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '160px', padding: '4px'
                      }}>
                        {!review.is_approved ? (
                          <button
                            onClick={() => handleApprove(review.id, true)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                              padding: '10px 14px', border: 'none', background: 'transparent',
                              borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                              color: '#10b981', textAlign: 'left'
                            }}
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(review.id, false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                              padding: '10px 14px', border: 'none', background: 'transparent',
                              borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                              color: '#f59e0b', textAlign: 'left'
                            }}
                          >
                            <XCircle size={16} /> Unapprove
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '10px 14px', border: 'none', background: 'transparent',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            color: '#ef4444', textAlign: 'left', marginTop: '4px'
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '16px 24px', borderTop: '2px solid #e2e8f0', background: '#f8fafc',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
          Showing <b style={{ color: '#1e293b' }}>{totalCount === 0 ? 0 : (page * PAGE_SIZE) + 1}</b> to <b style={{ color: '#1e293b' }}>{Math.min((page + 1) * PAGE_SIZE, totalCount)}</b> of <b style={{ color: '#1e293b' }}>{totalCount}</b> results
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage(0)}
            style={{ ...pageBtnStyle, opacity: (page === 0 || loading) ? 0.4 : 1, cursor: (page === 0 || loading) ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={16} /><ChevronLeft size={16} style={{ marginLeft: '-10px' }} />
          </button>
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            style={{ ...pageBtnStyle, opacity: (page === 0 || loading) ? 0.4 : 1, cursor: (page === 0 || loading) ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[...Array(totalPages)].map((_, i) => {
              if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                return (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{ ...pageBtnStyle, background: page === i ? '#4f46e5' : '#fff', color: page === i ? '#fff' : '#64748b', borderColor: page === i ? '#4f46e5' : '#cbd5e1', fontWeight: page === i ? 700 : 500, width: '40px' }}
                  >
                    {i + 1}
                  </button>
                );
              } else if ((i === 1 && page > 2) || (i === totalPages - 2 && page < totalPages - 3)) {
                return <span key={i} style={{ color: '#94a3b8', padding: '0 4px' }}>...</span>;
              }
              return null;
            })}
          </div>

          <button
            disabled={(page + 1) * PAGE_SIZE >= totalCount || loading}
            onClick={() => setPage(p => p + 1)}
            style={{ ...pageBtnStyle, opacity: ((page + 1) * PAGE_SIZE >= totalCount || loading) ? 0.4 : 1, cursor: ((page + 1) * PAGE_SIZE >= totalCount || loading) ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={20} />
          </button>
          <button
            disabled={(page + 1) * PAGE_SIZE >= totalCount || loading}
            onClick={() => setPage(totalPages - 1)}
            style={{ ...pageBtnStyle, opacity: ((page + 1) * PAGE_SIZE >= totalCount || loading) ? 0.4 : 1, cursor: ((page + 1) * PAGE_SIZE >= totalCount || loading) ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={16} /><ChevronRight size={16} style={{ marginLeft: '-10px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
