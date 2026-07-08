import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { apiFetch, getRolePrefix } from '../utils/api'
import { Clock, CheckCircle, Calendar, DollarSign, Award, ArrowRight, User, Users, UserCheck, FileText, Shield, AlertTriangle, FolderOpen, Info, Briefcase, Activity, TrendingUp, ClipboardList } from 'lucide-react'

const KPICard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 border-green-100 dark:border-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900/30',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 border-orange-100 dark:border-orange-900/30',
  }

  return (
    <div className={`bg-card border rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{subtitle}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  )
}

const AdminKPICard = ({ value, label, icon, watermarkIcon, color, subtitle }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      watermark: 'text-cyan-500/5'
    },
    green: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      watermark: 'text-emerald-500/5'
    },
    orange: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      watermark: 'text-amber-500/5'
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      watermark: 'text-purple-500/5'
    },
    red: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      watermark: 'text-rose-500/5'
    }
  }

  const classes = colorClasses[color] || colorClasses.blue

  return (
    <div className="relative overflow-hidden bg-card border border-border/40 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 min-h-[160px]">
      {/* Icon top-left */}
      <div className={`p-3 rounded-xl w-fit ${classes.bg}`}>
        {icon}
      </div>

      {/* Text block */}
      <div className="mt-6 space-y-1">
        <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          {value}
        </div>
        <div className="text-[10px] font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase">
          {label}
        </div>
        {subtitle && (
          <div className="text-[10px] text-slate-400 font-semibold mt-1">
            {subtitle}
          </div>
        )}
      </div>

      {/* Watermark on the right */}
      <div className={`absolute right-6 bottom-4 ${classes.watermark} select-none pointer-events-none opacity-40 dark:opacity-20`}>
        {React.cloneElement(watermarkIcon || icon, { size: 76, strokeWidth: 1 })}
      </div>
    </div>
  )
}

const ManagerKPICard = ({ title, value, subtitle, icon, watermark: WatermarkIcon, iconColorClass, bgClass }) => {
  return (
    <div className="relative overflow-hidden bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 min-h-[140px]">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {title}
          </span>
          <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1">
            {value}
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-1">
            {subtitle}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl ${bgClass} ${iconColorClass} shadow-sm z-10`}>
          {icon}
        </div>
      </div>
      
      {/* Faint Watermark Icon */}
      {WatermarkIcon && (
        <div className="absolute right-4 bottom-2 text-slate-200/20 dark:text-slate-800/10 pointer-events-none select-none z-0 transform translate-x-2 translate-y-2">
          {React.cloneElement(WatermarkIcon, { size: 80, strokeWidth: 1 })}
        </div>
      )}
    </div>
  )
}

const ActivityItem = ({ title, description, time }) => {
  return (
    <div className="flex gap-4 pb-3 border-b border-border last:border-b-0 last:pb-0">
      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
      <div className="flex-1">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">{time}</p>
    </div>
  )
}

const DashboardHome = () => {
  const { user } = useAuth()
  const { toast } = useNotification()
  const isEmployee = user?.role === 'employee'
  const isManager = user?.role === 'manager' || user?.role === 'leaders' || user?.role === 'leader'

  // Time & Attendance State for Employee
  const [time, setTime] = useState(new Date())
  const [clockState, setClockState] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Dynamic Data Lists
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsDataLoading(true)
        const prefix = getRolePrefix(user?.role)

        if (isEmployee) {
          const data = await apiFetch('/employee/dashboard')
          setDashboardData(data)
        } else if (isManager) {
          const data = await apiFetch('/leader/dashboard')
          setDashboardData(data)
          // Fetch additional manager data for team lists
          const teamRes = await apiFetch('/leader/teams').catch(() => [])
          const projectsRes = await apiFetch('/leader/projects').catch(() => [])
          const tasksRes = await apiFetch('/leader/my-assigned-tasks').catch(() => [])
          
          setEmployees(teamRes.flatMap(t => t.members || []))
          setProjects(projectsRes)
          setTasks(tasksRes)
        } else {
          // Admin or HR
          const empRes = await apiFetch(`${prefix}/employees`).catch(() => [])
          const leaderRes = await apiFetch(`${prefix}/leaders`).catch(() => [])
          const leavesRes = await apiFetch(`${prefix === '/hr' ? '/hr/manage/leaves' : '/admin/leave/all'}`).catch(() => [])
          const projectRes = await apiFetch(`${prefix}/projects`).catch(() => [])

          setEmployees([...empRes, ...leaderRes])
          setLeaves(leavesRes)
          setProjects(projectRes)
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err)
      } finally {
        setIsDataLoading(false)
      }
    }

    if (user?.role) {
      fetchDashboardData()
    }
  }, [user?.role, isEmployee, isManager])

  useEffect(() => {
    if (!isEmployee) return
    const timer = setInterval(() => setTime(new Date()), 1000)

    // Load today's attendance state from localStorage
    const todayStr = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem(`attendance_${user?.id}_${todayStr}`)
    if (stored) {
      setClockState(JSON.parse(stored))
    }

    return () => clearInterval(timer)
  }, [isEmployee, user?.id])

  const handleCheckIn = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    const todayStr = new Date().toISOString().split('T')[0]
    const record = {
      id: 'att-local-' + Date.now().toString(),
      employeeId: user?.id || '1',
      date: todayStr,
      status: 'present',
      checkIn: timeStr,
      checkOut: null
    }
    localStorage.setItem(`attendance_${user?.id}_${todayStr}`, JSON.stringify(record))
    setClockState(record)
    toast.success('Successfully checked in! Have a great day.')
  }

  const handleCheckOut = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    const todayStr = new Date().toISOString().split('T')[0]
    const updated = {
      ...clockState,
      checkOut: timeStr
    }
    localStorage.setItem(`attendance_${user?.id}_${todayStr}`, JSON.stringify(updated))
    setClockState(updated)
    toast.success('Successfully checked out! See you tomorrow.')
  }

  // Fallbacks for calculations
  const totalEmployees = employees.length || 5
  const activeEmployees = employees.filter(e => e.status === 'active').length || totalEmployees
  const presentToday = attendance.filter(a => a.status === 'present').length || 4

  const totalPayroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0) || 540000

  const departmentData = [
    { name: 'Engineering', value: 2 },
    { name: 'Marketing', value: 1 },
    { name: 'Sales', value: 1 },
    { name: 'HR', value: 1 },
  ]

  const chartColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']

  const attendanceData = [
    { date: 'Mon', present: 4, absent: 1 },
    { date: 'Tue', present: 5, absent: 0 },
    { date: 'Wed', present: 4, absent: 1 },
    { date: 'Thu', present: 5, absent: 0 },
    { date: 'Fri', present: 4, absent: 1 },
  ]

  const salaryData = [
    { name: 'Jan', amount: 500000 },
    { name: 'Feb', amount: 520000 },
    { name: 'Mar', amount: 480000 },
    { name: 'Apr', amount: 550000 },
  ]

  // Render Employee Dashboard
  if (isEmployee) {
    if (isDataLoading || !dashboardData) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#0c6396] duration-700"></div>
        </div>
      )
    }

    const formattedDate = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Welcome back, <span className="text-[#0c6396] dark:text-[#38bdf8] lowercase">{user?.name || 'employee'}!</span>
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2 text-xs font-semibold">
              <Calendar size={14} className="text-[#0c6396]" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/30 bg-amber-500/5 text-amber-600 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm">
              <Info size={14} />
              <span>Verification Pending</span>
            </div>
          </div>
        </div>

        {/* KPI Cards: 4 in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminKPICard
            value={dashboardData.leavesUtilized}
            label="Leaves Utilized"
            icon={<Calendar size={20} />}
            watermarkIcon={<Calendar />}
            color="blue"
            subtitle="Approved days"
          />
          <AdminKPICard
            value={dashboardData.pendingRequestsCount}
            label="Pending Requests"
            icon={<Clock size={20} />}
            watermarkIcon={<Clock />}
            color="orange"
            subtitle="Awaiting review"
          />
          <AdminKPICard
            value={dashboardData.tasksFinished}
            label="Tasks Finished"
            icon={<CheckCircle size={20} />}
            watermarkIcon={<CheckCircle />}
            color="green"
            subtitle="Milestones met"
          />
          <AdminKPICard
            value={dashboardData.activeProjectsCount}
            label="Active Projects"
            icon={<FolderOpen size={20} />}
            watermarkIcon={<FolderOpen />}
            color="purple"
            subtitle="Live assignments"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Task Distribution */}
          <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[340px]">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle className="text-[#0c6396] w-5 h-5" /> Task Distribution
            </h2>
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={"100%"} >
                <BarChart data={[
                  { name: 'Pending', count: dashboardData.taskDistribution.pending },
                  { name: 'In Progress', count: dashboardData.taskDistribution.inProgress },
                  { name: 'Completed', count: dashboardData.taskDistribution.completed }
                ]}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Bar dataKey="count" fill="#0c6396" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Allocation */}
          <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[340px]">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="text-[#0c6396] w-5 h-5" /> Leave Allocation
            </h2>
            <div className="h-[200px] flex flex-col items-center justify-between">
              <div className="w-full flex justify-center gap-6 text-[10px] font-black tracking-widest text-slate-500 uppercase mt-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></span> Approved ({dashboardData.leaveAllocation.approved})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> Pending ({dashboardData.leaveAllocation.pending})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Rejected ({dashboardData.leaveAllocation.rejected})</span>
              </div>
              { (dashboardData.leaveAllocation.approved + dashboardData.leaveAllocation.pending + dashboardData.leaveAllocation.rejected) > 0 ? (
                <div className="text-slate-800 dark:text-slate-200 font-bold text-center text-sm my-auto">
                  Total leaves requested this year: {dashboardData.leaveAllocation.approved + dashboardData.leaveAllocation.pending + dashboardData.leaveAllocation.rejected}
                </div>
              ) : (
                <div className="text-slate-400 font-medium text-sm my-auto">
                  No leave allocations recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Active Tasks */}
          <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Active Tasks</h2>
                <Link to="/dashboard/tasks" className="text-[10px] font-black text-[#0c6396] hover:underline uppercase tracking-wider">
                  Full Log &rarr;
                </Link>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Project</th>
                    <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Initiator</th>
                    <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {dashboardData.activeTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{task.project?.name || 'No Project'}</td>
                      <td className="py-3.5 text-xs text-muted-foreground">{task.assignedBy?.name || 'System'}</td>
                      <td className="py-3.5 text-sm text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.status === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                        }`}>{task.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dashboardData.activeTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-medium text-sm italic">
                No active tasks
              </div>
            )}
          </div>

          {/* Recent Leave Logs */}
          <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Leave Logs</h2>
                <Link to="/dashboard/my-leaves" className="text-[10px] font-black text-[#0c6396] hover:underline uppercase tracking-wider">
                  Manage &rarr;
                </Link>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Commencement</th>
                    <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Duration</th>
                    <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {dashboardData.recentLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{new Date(l.fromDate).toLocaleDateString()}</td>
                      <td className="py-3.5 text-xs text-muted-foreground">{l.totalDays} Days</td>
                      <td className="py-3.5 text-sm text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          l.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dashboardData.recentLeaves.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-medium text-sm italic">
                No leave history detected
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  

  
  if (isManager) {
    const managerDept = user?.department || 'Engineering'
    const teamMembers = employees.filter(emp => emp.department === managerDept)
    const totalMembersCount = teamMembers.length
    
    const mockTasks = [
      { id: '1', title: 'Optimize API Endpoints', status: 'Doing', assignedDate: '2026-06-01', assignee: 'John Doe' },
      { id: '2', title: 'Redesign Landing Page UI', status: 'Done', assignedDate: '2026-05-28', assignee: 'Charlie Brown' },
      { id: '3', title: 'Setup CI/CD Pipeline', status: 'Todo', assignedDate: '2026-06-05', assignee: 'John Doe' },
      { id: '4', title: 'Write Technical Docs', status: 'Todo', assignedDate: '2026-06-04', assignee: 'Charlie Brown' }
    ]
    const tasksAssignedCount = mockTasks.length
    
    const mockProjects = [
      { id: '1', name: 'Nexus HR Portal', status: 'In Progress' },
      { id: '2', name: 'Security Audit & Compliance', status: 'On Hold' }
    ]
    const activeProjectsCount = mockProjects.filter(p => p.status === 'In Progress').length
    const leavesRemaining = 12

    // Workforce Pulse calculations
    const todayAttendance = attendance.filter(att => 
      teamMembers.some(m => m.id === att.employeeId)
    )
    const presentCount = todayAttendance.filter(att => att.status === 'present').length
    const lateCount = todayAttendance.filter(att => att.status === 'late').length
    const leaveCount = todayAttendance.filter(att => att.status === 'leave').length
    const absentCount = todayAttendance.filter(att => att.status === 'absent').length
    
    // Add realistic simulation data if actual attendance is empty
    const displayPresent = presentCount + lateCount || teamMembers.length
    const displayLeave = leaveCount || 0
    const displayOvertime = 0
    const displayAbsent = absentCount || 0

    const pulseChartData = [
      { name: 'Mon', pulse: 85 },
      { name: 'Tue', pulse: 92 },
      { name: 'Wed', pulse: 88 },
      { name: 'Thu', pulse: 95 },
      { name: 'Fri', pulse: 90 },
    ]

    const velocityData = [
      { name: 'Todo', count: mockTasks.filter(t => t.status === 'Todo').length, fill: '#0c6396' },
      { name: 'Doing', count: mockTasks.filter(t => t.status === 'Doing').length, fill: '#38bdf8' },
      { name: 'Done', count: mockTasks.filter(t => t.status === 'Done').length, fill: '#10b981' }
    ]

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Manager Overview
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              Department: <span className="text-[#0c6396] dark:text-[#38bdf8] font-black">{managerDept}</span>
            </p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ManagerKPICard
            title="TOTAL MEMBERS"
            value={displayPresent + displayAbsent}
            subtitle="TEAM SIZE"
            icon={<Users size={18} />}
            watermark={<Users />}
            bgClass="bg-cyan-50 dark:bg-cyan-950/40"
            iconColorClass="text-cyan-600 dark:text-cyan-400"
          />
          <ManagerKPICard
            title="TASKS ASSIGNED"
            value={tasksAssignedCount}
            subtitle="ASSIGNED TASKS"
            icon={<ClipboardList size={18} />}
            watermark={<ClipboardList />}
            bgClass="bg-blue-50 dark:bg-blue-950/40"
            iconColorClass="text-blue-600 dark:text-blue-400"
          />
          <ManagerKPICard
            title="MY PROJECTS"
            value={activeProjectsCount}
            subtitle="ACTIVE PROJECTS"
            icon={<Briefcase size={18} />}
            watermark={<Briefcase />}
            bgClass="bg-amber-50 dark:bg-amber-950/40"
            iconColorClass="text-amber-600 dark:text-amber-500"
          />
          <ManagerKPICard
            title="LEAVES REMAINING"
            value={leavesRemaining}
            subtitle="OF 12 DAYS"
            icon={<FileText size={18} />}
            watermark={<FileText />}
            bgClass="bg-emerald-50 dark:bg-emerald-950/40"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Middle Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workforce Pulse */}
          <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[440px] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wide mb-2 flex items-center gap-2">
                <Activity size={18} className="text-[#0c6396] dark:text-[#38bdf8]" /> Workforce Pulse
              </h2>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pulseChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0c6396" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0c6396" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="pulse" stroke="#0c6396" strokeWidth={3} fillOpacity={1} fill="url(#colorPulse)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pulse Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#004b6e]"></span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">PRESENT</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{displayPresent}</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">LEAVE</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{displayLeave}</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a] dark:bg-slate-400"></span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">OVER-TIME</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{displayOvertime}</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">ABSENT</span>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{displayAbsent}</span>
              </div>
            </div>
          </div>

          {/* Execution Velocity */}
          <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[440px] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#0c6396] dark:text-[#38bdf8]" /> Execution Velocity
              </h2>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData} margin={{ top: 20, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={45}>
                      {velocityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-around text-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              {velocityData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">
                    {item.count}
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* Team Presence Status */}
          <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[280px]">
            <h2 className="text-lg font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wide mb-6">
              Team Presence Status
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">NAME</th>
                    <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {teamMembers.map((member) => {
                    const attRecord = attendance.find(a => a.employeeId === member.id)
                    const status = attRecord ? attRecord.status : 'present' // default simulation status
                    
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{member.name}</td>
                        <td className="py-4 text-sm text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                            status === 'present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            status === 'late' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            status === 'leave' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[280px]">
            <h2 className="text-lg font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wide mb-6">
              Recent Tasks
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">TASK</th>
                    <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider text-right">ASSIGNED DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {mockTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{task.title}</td>
                      <td className="py-4 text-xs font-bold text-slate-400 dark:text-slate-500 text-right">{task.assignedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }


  // Render Admin/HR Dashboard
  return (
    <div className="space-y-6">
      {/* KPI Cards: Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminKPICard
          value={totalEmployees}
          label="Total Employees"
          icon={<Users size={20} />}
          watermarkIcon={<Users />}
          color="blue"
        />
        <AdminKPICard
          value={employees.filter(e => e.position?.toLowerCase().includes('lead') || e.position?.toLowerCase().includes('manager')).length || 1}
          label="Total Leaders"
          icon={<UserCheck size={20} />}
          watermarkIcon={<UserCheck />}
          color="blue"
        />
        <AdminKPICard
          value={attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present').length}
          label="Today's Attendance"
          icon={<Calendar size={20} />}
          watermarkIcon={<Calendar />}
          color="green"
        />
      </div>

      {/* KPI Cards: Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminKPICard
          value={leaves.filter(l => l.status === 'pending').length}
          label="Pending Leaves"
          icon={<FileText size={20} />}
          watermarkIcon={<FileText />}
          color="orange"
        />
        <AdminKPICard
          value={0}
          label="Pending Profiles"
          icon={<Shield size={20} />}
          watermarkIcon={<Shield />}
          color="purple"
        />
        <AdminKPICard
          value={0}
          label="Delayed Tasks"
          icon={<AlertTriangle size={20} />}
          watermarkIcon={<AlertTriangle />}
          color="red"
        />
      </div>

      {/* Two Sections Below KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Project Summary */}
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Project Summary</h2>
            <div className="p-2 bg-cyan-500/10 text-[#0c6396] rounded-xl">
              <Briefcase size={20} />
            </div>
          </div>

          <div className="space-y-5">
            {(projects.length > 0 ? projects.slice(0, 3).map(p => ({
              name: p.name,
              manager: p.manager?.name || 'Unassigned',
              progress: p.progress || 0,
              status: p.status || 'In Progress',
              color: p.status === 'Completed' ? 'bg-emerald-500' : p.status === 'In Progress' ? 'bg-cyan-500' : 'bg-amber-500'
            })) : [
              { name: 'Nexus HR Portal - Admin Dashboard', manager: 'John Doe', progress: 65, status: 'In Progress', color: 'bg-cyan-500' },
              { name: 'Cloud Migration & Infrastructure', manager: 'Jane Smith', progress: 100, status: 'Completed', color: 'bg-emerald-500' },
              { name: 'Security Audit & Compliance', manager: 'Alice Williams', progress: 15, status: 'On Hold', color: 'bg-amber-500' }
            ]).map((proj, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">{proj.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                      proj.status === 'In Progress' ? 'bg-cyan-500/10 text-cyan-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>{proj.status}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Manager: {proj.manager}</span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${proj.color} transition-all duration-500`} style={{ width: `${proj.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Leave Requests</h2>
            <div className="flex items-center gap-2">
              <select className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border-none focus:outline-none cursor-pointer">
                <option>ALL REQUESTS</option>
                <option>PENDING</option>
                <option>APPROVED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Days</th>
                  <th className="pb-3 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {(leaves.length > 0 ? leaves.slice(0, 3).map(l => ({
                  name: l.employeeName || l.user?.name || 'Employee',
                  days: l.days || `${l.totalDays} Days`,
                  status: (l.status || 'pending').toUpperCase(),
                  statusColor: l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : l.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                })) : [
                  { name: 'Jane Smith', days: '1 Day', status: 'PENDING', statusColor: 'bg-amber-500/10 text-amber-600' },
                  { name: 'John Doe', days: '5 Days', status: 'APPROVED', statusColor: 'bg-emerald-500/10 text-emerald-600' },
                  { name: 'Bob Johnson', days: '1 Day', status: 'APPROVED', statusColor: 'bg-emerald-500/10 text-emerald-600' }
                ]).map((req, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{req.name}</td>
                    <td className="py-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400">{req.days}</td>
                    <td className="py-3.5 text-sm text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${req.statusColor}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
