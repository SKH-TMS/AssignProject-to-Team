import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { generateToken, setToken } from "../../../../utils/token";
//import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import User from "@/models/User";
import { userRegistrationSchema } from "@/schemas/userSchema";
export async function POST(req: Request) {
  try {
    const { firstname, lastname, email, password, contact } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        {
          status: 401,
        }
      );
    }

    // Validate the request data using the imported Zod schema
    const parsedData = userRegistrationSchema.safeParse({
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
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Email is already registered",
            message: "Email is already registered",
          },
          { status: 402 }
        );
      }
    } catch (error) {
      console.error("Error while finding user:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to find user",
          message: "Email is already registered",
        },
        { status: 500 }
      );
    }

    // Hash the password before storing
    //const hashedPassword = await bcrypt.hash(password, 10);
    // Default profile picture
    const profilepic = "/default-profile.png";

    // Get number of users
    const n_users = await User.countDocuments();
    const assignid = `User-${n_users + 1}`;
    console.log(assignid);
    // Insert new user into database
    await User.create({
      firstname,
      lastname,
      email,
      password, // Store the hashed password
      contact: contact || "", // Optional field
      profilepic: profilepic,
      userType: "User",
      UserId: assignid,
    });
    console.log("user created");
    // Generate JWT token
    // const token = generateToken({
    //   email,
    //   firstname,
    //   lastname,
    //   profilepic,
    //   contact,
    //   userType: "User",
    //   UserId: assignid,
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
