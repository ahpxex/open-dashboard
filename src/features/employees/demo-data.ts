import type { Employee, EmployeeDepartment, EmployeeStatus } from "./schema";

type Seed = {
  id: string;
  name: string;
  title: string;
  department: EmployeeDepartment;
  managerId: string;
  status: EmployeeStatus;
};

const SEED: Seed[] = [
  {
    id: "emp_1",
    name: "Dana West",
    title: "CEO",
    department: "operations",
    managerId: "",
    status: "active",
  },
  {
    id: "emp_2",
    name: "Sam Rivera",
    title: "VP Engineering",
    department: "engineering",
    managerId: "emp_1",
    status: "active",
  },
  {
    id: "emp_3",
    name: "Robin Park",
    title: "Head of Design",
    department: "design",
    managerId: "emp_1",
    status: "active",
  },
  {
    id: "emp_4",
    name: "Maya Flores",
    title: "VP Sales",
    department: "sales",
    managerId: "emp_1",
    status: "active",
  },
  {
    id: "emp_5",
    name: "Noa Cohen",
    title: "Staff Engineer",
    department: "engineering",
    managerId: "emp_2",
    status: "active",
  },
  {
    id: "emp_6",
    name: "Diego Alvarez",
    title: "Senior Engineer",
    department: "engineering",
    managerId: "emp_2",
    status: "onleave",
  },
  {
    id: "emp_7",
    name: "Hana Kim",
    title: "Engineer",
    department: "engineering",
    managerId: "emp_5",
    status: "active",
  },
  {
    id: "emp_8",
    name: "Tomas Novak",
    title: "Engineer",
    department: "engineering",
    managerId: "emp_5",
    status: "contractor",
  },
  {
    id: "emp_9",
    name: "Sofia Marin",
    title: "Product Designer",
    department: "design",
    managerId: "emp_3",
    status: "active",
  },
  {
    id: "emp_10",
    name: "Yara Haddad",
    title: "Brand Designer",
    department: "design",
    managerId: "emp_3",
    status: "active",
  },
  {
    id: "emp_11",
    name: "Jordan Lee",
    title: "Account Executive",
    department: "sales",
    managerId: "emp_4",
    status: "active",
  },
  {
    id: "emp_12",
    name: "Priya Nair",
    title: "Account Executive",
    department: "sales",
    managerId: "emp_4",
    status: "onleave",
  },
  {
    id: "emp_13",
    name: "Amara Okafor",
    title: "Support Lead",
    department: "support",
    managerId: "emp_1",
    status: "active",
  },
  {
    id: "emp_14",
    name: "Lucas Müller",
    title: "Support Specialist",
    department: "support",
    managerId: "emp_13",
    status: "active",
  },
];

export const demoEmployees: Employee[] = SEED.map((row) => {
  const handle = row.name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: row.id,
    name: row.name,
    email: `${handle}@taoracle.io`,
    title: row.title,
    department: row.department,
    managerId: row.managerId,
    status: row.status,
    createdAt: new Date(2025, 5, 1),
    updatedAt: new Date(2026, 4, 1),
  };
});
