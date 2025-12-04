# Peoplelytics API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Last Updated:** December 4, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Organizations Management](#organizations-management)
3. [Employees API](#employees-api)
4. [Attendance API](#attendance-api)
5. [Skills API](#skills-api)
6. [Job Positions API](#job-positions-api)
7. [Analytics API](#analytics-api)
8. [Advanced Analytics API](#advanced-analytics-api)
9. [Reports API](#reports-api)
10. [Recruitment Funnels API](#recruitment-funnels-api)
11. [Performance Reviews API](#performance-reviews-api)
12. [Exit Interviews API](#exit-interviews-api)
13. [File Upload API](#file-upload-api)
14. [Error Handling](#error-handling)

---

## Authentication

All API endpoints (except `/api/auth/login`) require authentication via JWT token sent as:
- **Cookie:** `token` (HTTP-only cookie, automatically set on login)
- **Header:** `Authorization: Bearer <token>`

### Login

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "SuperAdminP@ss123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "superadmin",
    "role": "Super Admin",
    "organizationId": "root"
  }
}
```

---

## Organizations Management

### Get All Organizations

**GET** `/api/organizations`

**Query Parameters:**
- `status` (optional): Filter by status (`Active` | `Inactive`)
- `package` (optional): Filter by package (`Basic` | `Intermediate` | `Pro` | `Enterprise`)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "orgId": "org_acme-1234567890",
      "name": "ACME Corp",
      "package": "Pro",
      "status": "Active",
      "subscriptionStartDate": "2024-01-01T00:00:00.000Z",
      "subscriptionEndDate": "2024-12-31T23:59:59.999Z",
      "employeeCount": 150
    }
  ]
}
```

### Get Organization by ID

**GET** `/api/organizations/:orgId`

**Response:**
```json
{
  "success": true,
  "data": {
    "orgId": "org_acme-1234567890",
    "name": "ACME Corp",
    "package": "Pro",
    "status": "Active",
    "databaseStats": {
      "databaseSize": 52428800,
      "collectionCount": 8,
      "documentCounts": {
        "employees": 150,
        "attendance": 4500
      }
    }
  }
}
```

### Create Organization

**POST** `/api/organizations/add-organization`

**Request Body:**
```json
{
  "name": "New Company",
  "package": "Pro",
  "duration": 12,
  "subscriptionStartDate": "2024-01-01T00:00:00.000Z",
  "subscriptionEndDate": "2024-12-31T23:59:59.999Z"
}
```

**Response:**
```json
{
  "message": "Organization created successfully",
  "org": {
    "orgId": "org_new-company-1234567890",
    "name": "New Company",
    "package": "Pro",
    "status": "Active"
  }
}
```

### Update Organization

**PUT** `/api/organizations/:orgId`

**Request Body:**
```json
{
  "package": "Enterprise",
  "employeeCount": 200
}
```

### Deactivate Organization

**PATCH** `/api/organizations/:orgId/deactivate`

### Activate Organization

**PATCH** `/api/organizations/:orgId/activate`

### Delete Organization (Hard Delete)

**DELETE** `/api/organizations/:orgId/hard`

**Request Body:**
```json
{
  "confirm": "DELETE"
}
```

### Get Organization Statistics

**GET** `/api/organizations/:orgId/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "databaseSize": 52428800,
    "collectionCount": 8,
    "documentCounts": {
      "employees": 150,
      "attendance": 4500,
      "skills": 300
    }
  }
}
```

### Check Organization Health

**GET** `/api/organizations/:orgId/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "organizationName": "ACME Corp",
    "orgId": "org_acme-1234567890",
    "status": "Active",
    "databaseExists": true,
    "databaseHealth": "healthy"
  }
}
```

---

## Employees API

### Get All Employees

**GET** `/api/employees`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `department` (optional): Filter by department
- `location` (optional): Filter by location
- `jobTitle` (optional): Filter by job title
- `isActive` (optional): Filter by active status (`true` | `false`)
- `search` (optional): Search in name or employeeId
- `managerId` (optional): Filter by manager ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "EMP001",
      "name": "John Doe",
      "department": "Engineering",
      "jobTitle": "Software Engineer",
      "location": "Remote",
      "hireDate": "2023-01-15T00:00:00.000Z",
      "gender": "Male",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Get Employee by ID

**GET** `/api/employees/:employeeId`

### Create Employee

**POST** `/api/employees`

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "department": "Engineering",
  "jobTitle": "Software Engineer",
  "location": "Remote",
  "hireDate": "2023-01-15T00:00:00.000Z",
  "gender": "Other"
}
```

### Update Employee

**PUT** `/api/employees/:employeeId`

### Delete Employee

**DELETE** `/api/employees/:employeeId`

### Get Employee Statistics

**GET** `/api/employees/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 145,
    "byDepartment": {
      "Engineering": 50,
      "Sales": 30
    },
    "byLocation": {
      "Remote": 100,
      "Office": 50
    }
  }
}
```

---

## Attendance API

### Get All Attendance Records

**GET** `/api/attendance`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `employeeId` (optional): Filter by employee ID
- `status` (optional): Filter by status (`Present` | `Unscheduled Absence` | `PTO` | `Sick Leave`)
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

### Create Attendance Record

**POST** `/api/attendance`

**Request Body:**
```json
{
  "attendanceId": "ATT001",
  "employeeId": "EMP001",
  "date_time_in": "2024-12-01T09:00:00.000Z",
  "status": "Present"
}
```

### Get Attendance Summary

**GET** `/api/attendance/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 4500,
    "present": 4000,
    "absent": 500,
    "attendanceRate": 88.89
  }
}
```

---

## Analytics API

### Get Analytics Metrics

**GET** `/api/analytics`

**Query Parameters:**
- `metricType` (optional): Filter by metric type
- `period` (optional): Filter by period (`monthly` | `quarterly` | `yearly`)

### Calculate Analytics Metric

**POST** `/api/analytics/calculate`

**Request Body:**
```json
{
  "metricType": "turnover_rate",
  "period": "monthly"
}
```

### Get Dashboard Analytics

**GET** `/api/analytics/dashboard`

**Query Parameters:**
- `period` (optional): Period for calculations (default: `monthly`)

**Response:**
```json
{
  "success": true,
  "data": {
    "turnoverRate": 5.2,
    "averageTenure": 3.5,
    "attendanceRate": 95.5,
    "headcount": 150,
    "breakdown": {
      "byDepartment": {
        "Engineering": 50,
        "Sales": 30
      },
      "byGender": {
        "Male": 80,
        "Female": 70
      },
      "byLocation": {
        "Remote": 100,
        "Office": 50
      }
    }
  }
}
```

---

## Advanced Analytics API

### Get Advanced Analytics

**GET** `/api/analytics/advanced`

**Response:**
```json
{
  "success": true,
  "data": {
    "currentMetrics": {
      "turnoverRate": 5.2,
      "averageTenure": 3.5,
      "attendanceRate": 95.5,
      "headcount": 150
    },
    "predictions": {
      "turnover": {
        "predictedTurnover": 6.5,
        "confidence": 0.75,
        "trend": "increasing"
      },
      "headcount": {
        "current": 150,
        "forecasted": 165,
        "confidence": 0.70
      }
    },
    "trends": {
      "turnover": {
        "current": 5.2,
        "previous": 4.8,
        "changePercent": 8.33,
        "trend": "up"
      },
      "headcount": {
        "current": 150,
        "previous": 145,
        "changePercent": 3.45,
        "trend": "up"
      }
    }
  }
}
```

### Get Predictive Analytics

**GET** `/api/analytics/predictive`

**Query Parameters:**
- `months` (optional): Forecast period in months (default: 6)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictedTurnover": 6.5,
    "confidence": 0.75,
    "factors": [
      "Increasing termination trend detected",
      "High current turnover rate"
    ],
    "trend": "increasing"
  }
}
```

### Get Trend Analysis

**GET** `/api/analytics/trends`

**Query Parameters:**
- `metricType` (optional): Metric type (default: `turnover_rate`)
- `periods` (optional): Number of periods to analyze (default: 6)

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 5.2,
    "previous": 4.8,
    "change": 0.4,
    "changePercent": 8.33,
    "trend": "up",
    "dataPoints": [
      { "period": "monthly", "value": 4.8 },
      { "period": "monthly", "value": 5.2 }
    ]
  }
}
```

### Get Forecast

**GET** `/api/analytics/forecast`

**Query Parameters:**
- `months` (optional): Forecast period in months (default: 6)

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 150,
    "forecasted": 165,
    "confidence": 0.70,
    "factors": [
      "Positive growth trend",
      "Small sample size - lower confidence"
    ]
  }
}
```

---

## Reports API

### Generate Report

**POST** `/api/reports/generate`

**Request Body:**
```json
{
  "name": "Monthly Turnover Report",
  "type": "turnover",
  "parameters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

### Get All Reports

**GET** `/api/reports`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by report type
- `status` (optional): Filter by status

---

## File Upload API

### Upload Employees CSV/Excel

**POST** `/api/upload/employees`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: CSV or Excel file containing employee data

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "data": {
    "totalRows": 100,
    "successful": 95,
    "failed": 5,
    "errors": [
      "Row 10: Missing required field 'name'",
      "Row 25: Invalid date format"
    ]
  }
}
```

### Upload Attendance CSV/Excel

**POST** `/api/upload/attendance`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: CSV or Excel file containing attendance data

---

## Error Handling

All API endpoints follow a consistent error response format:

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "errors": [
    "Validation error 1",
    "Validation error 2"
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

**Common Error Codes:**
- `MISSING_ORG_ID` - Organization ID is required
- `INVALID_ORG_ID` - Organization ID is invalid
- `ORG_NOT_FOUND` - Organization not found
- `VALIDATION_ERROR` - Request validation failed
- `DUPLICATE_RESOURCE` - Resource already exists

---

## Multi-Tenancy

All tenant-specific APIs automatically:
1. Extract organization ID from JWT token, headers, or query parameters
2. Connect to the correct organization database
3. Isolate data per organization
4. Prevent cross-tenant data access

**Organization ID Sources (in order of priority):**
1. `X-Organization-Id` header
2. `organizationId` query parameter
3. JWT token payload (`organizationId` field)
4. Subdomain (if configured)

---

## Rate Limiting

Authentication endpoints are rate-limited to prevent brute force attacks:
- **Limit:** 10 requests per 15 minutes per IP
- **Response:** `429 Too Many Requests` when limit exceeded

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 1000)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## Data Formats

### Dates
- All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2024-12-01T09:00:00.000Z`

### IDs
- Employee IDs: Custom string (e.g., `EMP001`)
- Attendance IDs: Custom string (e.g., `ATT001`)
- Organization IDs: Auto-generated (e.g., `org_acme-1234567890`)
- MongoDB IDs: 24-character hex string (e.g., `507f1f77bcf86cd799439011`)

---

## Testing

Comprehensive test scripts are available:
- `test_priority1_apis.py` - Priority 1 APIs (Recruitment, Performance, Exit Interviews)
- `test_priority2_apis.py` - Priority 2 APIs (File Upload, E2E Workflows)
- `test_priority3_apis.py` - Priority 3 APIs (Organizations, Advanced Analytics)

Run tests:
```bash
cd backend
python3 test_priority3_apis.py
```

---

**Last Updated:** December 4, 2025  
**Maintained by:** Peoplelytics Development Team



