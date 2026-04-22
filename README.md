# 💸 Splitwise - Modern Expense Sharing App

A full-stack expense sharing application built with **Next.js 16**, **React 19**, **Prisma**, and **NextAuth.js**. Splitwise helps friends and groups track shared expenses, calculate balances, and settle debts with ease.

## 🌟 Key Features

### Core Functionality
- 🔐 **Secure Authentication** - Google OAuth via NextAuth.js with JWT sessions
- 👥 **Group Management** - Create, update, and manage expense sharing groups
- 💸 **Flexible Expense Splitting** - Equal or custom per-member split amounts
- 📊 **Real-Time Balance Calculation** - Instantly see who owes whom across all groups
- 🔗 **Smart Invitations** - Invite members via copyable links, WhatsApp, or email
- 🎯 **Friend Summaries** - Track balance with each friend across all groups
- ⚡ **Optimistic UI Updates** - Instant feedback with SWR-powered optimistic mutations

### Advanced Features
- 📱 **PWA Support** - Installable standalone app with offline functionality
- 🔔 **Real-Time Notifications** - Get notified of group events (expenses, members joining, etc.)
- 💳 **UPI Payment Integration** - Deep links to mobile payment apps (GPay, PhonePe, Paytm)
- 🎨 **Responsive Design** - Mobile-first UI with Tailwind CSS & ShadCN components
- 🎬 **Smooth Animations** - Framer Motion transitions for polish
- ✅ **Form Validation** - Zod schemas for type-safe data validation

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2.1 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 + ShadCN UI
- **Animations**: Framer Motion 12.38
- **State Management**: Zustand 5.0.12 (notifications), React Context (auth)
- **Data Fetching**: SWR 2.4.1 (with optimistic updates)
- **Forms**: React Hook Form 7.72 + Zod 4.3.6 (validation)
- **Icons**: React Icons 5.6.0

### Backend
- **API Layer**: Next.js 16 API Routes
- **ORM**: Prisma 5.22.0
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js 4.24.13 (Google OAuth)
- **Email Service**: Nodemailer 7.0.13
- **Analytics**: Vercel Analytics 2.0.1

### PWA & Build Tools
- **PWA**: next-pwa 5.6.0 (service worker, offline support)
- **Build Tool**: Webpack (with custom config)
- **Linting**: ESLint 9

---

## 📂 Project Structure

### Pages & Routes
```
app/
├── (auth)/
│   └── login/                    # Google OAuth login page
├── (dashboard)/
│   ├── groups/                   # Create & browse groups
│   ├── groups/[id]/              # Group details, expenses, balances
│   ├── profile/                  # User profile
│   ├── friends/                  # Friend balance summaries
│   └── settle/[friendId]/        # UPI payment settlement
└── api/
    ├── auth/[...nextauth]/       # NextAuth OAuth handlers
    ├── groups/                   # Create, read, update, delete groups
    ├── expenses/                 # Manage expenses with splits & notifications
    ├── notifications/            # Fetch, read, mark notifications
    └── settle/                   # Settlement records
```

### Components Structure
```
components/
├── ui/                           # Base UI components (Button, Input, Card, etc.)
├── layout/                       # Navbar, BottomNav, layout wrappers
├── modals/                       # ConfirmModal, MembersModal, ShareModal
├── features/                     # Feature-specific components
│   ├── groups/                   # Group management components
│   ├── expenses/                 # Expense form, list, add button
│   ├── friends/                  # Friend cards, summaries
│   ├── balances/                 # Balance display components
│   └── notifications/            # Notification bell, list
└── providers/                    # React providers (SessionProvider)
```

### Utilities & Hooks
```
lib/
├── auth/auth.ts                  # NextAuth configuration
├── db/prisma.ts                  # Prisma client singleton
├── fetcher.ts                    # SWR data fetcher
├── notifications/                # Notification creation helpers
└── services/email.ts             # Email service (Nodemailer)

features/
├── groups/hooks/                 # useGroupDetail, useGroupActions, useGroupUI
├── expenses/hooks/               # Expense management hooks
└── friends/hooks/                # Friend balance hooks

store/
└── notificationStore.ts          # Zustand notification store
```

---

## 🗄️ Database Schema

### Core Models

| Model | Purpose |
|-------|---------|
| **User** | User profile (email, name, image) |
| **Group** | Expense sharing group (name, timestamps) |
| **GroupMember** | User membership in groups (junction table) |
| **Expense** | Individual expense record (amount, description, payer) |
| **Split** | Per-user expense split (userId, expenseId, amount) |
| **GroupInvite** | Invite tokens for joining groups |
| **Notification** | Activity notifications (6 types: GENERAL, USER_JOINED, EXPENSE_ADDED, EXPENSE_UPDATED, EXPENSE_DELETED, GROUP_CREATED) |
| **Settlement** | Payment records between users |

### Key Features
- **Atomic Transactions**: Expense creation includes splits + notifications in single transaction
- **Cascade Deletes**: Clean group/expense deletion with related records
- **Unique Constraints**: Email uniqueness, member-group uniqueness
- **NextAuth Tables**: Account, Session, VerificationToken for OAuth

---

## 🔐 Authentication & Authorization

### NextAuth.js Flow
1. **Provider**: Google OAuth 2.0
2. **Adapter**: Prisma (stores sessions in database)
3. **Session Strategy**: JWT stored in HTTP-only cookie
4. **Upsert on Login**: Auto-creates/updates user on first login
5. **Protected Routes**: Dashboard routes redirect to `/login` if unauthorized

### Callbacks
- `signIn()` - Validates user exists in database
- `jwt()` - Adds user ID to token
- `session()` - Exposes user ID and profile in session object

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (Client ID & Secret from Google Cloud Console)

### Installation

1. **Clone & Install Dependencies**
```bash
git clone <repo-url>
cd splitwise
npm install
```

2. **Environment Setup**
Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/splitwise"

# NextAuth
NEXTAUTH_SECRET="your_super_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"

# Email (for invites)
EMAIL_SERVER_USER="your_email@gmail.com"
EMAIL_SERVER_PASS="your_app_specific_password"

# Environment
NODE_ENV="development"
```

3. **Database Setup**
```bash
npm run db:push      # Apply schema to database
npm run db:studio    # Open Prisma Studio (optional)
```

4. **Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

### Groups
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/groups` | GET | Fetch all user's groups |
| `/api/groups` | POST | Create new group |
| `/api/groups/[id]` | GET | Get group details with members & expenses |
| `/api/groups/[id]` | PUT | Update group name |
| `/api/groups/[id]` | DELETE | Delete group (creator only) |
| `/api/groups/[id]/invite` | POST | Generate shareable invite link |
| `/api/groups/[id]/exit` | POST | Leave group |
| `/api/groups/join` | POST | Join group via token |

### Expenses
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/expenses` | POST | Create expense with splits & notifications |
| `/api/expenses/[id]` | PUT | Update expense |
| `/api/expenses/[id]` | DELETE | Delete expense |

### Notifications
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications` | GET | Fetch notifications (with optional groupId filter) |
| `/api/notifications/unread` | GET | Get unread count |
| `/api/notifications/read` | POST | Mark notifications as read |

### Settlement
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/settle` | POST | Create payment settlement record |

---

## 💡 Key Architectural Patterns

### Optimistic Updates
```typescript
// Example: Create group
const { mutate } = useSWR('/api/groups', fetcher);
mutate([...groups, newGroup], false); // Optimistic update
await fetch('/api/groups', { method: 'POST', body });
mutate(); // Revalidate after success
```

### Real-Time Balance Calculation
```typescript
// calculateFriendBalances() aggregates balances across all groups
// Returns map of friend → balance (positive = they owe you, negative = you owe)
```

### Atomic Database Operations
```typescript
// Expense creation with transaction
await prisma.$transaction(async (tx) => {
  const expense = await tx.expense.create(...);
  await tx.split.createMany(...);
  await tx.notification.createMany(...);
});
```

### Type-Safe Forms
```typescript
// Zod validation on both frontend & backend
const expenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  splits: z.array(z.object({ userId: z.string(), amount: z.number() }))
});
```

---

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Service worker caches critical assets
- **Manifest**: App metadata, icons, theme colors
- **Standalone Mode**: Runs like native app (full screen, no address bar)
- **Caching Strategy**: NetworkFirst for API calls (fallback to cache)

---

## 🧪 Testing & Deployment

### Development
```bash
npm run dev          # Start dev server (webpack)
npm run lint         # Run ESLint
```

### Production
```bash
npm run build        # Build for production
npm start            # Start production server
```

### Deployment
- **Vercel**: Direct GitHub integration, auto-deploys on push
- **Docker**: Create Dockerfile with Node.js base image
- **Environment Variables**: Set via platform CI/CD or `.env.local` for local testing

---

## 🎯 Roadmap / Future Enhancements

- [ ] Expense request feature (request payment reminders)
- [ ] Receipt/bill image uploads
- [ ] Monthly expense reports & charts
- [ ] Recurring expenses
- [ ] Activity feed/timeline
- [ ] Dark mode support
- [ ] Multiple payment methods beyond UPI
- [ ] Category-based expense filtering
- [ ] Budget limits per group
- [ ] Internationalization (i18n)

---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first to discuss.

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

Built with ❤️ using modern web technologies.

For questions or support, open an issue on GitHub.

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
