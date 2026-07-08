import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Menu, X, LogOut, Moon, Sun, LayoutDashboard, Users, UserCheck, Shield, Calendar, FileText, DollarSign, Network, Briefcase, ClipboardList, Phone, Bell, User, Mail, CheckCircle, ChevronLeft, ChevronRight, BarChart } from 'lucide-react'
import EmployeeModule, { SingleEmployeeView } from '../modules/EmployeeModule'
import DepartmentModule from '../modules/DepartmentModule'
import AttendanceModule from '../modules/AttendanceModule'
import LeaveModule from '../modules/LeaveModule'
import PayrollModule from '../modules/PayrollModule'
import PerformanceModule from '../modules/PerformanceModule'
import DashboardHome from '../modules/DashboardHome'
import GenerateLetterModule from '../modules/GenerateLetterModule'
import HiringModule from '../modules/HiringModule'
import ProfileVerificationModule from '../modules/ProfileVerificationModule'
import ContactEmployeeModule from '../modules/ContactEmployeeModule'
import HolidayModule from '../modules/HolidayModule'
import ProjectModule from '../modules/ProjectModule'
import TaskModule from '../modules/TaskModule'
import ReportsModule from '../modules/ReportsModule'



import EmployeeSidebarTabs from '../components/EmployeeSidebarTabs'
import logoImg from '../assets/TDTL_logo.png'
import DashboardSkeleton from '../components/DashboardSkeleton'
import { useEffect } from 'react'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [moduleLoading, setModuleLoading] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Only show module skeletons when not in initial dashboard boot, specifically for HR role
    if (!isInitialLoading && user?.role === 'hr') {
      setModuleLoading(true)
      const timer = setTimeout(() => {
        setModuleLoading(false)
      }, 550) // Premium 550ms transition loading state
      return () => clearTimeout(timer)
    }
  }, [location.pathname, isInitialLoading, user?.role])

  if (isInitialLoading) {
    return <DashboardSkeleton pathname={location.pathname} />
  }

  if (user?.role === 'employee') {
    return <EmployeeSidebarTabs />
  }

  const handleLogout = () => {
    logout()
  }

  const getNavigationItems = () => {
    const role = user?.role || 'employee'

    if (role === 'admin') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/dashboard/employees', label: 'Employees', icon: <Users size={18} /> },
        { path: '/dashboard/leaders', label: 'Leaders', icon: <UserCheck size={18} /> },
        { path: '/dashboard/hrs', label: 'HRs', icon: <Users size={18} /> },
        { path: '/dashboard/admins', label: 'Admins', icon: <Shield size={18} /> },
        { path: '/dashboard/attendance', label: 'Attendance', icon: <Calendar size={18} /> },
        { path: '/dashboard/monthly-report', label: 'Monthly Report', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/holidays', label: 'Holiday Calendar', icon: <Calendar size={18} /> },
        { path: '/dashboard/leave', label: 'Leaves', icon: <FileText size={18} /> },
        { path: '/dashboard/leave-type', label: 'Leave Type', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/payroll', label: 'Salary', icon: <DollarSign size={18} /> },
        { path: '/dashboard/teams', label: 'Teams', icon: <Network size={18} /> },
        { path: '/dashboard/projects', label: 'Projects', icon: <Briefcase size={18} /> },
        { path: '/dashboard/tasks', label: 'Tasks', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/contact', label: 'Contact Employee', icon: <Phone size={18} /> },
        { path: '/dashboard/profile-verification', label: 'Profile Verification', icon: <CheckCircle size={18} /> },
        { path: '/dashboard/generate-letter', label: 'Generate Letter', icon: <FileText size={18} /> },
        { path: '/dashboard/hiring-vacancies', label: 'Hiring & Vacancies', icon: <Briefcase size={18} /> },
        { path: '/dashboard/hiring', label: 'Hiring', icon: <Users size={18} /> },
        { path: '/dashboard/reports', label: 'Reports', icon: <BarChart size={18} /> },
      ]
    }

    if (role === 'hr') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/dashboard/my-attendance', label: 'My Attendance', icon: <Calendar size={18} /> },
        { path: '/dashboard/my-leaves', label: 'My Leaves', icon: <FileText size={18} /> },
        { path: '/dashboard/attendance', label: 'Manage Attendance', icon: <Calendar size={18} /> },
        { path: '/dashboard/monthly-report', label: 'Monthly Report', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/leave', label: 'Manage Leaves', icon: <FileText size={18} /> },
        { path: '/dashboard/leave-type', label: 'Leave Type', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/payroll', label: 'Salary', icon: <DollarSign size={18} /> },
        { path: '/dashboard/generate-letter', label: 'Generate Letter', icon: <Mail size={18} /> },
        { path: '/dashboard/hiring', label: 'Hiring', icon: <Users size={18} /> },
        { path: '/dashboard/profile-verification', label: 'Profile Verification', icon: <CheckCircle size={18} /> },
        { path: '/dashboard/contact', label: 'Contact Employee', icon: <Phone size={18} /> },
      ]
    }

    if (role === 'manager' || role === 'leaders') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/dashboard/attendance', label: 'Attendance', icon: <Calendar size={18} /> },
        { path: '/dashboard/monthly-report', label: 'Monthly Report', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/teams', label: 'My Teams', icon: <Users size={18} /> },
        { path: '/dashboard/projects', label: 'My Projects', icon: <Briefcase size={18} /> },
        { path: '/dashboard/leave', label: 'Leaves', icon: <FileText size={18} /> },
        { path: '/dashboard/leave-type', label: 'Leave Type', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/tasks', label: 'Assign Task', icon: <ClipboardList size={18} /> },
        { path: '/dashboard/contact', label: 'Contact Employee', icon: <Users size={18} /> },
        { path: '/dashboard/hiring', label: 'Hiring Requirements', icon: <Briefcase size={18} /> },
      ]
    }

    const items = [
      { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
      { path: '/dashboard/employees', label: 'Employees', icon: <Users size={18} /> },
    ]

    if (role !== 'employee') {
      items.push({ path: '/dashboard/departments', label: 'Departments', icon: <Briefcase size={18} /> })
    }

    items.push(
      { path: '/dashboard/attendance', label: 'Attendance', icon: <Calendar size={18} /> },
      { path: '/dashboard/monthly-report', label: 'Monthly Report', icon: <ClipboardList size={18} /> },
      { path: '/dashboard/leave', label: 'Leave Management', icon: <FileText size={18} /> },
      { path: '/dashboard/leave-type', label: 'Leave Type', icon: <ClipboardList size={18} /> },
      { path: '/dashboard/payroll', label: 'Payroll', icon: <DollarSign size={18} /> },
      { path: '/dashboard/performance', label: 'Performance', icon: <UserCheck size={18} /> }
    )

    return items
  }

  const navigationItems = getNavigationItems()

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/dashboard/hiring' || path === '/dashboard/leave' || path === '/dashboard/attendance') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-card border-r border-border transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* Top brand & nav list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="h-20 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
            {sidebarOpen ? (
              <div className="flex items-center justify-between w-full">
                <img src={logoImg} alt="TDTL Logo" className="h-10 max-w-[140px] object-contain" />
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer text-slate-500 flex-shrink-0"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full gap-1">
                <img src={logoImg} alt="TDTL" className="h-6 w-auto object-contain mx-auto" />
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer text-slate-500 mt-1"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 font-sans">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive(item.path)
                  ? 'bg-[#0c6396] text-white font-bold shadow-md shadow-[#0c6396]/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-background">
        {/* Top Bar */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#0c6396] dark:text-[#38bdf8]">
            {isActive('/dashboard/employees') ? '' :
              isActive('/dashboard/departments') ? 'Departments' :
                isActive('/dashboard/my-attendance') ? '' :
                  isActive('/dashboard/my-leaves') ? '' :
                    isActive('/dashboard/monthly-report') ? '' :
                      isActive('/dashboard/attendance') ? '' :
                      isActive('/dashboard/leave-type') ? '' :
                        isActive('/dashboard/leave') ? '' :
                          isActive('/dashboard/payroll') ? '' :
                            isActive('/dashboard/performance') ? 'Performance' :
                              isActive('/dashboard/profile-verification') ? '' :
                                isActive('/dashboard/profile') ? 'My Profile' :
                                    isActive('/dashboard/leaders') ? '' :
                                     isActive('/dashboard/hrs') ? '' :
                                       isActive('/dashboard/admins') ? '' :
                                        isActive('/dashboard/holidays') ? '' :
                                          isActive('/dashboard/teams') ? '' :
                                            isActive('/dashboard/projects') ? '' :
                                              isActive('/dashboard/tasks') ? '' :
                                                isActive('/dashboard/generate-letter') ? '' :
                                                  isActive('/dashboard/hiring') ? '' :
                                                    isActive('/dashboard/contact') ? '' :
                                                      isActive('/dashboard/notifications') ? 'Notifications' :
                                                        ''}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>

            <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800"></span>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Notifications Link */}
              <Link
                to="/dashboard/notifications"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 relative"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </Link>

              {/* Dark/Light mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 cursor-pointer"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
              </button>
            </div>

            <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800"></span>

            {/* User Profile Card */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-all"
              >
                <div className="flex flex-col text-right hidden sm:flex">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">{user?.name || 'HR Specialist'}</p>
                  <span className="text-[8px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">
                    {user?.role === 'hr' ? 'HR Manager' : user?.role === 'admin' ? 'Master Admin' : (user?.role === 'manager' || user?.role === 'leaders') ? 'Manager' : 'Employee'}
                  </span>
                </div>
                <div className="w-8 h-8 bg-cyan-50 dark:bg-[#0c6396]/20 text-[#0c6396] dark:text-[#38bdf8] font-bold rounded-xl flex items-center justify-center border border-cyan-100/50 dark:border-cyan-900/30 shadow-sm text-xs">
                  {user?.name?.charAt(0) || 'H'}
                </div>
              </div>

              <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800"></span>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {moduleLoading ? (
            <DashboardSkeleton pathname={location.pathname} />
          ) : (
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/profile/*" element={user?.role === 'hr' || user?.role === 'manager' || user?.role === 'leaders' ? <SingleEmployeeView user={user} /> : <EmployeeModule />} />
              <Route path="/my-attendance/*" element={<AttendanceModule forceEmployeeMode={true} />} />
              <Route path="/my-leaves/*" element={<LeaveModule forceEmployeeMode={true} />} />
              <Route path="/employees/*" element={<EmployeeModule />} />
              <Route path="/leaders/*" element={<EmployeeModule />} />
              <Route path="/hrs/*" element={<EmployeeModule />} />
              <Route path="/admins/*" element={<EmployeeModule />} />
              {user?.role !== 'employee' && (
                <Route path="/departments/*" element={<DepartmentModule />} />
              )}
              <Route path="/attendance/*" element={<AttendanceModule />} />
              <Route path="/monthly-report/*" element={<AttendanceModule forceMonthlyReportTab={true} />} />
              <Route path="/leave/*" element={<LeaveModule />} />
              <Route path="/leave-type/*" element={<LeaveModule forceLeaveTypeTab={true} />} />
              <Route path="/payroll/*" element={<PayrollModule />} />
              <Route path="/performance/*" element={<PerformanceModule />} />
              <Route path="/holidays/*" element={<HolidayModule />} />
              <Route path="/teams/*" element={<DepartmentModule />} />
              <Route path="/projects/*" element={<ProjectModule />} />
              <Route path="/tasks/*" element={<TaskModule />} />
              <Route path="/generate-letter/*" element={<GenerateLetterModule />} />
              <Route path="/hiring/*" element={<HiringModule />} />
              <Route path="/hiring-vacancies/*" element={<HiringModule />} />
              <Route path="/profile-verification/*" element={<ProfileVerificationModule />} />
              <Route path="/contact/*" element={user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager' || user?.role === 'leaders' ? <ContactEmployeeModule /> : <PlaceholderModule title="Contact Employee" />} />
              <Route path="/reports/*" element={<ReportsModule />} />
              <Route path="/notifications/*" element={<PlaceholderModule title="Notifications" />} />
            </Routes>
          )}
        </div>
      </div>

      {/* Profile Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[2rem] max-w-4xl w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">My Profile</h3>
            </div>
            <div className="p-1">
              <SingleEmployeeView user={user} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PlaceholderModule = ({ title }) => {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm text-center max-w-xl mx-auto mt-12 space-y-4">
      <div className="w-16 h-16 bg-cyan-500/10 text-[#0c6396] rounded-2xl flex items-center justify-center mx-auto">
        <Briefcase size={28} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title} Module</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        This section is pre-configured for Master Administration. Details and analytics are currently managed from the system dashboard overview.
      </p>
    </div>
  )
}

export default Dashboard

