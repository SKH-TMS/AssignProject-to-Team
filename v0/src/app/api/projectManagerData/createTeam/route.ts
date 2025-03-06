import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/models/Team";
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
    if (!UserType || UserType != "ProjectManager") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access you are not an Project Manager",
        },
        { status: 401 }
      );
    }

    const { teamName, teamLeader, members } = await req.json();

    if (!teamName || !teamLeader || !members || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ Filter out the team leader from the members list and only store userIds
    const memberUserIds = members
      .filter((member: { email: string }) => member.email !== teamLeader.email)
      .map((member: { userId: string }) => member.userId); // Only userId values

    const newTeam = new Team({
      teamName,
      teamLeader: teamLeader.userId, // Store only the userId of the team leader
      members: memberUserIds, // Storing only the userIds in the members array
    });

    await newTeam.save();

    return NextResponse.json({
      success: true,
      message: "Team created successfully!",
    });
  } catch (error) {
    console.error("❌ Error creating team:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create team" },
      { status: 500 }
    );
  }
}
