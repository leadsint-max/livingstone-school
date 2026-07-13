# School Management System: Technical Blueprint

## 1. Recommended Tech Stack
*   **Frontend:** React.js or Next.js (for the various portals).
*   **Backend:** Node.js (Express) or Python (Django/FastAPI).
*   **Database:** PostgreSQL (Relational data is critical for school records).
*   **Mobile:** React Native or Flutter (for the Android/iOS apps).
*   **File Storage:** AWS S3 or similar for storing assignments and receipts.

---

## 2. Core Database Schema (Simplified)

### Users & RBAC
*   `users`: id, email, password_hash, role (super_admin, admin, teacher, student, parent, accountant), status.
*   `roles_permissions`: mapping permissions to roles.

### Academic Core
*   `schools`: id, name, address, subscription_plan.
*   `classes`: id, school_id, name, stream, teacher_id (class teacher).
*   `students`: id, user_id, class_id, admission_no, guardian_id, date_of_birth.
*   `staff`: id, user_id, designation, department, salary.

### Finance
*   `fee_structures`: id, class_id, amount, term, description.
*   `invoices`: id, student_id, total_amount, status (paid, partial, unpaid).
*   `payments`: id, invoice_id, amount_paid, payment_method, transaction_ref.

### Academics
*   `subjects`: id, name, code.
*   `attendance`: id, student_id, date, status (present/absent), recorded_by (teacher_id).
*   `exams`: id, name, term, date.
*   `marks`: id, student_id, exam_id, subject_id, score.

---

## 3. Folder Structure
```text
/school-ms
├── /backend
│   ├── /src
│   │   ├── /controllers  (Logic for Admin, Teacher, etc.)
│   │   ├── /models       (DB Schemas)
│   │   ├── /routes       (API Endpoints)
│   │   └── /middleware   (Auth & Role checks)
├── /frontend
│   ├── /admin-portal
│   ├── /teacher-portal
│   ├── /parent-student-portal
├── /mobile-app
└── /docs
```
