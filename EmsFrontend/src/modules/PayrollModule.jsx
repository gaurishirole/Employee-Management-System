import React, { useState, useEffect } from 'react'
import { DollarSign, CreditCard, User, Calendar, Info, FileText, Plus, CheckCircle, ArrowRight } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { apiFetch, getRolePrefix } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const PayrollModule = () => {
  const { toast } = useNotification()
  const { user } = useAuth()

  // Custom dynamic list for personnel including base salaries in INR
  const [personnelList, setPersonnelList] = useState([])
  const [loading, setLoading] = useState(true)

  // Ledger history
  const [ledger, setLedger] = useState([])

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        setLoading(true)
        const prefix = getRolePrefix(user?.role)
        const data = await apiFetch(`${prefix}/employees`).catch(() => [])

        // Map backend employee to personnel format
        const mapped = data.map(e => ({
          id: String(e.id),
          name: e.name,
          position: e.position || 'Associate',
          salary: Number(e.salary || 60000)
        }))
        setPersonnelList(mapped)
        if (mapped.length > 0) {
          setSelectedEmpId(mapped[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const fetchSalaries = async () => {
      try {
        const prefix = getRolePrefix(user?.role)
        const data = await apiFetch(`${prefix}/salary`).catch(() => [])
        setLedger(data)
      } catch (err) {
        console.error(err)
      }
    }

    if (user?.role) {
      fetchPersonnel()
      fetchSalaries()
    }
  }, [user?.role])

  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [month, setMonth] = useState('July')
  const [year, setYear] = useState('2026')
  const [bonus, setBonus] = useState('0')
  const [presentDays, setPresentDays] = useState(23) // Max working days
  const maxWorkingDays = 23

  const selectedEmp = personnelList.find(p => p.id === selectedEmpId) || personnelList[0] || { name: 'No Personnel', position: 'Associate', salary: 60000 }

  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [payslipData, setPayslipData] = useState(null)

  const handleOpenPayslip = (data) => {
    setPayslipData(data)
    setShowPayslipModal(true)
  }

  // Calculations
  const dailyRate = selectedEmp ? (selectedEmp.salary / maxWorkingDays) : 0
  const calculatedPayout = dailyRate * presentDays
  const bonusVal = Number(bonus) || 0
  const finalNetPayout = Math.round(calculatedPayout + bonusVal)
  const absences = maxWorkingDays - presentDays

  const handleCreditSalary = async () => {
    try {
      const prefix = getRolePrefix(user?.role)
      const payload = {
        personal: Number(selectedEmpId),
        month: month,
        year: Number(year),
        presentDay: presentDays,
        bonusAllocation: Number(bonus)
      }
      const response = await apiFetch(`${prefix}/salary/credit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      setLedger([response, ...ledger])
      setBonus('0')
      toast.success(`Successfully credited monthly salary of ₹${response.totalCredited.toLocaleString('en-IN')} to ${response.user?.name || selectedEmp.name}!`)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to credit salary')
    }
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-[#0c6396] border border-cyan-500/20 rounded-2xl shadow-sm">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Salary Disbursal
            </h1>
            <p className="text-xs text-[#0c6396]/80 font-semibold mt-1">
              Calculate and credit monthly compensation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form & Calculation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <CreditCard size={18} className="text-[#0c6396]" />
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Compensation Parameters</h3>
            </div>

            <div className="space-y-4">
              {/* Personnel Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Personnel
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value)
                    // Reset present days to max when employee changes
                    setPresentDays(maxWorkingDays)
                  }}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold"
                >
                  {personnelList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.position}) - ₹{p.salary.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month & Year Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold"
                  />
                </div>
              </div>

              {/* Present Days Slider - Interactive Compensation Calculator */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  <span>Present Days (Working Shift)</span>
                  <span className="text-[#0c6396] font-bold">{presentDays} / {maxWorkingDays} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxWorkingDays}
                  value={presentDays}
                  onChange={(e) => setPresentDays(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0c6396]"
                />
              </div>

              {/* Bonus input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Bonus Allocation (₹)
                  </label>
                  <input
                    type="number"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold"
                  />
                </div>

                <button
                  onClick={handleCreditSalary}
                  className="w-full py-3 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0c6396]/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CreditCard size={16} /> Credit Salary
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payout Calculation Summary Card */}
        <div className="lg:col-span-5 bg-[#0b4d6e] text-white rounded-3xl p-6.5 shadow-lg space-y-6 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
          {/* Subtle decoration vector */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Info size={16} className="text-[#38bdf8]" />
              <h3 className="font-extrabold text-sm tracking-wide">Calculated Payout</h3>
            </div>

            {/* Attendance metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-wider">Present</p>
                <p className="text-sm font-black mt-1">{presentDays} DAYS</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-wider">Absences</p>
                <p className="text-sm font-black mt-1">{absences} DAYS</p>
              </div>
            </div>

            {/* Rate list */}
            <div className="space-y-2 text-xs font-semibold text-slate-200">
              <div className="flex justify-between">
                <span>Daily Rate</span>
                <span className="font-bold">₹{dailyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated</span>
                <span className="font-bold">₹{Math.round(calculatedPayout).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Bonus</span>
                <span className="font-bold">₹{bonusVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Final Net Payout</span>
              <span className="text-2xl font-black text-white">₹{finalNetPayout.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => handleOpenPayslip({
                employeeName: selectedEmp.name,
                position: selectedEmp.position,
                baseSalary: selectedEmp.salary,
                presentDays,
                absences,
                dailyRate,
                calculatedPayout,
                bonus: bonusVal,
                finalNetPayout,
                period: `${month} ${year}`
              })}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#0b4d6e] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <FileText size={14} /> View Payslip Preview
            </button>
          </div>
        </div>

      </div>

      {/* Ledger History Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Calendar size={18} className="text-[#0c6396]" />
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Ledger History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] font-black text-[#0c6396] dark:text-[#38bdf8] uppercase tracking-wider border-b border-border/40 pb-3">
                <th className="pb-3 font-black">Employee</th>
                <th className="pb-3 font-black">Amount</th>
                <th className="pb-3 font-black">Period</th>
                <th className="pb-3 font-black">Credited On</th>
                <th className="pb-3 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ledger.map(entry => {
                const empName = entry.user?.name || entry.employeeName || 'Unknown';
                const amountVal = entry.totalCredited !== undefined ? entry.totalCredited : (entry.amount || 0);
                const periodVal = entry.period || `${entry.month?.toUpperCase()} ${entry.year}`;
                const dateVal = entry.creditedOn ? new Date(entry.creditedOn).toLocaleDateString('en-GB') : (entry.date || '');

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                    <td className="py-4 font-bold text-[#0c6396]">{empName}</td>
                    <td className="py-4 font-black text-slate-700 dark:text-slate-200">₹{amountVal.toLocaleString('en-IN')}</td>
                    <td className="py-4">
                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider bg-slate-50 text-slate-500 border border-slate-100 uppercase dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60">
                        {periodVal}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-semibold">{dateVal}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          const targetEmp = personnelList.find(p => p.name === empName) || personnelList.find(p => p.id === String(entry.userId)) || { position: 'Associate', salary: entry.baseSalary || 60000 };
                          
                          const payslipObj = {
                            employeeName: empName,
                            position: targetEmp.position,
                            baseSalary: entry.user?.salary || targetEmp.salary,
                            presentDays: entry.presentDays !== undefined && entry.presentDays !== null ? entry.presentDays : maxWorkingDays,
                            absences: entry.absentDays !== undefined && entry.absentDays !== null ? entry.absentDays : 0,
                            dailyRate: entry.dailyRate !== undefined && entry.dailyRate !== null ? entry.dailyRate : (targetEmp.salary / maxWorkingDays),
                            calculatedPayout: entry.baseSalary !== undefined && entry.baseSalary !== null ? entry.baseSalary : amountVal,
                            bonus: entry.bonus !== undefined && entry.bonus !== null ? entry.bonus : 0,
                            finalNetPayout: amountVal,
                            period: periodVal
                          };
                          handleOpenPayslip(payslipObj);
                        }}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-muted border border-border rounded-lg text-[9px] font-bold text-slate-500 cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <FileText size={12} /> Preview
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal Overlay */}
      {showPayslipModal && payslipData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 transform scale-100 transition-all duration-300">
            {/* Modal Header logo */}
            <div className="flex items-center justify-between border-b-2 border-[#0c6396] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0c6396] rounded-xl flex items-center justify-center text-white font-black text-sm">
                  T
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100 leading-tight">The DataTech Labs</h3>
                  <p className="text-[7px] text-slate-400 dark:text-slate-500 tracking-widest uppercase font-bold">HR Console &bull; Payslip</p>
                </div>
              </div>
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/50 uppercase">
                APPROVED
              </span>
            </div>

            {/* Payslip parameters */}
            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Employee Name</p>
                  <p className="text-slate-800 dark:text-slate-100 font-extrabold mt-0.5">{payslipData.employeeName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Designation</p>
                  <p className="text-slate-800 dark:text-slate-100 font-extrabold mt-0.5">{payslipData.position}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Statement Period</p>
                  <p className="text-[#0c6396] font-extrabold mt-0.5">{payslipData.period}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Working Shifts</p>
                  <p className="text-slate-800 dark:text-slate-100 font-extrabold mt-0.5">{payslipData.presentDays} Present / {payslipData.absences} Absent</p>
                </div>
              </div>

              {/* Financial table */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Basic Base Salary</span>
                  <span className="font-extrabold">₹{payslipData.baseSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Calculated Attendance Wage</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-200">₹{Math.round(payslipData.calculatedPayout).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Bonus Credit</span>
                  <span className="font-extrabold text-emerald-600">₹{payslipData.bonus.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Loss of Pay (LWP)</span>
                  <span className="font-extrabold text-rose-500">-₹{Math.round(payslipData.baseSalary - payslipData.calculatedPayout).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800/80 pt-4 text-base font-black">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Net Credit</span>
                  <span className="text-[#0c6396] dark:text-[#38bdf8] text-xl">₹{payslipData.finalNetPayout.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => {
                  window.print()
                  toast.success('Payslip queued for print/PDF export!')
                }}
                className="flex-1 py-3 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Print Payslip
              </button>
              <button
                onClick={() => setShowPayslipModal(false)}
                className="px-6 py-3 border border-border text-slate-500 hover:bg-muted text-xs font-bold rounded-xl transition-all cursor-pointer bg-card"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default PayrollModule
