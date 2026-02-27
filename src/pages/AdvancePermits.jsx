import React, { useState, useEffect } from 'react';
import { getAllRequests, updateRequestStatus } from '../services/api';
import { FiCheck, FiX, FiAlertCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import './AdvancePermits.css';

const AdvancePermits = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            // Specifically fetch PENDING_SUPER_ADMIN
            const data = await getAllRequests('PENDING_SUPER_ADMIN');
            const sorted = data.requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(sorted);
        } catch (error) {
            console.error('Failed to load advance permits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status) => {
        let rejectionReason = null;
        if (status === 'REJECTED') {
            rejectionReason = prompt('Enter reason for rejection:');
            if (rejectionReason === null) return;
        }

        if (!window.confirm(`Are you sure you want to ${status === 'APPROVED' ? 'Permit' : 'Reject'} this request?`)) return;

        try {
            await updateRequestStatus(requestId, status, rejectionReason);
            alert(status === 'APPROVED' ? 'Request permitted and forwarded to HR.' : 'Request rejected.');
            loadRequests();
        } catch (error) {
            alert('Failed to update request status');
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading pending permits...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-title-area">
                    <FiDollarSign className="header-icon" />
                    <h1 className="page-title">Advance Permits</h1>
                </div>
                <p className="page-subtitle">Review high-value advance requests or those with existing pendings.</p>
            </div>

            {requests.length === 0 ? (
                <div className="empty-permits">
                    <FiCheck className="empty-icon" />
                    <h3>All Caught Up!</h3>
                    <p>There are no advance requests requiring Super Admin permission at this time.</p>
                </div>
            ) : (
                <div className="permits-grid">
                    {requests.map((req) => (
                        <div key={req.requestId} className="permit-card">
                            <div className="permit-card-header">
                                <div className="employee-info">
                                    <h3>{req.employeeName || req.employeeId}</h3>
                                    <span>{req.department} • {req.branchId}</span>
                                </div>
                                <div className="amount-badge">
                                    ₹{req.data?.amount?.toLocaleString()}
                                </div>
                            </div>

                            <div className="permit-details">
                                <div className="detail-item">
                                    <FiClock className="detail-icon" />
                                    <span>EMI Plan: <strong>{req.data?.emiMonths} Months</strong></span>
                                </div>
                                <div className="detail-item">
                                    <FiAlertCircle className="detail-icon" />
                                    <span>Reason: {req.data?.reason}</span>
                                </div>

                                {(req.data?.amount > 10000 || req.hasOtherPending) && (
                                    <div className="reason-box">
                                        <p className="reason-label">Why Super Admin?</p>
                                        <ul className="reason-list">
                                            {req.data?.amount > 10000 && <li>High Value Request (&gt; ₹10,000)</li>}
                                            {req.hasOtherPending && <li>Previous Advance Still Pending</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="permit-actions">
                                <button
                                    className="btn-permit btn-approve"
                                    onClick={() => handleAction(req.requestId, 'APPROVED')}
                                >
                                    <FiCheck /> Permit Request
                                </button>
                                <button
                                    className="btn-permit btn-reject"
                                    onClick={() => handleAction(req.requestId, 'REJECTED')}
                                >
                                    <FiX /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdvancePermits;
