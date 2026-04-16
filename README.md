💸 Splitwise Clone (Next.js 16 + Prisma + NextAuth)

A modern expense sharing application inspired by Splitwise — built using Next.js App Router, Prisma, and NextAuth.

---

🚀 Features

- 🔐 Google Authentication (NextAuth)
- 👥 Create & manage groups
- 💸 Add / edit / delete expenses
- ⚖️ Equal & custom expense splitting
- 🔗 Invite members via link / email / WhatsApp
- 📊 Real-time balance calculation
- ⚡ Optimistic UI updates (SWR)
- 📱 PWA support (installable app)
- 🔔 Notifications system (basic)

---

🏗️ Tech Stack

Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion

Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL (or any Prisma-supported DB)

Auth

- NextAuth.js (Google Provider)

Others

- SWR (data fetching)
- Zod (validation)
- Nodemailer (email invites)
- Next-PWA (PWA support)

---

📁 Project Structure

app/
api/
groups/
expenses/
invite/
(dashboard)/
login/
components/
lib/
db/
auth/
types/

---

⚙️ Setup Instructions

1️⃣ Clone the repo

git clone https://github.com/your-username/splitwise.git
cd splitwise

---

2️⃣ Install dependencies

npm install

---

3️⃣ Setup environment variables

Create ".env" file:

DATABASE_URL="your_database_url"

NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

EMAIL_SERVER_USER="your_email"
EMAIL_SERVER_PASS="your_password"

---

4️⃣ Setup database

npx prisma generate
npx prisma migrate dev

---

5️⃣ Run the app

npm run dev

👉 App will run at:
http://localhost:3000

---

🔐 Authentication Flow

- Uses Google OAuth via NextAuth
- Session stored using JWT
- User auto-created in DB on login

---

💸 Expense Flow

1. Create Group
2. Add Members (via invite link)
3. Add Expense:
   - Description
   - Amount
   - Paid by
4. Split:
   - Equal
   - Custom
5. Balances auto-calculated

---

🔗 Invite System

- Generate unique token
- Share via:
  - Link
  - WhatsApp
  - Email
- Join group using "/invite/[token]"

---

⚡ API Design

- REST-based endpoints
- Uses "NextResponse.json"
- Fully typed with TypeScript

Example:

POST /api/expenses
PUT /api/expenses/:id
DELETE /api/expenses/:id

---

📱 PWA Support

- Installable on mobile
- Offline-ready (basic caching)
- Uses "next-pwa"

---

🧠 Best Practices Used

- ✅ Type-safe APIs
- ✅ No "any" usage
- ✅ Optimistic updates
- ✅ Clean folder structure
- ✅ Reusable hooks
- ✅ Server + Client separation

---

🚀 Future Improvements

- 💳 Settlement feature
- 📊 Analytics dashboard
- 🔔 Real-time notifications (WebSockets)
- 🧾 Expense history export
- 🌍 Multi-currency support

---

🤝 Contributing

Pull requests are welcome!

---

👨‍💻 Author

Vipul Kumar

---

⭐ Support

If you like this project, give it a ⭐ on GitHub!
