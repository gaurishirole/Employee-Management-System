import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Briefcase, Search, Filter, Plus, Calendar, Clock, FileText, CheckCircle, Users, X, Info } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { apiFetch, getRolePrefix } from '../utils/api'

const ProjectModule = () => {
  const { user } = useAuth()
  const { toast } = useNotification()
  const prefix = getRolePrefix(user?.role)

  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    assignedTeams: [],
    completion: 0
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const projectsData = await apiFetch(`${prefix}/projects`).catch(() => [])
      setProjects(projectsData)

      const teamsData = await apiFetch(`${prefix}/teams`).catch(() => [])
      setTeams(teamsData)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load projects or teams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role) {
      fetchData()
    }
  }, [user?.role])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTeamToggle = (teamId) => {
    setFormData(prev => {
      const alreadySelected = prev.assignedTeams.includes(teamId)
      return {
        ...prev,
        assignedTeams: alreadySelected 
          ? prev.assignedTeams.filter(id => id !== teamId)
          : [...prev.assignedTeams, teamId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Project Name is required')
      return
    }

    try {
      await apiFetch(`${prefix}/projects`, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          status: formData.status,
          completion: Number(formData.completion) || 0,
          assignedTeams: formData.assignedTeams.map(Number)
        })
      })

      toast.success('Project created successfully!')
      setShowModal(false)
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Planning',
        assignedTeams: [],
        completion: 0
      })
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to create project')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
      case 'On Hold':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
      case 'Planning':
      default:
        return 'bg-slate-500/10 text-slate-650 dark:text-slate-400 border border-slate-500/20'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              My Projects
            </h1>
            <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest mt-1">
              PROJECT OVERSIGHT & EXECUTION
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-card text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold w-56 shadow-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-card text-slate-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 cursor-pointer shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0c6396]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c6396] mx-auto mb-4"></div>
          <p className="text-xs font-semibold uppercase tracking-wider">Syncing Projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-24 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/60 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-705">
            <Briefcase size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wider uppercase">
              NO PROJECTS FOUND
            </h3>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Try adjusting your filters or add a new project to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wider uppercase">
                  <th className="px-6 py-4 rounded-l-2xl">Project Details</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Completion</th>
                  <th className="px-6 py-4 rounded-r-2xl">Assigned Teams</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    {/* Project Details */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-850 dark:text-white text-sm">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-md leading-relaxed">
                          {project.description || 'No description provided.'}
                        </p>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase w-8">From:</span>
                          <span>{project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase w-8">To:</span>
                          <span>{project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(project.status)}`}>
                        {project.status}
                      </span>
                    </td>

                    {/* Completion / Progress */}
                    <td className="px-6 py-5">
                      <div className="w-36 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                          <span className="text-[#0c6396] dark:text-[#38bdf8] font-black">{project.completion || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-[#0c6396] transition-all duration-500" 
                            style={{ width: `${project.completion || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Teams */}
                    <td className="px-6 py-5">
                      {project.assignedTeams && project.assignedTeams.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {project.assignedTeams.map(t => (
                            <span 
                              key={t.id} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-cyan-500/5 text-[#0c6396] dark:text-cyan-400 border border-cyan-500/10"
                            >
                              <Users size={10} />
                              {t.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-405 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight mb-6">
              Launch New Project
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Project Name */}
              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                  PROJECT NAME
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Phoenix Redesign"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Project goals, milestones, and details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold resize-none"
                />
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                    FROM DATE
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                    TO DATE
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
                  />
                </div>
              </div>

              {/* Status and Progress */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                    STATUS
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                    COMPLETION (%)
                  </label>
                  <input
                    type="number"
                    name="completion"
                    min="0"
                    max="100"
                    value={formData.completion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Select Team / Members */}
              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-2">
                  ASSIGN TEAMS & MEMBERS
                </label>
                {teams.length === 0 ? (
                  <p className="text-[10px] font-semibold text-slate-400 italic">No teams registered to assign.</p>
                ) : (
                  <div className="border border-border rounded-xl p-3 bg-slate-50/30 dark:bg-slate-900/40 max-h-40 overflow-y-auto space-y-2">
                    {teams.map((t) => {
                      const isSelected = formData.assignedTeams.includes(t.id)
                      const memberNames = (t.members || []).map(m => m.name || m.userName).join(', ')
                      return (
                        <div 
                          key={t.id}
                          onClick={() => handleTeamToggle(t.id)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-0.5 ${
                            isSelected 
                              ? 'bg-[#0c6396]/5 border-[#0c6396] dark:border-[#38bdf8]' 
                              : 'bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                            <span className="text-[9px] font-black text-[#0c6396]/75 dark:text-[#38bdf8]/75 uppercase">
                              {(t.members || []).length} Members
                            </span>
                          </div>
                          {memberNames && (
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 line-clamp-1">
                              Members: {memberNames}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0c6396]/20 transition-all cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectModule
