import { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Trash2, Edit2, X, Star } from 'lucide-react'
import { apiFetch, getRolePrefix } from '../utils/api'

const PerformanceModule = () => {
  const { user } = useAuth()
  const isEmployee = user?.role === 'employee'
  const [employees, setEmployees] = useState([])
  const [performances, setPerformances] = useState(() => {
    const stored = localStorage.getItem('TDTL-performance')
    return stored ? JSON.parse(stored) : [
      { id: '1', employeeId: '1', rating: 4.5, period: 'Q4 2023', feedback: 'Excellent performance and leadership', reviewDate: '2024-01-10' },
      { id: '2', employeeId: '2', rating: 4.2, period: 'Q4 2023', feedback: 'Good campaign execution', reviewDate: '2024-01-12' },
      { id: '3', employeeId: '3', rating: 3.8, period: 'Q4 2023', feedback: 'Solid sales performance', reviewDate: '2024-01-14' }
    ]
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { toast } = useNotification()

  useEffect(() => {
    localStorage.setItem('TDTL-performance', JSON.stringify(performances))
  }, [performances])

  useEffect(() => {
    const fetchEmployeesData = async () => {
      try {
        const prefix = getRolePrefix(user?.role)
        const data = await apiFetch(`${prefix}/employees`).catch(() => [])
        setEmployees(data)
      } catch (err) {
        console.error(err)
      }
    }
    if (user?.role) {
      fetchEmployeesData()
    }
  }, [user?.role])

  const [formData, setFormData] = useState({
    employeeId: '',
    period: '',
    rating: 3,
    feedback: '',
  })

  const handleAddPerformance = () => {
    if (!formData.employeeId || !formData.period) {
      toast.error('Please fill all required fields')
      return
    }

    if (editingId) {
      setPerformances(performances.map(perf =>
        perf.id === editingId 
          ? { 
              ...perf, 
              ...formData,
              rating: parseFloat(formData.rating),
              reviewDate: new Date().toISOString().split('T')[0]
            }
          : perf
      ))
      toast.success('Performance review updated successfully!')
      setEditingId(null)
    } else {
      const newPerf = {
        id: Date.now().toString(),
        ...formData,
        rating: parseFloat(formData.rating),
        reviewDate: new Date().toISOString().split('T')[0],
      }
      setPerformances([...performances, newPerf])
      toast.success('Performance review added successfully!')
    }

    setFormData({ employeeId: '', period: '', rating: 3, feedback: '' })
    setShowForm(false)
  }

  const handleEditPerformance = (perf) => {
    setFormData(perf)
    setEditingId(perf.id)
    setShowForm(true)
  }

  const handleDeletePerformance = (id) => {
    setPerformances(performances.filter(perf => perf.id !== id))
    toast.success('Performance review deleted!')
  }

  const getEmployeeName = (id) => {
    return employees.find(emp => emp.id === id)?.name || 'Unknown'
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4) return 'text-green-500'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 3) return 'text-yellow-500'
    return 'text-red-600'
  }

  const getRatingCategory = (rating) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 4) return 'Very Good'
    if (rating >= 3.5) return 'Good'
    if (rating >= 3) return 'Average'
    return 'Needs Improvement'
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ employeeId: '', period: '', rating: 3, feedback: '' })
  }

  const filteredPerformances = isEmployee 
    ? performances.filter(perf => perf.employeeId === user?.id) 
    : performances

  const averageRating = filteredPerformances.length > 0
    ? (filteredPerformances.reduce((sum, p) => sum + p.rating, 0) / filteredPerformances.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          {isEmployee ? 'My Performance Reviews' : 'Performance Management'}
        </h2>
        {!isEmployee && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus size={18} />
            Add Review
          </button>
        )}
      </div>

      {/* Average Rating Card */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {isEmployee ? 'My Average Rating' : 'Team Average Rating'}
            </p>
            <p className="text-4xl font-bold text-foreground">{averageRating} / 5</p>
          </div>
          <div className="text-6xl text-yellow-400">⭐</div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? 'Edit Review' : 'Add Performance Review'}
              </h3>
              <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Employee *</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Review Period *</label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="Q4 2023"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rating: {formData.rating} / 5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={i < Math.round(formData.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Feedback</label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                  placeholder="Enter performance feedback..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddPerformance}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Reviews */}
      <div className="space-y-4">
        {filteredPerformances.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-lg shadow-sm">
            No performance reviews yet
          </div>
        ) : (
          filteredPerformances.map((perf) => (
            <div key={perf.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{getEmployeeName(perf.employeeId)}</h3>
                  <p className="text-sm text-muted-foreground">{perf.period}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <span className={`text-3xl font-bold ${getRatingColor(perf.rating)}`}>
                      {perf.rating}
                    </span>
                    <span className="text-yellow-400 text-2xl">★</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {getRatingCategory(perf.rating)}
                  </p>
                </div>
              </div>

              {perf.feedback && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground italic">&quot;{perf.feedback}&quot;</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Reviewed on {perf.reviewDate}
                </p>
                {!isEmployee && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPerformance(perf)}
                      className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors cursor-pointer"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePerformance(perf.id)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rating Distribution */}
      {filteredPerformances.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = filteredPerformances.filter(p => Math.round(p.rating) === rating).length
              const percentage = (count / filteredPerformances.length) * 100
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-12 font-medium text-foreground">{rating}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceModule
