# 🧩 Daily Riddles - Free Brain Teasers & Puzzles

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-Latest-f472b6)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games. No signup required!**

🎮 **[Play Now →](https://riddles.byronwade.com)** | 📱 **Mobile Friendly** | 🌙 **Dark Mode** | 🎯 **No Ads**

## ✨ Features

### 🧠 **Daily Brain Training**
- **New Riddles Daily**: Fresh brain teasers every day at midnight
- **Progressive Difficulty**: From easy warm-ups to mind-bending challenges
- **Multiple Categories**: Logic puzzles, word games, lateral thinking, math riddles

### 🏆 **Achievement System**
- **Streak Tracking**: Build daily solving streaks (3, 7, 30+ days)
- **Milestone Badges**: Unlock achievements for 10, 50, 100+ solved riddles
- **Visual Progress**: Beautiful progress indicators and statistics

### 🎤 **Advanced Input Methods**
- **Voice Recognition**: Hands-free solving with Web Speech API
- **Smart Answer Matching**: Accepts synonyms, handles typos, fuzzy matching
- **Multiple Formats**: Type, speak, or tap your answers

### 🎨 **Enhanced User Experience**
- **Confetti Celebrations**: Animated rewards for correct answers
- **Shake Feedback**: Visual cues for incorrect attempts
- **Sound Effects**: Immersive audio feedback (Web Audio API)
- **Haptic Feedback**: Mobile vibration patterns for tactile response

### 🔧 **Modern Web Features**
- **Progressive Web App**: Install on any device, works offline
- **Dark/Light Themes**: Beautiful UI that adapts to your preference
- **Mobile Responsive**: Perfect experience on phones, tablets, desktop
- **Accessibility**: Screen reader friendly, keyboard navigation

### 🤝 **Social & Sharing**
- **Share Results**: Share your solving streaks and achievements
- **No Registration**: Start playing immediately, no account needed
- **Privacy First**: All data stored locally on your device

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/byronwade/riddles.byronwade.com.git
cd riddles.byronwade.com

# Install dependencies
bun install

# Start development server
bun dev

# Open in browser
open http://localhost:3000
```

### Alternative Package Managers
```bash
# Using npm
npm install && npm run dev

# Using yarn
yarn install && yarn dev

# Using pnpm
pnpm install && pnpm dev
```

## 🏗️ Tech Stack

### Core Technologies
- **[Next.js 15.3.4](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager

### UI & Components
- **[Shadcn/UI](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible primitives
- **[Lucide Icons](https://lucide.dev/)** - Beautiful SVG icons

### APIs & Features
- **Web Audio API** - Sound effects and audio feedback
- **Web Speech API** - Voice input recognition
- **Vibration API** - Haptic feedback on mobile
- **Service Worker** - Offline functionality and caching

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
riddles.byronwade.com/
├── 📁 app/                     # Next.js App Router
│   ├── 📄 actions.ts          # Server actions for riddle fetching
│   ├── 📄 daily-riddle-game.tsx # Main game component
│   ├── 📄 globals.css         # Global styles and Tailwind
│   ├── 📄 layout.tsx          # Root layout with SEO metadata
│   ├── 📄 page.tsx            # Home page with semantic HTML
│   ├── 📄 robots.ts           # SEO robots configuration
│   └── 📄 sitemap.ts          # Dynamic sitemap generation
├── 📁 components/             # Reusable UI components
│   ├── 📁 ui/                 # Shadcn/UI components
│   ├── 📄 theme-provider.tsx  # Dark/light theme context
│   └── 📄 theme-toggle.tsx    # Theme switching component
├── 📁 lib/                    # Utilities and data
│   ├── 📄 riddles.json        # Riddle database (1000+ riddles)
│   ├── 📄 utils.ts            # Utility functions
│   └── 📄 fetch-riddles.mjs   # Riddle data processing
├── 📁 public/                 # Static assets
│   ├── 📄 manifest.json       # PWA manifest
│   ├── 📄 browserconfig.xml   # Windows tile configuration
│   ├── 📄 humans.txt          # Human-readable site info
│   └── 📄 security.txt        # Security contact information
├── 📁 types/                  # TypeScript definitions
│   └── 📄 speech.d.ts         # Web Speech API types
└── 📁 hooks/                  # Custom React hooks
    └── 📄 use-mobile.ts       # Mobile detection hook
```

## 🎮 Game Mechanics

### Daily Riddle System
```typescript
// Riddles refresh every day at midnight
const getDailyRiddle = () => {
  const today = new Date().toDateString();
  const riddleIndex = hashDate(today) % totalRiddles;
  return riddles[riddleIndex];
};
```

### Answer Matching Intelligence
- **Exact Match**: Direct answer comparison
- **Synonym Recognition**: "daylight" = "day" = "light" = "bright"
- **Fuzzy Matching**: Levenshtein distance for typo tolerance
- **Case Insensitive**: Handles all capitalization formats
- **Punctuation Removal**: Ignores special characters

### Achievement Tracking
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: 'streak' | 'total';
  icon: string;
}
```

## 🎨 Design System

### Color Palette
```css
/* Light Mode */
--background: #ffffff;
--foreground: #0a0a0a;
--primary: #2563eb;

/* Dark Mode */
--background: #0a0a0a;
--foreground: #fafafa;
--primary: #3b82f6;
```

### Typography
- **Font**: Geist Sans (optimized for readability)
- **Headings**: Clean hierarchy with proper contrast
- **Body**: Comfortable reading size and line height

## 🔍 SEO Optimization

### Comprehensive SEO Features
- **Structured Data**: JSON-LD schema for Game, WebApplication, FAQPage
- **Meta Tags**: Complete Open Graph and Twitter Card metadata
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Sitemap**: Dynamic XML sitemap with priorities
- **Robots.txt**: Optimized for search engine crawling

### Performance
- **Core Web Vitals**: Optimized for Google's performance metrics
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Aggressive caching strategies for fast loading

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/riddles.byronwade.com.git`
3. **Install** dependencies: `bun install`
4. **Create** a branch: `git checkout -b feature/amazing-feature`
5. **Make** your changes
6. **Test** thoroughly: `bun run build && bun run start`
7. **Commit** with clear messages: `git commit -m 'feat: add amazing feature'`
8. **Push** to your fork: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add TypeScript types for new features
- Include tests for new functionality
- Update documentation as needed
- Ensure accessibility compliance

### Areas for Contribution
- 🧩 **New Riddles**: Add more brain teasers to the database
- 🎨 **UI Improvements**: Enhance the visual design
- 🔧 **Features**: Add new game mechanics or user features
- 🐛 **Bug Fixes**: Report and fix issues
- 📚 **Documentation**: Improve guides and documentation
- 🌐 **Internationalization**: Add support for other languages

## 📊 Analytics & Monitoring

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **User Experience**: Page load times, interaction delays
- **Error Tracking**: JavaScript errors and debugging

### Privacy-First Analytics
- No personal data collection
- No tracking cookies
- Local storage only for game progress

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod

# Or connect your GitHub repository for automatic deployments
```

### Other Platforms
- **Netlify**: Drag and drop `out/` folder after `bun run build`
- **Cloudflare Pages**: Connect GitHub repository
- **Self-hosted**: Use `bun run build && bun run start`

### Environment Variables
```bash
# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js Team](https://nextjs.org/)** - Amazing React framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn](https://ui.shadcn.com/)** - Beautiful component library
- **[Vercel](https://vercel.com/)** - Excellent hosting platform
- **[Riddle Community](https://riddles.byronwade.com/)** - Our amazing users

## 📞 Support & Contact

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byronwade/riddles.byronwade.com/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/byronwade/riddles.byronwade.com/discussions)
- 📧 **Email**: hello@riddles.byronwade.com
- 🐦 **Twitter**: [@dailyriddles](https://twitter.com/dailyriddles)

---

<div align="center">

**[🎮 Start Playing →](https://riddles.byronwade.com)**

Made with ❤️ by the Daily Riddles Team

⭐ **Star us on GitHub if you love brain teasers!** ⭐

</div>
