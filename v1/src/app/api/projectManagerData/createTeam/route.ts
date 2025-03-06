import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
import Project from "@/models/Project";
import { getToken, GetUserType } from "@/utils/token";

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

    const UserType = await GetUserType(token);
    if (!UserType || UserType !== "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. You are not a Project Manager.",
        },
        { status: 401 }
      );
    }

    const { teamName, teamLeader, members, assignedProject } = await req.json();

    if (!teamName || !teamLeader || !members || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ Extract only userIds for members
    const memberUserIds = members
      .filter((member: { email: string }) => member.email !== teamLeader.email)
      .map((member: { userId: string }) => member.userId);

    // ✅ Create new team
    const newTeam = new Team({
      teamName,
      teamLeader: teamLeader.userId, // Store only the userId of the leader
      members: memberUserIds, // Store only userIds
    });

    await newTeam.save();

    // ✅ If a project is assigned, update the project model
    if (assignedProject) {
      const project = await Project.findOne({ ProjectId: assignedProject });

      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found" },
          { status: 404 }
        );
      }

      // ✅ Assign the project to the new team
      project.assignedTeam = {
        teamId: newTeam.teamId,
        teamName: newTeam.teamName,
      };

      await project.save();
    }

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
