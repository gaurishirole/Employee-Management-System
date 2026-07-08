import React from 'react'

// 1. Dashboard Shell Skeleton
export const DashboardShellSkeleton = () => {
  return (
    <div className="h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground flex overflow-hidden font-sans animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="bg-card border-r border-border w-64 flex flex-col justify-between flex-shrink-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-20 border-b border-border flex items-center px-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60">
                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card flex-shrink-0">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-40"></div>
          <div className="flex items-center gap-4">
            <div className="h-4 bg-slate-100 dark:bg-slate-900 w-44 rounded-md hidden sm:block"></div>
            <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800"></span>
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-3xl p-8 flex flex-col justify-between shadow-sm min-h-[160px]">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded-xl w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6 min-h-[300px]">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-36"></div>
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3"></div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full w-full"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6 min-h-[300px]">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-36"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-28"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. Table / List Directory Skeleton
export const ListTableSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search Header Bar Skeleton */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full md:w-96"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-32"></div>
      </div>

      {/* Main Table Skeleton */}
      <div className="bg-card border border-border/40 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-40"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/60">
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="pb-4"><div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, r) => (
                <tr key={r} className="border-b border-border/40 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0"></div>
                      <div className="space-y-1.5">
                        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-28"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-36"></div></td>
                  <td className="py-4"><div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div></td>
                  <td className="py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 3. Profile Details Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Profile Header Card */}
      <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl flex-shrink-0"></div>
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="h-7 bg-slate-300 dark:bg-slate-700 rounded-xl w-48 mx-auto md:mx-0"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32 mx-auto md:mx-0"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24 mx-auto md:mx-0"></div>
        </div>
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-36 border-b pb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
                  <div className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded-md w-40"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 4. Hiring Pipeline (Kanban Board) Skeleton
export const HiringPipelineSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search Header */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 flex justify-between items-center shadow-sm">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-48"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-36"></div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, c) => (
          <div key={c} className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-5 border border-border/20 min-h-[500px] space-y-4">
            {/* Column Header */}
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-24"></div>
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            {/* Column Cards */}
            {[...Array(c === 0 ? 3 : c === 1 ? 2 : 1)].map((_, card) => (
              <div key={card} className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-3/4"></div>
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2"></div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-14"></div>
                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// 5. Salary / Payroll Disbursal Skeleton
export const SalarySkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      {/* Parameter Selection panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-40"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-full w-full mt-4"></div>
        </div>

        {/* Ledger History List Skeleton */}
        <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-32 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3.5 border-b border-border/40 last:border-0">
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-24"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
              </div>
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculated Payout Side Card Skeleton */}
      <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm h-fit space-y-6">
        <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-36"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="space-y-4 pt-4 border-t border-border/40">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
              <div className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded-md w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 6. Letter Generator Skeleton
export const LetterSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      {/* Configuration Form */}
      <div className="lg:col-span-5 bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-40"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Screen */}
      <div className="lg:col-span-7 bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6 min-h-[500px]">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded-md w-36"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-dashed border-border/80 rounded-2xl p-8 flex flex-col justify-between min-h-[400px]">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-20 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="space-y-2 text-right">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-28 ml-auto"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20 ml-auto"></div>
              </div>
            </div>
            <div className="space-y-3 pt-8">
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-md w-40"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
            </div>
          </div>
          <div className="flex justify-between items-end pt-8">
            <div className="space-y-2">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-28"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-28"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 7. General Module skeleton fallbacks
export const GeneralModuleSkeleton = () => {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm space-y-6 max-w-xl mx-auto mt-12 animate-pulse">
      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto"></div>
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded-md w-40 mx-auto"></div>
      <div className="space-y-2.5">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6 mx-auto"></div>
      </div>
    </div>
  )
}

// Main Selector Component based on Active Pathname
const ModuleSkeleton = ({ pathname }) => {
  if (!pathname || pathname === '/dashboard' || pathname === '/dashboard/') {
    return <DashboardShellSkeleton />
  }
  if (pathname.includes('/employees') || pathname.includes('/leaders') || pathname.includes('/hrs') || pathname.includes('/admins') || pathname.includes('/contact') || pathname.includes('/leave') || pathname.includes('/attendance') || pathname.includes('/my-attendance') || pathname.includes('/my-leaves')) {
    return <ListTableSkeleton />
  }
  if (pathname.includes('/profile')) {
    return <ProfileSkeleton />
  }
  if (pathname.includes('/hiring')) {
    return <HiringPipelineSkeleton />
  }
  if (pathname.includes('/payroll')) {
    return <SalarySkeleton />
  }
  if (pathname.includes('/generate-letter')) {
    return <LetterSkeleton />
  }
  return <GeneralModuleSkeleton />
}

export default ModuleSkeleton
