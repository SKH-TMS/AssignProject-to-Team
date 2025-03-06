import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import { getToken, GetUserType } from "@/utils/token";

export async function GET(req: NextRequest) {
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

    // Fetch projects that are NOT assigned to any team
    const projects = await Project.find(
      { "assignedTeam.teamId": "no-one" },
      { ProjectId: 1, title: 1, description: 1, deadline: 1 }
    );

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("❌ Error fetching unassigned projects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch unassigned projects." },
      { status: 500 }
    );
  }
}
