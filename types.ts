
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'active' | 'pending' | 'archived' | 'verified';

export interface ParentDetails {
  relationship: string;
  name: string;
  phone: string;
}

export interface Learner {
  id?: number;
  schoolId?: number; // Linked School ID
  lin?: string; // Learner Identification Number
  nin?: string; // National Identification Number
  firstName: string;
  surname: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  class: string;
  nationality: string;
  isSNE: boolean;
  sneCategory?: string;
  status: 'active' | 'transferred' | 'promoted';
  isRefugee?: boolean;
  isOrphan?: boolean;
  parentDetails?: ParentDetails;
  familiarLanguage?: string;
  talents?: string[];
  createdAt: number;
}

export type StaffStatus = 'Active' | 'On Leave' | 'Transferred' | 'Retired';
export type TeachingGrade = 'Auxiliary' | 'Grade G' | 'Grade F' | 'Grade E' | 'Grade D' | 'Grade C' | 'Grade B' | 'Grade A';

export interface Teacher {
  id?: number;
  schoolId?: number; // Current Duty Station (Linked School ID)
  emisCode?: string; // School EMIS code
  tpNumber?: string; // Employment Number (TP)
  registrationNumber?: string; // MoE Registration Number
  nin: string; // National ID
  fullName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  phoneNumber: string;
  homeAddress: string;
  
  // Professional Status
  teachingGrade: TeachingGrade;
  highestQualification: string;
  specialization: string;
  dateOfFirstAppointment: string;
  dateOfAppointmentToCurrentGrade: string;
  
  // Assignment
  status: StaffStatus;
  responsibility?: string; // e.g., Section Head, Head Teacher
  assignedStandard?: string; // e.g., P-Klass, Standard 1, etc.
  
  // TCM Details
  tcmRegistrationNumber?: string;
  tcmLicenseNumber?: string;
  tcmLicenseExpiryDate?: string;

  createdAt: number;
  updatedAt: number;
}

export interface TeacherTransfer {
  id?: number;
  teacherId: number;
  sourceSchoolId: number;
  destinationSchoolId: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  initiatedDate: number;
  processedDate?: number;
}

export interface TeacherLeave {
  id?: number;
  teacherId: number;
  type: 'Sick' | 'Maternity' | 'Paternity' | 'Study' | 'Compassionate' | 'Annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  
  // Study leave specific
  collegeName?: string;
  courseOfStudy?: string;
  ministryApproval?: boolean;
  
  initiatedAt: number;
}

export interface Infrastructure {
  id?: number;
  type: string;
  count: number;
  condition: 'Good' | 'Fair' | 'Poor';
  lastUpdated: number;
}

export interface School {
  id?: number;
  // A. Identification
  name: string;
  emisCode: string;
  registrationNumber: string;
  level: 'Primary' | 'Secondary' | 'Technical' | 'Special Needs' | 'Tertiary';
  status: 'active' | 'inactive' | 'closed' | 'merged';
  
  // B. Location Details
  region: 'Northern' | 'Central' | 'Southern';
  district: string;
  zone?: string;
  traditionalAuthority: string;
  village: string;
  latitude: number;
  longitude: number;
  accessibility: 'Tarred Road' | 'Earth Road' | 'Footpath';
  distanceFromTown: number;

  // C. Governance & Management
  ownership: string; // Government, Private, Faith-Based, NGO, etc.
  boardDetails?: string;
  headTeacher: {
    name: string;
    gender: 'M' | 'F';
    qualification: string;
    appointmentDate: string;
    contact: string;
  };

  // D. Infrastructure
  infrastructure: {
    classrooms: number;
    offices: number;
    staffHouses: number;
    latrines: number;
    libraries: number;
    laboratories: number;
    waterSource: string;
    electricitySource: string;
    internetAccess: boolean;
    landSize: number; // in hectares
    landOwnership: string;
  };

  // F. History
  yearEstablished: number;
  yearUpgraded?: number;
  performanceNotes?: string;

  createdAt: number;
  updatedAt: number;
  aiSummary?: string;
  aiSummaryDate?: number;
}

export interface AuditLog {
  id?: number;
  schoolId: number;
  action: 'create' | 'update' | 'delete';
  content: string;
  performedBy: string;
  timestamp: number;
}

export interface TermlyReport {
  id?: string; // composite key: schoolId-term-year
  schoolId: number;
  term: string;
  year: number;
  status: 'Draft' | 'Submitted';
  lastSaved: number;
  completeness: number; // 0 to 1
  
  // Data Sections
  enrolment: {
    grade1: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade2: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade3: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade4: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade5: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade6: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade7: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
    grade8: { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
  };
  
  attendance: {
    weeklyTotals: { grade: string, m: number, f: number }[];
    teacherAttendance?: { m: number, f: number, present: number, total: number }[];
  };
  
  teachers: {
    summary: { name: string, qualification: string, subject: string, employmentType: string, gender: 'M' | 'F' }[];
  };
  
  infrastructure: {
    classroomsPermanent: number;
    classroomsTemporary: number;
    toiletsBoys: number;
    toiletsGirls: number;
    toiletsStaff: number;
    waterSource: string;
    electricity: boolean;
  };
  
  textbooks: {
    items: { subject: string, grade: string, available: number, needed: number }[];
  };
  
  exams: {
    results: { grade: string, subject: string, mPass: number, mFail: number, fPass: number, fFail: number }[];
  };
  
  health: {
    feedingProgramme: boolean;
    beneficiaries: number;
    washStatus: string;
  };
  
  finance: {
    grantsReceived: number;
    grantsSpent: number;
    expenditureCategories: { category: string, amount: number }[];
  };
  
  specialNeeds: {
    learners: { type: string, m: number, f: number }[];
  };
}

export interface EMISStats {
  totalSchools: number;
  totalLearners: number;
  totalTeachers: number;
  syncStatus: 'synced' | 'local_only' | 'error';
}

export interface PromotionRecord {
  id?: number;
  schoolId: number;
  grade: string;
  gender: 'M' | 'F';
  promoted: number;
  repeated: number;
  droppedOut: number;
  year: number;
  academicYear?: string;
}

export interface JuniorExamResult {
  id?: number;
  schoolId: number;
  grade: string;
  registered: number;
  sat: number;
  passed: number;
  failed: number;
  term: number;
  year: number;
}

export interface StandardisedExamScore {
  id?: number;
  schoolId: number;
  studentName: string;
  gender: 'M' | 'F';
  grade: string;
  chi: number;
  eng: number;
  arts: number;
  mat: number;
  psci: number;
  ses: number;
  total: number;
  term: number;
  year: number;
}

export interface PSLCEResult {
  id?: number;
  schoolId: number;
  year: number;
  gender: 'M' | 'F';
  registered: number;
  sat: number;
  passed: number;
  grades: { A: number, B: number, C: number, D: number };
}

export interface PSLCESelection {
  id?: number;
  schoolId: number;
  studentName: string;
  gender: 'M' | 'F';
  selectedSchool: string;
  schoolType: 'National' | 'District' | 'Community' | 'Private';
  year: number;
}

export interface Asset {
  id?: number;
  schoolId: number;
  name: string;
  category: string;
  condition: 'Good' | 'Fair' | 'Poor' | 'Repairable';
  quantity: number;
  serialNumber?: string;
  lastAuditDate?: number;
}

export interface FinanceSIG {
  id?: number;
  schoolId: number;
  purpose: string;
  amount: number;
  status: 'Spent' | 'Planned';
  date: number;
}

export interface InspectionRecord {
  id?: number;
  schoolId: number;
  date: number;
  inspectorName: string;
  score: number; // 0-100
  sections: {
    leadership: number; // 1-5
    teaching: number; // 1-5
    community: number; // 1-5
  };
  comments: string;
}
