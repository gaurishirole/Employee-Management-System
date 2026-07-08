import { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Trash2, Edit2, Users, X, Check, Search, Filter } from 'lucide-react'
import { apiFetch, getRolePrefix } from '../utils/api'

const DepartmentModule = () => {
  const isTeams = window.location.pathname.includes('/teams')
  const entityName = isTeams ? 'Team' : 'Department'
  const entityPlural = isTeams ? 'Teams' : 'Departments'

  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { toast } = useNotification()
  const { user } = useAuth()
  const isManager = user?.role === 'manager' || user?.role === 'leaders' || user?.role === 'leader'
  
  const prefix = getRolePrefix(user?.role)

  const fetchDepartmentsAndEmployees = async () => {
    try {
      setLoading(true)
      const empData = await apiFetch(`${prefix}/employees`).catch(() => [])
      setEmployees(empData)

      let endpoint = isTeams ? '/teams' : '/teams' // fallback to teams if department endpoint is same
      const deptData = await apiFetch(`${prefix}${endpoint}`).catch(() => [])
      
      // Normalize departments
      const normalized = deptData.map(d => ({
        id: d.id,
        name: d.name,
        manager: d.leader?.name || d.managerName || 'Unassigned',
        members: d.members || []
      }))
      setDepartments(normalized)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role) {
      fetchDepartmentsAndEmployees()
    }
  }, [user?.role, isTeams])

  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    members: [],
  })

  const handleAddDepartment = async () => {
    if (!formData.name) {
      toast.error('Please fill name field')
      return
    }

    try {
      const prefix = getRolePrefix(user?.role)
      const payload = {
        name: formData.name,
        leaderId: formData.members?.[0] || user?.id, // Use first member or current user as leader
        memberIds: formData.members
      }

      if (editingId) {
        await apiFetch(`${prefix}/teams/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        toast.success(`${entityName} updated successfully!`)
        setEditingId(null)
      } else {
        await apiFetch(`${prefix}/teams`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        toast.success(`${entityName} added successfully!`)
      }

      setFormData({ name: '', manager: '', members: [] })
      setShowForm(false)
      fetchDepartmentsAndEmployees()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Operation failed')
    }
  }

  const handleEditDepartment = (dept) => {
    setFormData({
      name: dept.name,
      manager: dept.manager,
      members: dept.members ? dept.members.map(m => m.id) : [],
    })
    setEditingId(dept.id)
    setShowForm(true)
  }

  const handleDeleteDepartment = async (id) => {
    try {
      const prefix = getRolePrefix(user?.role)
      await apiFetch(`${prefix}/teams/${id}`, {
        method: 'DELETE'
      })
      toast.success(`${entityName} deleted successfully!`)
      fetchDepartmentsAndEmployees()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Delete failed')
    }
  }

  const getEmployeeCount = (dept) => {
    return dept.members ? dept.members.length : 0
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', manager: '', members: [] })
  }

  const toggleMember = (empId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(empId)
        ? prev.members.filter(id => id !== empId)
        : [...prev.members, empId]
    }))
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        {isTeams ? (
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                My Teams
              </h1>
              <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest mt-1">
                OVERSIGHT OF TEAM MEMBERS & STRUCTURES
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Department Management
            </h1>
            <p className="text-xs text-[#0c6396]/80 font-semibold mt-1">
              Manage organizational structures and units.
            </p>
          </div>
        )}

        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0c6396]/20 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus size={16} /> Create {entityName}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/80 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight mb-8">
              {editingId ? `Modify ${entityName}` : `Assemble New ${entityName}`}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                  {entityName} DESIGNATION
                </label>
                <input
                  type="text"
                  placeholder={isTeams ? "e.g. Frontend Development" : "e.g. Human Resources"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                  PERSONNEL ALLOCATION
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60">
                  {employees.map(emp => {
                    const isSelected = formData.members.includes(emp.id)
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => toggleMember(emp.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all text-left ${
                          isSelected
                            ? 'bg-cyan-50 border-[#0c6396]/30 text-[#0c6396] dark:bg-[#0c6396]/20 dark:border-[#0c6396]/50'
                            : 'bg-card border-border/50 text-[#0c6396]/70 hover:border-[#0c6396]/30'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#0c6396] bg-[#0c6396]' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <span className="truncate">{emp.name}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[9px] font-black text-[#0c6396]/70 mt-2 tracking-wide">
                  Selected: {formData.members.length} members
                </p>
              </div>

              <div className="flex gap-4 pt-4 justify-end items-center">
                <button
                  onClick={handleCancel}
                  className="text-xs font-extrabold text-[#0c6396] hover:text-[#094c72] transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={handleAddDepartment}
                  className="px-6 py-2.5 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0c6396]/20 transition-all cursor-pointer"
                >
                  Finalize {entityName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departments/Teams Grid */}
      {loading ? (
        <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#0c6396]/70">Loading registry database...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-card border border-border/85 rounded-3xl p-16 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#0c6396]/70">No {entityPlural.toLowerCase()} defined yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-card border border-border/80 rounded-3xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">{dept.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">Lead: {dept.manager}</p>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditDepartment(dept)}
                    className="p-1.5 text-[#0c6396] hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-xl relative z-10">
                <Users size={16} className="text-[#0c6396]/60" />
                <span className="text-xs font-bold text-[#0c6396]">
                  {getEmployeeCount(dept)} Personnel
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DepartmentModule
