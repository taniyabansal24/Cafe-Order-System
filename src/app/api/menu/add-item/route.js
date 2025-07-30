// app/api/menu/add-item/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import MenuItemModel from "@/model/MenuItem";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Disable default body parser (set in separate config file if needed)

// POST handler
export async function POST(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const owner = await OwnerModel.findOne({ email: session.user.email });
    if (!owner) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = parseFloat(formData.get("price"));
    const offer = parseFloat(formData.get("offer") || 0);
    const category = formData.get("category");
    const type = formData.get("type");
    const isAvailable = formData.get("isAvailable") === "true";
    const featured = formData.get("featured") === "true";
    const files = formData.getAll("images");

    const imageUrls = [];
    for (const file of files) {
      if (file instanceof Blob) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cafe-items" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const newItem = await MenuItemModel.create({
      name,
      description,
      price,
      offer,
      category,
      type,
      isAvailable,
      featured,
      images: imageUrls,
      owner: owner._id,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
