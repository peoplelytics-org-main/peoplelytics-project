# Multi-Tenant Database Architecture

## Concept Overview

When a **Super Admin creates an organization**, the system automatically creates a **separate MongoDB database** for that organization. This ensures complete data isolation between organizations.

## How It Works

### 1. Organization Creation Flow

When a Super Admin creates an organization via `POST /api/organizations/add-organization`:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Create Organization Record                               │
│    - Store org metadata in master_db (peoplelytics_core)     │
│    - Generate unique orgId (e.g., "org_acme-corp_1234567890")│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Create Organization Database                             │
│    - Database name: "org_{normalizedOrgId}"                 │
│    - Example: "org_acme-corp_1234567890"                    │
│    - MongoDB creates database lazily (on first write)      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Initialize Collections                                    │
│    - employees                                               │
│    - attendance                                              │
│    - skills                                                  │
│    - jobPositions                                            │
│    - recruitmentFunnels                                      │
│    - performanceReviews                                      │
│    - exitInterviews                                          │
│    - analytics                                               │
│    - reports                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. Database Naming Convention

- **Master Database**: `peoplelytics_core` (stores organizations, users, etc.)
- **Organization Databases**: `org_{normalizedOrgId}`
  - Example: `org_acme-corp_1234567890`
  - The `org_` prefix is added automatically
  - Special characters are normalized (spaces → hyphens, etc.)

### 3. Data Isolation

Each organization has its own database, ensuring:
- ✅ **Complete data isolation** - Organization A cannot access Organization B's data
- ✅ **Independent scaling** - Each organization's data can be scaled separately
- ✅ **Easy backup/restore** - Backup individual organization databases
- ✅ **Compliance** - Easier to meet data residency requirements

### 4. Connection Management

The `DatabaseService` manages connections:
- **Singleton pattern** - One instance manages all connections
- **Connection pooling** - Reuses connections for performance
- **Lazy connection** - Connections created when first accessed
- **Connection caching** - Connections stored in memory for reuse

### 5. Implementation Details

#### Creating a Database

```typescript
// In orgRoutes.ts
const dbService = DatabaseService.getInstance();
const created = await dbService.createOrganizationDatabase(org.orgId);
```

The `createOrganizationDatabase` method:
1. Normalizes the orgId (removes `org_` prefix if present)
2. Creates a MongoDB connection to `org_{normalizedOrgId}`
3. Writes an initialization document to trigger database creation
4. Verifies the database was created
5. Returns success/failure

#### Accessing Organization Data

```typescript
// In any controller
const connection = getOrgConnection(req); // From middleware
const EmployeeModel = getEmployeeModel(connection);
const employees = await EmployeeModel.find();
```

The middleware (`tenant.ts`):
1. Extracts `organizationId` from request (header, query, JWT, or subdomain)
2. Gets the organization-specific database connection
3. Attaches it to `req.organizationConnection`
4. Controllers use this connection to access tenant data

### 6. Database Structure

```
MongoDB Instance
├── peoplelytics_core (Master DB)
│   ├── organizations (collection)
│   └── users (collection)
│
├── org_acme-corp_1234567890 (Org A DB)
│   ├── employees
│   ├── attendance
│   ├── skills
│   └── ...
│
├── org_tech-startup_9876543210 (Org B DB)
│   ├── employees
│   ├── attendance
│   ├── skills
│   └── ...
│
└── org_global-corp_5555555555 (Org C DB)
    ├── employees
    ├── attendance
    ├── skills
    └── ...
```

### 7. Key Features

#### Automatic Database Creation
- ✅ Database created automatically when organization is created
- ✅ Collections initialized with proper structure
- ✅ No manual database setup required

#### Database Deletion
- ✅ Hard delete removes both organization record and database
- ✅ Soft delete (deactivate) keeps database but marks org as inactive
- ✅ Database can be restored if needed

#### Health Checks
- ✅ Check if organization database exists
- ✅ Get database statistics (size, collections, etc.)
- ✅ Monitor database health

### 8. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/organizations/add-organization` | POST | Create org + database |
| `/api/organizations/:orgId/health` | GET | Check database health |
| `/api/organizations/:orgId/stats` | GET | Get database statistics |
| `/api/organizations/:orgId/hard` | DELETE | Delete org + database |
| `/api/organizations/databases/list` | GET | List all org databases |

### 9. Security

- ✅ **Super Admin** can access any organization's database
- ✅ **Org Admin/HR Analyst** can only access their own organization's database
- ✅ **Middleware validation** ensures users can't access other orgs' data
- ✅ **JWT token** contains organizationId for automatic routing

### 10. Benefits

1. **Data Isolation**: Complete separation of data between organizations
2. **Scalability**: Each organization can scale independently
3. **Compliance**: Easier to meet data residency and GDPR requirements
4. **Backup/Restore**: Individual organization backups
5. **Performance**: No cross-organization queries affecting performance
6. **Maintenance**: Easy to maintain and troubleshoot per organization

## Example: Creating an Organization

```bash
POST /api/organizations/add-organization
{
  "name": "Acme Corporation",
  "package": "Pro",
  "subscriptionStartDate": "2024-01-01",
  "subscriptionEndDate": "2025-01-01"
}
```

**What Happens:**
1. Organization record created in `peoplelytics_core.organizations`
2. Database `org_acme-corporation_1234567890` created
3. Collections initialized (employees, attendance, etc.)
4. Organization ready to use!

## Verification

To verify a database was created:

```bash
# Check database exists
GET /api/organizations/{orgId}/health

# Get database stats
GET /api/organizations/{orgId}/stats

# List all databases
GET /api/organizations/databases/list
```

## Notes

- MongoDB creates databases **lazily** - they only exist when data is written
- The initialization document ensures the database is created immediately
- Collections are created when first document is inserted
- Database names are normalized to prevent conflicts



