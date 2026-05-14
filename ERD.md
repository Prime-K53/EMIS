# Malawi EMIS School Registry: Entity Relationship Diagram (ERD)

## Overview
The School Registry serves as the core master data repository. All other modules (Enrolment, Staff, Infrastructure, Exams) link to this module via the `emisCode` or a internal `schoolId`.

---

## 1. Core Entities

### **School (Registry)**
*The primary entity containing master institutional data.*
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` (PK) | Integer | Internal database unique identifier (Auto-increment) |
| `emisCode` (UK) | String | National EMIS Unique Identifier (e.g., MW-CE-001) |
| `name` | String | Official registered name of the school |
| `registrationNumber` | String | MoE legal registration number |
| `level` | Enum | Primary, Secondary, Technical, Special Needs, Tertiary |
| `status` | Enum | active, inactive, closed, merged |
| `region` | Enum | Northern, Central, Southern |
| `district` | String | Mapped to MoE District hierarchy |
| `traditionalAuthority`| String | Local government boundary |
| `village` | String | Specific location village or area |
| `latitude` | Float | GPS North/South coordinate |
| `longitude` | Float | GPS East/West coordinate |
| `ownership` | Enum | Government, Faith-Based, Private, NGO, Community |
| `headTeacher` | Object | Nested: { name, gender, qualification, contact, appointedDate } |
| `infrastructure` | Object | Nested summary of buildings and utilities |
| `yearEstablished` | Integer | Founding year |
| `createdAt` | Timestamp | Initial registration date |
| `updatedAt` | Timestamp | Last modification date |

### **AuditLog**
*Tracks all changes to the School Registry for governance.*
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` (PK) | Integer | Unique identifier |
| `schoolId` (FK) | Integer | Refers to `School.id` |
| `action` | Enum | create, update, delete |
| `content` | Text | Description of what changed |
| `performedBy` | String | User identity of the operator |
| `timestamp` | Timestamp | Execution time |

---

## 2. Relationships (Module Integration)

### **A. Enrolment Linkage (1:N)**
*One School has Many Learners.*
*   **Relationship:** `School.id` (1) <---> `Learner.schoolId` (N)
*   **Enforcement:** Validated on learner entry to ensure they are assigned to a valid EMIS school.

### **B. Staff Linkage (1:N)**
*One School has Many Staff Members.*
*   **Relationship:** `School.id` (1) <---> `Staff.schoolId` (N)
*   **Enforcement:** Prevents orphan staff records and supports teacher-to-pupil ratio reporting.

### **C. Infrastructure Details (1:1/N)**
*One School has a detailed Infrastructure Profile.*
*   **Relationship:** `School.id` (1) <---> `Infrastructure.id` or nested fields.
*   **Detail:** Standard building counts are stored in the Registry for quick reporting, while detailed condition assessments are stored in the Infrastructure module.

---

## 3. Data Flow Workflow (Example)
1.  **Ministry Official** logs into the EMIS system.
2.  Opens **School Registry** -> **Register New School**.
3.  Inputs **Identification** (Name, EMIS Code).
4.  Sets **Location** (Selects Region -> District -> TA).
5.  Verification of **GPS Coordinates** (Captured via mobile/web device).
6.  Assigns **Governance** (Selects Management Type, Inputs Head Teacher).
7.  Saves record -> **AuditLog** is automatically generated.
8.  School now appears in **Dashboard** summaries and is available for **Student Enrolment**.
