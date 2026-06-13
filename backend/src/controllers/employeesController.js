// Hardcoded employee list (matches frontend AuthContext users)
export const EMPLOYEES = [
  { id: 'emp-001', name: 'Alice Johnson', email: 'alice@crystal.com', department: 'Engineering' },
  { id: 'emp-002', name: 'Bob Martinez', email: 'bob@crystal.com', department: 'Marketing' },
  { id: 'emp-003', name: 'Carol Chen', email: 'carol@crystal.com', department: 'Design' },
  { id: 'emp-004', name: 'David Kim', email: 'david@crystal.com', department: 'Product' },
  { id: 'emp-005', name: 'Emily Watson', email: 'emily@crystal.com', department: 'Sales' },
  { id: 'emp-006', name: 'Frank Miller', email: 'frank@crystal.com', department: 'Operations' },
  { id: 'emp-007', name: 'Grace Lee', email: 'grace@crystal.com', department: 'HR' },
  { id: 'emp-008', name: 'Henry Chen', email: 'henry@crystal.com', department: 'Engineering' },
  { id: 'emp-009', name: 'Ivy Taylor', email: 'ivy@crystal.com', department: 'Marketing' },
  { id: 'emp-010', name: 'Jack Robinson', email: 'jack@crystal.com', department: 'Design' },
  { id: 'emp-011', name: 'Karen White', email: 'karen@crystal.com', department: 'Product' },
  { id: 'emp-012', name: 'Leo Garcia', email: 'leo@crystal.com', department: 'Sales' },
  { id: 'emp-013', name: 'Mia Martinez', email: 'mia@crystal.com', department: 'Operations' },
  { id: 'emp-014', name: 'Nathan Brown', email: 'nathan@crystal.com', department: 'Engineering' },
  { id: 'emp-015', name: 'Olivia Davis', email: 'olivia@crystal.com', department: 'Marketing' },
  { id: 'emp-016', name: 'Paul Wilson', email: 'paul@crystal.com', department: 'Design' },
  { id: 'emp-017', name: 'Quinn Thompson', email: 'quinn@crystal.com', department: 'Product' },
  { id: 'emp-018', name: 'Rachel Lopez', email: 'rachel@crystal.com', department: 'Sales' },
  { id: 'emp-019', name: 'Samuel Hill', email: 'samuel@crystal.com', department: 'Operations' },
  { id: 'emp-020', name: 'Tina Scott', email: 'tina@crystal.com', department: 'HR' },
]

/**
 * GET /api/employees
 * Returns list of all employees
 */
export async function getEmployees(req, res) {
  res.json({ employees: EMPLOYEES, total: EMPLOYEES.length })
}
