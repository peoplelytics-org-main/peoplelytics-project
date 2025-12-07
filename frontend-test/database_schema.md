# Peoplelytics Database Schema

This document outlines the full database schema for the Peoplelytics application, designed for a multi-tenant (multi-organization) architecture where most data is partitioned by an `organizationId`.

---

### 1. `Organizations` Table
This table stores the top-level information for each client organization using the platform.

| Column Name             | Data Type                                                 | Constraints/Notes                                                                        |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`                    | **String**                                                | **Primary Key**. A unique identifier for the organization (e.g., `org_1`).               |
| `name`                  | String                                                    | The legal name of the organization (e.g., "Innovate Inc.").                              |
| `subscriptionStartDate` | Date                                                      | The date the organization's current subscription began.                                  |
| `subscriptionEndDate`   | Date                                                      | The date the organization's subscription will expire.                                    |
| `status`                | Enum (`'Active'`, `'Inactive'`)                           | The current status of the organization's account.                                        |
| `package`               | Enum (`'Basic'`, `'Intermediate'`, `'Pro'`, `'Enterprise'`) | The subscription package assigned, which controls feature access.                        |
| `employeeCount`         | Integer (Nullable)                                        | A manual count set by the Super Admin, used to check against package limits.             |

---

### 2. `Users` Table
Manages login credentials and roles for every user across all organizations.

| Column Name      | Data Type                                                      | Constraints/Notes                                                                                          |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`             | **String**                                                     | **Primary Key**. A globally unique identifier for the user (e.g., `user_sa`).                            |
| `username`       | String                                                         | **Unique**. The user's login name, formatted as an email (e.g., `amnakhan@innovateinc.com`).             |
| `password`       | String (Hashed)                                                | The user's hashed password.                                                                                |
| `role`           | Enum (`'Super Admin'`, `'Org Admin'`, `'HR Analyst'`, `'Executive'`) | Defines the user's access level and permissions.                                                           |
| `organizationId` | String (Nullable)                                              | **Foreign Key** -> `Organizations.id`. Links the user to an organization. `NULL` for 'Super Admin'.        |

---

### 3. `Employees` Table
The central table for all employee data. The `snapshotDate` allows for storing historical records, enabling trend analysis over time.

| Column Name                  | Data Type                                             | Constraints/Notes                                                                                             |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                         | **String**                                            | **Part of Composite PK**. A unique identifier for the employee *within their organization*.                     |
| `organizationId`             | **String**                                            | **Part of Composite PK**, **Foreign Key** -> `Organizations.id`. Links the record to an organization.           |
| `snapshotDate`               | **Date**                                              | **Part of Composite PK**. The date this specific record/snapshot was created.                                 |
| `name`                       | String                                                | The employee's full name.                                                                                     |
| `department`                 | String                                                | The department the employee belongs to.                                                                       |
| `jobTitle`                   | String                                                | The employee's official job title.                                                                            |
| `location`                   | String                                                | The employee's work location.                                                                                 |
| `hireDate`                   | Date                                                  | The date the employee was hired.                                                                              |
| `terminationDate`            | Date (Nullable)                                       | The date employment ended. `NULL` for active employees.                                                       |
| `terminationReason`          | Enum (`'Voluntary'`, `'Involuntary'`, Nullable)       | The reason for termination.                                                                                   |
| `salary`                     | Decimal                                               | The employee's annual base salary.                                                                            |
| `gender`                     | Enum (`'Male'`, `'Female'`, `'Other'`)                  | The gender of the employee.                                                                                   |
| `performanceRating`          | Integer (1-5)                                         | The employee's performance rating for this snapshot.                                                          |
| `potentialRating`            | Integer (1-3)                                         | The employee's potential rating for this snapshot.                                                            |
| `engagementScore`            | Integer (1-100)                                       | The employee's engagement score for this snapshot.                                                            |
| `managerId`                  | String (Nullable)                                     | The `id` of the employee's direct manager. Self-referencing within the same `organizationId`.                   |
| `(satisfaction_scores)`      | Integer (Nullable, 1-100)                             | Includes `compensationSatisfaction`, `benefitsSatisfaction`, etc., as defined in `types.ts`.                  |
| `(other_fields)`             | (Varies)                                              | Includes `bonus`, `trainingCompleted`, `successionStatus`, `weeklyHours`, etc., as defined in `types.ts`.      |
| **Primary Key**              | Composite (`id`, `organizationId`, `snapshotDate`)    | Uniquely identifies a specific historical record for an employee within an organization.                      |

---

### 4. `Skills` and `Employee_Skills` Tables (Normalized)
To efficiently manage skills, a normalized structure is used. `Skills` stores unique skill names, and `Employee_Skills` links them to employees.

#### `Skills` Table
| Column Name | Data Type                          | Constraints/Notes                                     |
| ----------- | ---------------------------------- | ----------------------------------------------------- |
| `id`        | **Integer**                        | **Primary Key**, Auto-incrementing.                   |
| `name`      | String                             | **Unique**. The name of the skill (e.g., "React").      |

#### `Employee_Skills` Table
| Column Name      | Data Type                               | Constraints/Notes                                                                  |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------------------- |
| `employeeId`     | **String**                              | **Part of Composite PK**, **Foreign Key** -> `Employees.id`.                         |
| `organizationId` | **String**                              | **Part of Composite PK**, **Foreign Key** -> `Organizations.id`.                       |
| `skillId`        | **Integer**                             | **Part of Composite PK**, **Foreign Key** -> `Skills.id`.                            |
| `level`          | Enum (`'Novice'`, `'Beginner'`, `'Competent'`, `'Proficient'`, `'Expert'`) | The employee's proficiency level in the skill.                                     |
| **Primary Key**  | Composite (`employeeId`, `organizationId`, `skillId`) | Ensures an employee doesn't have the same skill listed twice.                       |

---

### 5. `Attendance_Records` Table
Logs daily attendance data for employees.

| Column Name      | Data Type                                                      | Constraints/Notes                                                                  |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `employeeId`     | **String**                                                     | **Part of Composite PK**, **Foreign Key** -> `Employees.id`.                         |
| `organizationId` | **String**                                                     | **Part of Composite PK**, **Foreign Key** -> `Organizations.id`.                       |
| `date`           | **Date**                                                       | **Part of Composite PK**. The date of the attendance record.                         |
| `status`         | Enum (`'Present'`, `'Unscheduled Absence'`, `'PTO'`, `'Sick Leave'`) | The attendance status for that day.                                                |
| **Primary Key**  | Composite (`employeeId`, `organizationId`, `date`)             | Ensures one unique attendance record per employee per day.                         |

---

### 6. `Job_Positions` Table
Tracks job requisitions and their status.

| Column Name      | Data Type                                                | Constraints/Notes                                                                  |
| ---------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `id`             | **String**                                               | **Part of Composite PK**. A unique identifier for the job position (e.g., `POS001`). |
| `organizationId` | **String**                                               | **Part of Composite PK**, **Foreign Key** -> `Organizations.id`.                       |
| `title`          | String                                                   | The job title of the open position.                                                |
| `department`     | String                                                   | The department the position belongs to.                                            |
| `status`         | Enum (`'Open'`, `'Closed'`, `'On Hold'`)                 | The current status of the requisition.                                             |
| `openDate`       | Date                                                     | The date the position was opened.                                                  |
| `closeDate`      | Date (Nullable)                                          | The date the position was filled or closed.                                        |
| `hiredEmployeeId`| String (Nullable)                                        | **Foreign Key** -> `Employees.id`. Links to the hired employee.                      |
| `(other_fields)` | (Varies)                                                 | Includes `onHoldDate`, `positionType`, `budgetStatus`, etc.                          |
| **Primary Key**  | Composite (`id`, `organizationId`)                       | Uniquely identifies a job position within an organization.                           |

---

### 7. `Recruitment_Funnels` Table
Stores recruitment metrics for each job position.

| Column Name       | Data Type                                                | Constraints/Notes                                                                  |
| ----------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `positionId`      | **String**                                               | **Part of Composite PK**, **Foreign Key** -> `Job_Positions.id`.                       |
| `organizationId`  | **String**                                               | **Part of Composite PK**, **Foreign Key** -> `Organizations.id`.                       |
| `shortlisted`     | Integer                                                  | The number of candidates who were shortlisted or applied.                            |
| `interviewed`     | Integer                                                  | The number of candidates who were interviewed.                                     |
| `offersExtended`  | Integer                                                  | The number of job offers extended to candidates.                                   |
| `offersAccepted`  | Integer                                                  | The number of candidates who accepted an offer.                                    |
| `joined`          | Integer                                                  | The number of candidates who successfully joined the company.                      |
| **Primary Key**   | Composite (`positionId`, `organizationId`)               | Uniquely links funnel data to a job position.                                       |

---

### 8. `Exit_Interview_Analyses` Table
Stores the structured output from analyzing exit interview transcripts. This is an improvement over storing this data in `localStorage`.

| Column Name                  | Data Type                                     | Constraints/Notes                                                    |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `id`                         | **Integer**                                   | **Primary Key**, Auto-incrementing.                                  |
| `organizationId`             | String                                        | **Foreign Key** -> `Organizations.id`. Links the analysis to an org. |
| `primaryReasonForLeaving`    | String                                        | The main reason for the employee's departure.                        |
| `secondaryReasonForLeaving`  | String (Nullable)                             | A secondary factor in the departure decision.                        |
| `managementSentiment`        | Enum (`'Positive'`, `'Neutral'`, `'Negative'`)  | Sentiment regarding management.                                      |
| `managementQuote`            | Text                                          | A representative quote about management.                             |
| `managementSummary`          | Text                                          | A summary of feedback on management.                                 |
| `(compensation_fields)`      | (Varies)                                      | Similar `sentiment`, `quote`, and `summary` fields for compensation.   |
| `(culture_fields)`           | (Varies)                                      | Similar `sentiment`, `quote`, and `summary` fields for culture.      |
| `analyzedAt`                 | Timestamp                                     | When the analysis was performed.                                     |
