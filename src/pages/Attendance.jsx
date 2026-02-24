/**
 * Attendance Reports Page - View Only (Work time from GPS tracking)
 */

import { useState, useEffect } from 'react';
import { FiCalendar, FiDownload, FiClock, FiMapPin } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { getAttendanceReport, getEmployees, getBranches, getAttendanceByDate } from '../services/api';
import './Attendance.css';

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();

        // Auto-refresh every 60 seconds for real-time updates
        const refreshInterval = setInterval(() => {
            console.log('[Attendance] Auto-refreshing data...');
            loadData();
        }, 60000);

        return () => clearInterval(refreshInterval);
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [attResponse, empResponse, branchResponse] = await Promise.all([
                getAttendanceByDate(selectedDate).catch(() => ({ records: [] })),
                getEmployees().catch(() => ({ employees: [] })),
                getBranches().catch(() => ({ branches: [] })),
            ]);

            setAttendance(attResponse.records || []);
            setEmployees(empResponse.employees || []);
            setBranches(branchResponse.branches || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatMinutes = (minutes) => {
        if (!minutes || minutes <= 0) return '-';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.employeeId === employeeId);
        return emp?.name || employeeId;
    };

    const getEmployeeBranch = (employeeId) => {
        const emp = employees.find(e => e.employeeId === employeeId);
        const branch = branches.find(b => b.branchId === emp?.branchId);
        return branch?.name || '-';
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'present': return 'badge-success';
            case 'late': return 'badge-warning';
            case 'half-day': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    const calculateDuration = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '--';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.abs(end - start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Export to Excel
    const exportToExcel = () => {
        const data = attendance.map(record => ({
            'Employee ID': record.employeeId,
            'Employee Name': getEmployeeName(record.employeeId),
            'Branch': getEmployeeBranch(record.employeeId),
            'Check In': formatTime(record.checkInTime),
            'Check Out': formatTime(record.checkOutTime),
            'Duration': calculateDuration(record.checkInTime, record.checkOutTime),
            'Status': record.status,
            'Date': selectedDate,
        }));

        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, `Attendance_${selectedDate}.xlsx`);
    };

    // Calculate unique employees who have attendance
    const stats = {
        total: employees.length,
        present: attendance.filter(a => a.status.includes('Present') || a.status.includes('Late in') || a.status.includes('On Travel')).length,
        absent: attendance.filter(a => a.status.includes('Absent')).length,
        travel: attendance.filter(a => a.status.includes('On Travel')).length,
        late: attendance.filter(a => a.status.includes('Late in')).length,
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h1 className="page-title">Attendance Report</h1>
                <div className="header-actions">
                    <div className="date-picker">
                        <FiCalendar />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={exportToExcel}>
                        <FiDownload /> Export Excel
                    </button>
                </div>
            </div>

            <div className="attendance-stats">
                <div className="stat-item">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-text">Total Employees</span>
                </div>
                <div className="stat-item present">
                    <span className="stat-number">{stats.present}</span>
                    <span className="stat-text">Present</span>
                </div>
                <div className="stat-item absent">
                    <span className="stat-number">{stats.absent}</span>
                    <span className="stat-text">Absent</span>
                </div>
                <div className="stat-item late">
                    <span className="stat-number">{stats.late}</span>
                    <span className="stat-text">Late In</span>
                </div>
                <div className="stat-item" style={{ borderBottom: '4px solid var(--info)' }}>
                    <span className="stat-number">{stats.travel}</span>
                    <span className="stat-text">On Travel</span>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 className="card-title" style={{ margin: 0 }}>
                        <FiClock style={{ marginRight: '10px', color: 'var(--primary)' }} />
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : attendance.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Employee</th>
                                    <th>Branch</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Work Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((row, index) => {
                                    return (
                                        <tr key={row.employeeId}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="employee-cell">
                                                    <strong>{row.employeeId}</strong>
                                                    <span>{row.name}</span>
                                                </div>
                                            </td>
                                            <td>{getEmployeeBranch(row.employeeId)}</td>
                                            <td>{row.times?.in || '-'}</td>
                                            <td>{row.times?.out || '-'}</td>
                                            <td>
                                                <span className="work-time">
                                                    <FiClock style={{ marginRight: '4px', fontSize: '12px' }} />
                                                    {formatMinutes(row.totalWorkMinutes)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="status-tags" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {Array.isArray(row.status) ? (
                                                        row.status.map((s, i) => (
                                                            <span key={i} className={`badge ${s.toLowerCase() === 'present' ? 'badge-success' : s.toLowerCase().includes('late') ? 'badge-warning' : s.toLowerCase().includes('absent') ? 'badge-danger' : 'badge-secondary'}`} style={{ fontSize: '10px' }}>
                                                                {s}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className={`badge ${row.status?.toLowerCase() === 'present' ? 'badge-success' : row.status?.toLowerCase().includes('late') ? 'badge-warning' : row.status?.toLowerCase().includes('absent') ? 'badge-danger' : 'badge-secondary'}`} style={{ fontSize: '10px' }}>
                                                            {row.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <FiCalendar className="empty-icon" />
                        <p>No attendance records for this date</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
