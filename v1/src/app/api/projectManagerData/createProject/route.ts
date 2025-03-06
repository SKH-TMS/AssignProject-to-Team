import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import Team from "@/models/Team";
import { getToken, verifyToken, GetUserType } from "@/utils/token";

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

    // Verify token and extract user details
    const decodedUser = verifyToken(token);
    if (!decodedUser || !decodedUser.email) {
      return NextResponse.json(
        { success: false, message: "Invalid token." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { title, description, deadline, assignedTeam } = await req.json();

    if (!title || !description || !deadline) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, description, deadline, and assigned team are required.",
        },
        { status: 400 }
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

    // Fetch Project Manager details using email
    const projectManager = await User.findOne({ email: decodedUser.email });
    if (!projectManager) {
      return NextResponse.json(
        { success: false, message: "Project Manager not found." },
        { status: 404 }
      );
    }

    const teamData = assignedTeam
      ? await Team.findOne({ teamId: assignedTeam })
      : { teamId: "no-one", teamName: "no-one" };

    const newProject = new Project({
      title,
      description,
      deadline: parsedDeadline,
      createdBy: { email: projectManager.email, userId: projectManager.UserId },
      assignedTeam: teamData,
    });

    await newProject.save();

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully!",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Server error while creating project." },
      { status: 500 }
    );
  }
}
