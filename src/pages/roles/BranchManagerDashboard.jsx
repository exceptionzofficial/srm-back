import { useState, useEffect, useRef } from 'react';
import { FiUsers, FiUserCheck, FiClock, FiMapPin, FiDollarSign, FiBarChart2, FiArrowUpRight, FiSearch, FiCheckCircle, FiFilter, FiChevronDown, FiGlobe, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmployees, getAttendanceByDate, getBranches } from '../../services/api';

const BranchManagerDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadData();
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowBranchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [empRes, attRes, branchRes] = await Promise.all([
                getEmployees(),
                getAttendanceByDate(today),
                getBranches().catch(() => ({ branches: [] }))
            ]);
            setEmployees(empRes.employees || []);
            setAttendance(attRes.attendance || attRes.data || []);
            setBranches(branchRes.branches || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const branchFilteredEmployees = selectedBranchId === 'all'
        ? employees
        : employees.filter(emp => emp.branchId === selectedBranchId);

    const filteredEmployees = branchFilteredEmployees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAttendance = attendance.filter(att =>
        branchFilteredEmployees.some(emp => emp.employeeId === att.employeeId)
    );

    const stats = [
        {
            label: 'Today Absent',
            value: branchFilteredEmployees.length - filteredAttendance.length,
            icon: <FiUsers />,
            color: 'var(--danger)'
        },
        {
            label: 'Present',
            value: filteredAttendance.length,
            icon: <FiUserCheck />,
            color: 'var(--success)'
        },
        {
            label: 'Late Entries',
            value: filteredAttendance.filter(a => a.status === 'LATE').length || '0',
            icon: <FiClock />,
            color: 'var(--warning)'
        },
        {
            label: 'Total Strength',
            value: branchFilteredEmployees.length,
            icon: <FiBarChart2 />,
            color: 'var(--info)'
        }
    ];

    const currentBranch = selectedBranchId === 'all'
        ? { name: 'All Branches', branchId: 'all' }
        : branches.find(b => b.branchId === selectedBranchId) || { name: 'Unknown Branch' };

    return (
        <div className="dashboard-container" style={{ padding: '0' }}>
            <header className="page-header" style={{ marginBottom: '40px', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 800 }}>Branch Operations</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                        Super Admin • <span style={{ color: 'var(--primary)' }}>{currentBranch.name}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 16px',
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                fontWeight: 700,
                                minWidth: '220px',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {selectedBranchId === 'all' ? <FiGlobe color="var(--primary)" /> : <FiMapPin color="var(--primary)" />}
                                <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentBranch.name}
                                </span>
                            </div>
                            <FiChevronDown style={{ transform: showBranchDropdown ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
                        </button>

                        <AnimatePresence>
                            {showBranchDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        zIndex: 100,
                                        minWidth: '280px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        padding: '8px'
                                    }}
                                >
                                    <div
                                        onClick={() => { setSelectedBranchId('all'); setShowBranchDropdown(false); }}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            background: selectedBranchId === 'all' ? '#fef2f2' : 'transparent',
                                            color: selectedBranchId === 'all' ? 'var(--primary)' : 'var(--text-main)',
                                            fontWeight: selectedBranchId === 'all' ? 800 : 600,
                                            transition: 'var(--transition)'
                                        }}
                                        className="dropdown-item"
                                    >
                                        <FiGlobe size={18} />
                                        <span>All Branches</span>
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
                                    {branches.map(branch => (
                                        <div
                                            key={branch.branchId}
                                            onClick={() => { setSelectedBranchId(branch.branchId); setShowBranchDropdown(false); }}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px',
                                                background: selectedBranchId === branch.branchId ? '#fef2f2' : 'transparent',
                                                color: selectedBranchId === branch.branchId ? 'var(--primary)' : 'var(--text-main)',
                                                fontWeight: selectedBranchId === branch.branchId ? 800 : 600,
                                                marginBottom: '2px',
                                                transition: 'var(--transition)'
                                            }}
                                            className="dropdown-item"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <FiMapPin size={18} />
                                                <span style={{ fontSize: '14px' }}>{branch.name}</span>
                                            </div>
                                            {branch.address && (
                                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '30px', fontWeight: 500 }}>
                                                    {branch.address}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={loadData}
                        className="btn btn-secondary"
                        style={{ padding: '12px', borderRadius: '12px' }}
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>

                    <div className="badge badge-success" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                        LIVE FEED
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="stat-card"
                    >
                        <div className="stat-icon" style={{ background: '#f8fafc', color: stat.color, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border)' }}>
                            {stat.icon}
                        </div>
                        <div className="stat-value" style={{ fontSize: '28px' }}>{stat.value}</div>
                        <div className="stat-label" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px', color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                <div className="card-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Attendance Roster</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                            Currently viewing {filteredEmployees.length} employees
                        </p>
                    </div>
                    <div className="search-box" style={{ position: 'relative', width: '360px' }}>
                        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or employee ID..."
                            className="form-input"
                            style={{ paddingLeft: '44px', paddingRight: '16px', height: '48px', borderRadius: '14px', background: '#f8fafc', border: '1px solid transparent' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container" style={{ border: 'none' }}>
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '400px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <table className="table">
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th style={{ padding: '16px 32px' }}>Employee Profile</th>
                                    <th>Work Branch</th>
                                    <th>Shift / Schedule</th>
                                    <th>Latest Entry</th>
                                    <th>Current Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '32px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '80px 32px', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ padding: '20px', background: '#f1f5f9', borderRadius: '50%' }}>
                                                    <FiUsers size={40} style={{ opacity: 0.3 }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-main)', margin: 0 }}>No matches found</p>
                                                    <p style={{ margin: '4px 0 0', fontWeight: 500 }}>Try adjusting your branch filter or search term</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.map(emp => {
                                    const att = attendance.find(a => a.employeeId === emp.employeeId);
                                    const branch = branches.find(b => b.branchId === emp.branchId);
                                    return (
                                        <tr key={emp.employeeId} style={{ transition: 'var(--transition)' }}>
                                            <td style={{ padding: '16px 32px' }}>
                                                <div style={{ fontWeight: 900, fontSize: '15px' }}>{emp.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, marginTop: '2px' }}>ID: {emp.employeeId}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FiMapPin size={12} color="var(--primary)" />
                                                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{branch?.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary" style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 800 }}>GENERAL P1</span>
                                            </td>
                                            <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{att ? att.punchIn : '—'}</td>
                                            <td>
                                                {att ? (
                                                    <span className={`badge ${att.status === 'LATE' ? 'badge-warning' : 'badge-success'}`} style={{ padding: '6px 14px', borderRadius: '8px', fontWeight: 800 }}>
                                                        {att.status === 'LATE' ? 'LATE ENTRY' : 'PRESENT'}
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-danger" style={{ padding: '6px 14px', borderRadius: '8px', fontWeight: 800, opacity: 0.6 }}>ABSENT</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                                                <button className="btn btn-sm btn-secondary" style={{ fontWeight: 700, borderRadius: '8px' }}>Manage</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchManagerDashboard;
