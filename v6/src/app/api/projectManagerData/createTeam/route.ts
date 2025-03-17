import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
import Project from "@/models/Project"; // Import Project Model
import AssignedProjectLog from "@/models/AssignedProjectLogs"; // Import AssignedProjectLog Model
import { getToken, verifyToken, GetUserType } from "@/utils/token";
import User from "@/models/User";
import { teamSchema } from "@/schemas/teamSchema"; // Import the schema
import { assignedProjectLogSchema } from "@/schemas/assignedProjectLogSchema";
export async function POST(req: NextRequest) {
  try {
    // Extract token from request
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. No token provided." },
        { status: 401 }
      );
    }

    const userType = await GetUserType(token);
    if (!userType || userType !== "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access, you are not a Project Manager",
        },
        { status: 401 }
      );
    }

    // Extract data from the request
    const { teamName, teamLeader, members, assignedProject, deadline } =
      await req.json();

    // Validate fields
    if (!teamName || !teamLeader || !members || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Extract only userIds for members
    const memberUserIds = members
      .filter((member: { email: string }) => member.email !== teamLeader.email)
      .map((member: { userId: string }) => member.userId);

    // Fetch Project Manager details using the token
    const decodedUser = verifyToken(token);
    if (!decodedUser || !decodedUser.email) {
      return NextResponse.json(
        { success: false, message: "Invalid token." },
        { status: 403 }
      );
    }

    // Fetch Project Manager details using email
    const projectManager = await User.findOne({ email: decodedUser.email });
    if (!projectManager) {
      return NextResponse.json(
        { success: false, message: "Project Manager not found." },
        { status: 404 }
      );
    }

    // Validate the request data using the team schema
    let teamLeaderids: string[] = [teamLeader.userId];
    const parsedData = teamSchema.safeParse({
      teamName,
      teamLeader: teamLeaderids,
      members: memberUserIds,
      createdBy: projectManager.UserId,
    });

    if (!parsedData.success) {
      // If validation fails, return an error with the validation message
      const errorMessages = parsedData.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { success: false, message: errorMessages },
        { status: 400 }
      );
    }

    // If a project is assigned, update the project model and log the assignment in AssignedProjectLogs
    if (assignedProject) {
      // Validate deadline format
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid deadline format." },
          { status: 400 }
        );
      }
      if (parsedDeadline) {
        const project = await Project.findOne({
          ProjectId: assignedProject.ProjectId,
        });

        const projectId = project.ProjectId;

        if (!project && !project.ProjectId) {
          return NextResponse.json(
            { success: false, message: "Project not found" },
            { status: 404 }
          );
        }

        // Create new team
        const newTeam = new Team({
          teamName,
          teamLeader: teamLeader.userId,
          members: memberUserIds,
          createdBy: projectManager.UserId,
        });

        await newTeam.save();
        const parsedAssignment = assignedProjectLogSchema.safeParse({
          projectId: projectId,
          teamId: newTeam.teamId,
          assignedBy: projectManager.UserId,
          // Convert deadline to ISO string as expected by our schema
          deadline: deadline,
        });

        if (!parsedAssignment.success) {
          const errorMessages = parsedAssignment.error.errors
            .map((err) => err.message)
            .join(", ");
          await Team.deleteOne({ teamId: newTeam.teamId });
          //Throw error in case of the error while validating
          return NextResponse.json(
            { success: false, message: errorMessages },
            { status: 404 }
          );
        }

        // Create the assignment log in AssignedProjectLogs
        const assignedLog = new AssignedProjectLog({
          projectId: projectId,
          teamId: newTeam.teamId,
          assignedBy: projectManager.UserId, // Storing Project Manager info
          deadline: parsedDeadline, // Store the deadline at the time of assignment
        });

        // Save the assignment log
        await assignedLog.save();
      } else
        return NextResponse.json(
          { success: false, message: "Deadline not defiend" },
          { status: 500 }
        );
    } else {
      // Create new team
      const newTeam = new Team({
        teamName,
        teamLeader: teamLeader.userId,
        members: memberUserIds,
        createdBy: projectManager.UserId,
      });

      await newTeam.save();
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: assignedProject
        ? "Team created and assigned to the project successfully!"
        : "Team created successfully without project assignment.",
    });
  } catch (error) {
    console.error("❌ Error creating team:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create team" },
      { status: 500 }
    );
  }
}
