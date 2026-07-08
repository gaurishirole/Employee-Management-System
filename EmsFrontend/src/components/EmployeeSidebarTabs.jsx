import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  User,
  Calendar,
  ClipboardList,
  Briefcase,
  Phone,
  FileText,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Search,
  CheckCircle,
  Plus,
  Trash2,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react'
import DashboardHome from '../modules/DashboardHome'
import { SingleEmployeeView } from '../modules/EmployeeModule'
import AttendanceModule from '../modules/AttendanceModule'
import LeaveModule from '../modules/LeaveModule'
import logoImg from '../assets/TDTL_logo.png'
import ContactEmployeeModule from '../modules/ContactEmployeeModule'
import DashboardSkeleton from './DashboardSkeleton'
import { apiFetch, getRolePrefix } from '../utils/api'

const EmployeeSidebarTabs = ({ employees, setEmployees }) => {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leaveSubmenuOpen, setLeaveSubmenuOpen] = useState(false)
  const [empList, setEmpList] = useState([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [moduleLoading, setModuleLoading] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchInitData = async () => {
      if (user?.role) {
        try {
          const prefix = getRolePrefix(user.role)
          const empData = await apiFetch(`${prefix}/employees`).catch(() => [])
          setEmpList(empData)
        } catch (err) {
          console.error(err)
        }
      }
      if (user?.id) {
        try {
          const notiData = await apiFetch(`/notifications/${user.id}`).catch(() => [])
          const mapped = notiData.map((n, i) => ({
            id: n.id || i,
            title: 'System Update',
            message: n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'recent',
            read: n.isRead || false
          }))
          setNotifications(mapped)
        } catch (err) {
          console.error(err)
        }
      }
    }
    fetchInitData()
  }, [user?.id, user?.role])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isInitialLoading) {
      setModuleLoading(true)
      const timer = setTimeout(() => {
        setModuleLoading(false)
      }, 550)
      return () => clearTimeout(timer)
    }
  }, [activeTab, isInitialLoading])

  // Local state for Tasks demo
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Submit quarterly self-evaluation', project: 'Nexus HR Portal', status: 'pending', deadline: '2026-06-10' },
    { id: '2', title: 'Update project documentation in wiki', project: 'Cloud Migration', status: 'completed', deadline: '2026-06-02' },
    { id: '3', title: 'Review API specs with engineering team', project: 'Nexus HR Portal', status: 'in-progress', deadline: '2026-06-05' }
  ])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskProject, setNewTaskProject] = useState('General')

  // Local state for Projects demo
  const projects = [
    { id: '1', name: 'Nexus HR Portal - Admin Dashboard', manager: 'John Doe', progress: 65, status: 'In Progress', description: 'Rebuilding the corporate human resource platform with React & Vite.' },
    { id: '2', name: 'Cloud Migration & Infrastructure', manager: 'Jane Smith', progress: 100, status: 'Completed', description: 'Transitioning legacy hosting environments to modern serverless providers.' },
    { id: '3', name: 'Security Audit & Compliance', manager: 'Alice Williams', progress: 15, status: 'On Hold', description: 'Performing end-to-end vulnerability scans and SOC2 compliance checks.' }
  ]

  // Search state for Contact Employee Directory
  const [searchDirectory, setSearchDirectory] = useState('')

  if (isInitialLoading) {
    return <DashboardSkeleton pathname={`/dashboard/${activeTab}`} />
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle) return
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      project: newTaskProject,
      status: 'pending',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
  }

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : t.status === 'pending' ? 'in-progress' : 'completed'
        return { ...t, status: nextStatus }
      }
      return t
    }))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
    { id: 'monthly-report', label: 'Monthly Report', icon: <ClipboardList size={18} /> },
    { id: 'tasks', label: 'My Task', icon: <ClipboardList size={18} /> },
    { id: 'projects', label: 'My Project', icon: <Briefcase size={18} /> },
    { id: 'contact', label: 'Contact Employee', icon: <Phone size={18} /> },
    { id: 'leave', label: 'Apply Leave', icon: <FileText size={18} /> },
    { id: 'leave-type', label: 'Leave Type', icon: <ClipboardList size={18} /> }
  ]

  const getTabTitle = () => {
    if (activeTab === 'leave-type') return 'Leave Type'
    if (activeTab === 'monthly-report') return 'Monthly Report'
    const item = navigationItems.find(nav => nav.id === activeTab)
    return item ? item.label : 'Employee Hub'
  }

  const filteredDirectory = empList.filter(emp =>
    emp.name.toLowerCase().includes(searchDirectory.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchDirectory.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchDirectory.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchDirectory.toLowerCase())
  )

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar Panel */}
      <div className={`bg-card border-r border-border transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* Sidebar Brand Header */}
        <div>
          <div className="h-16 border-b border-border flex items-center justify-between px-4">
            {sidebarOpen ? (
              <div className="flex items-center justify-between w-full">
                <img src={logoImg} alt="TDTL Logo" className="h-10 max-w-[140px] object-contain" />
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex-shrink-0"
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

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${activeTab === item.id
                  ? 'bg-[#0c6396] text-white font-bold shadow-md shadow-[#0c6396]/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-background">

        {/* Top Header Bar */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card flex-shrink-0">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>

            <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800"></span>

            {/* Action Buttons */}
            <div ref={dropdownRef} className="flex items-center gap-1 relative">
              {/* Notifications Trigger */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 relative cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-card shadow-sm">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-50 text-left font-sans">
                  <div className="px-4 py-3.5 border-b border-border/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                    <span className="font-bold text-slate-800 dark:text-white text-sm">Notifications</span>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                        className="text-[10px] text-[#0c6396] hover:underline font-bold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(noti => (
                        <div
                          key={noti.id}
                          onClick={() => setNotifications(notifications.map(n => n.id === noti.id ? { ...n, read: true } : n))}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex gap-2.5 items-start ${!noti.read ? 'bg-slate-50/50 dark:bg-slate-800/10' : ''}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!noti.read ? 'bg-red-500' : 'bg-transparent'}`}></div>
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-slate-800 dark:text-white text-xs leading-none">{noti.title}</p>
                              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{noti.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{noti.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

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
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">{user?.name || 'employee'}</p>
                  <span className="text-[8px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">
                    Employee
                  </span>
                </div>
                <div className="w-8 h-8 bg-cyan-50 dark:bg-[#0c6396]/20 text-[#0c6396] dark:text-[#38bdf8] font-bold rounded-xl flex items-center justify-center border border-cyan-100/50 dark:border-cyan-900/30 shadow-sm text-xs">
                  {user?.name?.charAt(0) || 'E'}
                </div>
              </div>

              <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800"></span>

              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Detail Content Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {moduleLoading ? (
            <DashboardSkeleton pathname={`/dashboard/${activeTab}`} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardHome />
              )}

              {activeTab === 'profile' && (
                <SingleEmployeeView
                  user={user}
                  employees={empList}
                  setEmployees={(updated) => {
                    setEmpList(updated)
                    if (typeof setEmployees === 'function') {
                      setEmployees(updated)
                    }
                  }}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceModule />
              )}

              {activeTab === 'monthly-report' && (
                <AttendanceModule forceEmployeeMode={true} forceMonthlyReportTab={true} />
              )}

              {activeTab === 'leave' && (
                <LeaveModule forceEmployeeMode={true} />
              )}

              {activeTab === 'leave-type' && (
                <LeaveModule forceEmployeeMode={true} forceLeaveTypeTab={true} />
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6 w-full pb-12">
                  {/* Tasks Title Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                        My Tasks
                      </h1>
                      <p className="text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mt-0.5">
                        PERSONAL WORKLOG
                      </p>
                    </div>
                  </div>

                  {/* Tasks Grid Card */}
                  <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">

                    {/* Headers Row */}
                    <div className="grid grid-cols-5 gap-4 px-8 py-5 border-b border-border/40 bg-slate-50/20 dark:bg-slate-800/5 text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wider uppercase">
                      <div>PROJECT ASSIGNMENT</div>
                      <div className="text-center">ORIGIN</div>
                      <div className="text-center">STATE</div>
                      <div className="text-center">FULFILLMENT</div>
                      <div className="text-right">COMMITMENT</div>
                    </div>

                    {/* Empty State Content */}
                    <div className="py-24 text-center">
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 italic">
                        No directives assigned for this period
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6 w-full pb-12">
                  {/* Header Title */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                        Set Up Projects
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Monitor, manage, and trace the progress of ongoing corporate undertakings.
                      </p>
                    </div>
                  </div>

                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Completed */}
                    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">TOTAL COMPLETED</p>
                        <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">0</p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                        <CheckCircle size={20} />
                      </div>
                    </div>
                    {/* In Progress */}
                    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">TOTAL IN PROGRESS</p>
                        <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">1</p>
                      </div>
                      <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-500 rounded-xl">
                        <Clock size={20} />
                      </div>
                    </div>
                    {/* Not Started */}
                    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">TOTAL NOT STARTED</p>
                        <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">0</p>
                      </div>
                      <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 rounded-xl">
                        <Briefcase size={20} />
                      </div>
                    </div>
                    {/* On Hold */}
                    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">TOTAL ON HOLD</p>
                        <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">0</p>
                      </div>
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
                        <X size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Table Container */}
                  <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">List of all Projects</h3>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {/* Entries Control */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <span>Show</span>
                          <select className="border border-border rounded-lg px-2 py-0.5 bg-input text-slate-700 dark:text-slate-200 focus:outline-none">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                          </select>
                          <span>entries</span>
                        </div>
                        {/* Search Bar */}
                        <div className="relative flex-1 sm:flex-none">
                          <input
                            type="text"
                            placeholder="Search..."
                            className="pl-8 pr-4 py-1.5 border border-border rounded-xl text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 bg-input"
                          />
                          <Search className="absolute left-2.5 top-2 text-slate-400" size={12} />
                        </div>
                      </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/60 text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">
                            <th className="pb-3.5">PROJECTS</th>
                            <th className="pb-3.5">CLIENT</th>
                            <th className="pb-3.5">START DATE</th>
                            <th className="pb-3.5">END DATE</th>
                            <th className="pb-3.5">TEAM</th>
                            <th className="pb-3.5">PRIORITY</th>
                            <th className="pb-3.5">PROGRESS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <tr>
                            <td className="py-4 font-bold text-slate-800 dark:text-white">
                              Production Managment System PMS
                            </td>
                            <td className="py-4">Imran Mulla</td>
                            <td className="py-4">01/10/2024</td>
                            <td className="py-4">10/05/2025</td>
                            <td className="py-4">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950 text-[#0c6396] dark:text-cyan-400 font-bold text-[9px] flex items-center justify-center border border-card shadow-sm">IM</div>
                                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[9px] flex items-center justify-center border border-card shadow-sm -ml-1.5">JD</div>
                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[9px] flex items-center justify-center border border-card shadow-sm -ml-1.5">AB</div>
                                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 font-bold text-[9px] flex items-center justify-center border border-card shadow-sm -ml-1.5">KP</div>
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[9px] flex items-center justify-center border border-card shadow-sm -ml-1.5">+2</div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                                High
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="w-28 space-y-1.5">
                                <div className="flex justify-between text-[9px] font-bold">
                                  <span className="text-[#0c6396]">65% Completed</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/40 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#0c6396] h-full rounded-full transition-all duration-500"
                                    style={{ width: '65%' }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Pagination Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/40 text-xs font-semibold text-slate-400">
                      <span>Showing 1 to 1 of 1 records</span>
                      <div className="flex items-center border border-border rounded-xl overflow-hidden divide-x divide-border shadow-sm">
                        <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">Previous</button>
                        <button className="px-3.5 py-1.5 bg-[#0c6396] text-white font-bold transition-colors">1</button>
                        <button className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">Next</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <ContactEmployeeModule />
              )}
            </>
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
            <div className="p-1 font-sans text-slate-800">
              <SingleEmployeeView
                user={user}
                employees={empList}
                setEmployees={(updated) => {
                  setEmpList(updated)
                  if (typeof setEmployees === 'function') {
                    setEmployees(updated)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

export default EmployeeSidebarTabs
