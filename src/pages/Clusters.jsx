/**
 * Clusters Management Page - Super Admin
 * Create, edit, delete clusters and assign them to managers
 */

import { useState, useEffect } from 'react';
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import { getClusters, getBranches, getEmployees, createCluster, updateCluster, deleteCluster } from '../services/api';
import './Clusters.css';

const Clusters = () => {
    const [clusters, setClusters] = useState([]);
    const [branches, setBranches] = useState([]);
    const [managers, setManagers] = useState([]); // Filtered to CLUSTER_MANAGER role
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCluster, setEditingCluster] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        branchIds: [],
        managerId: '',
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [clusterRes, branchRes, empRes] = await Promise.all([
                getClusters(),
                getBranches(),
                getEmployees()
            ]);
            setClusters(clusterRes.clusters || []);
            setBranches(branchRes.branches || []);
            // Filter to only CLUSTER_MANAGER role
            const clusterManagers = (empRes.employees || []).filter(e => e.role === 'CLUSTER_MANAGER');
            setManagers(clusterManagers);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (cluster = null) => {
        if (cluster) {
            setEditingCluster(cluster);
            setFormData({
                name: cluster.name,
                branchIds: cluster.branchIds || [],
                managerId: cluster.managerId || '',
                isActive: cluster.isActive
            });
        } else {
            setEditingCluster(null);
            setFormData({ name: '', branchIds: [], managerId: '', isActive: true });
        }
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCluster(null);
    };

    const handleToggleBranch = (branchId) => {
        setFormData(prev => {
            const ids = prev.branchIds;
            if (ids.includes(branchId)) {
                return { ...prev, branchIds: ids.filter(id => id !== branchId) };
            } else {
                return { ...prev, branchIds: [...ids, branchId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Cluster name is required');
            return;
        }

        try {
            if (editingCluster) {
                await updateCluster(editingCluster.clusterId, formData);
                setSuccess('Cluster updated successfully');
            } else {
                await createCluster(formData);
                setSuccess('Cluster created successfully');
            }
            closeModal();
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving cluster');
        }
    };

    const handleDelete = async (clusterId) => {
        if (!window.confirm('Are you sure you want to delete this cluster?')) return;
        try {
            await deleteCluster(clusterId);
            setSuccess('Cluster deleted successfully');
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error deleting cluster');
        }
    };

    const getBranchName = (branchId) => {
        const b = branches.find(br => br.branchId === branchId);
        return b ? b.name : 'Unknown';
    };

    const getManagerName = (managerId) => {
        if (!managerId) return null;
        const m = managers.find(mgr => mgr.employeeId === managerId);
        return m ? m.name : 'Unknown';
    };

    const filteredClusters = clusters.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="clusters-page">
            <div className="page-header">
                <h1 className="page-title"><FiLayers /> Clusters</h1>
                <div className="header-actions">
                    <div className="search-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search clusters..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <FiPlus /> New Cluster
                    </button>
                </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}
            {error && !showModal && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Cluster Name</th>
                                <th>Assigned Manager</th>
                                <th>Branches</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClusters.length > 0 ? (
                                filteredClusters.map(cluster => (
                                    <tr key={cluster.clusterId}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#000' }}>{cluster.name}</div>
                                            <div style={{ fontSize: '11px', color: '#999' }}>ID: {cluster.clusterId}</div>
                                        </td>
                                        <td>
                                            {cluster.managerId ? (
                                                <span className="manager-badge">
                                                    <FiUser /> {getManagerName(cluster.managerId)}
                                                </span>
                                            ) : (
                                                <span className="manager-badge unassigned">Not assigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="branch-pills">
                                                {(cluster.branchIds || []).slice(0, 3).map(id => (
                                                    <span key={id} className="branch-pill">{getBranchName(id)}</span>
                                                ))}
                                                {(cluster.branchIds || []).length > 3 && (
                                                    <span className="branch-pill">+{cluster.branchIds.length - 3} more</span>
                                                )}
                                            </div>
                                            <div className="branch-count">
                                                {cluster.branchIds?.length || 0} branches
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${cluster.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {cluster.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn edit" onClick={() => openModal(cluster)} title="Edit">
                                                    <FiEdit2 />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(cluster.clusterId)} title="Delete">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-message" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        No clusters found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCluster ? 'Edit' : 'New'} Cluster</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger" style={{ marginBottom: '16px' }}>{error}</div>}

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label">Cluster Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. South Zone"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label">Assign Manager</label>
                                    <select
                                        className="manager-select"
                                        value={formData.managerId}
                                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                    >
                                        <option value="">— No Manager —</option>
                                        {managers.map(m => (
                                            <option key={m.employeeId} value={m.employeeId}>
                                                {m.name} ({m.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                    <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        Only employees with the "Cluster Manager" role are listed.
                                    </small>
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label">Assign Branches</label>
                                    <div className="branch-checklist">
                                        {branches.map(branch => (
                                            <label key={branch.branchId}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.branchIds.includes(branch.branchId)}
                                                    onChange={() => handleToggleBranch(branch.branchId)}
                                                />
                                                <span>{branch.name}</span>
                                            </label>
                                        ))}
                                        {branches.length === 0 && (
                                            <p style={{ fontSize: '12px', color: '#999', padding: '10px' }}>No branches available.</p>
                                        )}
                                    </div>
                                    <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        Selected: {formData.branchIds.length} branches
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '16px', height: '16px', accentColor: '#EF4136' }}
                                        />
                                        <span style={{ fontWeight: '500' }}>Active Cluster</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCluster ? 'Update' : 'Create'} Cluster
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clusters;
