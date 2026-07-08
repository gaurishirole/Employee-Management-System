import { useState, useEffect } from 'react'
import { apiFetch, getRolePrefix } from '../utils/api'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Trash2, Edit2, X, CheckCircle, XCircle, Clock, FileText, Calendar, AlertTriangle, Info, ClipboardList, Search, ChevronDown, Upload, ArrowRight } from 'lucide-react'

const initialLeavesData = [
  {
    id: '1',
    employeeId: '1422',
    employeeName: 'Gauri Shirole',
    employeeEmail: 'gauri.shirole@tdtl.world',
    type: 'Leave without pay (LWP)',
    startDate: '2026-01-13',
    endDate: '2026-01-13',
    days: '1 Days',
    appliedOn: '13/01/2026',
    status: 'pending',
    reason: 'Urgent personal work'
  },
  {
    id: '2',
    employeeId: '1422',
    employeeName: 'Gauri Shirole',
    employeeEmail: 'gauri.shirole@tdtl.world',
    type: 'Casual Leave (CL)',
    startDate: '2026-01-31',
    endDate: '2026-01-31',
    days: '1 Days',
    appliedOn: '31/01/2026',
    status: 'pending',
    reason: 'Family event'
  },
  {
    id: '3',
    employeeId: '1422',
    employeeName: 'Gauri Shirole',
    employeeEmail: 'gauri.shirole@tdtl.world',
    type: 'Casual Leave (CL)',
    startDate: '2026-02-10',
    endDate: '2026-02-10',
    days: '1 Days',
    appliedOn: '10/02/2026',
    status: 'pending',
    reason: 'Medical checkup'
  },
  {
    id: '4',
    employeeId: '1422',
    employeeName: 'Gauri Shirole',
    employeeEmail: 'gauri.shirole@tdtl.world',
    type: 'Leave without pay (LWP)',
    startDate: '2026-02-16',
    endDate: '2026-02-16',
    days: 'Half Day',
    appliedOn: '16/02/2026',
    status: 'pending',
    reason: 'Dentist appointment'
  },
  {
    id: '5',
    employeeId: '1422',
    employeeName: 'Gauri Shirole',
    employeeEmail: 'gauri.shirole@tdtl.world',
    type: 'Leave without pay (LWP)',
    startDate: '2026-02-02',
    endDate: '2026-03-03',
    days: '2 Days',
    appliedOn: '28/02/2026',
    status: 'approved',
    reason: 'Out of station'
  }
]

const LeaveModule = ({ forceEmployeeMode = false, forceLeaveTypeTab = false }) => {
  const { user } = useAuth()
  const isEmployee = user?.role === 'employee' || forceEmployeeMode
  const { toast } = useNotification()

  // State Management
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaveAllowance, setLeaveAllowance] = useState(12)
  const [approvedUsedDays, setApprovedUsedDays] = useState(0)
  const [paidUsedDays, setPaidUsedDays] = useState(0)
  const [unpaidUsedDays, setUnpaidUsedDays] = useState(0)

  const [formType, setFormType] = useState(null) // 'leave', 'compoff', null
  const [editingId, setEditingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState('approval')
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesCount, setEntriesCount] = useState(10)
  const [yearFilter, setYearFilter] = useState('2026')
  const [activeLogTab, setActiveLogTab] = useState(forceLeaveTypeTab ? 'leavetype' : 'all') // 'all', 'compoff', 'leavetype'

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownSearch, setDropdownSearch] = useState('')

  // Attachment State
  const [attachment, setAttachment] = useState(null)
  const [attachmentName, setAttachmentName] = useState('')

  const leaveTypes = [
    'Casual Leave (CL)',
    'Earned leave (EL)',
    'Maternity Leave (ML)',
    'Paternity Leave (PL)',
    'Leave without pay (LWP)',
    'Compensatory off (Comp Off)'
  ]

  const [formData, setFormData] = useState({
    employeeId: '1422',
    type: 'Casual Leave (CL)',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'pending',
  })

  // Comp Off Form State
  const [compOffData, setCompOffData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true)
        const prefix = getRolePrefix(user?.role)
        let endpoint = ''
        if (isEmployee) {
          endpoint = '/employee/leave/my'
        } else if (user?.role === 'hr') {
          endpoint = '/hr/manage/leaves'
        } else if (user?.role === 'admin') {
          endpoint = '/admin/leave/all'
        } else {
          endpoint = '/leader/leave/my'
        }
        
        const data = await apiFetch(endpoint)
        // If data is employee leave object, it might be { leaves, leaveAllowance... }
        if (data && data.leaves) {
          setLeaves(data.leaves)
          setLeaveAllowance(data.leaveAllowance ?? 12)
          setApprovedUsedDays(data.approvedUsedDays ?? 0)
          setPaidUsedDays(data.paidUsedDays ?? 0)
          setUnpaidUsedDays(data.unpaidUsedDays ?? 0)
        } else {
          setLeaves(data || [])
          setLeaveAllowance(12)
          setApprovedUsedDays(0)
          setPaidUsedDays(0)
          setUnpaidUsedDays(0)
        }

        if (user?.role === 'admin' || user?.role === 'hr') {
          const empData = await apiFetch(`${prefix}/employees`).catch(() => [])
          setEmployees(empData)
        }
      } catch (err) {
        console.error('Error fetching leaves:', err)
        setLeaves(initialLeavesData)
      } finally {
        setLoading(false)
      }
    }
    if (user?.role) {
      fetchLeaveData()
    }
  }, [user?.role, isEmployee])

  const calculateDaysStr = (start, end) => {
    if (start && end) {
      const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1
      return days === 1 ? '1 Days' : `${days} Days`
    }
    return '0 Days'
  }

  const handleAddLeave = async (e) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const endpoint = isEmployee ? '/employee/leave/apply' : '/leader/leave/apply'
      const payload = {
        reason: formData.reason,
        fromDate: formData.startDate,
        toDate: formData.endDate,
        type: formData.type
      }
      
      if (editingId) {
        const updateEndpoint = isEmployee ? `/employee/leave/${editingId}` : `/leader/leave/${editingId}`
        await apiFetch(updateEndpoint, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
        toast.success('Leave updated successfully!')
        setEditingId(null)
      } else {
        await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        toast.success('Leave request created successfully!')
      }

      setFormData({
        employeeId: '1422',
        type: 'Casual Leave (CL)',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'pending',
      })
      setFormType(null)
      
      // Refresh
      const fetchEndpoint = isEmployee ? '/employee/leave/my' : '/leader/leave/my'
      const updatedData = await apiFetch(fetchEndpoint)
      if (updatedData && updatedData.leaves) {
        setLeaves(updatedData.leaves)
        setLeaveAllowance(updatedData.leaveAllowance ?? 12)
        setApprovedUsedDays(updatedData.approvedUsedDays ?? 0)
        setPaidUsedDays(updatedData.paidUsedDays ?? 0)
        setUnpaidUsedDays(updatedData.unpaidUsedDays ?? 0)
      } else {
        setLeaves(updatedData || [])
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to submit leave request')
    }
  }

  const handleAddCompOff = async (e) => {
    e.preventDefault()
    if (!compOffData.startDate || !compOffData.endDate || !compOffData.reason) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const endpoint = isEmployee ? '/employee/leave/apply' : '/leader/leave/apply'
      const payload = {
        reason: compOffData.reason,
        fromDate: compOffData.startDate,
        toDate: compOffData.endDate,
        type: 'Compensatory off (Comp Off)'
      }

      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      toast.success('Comp off request created successfully!')

      setCompOffData({
        startDate: '',
        endDate: '',
        reason: '',
      })
      setFormType(null)

      // Refresh
      const fetchEndpoint = isEmployee ? '/employee/leave/my' : '/leader/leave/my'
      const updatedData = await apiFetch(fetchEndpoint)
      if (updatedData && updatedData.leaves) {
        setLeaves(updatedData.leaves)
        setLeaveAllowance(updatedData.leaveAllowance ?? 12)
        setApprovedUsedDays(updatedData.approvedUsedDays ?? 0)
        setPaidUsedDays(updatedData.paidUsedDays ?? 0)
        setUnpaidUsedDays(updatedData.unpaidUsedDays ?? 0)
      } else {
        setLeaves(updatedData || [])
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to submit comp off request')
    }
  }

  const handleEditLeave = (leave) => {
    const sDate = leave.startDate || leave.fromDate || ''
    const eDate = leave.endDate || leave.toDate || ''
    if ((leave.type || 'Annual Leave') === 'Compensatory off (Comp Off)') {
      setCompOffData({
        startDate: sDate ? sDate.split('T')[0] : '',
        endDate: eDate ? eDate.split('T')[0] : '',
        reason: leave.reason
      })
      setEditingId(leave.id)
      setFormType('compoff')
    } else {
      setFormData({
        employeeId: leave.employeeId,
        type: leave.type || 'Annual Leave',
        startDate: sDate ? sDate.split('T')[0] : '',
        endDate: eDate ? eDate.split('T')[0] : '',
        reason: leave.reason,
        status: leave.status,
      })
      setAttachmentName(leave.attachmentName || '')
      setEditingId(leave.id)
      setFormType('leave')
    }
  }

  const handleDeleteLeave = async (id) => {
    try {
      const endpoint = isEmployee ? `/employee/leave/${id}` : `/leader/leave/${id}`
      await apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Cancelled' })
      }).catch(() => {})
      setLeaves(leaves.filter(leave => leave.id !== id))
      toast.success('Leave request cancelled!')
    } catch (err) {
      setLeaves(leaves.filter(leave => leave.id !== id))
      toast.success('Leave request removed!')
    }
  }

  const handleApprove = async (id) => {
    try {
      if (user?.role === 'hr') {
        await apiFetch(`/hr/manage/leave/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Approved' })
        })
      } else {
        await apiFetch(`/admin/leave/${id}/approve`, { method: 'PATCH' })
      }
      toast.success('Leave approved!')
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'approved' } : l))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Approval failed')
    }
  }

  const handleReject = async (id) => {
    try {
      if (user?.role === 'hr') {
        await apiFetch(`/hr/manage/leave/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'Rejected' })
        })
      } else {
        await apiFetch(`/admin/leave/${id}/reject`, { method: 'PATCH' })
      }
      toast.success('Leave rejected!')
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'rejected' } : l))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Rejection failed')
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAttachment(file)
      setAttachmentName(file.name)
      toast.success(`Attached file: ${file.name}`)
    }
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    if (dateStr.includes('/')) return dateStr
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  // Dynamic KPI Card Calculations
  const approvedCount = leaves.filter(l => l.status?.toLowerCase() === 'approved').length
  const pendingCount = leaves.filter(l => l.status?.toLowerCase() === 'pending').length
  const rejectedCount = leaves.filter(l => l.status?.toLowerCase() === 'rejected').length

  const leaveTakenVal = approvedUsedDays
  const pendingVal = leaves.filter(l => l.status?.toLowerCase() === 'pending').reduce((sum, l) => sum + (l.totalDays || 0), 0)
  const approvedVal = approvedUsedDays
  const rejectedVal = leaves.filter(l => l.status?.toLowerCase() === 'rejected').reduce((sum, l) => sum + (l.totalDays || 0), 0)

  const getFilteredLeaves = () => {
    let list = leaves

    // Filter by Tab (all leaves or compoff leaves)
    if (activeLogTab === 'compoff') {
      list = list.filter(l => (l.type || 'Annual Leave') === 'Compensatory off (Comp Off)')
    } else {
      list = list.filter(l => (l.type || 'Annual Leave') !== 'Compensatory off (Comp Off)')
    }

    // Filter by Year
    if (yearFilter) {
      list = list.filter(l => {
        const date = l.startDate || l.fromDate || ''
        return date.includes(yearFilter)
      })
    }

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(l => {
        const typeStr = (l.type || 'Annual Leave').toLowerCase()
        const reasonStr = (l.reason || '').toLowerCase()
        const empName = (l.employeeName || l.user?.name || user?.name || '').toLowerCase()
        const empEmail = (l.employeeEmail || l.user?.email || user?.email || '').toLowerCase()
        return typeStr.includes(q) || reasonStr.includes(q) || empName.includes(q) || empEmail.includes(q)
      })
    }

    return list
  }

  const filteredLogs = getFilteredLeaves()

  const leaveTypeData = [
    { type: 'Casual Leave (CL)', days: 12, added: 6, balanced: 4, approval: 'Yes' },
    { type: 'Compensatory off (Comp Off)', days: 3, added: 0, balanced: 0, approval: 'Yes' },
    { type: 'Earned leave (EL)', days: 12, added: 6, balanced: 6, approval: 'Yes' },
    { type: 'Leave without pay (LWP)', days: 30, added: 30, balanced: 26.5, approval: 'Yes' },
    { type: 'Maternity Leave (ML)', days: 182, added: 182, balanced: 182, approval: 'Yes' },
    { type: 'Paternity Leave (PL)', days: 5, added: 5, balanced: 5, approval: 'Yes' },
    { type: 'Restricted Holiday', days: 2, added: 2, balanced: 2, approval: 'Yes' },
  ]

  if (forceLeaveTypeTab) {
    return (
        <div className="-m-6 p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen bg-white text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">Leave Management</h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">Leave Type</p>
            </div>
          </div>

          {/* Entries select & search row */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <span>Show</span>
                <select 
                  value={entriesCount}
                  onChange={(e) => setEntriesCount(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-md focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50">
                    <th className="py-4 px-4">::: LEAVE TYPE <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">DAYS PER YEAR <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">LEAVE ADDED TILL <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">BALANCED LEAVE <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">REQUIRES APPROVAL <span className="text-slate-400 select-none">↑↓</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {leaveTypeData
                    .filter(item => item.type.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, entriesCount)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-800">{item.type}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.days}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.added}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.balanced}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.approval}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <span>Showing 1 to {Math.min(leaveTypeData.length, entriesCount)} of {leaveTypeData.length} records</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
              </div>
            </div>
          </div>
        </div>
      )
    }

  if (isEmployee) {
    return (
      <div className="-m-6 p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen bg-white text-slate-800">
        <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">Leave Management</h1>

        {/* Conditional Form Cards Grid */}
        {formType === 'leave' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Add Leave Form */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-bold text-lg text-slate-800">Add Leave</span>
                <button 
                  onClick={() => setFormType(null)}
                  className="flex items-center gap-1 text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={14} /> Hide
                </button>
              </div>

              <form onSubmit={handleAddLeave} className="space-y-6">
                {/* Leave Type Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  >
                    <span>{formData.type || "Select Leave Type"}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <input 
                          type="text" 
                          placeholder="Search Leave Type..." 
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-xs focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {leaveTypes
                          .filter(type => type.toLowerCase().includes(dropdownSearch.toLowerCase()))
                          .map((type, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setFormData({ ...formData, type })
                                setIsDropdownOpen(false)
                                setDropdownSearch('')
                              }}
                              className="px-4 py-2.5 hover:bg-blue-50 text-slate-700 hover:text-slate-800 text-xs cursor-pointer transition-colors"
                            >
                              {type}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      onKeyDown={(e) => e.preventDefault()}
                      onClick={(e) => e.currentTarget.showPicker()}
                      onFocus={(e) => e.currentTarget.showPicker()}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      onKeyDown={(e) => e.preventDefault()}
                      onClick={(e) => e.currentTarget.showPicker()}
                      onFocus={(e) => e.currentTarget.showPicker()}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Leave Reason */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Leave Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Leave Reason"
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ employeeId: '1422', type: 'Casual Leave (CL)', startDate: '', endDate: '', reason: '', status: 'pending' })
                      setAttachment(null)
                      setAttachmentName('')
                    }}
                    className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all cursor-pointer bg-white"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>

            {/* Leave Attachment Card */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <span className="font-bold text-base text-slate-800 block border-b border-slate-100 pb-4">Leave Attachment</span>
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Attachment</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 transition-all cursor-pointer relative bg-white">
                  <input
                    type="file"
                    accept=".pdf,.gif,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-blue-600">Choose File</span>
                  <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
                    {attachmentName || "No file chosen"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 text-center font-medium">
                  Upload files only: pdf,gif,png,jpg,jpeg
                </p>
              </div>
            </div>
          </div>
        )}

        {formType === 'compoff' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 max-w-4xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="font-bold text-lg text-slate-800">Add Comp off</span>
              <button 
                onClick={() => setFormType(null)}
                className="flex items-center gap-1 text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} /> Hide
              </button>
            </div>

            <form onSubmit={handleAddCompOff} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={compOffData.startDate}
                    onChange={(e) => setCompOffData({ ...compOffData, startDate: e.target.value })}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onFocus={(e) => e.currentTarget.showPicker()}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={compOffData.endDate}
                    onChange={(e) => setCompOffData({ ...compOffData, endDate: e.target.value })}
                    onKeyDown={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onFocus={(e) => e.currentTarget.showPicker()}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Comp off Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={compOffData.reason}
                  onChange={(e) => setCompOffData({ ...compOffData, reason: e.target.value })}
                  placeholder="Comp off Reason"
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCompOffData({ startDate: '', endDate: '', reason: '' })}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lower Section: KPI Row + Toggle Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* KPI Cards (Cols 9) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leave Taken / Pending */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">LEAVE TAKEN | PENDING</p>
                <p className="text-3xl font-black mt-2">
                  <span className="text-[#28c76f]">{leaveTakenVal}</span>
                  <span className="text-slate-300 mx-1">|</span>
                  <span className="text-slate-800">{pendingVal}</span>
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-500">
                <Calendar size={20} />
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">APPROVED</p>
                <p className="text-3xl font-black text-slate-800 mt-2">{approvedVal}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#28c76f]">
                <CheckCircle size={20} />
              </div>
            </div>

            {/* Rejected */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">REJECTED</p>
                <p className="text-3xl font-black text-slate-800 mt-2">{rejectedVal}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#ea5455]">
                <XCircle size={20} />
              </div>
            </div>
          </div>

          {/* Toggle Buttons (Cols 3) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <button
              onClick={() => {
                setFormType('leave')
                setEditingId(null)
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm text-xs tracking-wider"
            >
              Add New Leave
            </button>
            <button
              onClick={() => {
                setFormType('compoff')
                setEditingId(null)
              }}
              className="w-full py-3 bg-white border border-blue-600 hover:bg-blue-50 text-blue-600 font-bold rounded-xl transition-all cursor-pointer shadow-sm text-xs tracking-wider"
            >
              Add Comp off
            </button>
          </div>
        </div>

        {/* Recent Logs Table / List of All Leaves */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-800">List of All Leaves</span>
              {activeLogTab !== 'leavetype' && (
                <select 
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md focus:outline-none"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <button 
                onClick={() => setActiveLogTab('all')}
                className={`transition-colors cursor-pointer ${activeLogTab === 'all' ? 'text-[#28c76f] border-b-2 border-[#28c76f] pb-1' : 'text-slate-400 hover:text-slate-600'}`}
              >
                List of all Leave
              </button>
              <span className="text-slate-300">|</span>
              <button 
                onClick={() => setActiveLogTab('compoff')}
                className={`transition-colors cursor-pointer ${activeLogTab === 'compoff' ? 'text-[#28c76f] border-b-2 border-[#28c76f] pb-1' : 'text-slate-400 hover:text-slate-600'}`}
              >
                List of Comp off Leave
              </button>
            </div>
          </div>

          {/* Show entry count & search row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <span>Show</span>
              <select 
                value={entriesCount}
                onChange={(e) => setEntriesCount(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-md focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {activeLogTab === 'leavetype' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50">
                    <th className="py-4 px-4">::: LEAVE TYPE <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">DAYS PER YEAR <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">LEAVE ADDED TILL <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">BALANCED LEAVE <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4 text-center">REQUIRES APPROVAL <span className="text-slate-400 select-none">↑↓</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {leaveTypeData
                    .filter(item => item.type.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, entriesCount)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-800">{item.type}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.days}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.added}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.balanced}</td>
                        <td className="py-4 px-4 text-center font-semibold">{item.approval}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                    <th className="py-4 px-4">EMPLOYEE <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4">LEAVE TYPE <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4">LEAVE DURATION <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4">DAYS <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4">APPLIED ON <span className="text-slate-400 select-none">↑↓</span></th>
                    <th className="py-4 px-4">STATUS <span className="text-slate-400 select-none">↑↓</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.slice(0, entriesCount).map((leave, index) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Employee Profile, Details, Actions */}
                      <td className="py-4 px-4">
                        {/* Action buttons on first row or hover */}
                        {index === 0 && (
                          <div className="flex gap-2 mb-2">
                            <button 
                              onClick={() => handleEditLeave(leave)}
                              className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              className="p-1 bg-[#23c4f8] hover:bg-cyan-500 text-white rounded cursor-pointer transition-colors"
                              title="Details"
                              onClick={() => toast.info(`Leave details: ${leave.reason}`)}
                            >
                              <ArrowRight size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteLeave(leave.id)}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            {(leave.employeeName || leave.user?.name || user?.name || 'E').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{leave.employeeName || leave.user?.name || user?.name || 'Employee'}</p>
                            <p className="text-[10px] text-slate-400">{leave.employeeEmail || leave.user?.email || user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">{leave.type || 'Annual Leave'}</td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">
                        {formatDateDisplay(leave.startDate || leave.fromDate)} To {formatDateDisplay(leave.endDate || leave.toDate)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">{leave.days || `${leave.totalDays} Days`}</td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">{leave.appliedOn || (leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString('en-GB') : '')}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase text-white shadow-sm inline-block ${
                          leave.status?.toLowerCase() === 'approved'
                            ? 'bg-[#28c76f]'
                            : leave.status?.toLowerCase() === 'pending'
                            ? 'bg-[#ff9f43]'
                            : 'bg-[#ea5455]'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Showing pagination details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            <span>Showing 1 to {activeLogTab === 'leavetype' ? Math.min(leaveTypeData.length, entriesCount) : Math.min(filteredLogs.length, entriesCount)} of {activeLogTab === 'leavetype' ? leaveTypeData.length : filteredLogs.length} records</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin / HR Management view (preserved and styled harmoniously)
  const getEmployeeObj = (employeeId) => {
    return employees.find(emp => emp.id === employeeId)
  }

  const getRoleBadge = (emp) => {
    if (!emp) return null
    const isLeader = emp.position?.toLowerCase().includes('manager') || 
                     emp.position?.toLowerCase().includes('lead') || 
                     emp.role === 'leaders' || 
                     emp.role === 'leader'
    if (isLeader) {
      return (
        <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider bg-cyan-50 text-[#0c6396] border border-cyan-100 uppercase">
          LEADER
        </span>
      )
    }
    return (
      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider bg-slate-50 text-slate-500 border border-slate-100 uppercase">
        EMPLOYEE
      </span>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Leave Applications
            </h1>
            <p className="text-xs text-[#0c6396]/80 font-semibold mt-1">
              Review and manage employee leave requests.
            </p>
          </div>
        </div>
      </div>



      {/* Leave Applications Table Card */}
      <div className="bg-card border border-border/85 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 gap-4 px-8 py-5 border-b border-border/40 bg-slate-50/20 dark:bg-slate-800/5 text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wider uppercase">
          <div>APPLICANT</div>
          <div>ROLE</div>
          <div>DURATION</div>
          <div>DAYS</div>
          <div>REASON</div>
          <div>STATUS</div>
          <div className="text-right">DECISION</div>
        </div>

        {leaves.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm font-semibold text-[#0c6396] dark:text-slate-400 italic">
              No leave applications pending review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {leaves.map(leave => {
              const emp = getEmployeeObj(leave.employeeId || leave.userId) || leave.user || { name: leave.employeeName, position: 'Developer' }
              const empName = leave.employeeName || leave.user?.name || emp?.name || 'Employee'

              return (
                <div key={leave.id} className="grid grid-cols-7 gap-4 px-8 py-4.5 items-center text-xs hover:bg-slate-50/30 dark:hover:bg-slate-800/5 transition-colors">
                  {/* Applicant */}
                  <div>
                    <p className="font-extrabold text-[#0c6396] text-sm">{empName}</p>
                    <p className="text-[10px] text-sky-500/70 font-semibold">{emp?.position || 'Employee'}</p>
                  </div>

                  {/* Role */}
                  <div>{getRoleBadge(emp)}</div>

                  {/* Duration */}
                  <div className="text-slate-500 dark:text-slate-400 font-semibold">
                    {formatDateDisplay(leave.startDate)} to {formatDateDisplay(leave.endDate)}
                  </div>

                  {/* Days */}
                  <div className="text-slate-500 dark:text-slate-400 font-semibold">
                    {leave.days || `${leave.totalDays} Days`}
                  </div>

                  {/* Reason */}
                  <div className="text-slate-500 dark:text-slate-400 font-medium truncate pr-4" title={leave.reason}>
                    {leave.reason || '-'}
                  </div>

                  {/* Status */}
                  <div>
                    {leave.status === 'approved' ? (
                      <span className="inline-block text-[9px] font-black px-3 py-1 rounded-full tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100/50 uppercase">
                        APPROVED
                      </span>
                    ) : leave.status === 'rejected' ? (
                      <span className="inline-block text-[9px] font-black px-3 py-1 rounded-full tracking-wider border bg-rose-50 text-rose-500 border-rose-100/50 uppercase">
                        REJECTED
                      </span>
                    ) : (
                      <span className="inline-block text-[9px] font-black px-3 py-1 rounded-full tracking-wider border bg-amber-50 text-amber-500 border-amber-100/50 uppercase">
                        PENDING
                      </span>
                    )}
                  </div>

                  {/* Decision */}
                  <div className="flex gap-1.5 justify-end">
                    {leave.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-200/50 rounded-lg text-[9px] font-black uppercase transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-200/50 rounded-lg text-[9px] font-black uppercase transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase italic mr-2">
                        Processed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveModule
