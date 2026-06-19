import { z } from "zod";

export const employeeDepartments = [
  "engineering",
  "design",
  "sales",
  "support",
  "operations",
] as const;
export type EmployeeDepartment = (typeof employeeDepartments)[number];

export const employeeStatuses = ["active", "onleave", "contractor"] as const;
export type EmployeeStatus = (typeof employeeStatuses)[number];

export type Employee = {
  id: string;
  name: string;
  email: string;
  title: string;
  department: EmployeeDepartment;
  /** Manager's employee id, or "" for the top of the org. */
  managerId: string;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const employeeInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  title: z.string().min(1, "Title is required"),
  department: z.enum(employeeDepartments),
  managerId: z.string(),
  status: z.enum(employeeStatuses),
});
export type EmployeeInput = z.infer<typeof employeeInputSchema>;

export const employeeUpdateSchema = employeeInputSchema.extend({
  id: z.string().min(1),
});
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;

/** Onboarding wizard validation — a manager must be chosen. */
export const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  title: z.string().min(1, "Title is required"),
  department: z.enum(employeeDepartments),
  managerId: z.string().min(1, "Pick a manager"),
  status: z.enum(employeeStatuses),
});

export const employeeListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  department: z.string().optional().default(""),
});
export type EmployeeListParams = z.infer<typeof employeeListParamsSchema>;

export const allEmployeesParams: EmployeeListParams = {
  page: 1,
  pageSize: 200,
  search: "",
  department: "",
};
