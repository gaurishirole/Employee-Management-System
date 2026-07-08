export const employees = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 120000,
    joinDate: '2022-01-15',
    status: 'active',
    avatar: '👨‍💼'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 95000,
    joinDate: '2022-03-20',
    status: 'active',
    avatar: '👩‍💼'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    department: 'Sales',
    position: 'Sales Executive',
    salary: 80000,
    joinDate: '2021-06-10',
    status: 'active',
    avatar: '👨‍💼'
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    department: 'HR',
    position: 'HR Specialist',
    salary: 75000,
    joinDate: '2023-02-01',
    status: 'active',
    avatar: '👩‍💼'
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 100000,
    joinDate: '2023-04-15',
    status: 'active',
    avatar: '👨‍💼'
  },
]

export const departments = [
  { id: '1', name: 'Engineering', manager: 'John Doe', employeeCount: 2 },
  { id: '2', name: 'Marketing', manager: 'Jane Smith', employeeCount: 1 },
  { id: '3', name: 'Sales', manager: 'Bob Johnson', employeeCount: 1 },
  { id: '4', name: 'HR', manager: 'Alice Williams', employeeCount: 1 },
]

export const attendance = [
  { id: '1', employeeId: '1', date: '2024-01-15', status: 'present', checkIn: '09:00', checkOut: '17:30' },
  { id: '2', employeeId: '2', date: '2024-01-15', status: 'present', checkIn: '09:15', checkOut: '17:45' },
  { id: '3', employeeId: '3', date: '2024-01-15', status: 'absent', checkIn: null, checkOut: null },
  { id: '4', employeeId: '4', date: '2024-01-15', status: 'present', checkIn: '09:00', checkOut: '17:00' },
  { id: '5', employeeId: '5', date: '2024-01-15', status: 'late', checkIn: '10:00', checkOut: '18:00' },
]

export const leaves = [
  {
    id: '1',
    employeeId: '1',
    type: 'Annual Leave',
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    days: 5,
    status: 'approved',
    reason: 'Vacation'
  },
  {
    id: '2',
    employeeId: '2',
    type: 'Sick Leave',
    startDate: '2024-01-16',
    endDate: '2024-01-16',
    days: 1,
    status: 'pending',
    reason: 'Medical appointment'
  },
  {
    id: '3',
    employeeId: '3',
    type: 'Casual Leave',
    startDate: '2024-01-20',
    endDate: '2024-01-20',
    days: 1,
    status: 'approved',
    reason: 'Personal work'
  },
]

export const payroll = [
  {
    id: '1',
    employeeId: '1',
    month: 'January 2024',
    baseSalary: 120000,
    bonus: 5000,
    deductions: 15000,
    netSalary: 110000,
    status: 'paid'
  },
  {
    id: '2',
    employeeId: '2',
    month: 'January 2024',
    baseSalary: 95000,
    bonus: 0,
    deductions: 11000,
    netSalary: 84000,
    status: 'paid'
  },
  {
    id: '3',
    employeeId: '3',
    month: 'January 2024',
    baseSalary: 80000,
    bonus: 8000,
    deductions: 10000,
    netSalary: 78000,
    status: 'pending'
  },
]

export const performance = [
  {
    id: '1',
    employeeId: '1',
    rating: 4.5,
    period: 'Q4 2023',
    feedback: 'Excellent performance and leadership',
    reviewDate: '2024-01-10'
  },
  {
    id: '2',
    employeeId: '2',
    rating: 4.2,
    period: 'Q4 2023',
    feedback: 'Good campaign execution',
    reviewDate: '2024-01-12'
  },
  {
    id: '3',
    employeeId: '3',
    rating: 3.8,
    period: 'Q4 2023',
    feedback: 'Solid sales performance',
    reviewDate: '2024-01-14'
  },
]

export const getEmployeeById = (id) => {
  return employees.find(emp => emp.id === id)
}

export const getDepartmentById = (id) => {
  return departments.find(dept => dept.id === id)
}

export const getEmployeeByDepartment = (departmentName) => {
  return employees.filter(emp => emp.department === departmentName)
}

export const getEmployeeAttendance = (employeeId) => {
  return attendance.filter(att => att.employeeId === employeeId)
}

export const getEmployeeLeaves = (employeeId) => {
  return leaves.filter(leave => leave.employeeId === employeeId)
}

export const getEmployeePayroll = (employeeId) => {
  return payroll.filter(pay => pay.employeeId === employeeId)
}

export const getEmployeePerformance = (employeeId) => {
  return performance.find(perf => perf.employeeId === employeeId)
}
