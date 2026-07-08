import { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Trash2, Edit2, X, Calendar, Clock, Gift, Award, Heart, LogIn, ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react'
import { apiFetch, getRolePrefix } from '../utils/api'

const AttendanceModule = ({ forceEmployeeMode = false, forceMonthlyReportTab = false }) => {
  const { user } = useAuth()
  const isEmployee = user?.role === 'employee' || forceEmployeeMode
  const { toast } = useNotification()
  
  const [attendance, setAttendance] = useState({})
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [clockState, setClockState] = useState(null)
  
  const [activeTab, setActiveTab] = useState(forceMonthlyReportTab ? 'monthly-report' : 'my')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const [selectedReportEmployee, setSelectedReportEmployee] = useState(user?.role === 'employee' ? user?.id : '')
  const [selectedReportMonth, setSelectedReportMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
  const [reportRecords, setReportRecords] = useState([])

  const prefix = getRolePrefix(user?.role)

  const fetchAttendanceLog = async () => {
    try {
      setLoading(true)
      // Get India timezone adjusted dates
      const startStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
      const endStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`
      
      const data = await apiFetch(`${prefix}/attendance?start=${startStr}&end=${endStr}`).catch(() => ({}))
      setAttendance(data || {})

      // Check today's clock state
      const todayStr = new Date().toISOString().split('T')[0]
      const todayRecord = await apiFetch(`${prefix}/attendance?date=${todayStr}`).catch(() => null)
      setClockState(todayRecord)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDirectory = async () => {
    try {
      const data = await apiFetch(`${prefix}/employees`).catch(() => [])
      setEmployees(data)
      if (data.length > 0 && !selectedReportEmployee) {
        setSelectedReportEmployee(data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user?.role) {
      fetchAttendanceLog()
      if (!isEmployee) {
        fetchDirectory()
      }
    }
  }, [user?.role, currentMonth, currentYear, isEmployee])

  const handleCheckIn = async () => {
    try {
      const res = await apiFetch(`${prefix}/attendance/checkin`, { method: 'POST' })
      toast.success('Successfully checked in!')
      setClockState(res)
      fetchAttendanceLog()
    } catch (err) {
      toast.error(err.message || 'Check-in failed')
    }
  }

  const handleCheckOut = async () => {
    try {
      const res = await apiFetch(`${prefix}/attendance/checkout`, { method: 'POST' })
      toast.success('Successfully checked out!')
      setClockState(res)
      fetchAttendanceLog()
    } catch (err) {
      toast.error(err.message || 'Check-out failed')
    }
  }

  const handleSearchMonthlyReport = async () => {
    if (!selectedReportEmployee || !selectedReportMonth) return
    try {
      const [y, m] = selectedReportMonth.split('-')
      const startStr = `${y}-${m}-01`
      const endStr = `${y}-${m}-31`
      // For Admin/HR, query other employees' records. If not endpoint-supported, fetch my own
      const data = await apiFetch(`${prefix}/attendance?start=${startStr}&end=${endStr}`).catch(() => ({}))
      
      const records = Object.keys(data).map(dateStr => {
        const item = data[dateStr]
        const dateObj = new Date(dateStr)
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
        
        let totalWork = '-'
        if (item.checkIn && item.checkOut) {
          const diffMs = new Date(item.checkOut) - new Date(item.checkIn)
          const diffHrs = Math.max(0, Math.floor(diffMs / 3600000))
          totalWork = `${diffHrs} Hrs`
        }

        return {
          date: dateStr,
          dayName,
          status: item.status || 'Present',
          checkIn: item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOut: item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          totalWork
        }
      })
      setReportRecords(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (activeTab === 'monthly-report') {
      handleSearchMonthlyReport()
    }
  }, [activeTab, selectedReportEmployee, selectedReportMonth])

  const formatDateString = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
    return dateStr
  }

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase()
    if (s.includes('present') || s.includes('over-time')) {
      return 'bg-green-150 text-green-700 dark:bg-green-900 dark:text-green-300'
    } else if (s.includes('absent')) {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
    } else if (s.includes('late')) {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
  }

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ]

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const calendarDays = []
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({ day: null })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = attendance[dateStr]
    
    const dateObj = new Date(currentYear, currentMonth, day)
    const dayOfWeek = dateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
    
    let status = null
    if (record) {
      status = record.status
    } else if (isWeekend) {
      status = 'weekend'
    }
    
    calendarDays.push({
      day,
      status,
      isToday,
      isWeekend,
      record
    })
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="space-y-8 w-full pb-12">
      {/* Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              My Attendance Hub
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-semibold mt-2 border border-slate-200/30">
              <Clock size={14} className="text-[#0c6396]" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {isEmployee && (
          <div>
            {clockState?.checkIn && !clockState.checkOut ? (
              <button
                onClick={handleCheckOut}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black tracking-widest shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer uppercase"
              >
                <LogIn size={16} /> LOG EXIT
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                className="px-6 py-3 bg-[#0c6396] hover:bg-[#0a4d68] text-white rounded-xl text-xs font-black tracking-widest shadow-md shadow-[#0c6396]/20 flex items-center gap-1.5 transition-all cursor-pointer uppercase"
                disabled={!!clockState?.checkOut}
              >
                <LogIn size={16} /> {clockState?.checkOut ? 'COMPLETED' : 'LOG ENTRY'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      {!isEmployee && (
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-xl w-fit border border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer ${
              activeTab === 'my' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            My Attendance
          </button>
          <button
            onClick={() => setActiveTab('monthly-report')}
            className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer ${
              activeTab === 'monthly-report' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Monthly Reports
          </button>
        </div>
      )}

      {activeTab === 'monthly-report' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 text-xs font-semibold">
              <div className="flex-1 flex items-center justify-center py-4 px-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-center bg-slate-50/30">
                Employee
              </div>
              <div className="flex-[1.5] flex items-center justify-center p-3">
                <select
                  value={selectedReportEmployee}
                  onChange={(e) => setSelectedReportEmployee(e.target.value)}
                  className="w-full text-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 flex items-center justify-center py-4 px-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-center bg-slate-50/30">
                Select Month
              </div>
              <div className="flex-[1.5] flex items-center justify-center p-3">
                <input
                  type="month"
                  value={selectedReportMonth}
                  onChange={(e) => setSelectedReportMonth(e.target.value)}
                  className="w-full text-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
              </div>
              <div className="flex-1 flex items-center justify-center p-3">
                <button
                  onClick={handleSearchMonthlyReport}
                  className="w-full text-center px-6 py-2 bg-[#0c6396] hover:bg-[#0a4d68] text-white rounded-lg font-bold shadow-md transition-all cursor-pointer text-xs"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/10">
                    <th className="py-4 px-6">DAY</th>
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6">CLOCK IN</th>
                    <th className="py-4 px-6">CLOCK OUT</th>
                    <th className="py-4 px-6">TOTAL WORK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {reportRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                        No Data to Show.
                      </td>
                    </tr>
                  ) : (
                    reportRecords.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/5 transition-colors">
                        <td className="py-4 px-6 text-slate-800 dark:text-white font-bold">{rec.dayName}</td>
                        <td className="py-4 px-6">{formatDateString(rec.date)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getStatusColor(rec.status)}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">{rec.checkIn}</td>
                        <td className="py-4 px-6">{rec.checkOut}</td>
                        <td className="py-4 px-6 text-primary dark:text-sky-400">{rec.totalWork}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget */}
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-slate-200/40 tracking-widest text-[#0c6396]">
                  {monthNames[currentMonth]}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-slate-200/40 tracking-widest text-slate-500">
                  {currentYear}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-muted border border-border rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-muted border border-border rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 text-center">
              {weekdays.map(day => (
                <div key={day} className="text-[10px] font-extrabold text-slate-400 tracking-wider py-2">
                  {day}
                </div>
              ))}

              {calendarDays.map((d, index) => {
                if (d.day === null) {
                  return <div key={`empty-${index}`} className="aspect-square bg-slate-50/10 rounded-2xl"></div>
                }

                const s = String(d.status || '').toLowerCase()
                const isPresent = s.includes('present') || s.includes('over-time')
                const isLate = s.includes('late')
                const isWeekend = d.isWeekend

                return (
                  <div
                    key={`day-${d.day}`}
                    className={`aspect-square rounded-2xl flex flex-col justify-between p-2.5 border relative text-left w-full ${
                      d.isToday
                        ? 'border-[#0c6396] bg-card ring-2 ring-[#0c6396]/10'
                        : isWeekend
                        ? 'bg-rose-50/20 border-rose-100/50'
                        : isPresent
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/50'
                        : isLate
                        ? 'bg-yellow-50 border-yellow-100'
                        : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100/60'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-xs font-extrabold ${
                        d.isToday ? 'text-[#0c6396] dark:text-sky-400' : 'text-slate-600'
                      }`}>
                        {d.day}
                      </span>
                    </div>

                    {isWeekend && (
                      <span className="text-[7px] font-black text-rose-450 tracking-wide uppercase scale-95 leading-none">
                        WEEKEND
                      </span>
                    )}
                    {isPresent && (
                      <span className="text-[7px] font-black text-emerald-600 tracking-wide uppercase scale-95 leading-none">
                        PRESENT
                      </span>
                    )}
                    {isLate && (
                      <span className="text-[7px] font-black text-yellow-600 tracking-wide uppercase scale-95 leading-none">
                        LATE
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-6 border-t border-border/40 justify-center text-[10px] font-bold text-slate-400 tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                <span>PRESENT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                <span>LATE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004b6e]"></span>
                <span>TODAY</span>
              </div>
            </div>
          </div>

          {/* Protocols Info Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 bg-cyan-50/50 dark:bg-cyan-950 text-[#0c6396] rounded-2xl flex items-center justify-center mx-auto border border-cyan-100/50">
                <Calendar size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Attendance Protocol
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Precision in attendance tracking ensures smooth payroll and resource management. Please record your entries and exits promptly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceModule
