import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Hardcoded users for demo (role-based auth)
const USERS = [
  {
    id: 'mgr-001',
    email: 'manager@crystal.com',
    password: 'manager123',
    name: 'Sarah Mitchell',
    role: 'manager',
    avatar: 'SM',
  },
  {
    id: 'emp-001',
    email: 'alice@crystal.com',
    password: 'emp123',
    name: 'Alice Johnson',
    role: 'employee',
    avatar: 'AJ',
    employeeId: 'emp-001',
  },
  {
    id: 'emp-002',
    email: 'bob@crystal.com',
    password: 'emp123',
    name: 'Bob Martinez',
    role: 'employee',
    avatar: 'BM',
    employeeId: 'emp-002',
  },
  {
    id: 'emp-003',
    email: 'carol@crystal.com',
    password: 'emp123',
    name: 'Carol Chen',
    role: 'employee',
    avatar: 'CC',
    employeeId: 'emp-003',
  },
  {
    id: 'emp-004',
    email: 'david@crystal.com',
    password: 'emp123',
    name: 'David Kim',
    role: 'employee',
    avatar: 'DK',
    employeeId: 'emp-004',
  },
  {
    id: 'emp-005',
    email: 'emily@crystal.com',
    password: 'emp123',
    name: 'Emily Watson',
    role: 'employee',
    avatar: 'EW',
    employeeId: 'emp-005',
  },
  {
    id: 'emp-006',
    email: 'frank@crystal.com',
    password: 'emp123',
    name: 'Frank Miller',
    role: 'employee',
    avatar: 'FM',
    employeeId: 'emp-006',
  },
  {
    id: 'emp-007',
    email: 'grace@crystal.com',
    password: 'emp123',
    name: 'Grace Lee',
    role: 'employee',
    avatar: 'GL',
    employeeId: 'emp-007',
  },
  {
    id: 'emp-008',
    email: 'henry@crystal.com',
    password: 'emp123',
    name: 'Henry Chen',
    role: 'employee',
    avatar: 'HC',
    employeeId: 'emp-008',
  },
  {
    id: 'emp-009',
    email: 'ivy@crystal.com',
    password: 'emp123',
    name: 'Ivy Taylor',
    role: 'employee',
    avatar: 'IT',
    employeeId: 'emp-009',
  },
  {
    id: 'emp-010',
    email: 'jack@crystal.com',
    password: 'emp123',
    name: 'Jack Robinson',
    role: 'employee',
    avatar: 'JR',
    employeeId: 'emp-010',
  },
  {
    id: 'emp-011',
    email: 'karen@crystal.com',
    password: 'emp123',
    name: 'Karen White',
    role: 'employee',
    avatar: 'KW',
    employeeId: 'emp-011',
  },
  {
    id: 'emp-012',
    email: 'leo@crystal.com',
    password: 'emp123',
    name: 'Leo Garcia',
    role: 'employee',
    avatar: 'LG',
    employeeId: 'emp-012',
  },
  {
    id: 'emp-013',
    email: 'mia@crystal.com',
    password: 'emp123',
    name: 'Mia Martinez',
    role: 'employee',
    avatar: 'MM',
    employeeId: 'emp-013',
  },
  {
    id: 'emp-014',
    email: 'nathan@crystal.com',
    password: 'emp123',
    name: 'Nathan Brown',
    role: 'employee',
    avatar: 'NB',
    employeeId: 'emp-014',
  },
  {
    id: 'emp-015',
    email: 'olivia@crystal.com',
    password: 'emp123',
    name: 'Olivia Davis',
    role: 'employee',
    avatar: 'OD',
    employeeId: 'emp-015',
  },
  {
    id: 'emp-016',
    email: 'paul@crystal.com',
    password: 'emp123',
    name: 'Paul Wilson',
    role: 'employee',
    avatar: 'PW',
    employeeId: 'emp-016',
  },
  {
    id: 'emp-017',
    email: 'quinn@crystal.com',
    password: 'emp123',
    name: 'Quinn Thompson',
    role: 'employee',
    avatar: 'QT',
    employeeId: 'emp-017',
  },
  {
    id: 'emp-018',
    email: 'rachel@crystal.com',
    password: 'emp123',
    name: 'Rachel Lopez',
    role: 'employee',
    avatar: 'RL',
    employeeId: 'emp-018',
  },
  {
    id: 'emp-019',
    email: 'samuel@crystal.com',
    password: 'emp123',
    name: 'Samuel Hill',
    role: 'employee',
    avatar: 'SH',
    employeeId: 'emp-019',
  },
  {
    id: 'emp-020',
    email: 'tina@crystal.com',
    password: 'emp123',
    name: 'Tina Scott',
    role: 'employee',
    avatar: 'TS',
    employeeId: 'emp-020',
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('crystal_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (email, password) => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('crystal_user', JSON.stringify(safeUser))
      return { success: true, user: safeUser }
    }
    return { success: false, message: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('crystal_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { USERS }
