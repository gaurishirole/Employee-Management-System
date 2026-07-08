import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ClipboardList, Send, Calendar, Clock, Filter, Plus, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { apiFetch } from '../utils/api'

const TaskModule = () => {
  const { user } = useAuth()
  const { toast } = useNotification()
  
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    projectId: '',
    assigneeId: '',
    deadline: '',
    description: '',
    title: ''
  })

  const fetchTaskModuleData = async () => {
    try {
      setLoading(true)
      // Fetch assigned tasks
      const tasksData = await apiFetch('/leader/my-assigned-tasks').catch(() => [])
      setTasks(tasksData)

      // Fetch projects
      const projectsData = await apiFetch('/leader/projects').catch(() => [])
      setProjects(projectsData)

      // Fetch team members
      const teamData = await apiFetch('/leader/team-members').catch(() => [])
      setTeamMembers(teamData)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load tasks database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'leaders' || user?.role === 'leader' || user?.role === 'admin') {
      fetchTaskModuleData()
    }
  }, [user?.role])

  const handleProjectChange = async (projectId) => {
    setFormData(prev => ({ ...prev, projectId, assigneeId: '' }));
    try {
      const url = projectId ? `/leader/team-members?projectId=${projectId}` : '/leader/team-members';
      const teamData = await apiFetch(url).catch(() => []);
      setTeamMembers(teamData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault()
    if (!formData.projectId || !formData.assigneeId || !formData.deadline || !formData.description || !formData.title) {
      toast.error('Please fill in all task details (Title, Project, Assignee, Deadline, Description)')
      return
    }

    try {
      await apiFetch('/leader/assign-task', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          assignedToId: Number(formData.assigneeId),
          projectId: Number(formData.projectId),
          dueDate: new Date(formData.deadline).toISOString()
        })
      })

      setFormData({ projectId: '', assigneeId: '', deadline: '', description: '', title: '' })
      toast.success('Task assigned successfully!')
      fetchTaskModuleData()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to assign task')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
      case 'Done':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50'
      case 'In Progress':
      case 'Doing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50'
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200/50'
    }
  }

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Assign Tasks
            </h1>
            <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest mt-1">
              TASK ASSIGNMENT & TRACKING
            </p>
          </div>
        </div>
      </div>

      {/* New Task Card */}
      <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-base mb-6">
          <div className="w-8 h-8 bg-cyan-500/10 text-[#0c6396] rounded-xl flex items-center justify-center border border-cyan-100/30">
            <Calendar size={16} />
          </div>
          <span>New Task</span>
        </div>

        <form onSubmit={handleAssignTask} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                TASK TITLE
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task summary..."
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                PROJECT
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                ASSIGNEE
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
              >
                <option value="">Select Assignee</option>
                {teamMembers.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                TASK DEADLINE
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
              TASK DESCRIPTION
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail the requirements for this task assignment..."
              rows="4"
              className="w-full px-4 py-3 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold resize-none"
            />
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-[#0c6396] hover:bg-[#0a4d68] text-white rounded-xl text-xs font-black tracking-widest shadow-md shadow-[#0c6396]/20 flex items-center gap-2 transition-all cursor-pointer uppercase"
            >
              <Send size={14} /> ASSIGN TASK
            </button>
          </div>
        </form>
      </div>

      {/* Assigned Tasks Log Card */}
      <div className="bg-card border border-slate-200/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-base">
            <div className="w-8 h-8 bg-cyan-500/10 text-[#0c6396] rounded-xl flex items-center justify-center border border-cyan-100/30">
              <Clock size={16} />
            </div>
            <span>Assigned Tasks Log</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-400 italic">Loading tasks database...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-400 italic">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">PROJECT & ASSIGNEE</th>
                  <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider">TIMELINE</th>
                  <th className="pb-3 text-[11px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4">
                      <p className="font-extrabold text-[#0c6396] text-sm">{task.project?.name || 'General Project'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Assignee: {task.assignedTo?.name || 'Unassigned'}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{task.title || task.description}</p>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {(task.deadline || task.dueDate) ? new Date(task.deadline || task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskModule
