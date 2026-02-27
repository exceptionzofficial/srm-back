
import { useState, useEffect } from 'react';
import { FiPlus, FiUser, FiEdit2, FiSearch } from 'react-icons/fi';
import { getEmployees, createSalary, getSalaries, updateSalary, calculateSalary } from '../services/api';

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Salary = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeSalaries, setEmployeeSalaries] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [editingSalary, setEditingSalary] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data.employees || []);
        } catch (error) {
            console.error('Error loading employees:', error);
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

    // Role Filtering
    const [selectedRole, setSelectedRole] = useState('All');
    const roles = ['All', ...new Set(employees.map(emp => emp.designation).filter(Boolean))].sort();

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || emp.designation === selectedRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );

    // View: List Employees
    if (!selectedEmployee) {
        return (
            <div className="salary-page">
                <div className="page-header">
                    <h1 className="page-title">Salary Management</h1>
                    <div className="header-actions">
                        {/* Role Filter */}
                        <select
                            className="form-input"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            style={{ width: '200px' }}
                        >
                            <option value="All">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>

                        {/* Search Bar */}
                        <div className="card" style={{ padding: '8px', minWidth: '300px' }}>
                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '36px', border: 'none', background: 'transparent' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Employee ID</th>
                                    <th>Designation</th>
                                    <th>Branch</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.employeeId}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                                    <FiUser size={16} />
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{emp.name}</span>
                                            </div>
                                        </td>
                                        <td><code>{emp.employeeId}</code></td>
                                        <td>
                                            <span className="badge badge-secondary">{emp.designation || 'Staff'}</span>
                                        </td>
                                        <td>{emp.branchId || <span className="text-secondary">N/A</span>}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEmployeeSelect(emp)}
                                            >
                                                Manage Salary
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
