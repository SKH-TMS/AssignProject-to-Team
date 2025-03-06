import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import { getToken, GetUserType } from "@/utils/token";
import Team from "@/models/Team";

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
    const { projectId, teamId } = await req.json();

    if (!projectId || !teamId) {
      return NextResponse.json(
        { success: false, message: "Project ID and Team ID are required." },
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

    // Ensure project is not already assigned
    if (project.assignedTeam.teamId !== "no-one") {
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

    // Assign the project to the selected team
    project.assignedTeam = {
      teamId: team.teamId,
      teamName: team.teamName,
    };

    await project.save();

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
