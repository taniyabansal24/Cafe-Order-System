// scripts/check-indexes.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      const indexes = await collection.indexes();
      console.log(`\n📊 Indexes for ${collection.collectionName}:`);
      indexes.forEach(index => {
        console.log('  ', index);
      });
    }

    // Check for duplicate users
    const OwnerModel = require('../model/Owner');
    const users = await OwnerModel.find({ email: "webwisecrafters@gmail.com" });
    console.log(`\n🔍 Found ${users.length} users with this email:`);
    users.forEach(user => {
      console.log('  ', {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        passwordHash: user.password ? 'Exists' : 'Missing'
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkIndexes();