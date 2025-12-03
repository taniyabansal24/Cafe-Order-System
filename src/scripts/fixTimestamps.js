// scripts/fixTimestamps.js
const mongoose = require('mongoose');
const OwnerModel = require('../model/Owner');
require('dotenv').config();

async function fixAllTimestamps() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all documents with incorrect timestamps (future dates)
        const incorrectDocs = await OwnerModel.find({
            $or: [
                { createdAt: { $gt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } }, // More than 1 year in future
                { updatedAt: { $gt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } }  // More than 1 year in future
            ]
        });

        console.log(`Found ${incorrectDocs.length} documents with incorrect timestamps`);

        // Fix each document
        for (const doc of incorrectDocs) {
            const now = new Date();
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
            
            await OwnerModel.updateOne(
                { _id: doc._id },
                { 
                    $set: { 
                        createdAt: now,
                        updatedAt: now,
                        ttlExpireAt: tenMinutesFromNow,
                        verifyCodeExpiry: tenMinutesFromNow
                    } 
                }
            );
            console.log(`Fixed timestamps for document: ${doc._id}`);
        }

        console.log('✅ All timestamps fixed successfully');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixAllTimestamps();