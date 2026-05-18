import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../hooks/supabase';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Columns,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  UserX,
  UserCheck,
  ShieldCheck,
  Check,
  X,
  Copy,
  User
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useUserData, USER_COLUMNS } from '../hooks/useUserData'; 

const PAGE_SIZE = 15;
const INITIAL_VISIBLE_COLUMNS = ['id', 'full_name', 'username', 'gender', 'email', 'is_admin', 'is_verified', 'is_blocked', 'saved_colleges'];

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const pickerRef = useRef(null);
  const { showToast } = useToast();


  const {
    users,
    loading,
    error,
    totalCount,
    totalPages,
    refetch: refetchUsers,
  } = useUserData({
    sortKey: sortConfig.key,
    sortDir: sortConfig.direction,
    searchQuery,
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

  const updateUser = async (userId, updates) => {
    const idsToUpdate = selectedUsers.includes(userId) ? selectedUsers : [userId];

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .in('id', idsToUpdate);

      if (error) throw error;

      showToast(`Successfully updated ${idsToUpdate.length} user(s)`, 'success');
      refetchUsers();
      if (selectedUsers.includes(userId)) {
        setSelectedUsers([]); 
      }
    } catch (err) {
      console.error('Update Error:', err);
      if (err.message?.includes('profiles_username_key')) {
        showToast('This username is already taken by another user.', 'error');
      } else {
        showToast(`Error: ${err.message}`, 'error');
      }
    }
  };

  const tableMinWidth = visibleColumns.reduce((sum, id) => {
    const col = USER_COLUMNS.find(c => c.id === id);
    return sum + (col?.width || 150);
  }, 100);


  const [openSavedCollegesDropdown, setOpenSavedCollegesDropdown] = useState(null);
  const [savedCollegesData, setSavedCollegesData] = useState({});
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const renderCell = (user, colId, updateUserFunc) => { 
    const val = user[colId];

    if (colId === 'full_name') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(val || 'U')}&background=random`}
            style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }}
            alt=""
          />
          <span style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {val || 'No Name'}
          </span>
        </div>
      );
    }

    if (colId === 'gender') {
      const displayVal = (val === 'null' || !val || val === '—') ? '—' : val;
      const gender = displayVal?.toLowerCase();
      const isMale = gender === 'male';
      const isFemale = gender === 'female';
      const isOther = gender === 'other';

      return (
        <span style={{
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          background: isMale ? '#e0f2fe' : isFemale ? '#fdf2f8' : isOther ? '#f3f4f6' : '#f1f5f9',
          color: isMale ? '#0369a1' : isFemale ? '#be185d' : isOther ? '#4b5563' : '#64748b',
          border: `1px solid ${isMale ? '#bae6fd' : isFemale ? '#fbcfe8' : isOther ? '#e5e7eb' : '#e2e8f0'}`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <User size={14} style={{ opacity: 0.7 }} />
          {displayVal}
        </span>
      );
    }

    if (colId === 'is_admin' || colId === 'is_verified') {
      return (
        <button
          onClick={() => updateUserFunc(user.id, { [colId]: !val })}
          style={{
            border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', 
            background: val ? '#dcfce7' : '#f1f5f9', color: val ? '#15803d' : '#64748b',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          {val ? <Check size={16} /> : <X size={16} />}
          {val ? 'TRUE' : 'FALSE'}
        </button>
      );
    }

    if (colId === 'saved_colleges') {
      const colleges = val || []; 
      const hasColleges = colleges.length > 0;

      return (
        <div style={{ position: 'relative' }} ref={hasColleges ? dropdownRef : null}> 
          <button
            onClick={() => {
              if (hasColleges) {
                setOpenSavedCollegesDropdown(
                  openSavedCollegesDropdown === user.id ? null : user.id
                );
                if (openSavedCollegesDropdown !== user.id) {
                  setSavedCollegesData(prev => ({
                    ...prev,
                    [user.id]: colleges
                  }));
                }
              }
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              background: hasColleges ? '#e0e7ff' : '#f1f5f9',
              color: hasColleges ? '#4f46e5' : '#94a3b8',
              display: 'inline-block',
              border: 'none',
              cursor: hasColleges ? 'pointer' : 'default',
              textAlign: 'center',
              minWidth: '100px',
            }}
            disabled={!hasColleges} 
          >
            {hasColleges ? `${colleges.length} College${colleges.length > 1 ? 's' : ''}` : 'None'}
          </button>
          
          {openSavedCollegesDropdown === user.id && hasColleges && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 150,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
              minWidth: '200px', 
              maxWidth: '300px',
              maxHeight: '200px', 
              overflowY: 'auto',
            }}>
              <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '12px', color: '#64748b' }}>
                Saved Colleges
              </div>
              {savedCollegesData[user.id]?.map((sc, index) => (
                <div
                  key={index} 
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    borderBottom: index < savedCollegesData[user.id].length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'default',
                  }}
                >
                  {sc.colleges?.name || sc.colleges?.short_name || 'Unnamed College'}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (colId === 'is_blocked') {
      const isBlocked = user.is_blocked; 
      return (
        <span style={{
          padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, 
          background: isBlocked ? '#fef2f2' : '#f0fdf4', color: isBlocked ? '#ef4444' : '#10b981',
          border: `1px solid ${isBlocked ? '#fee2e2' : '#dcfce7'}`,
          display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
          {isBlocked ? <UserX size={14} /> : <ShieldCheck size={14} />}
          {isBlocked ? 'BLOCKED' : 'ACTIVE'}
        </span>
      );
    }

    if (colId === 'created_at') {
      return <span style={{ color: '#64748b', fontSize: '14px' }}>{new Date(val).toLocaleDateString()}</span>; 
    }

    if (colId === 'saved_colleges') {
      const colleges = val || []; 
      return (
        <span style={{
          padding: '6px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: 600,  
          background: '#e0e7ff', color: '#4f46e5', display: 'inline-block'
        }}>
          {colleges.length} Colleges
        </span>
      );
    }

    if (colId === 'id') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#64748b' }}>
            {val.substring(0, 8)}...
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(val)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            title="Copy full ID"
          >
            <Copy size={16} /> 
          </button>
        </div>
      );
    }

    return <div style={{ wordBreak: 'break-word', fontSize: '14px', lineHeight: '1.4' }}>{val || '—'}</div>;
  };


  const thStyle = {
    padding: '18px 24px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 800,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    border: '1px solid #e2e8f0'
  };
  const tdStyle = {
    padding: '18px 24px',
    fontSize: '14px',
    color: '#334155',
    border: '1px solid #e2e8f0',
    verticalAlign: 'top'
  };
  const pageBtnStyle = {
    width: '40px', 
    height: '40px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  };

  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '700px', 
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>

 
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', gap: '16px', background: '#f8fafc', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 12px', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            style={{ border: 'none', outline: 'none', padding: '8px 12px', fontSize: '14px', width: '100%' }}
          />

        </form>

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
                  onClick={() => setVisibleColumns(visibleColumns.length === USER_COLUMNS.length ? INITIAL_VISIBLE_COLUMNS : USER_COLUMNS.map(c => c.id))}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {visibleColumns.length === USER_COLUMNS.length ? 'Reset' : 'Select All'}
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                
                {USER_COLUMNS.map(col => (
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

        <button onClick={refetchUsers} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b' }}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>


    
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <table style={{ minWidth: `${tableMinWidth + 100}px`, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 100, background: '#f8fafc' }}>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ ...thStyle, width: '60px' }}> </th> 
              {visibleColumns.map(colId => {
                const col = USER_COLUMNS.find(c => c.id === colId);
                return (
                  <th
                    key={colId}
                    style={{ ...thStyle, width: `${col?.width}px`, cursor: colId === 'saved_colleges' ? 'default' : 'pointer' }}
                    onClick={() => colId !== 'saved_colleges' && toggleSort(colId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col?.label}
                      {colId !== 'saved_colleges' && sortConfig.key === colId && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </div>
                  </th>
                );
              })}
        
              <th style={{ ...thStyle, width: '120px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading Users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No records found.</td></tr>
            ) : users.map((user, idx) => (
              <tr key={user.id} style={{
                background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {
                      setSelectedUsers(prev =>
                        prev.includes(user.id)
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id]
                      );
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                {visibleColumns.map(colId => (
                  <td key={colId} style={tdStyle}>
                    {renderCell(user, colId, updateUser)}
                  </td>
                ))}
                
                <td style={{ ...tdStyle, textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={() => setOpenActionMenuId(openActionMenuId === user.id ? null : user.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '8px' }}
                    >
                      <MoreVertical size={20} /> 
                    </button>

                    {openActionMenuId === user.id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: '0', zIndex: 150,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '180px', padding: '4px' 
                      }}>
                        <button
                          onClick={() => {
                            const isCurrentlyBlocked = user.is_blocked;
                            const newVal = isCurrentlyBlocked ? 'false' : 'true';
                            updateUser(user.id, { is_blocked: newVal });
                            setOpenActionMenuId(null);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '10px 14px', border: 'none', background: 'transparent',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                            color: user.is_blocked ? '#10b981' : '#ef4444',
                            textAlign: 'left'
                          }}
                        >
                          {user.is_blocked ? <UserCheck size={16} /> : <UserX size={16} />}
                          {user.is_blocked ? 'Unblock User' : 'Block User'}
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

      <div style={{
        padding: '16px 24px',
        borderTop: '2px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
          Showing <b style={{ color: '#1e293b' }}>{totalCount === 0 ? 0 : (page * PAGE_SIZE) + 1}</b> to <b style={{ color: '#1e293b' }}>{Math.min((page + 1) * PAGE_SIZE, totalCount)}</b> of <b style={{ color: '#1e293b' }}>{totalCount}</b> results
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <button
            disabled={page === 0 || loading}
            onClick={() => setPage(0)}
            style={{ ...pageBtnStyle, opacity: (page === 0 || loading) ? 0.4 : 1, cursor: (page === 0 || loading) ? 'not-allowed' : 'pointer' }}
            title="First Page"
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
            
              if (
                i === 0 ||
                i === totalPages - 1 ||
                (i >= page - 1 && i <= page + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      ...pageBtnStyle,
                      background: page === i ? '#4f46e5' : '#fff',
                      color: page === i ? '#fff' : '#64748b',
                      borderColor: page === i ? '#4f46e5' : '#cbd5e1',
                      fontWeight: page === i ? 700 : 500,
                      width: '40px'
                    }}
                  >
                    {i + 1}
                  </button>
                );
              } else if (
                (i === 1 && page > 2) ||
                (i === totalPages - 2 && page < totalPages - 3)
              ) {
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
            title="Last Page"
          >
            <ChevronRight size={16} /><ChevronRight size={16} style={{ marginLeft: '-10px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}