# Peoplelytics SaaS - HR Management Platform

A comprehensive, multi-tenant SaaS platform for HR analytics and workforce management.

## 🏗️ Architecture

This is a monorepo containing both frontend and backend applications:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB + TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Redis (optional, for caching)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Environment Setup:**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start Development:**
   ```bash
   npm run dev
   ```

This will start both frontend (port 3000) and backend (port 5000) in development mode.

## 📁 Project Structure

```
peoplelytics-saas/
├── frontend/          # React application
├── backend/           # Node.js API server
└── package.json       # Root workspace configuration
```

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
```

## 🧪 Testing

```bash
npm run test         # Run backend tests
npm run test:backend # Run backend tests specifically
```

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Start Production
```bash
npm run start
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build both applications
- `npm run start` - Start both applications in production
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean all node_modules and build artifacts
- `npm run lint` - Lint both frontend and backend

## 🌐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/peoplelytics
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 📚 Documentation

- [API Documentation](./backend/docs/api/)
- [Database Schema](./backend/docs/database/)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
