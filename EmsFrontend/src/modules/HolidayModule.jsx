import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Info, Clock } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { apiFetch, getRolePrefix } from '../utils/api'

const HolidayModule = () => {
  const { user } = useAuth()
  const { toast } = useNotification()
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1))
  const [holidays, setHolidays] = useState([])
  const [eventDate, setEventDate] = useState('')
  const [reason, setReason] = useState('')

  const prefix = getRolePrefix(user?.role)

  const fetchHolidays = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endStr = `${year}-${String(month + 1).padStart(2, '0')}-31`
      const data = await apiFetch(`${prefix}/holidays?start=${startStr}&end=${endStr}`).catch(() => [])
      setHolidays(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user?.role) {
      fetchHolidays()
    }
  }, [user?.role, currentDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleAddHoliday = async () => {
    if (!eventDate || !reason) {
      toast.error('Please fill in both the event date and reason.')
      return
    }
    
    try {
      await apiFetch(`${prefix}/holidays`, {
        method: 'POST',
        body: JSON.stringify({
          date: eventDate,
          description: reason
        })
      })
      toast.success('Holiday added successfully!')
      setEventDate('')
      setReason('')
      fetchHolidays()
    } catch (err) {
      toast.error(err.message || 'Failed to add holiday')
    }
  }

  const generateDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = []
    
    // Day of week for 1st of month (0 = Sun, 6 = Sat)
    const firstDay = new Date(year, month, 1).getDay()
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null })
    }
    
    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(year, month, i).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const customHoliday = holidays.find(h => h.date === dateStr && h.type !== 'WEEKEND')
      
      days.push({
        day: i,
        isWeekend: isWeekend,
        isHoliday: !!customHoliday,
        reason: customHoliday ? customHoliday.description : ''
      })
    }
    return days
  }
  
  const currentDays = generateDays()
  const displayMonth = currentDate.toLocaleString('default', { month: 'long' })
  const displayYear = currentDate.getFullYear()

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-[#0c6396] dark:text-[#38bdf8]">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Holiday Registry
            </h1>
            <p className="text-xs text-[#0c6396]/80 font-semibold mt-1">
              Define organizational holidays and manage weekend cycles.
            </p>
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-4 bg-card border border-border/80 px-4 py-2 rounded-2xl shadow-sm">
          <button onClick={handlePrevMonth} className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-[#0c6396] dark:text-[#38bdf8] tracking-wider w-24 text-center">
            {displayMonth} {displayYear}
          </span>
          <button onClick={handleNextMonth} className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Widget Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            {/* Grid of Calendar Days */}
            <div className="grid grid-cols-7 gap-3 text-center">
              {weekdays.map(day => (
                <div key={day} className="text-[10px] font-extrabold text-[#0c6396] tracking-wider py-2 uppercase">
                  {day}
                </div>
              ))}

              {currentDays.map((d, index) => {
              if (d.day === null) {
                return <div key={`empty-${index}`} className="aspect-square bg-transparent"></div>
              }

              return (
                <div 
                  key={`day-${d.day}`}
                  className={`aspect-[4/3] rounded-2xl flex flex-col justify-between p-2.5 transition-all shadow-sm border relative ${
                    d.isWeekend
                      ? 'bg-[#fb9898] border-[#fb9898] shadow-md shadow-red-500/10'
                      : d.isHoliday
                      ? 'bg-red-500 border-red-500 shadow-md shadow-red-500/20'
                      : 'bg-card border-slate-100 dark:border-slate-800/20'
                  }`}
                >
                  <span className={`text-xs font-extrabold text-left ${
                    d.isWeekend || d.isHoliday
                      ? 'text-white'
                      : 'text-[#0c6396] dark:text-slate-300'
                  }`}>
                    {d.day}
                  </span>

                  {d.isHoliday && (
                    <span className="text-[8px] font-black text-white/90 tracking-wide uppercase text-left mt-auto leading-tight">
                      {d.reason}
                    </span>
                  )}
                  {d.isWeekend && !d.isHoliday && (
                    <span className="text-[8px] font-black text-red-900 tracking-wide uppercase text-left mt-auto">
                      WEEKEND
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Auto-Notifications Banner */}
        <div className="bg-[#126588] rounded-[24px] p-5 shadow-sm flex items-center justify-between overflow-hidden relative border border-[#1a769d]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
              <Info size={24} />
            </div>
            <div className="text-white">
              <h4 className="text-[15px] font-black tracking-tight drop-shadow-sm text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]">Auto-Notifications Active</h4>
              <p className="text-[11px] text-white/90 font-bold mt-0.5 tracking-wide">All employees will be alerted of new holiday scheduling.</p>
            </div>
          </div>
          <Clock size={56} className="text-[#0c4e6a]/40 absolute -right-3 top-1/2 -translate-y-1/2 z-0 stroke-[1.5]" />
        </div>
      </div>

        {/* Right Forms */}
        <div className="space-y-6">
          {/* Provision Holiday Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Plus size={18} className="text-[#0c6396]" />
              <h2 className="text-[14px] font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
                Provision Holiday
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                  EVENT DATE
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-[#0c6396]/70 dark:text-[#38bdf8]/70 tracking-widest uppercase mb-1.5">
                  REASON / DESCRIPTION
                </label>
                <textarea
                  placeholder="e.g. Annual Summit"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-slate-50/50 dark:bg-slate-900/60 text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 text-xs font-semibold resize-none"
                />
              </div>

              <button onClick={handleAddHoliday} className="w-full py-3 mt-2 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-black shadow-md shadow-[#0c6396]/20 transition-all cursor-pointer flex items-center justify-center gap-2">
                <Plus size={16} /> Add to Calendar
              </button>
            </div>
          </div>

          {/* Calendar Key Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-[#0c6396] tracking-widest uppercase mb-6">
              CALENDAR KEY
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
                <span className="text-xs font-bold text-[#0c6396]">Statutory Holiday</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full border border-slate-200 bg-white dark:bg-transparent"></span>
                <span className="text-xs font-bold text-cyan-500">Regular Working Day</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#fb9898] shadow-sm"></span>
                <span className="text-xs font-bold text-[#0c6396]/70">Weekend Cycle</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex gap-2 text-[8px] font-black text-cyan-500/80 uppercase tracking-wider leading-relaxed">
              <Info size={12} className="flex-shrink-0" />
              <span>
                WEEKEND CYCLES ARE AUTOMATICALLY CALCULATED BASED ON ORGANIZATIONAL POLICY AND CANNOT BE MANUALLY MODIFIED.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HolidayModule
