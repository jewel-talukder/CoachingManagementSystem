# Coaching Management System - Multi-Tenant SaaS

A production-ready Coaching Management SaaS built with ASP.NET Core Clean Architecture, supporting multiple coaching centers with role-based access control.

## 🏗️ Architecture

- **Clean Architecture** with separation of concerns
- **Multi-Tenancy** - Single database with CoachingId isolation
- **JWT Authentication** with CoachingId in token payload
- **Role-Based Access Control** (Super Admin, Coaching Admin, Teacher, Student)

## 📁 Project Structure

```
CoachingManagementSystem/
├── CoachingManagementSystem.Domain/          # Domain entities and business logic
├── CoachingManagementSystem.Application/     # Application services and DTOs
├── CoachingManagementSystem.Infrastructure/   # Data access, external services
└── CoachingManagementSystem.WebApi/          # API controllers and configuration
```

## 🗄️ Database

- **SQL Server** with Entity Framework Core
- Connection string configured in `appsettings.json`
- Auto-migration on startup
- Seed data for Roles and Plans

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": 1,
  "role": "Teacher",
  "coachingId": 5,
  "email": "user@example.com"
}
```

### Roles
- **Super Admin** - SaaS owner, full system access
- **Coaching Admin** - Manage coaching operations
- **Teacher** - Manage classes, attendance, exams
- **Student** - View courses, attendance, results

## 🚀 Getting Started

### Prerequisites
- .NET 9.0 SDK
- SQL Server (configured in appsettings.json)

### Setup

1. **Update Connection String**
   Edit `CoachingManagementSystem.WebApi/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Your SQL Server connection string"
   }
   ```

2. **Configure JWT Secret**
   Update the JWT key in `appsettings.json`:
   ```json
   "Jwt": {
     "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong",
     "Issuer": "CoachingManagementSystem",
     "Audience": "CoachingManagementSystem",
     "ExpirationHours": "24"
   }
   ```

3. **Run the Application**
   ```bash
   dotnet run --project CoachingManagementSystem.WebApi
   ```

4. **Access Swagger UI**
   Navigate to: `https://localhost:5001/swagger` (or the port shown in console)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register-coaching` - Register new coaching center

### Dashboard
- `GET /api/dashboard/coaching-admin` - Coaching Admin dashboard
- `GET /api/dashboard/teacher` - Teacher dashboard
- `GET /api/dashboard/student` - Student dashboard

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin only)

### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create batch (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/{id}` - Update user (Admin only)

### Enrollments
- `GET /api/enrollments` - Get all enrollments (Admin only)
- `POST /api/enrollments` - Create enrollment (Admin only)
- `PUT /api/enrollments/{id}/complete` - Complete enrollment
- `PUT /api/enrollments/{id}/cancel` - Cancel enrollment

### Attendance
- `GET /api/attendance` - Get attendance (Teacher/Admin)
- `POST /api/attendance` - Mark attendance (Teacher/Admin)
- `GET /api/attendance/student/{id}` - Get student attendance

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam (Teacher/Admin)
- `GET /api/exams/{id}/results` - Get exam results
- `POST /api/exams/{id}/results` - Upload results (Teacher/Admin)
- `GET /api/exams/student/{id}` - Get student exams

### Super Admin
- `GET /api/superadmin/dashboard` - SaaS dashboard
- `GET /api/superadmin/coachings` - Get all coachings
- `PUT /api/superadmin/coachings/{id}/activate` - Activate coaching
- `PUT /api/superadmin/coachings/{id}/block` - Block coaching
- `PUT /api/superadmin/coachings/{id}/assign-plan` - Assign subscription plan

**📖 Full API Documentation:** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🎯 Features Implemented

### ✅ Phase 1 - Backend Foundation
- [x] Clean Architecture structure
- [x] Domain entities (Coaching, User, Role, Student, Teacher, Course, Batch, Subject, Enrollment, Attendance, Exam, Result, Payment, Subscription, Plan)
- [x] SQL Server DbContext with multi-tenancy
- [x] JWT Authentication with CoachingId
- [x] Tenant Middleware for automatic data filtering

### ✅ Phase 2 - Database Design
- [x] All core tables created
- [x] Relationships configured
- [x] Indexes for multi-tenancy
- [x] Soft delete support

### ✅ Phase 3 - Application Layer
- [x] CQRS pattern structure (Commands/Queries)
- [x] Base response pattern
- [x] DTOs for all entities

### ✅ Phase 4 - Super Admin Features
- [x] SaaS Dashboard with statistics
- [x] Coaching Management (View, Activate, Block)
- [x] Subscription Plan Assignment

### ✅ Phase 5 - Coaching Admin Features
- [x] Dashboard with key metrics
- [x] User Management (Create, Update, List)
- [x] Course Management (Create, List)
- [x] Batch Management (Create, List)
- [x] Enrollment Management (Create, Complete, Cancel)

### ✅ Phase 6 - Teacher Features
- [x] Dashboard with assigned batches
- [x] Today's classes view
- [x] Attendance Management (Mark, View)
- [x] Exam Management (Create, View)
- [x] Results Management (Upload, View)

### ✅ Phase 7 - Student Features
- [x] Dashboard with enrollments
- [x] Attendance view with statistics
- [x] Exam schedule and results view

### 🔄 Phase 8 - Frontend (Next.js)
- Ready for Next.js integration
- API documentation provided
- All endpoints tested and working

### ⏳ Phase 9 - Subscription & Billing
- [x] Plan management (seeded)
- [x] Subscription assignment
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Auto-renewal logic

## 🔧 Configuration

### Database Connection
The connection string is configured in `appsettings.json`. The system will automatically create the database schema on first run.

### JWT Settings
Configure JWT settings in `appsettings.json`:
- `Key`: Secret key for signing tokens (minimum 32 characters)
- `Issuer`: Token issuer
- `Audience`: Token audience
- `ExpirationHours`: Token expiration time

## 📝 Next Steps

1. Implement CQRS pattern (Commands/Queries)
2. Add Super Admin controllers
3. Add Coaching Admin controllers
4. Add Teacher controllers
5. Add Student controllers
6. Implement subscription management
7. Add payment gateway integration
8. Build Next.js frontend

## 🛠️ Technologies Used

- **.NET 9.0** - Backend framework
- **Entity Framework Core 9.0** - ORM
- **SQL Server** - Database
- **JWT Bearer** - Authentication
- **Swagger/OpenAPI** - API documentation
- **BCrypt** - Password hashing

## 📄 License

This project is part of a Coaching Management SaaS system.

