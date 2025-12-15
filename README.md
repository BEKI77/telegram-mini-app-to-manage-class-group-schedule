# 📚 Class Schedule Management - Telegram Mini App

A modern, feature-rich class schedule management system built as a Telegram Mini App. Designed for students and class representatives to manage schedules, assignments, announcements, and more - all within Telegram.

## ✨ Current Features

### 🎓 For Students

- **📅 Schedule Viewing**
  - View daily and weekly class schedules
  - See today's classes on the dashboard
  - Class details: time, location, instructor, course code
  - Automatic day-based filtering

- **📝 Assignment Tracking**
  - View upcoming assignments with due dates
  - Filter by status (upcoming, past, completed)
  - Assignment details: title, description, course, attachments
  - Quick overview on dashboard

- **📢 Announcements**
  - Real-time class announcements
  - Course-specific or general announcements
  - Displayed prominently on dashboard

- **📖 Course Directory**
  - Browse all courses in your class
  - View course details: name, code, instructor
  - Clean, organized course listing

- **👤 Personalized Experience**
  - Dynamic greeting with your Telegram first name
  - Context-aware data based on your class/topic
  - Role-based interface (student vs representative)

### 🛠️ For Class Representatives

- **📚 Course Management**
  - Create, edit, and delete courses
  - Set course name, code, and instructor
  - Manage multiple courses per class

- **🗓️ Schedule Management**
  - Add class schedules with day, time, and location
  - Edit existing schedules
  - Delete outdated schedules
  - Multiple schedules per course

- **✍️ Assignment Management**
  - Create assignments with title, description, due date
  - Add attachment URLs
  - Edit and delete assignments
  - Set assignment status

- **📣 Announcement System**
  - Post announcements to the class
  - Link announcements to specific courses (optional)
  - Edit and delete announcements

- **🎯 Centralized Management Dashboard**
  - Tabbed interface for courses, schedules, assignments, announcements
  - Quick add/edit/delete actions
  - Real-time updates

### 🔐 Security & Access Control

- **Role-Based Access**
  - Representatives have edit access
  - Students have read-only access
  - Automatic role verification

- **Telegram Authentication**
  - Secure authentication via Telegram initData
  - No separate login required
  - User data synced from Telegram

- **Multi-Classroom Support**
  - Each Telegram topic = separate classroom
  - Context-aware data filtering
  - Representatives can manage their assigned classrooms

### 🤖 Telegram Bot Integration

- **Classroom Creation**
  - `/create <name>` command to create classrooms
  - Links Telegram topics to classrooms
  - Automatic representative role assignment

- **User Management**
  - Automatic user registration on first interaction
  - User data sync (name, username)
  - Role assignment system

- **Deep Linking**
  - Direct links to specific classrooms
  - Start parameter for context passing
  - Seamless navigation from Telegram to Mini App

### 🎨 UI/UX Features

- **Modern Design**
  - Dark mode optimized
  - Gradient accents and glassmorphism
  - Smooth animations with Framer Motion
  - Responsive mobile-first design

- **Intuitive Navigation**
  - Bottom navigation bar
  - Quick access to all sections
  - Manage button for representatives

- **Performance**
  - Fast loading with optimized queries
  - Efficient data fetching
  - Smooth transitions

## 🗺️ Roadmap - Planned Features

### 🔔 High Priority

- [ ] **Push Notifications & Reminders**
  - Class start reminders (15-30 mins before)
  - Assignment deadline notifications
  - New announcement alerts
  - Daily schedule summary

- [ ] **Attendance Tracking**
  - Mark attendance per class (representatives)
  - View attendance percentage (students)
  - Attendance calendar/heatmap
  - Automated attendance reports

- [ ] **Study Resources & Materials**
  - Upload/share course materials
  - PDF, link, and video support
  - Organize by course and topic
  - Search functionality

- [ ] **Telegram Bot Commands**
  - `/schedule` - Get today's schedule
  - `/next` - Next class info
  - `/assignments` - Upcoming assignments
  - `/attendance` - Check attendance
  - `/submit` - Submit assignment

- [ ] **Calendar Integration**
  - Export to Google Calendar/iCal
  - Sync assignments with calendar apps
  - Two-way sync for updates

### 📊 Medium Priority

- [ ] **Grade Management**
  - Track assignment and exam grades
  - Calculate GPA per course
  - Grade distribution charts
  - Progress tracking

- [ ] **Analytics Dashboard**
  - Study time tracker
  - Assignment completion rate
  - Weekly/monthly summaries
  - Engagement metrics (for representatives)

- [ ] **Study Groups**
  - Create study groups within classes
  - Group chat integration
  - Schedule group sessions
  - Share notes within groups

- [ ] **Offline Mode**
  - Cache schedule and assignments
  - Offline viewing
  - Sync when back online

### 🎯 Future Enhancements

- [ ] **AI-Powered Features**
  - Smart study time suggestions
  - Assignment difficulty prediction
  - Auto-categorize announcements
  - Intelligent search

- [ ] **Gamification**
  - Attendance streaks
  - Achievement badges
  - Leaderboard (opt-in)
  - Completion rewards

- [ ] **Collaboration Tools**
  - Peer-to-peer note sharing
  - Study partner matching
  - Q&A discussion boards
  - Collaborative note-taking

- [ ] **Advanced Customization**
  - Custom color themes per course
  - Notification preferences
  - Widget for quick schedule view
  - Voice input for tasks

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Telegram Web App SDK (@tma.js/sdk)
- **Bot**: Grammy (Telegram Bot Framework)
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Vercel (recommended)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd schedule-managment
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/schedule_db
   
   # Telegram Bot
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_ENV=prod  # or 'test' for test environment
   TELEGRAM_APP_NAME=app  # Your mini app name
   
   # Next.js
   BOT_TOKEN=your_bot_token_here  # Same as TELEGRAM_BOT_TOKEN
   ```

4. **Run database migrations**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or for HTTPS (required for Telegram)
   npm run dev:https
   ```

6. **Run the Telegram bot** (in a separate terminal)
   ```bash
   npx tsx bot/index.ts
   ```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Bot Deployment

Deploy the bot to a server (e.g., Railway, Heroku, VPS):
```bash
npm run build
npm start
```

Keep the bot running with PM2:
```bash
pm2 start bot/index.ts --name telegram-bot
```

## 📖 Usage

### For Students

1. Open the bot in Telegram
2. Click the Mini App button or use the link provided by your representative
3. View your schedule, assignments, and announcements
4. Stay updated with your class activities

### For Class Representatives

1. Add the bot to your Telegram group
2. Create a topic for your class
3. Run `/create <Classroom Name>` in the topic
4. Share the generated link with students
5. Use the "Manage" button in the Mini App to add courses, schedules, assignments, and announcements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Useful Links

- [Telegram Mini Apps Documentation](https://docs.telegram-mini-apps.com/)
- [@tma.js/sdk Documentation](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Grammy Bot Framework](https://grammy.dev/)

## 💬 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

