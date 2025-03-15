import { z } from "zod";

export const assignedProjectLogSchema = z.object({
  projectId: z
    .string()
    .regex(
      /^Project-(\d+)$/,
      "Project ID must be in the format 'Project-<number>'."
    ),
  teamId: z
    .string()
    .regex(/^Team-(\d+)$/, "Team ID must be in the format 'Team-<number>'."),
  assignedBy: z
    .string()
    .regex(
      /^User-(\d+)$/,
      "Assigner ID must be in the format 'User-<number>'."
    ),
  deadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for deadline.",
    })
    .transform((val) => new Date(val)),
});
