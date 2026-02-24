import { useState, useEffect } from 'react';
import { getPendingFundRequests, processFundRequest, getEmployees } from '../../services/api';
import { FiCheck, FiX, FiRefreshCw, FiDollarSign, FiSearch, FiCreditCard, FiArrowUpRight, FiPieChart, FiUsers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FinanceDashboard = () => {
    const [activeTab, setActiveTab] = useState('payroll'); // 'requests' or 'payroll'
    const [requests, setRequests] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqRes, empRes] = await Promise.all([
                getPendingFundRequests('CFO').catch(() => ({ data: [] })),
                getEmployees().catch(() => ({ employees: [] }))
            ]);
            setRequests(reqRes.data || []);
            setEmployees(empRes.employees || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await processFundRequest({ id, action, actorRole: 'CFO' });
            const reqRes = await getPendingFundRequests('CFO');
            setRequests(reqRes.data || []);
        } catch (error) {
            alert('Error processing request');
        }
    };

    const totalAmount = requests.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.fixedSalary) || 0), 0);

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container" style={{ padding: '0' }}>
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 800 }}>Finance Operations</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Chief Financial Officer Dashboard</p>
                </div>
                <div className="flex-row" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={loadData}
                        className="btn btn-secondary"
                        style={{ padding: '10px' }}
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiDollarSign />
                        Payout Ready
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: 'var(--success)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiArrowUpRight size={24} />
                    </div>
                    <div className="stat-value">₹{totalAmount.toLocaleString()}</div>
                    <div className="stat-label">Requested Amount</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef2f2', color: 'var(--danger)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiPieChart size={24} />
                    </div>
                    <div className="stat-value">{requests.length}</div>
                    <div className="stat-label">Pending Fund Requests</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: 'var(--info)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className="stat-value">₹{totalMonthlyPayroll.toLocaleString()}</div>
                    <div className="stat-label">Est. Monthly Payroll</div>
                </div>
            </div>

            <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px' }}>
                <div className="tabs" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className="btn"
                        style={{
                            background: activeTab === 'payroll' ? 'white' : 'transparent',
                            color: activeTab === 'payroll' ? 'var(--text-main)' : 'var(--text-secondary)',
                            boxShadow: activeTab === 'payroll' ? 'var(--shadow-sm)' : 'none',
                            padding: '8px 20px',
                            fontSize: '14px'
                        }}
                    >
                        Payroll & Bank
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className="btn"
                        style={{
                            background: activeTab === 'requests' ? 'white' : 'transparent',
                            color: activeTab === 'requests' ? 'var(--text-main)' : 'var(--text-secondary)',
                            boxShadow: activeTab === 'requests' ? 'var(--shadow-sm)' : 'none',
                            padding: '8px 20px',
                            fontSize: '14px'
                        }}
                    >
                        Fund Requests
                    </button>
                </div>

                <div className="search-box" style={{ position: 'relative', width: '320px' }}>
                    <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '400px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            {activeTab === 'requests' ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Requester</th>
                                            <th>Amount</th>
                                            <th>Reason</th>
                                            <th>Department</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No pending requests</td></tr>
                                        ) : requests.map(req => (
                                            <tr key={req.id}>
                                                <td>
                                                    <div style={{ fontWeight: 700 }}>{req.requesterName}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {req.id.slice(0, 8)}</div>
                                                </td>
                                                <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '16px' }}>₹{req.amount}</td>
                                                <td style={{ maxWidth: '300px', fontSize: '13px' }}>{req.reason}</td>
                                                <td><span className="badge badge-secondary">{req.requesterRole}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="action-buttons" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleAction(req.id, 'APPROVE')} style={{ padding: '6px 12px' }}>Approve</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleAction(req.id, 'REJECT')} style={{ padding: '6px 12px' }}>Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Bank Entity</th>
                                            <th>Account & IFSC</th>
                                            <th style={{ textAlign: 'right' }}>Fixed CTC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map(emp => (
                                            <tr key={emp.employeeId}>
                                                <td>
                                                    <div style={{ fontWeight: 700 }}>{emp.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp.employeeId}</div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FiCreditCard style={{ color: 'var(--text-secondary)' }} />
                                                        <span style={{ fontWeight: 500 }}>{emp.bankDetails?.bankName || 'Not Set'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{emp.bankDetails?.accountNumber || '•••• •••• ••••'}</div>
                                                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{emp.bankDetails?.ifscCode || 'IFSC N/A'}</div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                                    {emp.fixedSalary ? `₹${Number(emp.fixedSalary).toLocaleString()}` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FinanceDashboard;
