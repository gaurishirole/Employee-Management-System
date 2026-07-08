import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Users, UserPlus, Briefcase, Mail, CheckCircle, Clock, XCircle, Search, Filter, AlertCircle, FileText, Plus, X } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const HiringModule = () => {
  const { user } = useAuth()
  const isManager = user?.role === 'manager' || user?.role === 'leaders'
  const { toast } = useNotification()
  const location = useLocation()
  
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('hiring-vacancies') ? 'vacancies' : 'pipeline'
  )

  useEffect(() => {
    setActiveTab(location.pathname.includes('hiring-vacancies') ? 'vacancies' : 'pipeline')
  }, [location.pathname])


  // Requirements state
  const [requirementsSearch, setRequirementsSearch] = useState('')
  const [reqDept, setReqDept] = useState('All Departments')
  const [reqPriority, setReqPriority] = useState('All Priorities')

  // Stats / Candidates State
  const [candidatesSearch, setCandidatesSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('All Applied Roles')
  const [selectedSource, setSelectedSource] = useState('All Traffic Sources')
  const [selectedStatus, setSelectedStatus] = useState('All Pipeline Statuses')

  // Initially empty to match screenshot
  const [candidates, setCandidates] = useState([])

  const [vacancies, setVacancies] = useState([])
  const [showVacancyForm, setShowVacancyForm] = useState(false)
  const [vacancyForm, setVacancyForm] = useState({
    jobRole: '',
    title: '',
    department: '',
    requiredSkills: '',
    experience: '',
    salaryRange: '',
    employmentType: 'Full-Time',
    priority: 'Medium',
    positions: 1,
    lastDate: '',
    description: ''
  })

  const handlePublishVacancy = (e) => {
    e.preventDefault()
    if (!vacancyForm.jobRole || !vacancyForm.title || !vacancyForm.description) {
      toast.error('Please fill in job role, position title and description')
      return
    }

    const newVacancy = {
      id: Date.now().toString(),
      ...vacancyForm
    }

    setVacancies([...vacancies, newVacancy])
    setVacancyForm({
      jobRole: '',
      title: '',
      department: '',
      requiredSkills: '',
      experience: '',
      salaryRange: '',
      employmentType: 'Full-Time',
      priority: 'Medium',
      positions: 1,
      lastDate: '',
      description: ''
    })
    setShowVacancyForm(false)
    toast.success('Vacancy published successfully!')
  }


  // Filter candidates dynamically
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(candidatesSearch.toLowerCase()) ||
                          cand.email.toLowerCase().includes(candidatesSearch.toLowerCase())
    const matchesRole = selectedRole === 'All Applied Roles' || cand.role === selectedRole
    const matchesSource = selectedSource === 'All Traffic Sources' || cand.source === selectedSource
    const matchesStatus = selectedStatus === 'All Pipeline Statuses' || cand.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesSource && matchesStatus
  })

  // Dynamic status counters
  const totalCount = filteredCandidates.length
  const interviewedCount = filteredCandidates.filter(c => c.status === 'Interviewed').length
  const taskSentCount = filteredCandidates.filter(c => c.status === 'Task Sent').length
  const taskReviewedCount = filteredCandidates.filter(c => c.taskStage === 'Reviewing' || c.taskStage === 'Passed').length
  const offerSentCount = filteredCandidates.filter(c => c.offerStatus === 'Offered').length
  const joinedCount = filteredCandidates.filter(c => c.offerStatus === 'Joined' || c.status === 'Joined').length

  const handleLogClick = (candName) => {
    toast.success(`Viewing event log logs for candidate ${candName}`)
  }

  if (isManager) {
    const totalVacancies = vacancies.length
    const activeVacancies = vacancies.length
    const positionsOpen = vacancies.reduce((acc, curr) => acc + parseInt(curr.positions || 0), 0)

    return (
      <div className="w-full space-y-6 pb-12 px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-500 rounded-2xl shadow-sm border border-cyan-100">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                Vacancy Management
              </h1>
              <p className="text-xs text-cyan-500 font-bold mt-0.5">
                Create and manage hiring requirements
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVacancyForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0c6396] hover:bg-[#0a527c] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} />
            Publish Vacancy
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Vacancies */}
          <div className="bg-white border border-slate-100 rounded-3xl py-8 px-4 shadow-sm text-center">
            <p className="text-4xl font-black text-[#0c6396]">{totalVacancies}</p>
            <p className="text-[10px] font-black text-cyan-600/70 uppercase tracking-widest mt-2">TOTAL VACANCIES</p>
          </div>
          {/* Active Vacancies */}
          <div className="bg-white border border-slate-100 rounded-3xl py-8 px-4 shadow-sm text-center">
            <p className="text-4xl font-black text-emerald-500">{activeVacancies}</p>
            <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mt-2">ACTIVE VACANCIES</p>
          </div>
          {/* Positions Open */}
          <div className="bg-white border border-slate-100 rounded-3xl py-8 px-4 shadow-sm text-center">
            <p className="text-4xl font-black text-orange-500">{positionsOpen}</p>
            <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest mt-2">POSITIONS OPEN</p>
          </div>
        </div>

        {/* Empty State / Table */}
        {vacancies.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl py-12 px-6 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500">
              No vacancies found. Create a new hiring requirement to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-5 gap-4 px-8 py-5 border-b border-slate-100 bg-[#f8fafc] text-[10px] font-black text-[#0c6396] tracking-wider uppercase">
              <div>Role & Title</div>
              <div>Dept & Skills</div>
              <div>Positions & Exp</div>
              <div>Salary & Priority</div>
              <div>Last Date to Apply</div>
            </div>
            <div className="divide-y divide-slate-100">
              {vacancies.map((vac) => (
                <div key={vac.id} className="grid grid-cols-5 gap-4 px-8 py-4.5 items-center text-xs hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-extrabold text-[#0c6396] text-sm">{vac.title}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{vac.jobRole}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">{vac.department || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]" title={vac.requiredSkills}>
                      {vac.requiredSkills || 'None'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">{vac.positions} positions ({vac.employmentType})</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{vac.experience || 'No experience required'}</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">{vac.salaryRange || 'Not disclosed'}</div>
                    <div className="mt-1">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                        vac.priority === 'High'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : vac.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {vac.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-500 font-bold">
                    {vac.lastDate ? new Date(vac.lastDate).toLocaleDateString() : 'No Deadline'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publish Vacancy Modal */}
        {showVacancyForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowVacancyForm(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-black text-[#0c6396] tracking-tight">Create Hiring Requirement</h3>
              </div>

              <form onSubmit={handlePublishVacancy} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Job Role</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Developer"
                      value={vacancyForm.jobRole}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, jobRole: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Position Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={vacancyForm.title}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineering"
                      value={vacancyForm.department}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, department: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Required Skills</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React, Node.js"
                      value={vacancyForm.requiredSkills}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, requiredSkills: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Experience Required</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2-4 Years"
                      value={vacancyForm.experience}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, experience: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Salary Range</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5LPA - 8LPA"
                      value={vacancyForm.salaryRange}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, salaryRange: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employment Type</label>
                    <select
                      value={vacancyForm.employmentType}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, employmentType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
                    >
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority Level</label>
                    <select
                      value={vacancyForm.priority}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, priority: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employees Required</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={vacancyForm.positions}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, positions: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Date to Apply</label>
                    <input
                      type="date"
                      required
                      value={vacancyForm.lastDate}
                      onChange={(e) => setVacancyForm({ ...vacancyForm, lastDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Job Description</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Detailed job description..."
                    value={vacancyForm.description}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end items-center gap-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVacancyForm(false)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#0c6396] hover:bg-[#0a527c] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Publish Vacancy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12 px-4 md:px-0">
      {activeTab === 'vacancies' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 text-cyan-500 rounded-2xl shadow-sm border border-cyan-100">
                <Briefcase size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                  Vacancy Management
                </h1>
                <p className="text-xs text-cyan-500 font-bold mt-0.5">
                  Create and manage hiring requirements
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowVacancyForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0c6396] hover:bg-[#0a527c] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} />
              Publish Vacancy
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Vacancies */}
            <div className="bg-white border border-slate-100 rounded-3xl py-8 px-4 shadow-sm text-center">
              <p className="text-4xl font-black text-[#0c6396]">{vacancies.length}</p>
              <p className="text-[10px] font-black text-cyan-600/70 uppercase tracking-widest mt-2">TOTAL VACANCIES</p>
            </div>
            {/* Active Vacancies */}
            <div className="bg-white border border-slate-100 rounded-3xl py-8 px-4 shadow-sm text-center">
              <p className="text-4xl font-black text-emerald-500">{vacancies.length}</p>
              <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mt-2">ACTIVE VACANCIES</p>
            </div>
            {/* Positions Open */}
            <div className="bg-white border border-slate-100 rounded-3xl py-8 px-4 shadow-sm text-center">
              <p className="text-4xl font-black text-orange-500 text-center">
                {vacancies.reduce((acc, curr) => acc + parseInt(curr.positions || 0), 0)}
              </p>
              <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest mt-2">POSITIONS OPEN</p>
            </div>
          </div>

          {/* Empty State / Table */}
          {vacancies.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl py-12 px-6 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-500">
                No vacancies found. Create a new hiring requirement to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-200">
              <div className="grid grid-cols-5 gap-4 px-8 py-5 border-b border-slate-100 bg-[#f8fafc] text-[10px] font-black text-[#0c6396] tracking-wider uppercase">
                <div>Role & Title</div>
                <div>Dept & Skills</div>
                <div>Positions & Exp</div>
                <div>Salary & Priority</div>
                <div>Last Date to Apply</div>
              </div>
              <div className="divide-y divide-slate-100">
                {vacancies.map((vac) => (
                  <div key={vac.id} className="grid grid-cols-5 gap-4 px-8 py-4.5 items-center text-xs hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-extrabold text-[#0c6396] text-sm">{vac.title}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{vac.jobRole}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{vac.department || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]" title={vac.requiredSkills}>
                        {vac.requiredSkills || 'None'}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{vac.positions} positions ({vac.employmentType})</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{vac.experience || 'No experience required'}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{vac.salaryRange || 'Not disclosed'}</div>
                      <div className="mt-1">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                          vac.priority === 'High'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : vac.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {vac.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-500 font-bold">
                      {vac.lastDate ? new Date(vac.lastDate).toLocaleDateString() : 'No Deadline'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 text-cyan-500 rounded-full shadow-sm">
                <UserPlus size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                  Hiring Pipeline
                </h1>
                <p className="text-xs text-cyan-500 font-bold mt-0.5">
                  Manage candidates and track recruitment stages
                </p>
              </div>
            </div>
          </div>

          {/* 1. Active Hiring Requirements Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Briefcase size={16} className="text-[#0c6396]" />
              <h3 className="font-extrabold text-[#0c6396] text-sm">Active Hiring Requirements</h3>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search role..."
                value={requirementsSearch}
                onChange={(e) => setRequirementsSearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
              />
              <select
                value={reqDept}
                onChange={(e) => setReqDept(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Marketing</option>
              </select>
              <select
                value={reqPriority}
                onChange={(e) => setReqPriority(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {/* Requirements Empty State */}
            <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-amber-500 font-bold text-lg">!</div>
              <h4 className="text-xs font-black text-amber-600">Currently no hiring requirements available.</h4>
              <p className="text-[10px] text-amber-600/75 font-semibold">Check back later or contact administration.</p>
            </div>
          </div>

          {/* 2. Stats Grid counters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total */}
            <div className="bg-white border border-slate-100 rounded-2xl py-6 px-4 shadow-sm text-center">
              <p className="text-2xl font-black text-[#0c6396]">{totalCount}</p>
              <p className="text-[8px] font-black text-[#0c6396]/70 uppercase tracking-widest mt-1">TOTAL</p>
            </div>
            {/* Interviewed */}
            <div className="bg-white border border-slate-100 rounded-2xl py-6 px-4 shadow-sm text-center">
              <p className="text-2xl font-black text-amber-600">{interviewedCount}</p>
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-1">INTERVIEWED</p>
            </div>
            {/* Task Sent */}
            <div className="bg-white border border-slate-100 rounded-2xl py-6 px-4 shadow-sm text-center">
              <p className="text-2xl font-black text-cyan-600">{taskSentCount}</p>
              <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest mt-1">TASK SENT</p>
            </div>
            {/* Task Reviewed */}
            <div className="bg-white border border-slate-100 rounded-2xl py-6 px-4 shadow-sm text-center">
              <p className="text-2xl font-black text-emerald-600">{taskReviewedCount}</p>
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">TASK REVIEWED</p>
            </div>
            {/* Offer Sent */}
            <div className="bg-white border border-slate-100 rounded-2xl py-6 px-4 shadow-sm text-center">
              <p className="text-2xl font-black text-[#0c6396]">{offerSentCount}</p>
              <p className="text-[8px] font-black text-[#0c6396]/70 uppercase tracking-widest mt-1">OFFER SENT</p>
            </div>
            {/* Joined */}
            <div className="bg-white border border-slate-100 rounded-2xl py-6 px-4 shadow-sm text-center">
              <p className="text-2xl font-black text-green-700">{joinedCount}</p>
              <p className="text-[8px] font-black text-green-700 uppercase tracking-widest mt-1">JOINED</p>
            </div>
          </div>

          {/* 3. Search & Filters Candidates Box */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search candidates by name or email address..."
                value={candidatesSearch}
                onChange={(e) => setCandidatesSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
              />
            </div>

            {/* Filters dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option>All Applied Roles</option>
                <option>Full-Stack Developer</option>
                <option>Frontend Engineer</option>
                <option>Node JS Developer</option>
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option>All Traffic Sources</option>
                <option>LinkedIn</option>
                <option>Indeed</option>
                <option>Referral</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option>All Pipeline Statuses</option>
                <option>Applied</option>
                <option>Interviewing</option>
                <option>Task Sent</option>
                <option>Interviewed</option>
                <option>Joined</option>
              </select>
            </div>
          </div>

          {/* 4. Candidates Pipeline Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-8 gap-4 px-8 py-5 border-b border-slate-100 bg-[#f8fafc] text-[10px] font-black text-[#0c6396] tracking-wider">
              <div>Candidate Details</div>
              <div>Source & Role</div>
              <div>Status</div>
              <div>Interview</div>
              <div>Task Stage</div>
              <div>HR Round</div>
              <div>Offer & Onboard</div>
              <div className="text-right">Log</div>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[11px] font-semibold text-slate-400">
                  No candidates found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCandidates.map(cand => (
                  <div key={cand.id} className="grid grid-cols-8 gap-4 px-8 py-4.5 items-center text-xs hover:bg-slate-50 transition-colors">
                    
                    {/* Details */}
                    <div>
                      <p className="font-extrabold text-[#0c6396] text-sm">{cand.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{cand.email}</p>
                    </div>

                    {/* Source & Role */}
                    <div>
                      <p className="font-bold text-slate-700">{cand.role}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Via {cand.source}</p>
                    </div>

                    {/* Status badge */}
                    <div>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                        cand.status === 'Joined'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : cand.status === 'Task Sent'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {cand.status}
                      </span>
                    </div>

                    {/* Interview */}
                    <div className="font-bold text-slate-600">
                      {cand.interview}
                    </div>

                    {/* Task Stage */}
                    <div className="font-bold text-slate-600">
                      {cand.taskStage}
                    </div>

                    {/* HR Round */}
                    <div className="font-bold text-slate-600">
                      {cand.hrRound}
                    </div>

                    {/* Offer & Onboard */}
                    <div>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                        cand.offerStatus === 'Joined'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : cand.offerStatus === 'Offered'
                          ? 'bg-cyan-50 text-cyan-600 border-cyan-100'
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {cand.offerStatus}
                      </span>
                    </div>

                    {/* Event Logs */}
                    <div className="text-right">
                      <button
                        onClick={() => handleLogClick(cand.name)}
                        className="p-1.5 bg-slate-50 hover:bg-muted border border-border rounded-lg text-slate-500 cursor-pointer inline-flex items-center gap-1 transition-colors"
                        title="View candidate logs"
                      >
                        <FileText size={14} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Vacancy Modal */}
      {showVacancyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowVacancyForm(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-black text-[#0c6396] tracking-tight">Create Hiring Requirement</h3>
            </div>

            <form onSubmit={handlePublishVacancy} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Job Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Developer"
                    value={vacancyForm.jobRole}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, jobRole: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Position Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={vacancyForm.title}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering"
                    value={vacancyForm.department}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Required Skills</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Node.js"
                    value={vacancyForm.requiredSkills}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, requiredSkills: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Experience Required</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2-4 Years"
                    value={vacancyForm.experience}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, experience: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Salary Range</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5LPA - 8LPA"
                    value={vacancyForm.salaryRange}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, salaryRange: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employment Type</label>
                  <select
                    value={vacancyForm.employmentType}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, employmentType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority Level</label>
                  <select
                    value={vacancyForm.priority}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employees Required</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vacancyForm.positions}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, positions: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Date to Apply</label>
                  <input
                    type="date"
                    required
                    value={vacancyForm.lastDate}
                    onChange={(e) => setVacancyForm({ ...vacancyForm, lastDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Job Description</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detailed job description..."
                  value={vacancyForm.description}
                  onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm resize-none"
                />
              </div>

              <div className="flex justify-end items-center gap-6 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVacancyForm(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0c6396] hover:bg-[#0a527c] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HiringModule
