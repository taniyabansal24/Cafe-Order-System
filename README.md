# Cafe Order System ☕📱

A **QR-based Cafe Order System** built with [Next.js](https://nextjs.org), allowing customers to view the menu and place orders by scanning a QR code at their table. Cafe owners can manage their menu using an intuitive dashboard.
This project includes **email and phone number authentication**, and a complete **menu management system**.

---

## ✨ Features

* ✅ **Authentication with Email and Phone OTP Verification**
* 🍽️ **Add New Menu Items** (Name, Price, Description, Image, etc.)
* 📋 **All Items Page** (View all available menu items instantly)
* 📱 **QR Code-Based Access** *(coming soon)*
* 🧑‍🍳 **Admin Dashboard** *(in progress)*
* 💳 **Order Placement & Payment Flow** *(coming soon)*

---

## 📁 Tech Stack

* **Framework**: Next.js 14 (App Router)
* **Database**: MongoDB Atlas
* **ORM**: Mongoose
* **Authentication**: NextAuth (with Credentials Provider)
* **Phone Verification**: Twilio
* **Form Handling**: React Hook Form + Zod
* **Styling**: Tailwind CSS
* **Deployment**: Vercel *(recommended)*

---

## 🚀 Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/cafe-order-system.git
cd cafe-order-system
npm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_ID=your_twilio_service_id
```

---

## 📦 Folder Structure

```bash
.
├── app/                  # App Router pages
│   ├── auth/             # Sign-in, Sign-up, OTP verification
│   ├── menu/             # All Items, Add Item pages
│   └── layout.js
├── components/           # Reusable UI components
├── lib/                  # DB connection, helper functions
├── model/                # Mongoose models (e.g., Owner, MenuItem)
├── public/               # Static files (images, etc.)
├── styles/               # Tailwind and global CSS
├── utils/                # Utility functions (e.g., token handler)
└── ...
```

---

## 📸 Screenshots

*You can add screenshots or screen recordings here of the menu dashboard, verification steps, etc.*

---

## 📌 Upcoming Features

* Order placement system with table number input
* QR code generation for each table
* Admin dashboard to view orders in real-time
* Payment gateway integration (e.g., Razorpay)
* Cafe-wise authentication and multi-tenancy

---

## 📤 Deployment

The easiest way to deploy your Next.js app is through [Vercel](https://vercel.com).

Follow: [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying)

---

## 🙋‍♀️ Author

**Taniya Bansal**
🎓 B.Sc (Hons) Computer Science & Data Analytics, IIT Patna
💻 Passionate about full-stack development

---

Let me know if you'd like a Hindi version or want to add deployment instructions for backend (if you host it separately).
