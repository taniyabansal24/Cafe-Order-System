// scripts/fix-password.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const OwnerModel = require('../model/Owner');
    const user = await OwnerModel.findOne({ email: "webwisecrafters@gmail.com" });
    
    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Current user:', {
      email: user.email,
      currentHash: user.password,
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified
    });

    // Reset to a known password
    const newPassword = "123456";
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password reset to:', newPassword);
    console.log('New hash:', hashedPassword);

    // Verify the update
    const updatedUser = await OwnerModel.findOne({ email: "webwisecrafters@gmail.com" });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('✅ Password verification test:', isMatch);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixPassword();