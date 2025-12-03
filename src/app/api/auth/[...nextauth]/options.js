// app/api/auth/[...nextauth]/options.js
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import OwnerModel from "@/model/Owner";
import dbConnect from "@/lib/dbConnect";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔄 NextAuth authorize called");

          await dbConnect();

          if (!credentials.email || !credentials.password) {
            console.error("❌ Missing credentials");
            return null;
          }

          // Test bcrypt first
          const testMatch = await bcrypt.compare("test", "$2b$12$invalidhash");
          console.log("🔐 NextAuth bcrypt test (should be false):", testMatch);

          // Find user
          const user = await OwnerModel.findOne({ 
            email: credentials.email.toLowerCase().trim()
          });

          if (!user) {
            console.error("❌ User not found:", credentials.email);
            return null;
          }

          console.log("🔍 User found:", {
            email: user.email,
            isVerified: user.isVerified,
            isPhoneVerified: user.isPhoneVerified,
            registrationStep: user.registrationStep,
            hashExists: !!user.password,
            hashLength: user.password?.length
          });

          // Check verification
          if (!user.isVerified || !user.isPhoneVerified || user.registrationStep !== 'completed') {
            console.error("❌ User not fully verified");
            return null;
          }

          console.log("🔐 Starting password comparison...");
          console.log("🔐 Password details:", {
            providedLength: credentials.password.length,
            storedHashLength: user.password.length,
            storedHashPrefix: user.password.substring(0, 20)
          });

          // Compare password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("🔐 Password comparison result:", isPasswordCorrect);

          if (!isPasswordCorrect) {
            console.error("❌ Password incorrect");
            return null;
          }

          console.log("✅ Authentication successful");

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isVerified: user.isVerified,
            isPhoneVerified: user.isPhoneVerified,
            cafeName: user.cafeName,
            address: user.address,
            phone: user.phone,
            city: user.city,
            state: user.state,
            pincode: user.pincode
          };

        } catch (error) {
          console.error("❌ NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
        token.isVerified = user.isVerified;
        token.isPhoneVerified = user.isPhoneVerified;
        token.name = user.name;
        token.cafeName = user.cafeName;
        token.address = user.address;
        token.phone = user.phone;
        token.city = user.city;
        token.state = user.state;
        token.pincode = user.pincode;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.id = token.id;
        session.user.isVerified = token.isVerified;
        session.user.isPhoneVerified = token.isPhoneVerified;
        session.user.name = token.name;
        session.user.cafeName = token.cafeName;
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.user.city = token.city;
        session.user.state = token.state;
        session.user.pincode = token.pincode;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};