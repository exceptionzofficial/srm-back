/**
 * Sidebar Component for Super Admin Panel
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiUsers,
    FiMapPin,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiDollarSign,
    FiFileText,
    FiFile,
    FiMessageSquare,
    FiBriefcase,
    FiBox,
    FiCheckCircle,
    FiPieChart,
    FiLayers,
    FiUserPlus,
    FiList,
    FiBarChart2,
    FiPlusCircle,
    FiAlertCircle,
    FiClock,
    FiUserMinus,
    FiGitBranch
} from 'react-icons/fi';
import './Sidebar.css';
import srmLogo from '../assets/srm-logo.png';

const Sidebar = ({ userRole, isOpen = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [advancePendingCount, setAdvancePendingCount] = useState(0);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const { getAllRequests } = await import('../services/api');
                const res = await getAllRequests('PENDING'); // Get all pending stages
                if (res.requests) {
                    const count = res.requests.filter(r => 
                        ['ADVANCE', 'BRANCH_TRAVEL', 'LEAVE', 'PERMISSION'].includes(r.type)
                    ).length;
                    setAdvancePendingCount(count);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchPending();
        const interval = setInterval(fetchPending, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    let menuItems = [];

    if (userRole === 'SUPER_ADMIN' || !userRole) { // Default to Super Admin view if undefined (dev)
        menuItems = [
            { path: '/', icon: <FiHome />, label: 'Dashboard' },
            { 
                path: '/master', 
                icon: <FiUsers />, 
                label: 'Master',
                subItems: [
                    { path: '/master/list', label: 'Employee List', icon: <FiList /> },
                    { path: '/master/add', label: 'Add Employee', icon: <FiUserPlus /> },
                    { path: '/master/stats', label: 'Statistics', icon: <FiBarChart2 /> },
                    { path: '/master/designations', label: 'Add Designation', icon: <FiPlusCircle /> },
                    { path: '/master/pay-groups', label: 'Pay Groups', icon: <FiLayers /> },
                    { path: '/master/relieved', label: 'Relieved Employees', icon: <FiUserMinus /> },
                    { path: '/master/referrals', label: 'Referral Tree', icon: <FiGitBranch /> }
                ]
            },
            { path: '/branches', icon: <FiMapPin />, label: 'Branches' },
            { path: '/managers', icon: <FiBriefcase />, label: 'Managers' },
            { path: '/tracking', icon: <FiMapPin />, label: 'Live Tracking' },
            { path: '/attendance', icon: <FiCalendar />, label: 'Attendance' },
            { 
                path: '/advance', 
                icon: <FiCheckCircle />, 
                label: 'Advance',
                subItems: [
                    { path: '/advance/requests', label: 'Requests', icon: <FiAlertCircle /> },
                    { path: '/advance/reports', label: 'Reports', icon: <FiFileText /> },
                    { path: '/advance/emi', label: 'EMI Tracking', icon: <FiClock /> }
                ]
            },
            { path: '/documents', icon: <FiFile />, label: 'Documents' },
            { path: '/chat', icon: <FiMessageSquare />, label: 'Chat Groups' }, // Moved up
            { path: '/salary', icon: <FiDollarSign />, label: 'Salary' },
            { path: '/rules', icon: <FiFileText />, label: 'Rules' },
            { path: '/clusters', icon: <FiBox />, label: 'Clusters' },
            // Super Admin Access to Role Dashboards
            { path: '/finance', icon: <FiPieChart />, label: 'Finance' },
            { path: '/branch', icon: <FiMapPin />, label: 'Branch Mgr' },

        ];
    } else {
        // Role Specific Menus
        if (userRole === 'FINANCE_ADMIN') {
            menuItems.push({ path: '/finance', icon: <FiHome />, label: 'Finance Dashboard' });
            menuItems.push({ path: '/salary', icon: <FiDollarSign />, label: 'Salary' });
        }
        if (userRole === 'BRANCH_MANAGER') {
            menuItems.push({ path: '/branch', icon: <FiHome />, label: 'Branch Dashboard' });
            menuItems.push({ path: '/attendance', icon: <FiCalendar />, label: 'Attendance' });
        }
        // Common for all admins
        menuItems.push({ path: '/chat', icon: <FiMessageSquare />, label: 'Chat' });
    }

    const [expandedItem, setExpandedItem] = useState(
        location.pathname.startsWith('/master') ? 'Master' : null
    );

    const toggleExpand = (label) => {
        setExpandedItem(expandedItem === label ? null : label);
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {/* Logo */}
            <div className="sidebar-header">
                <div className="logo">
                    <img src={srmLogo} alt="SRM Sweets" className="logo-image" />
                    <span className="logo-subtitle">{userRole ? userRole.replace('_', ' ') : 'Super Admin'}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <div key={item.label} className="nav-group">
                        {item.subItems ? (
                            <>
                                <div 
                                    className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                                    onClick={() => toggleExpand(item.label)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                    {item.label === 'Advance' && advancePendingCount > 0 && (
                                        <span className="sidebar-badge ml-auto">{advancePendingCount}</span>
                                    )}
                                    <span className={`expand-arrow ${expandedItem === item.label ? 'expanded' : ''}`}>▾</span>
                                </div>
                                {expandedItem === item.label && (
                                    <div className="sub-menu">
                                        {item.subItems.map(sub => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                className={({ isActive }) =>
                                                    `sub-nav-link ${isActive || (sub.path === '/master/list' && location.pathname === '/master') ? 'active' : ''}`
                                                }
                                            >
                                                <span className="sub-nav-icon">{sub.icon}</span>
                                                <span className="sub-nav-label">{sub.label}</span>
                                                {sub.label === 'Requests' && item.label === 'Advance' && advancePendingCount > 0 && (
                                                    <span className="sidebar-badge">{advancePendingCount}</span>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
