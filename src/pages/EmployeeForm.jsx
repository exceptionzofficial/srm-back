import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCreditCard, FiUpload, FiImage, FiCheck, FiMapPin, FiExternalLink } from 'react-icons/fi';
import { getEmployees, createEmployee, updateEmployee, getBranches, sendOTP, verifyOTP, sendSMSOTP, verifySMSOTP } from '../services/api';

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        branchId: '',
        role: 'EMPLOYEE', // Default role
        workMode: 'OFFICE',
        employeeType: 'mobile',
        // Documents
        panNumber: '',
        aadharNumber: '',
        // Statutory & Bank
        uan: '',
        esicIP: '',
        bankAccount: '',
        ifscCode: '',
        paymentMode: 'CASH',
        fixedSalary: '',
        joinedDate: '',
        // Associate Master Fields
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        fatherName: '',
        dob: '',
        grade: '',
        costCentre: '',
        taxDeductionPlace: '',
        reportingManager: '',
        jobResponsibility: '',
        paygroup: '',
        associateCode: '',
        location: '',
        // Salary & PF Details
        isPfEligible: false,
        fixedBasic: '',
        fixedHra: '',
        fixedSplAllowance: '',
        fixedDa: '',
        fixedOtherAllowance: '',
        fixedGross: '',
        agp: '',
        pfContribution: '',
        esiContribution: '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [docFiles, setDocFiles] = useState({
        aadhar: null,
        pan: null,
        license: null,
        bankpassbook: null,
        degreecertificate: null,
        payslip: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // OTP Verification States
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    // Phone OTP Verification States
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
    const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const branchResponse = await getBranches().catch(() => ({ branches: [] }));
            setBranches(branchResponse.branches || []);

            if (id) {
                const empResponse = await getEmployees();
                const employee = empResponse.employees?.find(emp => emp.employeeId === id);
                if (employee) {
                    setFormData({
                        employeeId: employee.employeeId,
                        name: employee.name || '',
                        email: employee.email || '',
                        phone: employee.phone || '',
                        department: employee.department || '',
                        designation: employee.designation || '',
                        branchId: employee.branchId || '',
                        role: employee.role || 'EMPLOYEE',
                        workMode: employee.workMode || 'OFFICE',
                        employeeType: employee.employeeType || 'mobile',
                        panNumber: employee.panNumber || '',
                        aadharNumber: employee.aadharNumber || '',
                        uan: employee.uan || '',
                        esicIP: employee.esicIP || '',
                        bankAccount: employee.bankAccount || '',
                        ifscCode: employee.ifscCode || '',
                        paymentMode: employee.paymentMode || 'CASH',
                        fixedSalary: employee.fixedSalary || '',
                        joinedDate: employee.joinedDate ? employee.joinedDate.split('T')[0] : '',
                        firstName: employee.firstName || '',
                        middleName: employee.middleName || '',
                        lastName: employee.lastName || '',
                        gender: employee.gender || '',
                        fatherName: employee.fatherName || '',
                        dob: employee.dob || '',
                        grade: employee.grade || '',
                        costCentre: employee.costCentre || '',
                        taxDeductionPlace: employee.taxDeductionPlace || '',
                        reportingManager: employee.reportingManager || '',
                        jobResponsibility: employee.jobResponsibility || '',
                        paygroup: employee.paygroup || '',
                        associateCode: employee.associateCode || '',
                        location: employee.location || '',
                        isPfEligible: employee.isPfEligible || false,
                        fixedBasic: employee.fixedBasic || '',
                        fixedHra: employee.fixedHra || '',
                        fixedSplAllowance: employee.fixedSplAllowance || '',
                        fixedDa: employee.fixedDa || '',
                        fixedOtherAllowance: employee.fixedOtherAllowance || '',
                        fixedGross: employee.fixedGross || '',
                        agp: employee.agp || '',
                        pfContribution: employee.pfContribution || '',
                        esiContribution: employee.esiContribution || '',
                        documents: employee.documents || {},
                    });
                    setPhotoPreview(employee.photoUrl || null);
                    // If editing, assume verified
                    setIsVerified(true);
                    setIsPhoneVerified(true);
                } else {
                    setError('Employee not found');
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            setDocFiles(prev => ({ ...prev, [field]: file }));
        }
    };

    const handleSendOTP = async () => {
        if (!formData.email) {
            setError('Please enter an email address');
            return;
        }
        setOtpLoading(true);
        setError('');
        try {
            await sendOTP(formData.email, formData.name || 'Employee');
            setOtpSent(true);
            setSuccess('OTP sent successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }
        setVerifyLoading(true);
        setError('');
        try {
            await verifyOTP(formData.email, otp);
            setIsVerified(true);
            setSuccess('Email verified successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleSendPhoneOTP = async () => {
        if (!formData.phone) {
            setError('Please enter a phone number');
            return;
        }
        setPhoneOtpLoading(true);
        setError('');
        try {
            await sendSMSOTP(formData.phone, formData.name || 'Employee');
            setPhoneOtpSent(true);
            setSuccess('SMS OTP sent successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send SMS OTP');
        } finally {
            setPhoneOtpLoading(false);
        }
    };

    const handleVerifyPhoneOTP = async () => {
        if (!phoneOtp) {
            setError('Please enter the OTP');
            return;
        }
        setPhoneVerifyLoading(true);
        setError('');
        try {
            await verifySMSOTP(formData.phone, phoneOtp);
            setIsPhoneVerified(true);
            setSuccess('Phone verified successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setPhoneVerifyLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name) {
            setError('Name is required');
            return;
        }

        const platformAccess = formData.platformAccess || 'Mobile';
        if (platformAccess === 'Kiosk' && !formData.branchId) {
            setError('Branch is mandatory for Kiosk Employees');
            return;
        }

        if (id && !formData.employeeId) {
            setError('Employee ID missing for update');
            return;
        }

        if (!formData.email) {
            setError('Email is mandatory');
            return;
        }

        if (!formData.phone) {
            setError('Phone number is mandatory');
            return;
        }

        if (!id && !isVerified) {
            setError('Please verify the email with OTP before creating employee');
            return;
        }

        if (!id && !isPhoneVerified) {
            setError('Please verify the phone number with OTP before creating employee');
            return;
        }
        try {
            let dataToSend;
            const hasFiles = Object.values(docFiles).some(f => f !== null);

            if (hasFiles) {
                dataToSend = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (key === 'photoUrl' || key === 'photo') return; // Skip photo
                        if (typeof value === 'object' && key !== 'documents') {
                            dataToSend.append(key, JSON.stringify(value));
                        } else if (key !== 'documents') {
                            dataToSend.append(key, value);
                        }
                    }
                });
                if (docFiles.aadhar) dataToSend.append('doc_aadhar', docFiles.aadhar);
                if (docFiles.pan) dataToSend.append('doc_pan', docFiles.pan);
                if (docFiles.license) dataToSend.append('doc_license', docFiles.license);
                if (docFiles.bankpassbook) dataToSend.append('doc_bankpassbook', docFiles.bankpassbook);
                if (docFiles.degreecertificate) dataToSend.append('doc_degreecertificate', docFiles.degreecertificate);
                if (docFiles.payslip) dataToSend.append('doc_payslip', docFiles.payslip);

                if (!id) dataToSend.append('addedBy', 'Super Admin');
            } else {
                const filteredData = { ...formData };
                delete filteredData.photoUrl;
                delete filteredData.photo;
                dataToSend = { ...filteredData, addedBy: 'Super Admin' };
            }

            if (id) {
                await updateEmployee(id, dataToSend);
                setSuccess('Employee updated successfully');
            } else {
                await createEmployee(dataToSend);
                setSuccess('Employee created successfully');
            }
            setTimeout(() => navigate('/employees'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving employee');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="employee-form-page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/employees')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
                    <FiArrowLeft style={{ marginRight: '6px' }} /> Back
                </button>
                <h1 style={{ margin: 0, fontSize: '24px' }}>{id ? 'Edit Employee' : 'Add New Employee'}</h1>
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase' }}>Basic Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        {id && (
                            <div className="form-group">
                                <label className="form-label">Employee ID *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.employeeId}
                                    placeholder="e.g., SRM001"
                                    disabled={true}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Platform Access</label>
                            <select
                                className="form-input"
                                value={formData.platformAccess || 'Mobile'}
                                onChange={(e) => setFormData({ ...formData, platformAccess: e.target.value })}
                            >
                                <option value="Mobile">Mobile App User</option>
                                <option value="Kiosk">Kiosk / Common User</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email *</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (otpSent || isVerified) { setOtpSent(false); setIsVerified(false); }
                                    }}
                                    disabled={!!id}
                                />
                                {!id && formData.email && !isVerified && (
                                    <button type="button" className="btn btn-secondary" onClick={handleSendOTP} disabled={otpLoading}>
                                        {otpSent ? 'Resend' : 'Send'}
                                    </button>
                                )}
                                {isVerified && <FiCheck color="#10b981" />}
                            </div>
                            {!id && otpSent && !isVerified && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <input type="text" className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
                                    <button type="button" className="btn btn-primary" onClick={handleVerifyOTP} disabled={verifyLoading}>Verify</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FiPhone style={{ marginRight: '6px' }} />Phone *</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        if (phoneOtpSent || isPhoneVerified) { setPhoneOtpSent(false); setIsPhoneVerified(false); }
                                    }}
                                    disabled={!!id}
                                />
                                {!id && formData.phone && !isPhoneVerified && (
                                    <button type="button" className="btn btn-secondary" onClick={handleSendPhoneOTP} disabled={phoneOtpLoading}>
                                        {phoneOtpSent ? 'Resend' : 'Send'}
                                    </button>
                                )}
                                {isPhoneVerified && <FiCheck color="#10b981" />}
                            </div>
                            {!id && phoneOtpSent && !isPhoneVerified && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <input type="text" className="form-input" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} placeholder="Enter OTP" />
                                    <button type="button" className="btn btn-primary" onClick={handleVerifyPhoneOTP} disabled={phoneVerifyLoading}>Verify</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Branch *</label>
                            <select className="form-input" value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}>
                                <option value="">Select a branch</option>
                                {branches.map(b => <option key={b.branchId} value={b.branchId}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input type="text" className="form-input" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Designation</label>
                            <input type="text" className="form-input" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                        </div>
                    </div>

                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: '32px' }}>Professional Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className="form-group">
                            <label className="form-label">Work Mode</label>
                            <select className="form-input" value={formData.workMode} onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}>
                                <option value="OFFICE">OFFICE</option>
                                <option value="FIELD_SALES">FIELD SALES</option>
                                <option value="REMOTE">REMOTE</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Associate Code</label>
                            <input type="text" className="form-input" value={formData.associateCode} onChange={(e) => setFormData({ ...formData, associateCode: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Paygroup</label>
                            <input type="text" className="form-input" value={formData.paygroup} onChange={(e) => setFormData({ ...formData, paygroup: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reporting Manager</label>
                            <input type="text" className="form-input" value={formData.reportingManager} onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cost Centre</label>
                            <input type="text" className="form-input" value={formData.costCentre} onChange={(e) => setFormData({ ...formData, costCentre: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Joined Date</label>
                            <input type="date" className="form-input" value={formData.joinedDate} onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })} />
                        </div>
                    </div>

                    {/* Secondary Employee Photo section removed to avoid redundancy and per user request */}

                    {/* Documents Section */}
                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: '32px' }}>Employee Documents</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        {[
                            { label: 'Aadhar Card', key: 'aadhar', url: formData.documents?.aadharUrl },
                            { label: 'PAN Card', key: 'pan', url: formData.documents?.panUrl },
                            { label: 'Driving License', key: 'license', url: formData.documents?.licenseUrl },
                            { label: 'Bank Passbook', key: 'bankpassbook', url: formData.documents?.bankPassbookUrl },
                            { label: 'Degree / Payslip', key: 'degreecertificate', url: formData.documents?.degreeCertificateUrl || formData.documents?.payslipUrl }
                        ].map((doc, idx) => (
                            <div className="form-group" key={idx}>
                                <label className="form-label">{doc.label}</label>
                                {doc.url && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', marginBottom: '8px' }}>
                                        <FiCheck color="#0284c7" />
                                        <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 500 }}>Uploaded</span>
                                        <a href={doc.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                                            View <FiExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {!id && <input type="file" onChange={(e) => handleFileChange(doc.key, e)} style={{ fontSize: '12px' }} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Salary Details (Excel Style) */}
                    <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: '32px' }}>Salary Details & PF Eligibility</h4>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            <input
                                type="checkbox"
                                checked={formData.isPfEligible}
                                onChange={(e) => setFormData({ ...formData, isPfEligible: e.target.checked })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Eligible for PF (Provident Fund)
                        </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', background: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '32px' }}>
                        <div className="form-group">
                            <label className="form-label">Fixed Basic</label>
                            <input type="number" className="form-input" value={formData.fixedBasic} onChange={(e) => setFormData({ ...formData, fixedBasic: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fixed HRA</label>
                            <input type="number" className="form-input" value={formData.fixedHra} onChange={(e) => setFormData({ ...formData, fixedHra: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fixed Spl Allowance</label>
                            <input type="number" className="form-input" value={formData.fixedSplAllowance} onChange={(e) => setFormData({ ...formData, fixedSplAllowance: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fixed DA</label>
                            <input type="number" className="form-input" value={formData.fixedDa} onChange={(e) => setFormData({ ...formData, fixedDa: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fixed Other Allowance</label>
                            <input type="number" className="form-input" value={formData.fixedOtherAllowance} onChange={(e) => setFormData({ ...formData, fixedOtherAllowance: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }}>Fixed Gross</label>
                            <input type="number" className="form-input" value={formData.fixedGross} onChange={(e) => setFormData({ ...formData, fixedGross: e.target.value })} placeholder="0.00" style={{ fontWeight: '600', borderColor: 'var(--primary)' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">AGP</label>
                            <input type="number" className="form-input" value={formData.agp} onChange={(e) => setFormData({ ...formData, agp: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">PF Contribution</label>
                            <input type="number" className="form-input" value={formData.pfContribution} onChange={(e) => setFormData({ ...formData, pfContribution: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">EmpESI</label>
                            <input type="number" className="form-input" value={formData.esiContribution} onChange={(e) => setFormData({ ...formData, esiContribution: e.target.value })} placeholder="0.00" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>{id ? 'Update Employee' : 'Create Employee'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
