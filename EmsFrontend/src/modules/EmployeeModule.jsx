import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { apiFetch, getRolePrefix } from '../utils/api'
import { Plus, Trash2, Edit2, Eye, X, Search, User, Mail, Phone, MapPin, Landmark, Network, FileText, Upload, ArrowRight, UserCheck, ArrowLeft } from 'lucide-react'

const EmployeeModule = () => {
  const { user } = useAuth()
  const isEmployee = user?.role === 'employee'
  const isLeadersPage = window.location.pathname.includes('/leaders')
  const isHRPage = window.location.pathname.includes('/hrs')
  const isAdminPage = window.location.pathname.includes('/admins')
  const isSpecialPage = isLeadersPage || isHRPage || isAdminPage
  
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { toast } = useNotification()

  const defaultForm = {
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    address: '',
    position: '',
    salary: '',
    dob: '',
    leaveAllowance: '12',
    reportingManager: '',
    technicalReporting: '',
    administrativeReporting: '',
    department: 'Engineering',
  }

  const [formData, setFormData] = useState(defaultForm)

  const fetchEmployeesData = async () => {
    try {
      setLoading(true)
      const prefix = getRolePrefix(user?.role)
      let endpoint = '/employees'
      if (isLeadersPage) {
        endpoint = '/leaders'
      } else if (isHRPage) {
        endpoint = '/hrs'
      } else if (isAdminPage) {
        endpoint = '/admins'
      }
      
      const data = await apiFetch(`${prefix}${endpoint}`).catch(() => [])
      setEmployees(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load personnel directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role && !isEmployee) {
      fetchEmployeesData()
    }
  }, [user?.role, isLeadersPage, isHRPage, isAdminPage])

  const formatDate = (dateStr) => {
    if (!dateStr) return '01/01/2026'
    if (dateStr.includes('/')) return dateStr
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
    return dateStr
  }

  const filteredEmployees = employees.filter(emp => {
    const name = emp.name || ''
    const email = emp.email || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const prefix = getRolePrefix(user?.role)
      let endpoint = '/employees'
      if (isLeadersPage) {
        endpoint = '/leaders'
      } else if (isHRPage) {
        endpoint = '/hrs'
      } else if (isAdminPage) {
        endpoint = '/admins'
      }

      if (editingId) {
        await apiFetch(`${prefix}${endpoint}/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        toast.success('Personnel updated successfully!')
        setEditingId(null)
      } else {
        await apiFetch(`${prefix}${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        toast.success('Personnel created successfully!')
      }

      setFormData(defaultForm)
      setShowForm(false)
      fetchEmployeesData()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Action failed')
    }
  }

  const handleEditEmployee = (employee) => {
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '',
      phone: employee.phone || '',
      address: employee.address || '',
      position: employee.position || '',
      salary: employee.salary || '',
      dob: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
      leaveAllowance: employee.leaveAllowance || '12',
      reportingManager: employee.reportingManagerId || '',
      technicalReporting: employee.technicalReportingId || '',
      administrativeReporting: employee.administrativeReportingId || '',
      department: employee.department || 'Engineering'
    })
    setEditingId(employee.id)
    setShowForm(true)
  }

  const handleDeleteEmployee = async (id) => {
    try {
      const prefix = getRolePrefix(user?.role)
      let endpoint = '/employees'
      if (isLeadersPage) {
        endpoint = '/leaders'
      } else if (isHRPage) {
        endpoint = '/hrs'
      } else if (isAdminPage) {
        endpoint = '/admins'
      }

      await apiFetch(`${prefix}${endpoint}/${id}`, {
        method: 'DELETE'
      })
      toast.success('Personnel deleted successfully!')
      fetchEmployeesData()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Delete failed')
    }
  }

  const [showDetails, setShowDetails] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee)
    setShowDetails(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(defaultForm)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isEmployee ? (
            <SingleEmployeeView user={user} employees={employees} />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  {isSpecialPage ? (
                    <div>
                      <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                        {isAdminPage ? 'Administrative Council' : (isLeadersPage ? 'Leadership Registry' : 'HR Registry')}
                      </h1>
                      <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
                        {isAdminPage ? 'Manage system administrators and high-level permissions.' : (isLeadersPage ? 'Oversee team leaders, reporting structures, and organizational hierarchy.' : 'Oversee Human Resource professionals and administrators.')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                        Employees
                      </h1>
                      <p className="text-[#38bdf8] dark:text-cyan-400 text-xs font-semibold mt-1">
                        Manage your organization's workforce.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-6 py-3 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-black shadow-md shadow-[#0c6396]/10 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  {isSpecialPage ? (isAdminPage ? 'Add Administrator' : (isLeadersPage ? 'Appoint Team Leader' : 'Appoint HR Executive')) : 'Add Employee'}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>

              {/* Employee Details Modal */}
              {showDetails && selectedEmployee && (
                <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border/40 rounded-3xl p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                          Personnel Profile Details
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1">
                          Detailed professional profile and primary credentials.
                        </p>
                      </div>
                      <button onClick={() => { setShowDetails(false); setSelectedEmployee(null); }} className="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                        <X size={22} />
                      </button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">FULL LEGAL NAME</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.name || 'N/A'}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">EMAIL ADDRESS</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.email || 'N/A'}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">CONTACT TERMINAL</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.phone || 'N/A'}
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">ADDRESS</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.address || 'N/A'}
                        </div>
                      </div>

                      {/* Position */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">POSITION AUTHORITY</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.position || 'N/A'}
                        </div>
                      </div>

                      {/* Salary */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">RENUMERATION SCALE (₹)</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          ₹{selectedEmployee.salary ? Number(selectedEmployee.salary).toLocaleString('en-IN') : '0'}
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">DATE OF BIRTH</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.dateOfBirth ? formatDate(selectedEmployee.dateOfBirth.split('T')[0]) : 'N/A'}
                        </div>
                      </div>

                      {/* Leave Allowance */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">LEAVE ALLOWANCE (DAYS)</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.leaveAllowance || '12'}
                        </div>
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">DEPARTMENT</label>
                        <div className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold">
                          {selectedEmployee.department || 'Engineering'}
                        </div>
                      </div>
                    </div>

                    {/* Form Controls */}
                    <div className="flex justify-end items-center gap-6 pt-6 border-t border-border/40 mt-6">
                      <button
                        type="button"
                        onClick={() => { setShowDetails(false); setSelectedEmployee(null); }}
                        className="px-6 py-2.5 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee Form Modal */}
              {showForm && (
                <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                  <div className={`bg-card border border-border/40 rounded-3xl p-8 w-full ${isSpecialPage ? 'max-w-3xl' : 'max-w-2xl'} shadow-2xl overflow-y-auto max-h-[90vh]`}>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                          {isSpecialPage
                            ? (editingId ? (isAdminPage ? 'Edit Admin Profile' : (isLeadersPage ? 'Refine Leadership Appointment' : 'Refine HR Appointment')) : (isAdminPage ? 'New Admin Profile' : (isLeadersPage ? 'New Leadership Appointment' : 'New HR Appointment')))
                            : (editingId ? 'Refine Professional Profile' : 'New Professional Profile')
                          }
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1">
                          Configure personnel details and primary credentials.
                        </p>
                      </div>
                      <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                        <X size={22} />
                      </button>
                    </div>

                    {/* Form Fields Grid */}
                    <div className={isSpecialPage && !isAdminPage ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          FULL LEGAL NAME
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          placeholder="user@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-blue-50/50 dark:bg-[#0c6396]/10 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          SECURITY ACCESS KEY
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-blue-50/50 dark:bg-[#0c6396]/10 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          CONTACT TERMINAL
                        </label>
                        <input
                          type="text"
                          placeholder="+91 00000 00000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">ADDRESS</label>
                        <input
                          type="text"
                          placeholder="Primary address details"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Position */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          POSITION AUTHORITY
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Software Architect"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Salary / Compensation */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          RENUMERATION SCALE (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Monthly wage"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">
                          DATE OF BIRTH
                        </label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Leave Allowance */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">LEAVE ALLOWANCE (DAYS)</label>
                        <input
                          type="number"
                          placeholder="12"
                          value={formData.leaveAllowance}
                          onChange={(e) => setFormData({ ...formData, leaveAllowance: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-widest uppercase mb-1.5">DEPARTMENT</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                    </div>

                    {/* Form Controls */}
                    <div className="flex justify-end items-center gap-6 pt-6 border-t border-border/40 mt-6">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="text-sm font-bold text-[#0c6396] hover:underline cursor-pointer bg-transparent border-none"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={handleAddEmployee}
                        className="px-6 py-2.5 bg-[#0c6396] hover:bg-[#094f79] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                      >
                        Save Changes
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Employees Table */}
              {loading ? (
                <div className="p-8 text-center text-muted-foreground bg-card border border-border/40 rounded-3xl shadow-sm">
                  Loading registry database...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground bg-card border border-border/40 rounded-3xl shadow-sm">
                  No records found
                </div>
              ) : (
                <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] dark:bg-slate-900 text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wider uppercase border-b border-border/40">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Position</th>
                          <th className="px-6 py-4">Joining Date</th>
                          <th className="px-6 py-4">Leave</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => {
                          return (
                            <tr key={employee.id} className="border-b border-slate-50 dark:border-slate-800 text-xs hover:bg-[#f8fafc]/50 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-100">{employee.name}</td>
                              <td className="px-6 py-4 font-bold text-[#0c6396] dark:text-[#38bdf8]">{employee.email}</td>
                              <td className="px-6 py-4">
                                <span className="bg-slate-100/80 dark:bg-slate-800 text-[9px] font-black text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider block w-fit">
                                  {employee.position || 'DEVELOPER'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-[#0c6396] dark:text-[#38bdf8]">{formatDate(employee.joinDate)}</td>
                              <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-100">
                                {employee.leaveAllowance || '12'}d
                              </td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewDetails(employee)}
                                  className="p-1.5 text-[#0c6396] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="View details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditEmployee(employee)}
                                  className="p-1.5 text-[#0c6396] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        }
      />
      <Route path="/:employeeId" element={<EmployeeDetails employees={employees} />} />
    </Routes>
  )
}

const SingleEmployeeView = ({ user, employees, setEmployees }) => {
  const [activeTab, setActiveTab] = useState('Overview')
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    maritalStatus: 'Single',
    bankIfsc: '',
    bankAccount: '',
    position: '',
    department: ''
  })

  const [registryDocs, setRegistryDocs] = useState([
    { id: 'passportPhoto', name: 'PROFILE PHOTOGRAPH', file: null, status: 'Missing' },
    { id: 'tenthMarksheet', name: '10TH MARKSHEET', file: null, status: 'Missing' },
    { id: 'twelthDiplomaMarksheet', name: '12TH/DIPLOMA', file: null, status: 'Missing' },
    { id: 'graduationMarksheet', name: 'GRADUATION CERT', file: null, status: 'Missing' },
    { id: 'bankPassbookPhoto', name: 'BANK PASSBOOK', file: null, status: 'Missing' },
    { id: 'aadharFront', name: 'AADHAR FRONT', file: null, status: 'Missing' },
    { id: 'aadharBack', name: 'AADHAR BACK', file: null, status: 'Missing' },
    { id: 'panCard', name: 'PAN CARD', file: null, status: 'Missing' },
    { id: 'cv', name: 'PROFESSIONAL CV', file: null, status: 'Missing' }
  ])

  const { toast } = useNotification()
  const fileInputRef = useRef(null)
  const [selectedDocId, setSelectedDocId] = useState(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const prefix = getRolePrefix(user?.role)
      const data = await apiFetch(`${prefix}/profile`)
      setEmployee(data)
      setEditForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.address || '',
        maritalStatus: data.maritalStatus || 'Single',
        bankIfsc: data.bankIfsc || '',
        bankAccount: data.bankAccount || '',
        position: data.position || '',
        department: data.department || ''
      })
      
      // Map documents
      if (data.documents) {
        setRegistryDocs(prev => prev.map(doc => {
          const dbDoc = data.documents[doc.id]
          if (dbDoc && dbDoc.path) {
            return {
              ...doc,
              status: dbDoc.verified ? 'Verified' : 'Uploaded',
              file: dbDoc.path.split('/').pop(),
              previewUrl: dbDoc.path
            }
          }
          return doc
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role) {
      fetchProfile()
    }
  }, [user?.role])

  const handleUploadDoc = (id) => {
    setSelectedDocId(id)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedDocId) return

    try {
      const prefix = getRolePrefix(user?.role)
      const formData = new FormData()
      formData.append(selectedDocId, file)

      // PUT requests to /profile with multipart boundary
      const token = localStorage.getItem('TDTL-token')
      const response = await fetch(`http://localhost:5000/api${prefix}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      if (!response.ok) {
        throw new Error('Failed to upload document')
      }
      
      toast.success(`Successfully uploaded document: ${file.name}`)
      fetchProfile()
    } catch (err) {
      console.error(err)
      toast.error('Document upload failed')
    } finally {
      e.target.value = ''
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const prefix = getRolePrefix(user?.role)
      await apiFetch(`${prefix}/profile`, {
        method: 'POST',
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.location,
          maritalStatus: editForm.maritalStatus,
          bankIfsc: editForm.bankIfsc,
          bankAccount: editForm.bankAccount
        })
      })
      toast.success('Profile updated successfully!')
      setActiveTab('Overview')
      fetchProfile()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Update failed')
    }
  }

  if (loading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#0c6396] duration-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Profile Header Card */}
      <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner with Teal/Blue Grid Pattern */}
        <div className="h-44 bg-[#0f6880] relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:1.25rem_1.25rem]"></div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Profile Info Overlay Row */}
        <div className="px-8 pb-6 relative pt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Overlapping Avatar Container */}
          <div className="absolute -top-16 left-8 bg-card border-[3px] border-card shadow-lg w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/80 w-full h-full flex items-center justify-center">
              {registryDocs.find(d => d.id === 'passportPhoto')?.previewUrl ? (
                <img
                  src={registryDocs.find(d => d.id === 'passportPhoto').previewUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-slate-300 dark:text-slate-600" size={52} strokeWidth={1} />
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-3.5 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {employee.name}
              </h2>
              <span className={`border text-[11px] font-bold px-3 py-0.5 rounded-full tracking-wide shadow-sm flex items-center ${
                employee.profileVerified 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50' 
                  : 'bg-amber-50 text-amber-700 border-amber-200/50'
              }`}>
                {employee.profileVerified ? 'Verified' : 'Awaiting Audit'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60">
                {employee.position}
              </span>
              <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60">
                Department: {employee.department || 'General'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 dark:text-slate-400 text-sm font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-slate-400 dark:text-slate-500" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={16} className="text-slate-400 dark:text-slate-500" />
                <span>{employee.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-400 dark:text-slate-500" />
                <span>{employee.address || 'Pune'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border/80 flex items-center gap-8 px-4">
        {[
          { id: 'Overview', label: 'Overview', icon: <User size={16} /> },
          { id: 'Documents', label: 'Documents Repository', icon: <FileText size={16} /> },
          { id: 'Update', label: 'Update Profile', icon: <Edit2 size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3.5 pt-1 text-sm font-semibold tracking-wide border-b-2 transition-all relative cursor-pointer ${activeTab === tab.id
              ? 'border-[#0c6396] text-[#0c6396] font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Tab Panels */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12 bg-card border border-border/80 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profile Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Name</p>
                <p className="text-slate-800 dark:text-white font-extrabold">{employee.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Email</p>
                <p className="text-[#0c6396] dark:text-[#38bdf8] font-extrabold">{employee.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</p>
                <p className="text-slate-800 dark:text-white font-extrabold">{employee.phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Address</p>
                <p className="text-slate-800 dark:text-white font-extrabold">{employee.address || 'Pune'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marital Status</p>
                <p className="text-slate-800 dark:text-white font-extrabold">{employee.maritalStatus || 'Single'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Rate</p>
                <p className="text-slate-800 dark:text-white font-extrabold">₹{(employee.salary || 60000).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border/40">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Documents Repository</h3>
              <p className="text-xs text-slate-450 mt-1">Upload files only: pdf, gif, png, jpg, jpeg</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registryDocs.map((doc) => (
              <div key={doc.id} className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] shadow-sm">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">{doc.name}</span>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                      doc.status === 'Verified'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : doc.status === 'Uploaded'
                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-2.5 truncate max-w-full" title={doc.file}>{doc.file || 'Not Uploaded'}</p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4">
                  {doc.previewUrl && (
                    <button
                      onClick={() => window.open(doc.previewUrl, '_blank')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Inspect File
                    </button>
                  )}
                  {doc.status !== 'Verified' && (
                    <button
                      onClick={() => handleUploadDoc(doc.id)}
                      className="px-3 py-1.5 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Upload size={12} /> {doc.status === 'Uploaded' ? 'Re-upload' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Update' && (
        <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-sm space-y-6 max-w-4xl">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-border/40 pb-4">Update Profile Details</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Legal Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Office Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 text-xs font-semibold cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Residential coordinates</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Marital Status</label>
                <select
                  value={editForm.maritalStatus}
                  onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold cursor-pointer"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Bank Account Number</label>
                <input
                  type="text"
                  value={editForm.bankAccount}
                  onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">IFSC Code</label>
                <input
                  type="text"
                  value={editForm.bankIfsc}
                  onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground text-xs font-semibold"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-border/40">
              <button
                type="submit"
                className="px-8 py-3 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Submit Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const EmployeeDetails = ({ employees }) => {
  const navigate = useNavigate()
  const { employeeId } = useParams()
  const employee = employees.find(e => e.id === Number(employeeId)) || employees.find(e => e.id === employeeId) || employees[0]

  if (!employee) return <div>Employee not found</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-sm">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-bold text-[#0c6396] hover:underline mb-4 bg-transparent border-none cursor-pointer">
        <ArrowLeft size={14} /> Back to Registry
      </button>
      <div className="flex items-center gap-4 border-b border-border/40 pb-6">
        <div className="w-16 h-16 bg-sky-50 text-[#0c6396] rounded-2xl flex items-center justify-center font-black text-2xl border border-sky-100">
          {employee.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{employee.name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">{employee.position} &bull; {employee.department}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <div>
          <p className="text-[10px] text-slate-450 uppercase font-black">Email</p>
          <p className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">{employee.email}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-450 uppercase font-black">Phone</p>
          <p className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">{employee.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-450 uppercase font-black">Location</p>
          <p className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">{employee.address || 'Pune'}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-450 uppercase font-black">Salary Rate</p>
          <p className="text-slate-800 dark:text-slate-200 font-extrabold mt-0.5">₹{(employee.salary || 60000).toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

export { SingleEmployeeView }
export default EmployeeModule
