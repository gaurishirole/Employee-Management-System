import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, MapPin, ExternalLink, PhoneCall, Filter, Briefcase, ArrowRight, User } from 'lucide-react'
import { apiFetch, getRolePrefix } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const ContactEmployeeModule = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState([])

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        const prefix = getRolePrefix(user?.role)
        const data = await apiFetch(`${prefix}/employees`).catch(() => [])
        setEmployees(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.role) {
      fetchEmployees()
    }
  }, [user?.role])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (!searchTerm.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const filtered = employees.filter(emp => {
      const name = emp.name || ''
      const email = emp.email || ''
      const pos = emp.position || ''
      const dept = emp.department || ''
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             pos.toLowerCase().includes(searchTerm.toLowerCase()) ||
             dept.toLowerCase().includes(searchTerm.toLowerCase())
    })
    setResults(filtered)
    setHasSearched(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full space-y-6 pb-12 px-4 md:px-0">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 text-[#0c6396] rounded-full shadow-sm">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Contact Employee
            </h1>
            <p className="text-[10px] font-black text-cyan-500 tracking-wider uppercase mt-0.5">
              Search & Contact Personnel
            </p>
          </div>
        </div>

        {/* HR Access Badge */}
        <span className="self-start sm:self-center px-3 py-1 bg-cyan-50 text-[9px] font-black text-[#0c6396] rounded-full uppercase tracking-wider border border-cyan-100/50">
          🛡️ HR Access — Organization Wide
        </span>
      </div>

      {/* 1. Search Bar Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (!e.target.value.trim()) {
                  setResults([])
                  setHasSearched(false)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by Name, Email, Phone, or Department..."
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-[#0c6396] hover:bg-[#094c72] text-white rounded-xl text-xs font-black shadow-md shadow-[#0c6396]/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRight size={14} /> SEARCH
          </button>
        </form>
      </div>

      {/* 2. Personnel Directory Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        
        {/* Sub-header */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-[#0c6396]" />
            <h3 className="font-extrabold text-[#0c6396] text-sm">Personnel Directory</h3>
          </div>
          <span className="px-2.5 py-0.5 bg-cyan-50 text-[#0c6396] text-[8px] font-black rounded-full uppercase tracking-wider">
            Filter Search
          </span>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[10px] font-black text-[#0c6396] tracking-wider uppercase">
                <th className="px-6 py-4 rounded-l-2xl">Employee Identity</th>
                <th className="px-6 py-4">Contact Information</th>
                <th className="px-6 py-4">Location & Tenure</th>
                <th className="px-6 py-4 rounded-r-2xl">Status / Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase">
                      Loading registry database...
                    </p>
                  </td>
                </tr>
              ) : !hasSearched ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <p className="text-[11px] font-black text-slate-300 tracking-widest uppercase italic">
                      Enter a name, email, or phone to search
                    </p>
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <p className="text-xs font-bold text-slate-400">
                      No matching records found
                    </p>
                  </td>
                </tr>
              ) : (
                results.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-50 text-xs hover:bg-[#f8fafc]/50 transition-colors">
                    {/* Identity */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <span className="text-2xl">{emp.avatar || '👤'}</span>
                      <div>
                        <p className="font-extrabold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{emp.position}</p>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" /> {emp.email}
                        </p>
                        <p className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" /> {emp.phone || '+91 98765 43210'}
                        </p>
                      </div>
                    </td>

                    {/* Location & Tenure */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" /> {emp.address || 'Pune, India'}
                        </p>
                        <p className="text-slate-400 font-semibold">
                          Since {emp.joinDate ? emp.joinDate.split('T')[0] : '2026-06-04'}
                        </p>
                      </div>
                    </td>

                    {/* Status & Department */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase bg-emerald-50 text-emerald-600 border-emerald-100`}>
                          active
                        </span>
                        <span className="text-[9px] text-[#0c6396] font-black bg-[#0c6396]/5 px-2 py-0.5 rounded border border-[#0c6396]/10 uppercase tracking-wide">
                          {emp.department || 'Engineering'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default ContactEmployeeModule
