import { z } from "zod";

// Define the Zod schema for project creation and updates
export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Project title is required")
    .max(100, "Project title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Project description is required")
    .max(500, "Project description must be less than 500 characters"),
  status: z
    .enum(["Pending", "In Progress", "Completed"], {
      errorMap: () => ({
        message:
          "Invalid status. Allowed values are: Pending, In Progress, Completed.",
      }),
    })
    .default("Pending"), // Default status is "Pending"
});
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Project title is required")
    .max(100, "Project title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Project description is required")
    .max(500, "Project description must be less than 500 characters"),
  createdBy: z
    .string()
    .regex(/^User-(\d+)$/, "createdBy must be in the format 'User-<number>'."),
});
