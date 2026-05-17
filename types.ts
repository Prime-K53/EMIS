export type Priority = 'low' | 'medium' | 'high';
export type Status = 'active' | 'pending' | 'archived' | 'verified';

export interface ParentDetails {
  relationship: string;
  name: string;
  phone: string;
}

export interface Learner {
  id?: number;
  schoolId?: number;
  lin?: string;
  nin?: string;
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
  academicYearId?: number;
  termId?: number;
  weekId?: number;
  month?: string;
}

export type StaffStatus = 'Active' | 'On Leave' | 'Transferred' | 'Retired';
export type TeachingGrade = 'Auxiliary' | 'Grade G' | 'Grade F' | 'Grade E' | 'Grade D' | 'Grade C' | 'Grade B' | 'Grade A';

export interface Teacher {
  id?: number;
  schoolId?: number;
  emisCode?: string;
  tpNumber?: string;
  registrationNumber?: string;
  nin: string;
  fullName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  phoneNumber: string;
  homeAddress: string;
  
  teachingGrade: TeachingGrade;
  highestQualification: string;
  specialization: string;
  dateOfFirstAppointment: string;
  dateOfAppointmentToCurrentGrade: string;
  
  status: StaffStatus;
  responsibility?: string;
  assignedStandard?: string;
  
  tcmRegistrationNumber?: string;
  tcmLicenseNumber?: string;
  tcmLicenseExpiryDate?: string;

  createdAt: number;
  updatedAt: number;
  academicYearId?: number;
  termId?: number;
  transferHistory?: {
    fromSchoolId: number;
    toSchoolId: number;
    reason: string;
    date: number;
  }[];
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
  academicYearId?: number;
}

export interface TeacherLeave {
  id?: number;
  teacherId: number;
  type: 'Sick' | 'Maternity' | 'Paternity' | 'Study' | 'Compassionate' | 'Annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  
  collegeName?: string;
  courseOfStudy?: string;
  ministryApproval?: boolean;
  
  initiatedAt: number;
  academicYearId?: number;
  termId?: number;
}

export interface Infrastructure {
  id?: number;
  schoolId?: number;
  type: string;
  count: number;
  condition: 'Good' | 'Fair' | 'Poor';
  lastUpdated: number;
  academicYearId?: number;
}

export interface School {
  id?: number;
  name: string;
  emisCode: string;
  registrationNumber: string;
  level: 'Primary' | 'Secondary' | 'Technical' | 'Special Needs' | 'Tertiary';
  status: 'active' | 'inactive' | 'closed' | 'merged';
  
  region: 'Northern' | 'Central' | 'Southern';
  district: string;
  zone?: string;
  traditionalAuthority: string;
  village: string;
  latitude: number;
  longitude: number;
  accessibility: 'Tarred Road' | 'Earth Road' | 'Footpath';
  distanceFromTown: number;

  ownership: string;
  boardDetails?: string;
  headTeacher: {
    name: string;
    gender: 'M' | 'F';
    qualification: string;
    appointmentDate: string;
    contact: string;
  };

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
    landSize: number;
    landOwnership: string;
  };

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
  academicYearId?: number;
}

export interface TermlyReport {
  id?: string;
  schoolId: number;
  term: string;
  year: number;
  status: 'Draft' | 'Submitted';
  lastSaved: number;
  completeness: number;
  academicYearId?: number;
  month?: string;
  weekId?: number;
  
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
    teacherAttendance?: { day: string, m: number, f: number, present: number, total: number }[];
    teacherDaily?: { day: string; teacherId: number; name: string; gender: string; status: 'present' | 'absent' | 'sick' | 'excused' }[];
    learnerDaily?: { day: string, grade: string, m: number, f: number }[];
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
  
  ifa?: {
    observations: {
      teacherName: string;
      grade: string;
      subject: string;
      lessonPlanChecked: boolean;
      qualityScore: number;
      dateObserved: string;
      notes: string;
    }[];
  };

  pslce?: {
    registered: number;
    sat: number;
    passed: number;
    male: { registered: number; sat: number; passed: number };
    female: { registered: number; sat: number; passed: number };
    grades: { A: number; B: number; C: number; D: number };
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
  academicYearId?: number;
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
  academicYearId?: number;
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
  academicYearId?: number;
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
  academicYearId?: number;
}

export interface PSLCESelection {
  id?: number;
  schoolId: number;
  studentName: string;
  gender: 'M' | 'F';
  selectedSchool: string;
  schoolType: 'National' | 'District' | 'Community' | 'Private';
  year: number;
  academicYearId?: number;
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
  academicYearId?: number;
}

export interface FinanceSIG {
  id?: number;
  schoolId: number;
  purpose: string;
  amount: number;
  status: 'Spent' | 'Planned';
  date: number;
  academicYearId?: number;
  termId?: number;
}

export interface InspectionRecord {
  id?: number;
  schoolId: number;
  date: number;
  inspectorName: string;
  score: number;
  sections: {
    leadership: number;
    teaching: number;
    community: number;
  };
  comments: string;
  academicYearId?: number;
}

export interface AppSettings {
  id: number;
  zonalName: string;
  zoneCode: string;
  district: string;
  educationDivision: string;
  physicalAddress: string;
  phoneNumber: string;
  email: string;
  motto: string;
  logoUrl: string;
  setupComplete: boolean;
  academicYearStart: string;
  academicYearEnd: string;
  numberOfTerms: number;
  weeksPerTerm: number;
  monthsPerTerm: number;
  adminName: string;
  adminUsername: string;
  adminPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  enabledModules: string[];
  createdAt: number;
}

export interface AcademicYear {
  id?: number;
  year: number;
  startDate: string;
  endDate: string;
  status: 'current' | 'active' | 'archived';
  createdAt: number;
}

export interface AcademicTerm {
  id?: number;
  academicYearId: number;
  name: string;
  startDate: string;
  endDate: string;
  weeksCount: number;
  order: number;
}

export interface AcademicWeek {
  id?: number;
  termId: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: 'locked' | 'active' | 'pending';
}

export interface MonthlyPeriod {
  id?: number;
  termId: number;
  name: string;
  startDate: string;
  endDate: string;
  monthIndex: number;
}

export interface PeriodContext {
  schoolYear: number;
  term: string;
  month: string;
  week: string;
  schoolId?: number;
}

export interface WeeklyReport {
  id?: number;
  schoolId: number;
  academicYearId: number;
  termId: number;
  weekId: number;
  month: string;
  reportType: string;
  data: any;
  status: 'draft' | 'submitted' | 'locked';
  submittedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface MonthlyReport {
  id?: number;
  schoolId: number;
  academicYearId: number;
  termId: number;
  monthlyPeriodId: number;
  aggregatedFromWeeks: number[];
  data: any;
  status: 'draft' | 'submitted' | 'locked';
  createdAt: number;
}

export interface TermReport {
  id?: number;
  schoolId: number;
  academicYearId: number;
  termId: number;
  aggregatedFromMonths: number[];
  data: any;
  status: 'draft' | 'submitted' | 'locked';
  createdAt: number;
}

export interface ZonalSchool {
  id?: number;
  academicYearId: number;
  schoolId: number;
  enrollment: number;
  attendance: number;
  staff: number;
  createdAt: number;
}

export interface Department {
  id?: number;
  name: string;
  schoolId?: number;
  executiveMembers: { teacherId: number; role: string }[];
  boardMembers: { teacherId: number; role: string }[];
  createdAt: number;
}
