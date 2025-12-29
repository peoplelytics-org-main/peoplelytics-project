# User Storage and Login Architecture

## Where Users Are Stored

### ✅ **ALL Users Stored in Master Database**

**Database**: `master_db` (or `peoplelytics_core` depending on configuration)  
**Collection**: `users`  
**Location**: MongoDB instance at `mongodb://localhost:27017/master_db`

### User Types Stored in Master Database:

1. **Super Admin** - Stored in `master_db.users`
   - `organizationId`: `"root"` (or the root organization ID)
   - `role`: `"Super Admin"`

2. **Org Admin** - Stored in `master_db.users`
   - `organizationId`: `"org_xxx"` (their organization ID)
   - `role`: `"Org Admin"`

3. **HR Analyst** - Stored in `master_db.users`
   - `organizationId`: `"org_xxx"` (their organization ID)
   - `role`: `"HR Analyst"`

4. **Executive** - Stored in `master_db.users`
   - `organizationId`: `"org_xxx"` (their organization ID)
   - `role`: `"Executive"`

## Database Architecture

```
MongoDB Instance
│
├── master_db (or peoplelytics_core)
│   ├── users (collection) ← ALL USERS STORED HERE
│   │   ├── Super Admin users
│   │   ├── Org Admin users
│   │   ├── HR Analyst users
│   │   └── Executive users
│   └── organizations (collection)
│       └── Organization metadata
│
└── org_{orgId} (Per Organization)
    ├── employees (collection)
    ├── attendance (collection)
    ├── skills (collection)
    └── ... (tenant-specific data only)
```

## Login Flow (Same for All User Types)

### Single Login Endpoint for All Users

**Endpoint**: `POST /api/auth/login`

**How It Works:**

1. **User submits credentials** (username/email + password)
2. **Backend queries master_db.users** collection
3. **Finds user by username OR email**
4. **Validates password** using bcrypt
5. **Checks if user is active**
6. **Generates JWT token** with user info including:
   - `id`: User ID
   - `username`: Username
   - `role`: User role (Super Admin, Org Admin, HR Analyst, Executive)
   - `organizationId`: Organization ID (if applicable)
   - `permissions`: User permissions
7. **Sets HTTP-only cookie** with JWT token
8. **Returns user data** to frontend

### Login Code Flow

```typescript
// 1. User submits login
POST /api/auth/login
{
  "username": "rafay@farooq.com",
  "password": "12345678"
}

// 2. Backend queries master_db
const user = await User.findOne({ 
  $or: [
    { username: "rafay@farooq.com" },
    { "profile.email": "rafay@farooq.com" }
  ]
}).select("+password");

// 3. Validates password
const isMatch = await bcrypt.compare(password, user.password);

// 4. Generates token (same for all roles)
const token = generateToken(user); // Includes role, organizationId, etc.

// 5. Sets cookie and returns user data
res.cookie("token", token, { httpOnly: true });
return res.json({ user: { ...user, role, organizationId } });
```

## User Creation Flow

### When Super Admin Creates User for Organization

**Endpoint**: `POST /api/organizations/{orgId}/add-user`

**What Happens:**

1. **Validates organization exists** in `master_db.organizations`
2. **Checks if username/email already exists** in `master_db.users`
3. **Hashes password** using bcrypt
4. **Creates user in master_db.users** with:
   ```javascript
   {
     username: "rafay@farooq.com",
     password: "$2a$10$...", // hashed
     role: "Org Admin",
     organizationId: "org_farooq1764862744591_8774",
     organizationName: "Farooq Corp",
     isActive: true,
     profile: {
       firstName: "Rafay",
       lastName: "User",
       email: "rafay@farooq.com"
     },
     permissions: ["read", "write", "edit", "delete"],
     preferences: { theme: "light", ... }
   }
   ```
5. **User is now in master_db.users** and can login using the same endpoint

## Key Points

### ✅ Single Source of Truth
- **ALL users** (regardless of role) are stored in `master_db.users`
- **NO users** are stored in organization databases
- Organization databases (`org_xxx`) only contain tenant-specific data (employees, attendance, etc.)

### ✅ Unified Login
- **Same login endpoint** (`/api/auth/login`) for all user types
- **Same authentication logic** for all roles
- **Same JWT token format** for all users
- **Same cookie-based session** for all users

### ✅ Role-Based Access
- User's `role` is stored in the user document
- User's `organizationId` determines which organization's data they can access
- Middleware checks `role` and `organizationId` to enforce access control

### ✅ Multi-Tenant Isolation
- Users are associated with organizations via `organizationId`
- When accessing tenant data, middleware:
  1. Extracts `organizationId` from JWT or request
  2. Connects to the correct `org_{orgId}` database
  3. Queries tenant-specific collections (employees, attendance, etc.)

## Example: Complete User Journey

### 1. Super Admin Creates User
```bash
POST /api/organizations/org_farooq1764862744591_8774/add-user
{
  "username": "rafay@farooq.com",
  "password": "12345678",
  "role": "Org Admin"
}
```

**Result**: User created in `master_db.users` with `organizationId: "org_farooq1764862744591_8774"`

### 2. User Logs In
```bash
POST /api/auth/login
{
  "username": "rafay@farooq.com",
  "password": "12345678"
}
```

**Result**: 
- User found in `master_db.users`
- Password validated
- JWT token generated with `role: "Org Admin"` and `organizationId: "org_farooq1764862744591_8774"`
- Cookie set with token
- User data returned

### 3. User Accesses Data
```bash
GET /api/employees
Headers: { Cookie: "token=..." }
```

**Result**:
- Middleware extracts `organizationId` from JWT
- Connects to `org_farooq1764862744591_8774` database
- Queries `employees` collection from that database
- Returns organization-specific data

## Verification

To verify where users are stored:

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/master_db

# Check users collection
db.users.find().pretty()

# You should see ALL users (Super Admin, Org Admin, HR Analyst, Executive)
# All with their respective organizationId and role
```

## Summary

✅ **All users stored in**: `master_db.users`  
✅ **All users login via**: `POST /api/auth/login`  
✅ **Same authentication logic**: For all user types  
✅ **Role-based access**: Enforced via JWT token  
✅ **Multi-tenant isolation**: Via organizationId in JWT  

**No users are stored in organization databases!** Organization databases only contain tenant-specific business data.



