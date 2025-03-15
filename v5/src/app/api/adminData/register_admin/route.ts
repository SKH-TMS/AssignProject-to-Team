import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { adminRegisterSchema } from "@/schemas/adminSchema"; // Import the schema

export async function POST(req: Request) {
  try {
    const { firstname, lastname, email, password, contact } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }
    // Validate the request data using the imported Zod schema
    const parsedData = adminRegisterSchema.safeParse({
      firstname,
      lastname,
      email,
      password,
      contact,
    });
    if (!parsedData.success) {
      // If validation fails, return an error with the validation message
      const errorMessages = parsedData.error.errors
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    // Connect to MongoDB
    await connectToDatabase();

    // Check if user already exists
    try {
      const existingUser = await Admin.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already registered" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error while finding Admin:", error);
      return NextResponse.json(
        { error: "Failed to find Admin" },
        { status: 500 }
      );
    }

    // Hash the password before storing
    //const hashedPassword = await bcrypt.hash(password, 10);
    // Default profile picture
    const profilepic = "/default-profile.png";

    // Get number of users
    const n_admins = await Admin.countDocuments();
    const assignid = `Admin-${n_admins + 1}`;
    // Insert new user into database
    await Admin.create({
      firstname,
      lastname,
      email,
      password, // Store the hashed password
      contact: contact || "", // Optional field
      profilepic: profilepic,
      userType: "Admin",
      id: assignid,
    });
    console.log("Admin created");
    // Generate JWT token
    // const token = generateToken({
    //   email,
    //   firstname,
    //   lastname,
    //   profilepic,
    //   contact,
    //   userType: "Admin",
    // });

    // Set the token as an HttpOnly cookie
    const res = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
      },
      {
        status: 201,
      }
    );
    // setToken(res, token);

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: "Failed to register" });
  } finally {
  }
}
