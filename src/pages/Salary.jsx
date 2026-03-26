import React, { useState, useEffect } from 'react';
import { FiPlus, FiUser, FiEdit2, FiSearch, FiFilter, FiCreditCard } from 'react-icons/fi';
import { 
    getEmployees, createSalary, getSalaries, updateSalary, calculateSalary,
    getBranches, getPayGroups, getDesignations
} from '../services/api';
import './Salary.css';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Salary = () => {
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [payGroups, setPayGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeSalaries, setEmployeeSalaries] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [editingSalary, setEditingSalary] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedPaygroup, setSelectedPaygroup] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All'); // All, Employee, Manager

    // Form State
    const [formData, setFormData] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),

        // Header info
        designation: '', // Auto-filled from employee but editable for slip? No, mostly fixed.
        paymentType: 'CASH', // New Field
        workingDays: 26, // New Field

        // Earnings
        basic: 0,
        hra: 0,
        conveyance: 0,
        medical: 0,
        special: 0,
        bonus: 0,

        // Deductions
        pf: 0,
        esi: 0,
        pt: 0,
        tds: 0,
        advance: 0, // New Field
    });

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [empData, branchData, pgData] = await Promise.all([
                getEmployees(),
                getBranches(),
                getPayGroups()
            ]);
            setEmployees(empData.employees || empData || []);
            setBranches(branchData.branches || branchData || []);
            setPayGroups(pgData.payGroups || pgData || []);
            // Always default to 'All' for maximum visibility
            setSelectedBranch('All');
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = async (employee) => {
        setSelectedEmployee(employee);
        setShowForm(false);
        setEditingSalary(null);
        try {
            const salaries = await getSalaries(employee.employeeId);
            const sorted = (salaries || []).sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
            setEmployeeSalaries(sorted);
        } catch (error) {
            console.error('Error fetching salaries:', error);
            setEmployeeSalaries([]);
        }
    };

    const handleBack = () => {
        setSelectedEmployee(null);
        setEmployeeSalaries([]);
        setShowForm(false);
        setSuccess('');
        setError('');
        setEditingSalary(null);
    };

    const calculateGross = () => {
        return (
            Number(formData.basic || 0) +
            Number(formData.hra || 0) +
            Number(formData.conveyance || 0) +
            Number(formData.medical || 0) +
            Number(formData.special || 0) +
            Number(formData.bonus || 0)
        );
    };

    const calculateDeductions = () => {
        return (
            Number(formData.pf || 0) +
            Number(formData.esi || 0) +
            Number(formData.pt || 0) +
            Number(formData.tds || 0) +
            Number(formData.advance || 0)
        );
    };

    const calculateNet = () => {
        return calculateGross() - calculateDeductions();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Handle numeric fields
        const numericFields = ['basic', 'hra', 'conveyance', 'medical', 'special', 'bonus', 'pf', 'esi', 'pt', 'tds', 'advance', 'workingDays', 'year'];

        let newValue = value;
        if (numericFields.includes(name)) {
            newValue = value === '' ? '' : Number(value);
        }

        const updatedData = { ...formData, [name]: newValue };
        setFormData(updatedData);

        // Auto-fetch deductions if month or year changes
        if (name === 'month' || name === 'year') {
            fetchAutoDeductions(updatedData.month, updatedData.year);
        }
    };

    const fetchAutoDeductions = async (month, year) => {
        if (!selectedEmployee) return;
        try {
            const data = await calculateSalary(selectedEmployee.employeeId, month, year);
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    advance: data.deductions.advance,
                    pf: data.deductions.pf || prev.pf,
                    esi: data.deductions.esi || prev.esi
                }));
            }
        } catch (error) {
            console.error('Error fetching auto deductions:', error);
        }
    };

    const openEditModal = (salary) => {
        setEditingSalary(salary);
        setFormData({
            month: salary.month,
            year: salary.year,
            paymentType: salary.paymentType || 'CASH',
            workingDays: salary.workingDays || 26,

            basic: salary.components.basic,
            hra: salary.components.hra,
            conveyance: salary.components.conveyance,
            medical: salary.components.medical,
            special: salary.components.special,
            bonus: salary.components.bonus,

            pf: salary.deductions.pf,
            esi: salary.deductions.esi,
            pt: salary.deductions.pt,
            tds: salary.deductions.tds,
            advance: salary.deductions.advance || 0,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const gross = calculateGross();
            const deductions = calculateDeductions();
            const net = calculateNet();

            const payload = {
                employeeId: selectedEmployee.employeeId,
                name: selectedEmployee.name,
                month: formData.month,
                year: formData.year,

                paymentType: formData.paymentType,
                workingDays: formData.workingDays,

                components: {
                    basic: Number(formData.basic),
                    hra: Number(formData.hra),
                    conveyance: Number(formData.conveyance),
                    medical: Number(formData.medical),
                    special: Number(formData.special),
                    bonus: Number(formData.bonus)
                },
                deductions: {
                    pf: Number(formData.pf),
                    esi: Number(formData.esi),
                    pt: Number(formData.pt),
                    tds: Number(formData.tds),
                    advance: Number(formData.advance)
                },
                grossSalary: gross,
                totalDeductions: deductions,
                netSalary: net,
                status: 'Processed'
            };

            if (editingSalary) {
                await updateSalary(editingSalary.salaryId, payload);
                setSuccess('Salary updated successfully!');
            } else {
                await createSalary(payload);
                setSuccess('Salary processed successfully!');
            }

            setShowForm(false);
            setEditingSalary(null);
            handleEmployeeSelect(selectedEmployee); // Refresh
        } catch (err) {
            setError('Failed to process salary');
            console.error(err);
        }
    };

    const openNewSalaryForm = () => {
        setEditingSalary(null);
        const initialForm = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            paymentType: 'CASH',
            workingDays: 26,
            basic: selectedEmployee?.fixedSalary ? Math.round(selectedEmployee.fixedSalary * 0.5) : 0, // Mock split
            hra: selectedEmployee?.fixedSalary ? Math.round(selectedEmployee.fixedSalary * 0.3) : 0,
            conveyance: 0,
            medical: 0,
            special: selectedEmployee?.fixedSalary ? Math.round(selectedEmployee.fixedSalary * 0.2) : 0,
            bonus: 0,
            pf: 0, esi: 0, pt: 0, tds: 0, advance: 0
        };
        setFormData(initialForm);
        setShowForm(true);

        // Fetch auto-calculated values for the default month/year
        fetchAutoDeductions(initialForm.month, initialForm.year);
    };

    const getBranchName = (id) => {
        const b = branches.find(b => b.branchId === id);
        return b ? b.name : id || 'N/A';
    };

    const isManager = (emp) => {
        const isMgrId = emp.employeeId?.startsWith('MGR');
        const hasMgrRole = ['BRANCH_MANAGER', 'CLUSTER_MANAGER', 'RETAIL_MANAGER', 'HR_ADMIN', 'FINANCE_ADMIN', 'LEGAL_ADMIN', 'PRODUCTION_ADMIN', 'QUALITY_ADMIN', 'MANAGER'].includes(emp.role);
        
        if (isMgrId || hasMgrRole) return true;
        
        if (!emp.designation) return false;
        const d = emp.designation.toLowerCase();
        return (
            d.includes('manager') || d.includes('lead') || d.includes('head') || 
            d.includes('chief') || d.includes('director') || d.includes('admin') ||
            d.includes('supervisor')
        );
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = 
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesBranch = selectedBranch === 'All' || emp.branchId === selectedBranch;
        const matchesPaygroup = selectedPaygroup === 'All' || emp.payGroup === selectedPaygroup;
        
        let matchesRole = true;
        if (roleFilter === 'Manager') matchesRole = isManager(emp);
        else if (roleFilter === 'Employee') matchesRole = !isManager(emp);

        return matchesSearch && matchesBranch && matchesPaygroup && matchesRole;
    });

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );

    // View: List Employees
    if (!selectedEmployee) {
        return (
            <div className="salary-page fade-in">
                <div className="section-header">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiCreditCard size={24} color="var(--primary)" />
                        <h1 className="page-title" style={{ margin: 0 }}>Salary Management</h1>
                    </div>
                </div>

                <div className="filter-bar">
                    <div className="filter-group">
                        <label><FiFilter /> Branch</label>
                        <select 
                            value={selectedBranch} 
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="All">All Branches</option>
                            {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Pay Group</label>
                        <select 
                            value={selectedPaygroup} 
                            onChange={(e) => setSelectedPaygroup(e.target.value)}
                        >
                            <option value="All">All Paygroups</option>
                            {payGroups.map(pg => <option key={pg.id || pg.name} value={pg.id || pg.name}>{pg.name}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Role</label>
                        <select 
                            value={roleFilter} 
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            <option value="Employee">Employees</option>
                            <option value="Manager">Managers</option>
                        </select>
                    </div>

                    <div className="filter-group search-box">
                        <label>Search</label>
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="salary-stats-overview" style={{ marginBottom: '16px' }}>
                    <div className="stat-mini-pill" style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                        background: 'var(--primary-light)', padding: '6px 12px', borderRadius: '20px',
                        border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '12px', fontWeight: '600'
                    }}>
                        <span className="label">Showing:</span>
                        <span className="value">{filteredEmployees.length} Employees</span>
                    </div>
                </div>

                <div className="employee-cards-grid">
                    {filteredEmployees.map(emp => (
                        <div key={emp.employeeId}
                            className="employee-salary-card"
                            onClick={() => handleEmployeeSelect(emp)}
                        >
                            <div className="employee-card-header">
                                <div className="avatar-ring">
                                    <FiUser size={20} />
                                </div>
                                <div className="employee-info">
                                    <h3>{emp.name}</h3>
                                    <p>{emp.designation || 'Staff Member'}</p>
                                </div>
                            </div>

                            <div className="employee-card-details">
                                <div className="detail-row">
                                    <span className="detail-label">Employee ID</span>
                                    <span className="detail-value">
                                        <span className="id-badge">{emp.employeeId}</span>
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Branch</span>
                                    <span className="detail-value">
                                        <span className="branch-badge">{getBranchName(emp.branchId)}</span>
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Pay Group</span>
                                    <span className="detail-value">{emp.payGroup || 'N/A'}</span>
                                </div>
                            </div>

                            <button className="btn btn-secondary manage-salary-btn">
                                Manage Salary
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // View: Employee Salary Details
    return (
        <div className="salary-details-page">
            <div className="page-header">
                <div className="header-with-back">
                    <button onClick={handleBack} className="btn btn-secondary">← Back</button>
                    <div>
                        <h2 className="page-title">{selectedEmployee.name}</h2>
                        <p className="page-subtitle">Salary History & Processing</p>
                    </div>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={openNewSalaryForm}>
                        <FiPlus /> Process New Salary
                    </button>
                )}
            </div>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {showForm ? (
                <div className="card">
                    <h3 className="section-title">
                        {editingSalary ? 'Edit Salary' : 'Process New Salary'}
                    </h3>
                    <form onSubmit={handleSubmit} className="salary-form">
                        <div className="form-grid">
                            {/* Section 1: Details */}
                            <div className="form-section">
                                <h4 className="section-subtitle">Period & Method</h4>
                                <div className="form-row-grid">
                                    <div className="form-group">
                                        <label className="form-label">Month</label>
                                        <select className="form-input" name="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}>
                                            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <input className="form-input" type="number" name="year" value={formData.year} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-row-grid">
                                    <div className="form-group">
                                        <label className="form-label">Payment Type</label>
                                        <select className="form-input" name="paymentType" value={formData.paymentType} onChange={handleInputChange}>
                                            <option value="CASH">CASH</option>
                                            <option value="BANK">BANK TRANSFER</option>
                                            <option value="CHEQUE">CHEQUE</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Working Days</label>
                                        <input className="form-input" type="number" name="workingDays" value={formData.workingDays} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Earnings */}
                            <div className="form-section">
                                <h4 className="section-subtitle">Gross Earnings</h4>
                                <div className="form-row-grid">
                                    <div className="form-group">
                                        <label className="form-label">Basic</label>
                                        <input className="form-input" type="number" name="basic" value={formData.basic} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">HRA</label>
                                        <input className="form-input" type="number" name="hra" value={formData.hra} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Conveyance</label>
                                        <input className="form-input" type="number" name="conveyance" value={formData.conveyance} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Medical</label>
                                        <input className="form-input" type="number" name="medical" value={formData.medical} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Special</label>
                                        <input className="form-input" type="number" name="special" value={formData.special} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bonus</label>
                                        <input className="form-input" type="number" name="bonus" value={formData.bonus} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Deductions */}
                            <div className="form-section">
                                <h4 className="section-subtitle text-danger">Deductions</h4>
                                <div className="form-row-grid">
                                    <div className="form-group">
                                        <label className="form-label">PF</label>
                                        <input className="form-input" type="number" name="pf" value={formData.pf} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ESI</label>
                                        <input className="form-input" type="number" name="esi" value={formData.esi} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">PT</label>
                                        <input className="form-input" type="number" name="pt" value={formData.pt} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">TDS</label>
                                        <input className="form-input" type="number" name="tds" value={formData.tds} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Advance</label>
                                        <input className="form-input" type="number" name="advance" value={formData.advance} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="summary-banner">
                            <div className="summary-item">
                                <span className="summary-label">GROSS PAY</span>
                                <span className="summary-value">₹{calculateGross().toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-item">
                                <span className="summary-label text-danger">DEDUCTIONS</span>
                                <span className="summary-value text-danger">₹{calculateDeductions().toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-item">
                                <span className="summary-label text-success">NET PAYABLE</span>
                                <span className="summary-value text-success">₹{calculateNet().toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingSalary ? 'Update Salary' : 'Save Salary'}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="card">
                    <h3 className="section-title">Salary History</h3>
                    {employeeSalaries.length === 0 ? (
                        <div className="empty-message-container">
                            <p className="empty-message">No salary records found for this employee.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Processed Date</th>
                                        <th>Payment Method</th>
                                        <th>Gross Earnings</th>
                                        <th>Total Deductions</th>
                                        <th>Net Payable</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeSalaries.map((sal, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="period-cell">
                                                    <span className="period-month">
                                                        {new Date(0, sal.month - 1).toLocaleString('default', { month: 'long' })} {sal.year}
                                                    </span>
                                                    <span className="period-days">{sal.workingDays || 0} Working Days</span>
                                                </div>
                                            </td>
                                            <td>{new Date(sal.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className="badge badge-secondary">{sal.paymentType || 'CASH'}</span>
                                            </td>
                                            <td className="amount-cell">₹{sal.grossSalary?.toLocaleString('en-IN')}</td>
                                            <td className="amount-cell text-danger">₹{sal.totalDeductions?.toLocaleString('en-IN')}</td>
                                            <td className="amount-cell text-success font-bold">₹{sal.netSalary?.toLocaleString('en-IN')}</td>
                                            <td><span className="badge badge-success">{sal.status}</span></td>
                                            <td>
                                                <button className="action-btn edit" onClick={() => openEditModal(sal)} title="Edit">
                                                    <FiEdit2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Salary;
