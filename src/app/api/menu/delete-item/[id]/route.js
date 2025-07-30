// app/api/menu/delete-item/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import MenuItemModel from '@/model/MenuItem';
import OwnerModel from '@/model/Owner';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// app/api/menu/delete-item/[id]/route.js
export async function DELETE(request, { params }) {
  console.log(`Delete request for item ${params.id}`);
  
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('Unauthorized delete attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const owner = await OwnerModel.findOne({ email: session.user.email });
    if (!owner) {
      console.log('Owner not found during delete');
      return NextResponse.json({ message: 'Owner not found' }, { status: 404 });
    }

    console.log(`Verifying ownership of item ${params.id}`);
    const item = await MenuItemModel.findOne({
      _id: params.id,
      owner: owner._id
    });

    if (!item) {
      console.log(`Item ${params.id} not found or ownership mismatch`);
      return NextResponse.json(
        { message: 'Item not found or not owned by you' }, 
        { status: 404 }
      );
    }

    console.log(`Deleting item ${params.id}`);
    await MenuItemModel.deleteOne({ _id: params.id });
    
    console.log(`Item ${params.id} deleted successfully`);
    return NextResponse.json(
      { success: true, message: 'Item deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}