import dbConnect from "@/lib/dbConnect";
import MenuItemModel from "@/model/MenuItem";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    await dbConnect();
    
    const updatedItem = await MenuItemModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Item updated successfully", item: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}