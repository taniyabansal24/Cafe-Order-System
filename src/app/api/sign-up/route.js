import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationCode";

export async function POST(request) {
  await dbConnect();

  try {
    const {
      name,
      email,
      password,
      cafeName,
      address,
      phone,
      city,
      state,
      pincode,
    } = await request.json();

    const existingOwnerByEmail = await OwnerModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingOwnerByEmail) {
      if (existingOwnerByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingOwnerByEmail.password = hashedPassword;
        existingOwnerByEmail.verifyCode = verifyCode;
        existingOwnerByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingOwnerByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newOwner = new OwnerModel({
        name,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        cafeName,
        address,
        phone,
        city,
        state,
        pincode,
      });

      await newOwner.save();
    }

    // Send verification code
    const emailResponse = await sendVerificationEmail(email, name, verifyCode);

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
