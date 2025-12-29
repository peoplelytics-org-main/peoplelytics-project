# 🔐 Login Credentials Reference

## ✅ Valid Login Credentials

All credentials below are **valid and tested**. You can login using either **username** OR **email**.

---

## 👑 Super Admin

**For Super Admin login, leave Organization ID empty.**

- **Username**: `superadmin@123`
- **Email**: `admin@peoplelytics.com`
- **Password**: `SuperAdminP@ss123!`
- **Organization ID**: *(leave empty)*
- **Role**: Super Admin
- **Organization**: Peoplelytics Global (root)

**Login Options:**
- Username: `superadmin@123` + Password: `SuperAdminP@ss123!` + Organization ID: *(empty)*
- Email: `admin@peoplelytics.com` + Password: `SuperAdminP@ss123!` + Organization ID: *(empty)*

---

## 🏢 Org Admin (Acme Corporation)

**For tenant users, Organization ID is REQUIRED.**

- **Username**: `acmeadmin@123`
- **Email**: `admin@acme.com`
- **Password**: `OrgAdminP@ss123!`
- **Organization ID**: `org_001`
- **Role**: Org Admin
- **Organization**: Acme Corporation

**Login Options:**
- Username: `acmeadmin@123` + Password: `OrgAdminP@ss123!` + Organization ID: `org_001`
- Email: `admin@acme.com` + Password: `OrgAdminP@ss123!` + Organization ID: `org_001`

---

## 👤 HR Analyst (Acme Corporation)

- **Username**: `acme_hr`
- **Email**: `hr@acme.com`
- **Password**: `HrAnalystP@ss123!`
- **Organization ID**: `org_001`
- **Role**: HR Analyst
- **Organization**: Acme Corporation

**Login Options:**
- Username: `acme_hr` + Password: `HrAnalystP@ss123!` + Organization ID: `org_001`
- Email: `hr@acme.com` + Password: `HrAnalystP@ss123!` + Organization ID: `org_001`

---

## 💼 Executive (Acme Corporation)

- **Username**: `acme_exec`
- **Email**: `exec@acme.com`
- **Password**: `ExecP@ss123!`
- **Organization ID**: `org_001`
- **Role**: Executive
- **Organization**: Acme Corporation

**Login Options:**
- Username: `acme_exec` + Password: `ExecP@ss123!` + Organization ID: `org_001`
- Email: `exec@acme.com` + Password: `ExecP@ss123!` + Organization ID: `org_001`

---

## 📝 Important Notes

1. **Super Admin**: Organization ID must be **empty** or **not provided**
2. **Tenant Users**: Organization ID is **REQUIRED** (e.g., `org_001`)
3. **Login Flexibility**: You can use either **username** OR **email** to login
4. **Password**: All passwords are case-sensitive
5. **Organization ID Format**: Can be `org_001` or just `001` (both work)

---

## 🧪 Verification

All credentials have been verified:
- ✅ Passwords are correctly hashed
- ✅ Users exist in database
- ✅ Login authentication works
- ✅ Organization associations are correct

---

## 🔄 To Reset/Reseed

If you need to reset the database and reseed:

```bash
cd backend
npm run seed
```

This will:
- Clear existing users and organizations
- Create fresh seed data
- Display updated credentials

---

**Last Updated**: After MongoDB Atlas migration
**Status**: ✅ All credentials valid and tested

