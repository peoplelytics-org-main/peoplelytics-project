# Peoplelytics - Complete Project Documentation

## 📋 Overview

Peoplelytics is a comprehensive multi-tenant SaaS platform for HR analytics and workforce management. It provides advanced people analytics features including interactive dashboards, HR metrics calculators, ROI analysis, and AI-powered insights to support HR and executive decision-making.

**Version:** 3.4  
**Type:** Multi-tenant SaaS Platform  
**Architecture:** Monorepo (Frontend + Backend)

---

## 🏗️ Architecture

### System Architecture
- **Multi-tenant Architecture:** Each organization has its own database (`org_<orgId>`) while sharing a master database for organizations and users
- **Database Strategy:** 
  - `master_db`: Stores organizations, users, and shared data
  - `org_<orgId>`: Tenant-specific databases for each organization
- **Authentication:** JWT-based authentication with role-based access control (RBAC)

### Tech Stack

#### Frontend
- **Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 6.2.0
- **Routing:** React Router DOM 6.23.1
- **UI Components:** Custom components with Lucide React icons
- **Charts:** Chart.js 4.4.3 with React Chart.js 2
- **AI Integration:** Google Gemini AI (@google/genai 1.13.0)
- **Data Processing:** XLSX, PapaParse for CSV/Excel handling
- **PDF Export:** jsPDF, html2canvas

#### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 4.21.2
- **Database:** MongoDB 8.0.3 (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken), bcryptjs for password hashing
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** express-validator, Joi
- **Logging:** Winston, Morgan
- **Email:** Nodemailer
- **Queue Management:** Bull (Redis-based)
- **File Upload:** Multer

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (running locally or remote)
- Redis (optional, for job queues)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Backend - Create .env file
   cd backend
   cp env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   # Frontend - Create .env file
   cd frontend
   # Create .env with VITE_GEMINI_API_KEY
   ```

3. **Database Setup**
   ```bash
   cd backend
   npm run seed  # Seeds master_db with initial data
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev  # Runs on http://localhost:5000
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev  # Runs on http://localhost:3000
   ```

### Default Login Credentials
- **Super Admin:**
  - Email: `admin@peoplelytics.com`
  - Password: `SuperAdminP@ss123!`

---

## 📁 Project Structure

```
Peoplelytics-development/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, tenant middleware
│   │   ├── models/          # Mongoose models
│   │   │   ├── shared/      # User, Organization models
│   │   │   └── tenant/      # Tenant-specific models
│   │   ├── routes/          # API routes
│   │   ├── seeders/         # Database seeders
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Helpers, logger
│   ├── docs/                # Database schemas, documentation
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── reports/         # Report components
│   │   ├── predictions/     # Predictive analytics
│   │   └── user-management/ # User management UI
│   ├── contexts/            # React contexts (Auth, Data, Theme)
│   ├── pages/               # Page components
│   ├── services/            # API services, calculations
│   ├── constants/           # Constants, mock data
│   └── .env                 # Frontend environment variables
│
└── PROJECT_DOCUMENTATION.md # This file
```

---

## 🔑 Key Features

### 1. User Management & Authentication
- Multi-role system: Super Admin, Org Admin, HR Analyst, Executive
- Role-based permissions and access control
- JWT-based authentication with secure cookies
- User CRUD operations per organization

### 2. Organization Management
- Create, update, delete organizations
- Subscription packages: Basic, Intermediate, Pro, Enterprise
- Feature flags per package
- Headcount limits and role limits
- Soft delete and restore functionality

### 3. Dashboard & Analytics
- Interactive dashboards with 20+ widgets
- Real-time metrics and KPIs
- Department-wise analytics
- Performance trends and distributions
- Turnover analysis by department, location, tenure
- Headcount heatmaps and diversity metrics

### 4. HR Metrics Calculators
- **Employee Metrics:** Performance, engagement, retention
- **HR Operations:** Turnover rate, time-to-fill, cost-per-hire
- **Compensation:** Pay equity, compensation ratios
- **Recruitment:** Funnel metrics, conversion rates
- **Retention:** First-year retention, voluntary turnover
- **Skills:** Skill gaps, proficiency levels

### 5. Predictive Analytics
- Turnover risk prediction
- Performance forecasting
- KPI forecasting
- Burnout risk modeling

### 6. AI Assistant (Tariq)
- Gemini AI-powered HR analyst
- Natural language queries about HR data
- Function calling for data analysis
- Context-aware responses

### 7. Reports & Export
- Standard HR reports
- Custom report generation
- PDF and Excel export
- Org chart explorer
- Talent risk matrix
- Nine-box grid for performance
- Super Admin reports

### 8. Data Management
- CSV/Excel import and export
- Data conversion tools
- Integration capabilities
- Data analysis tools

### 9. ROI Analyzer
- HR investment ROI calculations
- Cost-benefit analysis
- Training ROI
- Recruitment ROI

### 10. Customization
- Organization settings
- Permission management
- Theme customization
- Dashboard configuration

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Organizations (`/api/organizations`)
- `POST /api/organizations/add-organization` - Create organization
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/:orgId` - Get organization details
- `PUT /api/organizations/:orgId` - Update organization
- `PATCH /api/organizations/:orgId/deactivate` - Soft delete
- `DELETE /api/organizations/:orgId/hard` - Permanent delete
- `PATCH /api/organizations/:orgId/activate` - Restore organization
- `GET /api/organizations/databases/list` - List all org databases

### Organization Users (`/api/organizations/:orgId`)
- `POST /api/organizations/:orgId/add-user` - Add user to org
- `GET /api/organizations/:orgId/allusers` - Get all users
- `GET /api/organizations/:orgId/users/:userId` - Get user by ID
- `PUT /api/organizations/:orgId/users/:userId` - Update user
- `DELETE /api/organizations/:orgId/delete-user/:userId` - Delete user

---

## 🗄️ Database Schema

### Master Database (`master_db`)

#### Organizations Collection
- `orgId` (String, unique) - Organization identifier
- `name` (String) - Organization name
- `package` (Enum) - Subscription package
- `status` (Enum) - Active/Inactive
- `subscriptionStartDate`, `subscriptionEndDate` (Date)
- `employeeCount` (Number)
- `features` (Object) - Feature flags
- `settings` (Object) - Organization settings

#### Users Collection
- `username` (String, unique)
- `password` (String, hashed)
- `role` (Enum) - Super Admin, Org Admin, HR Analyst, Executive
- `organizationId` (String) - Reference to organization
- `profile` (Object) - firstName, lastName, email, phone
- `permissions` (Array) - Role-based permissions
- `isActive` (Boolean)
- `preferences` (Object) - User preferences

### Tenant Databases (`org_<orgId>`)

Each organization has its own database with collections:
- `employees` - Employee data
- `attendance` - Attendance records
- `departments` - Department information
- `performanceReviews` - Performance data
- `recruitmentFunnels` - Recruitment data
- `exitInterviews` - Exit interview data
- `skills` - Skills and competencies
- `analytics` - Analytics data
- `reports` - Generated reports
- `jobPositions` - Job positions and openings

---

## 👥 User Roles & Permissions

### Super Admin
- Manage platform-wide settings
- Manage all organizations
- Manage subscriptions
- View system logs
- Full access to all features

### Org Admin
- Manage tenant users
- Manage departments
- Manage employees
- View all analytics
- Configure organization settings
- Manage performance reviews

### HR Analyst
- View employees
- View analytics
- Export reports
- Manage attendance

### Executive
- View dashboard
- View report summaries
- View high-level analytics

---

## 📦 Subscription Packages

### Basic
- Headcount Limit: 150
- Features: User Management, Employee Metrics, HR Metrics

### Intermediate
- Headcount Limit: 300
- Features: Basic + ROI Analyzer, Advanced Reports, AI Story

### Pro
- Headcount Limit: 750
- Features: Intermediate + Predictive Analytics, AI Assistant, Customization, Key Driver Analysis, Succession Planning

### Enterprise
- Headcount Limit: Unlimited
- Features: Pro + Integrations

---

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/master_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend (.env)
```env
VITE_GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript
npm run start        # Production server
npm run seed         # Seed database
npm run lint         # Lint code
npm run test         # Run tests
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 📊 Key Components

### Frontend Pages
- `LandingPage` - Public landing page
- `LoginPage` - Authentication
- `HomePage` - User home dashboard
- `DashboardPage` - Main analytics dashboard
- `DataManagementPage` - Data import/export
- `UserManagementPage` - User and org management
- `ReportsPage` - Report generation
- `PredictiveAnalyticsPage` - Predictive models
- `AIAssistantPage` - AI chat interface
- `ROIAnalyzerPage` - ROI calculations
- `CalculatorsPage` - HR metrics calculators
- `ProfilesListPage` - Employee profiles
- `CustomizationPage` - Settings and customization

### Backend Services
- `databaseService` - Multi-tenant database management
- `authController` - Authentication logic
- `orgController` - Organization management
- `addUserToOrganization` - User management

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js for security headers
- Input validation with express-validator
- Role-based access control (RBAC)
- HTTP-only cookies for tokens

---

## 📈 Performance & Scalability

- Multi-tenant database architecture
- Connection pooling for MongoDB
- Redis for caching and job queues
- Compression middleware
- Efficient indexing on database collections
- Lazy loading for AI services
- Code splitting in frontend

---

## 🧪 Testing

- Backend: Jest for unit tests
- API testing with Supertest
- Test coverage reporting
- Frontend: Component testing (to be implemented)

---

## 🚢 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ folder with web server
```

### Environment Setup
- Set production environment variables
- Configure MongoDB connection string
- Set up Redis for production
- Configure CORS for production domain
- Set secure JWT secret
- Enable HTTPS

---

## 📝 Notes

- The application uses a multi-tenant architecture where each organization has isolated data
- AI features require a Gemini API key
- Database seeding creates initial Super Admin user
- All sensitive data should be stored securely
- Regular backups recommended for production databases

---

## 📞 Support

For issues, questions, or contributions, please refer to the repository's issue tracker or contact the development team.

---

**Last Updated:** November 2025  
**Maintained by:** Peoplelytics Development Team



