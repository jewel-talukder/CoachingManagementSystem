# Coaching Management System - API Documentation

## Base URL
```
https://localhost:5001/api
```

## Authentication
All endpoints (except `/api/auth/*`) require JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token contains:
- `userId`: User ID
- `coachingId`: Coaching/Tenant ID (automatically used for data filtering)
- `role`: User role (Super Admin, Coaching Admin, Teacher, Student)
- `email`: User email

---

## Authentication Endpoints

### Register Coaching
**POST** `/api/auth/register-coaching`

Register a new coaching center and create admin user.

**Request Body:**
```json
{
  "coachingName": "ABC Coaching",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phone": "+1234567890",
  "email": "contact@abccoaching.com",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "adminEmail": "admin@abccoaching.com",
  "adminPassword": "SecurePassword123!",
  "adminPhone": "+1234567890"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "refreshToken": "refresh-token",
  "user": {
    "id": 1,
    "coachingId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "admin@abccoaching.com",
    "roles": ["Coaching Admin"]
  },
  "expiresAt": "2024-01-02T12:00:00Z"
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@abccoaching.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as Register Coaching

---

## Dashboard Endpoints

### Coaching Admin Dashboard
**GET** `/api/dashboard/coaching-admin`
**Roles:** Coaching Admin, Super Admin

**Response:**
```json
{
  "summary": {
    "totalStudents": 150,
    "totalTeachers": 10,
    "totalCourses": 5,
    "totalBatches": 12,
    "activeBatches": 10,
    "totalEnrollments": 180
  },
  "recentEnrollments": [...]
}
```

### Teacher Dashboard
**GET** `/api/dashboard/teacher`
**Roles:** Teacher

**Response:**
```json
{
  "assignedBatches": [...],
  "todayClasses": [...],
  "totalStudents": 45
}
```

### Student Dashboard
**GET** `/api/dashboard/student`
**Roles:** Student

**Response:**
```json
{
  "enrollments": [...],
  "attendanceSummary": {
    "total": 100,
    "present": 85,
    "percentage": 85.0
  },
  "upcomingExams": [...]
}
```

---

## Courses Endpoints

### Get All Courses
**GET** `/api/courses?isActive=true`
**Roles:** All authenticated users

**Query Parameters:**
- `isActive` (optional): Filter by active status

**Response:**
```json
[
  {
    "id": 1,
    "name": "Mathematics",
    "description": "Advanced Mathematics",
    "code": "MATH101",
    "fee": 5000.00,
    "durationMonths": 6,
    "isActive": true,
    "teacherId": 1,
    "teacherName": "John Smith",
    "subjectCount": 5,
    "enrollmentCount": 25
  }
]
```

### Create Course
**POST** `/api/courses`
**Roles:** Coaching Admin, Super Admin

**Request Body:**
```json
{
  "name": "Mathematics",
  "description": "Advanced Mathematics Course",
  "code": "MATH101",
  "fee": 5000.00,
  "durationMonths": 6,
  "teacherId": 1
}
```

---

## Batches Endpoints

### Get All Batches
**GET** `/api/batches?courseId=1&isActive=true`
**Roles:** All authenticated users

**Query Parameters:**
- `courseId` (optional): Filter by course
- `isActive` (optional): Filter by active status

### Create Batch
**POST** `/api/batches`
**Roles:** Coaching Admin, Super Admin

**Request Body:**
```json
{
  "name": "Morning Batch A",
  "code": "BATCH001",
  "description": "Morning session",
  "courseId": 1,
  "teacherId": 1,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-06-30T00:00:00Z",
  "maxStudents": 30,
  "scheduleDays": "[\"Monday\", \"Wednesday\", \"Friday\"]",
  "startTime": "09:00:00",
  "endTime": "11:00:00"
}
```

---

## Users Endpoints

### Get All Users
**GET** `/api/users?role=Teacher&isActive=true`
**Roles:** Coaching Admin, Super Admin

**Query Parameters:**
- `role` (optional): Filter by role name
- `isActive` (optional): Filter by active status

### Create User
**POST** `/api/users`
**Roles:** Coaching Admin, Super Admin

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "phone": "+1234567890",
  "roleIds": [3],
  "userType": "Teacher",
  "additionalData": {
    "employeeCode": "EMP001",
    "qualification": "M.Sc Mathematics",
    "specialization": "Algebra"
  }
}
```

**User Types:**
- `"Teacher"` - Creates Teacher record
- `"Student"` - Creates Student record

### Update User
**PUT** `/api/users/{id}`
**Roles:** Coaching Admin, Super Admin

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe Updated",
  "phone": "+1234567890",
  "isActive": true,
  "roleIds": [3, 4]
}
```

---

## Enrollments Endpoints

### Get All Enrollments
**GET** `/api/enrollments?courseId=1&batchId=1&studentId=1&status=Active`
**Roles:** Coaching Admin, Super Admin

### Create Enrollment
**POST** `/api/enrollments`
**Roles:** Coaching Admin, Super Admin

**Request Body:**
```json
{
  "studentId": 1,
  "courseId": 1,
  "batchId": 1,
  "feePaid": 5000.00,
  "totalFee": 5000.00
}
```

### Complete Enrollment
**PUT** `/api/enrollments/{id}/complete`
**Roles:** Coaching Admin, Super Admin

### Cancel Enrollment
**PUT** `/api/enrollments/{id}/cancel`
**Roles:** Coaching Admin, Super Admin

---

## Attendance Endpoints

### Get Attendance
**GET** `/api/attendance?batchId=1&date=2024-01-15`
**Roles:** Teacher, Coaching Admin, Super Admin

**Query Parameters:**
- `batchId` (required)
- `date` (optional): Filter by date

### Mark Attendance
**POST** `/api/attendance`
**Roles:** Teacher, Coaching Admin, Super Admin

**Request Body:**
```json
{
  "batchId": 1,
  "date": "2024-01-15T00:00:00Z",
  "attendanceItems": [
    {
      "studentId": 1,
      "status": "Present",
      "remarks": "On time"
    },
    {
      "studentId": 2,
      "status": "Absent",
      "remarks": "Sick"
    }
  ]
}
```

**Status Values:** `Present`, `Absent`, `Late`, `Excused`

### Get Student Attendance
**GET** `/api/attendance/student/{studentId}?batchId=1&startDate=2024-01-01&endDate=2024-01-31`
**Roles:** All authenticated users

**Response:**
```json
{
  "attendance": [...],
  "statistics": {
    "total": 30,
    "present": 25,
    "absent": 5,
    "percentage": 83.33
  }
}
```

---

## Exams Endpoints

### Get All Exams
**GET** `/api/exams?subjectId=1&isActive=true`
**Roles:** All authenticated users

### Create Exam
**POST** `/api/exams`
**Roles:** Teacher, Coaching Admin, Super Admin

**Request Body:**
```json
{
  "subjectId": 1,
  "teacherId": 1,
  "name": "Mid-Term Exam",
  "description": "Mid-term examination",
  "examType": "MidTerm",
  "examDate": "2024-03-15T00:00:00Z",
  "startTime": "10:00:00",
  "endTime": "12:00:00",
  "totalMarks": 100,
  "passingMarks": 40
}
```

**Exam Types:** `Regular`, `MidTerm`, `Final`

### Get Exam Results
**GET** `/api/exams/{id}/results`
**Roles:** Teacher, Coaching Admin, Super Admin

### Upload Results
**POST** `/api/exams/{id}/results`
**Roles:** Teacher, Coaching Admin, Super Admin

**Request Body:**
```json
{
  "results": [
    {
      "studentId": 1,
      "marksObtained": 85,
      "remarks": "Excellent"
    },
    {
      "studentId": 2,
      "marksObtained": 65,
      "remarks": "Good"
    }
  ]
}
```

### Get Student Exams
**GET** `/api/exams/student/{studentId}`
**Roles:** All authenticated users

---

## Super Admin Endpoints

### Get Dashboard
**GET** `/api/superadmin/dashboard`
**Roles:** Super Admin

### Get All Coachings
**GET** `/api/superadmin/coachings?isActive=true&isBlocked=false`
**Roles:** Super Admin

### Activate Coaching
**PUT** `/api/superadmin/coachings/{id}/activate`
**Roles:** Super Admin

### Block Coaching
**PUT** `/api/superadmin/coachings/{id}/block`
**Roles:** Super Admin

### Assign Plan
**PUT** `/api/superadmin/coachings/{id}/assign-plan`
**Roles:** Super Admin

**Request Body:**
```json
{
  "planId": 2,
  "autoRenew": true
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "errors": ["Additional error details"]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Multi-Tenancy

All data is automatically filtered by `coachingId` from the JWT token. You don't need to pass `coachingId` in requests - it's extracted automatically from the authenticated user's token.

---

## Next.js Integration Example

```typescript
// api.ts
const API_BASE_URL = 'https://localhost:5001/api';

export const api = {
  async get<T>(endpoint: string, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Usage
const courses = await api.get('/courses', token);
const newCourse = await api.post('/courses', courseData, token);
```

