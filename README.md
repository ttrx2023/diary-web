# 📔 My Diary - Personal Journaling App

A beautiful, feature-rich diary application built with React, TypeScript, and Supabase. Track your daily thoughts, meals, and exercises with seamless multi-device synchronization.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-2.90-3ecf8e)

## ✨ Features

### 📝 Core Functionality
- **Daily Thoughts & Reflections** - Rich text area for journaling your daily experiences
- **Diet Tracking** - Log your meals (breakfast, lunch, dinner, snacks)
- **Exercise Logging** - Track workouts with support for:
  - Sets & Reps (strength training)
  - Duration (cardio, yoga)
  - Distance (running, cycling)

### 🔄 Multi-Device Sync
- **Cloud Synchronization** - Powered by Supabase for real-time data sync
- **Local Storage Fallback** - Works offline with localStorage when cloud sync is disabled
- **User Authentication** - Secure login/signup system
- **Row Level Security** - Your data is private and secure

### 📅 Additional Features
- **Calendar View** - Browse your journal history by month
- **Visual Indicators** - Color-coded markers for thoughts, diet, and exercise entries
- **Statistics Dashboard** - View monthly summaries and trends
- **Auto-Save** - Entries save automatically on blur
- **Responsive Design** - Beautiful UI on desktop and mobile
- **Dark Mode Support** - (via Tailwind configuration)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Supabase account for cloud sync

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd diary-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables (Optional - for cloud sync)**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# Get these from https://database.new
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. **Start the development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🗄️ Supabase Setup (Optional)

If you want to enable cloud sync and multi-device support:

1. **Create a Supabase project** at [database.new](https://database.new)

2. **Run the database migration**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and run the SQL from `SUPABASE_SETUP.md`

3. **Configure your `.env` file** with your project credentials

4. **Restart the dev server**

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## 🏗️ Project Structure

```
diary-app/
├── src/
│   ├── components/
│   │   ├── diary/          # Diary section components
│   │   │   ├── ThoughtsSection.tsx
│   │   │   ├── DietSection.tsx
│   │   │   └── ExerciseSection.tsx
│   │   ├── ui/             # Reusable UI components
│   │   └── Layout.tsx      # App layout with navigation
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── hooks/
│   │   └── useDiary.ts     # Custom React Query hooks
│   ├── lib/
│   │   ├── api.ts          # API abstraction layer
│   │   ├── supabase.ts     # Supabase client
│   │   ├── supabaseApi.ts  # Supabase implementation
│   │   └── mockApi.ts      # Local storage implementation
│   ├── pages/
│   │   ├── Auth.tsx        # Login/Signup page
│   │   ├── Dashboard.tsx   # Main journal entry page
│   │   ├── History.tsx     # Calendar view
│   │   └── Settings.tsx    # App settings
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── App.tsx             # Main app component
├── .env.example            # Environment variables template
├── SUPABASE_SETUP.md       # Supabase setup guide
└── README.md               # This file
```

## 🎨 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query (React Query)
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Form Validation**: React Hook Form + Zod

## 📱 Usage Modes

### Local Mode (No Supabase)
- Data stored in browser's localStorage
- Works offline
- No authentication required
- Data is device-specific

### Cloud Sync Mode (With Supabase)
- Requires login/signup
- Data synced across all devices
- Real-time updates
- Secure with Row Level Security

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Secure Authentication** - Email/password with Supabase Auth
- **Environment Variables** - Sensitive credentials not in code
- **Input Validation** - Client-side validation with Zod

## 📈 Future Enhancements

- [ ] Export entries to PDF/Markdown
- [ ] Rich text editor for thoughts
- [ ] Photo uploads for meals
- [ ] Mood tracking
- [ ] Search functionality
- [ ] Tags and categories
- [ ] Data backup/restore
- [ ] Theme customization
- [ ] Mobile apps (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Lucide](https://lucide.dev/) for the icon set

## 💬 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Happy Journaling! 📔✨**
