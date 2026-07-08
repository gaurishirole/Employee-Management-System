import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ShieldAlert, ShieldCheck, Eye, FileText, User, ArrowLeft, ChevronRight, Search, ArrowRight } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { apiFetch, getRolePrefix } from '../utils/api'

const ProfileVerificationModule = () => {
  const { toast } = useNotification()
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmp, setSelectedEmp] = useState(null)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('ALL') // ALL, PENDING, VERIFIED

  const prefix = getRolePrefix(user?.role)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      // Attempt to load employees who uploaded documents
      let data = await apiFetch(`${prefix}/verification/employees`).catch(() => [])
      
      // If none have documents uploaded yet, fetch all employees so we have a directory to view
      if (data.length === 0) {
        const allEmp = await apiFetch(`${prefix}/employees`).catch(() => [])
        data = allEmp.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          role: e.role,
          position: e.position || 'Associate',
          department: e.department || 'General',
          profileVerified: e.profileVerified || false,
          documents: e.documents || {},
          avatar: '👤'
        }))
      }
      setEmployees(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load verification directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role) {
      fetchEmployees()
    }
  }, [user?.role])

  const handleVerifyDoc = async (empId, docField, currentVerified) => {
    try {
      const endpoint = `${prefix}/verification/${empId}/document/${docField}${currentVerified ? '/unverify' : ''}`
      // The backend verify route expects body: { verified: true } for verify, and a separate unverify route
      if (currentVerified) {
        await apiFetch(endpoint, { method: 'PATCH' })
      } else {
        await apiFetch(endpoint, {
          method: 'PATCH',
          body: JSON.stringify({ verified: true })
        })
      }
      toast.success(`Document status updated successfully!`)
      // Refresh list
      let data = await apiFetch(`${prefix}/verification/employees`).catch(() => [])
      if (data.length === 0) {
        const allEmp = await apiFetch(`${prefix}/employees`).catch(() => [])
        data = allEmp.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          role: e.role,
          position: e.position || 'Associate',
          department: e.department || 'General',
          profileVerified: e.profileVerified || false,
          documents: e.documents || {},
          avatar: '👤'
        }))
      }
      setEmployees(data)
      if (selectedEmp && selectedEmp.id === empId) {
        setSelectedEmp(data.find(e => e.id === empId))
      }
    } catch (err) {
      toast.error(err.message || 'Action failed')
    }
  }

  const handleVerifyProfile = async (empId) => {
    try {
      // Loop over document fields and verify them
      const docFields = [
        "passportPhoto",
        "tenthMarksheet",
        "twelthDiplomaMarksheet",
        "graduationMarksheet",
        "bankPassbookPhoto",
        "aadharFront",
        "aadharBack",
        "panCard",
        "cv",
      ];
      for (const field of docFields) {
        if (selectedEmp.documents?.[field] && !selectedEmp.documents?.[field].verified) {
          await apiFetch(`${prefix}/verification/${empId}/document/${field}`, {
            method: 'PATCH',
            body: JSON.stringify({ verified: true })
          }).catch(() => {})
        }
      }
      toast.success('All documents verified successfully!')
      fetchEmployees()
      if (selectedEmp) {
        setSelectedEmp(prev => ({ ...prev, profileVerified: true }))
      }
    } catch (err) {
      toast.error('Verification failed')
    }
  }

  const handleRejectProfile = async (empId) => {
    try {
      const docFields = [
        "passportPhoto",
        "tenthMarksheet",
        "twelthDiplomaMarksheet",
        "graduationMarksheet",
        "bankPassbookPhoto",
        "aadharFront",
        "aadharBack",
        "panCard",
        "cv",
      ];
      for (const field of docFields) {
        if (selectedEmp.documents?.[field] && selectedEmp.documents?.[field].verified) {
          await apiFetch(`${prefix}/verification/${empId}/document/${field}/unverify`, {
            method: 'PATCH'
          }).catch(() => {})
        }
      }
      toast.success('All documents unverified!')
      fetchEmployees()
      if (selectedEmp) {
        setSelectedEmp(prev => ({ ...prev, profileVerified: false }))
      }
    } catch (err) {
      toast.error('Action failed')
    }
  }

  // Filter & Search Logic
  const filteredEmployees = employees.filter(emp => {
    const name = emp.name || ''
    const pos = emp.position || ''
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pos.toLowerCase().includes(searchQuery.toLowerCase())
    
    const isVerified = emp.profileVerified || false
    if (filterTab === 'PENDING') {
      return matchesSearch && !isVerified
    }
    if (filterTab === 'VERIFIED') {
      return matchesSearch && isVerified
    }
    return matchesSearch
  })

  const docDefinitions = [
    { id: 'passportPhoto', name: 'PROFILE PHOTOGRAPH' },
    { id: 'tenthMarksheet', name: '10TH MARKSHEET' },
    { id: 'twelthDiplomaMarksheet', name: '12TH/DIPLOMA' },
    { id: 'graduationMarksheet', name: 'GRADUATION CERT' },
    { id: 'bankPassbookPhoto', name: 'BANK PASSBOOK' },
    { id: 'aadharFront', name: 'AADHAR FRONT' },
    { id: 'aadharBack', name: 'AADHAR BACK' },
    { id: 'panCard', name: 'PAN CARD' },
    { id: 'cv', name: 'PROFESSIONAL CV' }
  ]

  const mappedDocuments = selectedEmp ? docDefinitions.map(doc => {
    const dbDoc = selectedEmp.documents?.[doc.id]
    return {
      id: doc.id,
      name: doc.name,
      status: dbDoc ? (dbDoc.verified ? 'Verified' : 'Pending Verification') : 'Not Uploaded',
      file: dbDoc?.path ? dbDoc.path.split('/').pop() : 'No File',
      verified: dbDoc?.verified || false,
      uploaded: !!dbDoc?.path,
      path: dbDoc?.path
    }
  }) : []

  return (
    <div className="w-full space-y-6 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-50 text-[#0c6396] rounded-full shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
            Identity Verification
          </h1>
          <p className="text-xs text-cyan-500 font-bold mt-0.5">
            Audit and authorize personnel documentation and credentials.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Directory & Right Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Personnel Directory Card */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
            />
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-3 bg-slate-50 p-1 rounded-xl border border-slate-100 text-center text-[10px] font-black tracking-wider text-slate-400">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${filterTab === 'ALL' ? 'bg-white text-[#0c6396] shadow-sm font-bold' : ''}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${filterTab === 'PENDING' ? 'bg-white text-[#0c6396] shadow-sm font-bold' : ''}`}
            >
              PENDING
            </button>
            <button
              onClick={() => setFilterTab('VERIFIED')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${filterTab === 'VERIFIED' ? 'bg-white text-[#0c6396] shadow-sm font-bold' : ''}`}
            >
              VERIFIED
            </button>
          </div>

          {/* Personnel List */}
          <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-slate-50 pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                Loading directory...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No personnel matches
              </div>
            ) : (
              filteredEmployees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all hover:bg-slate-50/70 ${
                    selectedEmp?.id === emp.id ? 'bg-[#0c6396]/5 border border-[#0c6396]/20' : 'border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emp.avatar || '👤'}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-700 text-xs">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{emp.position || 'Employee'}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Credential Details Panel */}
        <div className="lg:col-span-8">
          {!selectedEmp ? (
            /* Awaiting Selection Empty State matching the mockup image */
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-16 h-full flex flex-col items-center justify-center text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mx-auto shadow-sm">
                <User size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#0c6396] tracking-tight">Awaiting Selection</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select a member from the personnel directory to initiate the credential audit process.
                </p>
              </div>
              <button 
                onClick={() => filteredEmployees.length > 0 && setSelectedEmp(filteredEmployees[0])}
                className="text-xs font-black text-[#0c6396] hover:text-[#0a527c] transition-colors flex items-center gap-1 mx-auto cursor-pointer"
              >
                Select Member <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* Detailed Credentials Audit View */
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{selectedEmp.avatar || '👤'}</span>
                  <div>
                    <h3 className="font-black text-slate-800 text-base leading-snug">{selectedEmp.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold">{selectedEmp.position} &bull; {selectedEmp.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase ${
                    selectedEmp.profileVerified
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {selectedEmp.profileVerified ? 'Verified' : 'Pending Verification'}
                  </span>

                  {!selectedEmp.profileVerified ? (
                    <button
                      onClick={() => handleVerifyProfile(selectedEmp.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Verify Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRejectProfile(selectedEmp.id)}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Reject Verification
                    </button>
                  )}
                </div>
              </div>

              {/* Submitted Credentials Checklist Grid */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-800 text-sm">Submitted Credentials Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mappedDocuments.map(doc => (
                    <div key={doc.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-32 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{doc.name}</span>
                        <span className={`text-[8px] font-black border px-2 py-0.5 rounded-full ${
                          doc.verified 
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                            : doc.uploaded 
                            ? 'text-amber-600 bg-amber-50 border-amber-100' 
                            : 'text-slate-450 bg-slate-100 border-slate-200'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                        <span className="text-[9px] text-slate-400 truncate max-w-[100px] font-medium" title={doc.file}>{doc.file}</span>
                        {doc.uploaded && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => doc.path ? window.open(doc.path, '_blank') : toast.info(`File path: ${doc.file}`)}
                              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[#0c6396] transition-colors cursor-pointer flex items-center gap-1 text-[9px] font-bold shadow-sm"
                            >
                              <Eye size={12} /> Inspect
                            </button>
                            <button 
                              onClick={() => handleVerifyDoc(selectedEmp.id, doc.id, doc.verified)}
                              className={`p-1.5 rounded-lg border text-[9px] font-bold shadow-sm transition-colors cursor-pointer ${
                                doc.verified 
                                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {doc.verified ? 'Unverify' : 'Verify'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ProfileVerificationModule
