import React from 'react'
import { BarChart, Briefcase } from 'lucide-react'

const ReportsModule = () => {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm text-center max-w-xl mx-auto mt-12 space-y-4">
      <div className="w-16 h-16 bg-cyan-500/10 text-[#0c6396] rounded-2xl flex items-center justify-center mx-auto">
        <BarChart size={28} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reports Module</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        This section is pre-configured for Master Administration. Details and analytics are currently managed from the system dashboard overview.
      </p>
    </div>
  )
}

export default ReportsModule
