import mongoose from 'mongoose';

let connection = {}; // ✅ Declare connection as an object

async function dbConnect() {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        connection.isConnected = db.connection.readyState; // ✅ Use db.connection.readyState

        console.log("DB is connected successfully");
    } catch (error) {
        console.log("DB connection FAILED:", error);
        process.exit(1);
    }
}

export default dbConnect;
