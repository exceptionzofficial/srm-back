/**
 * SRM Sweets Super Admin Panel
 * Main App with React Router
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NotificationHandler from './components/NotificationHandler';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Employees from './pages/Employees';
import EmployeeMaster from './pages/EmployeeMaster';
import EmployeeStats from './pages/EmployeeStats';
import DesignationManager from './pages/DesignationManager';
import RelievedEmployees from './pages/RelievedEmployees';
import EmployeeWizard from './pages/EmployeeWizard';
import Branches from './pages/Branches';
import Attendance from './pages/Attendance';
import AttendanceView from './pages/AttendanceView';
import Salary from './pages/Salary';
import Analytics from './pages/Analytics';
import BranchDetails from './pages/BranchDetails';
import Requests from './pages/Requests';
import AdvancePermits from './pages/AdvancePermits';
import EmployeeRules from './pages/EmployeeRules';
import ChatGroups from './pages/ChatGroups';
import PayGroups from './pages/PayGroups';
import LegalDashboard from './pages/roles/LegalDashboard';
import FinanceDashboard from './pages/roles/FinanceDashboard';
import BranchManagerDashboard from './pages/roles/BranchManagerDashboard';
import Managers from './pages/Managers';
import ManagerForm from './pages/ManagerForm';
import Documents from './pages/Documents';
import Clusters from './pages/Clusters';
import LiveTracking from './pages/LiveTracking';
import './index.css';

import { FiMenu } from 'react-icons/fi';
import { useState } from 'react';

const ProtectedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Auth Bypassed for Super Admin
  return (
    <div className="app-layout">
      <Sidebar userRole="SUPER_ADMIN" isOpen={sidebarOpen} />
      <main className="main-content">
        <header className="top-bar" style={{ 
          height: '60px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px', 
          background: 'white', 
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <FiMenu size={20} />
          </button>
        </header>
        <div className="page-body">
          <NotificationHandler />
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Role Dashboards */}
              <Route path="/legal" element={<LegalDashboard />} />
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/branch" element={<BranchManagerDashboard />} />
              <Route path="/managers" element={<Managers />} />
              <Route path="/managers/add" element={<ManagerForm />} />
              <Route path="/managers/edit/:id" element={<ManagerForm />} />

               {/* Master / Employee Section */}
              <Route path="/master" element={<EmployeeMaster />}>
                <Route index element={<Navigate to="list" replace />} />
                <Route path="list" element={<Employees />} />
                <Route path="add" element={<EmployeeWizard />} />
                <Route path="edit/:id" element={<EmployeeWizard />} />
                <Route path="stats" element={<EmployeeStats />} />
                <Route path="designations" element={<DesignationManager />} />
                <Route path="pay-groups" element={<PayGroups />} />
                <Route path="relieved" element={<RelievedEmployees />} />
              </Route>

               <Route path="/branches" element={<Branches />} />
              <Route path="/branches/:branchId" element={<BranchDetails />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/view/:id" element={<AttendanceView />} />
              <Route path="/requests" element={<Requests />} />
              {/* Advance Sub-Portal */}
              <Route path="/advance" element={<AdvancePermits />} />
              <Route path="/advance/:tab" element={<AdvancePermits />} />
              <Route path="/salary" element={<Salary />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/tracking" element={<LiveTracking />} />
              <Route path="/chat" element={<ChatGroups />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/clusters" element={<Clusters />} />
              <Route path="/rules" element={<EmployeeRules />} />
            </Routes>
          </ProtectedLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
