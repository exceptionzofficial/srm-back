import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiEdit2, FiTrash2, FiUser, FiMapPin, FiSearch, FiSmartphone, FiMonitor, FiArrowLeft } from 'react-icons/fi';
import { getEmployees, deleteEmployee, getBranches, updateEmployee } from '../services/api';
import './Employees.css'; // Reuse existing styles

const RelievedEmployees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [empResponse, branchResponse] = await Promise.all([
                getEmployees(),
                getBranches().catch(() => ({ branches: [] })),
            ]);
            setEmployees(empResponse.employees || []);
            setBranches(branchResponse.branches || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleReadd = async (employeeId) => {
        if (!confirm('Are you sure you want to re-add this employee? they will be moved back to the active list.')) return;
        try {
            await updateEmployee(employeeId, { status: 'active' });
            setSuccess('Employee re-added successfully');
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error re-adding employee');
        }
    };

    const handleDelete = async (employeeId) => {
        if (!confirm('Are you sure you want to permanently delete this relieved employee record?')) return;
        try {
            await deleteEmployee(employeeId);
            setSuccess('Employee record deleted permanently');
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting employee');
        }
    };

    const getBranchName = (branchId) => {
        const branch = branches.find(b => b.branchId === branchId);
        return branch?.name || '-';
    };

    const relievedEmployees = employees
        .filter(emp => {
            if (emp.status !== 'relieved') return false;
            const searchLower = searchTerm.toLowerCase();
            return (
                emp.name?.toLowerCase().includes(searchLower) ||
                emp.employeeId?.toLowerCase().includes(searchLower) ||
                emp.associateCode?.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    const mobileEmployees = relievedEmployees.filter(emp => 
        !emp.employeeId?.startsWith('SRMC') && emp.employeeType !== 'kiosk'
    );
    const kioskEmployees = relievedEmployees.filter(emp => 
        emp.employeeId?.startsWith('SRMC') || emp.employeeType === 'kiosk'
    );

    return (
        <div className="employees-page">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/master/list')} style={{ padding: '8px 12px', background: 'white', borderColor: '#e2e8f0', color: '#0f172a' }}>
                        <FiArrowLeft />
                    </button>
                    <h1 className="page-title" style={{ color: '#0f172a', fontWeight: '800' }}>Relieved Employees</h1>
                </div>
                <div className="header-actions">
                    <div className="search-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search relieved staff..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="section-header" style={{ marginTop: '32px' }}>
                <h2 className="section-title">
                    <FiSmartphone className="text-primary" /> Relieved Mobile Employees
                </h2>
                <span className="branch-count-badge">{mobileEmployees.length}</span>
            </div>
            
            <div className="card">
                {mobileEmployees.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mobileEmployees.map((emp) => (
                                    <tr key={emp.employeeId} onClick={() => navigate(`/attendance/view/${emp.employeeId}`)} style={{ cursor: 'pointer', opacity: 0.9 }}>
                                        <td style={{ color: '#0f172a', fontWeight: '700' }}><strong>{emp.employeeId}</strong></td>
                                        <td>
                                            <div className="employee-info">
                                                <div className={`employee-avatar ${emp.photoUrl ? 'has-photo' : ''}`}>
                                                    {emp.photoUrl ? <img src={emp.photoUrl} alt={emp.name} /> : <FiUser />}
                                                </div>
                                                <div>
                                                    <span className="employee-name" style={{ color: '#0f172a', fontWeight: '700' }}>{emp.name}</span>
                                                    <span className="employee-email" style={{ color: '#475569' }}>{emp.email || emp.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: '#334155' }}>{getBranchName(emp.branchId)}</td>
                                        <td><span className="badge badge-danger" style={{ fontWeight: '800' }}>RELIEVED</span></td>
                                        <td>
                                            <div className="action-buttons">
                                                <button title="Re-add Employee" className="action-btn edit" style={{ color: '#10b981' }} onClick={(e) => { e.stopPropagation(); handleReadd(emp.employeeId); }}><FiRefreshCw /></button>
                                                <button title="View Details" className="action-btn view" onClick={(e) => { e.stopPropagation(); navigate(`/master/edit/${emp.employeeId}`); }}><FiEdit2 /></button>
                                                <button title="Delete Permanently" className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(emp.employeeId); }}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="empty-message">No relieved mobile employees found.</p>}
            </div>

            <div className="section-header" style={{ marginTop: '32px' }}>
                <h2 className="section-title">
                    <FiMonitor className="text-primary" /> Relieved Kiosk Employees
                </h2>
                <span className="branch-count-badge">{kioskEmployees.length}</span>
            </div>

            <div className="card">
                {kioskEmployees.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kioskEmployees.map((emp) => (
                                    <tr key={emp.employeeId} onClick={() => navigate(`/attendance/view/${emp.employeeId}`)} style={{ cursor: 'pointer', opacity: 0.8 }}>
                                        <td><strong>{emp.employeeId}</strong></td>
                                        <td>
                                            <div className="employee-info">
                                                <div className={`employee-avatar ${emp.photoUrl ? 'has-photo' : ''}`}>
                                                    {emp.photoUrl ? <img src={emp.photoUrl} alt={emp.name} /> : <FiUser />}
                                                </div>
                                                <div>
                                                    <span className="employee-name">{emp.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getBranchName(emp.branchId)}</td>
                                        <td><span className="badge badge-danger">RELIEVED</span></td>
                                        <td>
                                            <div className="action-buttons">
                                                <button title="Re-add Employee" className="action-btn edit" style={{ color: '#10b981' }} onClick={(e) => { e.stopPropagation(); handleReadd(emp.employeeId); }}><FiRefreshCw /></button>
                                                <button title="View Details" className="action-btn view" onClick={(e) => { e.stopPropagation(); navigate(`/master/edit/${emp.employeeId}`); }}><FiEdit2 /></button>
                                                <button title="Delete Permanently" className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(emp.employeeId); }}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="empty-message">No relieved kiosk employees found.</p>}
            </div>
        </div>
    );
};

export default RelievedEmployees;
