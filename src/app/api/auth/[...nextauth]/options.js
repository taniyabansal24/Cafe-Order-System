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
        await dbConnect();

        try {
          const user = await OwnerModel.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              isVerified: user.isVerified,
              cafeName: user.cafeName,
              address: user.address,
              phone: user.phone,
              city: user.city,
              state: user.state,
              pincode: user.pincode
            };
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
        token.isVerified = user.isVerified;
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
        session.user.isVerified = token.isVerified;
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