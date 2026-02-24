import React, { useState, useEffect } from 'react';
import { getAllRequests } from '../services/api';
import './Requests.css'; // We'll create this or reuse styles

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('APPROVED'); // Default to APPROVED for Admin

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await getAllRequests(filter === 'ALL' ? null : filter);
            // sort by date desc
            const sorted = data.requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(sorted);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'ADVANCE': return '#2196F3'; // Blue
            case 'LEAVE': return '#FF9800'; // Orange
            case 'PERMISSION': return '#9C27B0'; // Purple
            default: return '#757575';
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'APPROVED': '#4CAF50',
            'PENDING': '#FF9800',
            'REJECTED': '#F44336'
        };
        return (
            <span style={{
                backgroundColor: colors[status] || '#757575',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Request History</h1>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="APPROVED">Approved Only</option>
                    <option value="PENDING">Pending Only</option>
                    <option value="REJECTED">Rejected Only</option>
                    <option value="ALL">All Requests</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="empty-state">No requests found for this filter.</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Employee</th>
                                    <th>Branch / Dept</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.requestId}>
                                        <td>
                                            <span className={`badge badge-${req.type?.toLowerCase()}`} style={{ fontWeight: 800 }}>
                                                {req.type}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{req.employeeName || req.employeeId}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {req.employeeId}</div>
                                        </td>
                                        <td>
                                            <div>{req.department}</div>
                                            {req.branchId && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.branchId}</div>}
                                        </td>
                                        <td>
                                            <div className="request-details-cell" style={{ fontSize: '13px' }}>
                                                {req.type === 'ADVANCE' && (
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Amount: ₹{req.data?.amount}</div>
                                                )}
                                                {(req.type === 'LEAVE' || req.type === 'PERMISSION') && (
                                                    <div>
                                                        <strong>{req.data?.date}</strong>: {req.data?.reason}
                                                        {req.type === 'PERMISSION' && (
                                                            <div style={{ color: 'var(--text-secondary)' }}>Duration: {req.data?.duration} mins</div>
                                                        )}
                                                    </div>
                                                )}
                                                {req.type === 'BRANCH_TRAVEL' && (
                                                    <div>
                                                        <strong>{req.data?.branchName}</strong> | {req.data?.startDate}
                                                        <div style={{ color: 'var(--text-secondary)' }}>{req.data?.reason}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge status-${req.status?.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                                            {req.hrActionBy && <div className="text-secondary" style={{ fontSize: '11px' }}>Action by HR</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;
