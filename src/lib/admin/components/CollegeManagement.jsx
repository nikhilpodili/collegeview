import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Columns,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Plus,
    Edit,
    Trash2,
    Copy,
    Save,
    X
} from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useCollegeData, COLLEGE_COLUMNS } from '../hooks/useCollegeData';
import { useCourseData, COURSE_COLUMNS } from '../hooks/useCourseData';

const PAGE_SIZE = 10;
const INITIAL_VISIBLE_COLLEGE_COLUMNS = [
    'name', 'short_name', 'city', 'state', 'nirf_ranking', 'naac_grade', 'total_courses', 'is_active'
];

const ALL_COLLEGE_FIELDS = [
    'name', 'short_name', 'slug', 'logo_url', 'banner_url',
    'established_year', 'college_type', 'ownership', 'address', 'city', 'state',
    'website_url', 'email', 'phone', 'nirf_ranking', 'nirf_rank_category',
    'naac_grade', 'total_seats', 'student_faculty_ratio',
    'avg_annual_fees', 'min_fees', 'max_fees',
    'hostel_fees_per_year', 'avg_package_lpa', 'highest_package_lpa', 'median_package_lpa',
    'placement_rate_pct', 'campus_area_acres', 'has_hostel', 'has_girls_hostel',
    'has_sports_complex', 'has_library', 'has_medical_facility', 'has_wifi', 'avg_rating',
    'is_featured', 'is_active'
];

export default function CollegeManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [visibleCollegeColumns, setVisibleCollegeColumns] = useState(INITIAL_VISIBLE_COLLEGE_COLUMNS);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [selectedCollegeId, setSelectedCollegeId] = useState(null); 
    const [editingCollegeId, setEditingCollegeId] = useState(null); 
    const [collegeEditData, setCollegeEditData] = useState({}); 
    const [isAddingCollege, setIsAddingCollege] = useState(false); 
    const [newCollegeData, setNewCollegeData] = useState({});

    const pickerRef = useRef(null);
    const { showToast } = useToast();

    const {
        colleges,
        loading: loadingColleges,
        error: errorColleges,
        totalCount: totalCollegeCount,
        totalPages: totalCollegePages,
        refetch: refetchColleges,
        createCollege,
        updateCollege,
        deleteCollege,
    } = useCollegeData({
        sortKey: sortConfig.key,
        sortDir: sortConfig.direction,
        searchQuery,
        page,
        pageSize: PAGE_SIZE,
    });

    const {
        courses,
        loading: loadingCourses,
        error: errorCourses,
        refetch: refetchCourses,
        createCourse,
        updateCourse,
        deleteCourse,
    } = useCourseData(selectedCollegeId);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
    };

    const toggleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const collegeTableMinWidth = visibleCollegeColumns.reduce((sum, id) => {
        const col = COLLEGE_COLUMNS.find(c => c.id === id);
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

    const startEditingCollege = (college) => {
        setEditingCollegeId(college.id);
        setCollegeEditData({ ...college });
    };

    const cancelEditingCollege = () => {
        setEditingCollegeId(null);
        setCollegeEditData({});
    };

    const saveEditedCollege = async () => {
        try {
            await updateCollege(editingCollegeId, collegeEditData);
            setEditingCollegeId(null);
            setCollegeEditData({});
            showToast('College updated successfully', 'success');
        } catch (err) {
            console.error('Update College Error:', err);
            showToast(`Error: ${err.message}`, 'error');
        }
    };

    const handleCollegeEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCollegeEditData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const startAddingCollege = () => {
        setIsAddingCollege(true);
        setNewCollegeData({
            name: '', short_name: '', slug: '', logo_url: '', banner_url: '',
            established_year: null, college_type: '', ownership: '', address: '', city: '', state: '',
            website_url: '', email: '', phone: '', nirf_ranking: null, nirf_rank_category: '',
            naac_grade: '', total_seats: null, student_faculty_ratio: null,
            avg_annual_fees: null, min_fees: null, max_fees: null,
            hostel_fees_per_year: null, avg_package_lpa: null, highest_package_lpa: null, median_package_lpa: null,
            placement_rate_pct: null, campus_area_acres: null, has_hostel: false, has_girls_hostel: false,
            has_sports_complex: false, has_library: false, has_medical_facility: false, has_wifi: false, avg_rating: null,
            is_featured: false, is_active: true
        });
    };

    const cancelAddingCollege = () => {
        setIsAddingCollege(false);
        setNewCollegeData({});
    };

    const saveNewCollege = async () => {
        try {
            await createCollege(newCollegeData);
            setIsAddingCollege(false);
            setNewCollegeData({});
            showToast('College created successfully', 'success');
        } catch (err) {
            console.error('Create College Error:', err);
            showToast(`Error: ${err.message}`, 'error');
        }
    };

    const handleNewCollegeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewCollegeData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const renderCollegeCell = (college, colId) => {
        const val = college[colId];
        const isEditing = editingCollegeId === college.id;

        if (colId === 'name' || colId === 'short_name') {
            if (isEditing) {
                return (
                    <input
                        name="name"
                        value={collegeEditData.name || ''}
                        onChange={handleCollegeEditChange}
                        style={{ width: '100%', padding: '4px', fontSize: '14px' }}
                    />
                );
            }
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    {college.logo_url && (
                        <img
                            src={college.logo_url}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }}
                            alt={`${college.name} Logo`}
                        />
                    )}
                    <span style={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {val || 'No Name'}
                    </span>
                </div>
            );
        }

        if (colId === 'is_active' || colId === 'is_featured' || colId === 'has_hostel' || colId === 'has_girls_hostel' || colId === 'has_sports_complex' || colId === 'has_library' || colId === 'has_medical_facility' || colId === 'has_wifi') {
            if (isEditing) {
                return (
                    <input
                        type="checkbox"
                        name={colId}
                        checked={!!collegeEditData[colId]}
                        onChange={handleCollegeEditChange}
                    />
                );
            }
            return (
                <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    background: val ? '#f0fdf4' : '#fef2f2', color: val ? '#10b981' : '#ef4444',
                    border: `1px solid ${val ? '#dcfce7' : '#fee2e2'}`,
                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}>
                    {val ? 'YES' : 'NO'}
                </span>
            );
        }

        if (colId === 'created_at' || colId === 'updated_at') {
            return <span style={{ color: '#64748b' }}>{new Date(val).toLocaleDateString()}</span>;
        }

        if (colId === 'total_courses') {
            return (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    background: '#e0e7ff', color: '#4f46e5', display: 'inline-block'
                }}>
                    {val} Courses
                </span>
            );
        }

        if (colId === 'id') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
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

        if (isEditing) {
            const fieldType = typeof college[colId];
            if (fieldType === 'boolean') {
                return (
                    <input
                        type="checkbox"
                        name={colId}
                        checked={!!collegeEditData[colId]}
                        onChange={handleCollegeEditChange}
                    />
                );
            } else if (fieldType === 'number' || colId.includes('_year') || colId.includes('_count') || colId.includes('_pct') || colId.includes('_rating') || colId.includes('_ratio') || colId.includes('_acres') || colId.includes('_lpa') || colId.includes('_fees')) {
                return (
                    <input
                        type="number"
                        name={colId}
                        value={collegeEditData[colId] || ''}
                        onChange={handleCollegeEditChange}
                        style={{ width: '100%', padding: '4px', fontSize: '14px' }}
                    />
                );
            } else if (colId === 'approvals' || colId === 'entrance_exams' || colId === 'top_recruiters') {
                return (
                    <input
                        name={colId}
                        value={Array.isArray(collegeEditData[colId]) ? collegeEditData[colId].join(',') : collegeEditData[colId] || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            const arr = val ? val.split(',').map(item => item.trim()) : [];
                            setCollegeEditData(prev => ({ ...prev, [colId]: arr }));
                        }}
                        style={{ width: '100%', padding: '4px', fontSize: '14px' }}
                        placeholder="Comma-separated values"
                    />
                );
            } else {
                return (
                    <input
                        name={colId}
                        value={collegeEditData[colId] || ''}
                        onChange={handleCollegeEditChange}
                        style={{ width: '100%', padding: '4px', fontSize: '14px' }}
                    />
                );
            }
        }

        if (colId === 'approvals' || colId === 'entrance_exams' || colId === 'top_recruiters') {
            const arr = Array.isArray(val) ? val : [];
            return (
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {arr.length > 0 ? arr.join(', ') : 'None'}
                </span>
            );
        }

        return <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>{val || '—'}</div>;
    };

    const thStyle = { padding: '18px 24px', textAlign: 'left', fontSize: '14px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' };
    const tdStyle = { padding: '18px 24px', fontSize: '14px', color: '#334155', overflow: 'hidden' };
    const pageBtnStyle = { width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' };

    if (errorColleges) {
        return <div>Error loading colleges: {errorColleges}</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            {/* College Management Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                width: '100%',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                position: 'relative'
            }}>
                {/* ── Toolbar ── */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', gap: '16px', background: '#f8fafc', flexWrap: 'wrap' }}>

                    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 12px', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search colleges..."
                            style={{ border: 'none', outline: 'none', padding: '8px 12px', fontSize: '14px', width: '100%' }}
                        />

                    </form>

                    <button
                        onClick={startAddingCollege}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '42px' }}
                    >
                        <Plus size={18} /> Add College
                    </button>

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
                                        onClick={() => setVisibleCollegeColumns(visibleCollegeColumns.length === COLLEGE_COLUMNS.length ? INITIAL_VISIBLE_COLLEGE_COLUMNS : COLLEGE_COLUMNS.map(c => c.id))}
                                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                    >
                                        {visibleCollegeColumns.length === COLLEGE_COLUMNS.length ? 'Reset' : 'Select All'}
                                    </button>
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {COLLEGE_COLUMNS.map(col => (
                                        <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={visibleCollegeColumns.includes(col.id)}
                                                onChange={() => setVisibleCollegeColumns(prev => prev.includes(col.id) ? prev.filter(c => c !== col.id) : [...prev, col.id])}
                                            />
                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={refetchColleges} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b' }}>
                        <RefreshCw size={18} className={loadingColleges ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* ── Add College Form (appears when adding) ── */}
                {isAddingCollege && (
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px' }}>Add New College</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                            {ALL_COLLEGE_FIELDS.map(fieldName => (
                                <div key={fieldName} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{fieldName.replace(/_/g, ' ').toUpperCase()}</label>
                                    {(() => {
                                        const val = newCollegeData[fieldName];
                                        const type = typeof val;
                                        if (type === 'boolean') {
                                            return (
                                                <input
                                                    type="checkbox"
                                                    name={fieldName}
                                                    checked={!!val}
                                                    onChange={handleNewCollegeChange}
                                                />
                                            );
                                        } else if (type === 'number' || fieldName.includes('_year') || fieldName.includes('_count') || fieldName.includes('_pct') || fieldName.includes('_rating') || fieldName.includes('_ratio') || fieldName.includes('_acres') || fieldName.includes('_lpa') || fieldName.includes('_fees')) {
                                            return (
                                                <input
                                                    type="number"
                                                    name={fieldName}
                                                    value={val || ''}
                                                    onChange={handleNewCollegeChange}
                                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                />
                                            );
                                        } else if (fieldName === 'approvals' || fieldName === 'entrance_exams' || fieldName === 'top_recruiters') {
                                            return (
                                                <input
                                                    name={fieldName}
                                                    value={Array.isArray(val) ? val.join(',') : val || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        const arr = v ? v.split(',').map(item => item.trim()) : [];
                                                        setNewCollegeData(prev => ({ ...prev, [fieldName]: arr }));
                                                    }}
                                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                    placeholder="Comma-separated values"
                                                />
                                            );
                                        } else {
                                            return (
                                                <input
                                                    name={fieldName}
                                                    value={val || ''}
                                                    onChange={handleNewCollegeChange}
                                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                />
                                            );
                                        }
                                    })()}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button
                                onClick={saveNewCollege}
                                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                <Save size={16} /> Save
                            </button>
                            <button
                                onClick={cancelAddingCollege}
                                style={{ padding: '8px 16px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                <X size={16} /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* ── College Table Container ── */}
                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    <table style={{ minWidth: `${collegeTableMinWidth + 100}px`, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 100, background: '#f8fafc' }}>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ ...thStyle, width: '50px' }}> # </th>
                                {visibleCollegeColumns.map(colId => {
                                    const col = COLLEGE_COLUMNS.find(c => c.id === colId);
                                    return (
                                        <th key={colId} style={{ ...thStyle, width: `${col?.width}px` }} onClick={() => toggleSort(colId)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {col?.label}
                                                {sortConfig.key === colId && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)} 
                                            </div>
                                        </th>
                                    );
                                })}
                                <th style={{ ...thStyle, width: '150px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingColleges ? (
                                <tr><td colSpan={visibleCollegeColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading Colleges...</td></tr>
                            ) : colleges.length === 0 ? (
                                <tr><td colSpan={visibleCollegeColumns.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No colleges found.</td></tr>
                            ) : colleges.map((college, idx) => (
                                <React.Fragment key={college.id}>
                                    <tr
                                        style={{
                                            background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                            backgroundColor: selectedCollegeId === college.id ? '#e0f2fe' : 'inherit'
                                        }}
                                        onClick={() => {
                                            if (editingCollegeId !== college.id) {
                                                setSelectedCollegeId(college.id === selectedCollegeId ? null : college.id);
                                            }
                                        }}
                                    >
                                        <td style={tdStyle}> {idx + 1 + page * PAGE_SIZE} </td> {/* Show correct row number accounting for pagination */}
                                        {visibleCollegeColumns.map(colId => (
                                            <td key={colId} style={tdStyle}>
                                                {renderCollegeCell(college, colId)}
                                            </td>
                                        ))}
                                        <td style={{ ...tdStyle, textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                                            {editingCollegeId === college.id ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={saveEditedCollege}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }}
                                                        title="Save"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditingCollege}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                        title="Cancel"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEditingCollege(college);
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Are you sure you want to delete this college and all its courses?')) {
                                                                deleteCollege(college.id);
                                                            }
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>


                {/* ── Footer ── */}
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
                        Showing <b style={{ color: '#1e293b' }}>{totalCollegeCount === 0 ? 0 : (page * PAGE_SIZE) + 1}</b> to <b style={{ color: '#1e293b' }}>{Math.min((page + 1) * PAGE_SIZE, totalCollegeCount)}</b> of <b style={{ color: '#1e293b' }}>{totalCollegeCount}</b> results
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* First Page */}
                        <button
                            disabled={page === 0 || loadingColleges}
                            onClick={() => setPage(0)}
                            style={{ ...pageBtnStyle, opacity: (page === 0 || loadingColleges) ? 0.4 : 1, cursor: (page === 0 || loadingColleges) ? 'not-allowed' : 'pointer' }}
                            title="First Page"
                        >
                            <ChevronLeft size={16} /><ChevronLeft size={16} style={{ marginLeft: '-10px' }} />
                        </button>

                        {/* Prev */}
                        <button
                            disabled={page === 0 || loadingColleges}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            style={{ ...pageBtnStyle, opacity: (page === 0 || loadingColleges) ? 0.4 : 1, cursor: (page === 0 || loadingColleges) ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Page Numbers */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {[...Array(totalCollegePages)].map((_, i) => {
                                if (
                                    i === 0 ||
                                    i === totalCollegePages - 1 ||
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
                                    (i === totalCollegePages - 2 && page < totalCollegePages - 3)
                                ) {
                                    return <span key={i} style={{ color: '#94a3b8', padding: '0 4px' }}>...</span>;
                                }
                                return null;
                            })}
                        </div>

                        {/* Next */}
                        <button
                            disabled={(page + 1) * PAGE_SIZE >= totalCollegeCount || loadingColleges}
                            onClick={() => setPage(p => p + 1)}
                            style={{ ...pageBtnStyle, opacity: ((page + 1) * PAGE_SIZE >= totalCollegeCount || loadingColleges) ? 0.4 : 1, cursor: ((page + 1) * PAGE_SIZE >= totalCollegeCount || loadingColleges) ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Last Page */}
                        <button
                            disabled={(page + 1) * PAGE_SIZE >= totalCollegeCount || loadingColleges}
                            onClick={() => setPage(totalCollegePages - 1)}
                            style={{ ...pageBtnStyle, opacity: ((page + 1) * PAGE_SIZE >= totalCollegeCount || loadingColleges) ? 0.4 : 1, cursor: ((page + 1) * PAGE_SIZE >= totalCollegeCount || loadingColleges) ? 'not-allowed' : 'pointer' }}
                            title="Last Page"
                        >
                            <ChevronRight size={16} /><ChevronRight size={16} style={{ marginLeft: '-10px' }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Management Section (Appears when a college is selected) */}
            {selectedCollegeId && (
                <CourseManagementSection
                    collegeId={selectedCollegeId}
                    collegeName={colleges.find(c => c.id === selectedCollegeId)?.name || 'Selected College'}
                    courses={courses}
                    loading={loadingCourses}
                    error={errorCourses}
                    refetchCourses={refetchCourses}
                    createCourse={createCourse}
                    updateCourse={updateCourse}
                    deleteCourse={deleteCourse}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

function CourseManagementSection({ collegeId, collegeName, courses, loading, error, refetchCourses, createCourse, updateCourse, deleteCourse, showToast }) {
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [newCourseData, setNewCourseData] = useState({
        name: '', short_name: '', level: '', stream: '', duration_years: 0, total_seats: 0, annual_fees: 0, entrance_exam: '', min_cutoff: ''
    });
    const [courseEditData, setCourseEditData] = useState({});

    const handleAddCourseToggle = () => {
        setIsAddingCourse(!isAddingCourse);
        if (!isAddingCourse) {
            setNewCourseData({ name: '', short_name: '', level: '', stream: '', duration_years: 0, total_seats: 0, annual_fees: 0, entrance_exam: '', min_cutoff: '' });
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await createCourse({ ...newCourseData, college_id: collegeId, is_active: true });
            refetchCourses();
            handleAddCourseToggle();
            showToast('Course added successfully', 'success');
        } catch (err) {
            console.error('Add Course Error:', err);
            showToast(`Error: ${err.message}`, 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (isAddingCourse) {
            setNewCourseData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        } else if (editingCourseId) {
            setCourseEditData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const startEditingCourse = (course) => {
        setEditingCourseId(course.id);
        setCourseEditData({ ...course });
    };

    const cancelEditingCourse = () => {
        setEditingCourseId(null);
        setCourseEditData({});
    };

    const saveEditedCourse = async () => {
        try {
            await updateCourse(editingCourseId, courseEditData);
            refetchCourses();
            cancelEditingCourse();
            showToast('Course updated successfully', 'success');
        } catch (err) {
            console.error('Update Course Error:', err);
            showToast(`Error: ${err.message}`, 'error');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await deleteCourse(courseId);
            refetchCourses();
            showToast('Course deleted successfully', 'success');
        } catch (err) {
            console.error('Delete Course Error:', err);
            showToast(`Error: ${err.message}`, 'error');
        }
    };

    const thStyle = { padding: '18px 24px', textAlign: 'left', fontSize: '14px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' };
    const tdStyle = { padding: '18px 24px', fontSize: '14px', color: '#334155', overflow: 'hidden' };

    if (error) {
        return <div>Error loading courses: {error}</div>;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            position: 'relative'
        }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f0f9ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Courses for: {collegeName}</h3>
                <button
                    onClick={handleAddCourseToggle}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    <Plus size={18} /> {isAddingCourse ? 'Cancel' : 'Add Course'}
                </button>
            </div>

            {isAddingCourse && (
                <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px' }}>Add New Course</h4>
                    <form onSubmit={handleAddCourse} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        <input
                            name="name"
                            value={newCourseData.name}
                            onChange={handleInputChange}
                            placeholder="Course Name"
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="short_name"
                            value={newCourseData.short_name}
                            onChange={handleInputChange}
                            placeholder="Short Name"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="level"
                            value={newCourseData.level}
                            onChange={handleInputChange}
                            placeholder="Level (e.g., UG, PG)"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="stream"
                            value={newCourseData.stream}
                            onChange={handleInputChange}
                            placeholder="Stream (e.g., Engineering, Arts)"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="duration_years"
                            type="number"
                            value={newCourseData.duration_years}
                            onChange={handleInputChange}
                            placeholder="Duration (years)"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="total_seats"
                            type="number"
                            value={newCourseData.total_seats}
                            onChange={handleInputChange}
                            placeholder="Total Seats"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="annual_fees"
                            type="number"
                            step="0.01"
                            value={newCourseData.annual_fees}
                            onChange={handleInputChange}
                            placeholder="Annual Fees"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="entrance_exam"
                            value={newCourseData.entrance_exam}
                            onChange={handleInputChange}
                            placeholder="Entrance Exam"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <input
                            name="min_cutoff"
                            value={newCourseData.min_cutoff}
                            onChange={handleInputChange}
                            placeholder="Min Cutoff"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        />
                        <div style={{ gridColumn: 'span 8', display: 'flex', gap: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>Active?
                                <input
                                    name="is_active"
                                    type="checkbox"
                                    checked={newCourseData.is_active}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Add Course</button> 
                        </div>
                    </form>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 100, background: '#f8fafc' }}>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ ...thStyle, width: '50px' }}> # </th>
                            {COURSE_COLUMNS.map(col => (
                                <th key={col.id} style={{ ...thStyle, width: `${col.width}px` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {col.label}
                                    </div>
                                </th>
                            ))}
                            <th style={{ ...thStyle, width: '150px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={COURSE_COLUMNS.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading Courses...</td></tr>
                        ) : courses.length === 0 ? (
                            <tr><td colSpan={COURSE_COLUMNS.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No courses found for this college.</td></tr>
                        ) : courses.map((course, idx) => (
                            <tr key={course.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fcfcfc', borderBottom: '1px solid #f1f5f9' }}>
                                <td style={tdStyle}> {idx + 1} </td>
                                {COURSE_COLUMNS.map(col => (
                                    <td key={col.id} style={tdStyle}>
                                        {editingCourseId === course.id ? (
                                            (() => {
                                                const val = courseEditData[col.id];
                                                const type = typeof val;
                                                if (col.id === 'is_active') {
                                                    return (
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            checked={!!val}
                                                            onChange={handleInputChange}
                                                        />
                                                    );
                                                } else if (type === 'number' || col.id === 'duration_years' || col.id === 'total_seats' || col.id === 'annual_fees') {
                                                    return (
                                                        <input
                                                            type="number"
                                                            name={col.id}
                                                            value={val || ''}
                                                            onChange={handleInputChange}
                                                            style={{ width: '100%', padding: '4px', fontSize: '14px' }}
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <input
                                                            name={col.id}
                                                            value={val || ''}
                                                            onChange={handleInputChange}
                                                            style={{ width: '100%', padding: '4px', fontSize: '14px' }}
                                                        />
                                                    );
                                                }
                                            })()
                                        ) : col.id === 'is_active' ? (
                                            <button
                                                onClick={() => updateCourse(course.id, { is_active: !course.is_active })}
                                                style={{
                                                    border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                                                    background: course.is_active ? '#dcfce7' : '#f1f5f9', color: course.is_active ? '#15803d' : '#64748b',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                }}
                                            >
                                                {course.is_active ? 'TRUE' : 'FALSE'}
                                            </button>
                                        ) : col.id === 'created_at' ? (
                                            <span style={{ color: '#64748b' }}>{new Date(course.created_at).toLocaleDateString()}</span>
                                        ) : (
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                                                {course[col.id] || '—'}
                                            </div>
                                        )}
                                    </td>
                                ))}
                                <td style={{ ...tdStyle, textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                                    {editingCourseId === course.id ? (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={saveEditedCourse}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }}
                                                title="Save"
                                            >
                                                <Save size={16} />
                                            </button>
                                            <button
                                                onClick={cancelEditingCourse}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => startEditingCourse(course)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}