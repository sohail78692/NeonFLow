# 🦾 NeonFlow - Ultra-Modern To-Do Web App

A futuristic, feature-rich To-Do List application with glassmorphism design, AI-powered features, productivity tracking, and real-time collaboration capabilities.

![NeonFlow](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎨 **Design & UI**
- **Glassmorphism + Cyber-Neon Aesthetic**: Beautiful frosted glass effects with neon accents
- **5 Customizable Themes**: Cyberpunk, Minimal White, Anime Aesthetic, Terminal Hacker, Pastel Soft UI
- **Smooth Animations**: 3D micro-interactions and dynamic transitions
- **Custom Cursor**: Glowing neon cursor effect
- **Responsive Design**: Mobile-first, works perfectly on all devices
- **Dark/Light Mode**: Toggle between themes
- **Custom Wallpapers**: Upload your own background images

### 📋 **Task Management**
- ✅ Add, Edit, Delete tasks
- ✅ Drag-and-Drop reordering
- ✅ Mark tasks as complete with satisfying animations
- ✅ Subtasks support with individual completion tracking
- ✅ Category labels for organization
- ✅ Priority levels (High, Medium, Low) with color coding
- ✅ Due dates and time estimates
- ✅ Smart sorting (by date, priority, name, due date)
- ✅ Advanced filtering (status, priority, category)
- ✅ Real-time search

### 🤖 **AI Features**
- **Voice Assistant**: Add tasks by speaking (Web Speech API)
- **Text-to-Task AI**: Convert natural language into structured tasks with time estimates
- **AI Task Breaker**: Automatically break large tasks into actionable subtasks

### ⏱️ **Productivity Tools**
- **Pomodoro Focus Timer**: Customizable timer (15, 25, 45, 60 minutes)
- **Ambient Focus Sounds**: Rain, Forest, Ocean, Cafe options
- **Productivity Streak System**: Track daily activity streaks
- **XP & Leveling System**: Earn XP for completing tasks, level up!
- **Completion Confetti**: Celebrate task completions
- **Motivational Quotes**: Inspiring quotes to keep you motivated

### 📊 **Analytics Dashboard**
- **Weekly Heatmap**: Visualize task completion over time
- **Radial Charts**: Task distribution by priority
- **Completion Rate Tracking**: See your productivity metrics
- **Productivity Statistics**: Comprehensive stats overview

### 📅 **Views**
- **Tasks View**: Traditional list view with full task details
- **Kanban Board**: Drag-and-drop board with To Do, In Progress, Completed columns
- **Calendar View**: Monthly calendar with task indicators
- **Focus Timer**: Dedicated Pomodoro timer view
- **Analytics**: Productivity insights and charts
- **Settings**: Customize your experience

### 🔔 **Notifications & Reminders**
- **Push Notifications**: Browser notifications for important events
- **Smart Reminders**: Get notified about upcoming due dates
- **Visual Notifications**: In-app notification system

### 💾 **Data Persistence**
- **LocalStorage**: All data saved locally in your browser
- **Cloud Sync Ready**: Structure in place for cloud synchronization
- **Export/Import**: (Coming soon)

### 👥 **Collaboration** (Structure Ready)
- **WebSocket Support**: Real-time collaborative task lists
- **Shared Lists**: Work together on task lists
- **Live Updates**: See changes as they happen

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser!

### Installation

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/yourusername/neonflow-todo-app.git
   cd neonflow-todo-app
   ```

2. **Open the Application**:
   - Simply open `index.html` in your web browser
   - Or use a local server for better experience:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (with http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Access the App**:
   - Open your browser and navigate to `http://localhost:8000`
   - Or double-click `index.html` to open directly

## 📖 Usage Guide

### Adding Tasks

1. **Quick Add**: Click the floating "+" button in the bottom-right corner
2. **Voice Add**: Long-press the "+" button to open AI Assistant, then use Voice Input
3. **Text-to-Task**: Open AI Assistant → Text to Task tab → Type naturally and convert
4. **Task Breaker**: Open AI Assistant → Task Breaker tab → Enter a big task to break it down

### Managing Tasks

- **Complete**: Click the checkbox next to a task
- **Edit**: Click the edit icon (pencil) on any task
- **Delete**: Click the delete icon (trash) on any task
- **Reorder**: Drag and drop tasks to reorder them
- **Filter**: Use the filter button in the header to filter by status, priority, or category
- **Search**: Click the search icon to search through all tasks

### Using the Pomodoro Timer

1. Navigate to **Focus Timer** in the sidebar
2. Select your preferred duration (15, 25, 45, or 60 minutes)
3. Choose an ambient sound (optional)
4. Click the play button to start
5. Take breaks between sessions!

### Viewing Analytics

1. Navigate to **Analytics** in the sidebar
2. View your weekly heatmap, task distribution, and completion rates
3. Track your productivity over time

### Customizing Themes

1. Navigate to **Settings** in the sidebar
2. Choose from 5 beautiful themes
3. Upload a custom wallpaper (optional)
4. Toggle sound effects and notifications

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, animations, glassmorphism effects
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **JavaScript (ES6+)**: Modern JavaScript features
- **Chart.js**: Beautiful charts and visualizations
- **Canvas Confetti**: Celebration animations
- **Web Speech API**: Voice recognition
- **Font Awesome**: Icon library
- **LocalStorage API**: Data persistence

### Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

### File Structure
```
neonflow-todo-app/
│
├── index.html          # Main HTML structure
├── style.css           # All styles and themes
├── script.js           # Application logic
└── README.md           # This file
```

## 🚢 Deployment

### Option 1: Static Hosting (Recommended)

#### Netlify
1. Push your code to GitHub
2. Go to [Netlify](https://www.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Deploy!

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

#### GitHub Pages
1. Push code to a GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 2: Traditional Web Hosting
1. Upload all files to your web server
2. Ensure `index.html` is in the root directory
3. Access via your domain

### Option 3: CDN Deployment
- Upload to any CDN service (Cloudflare, AWS CloudFront, etc.)
- Configure CORS if needed
- Access via CDN URL

## 🔧 Configuration

### Enabling Cloud Sync
The app includes structure for cloud synchronization. To implement:

1. Set up a backend server (Node.js, Python, etc.)
2. Implement WebSocket server for real-time updates
3. Update the `initializeWebSocket()` function in `script.js`
4. Add authentication if needed

### Customizing Themes
Edit the CSS variables in `style.css` under the `:root` and theme sections to customize colors and effects.

### Adding Custom Sounds
Replace the placeholder sound functions in `script.js` with actual audio file loading:
```javascript
function playSound(type) {
    const audio = new Audio(`sounds/${type}.mp3`);
    audio.play();
}
```

## 🐛 Troubleshooting

### Voice Recognition Not Working
- Ensure you're using Chrome or Edge (best support)
- Check microphone permissions in browser settings
- Use HTTPS (required for some browsers)

### Data Not Persisting
- Check browser LocalStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

### Charts Not Displaying
- Ensure Chart.js CDN is loading (check network tab)
- Check browser console for JavaScript errors

### Drag and Drop Not Working
- Ensure JavaScript is enabled
- Try refreshing the page
- Check browser compatibility


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Chart.js** for beautiful data visualizations
- **Canvas Confetti** for celebration animations
- **Font Awesome** for icons
- **Web Speech API** for voice recognition

## 💬 Support

For issues, questions, or contributions:
- Open an issue on GitHub.
- Contact: [sohail786akh@gmail.com]

## 🌟 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Made with ❤️ by Sohail and lots of ☕**

Enjoy your ultra-modern to-do experience! 🚀
