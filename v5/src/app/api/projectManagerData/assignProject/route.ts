import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import { getToken, GetUserType } from "@/utils/token";
import Team from "@/models/Team";
import AssignedProjectLog from "@/models/AssignedProjectLogs"; // Import the AssignedProjectLogs model
import { assignedProjectLogSchema } from "@/schemas/assignedProjectLogSchema";
export async function POST(req: NextRequest) {
  try {
    // Validate the token
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    // Check if the user is a ProjectManager
    const userType = await GetUserType(token);
    if (!userType || userType !== "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. You are not a Project Manager.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Extract projectId, teamId, and deadline from the request body
    const { projectId, teamId, deadline } = await req.json();

    // Validate projectId and teamId
    if (!projectId || !teamId || !deadline) {
      return NextResponse.json(
        {
          success: false,
          message: "Project ID, Team ID, and Deadline are required.",
        },
        { status: 400 }
      );
    }

    // Fetch the project to verify existence
    const project = await Project.findOne({ ProjectId: projectId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }
    // Validate deadline format
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid deadline format." },
        { status: 400 }
      );
    }
    // Construct assignment data, using project.createdBy for assignedBy
    const assignmentData = {
      projectId,
      teamId,
      assignedBy: project.createdBy,
      deadline,
    };

    // Validate the assignment data using the Zod schema
    const parsedAssignment = assignedProjectLogSchema.safeParse(assignmentData);
    if (!parsedAssignment.success) {
      const errorMessages = parsedAssignment.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { success: false, message: errorMessages },
        { status: 400 }
      );
    }

    //Check if the project is already assigned in the AssignedProjectLogs collection
    const existingAssignment = await AssignedProjectLog.findOne({ projectId });
    if (existingAssignment) {
      return NextResponse.json(
        { success: false, message: "Project is already assigned to a team." },
        { status: 400 }
      );
    }

    // Fetch the team to verify existence
    const team = await Team.findOne({ teamId: teamId });
    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found." },
        { status: 404 }
      );
    }

    // Create a new AssignedProjectLog to log the project assignment
    const assignedLog = new AssignedProjectLog({
      projectId,
      teamId,
      assignedBy: project.createdBy, // Assuming the project manager's userId is stored here
      deadline: parsedDeadline, // Save the deadline from the request
    });

    await assignedLog.save();
    return NextResponse.json(
      { success: true, message: "Project assigned successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error assigning project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign project." },
      { status: 500 }
    );
  }
}
