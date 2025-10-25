# Peoplelytics Database Schema

This document outlines the full database schema for the Peoplelytics application, designed for a multi-tenant (multi-organization) architecture where most data is partitioned by an `organizationId`.

---

### 1. Organizations Table
This table stores the top-level information for each client organization using the platform.

| Column Name             | Data Type                                                 | Description                                                                              |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`                    | **String (Primary Key)**                                  | A unique identifier for the organization (e.g., `org_1`).                                |
| `name`                  | String                                                    | The legal name of the organization (e.g., "Innovate Inc.").                              |
| `subscriptionStartDate` | Date                                                      | The date the organization's current subscription began.                                  |
| `subscriptionEndDate`   | Date                                                      | The date the organization's subscription will expire.                                    |
| `status`                | Enum (`'Active'`, `'Inactive'`)                           | The current status of the organization's account.                                        |
| `package`               | Enum (`'Basic'`, `'Intermediate'`, `'Pro'`, `'Enterprise'`) | The subscription package assigned, which controls feature access.                        |
| `employeeCount`         | Integer (Nullable)                                        | A manual override for the employee limit, set by the Super Admin.                        |

---

### 2. Users Table
Manages login credentials and roles for every user across all organizations.

| Column Name      | Data Type                                                      | Description                                                                                          |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `id`             | **String (Primary Key)**                                       | A globally unique identifier for the user (e.g., `user_sa`).                                         |
| `username`       | String (Unique)                                                | The user's login name, formatted as an email (e.g., `amnakhan@innovateinc.com`).                       |
| `password`       | String (Hashed)                                                | The user's hashed password.                                                                          |
| `role`           | Enum (`'Super Admin'`, `'Org Admin'`, `'HR Analyst'`, `'Executive'`) | Defines the user's access level and permissions.                                                     |
| `organizationId` | String (Foreign Key -> `Organizations.id`, Nullable)           | Links the user to an organization. `null` for the 'Super Admin' role.                                |

---

### 3. Employees Table
The central table for all employee data, including historical snapshots.

| Column Name                  | Data Type                                             | Description                                                                                             |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `id`                         | **String (Part of Composite PK)**                     | A unique identifier for the employee *within their organization*.                                       |
| `organizationId`             | **String (Part of Composite PK, FK -> `Organizations.id`)** | Links the employee record to their organization.                                                        |
| `name`                       | String                                                | The employee's full name.                                                                               |
| `department`                 | String                                                | The department the employee belongs to (e.g., "Engineering").                                           |
| `jobTitle`                   | String                                                | The employee's official job title.                                                                      |
| `location`                   | String                                                | The employee's work location (e.g., "Lahore", "Remote").                                                |
| `hireDate`                   | Date                                                  | The date the employee was hired.                                                                        |
| `terminationDate`            | Date (Nullable)                                       | The date employment ended. `null` for active employees.                                                 |
| `terminationReason`          | Enum (`'Voluntary'`, `'Involuntary'`, Nullable)       | The reason for termination.                                                                             |
| `salary`                     | Decimal                                               | The employee's annual base salary.                                                                      |
| `gender`                     | Enum (`'Male'`, `'Female'`, `'Other'`)                  | The gender of the employee.                                                                             |
| `performanceRating`          | Integer (1-5)                                         | The employee's most recent performance rating.                                                          |
| `potentialRating`            | Integer (1-3)                                         | The employee's potential rating for growth and leadership.                                              |
| `engagementScore`            | Integer (1-100)                                       | The employee's most recent engagement survey score.                                                     |
| `managerId`                  | String (FK -> `Employees.id`, Nullable, Self-referencing) | The `id` of the employee's direct manager.                                                              |
| `snapshotDate`               | Date                                                  | The date this specific record/snapshot was created. Essential for historical analysis.                |
| `(satisfaction_scores)`      | Integer (Nullable, 1-100)                             | Includes `compensationSatisfaction`, `benefitsSatisfaction`, etc.                                       |
| `(other_fields)`             | (Varies)                                              | Includes `bonus`, `trainingCompleted`, `successionStatus`, etc., as defined in `types.ts`.              |
| **Primary Key**              | Composite (`id`, `organizationId`)                    | Uniquely identifies an employee within a specific organization.                                         |

---

### 4. Skills Table
A normalized table to track the skills of each employee.

| Column Name      | Data Type                               | Description                                                                  |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| `id`             | **Integer (Primary Key, Auto-incrementing)** | A unique identifier for the skill entry.                                     |
| `employeeId`     | String (FK -> `Employees.id`)           | Links to the employee who has the skill.                                     |
| `organizationId` | String (FK -> `Organizations.id`)       | Links to the employee's organization for data partitioning.                  |
| `skillName`      | String                                  | The name of the skill (e.g., "React").                                       |
| `skillLevel`     | Enum (`'Novice'`, `'Beginner'`, `'Competent'`, `'Proficient'`, `'Expert'`) | The employee's proficiency level in the skill.                              |
| **Unique Index** | Composite (`employeeId`, `organizationId`, `skillName`) | Ensures an employee doesn't have the same skill listed twice.             |

---

### 5. Attendance Records Table
Logs daily attendance data for employees.

| Column Name      | Data Type                                                      | Description                                                        |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `employeeId`     | **String (Part of Composite PK, FK -> `Employees.id`)**        | Links to the employee's record.                                    |
| `organizationId` | **String (Part of Composite PK, FK -> `Organizations.id`)**    | Links to the organization.                                         |
| `date`           | **Date (Part of Composite PK)**                                | The date of the attendance record.                                 |
| `status`         | Enum (`'Present'`, `'Unscheduled Absence'`, `'PTO'`, `'Sick Leave'`) | The attendance status for that day.                                |
| **Primary Key**  | Composite (`employeeId`, `organizationId`, `date`)             | Ensures one unique attendance record per employee per day.         |

---

### 6. Job Positions Table
Tracks job requisitions and their status.

| Column Name      | Data Type                                                | Description                                                  |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `id`             | **String (Part of Composite PK)**                        | A unique identifier for the job position (e.g., `POS001`).     |
| `organizationId` | **String (Part of Composite PK, FK -> `Organizations.id`)** | Links to the organization.                                   |
| `title`          | String                                                   | The job title of the open position.                          |
| `department`     | String                                                   | The department the position belongs to.                      |
| `status`         | Enum (`'Open'`, `'Closed'`, `'On Hold'`)                 | The current status of the requisition.                       |
| `openDate`       | Date                                                     | The date the position was opened.                            |
| `closeDate`      | Date (Nullable)                                          | The date the position was filled or closed.                  |
| `hiredEmployeeId`| String (FK -> `Employees.id`, Nullable)                  | Links to the employee who was hired for this position.         |
| `(other_fields)` | (Varies)                                                 | Includes `onHoldDate`, `positionType`, `budgetStatus`, etc.    |
| **Primary Key**  | Composite (`id`, `organizationId`)                       | Uniquely identifies a job position within an organization.     |

---

### 7. Recruitment Funnels Table
Stores recruitment metrics for each job position.

| Column Name       | Data Type                                                | Description                                                          |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `positionId`      | **String (Part of Composite PK, FK -> `JobPositions.id`)** | Links to the specific job position.                                  |
| `organizationId`  | **String (Part of Composite PK, FK -> `Organizations.id`)** | Links to the organization.                                           |
| `shortlisted`     | Integer                                                  | The number of candidates who were shortlisted or applied.          |
| `interviewed`     | Integer                                                  | The number of candidates who were interviewed.                       |
| `offersExtended`  | Integer                                                  | The number of job offers extended to candidates.                     |
| `offersAccepted`  | Integer                                                  | The number of candidates who accepted an offer.                      |
| `joined`          | Integer                                                  | The number of candidates who successfully joined the company.        |
| **Primary Key**   | Composite (`positionId`, `organizationId`)               | Uniquely links funnel data to a job position.                         |

---

### 8. Exit Interview Analyses Table
Stores the structured output from analyzing exit interview transcripts.

| Column Name                  | Data Type                                     | Description                                                    |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `id`                         | **Integer (Primary Key, Auto-incrementing)**  | A unique identifier for the analysis entry.                    |
| `organizationId`             | String (FK -> `Organizations.id`)             | Links to the organization where the analysis was performed.    |
| `primaryReasonForLeaving`    | String                                        | The main reason for the employee's departure.                  |
| `secondaryReasonForLeaving`  | String (Nullable)                             | A secondary factor in the departure decision.                  |
| `managementSentiment`        | Enum (`'Positive'`, `'Neutral'`, `'Negative'`)  | Sentiment regarding management.                                |
| `managementQuote`            | Text                                          | A representative quote about management.                       |
| `managementSummary`          | Text                                          | A summary of feedback on management.                           |
| `(compensation_fields)`      | (Varies)                                      | Similar `sentiment`, `quote`, and `summary` fields for compensation. |
| `(culture_fields)`           | (Varies)                                      | Similar `sentiment`, `quote`, and `summary` fields for culture. |
| `analyzedAt`                 | Timestamp                                     | When the analysis was performed.                               |
