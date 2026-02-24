import { useState, useEffect } from 'react';
import { getEmployees } from '../../services/api';
import { FiCheckSquare, FiSquare, FiSend, FiUsers, FiTarget, FiRefreshCw, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const QualityDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees();
            const list = Array.isArray(data) ? data : (data.employees || []);
            setEmployees(list);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    };

    const selectRandom = (count) => {
        const shuffled = [...filteredEmployees].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count).map(e => e.employeeId);
        setSelectedIds(selected);
    };

    const handleRequest = async () => {
        if (selectedIds.length === 0) return;
        setRequestStatus('Dispatching testing requests...');
        setTimeout(() => {
            setRequestStatus(`Successfully requested ${selectedIds.length} employees for Quality Testing cycle.`);
            setSelectedIds([]);
            setTimeout(() => setRequestStatus(''), 5000);
        }, 1500);
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.name || emp.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container" style={{ padding: '0' }}>
            <header className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 800 }}>Quality Assurance</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Quality Officer • Audit Testing</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={fetchEmployees}
                        className="btn btn-secondary"
                        style={{ padding: '10px' }}
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success)', color: 'white' }}>
                        <FiCheckCircle />
                        QO Active
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: 'var(--info)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className="stat-value">{employees.length}</div>
                    <div className="stat-label">Pool Size</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fffbeb', color: 'var(--warning)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiTarget size={24} />
                    </div>
                    <div className="stat-value">{selectedIds.length}</div>
                    <div className="stat-label">Selected Candidates</div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Candidate Selection</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-sm btn-secondary" onClick={() => selectRandom(filteredEmployees.length)}>All</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => selectRandom(Math.min(50, filteredEmployees.length))}>Sample 50</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="search-box" style={{ position: 'relative', width: '260px' }}>
                            <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className={`btn btn-primary ${selectedIds.length === 0 ? 'disabled' : ''}`}
                            style={{ opacity: selectedIds.length === 0 ? 0.5 : 1, pointerEvents: selectedIds.length === 0 ? 'none' : 'auto' }}
                            onClick={handleRequest}
                        >
                            <FiSend style={{ marginRight: '8px' }} /> Invoke Testing
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {requestStatus && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ background: '#ecfdf5', color: '#065f46', padding: '12px 24px', fontWeight: 700, fontSize: '14px', borderBottom: '1px solid #a7f3d0' }}
                        >
                            <FiCheckCircle style={{ marginRight: '8px' }} />
                            {requestStatus}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ padding: '24px' }}>
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '300px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                            {filteredEmployees.map(emp => (
                                <div
                                    key={emp.employeeId}
                                    onClick={() => toggleSelect(emp.employeeId)}
                                    className={`card ${selectedIds.includes(emp.employeeId) ? 'active' : ''}`}
                                    style={{
                                        padding: '16px',
                                        cursor: 'pointer',
                                        borderColor: selectedIds.includes(emp.employeeId) ? 'var(--primary)' : 'var(--border)',
                                        background: selectedIds.includes(emp.employeeId) ? '#fef2f2' : 'white',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                        {selectedIds.includes(emp.employeeId) ? <FiCheckSquare color="var(--primary)" size={18} /> : <FiSquare color="var(--border)" size={18} />}
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)', paddingRight: '24px' }}>{emp.name || emp.firstName}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>{emp.employeeId}</div>
                                    <div style={{ display: 'inline-block', marginTop: '12px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                        {emp.role || emp.designation || 'Staff'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QualityDashboard;
