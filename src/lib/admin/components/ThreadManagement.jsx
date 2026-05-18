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
  Lock,
  Unlock
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useThreadData, THREAD_COLUMNS } from '../hooks/useThreadData';
import { useReplyData, REPLY_COLUMNS } from '../hooks/useReplyData';

const PAGE_SIZE = 15;

const INITIAL_VISIBLE_COLUMNS = ['id', 'author', 'college', 'title', 'status', 'reply_count', 'is_approved', 'created_at'];

export default function ThreadManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, open, closed
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const pickerRef = useRef(null);
  const { showToast } = useToast();

  const {
    threads,
    loading,
    error,
    totalCount,
    totalPages,
    refetch,
    updateThread,
    deleteThread,
  } = useThreadData({
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
      await updateThread(id, { is_approved: isApproved });
      showToast(`Thread ${isApproved ? 'approved' : 'unapproved'} successfully`, 'success');
      setOpenActionMenuId(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateThread(id, { status: newStatus });
      showToast(`Thread ${newStatus} successfully`, 'success');
      setOpenActionMenuId(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) return;
    try {
      await deleteThread(id);
      showToast('Thread deleted successfully', 'success');
      setOpenActionMenuId(null);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const tableMinWidth = visibleColumns.reduce((sum, id) => {
    const col = THREAD_COLUMNS.find(c => c.id === id);
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

  const renderCell = (thread, colId) => {
    const val = thread[colId];

    if (colId === 'author') {
      const avatarUrl = thread.profiles?.avatar_url;
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
              {(thread.author_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {thread.author_name || 'Unknown User'}
            </span>
          </div>
        </div>
      );
    }

    if (colId === 'college') {
      if (!thread.college_name) return <span style={{ color: '#94a3b8', fontSize: '13px' }}>Global (No College)</span>;
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {thread.college_name}
          </span>
        </div>
      );
    }

    if (colId === 'status') {
      const isOpen = val === 'open';
      return (
        <span style={{
          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
          background: isOpen ? '#eff6ff' : '#f1f5f9', color: isOpen ? '#2563eb' : '#64748b',
          display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
        }}>
          {isOpen ? <Unlock size={14} /> : <Lock size={14} />}
          {val}
        </span>
      );
    }

    if (colId === 'is_approved') {
      return (
        <span style={{
          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
          background: val ? '#dcfce7' : '#f1f5f9', color: val ? '#15803d' : '#64748b',
          display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
          {val ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {val ? 'APPROVED' : 'PENDING'}
        </span>
      );
    }

    if (colId === 'tags') {
      const tags = val || [];
      return (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ padding: '2px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{tag}</span>
          ))}
          {tags.length > 2 && <span style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>+{tags.length - 2}</span>}
          {tags.length === 0 && <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>}
        </div>
      );
    }

    if (colId === 'body' || colId === 'title') {
      return <div style={{ wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.4', maxHeight: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: colId === 'title' ? '#1e293b' : '#475569', fontWeight: colId === 'title' ? 600 : 400 }}>{val || '—'}</div>;
    }

    if (colId === 'reply_count') {
      return <span style={{ fontWeight: 600, color: '#0f172a', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', display: 'inline-block' }}>💬 {val || 0}</span>;
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
    return <div>Error loading threads: {error}</div>;
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
            placeholder="Search threads..."
            style={{ border: 'none', outline: 'none', padding: '8px 12px', fontSize: '14px', width: '100%' }}
          />

        </form>

        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px', gap: '4px', overflowX: 'auto' }}>
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
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />
          <button
            onClick={() => { setFilterStatus('open'); setPage(0); }}
            style={{ padding: '6px 12px', border: 'none', background: filterStatus === 'open' ? '#eff6ff' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: filterStatus === 'open' ? '#2563eb' : '#64748b' }}
          >
            Open
          </button>
          <button
            onClick={() => { setFilterStatus('closed'); setPage(0); }}
            style={{ padding: '6px 12px', border: 'none', background: filterStatus === 'closed' ? '#f1f5f9' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: filterStatus === 'closed' ? '#475569' : '#64748b' }}
          >
            Closed
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
                  onClick={() => setVisibleColumns(visibleColumns.length === THREAD_COLUMNS.length ? INITIAL_VISIBLE_COLUMNS : THREAD_COLUMNS.map(c => c.id))}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {visibleColumns.length === THREAD_COLUMNS.length ? 'Reset' : 'Select All'}
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {THREAD_COLUMNS.map(col => (
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
                const col = THREAD_COLUMNS.find(c => c.id === colId);
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
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading Threads...</td></tr>
            ) : threads.length === 0 ? (
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No records found.</td></tr>
            ) : threads.map((thread, idx) => (
              <tr key={thread.id}
                onClick={() => setSelectedThreadId(prev => prev === thread.id ? null : thread.id)}
                style={{
                  background: selectedThreadId === thread.id ? '#e0f2fe' : (idx % 2 === 0 ? '#fff' : '#fcfcfc'),
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer'
                }}>
                <td style={tdStyle} onClick={(e) => e.stopPropagation()}> <input type="checkbox" /> </td>
                {visibleColumns.map(colId => (
                  <td key={colId} style={tdStyle}>
                    {renderCell(thread, colId)}
                  </td>
                ))}
                <td style={{ ...tdStyle, textAlign: 'center', borderLeft: '1px solid #f1f5f9' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => setOpenActionMenuId(openActionMenuId === thread.id ? null : thread.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '8px' }}
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openActionMenuId === thread.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: '0', zIndex: 150,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '180px', padding: '4px'
                      }}>
                        {!thread.is_approved ? (
                          <button
                            onClick={() => handleApprove(thread.id, true)}
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
                            onClick={() => handleApprove(thread.id, false)}
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
                          onClick={() => handleStatusToggle(thread.id, thread.status)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '10px 14px', border: 'none', background: 'transparent',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            color: '#3b82f6', textAlign: 'left', marginTop: '4px'
                          }}
                        >
                          {thread.status === 'open' ? <Lock size={16} /> : <Unlock size={16} />}
                          {thread.status === 'open' ? 'Close Thread' : 'Open Thread'}
                        </button>
                        <button
                          onClick={() => handleDelete(thread.id)}
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

      {/* ── Replies Section ── */}
      {selectedThreadId && (
        <div style={{ marginTop: '24px' }}>
          <ReplyManagementSection threadId={selectedThreadId} onClose={() => setSelectedThreadId(null)} />
        </div>
      )}
    </div>
  );
}

// Reply Management Sub-component
function ReplyManagementSection({ threadId, onClose }) {
  const [page, setPage] = useState(0);
  const { showToast } = useToast();

  const {
    replies,
    loading,
    error,
    totalCount,
    totalPages,
    refetch,
    updateReply,
    deleteReply
  } = useReplyData(threadId, {
    page,
    pageSize: 10,
    sortKey: 'created_at',
    sortDir: 'asc'
  });

  const handleApprove = async (id, isApproved) => {
    try {
      await updateReply(id, { is_approved: isApproved });
      showToast(`Reply ${isApproved ? 'approved' : 'unapproved'} successfully`, 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    try {
      await deleteReply(id);
      showToast('Reply deleted successfully', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const renderCell = (reply, colId) => {
    const val = reply[colId];

    if (colId === 'author') {
      const avatarUrl = reply.profiles?.avatar_url;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
              alt=""
            />
          ) : (
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--oxford)', color: '#fff', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800
            }}>
              {(reply.author_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {reply.author_name || 'Unknown User'}
            </span>
          </div>
        </div>
      );
    }

    if (colId === 'is_approved') {
      return (
        <button
          onClick={() => handleApprove(reply.id, !val)}
          style={{
            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            background: val ? '#dcfce7' : '#f1f5f9', color: val ? '#15803d' : '#64748b',
            display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer'
          }}
        >
          {val ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {val ? 'APPROVED' : 'PENDING'}
        </button>
      );
    }

    if (colId === 'body') {
      return <div style={{ wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.4', maxHeight: '50px', overflow: 'auto', color: '#475569' }}>{val || '—'}</div>;
    }

    if (colId === 'upvotes') {
      return <span style={{ fontWeight: 600, color: '#0f172a', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', display: 'inline-block' }}>👍 {val || 0}</span>;
    }

    if (colId === 'created_at') {
      return <span style={{ color: '#64748b', fontSize: '13px' }}>{new Date(val).toLocaleString()}</span>;
    }

    if (colId === 'id') {
      return (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>
          {val.substring(0, 8)}...
        </span>
      );
    }

    return <div style={{ fontSize: '13px' }}>{val}</div>;
  };

  const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' };
  const tdStyle = { padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' };

  if (error) return <div style={{ padding: '16px', color: '#ef4444' }}>Error: {error}</div>;

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', overflow: 'hidden', position: 'relative' }}>
      <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Replies ({totalCount})</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={refetch} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }} title="Refresh Replies">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#475569', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Close Replies">
            <XCircle size={16} />
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '800px' }}>
          <thead>
            <tr>
              {REPLY_COLUMNS.map(col => (
                <th key={col.id} style={{ ...thStyle, width: `${col.width}px` }}>{col.label}</th>
              ))}
              <th style={{ ...thStyle, width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={REPLY_COLUMNS.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Replies...</td></tr>
            ) : replies.length === 0 ? (
              <tr><td colSpan={REPLY_COLUMNS.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No replies found for this thread.</td></tr>
            ) : replies.map(reply => (
              <tr key={reply.id}>
                {REPLY_COLUMNS.map(col => (
                  <td key={col.id} style={tdStyle}>{renderCell(reply, col.id)}</td>
                ))}
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleDelete(reply.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Page {page + 1} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}>Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
