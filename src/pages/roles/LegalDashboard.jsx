import { useState, useEffect } from 'react';
import { getEmployees } from '../../services/api';
import { FiFileText, FiCheck, FiX, FiExternalLink, FiSearch, FiAlertCircle, FiShield, FiUsers, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const LegalDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            setEmployees(res.employees || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderDocStatus = (url, label) => {
        if (!url) return (
            <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                <FiX size={10} style={{ marginRight: '4px' }} /> Missing
            </span>
        );
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="badge badge-success" style={{ textDecoration: 'none', cursor: 'pointer', fontSize: '10px' }}>
                <FiFileText size={10} style={{ marginRight: '4px' }} /> {label} <FiExternalLink size={10} style={{ marginLeft: '4px', opacity: 0.5 }} />
            </a>
        );
    };

    const getDocCount = (emp) => {
        const docs = emp.documents || {};
        let count = 0;
        if (docs.aadharUrl) count++;
        if (docs.panUrl) count++;
        if (docs.marksheetUrl) count++;
        if (docs.licenseUrl) count++;
        return count;
    };

    const pendingCount = employees.filter(e => getDocCount(e) < 4).length;
    const complianceRate = employees.length ? Math.round((employees.filter(e => getDocCount(e) >= 4).length / employees.length) * 100) : 0;

    return (
        <div className="dashboard-container" style={{ padding: '0' }}>
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 800 }}>Legal Compliance</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>Chief Legal Officer • Document Verification</p>
                </div>
                <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--text-main)', color: 'white' }}>
                    <FiShield style={{ color: '#3b82f6' }} />
                    Audit Ready
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f8fafc', color: 'var(--text-main)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className="stat-value">{employees.length}</div>
                    <div className="stat-label">Total Workforce</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fffbeb', color: 'var(--warning)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiClock size={24} />
                    </div>
                    <div className="stat-value">{pendingCount}</div>
                    <div className="stat-label">Pending Verification</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: 'var(--success)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <FiShield size={24} />
                    </div>
                    <div className="stat-value">{complianceRate}%</div>
                    <div className="stat-label">Compliance Rate</div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Employee Documentation</h2>
                    <div className="search-box" style={{ position: 'relative', width: '320px' }}>
                        <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Find employee..."
                            className="form-input"
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container" style={{ border: 'none' }}>
                    {loading ? (
                        <div className="loading-container" style={{ minHeight: '300px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee Profile</th>
                                    <th style={{ textAlign: 'center' }}>Aadhar</th>
                                    <th style={{ textAlign: 'center' }}>PAN</th>
                                    <th style={{ textAlign: 'center' }}>Credentials</th>
                                    <th style={{ textAlign: 'center' }}>ID Proof</th>
                                    <th style={{ textAlign: 'right' }}>Audit Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No records found</td></tr>
                                ) : filteredEmployees.map(emp => (
                                    <tr key={emp.employeeId}>
                                        <td>
                                            <div style={{ fontWeight: 800 }}>{emp.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{emp.employeeId} • {emp.designation}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {renderDocStatus(emp.documents?.aadharUrl, "Aadhar")}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {renderDocStatus(emp.documents?.panUrl, "PAN")}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {renderDocStatus(emp.documents?.marksheetUrl, "Education")}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {renderDocStatus(emp.documents?.licenseUrl, "Secondary")}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {getDocCount(emp) >= 4 ? (
                                                <span className="badge badge-success" style={{ padding: '6px 12px' }}>
                                                    <FiCheck size={12} style={{ marginRight: '4px' }} /> Verified
                                                </span>
                                            ) : (
                                                <span className="badge badge-warning" style={{ padding: '6px 12px' }}>
                                                    <FiAlertCircle size={12} style={{ marginRight: '4px' }} /> Action Req
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalDashboard;
