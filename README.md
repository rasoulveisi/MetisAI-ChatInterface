# MetisAI ChatInterface

MetisAI ChatInterface is a professional chatbot web application designed to seamlessly connect with the Metis AI platform. By simply providing your API key and bot ID, you can instantly interact with your custom AI bot through a modern, user-friendly web interface. This application empowers developers and businesses to deploy, manage, and share their AI-powered chatbots as standalone web applications, making it easy to showcase and distribute intelligent conversational agents to end users or clients.

Whether you're building advanced support bots, virtual assistants, or custom AI solutions, MetisAI ChatInterface streamlines the integration and sharing process—no complex setup required. Share your developed AI bot with a unique website link, and deliver a polished, branded experience to your audience.

## 🚀 Features

- ⚡️ **Modern React 19** - Built with the latest React features and performance optimizations
- 🎨 **Tailwind CSS v4** - Utility-first styling with Lightning CSS for optimal performance
- 📦 **Zustand State Management** - Lightweight and efficient state management solution
- 🔄 **Real-time Chat Interface** - Seamless messaging experience with optimistic updates
- 🌐 **API Integration** - Easy integration with Metis AI platform via REST APIs
- 📱 **Responsive Design** - Perfect experience across desktop, tablet, and mobile devices
- 🔧 **TypeScript** - Full type safety and enhanced developer experience
- ⚡️ **Vite Build System** - Lightning-fast development and build process
- 📅 **Date Utilities** - Enhanced date handling with date-fns integration
- 🎭 **Custom Animations** - Smooth transitions and micro-interactions

## Getting Started

### Prerequisites

- **Node.js** v20 or higher (recommended for compatibility with Tailwind v4 and Lightning CSS)
- **npm** v9 or higher

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd MetisAI-ChatInterface
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

### Development

Start the development server:
```sh
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173) (or as indicated in your terminal).

### Building for Production

```sh
npm run build
```
The output will be in the `dist` folder.

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
src/
  assets/         # Static assets
  components/     # React components
  services/       # API and data services
  store/          # Zustand stores
  types/          # TypeScript types
  App.tsx         # Main app component
  main.tsx        # Entry point
  index.css       # Tailwind CSS imports and custom styles
```

## Tailwind CSS Setup

- **Config:** See [`tailwind.config.js`](./tailwind.config.js) for custom colors and animations.
- **Usage:** Tailwind is imported in [`src/index.css`](./src/index.css) with:
  ```css
  @import "tailwindcss";
  @config "../tailwind.config.js";
  ```

## Vite Configuration

- See [`vite.config.ts`](./vite.config.ts) for Vite and React plugin setup.

## Deployment Notes

- Ensure your deployment environment uses **Node.js v20+** for compatibility with Tailwind v4 and Lightning CSS ([Tailwind CSS compatibility docs](https://tailwindcss.com/docs/compatibility)).
- **If deploying to Netlify, you must explicitly select Node 20 in your Netlify site settings (Site settings → Build & deploy → Environment → Node version).** Setting the Node version in environment variables or `package.json` alone is not sufficient.

## License

MIT
