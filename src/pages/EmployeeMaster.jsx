import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiUsers, FiPlusCircle, FiBarChart2, FiBriefcase } from 'react-icons/fi';

const EmployeeMaster = () => {
    const location = useLocation();

    const tabs = [
        { 
            path: '/master/list', 
            label: 'Employee List', 
            icon: <FiUsers />,
            matches: (path) => path === '/master/list' || path === '/master'
        },
        { 
            path: '/master/add', 
            label: 'Add Employee', 
            icon: <FiPlusCircle />,
            matches: (path) => path.includes('/add') || path.includes('/edit')
        },
        { 
            path: '/master/stats', 
            label: 'Statistics', 
            icon: <FiBarChart2 />,
            matches: (path) => path.includes('/stats')
        },
        { 
            path: '/master/designations', 
            label: 'Add Designation', 
            icon: <FiBriefcase />,
            matches: (path) => path.includes('/designations')
        }
    ];

    return (
        <div className="master-page-wrapper">
            <Outlet />
        </div>
    );
};

export default EmployeeMaster;
