
import { Dexie, Table } from 'dexie';
import { 
  Learner, Teacher, TeacherTransfer, TeacherLeave, Infrastructure, School, AuditLog, TermlyReport,
  PromotionRecord, JuniorExamResult, StandardisedExamScore, PSLCEResult, PSLCESelection, Asset, FinanceSIG, InspectionRecord
} from './types';

export class EMISDatabase extends Dexie {
  learners!: Table<Learner>;
  teachers!: Table<Teacher>;
  teacherTransfers!: Table<TeacherTransfer>;
  teacherLeaves!: Table<TeacherLeave>;
  infrastructure!: Table<Infrastructure>;
  schools!: Table<School>;
  auditLogs!: Table<AuditLog>;
  termlyReports!: Table<TermlyReport>;
  promotionRecords!: Table<PromotionRecord>;
  juniorExams!: Table<JuniorExamResult>;
  standardExams!: Table<StandardisedExamScore>;
  pslceResults!: Table<PSLCEResult>;
  pslceSelections!: Table<PSLCESelection>;
  assets!: Table<Asset>;
  financeSIG!: Table<FinanceSIG>;
  inspections!: Table<InspectionRecord>;

  constructor() {
    super('Malawi_EMIS_Registry');
    // Defining database schema versions and stores.
    this.version(9).stores({
      learners: '++id, schoolId, lin, nin, surname, gender, class, status, isSNE',
      teachers: '++id, schoolId, nin, tpNumber, status, teachingGrade, assignedStandard',
      teacherTransfers: '++id, teacherId, sourceSchoolId, destinationSchoolId, status',
      teacherLeaves: '++id, teacherId, type, status',
      infrastructure: '++id, type, condition',
      schools: '++id, name, emisCode, level, status, district, region, zone',
      auditLogs: '++id, schoolId, action, timestamp',
      termlyReports: 'id, schoolId, term, year, status',
      promotionRecords: '++id, schoolId, year, grade',
      juniorExams: '++id, schoolId, year, term, grade',
      standardExams: '++id, schoolId, year, term, studentName',
      pslceResults: '++id, schoolId, year',
      pslceSelections: '++id, schoolId, year',
      assets: '++id, schoolId, category',
      financeSIG: '++id, schoolId, status',
      inspections: '++id, schoolId, date'
    });
  }
}

export const db = new EMISDatabase();

export const seedDatabase = async () => {
  const schoolCount = await db.schools.count();
  if (schoolCount === 0) {
    const schoolsToSeed: Partial<School>[] = [
      {
        name: 'Lilongwe Demonstration School',
        emisCode: 'MW-CE-001',
        registrationNumber: 'REG/PRI/2020/045',
        level: 'Primary',
        status: 'active',
        region: 'Central',
        district: 'Lilongwe',
        traditionalAuthority: 'Tsabango',
        village: 'Area 25',
        latitude: -13.9626,
        longitude: 33.7741,
        accessibility: 'Tarred Road',
        distanceFromTown: 2,
        ownership: 'Government',
        headTeacher: { name: 'Chisomo Phiri', gender: 'F', qualification: 'Degree in Education', appointmentDate: '2018-01-15', contact: '+265 888 123 456' },
        infrastructure: { classrooms: 24, offices: 4, staffHouses: 6, latrines: 12, libraries: 1, laboratories: 0, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 4.5, landOwnership: 'Government' },
        yearEstablished: 1968,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: 'Blantyre Secondary School',
        emisCode: 'MW-SO-102',
        registrationNumber: 'REG/SEC/2015/012',
        level: 'Secondary',
        status: 'active',
        region: 'Southern',
        district: 'Blantyre',
        traditionalAuthority: 'Somba',
        village: 'Chichiri',
        latitude: -15.8037,
        longitude: 35.0216,
        accessibility: 'Tarred Road',
        distanceFromTown: 5,
        ownership: 'Government',
        headTeacher: { name: 'Mphatso Banda', gender: 'M', qualification: 'Masters in Educational Management', appointmentDate: '2015-09-01', contact: '+265 999 765 432' },
        infrastructure: { classrooms: 30, offices: 5, staffHouses: 10, latrines: 20, libraries: 1, laboratories: 4, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 12.0, landOwnership: 'Government' },
        yearEstablished: 1940,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
         name: 'Mzuzu Government Secondary',
         emisCode: 'MW-NO-201',
         registrationNumber: 'REG/SEC/1960/001',
         level: 'Secondary',
         status: 'active',
         region: 'Northern',
         district: 'Mzuzu',
         traditionalAuthority: 'Mtwalo',
         village: 'Chasefu',
         latitude: -11.4580,
         longitude: 34.0150,
         accessibility: 'Tarred Road',
         distanceFromTown: 1,
         ownership: 'Government',
         headTeacher: { name: 'Lovemore Phiri', gender: 'M', qualification: 'PhD Education', appointmentDate: '2010-01-01', contact: '+265 888 000 111' },
         infrastructure: { classrooms: 40, offices: 8, staffHouses: 20, latrines: 30, libraries: 2, laboratories: 6, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 25.0, landOwnership: 'Government' },
         yearEstablished: 1959,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'Dedza Secondary School',
         emisCode: 'MW-CE-304',
         registrationNumber: 'REG/SEC/1951/005',
         level: 'Secondary',
         status: 'active',
         region: 'Central',
         district: 'Dedza',
         traditionalAuthority: 'Kachere',
         village: 'Dedza Boma',
         latitude: -14.3750,
         longitude: 34.3330,
         accessibility: 'Tarred Road',
         distanceFromTown: 2,
         ownership: 'Government',
         headTeacher: { name: 'Samuel Gondwe', gender: 'M', qualification: 'Masters Education', appointmentDate: '2012-05-15', contact: '+265 999 555 666' },
         infrastructure: { classrooms: 35, offices: 6, staffHouses: 15, latrines: 25, libraries: 1, laboratories: 5, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 30.0, landOwnership: 'Government' },
         yearEstablished: 1950,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'Zomba Catholic Secondary',
         emisCode: 'MW-SO-405',
         registrationNumber: 'REG/SEC/RC/1942',
         level: 'Secondary',
         status: 'active',
         region: 'Southern',
         district: 'Zomba',
         traditionalAuthority: 'Mlumbe',
         village: 'Zomba City',
         latitude: -15.3830,
         longitude: 35.3330,
         accessibility: 'Tarred Road',
         distanceFromTown: 1,
         ownership: 'Faith-Based',
         headTeacher: { name: 'Sister Maria', gender: 'F', qualification: 'M.Ed Management', appointmentDate: '2016-01-01', contact: '+265 888 222 333' },
         infrastructure: { classrooms: 28, offices: 4, staffHouses: 8, latrines: 18, libraries: 1, laboratories: 3, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 10.0, landOwnership: 'Church' },
         yearEstablished: 1942,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'Kamuzu Academy',
         emisCode: 'MW-CE-506',
         registrationNumber: 'REG/SEC/PVT/1981',
         level: 'Secondary',
         status: 'active',
         region: 'Central',
         district: 'Kasungu',
         traditionalAuthority: 'Kaomba',
         village: 'Mtunthama',
         latitude: -13.0160,
         longitude: 33.4830,
         accessibility: 'Tarred Road',
         distanceFromTown: 15,
         ownership: 'Private',
         headTeacher: { name: 'Andrew Wild', gender: 'M', qualification: 'PhD Classics', appointmentDate: '2020-01-01', contact: '+265 111 000 000' },
         infrastructure: { classrooms: 50, offices: 15, staffHouses: 60, latrines: 80, libraries: 3, laboratories: 10, waterSource: 'Borehole', electricitySource: 'Grid/Solar', internetAccess: true, landSize: 150.0, landOwnership: 'Trust' },
         yearEstablished: 1981,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'Malawi University of Business & Applied Sciences',
         emisCode: 'MW-HE-001',
         registrationNumber: 'REG/UNI/POLY/1965',
         level: 'Tertiary',
         status: 'active',
         region: 'Southern',
         district: 'Blantyre',
         traditionalAuthority: 'Blantyre City',
         village: 'Chichiri',
         latitude: -15.8000,
         longitude: 35.0300,
         accessibility: 'Tarred Road',
         distanceFromTown: 1,
         ownership: 'Government',
         headTeacher: { name: 'Prof. Nancy Chitera', gender: 'F', qualification: 'PhD Mathematics', appointmentDate: '2021-01-01', contact: '+265 1 870 411' },
         infrastructure: { classrooms: 100, offices: 200, staffHouses: 50, latrines: 150, libraries: 4, laboratories: 80, waterSource: 'Piped Water', electricitySource: 'Grid/Generator', internetAccess: true, landSize: 40.0, landOwnership: 'Government' },
         yearEstablished: 1965,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'Mponela Technical College',
         emisCode: 'MW-TE-001',
         registrationNumber: 'REG/TVET/2005/11',
         level: 'Technical',
         status: 'active',
         region: 'Central',
         district: 'Dowa',
         traditionalAuthority: 'Mponela',
         village: 'Mponela Boma',
         latitude: -13.5330,
         longitude: 33.7330,
         accessibility: 'Tarred Road',
         distanceFromTown: 0,
         ownership: 'Government',
         headTeacher: { name: 'Bentry Kaphuka', gender: 'M', qualification: 'M.Tech', appointmentDate: '2019-03-01', contact: '+265 999 111 222' },
         infrastructure: { classrooms: 15, offices: 3, staffHouses: 5, latrines: 10, libraries: 1, laboratories: 8, waterSource: 'Borehole', electricitySource: 'Grid', internetAccess: true, landSize: 15.0, landOwnership: 'Government' },
         yearEstablished: 2005,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'St. Marys Secondary',
         emisCode: 'MW-CE-808',
         registrationNumber: 'REG/SEC/RC/1955',
         level: 'Secondary',
         status: 'active',
         region: 'Central',
         district: 'Zomba',
         traditionalAuthority: 'Malemia',
         village: 'Zomba',
         latitude: -15.3800,
         longitude: 35.3200,
         accessibility: 'Tarred Road',
         distanceFromTown: 1,
         ownership: 'Faith-Based',
         headTeacher: { name: 'Sister Agnes', gender: 'F', qualification: 'Masters Education', appointmentDate: '2014-01-01', contact: '+265 888 999 000' },
         infrastructure: { classrooms: 20, offices: 3, staffHouses: 6, latrines: 15, libraries: 1, laboratories: 2, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 8.0, landOwnership: 'Church' },
         yearEstablished: 1955,
         createdAt: Date.now(),
         updatedAt: Date.now()
       },
       {
         name: 'Likuni Girls Secondary',
         emisCode: 'MW-CE-707',
         registrationNumber: 'REG/SEC/RC/1962',
         level: 'Secondary',
         status: 'active',
         region: 'Central',
         district: 'Lilongwe',
         traditionalAuthority: 'Malili',
         village: 'Likuni',
         latitude: -13.9800,
         longitude: 33.7000,
         accessibility: 'Tarred Road',
         distanceFromTown: 8,
         ownership: 'Faith-Based',
         headTeacher: { name: 'Mrs. J. Nkhoma', gender: 'F', qualification: 'B.Ed', appointmentDate: '2018-09-01', contact: '+265 999 444 333' },
         infrastructure: { classrooms: 18, offices: 3, staffHouses: 10, latrines: 15, libraries: 1, laboratories: 3, waterSource: 'Piped Water', electricitySource: 'Grid', internetAccess: true, landSize: 12.0, landOwnership: 'Church' },
         yearEstablished: 1962,
         createdAt: Date.now(),
         updatedAt: Date.now()
       }
    ];

    const schoolIds = [];
    for (const schoolData of schoolsToSeed) {
      const id = await db.schools.add(schoolData as School);
      schoolIds.push(id);
    }

    const school1Id = schoolIds[0];
    const school2Id = schoolIds[1];
    const school3Id = schoolIds[2];

    // Seed learners across schools with various grades
    await db.learners.bulkAdd([
      { schoolId: school1Id, lin: 'LDS-2023-001', nin: 'MW-LRN-101', firstName: 'Jane', surname: 'Chirwa', gender: 'F', dateOfBirth: '2015-03-20', class: 'Standard 3', nationality: 'Malawian', isSNE: false, status: 'active', createdAt: Date.now() },
      { schoolId: school1Id, lin: 'LDS-2023-002', nin: 'MW-LRN-102', firstName: 'Chifundo', surname: 'Banda', gender: 'M', dateOfBirth: '2014-07-15', class: 'Standard 4', nationality: 'Malawian', isSNE: true, sneCategory: 'Visual', status: 'active', createdAt: Date.now() },
      { schoolId: school1Id, lin: 'LDS-2023-003', nin: 'MW-LRN-103', firstName: 'Tapiwa', surname: 'Nkhoma', gender: 'F', dateOfBirth: '2016-11-02', class: 'Standard 2', nationality: 'Malawian', isSNE: false, status: 'active', createdAt: Date.now() },
      { schoolId: school1Id, lin: 'LDS-2023-004', nin: 'MW-LRN-104', firstName: 'Kondwani', surname: 'Mwale', gender: 'M', dateOfBirth: '2013-09-18', class: 'Standard 5', nationality: 'Malawian', isSNE: false, status: 'active', createdAt: Date.now() },
      { schoolId: school1Id, lin: 'LDS-2023-005', nin: 'MW-LRN-105', firstName: 'Grace', surname: 'Kumwenda', gender: 'F', dateOfBirth: '2012-04-25', class: 'Standard 6', nationality: 'Malawian', isSNE: true, sneCategory: 'Hearing', status: 'active', createdAt: Date.now() },
      { schoolId: school2Id, lin: 'BSS-2023-001', nin: 'MW-LRN-201', firstName: 'Aliko', surname: 'Dangote', gender: 'M', dateOfBirth: '2010-05-12', class: 'Form 1', nationality: 'Malawian', isSNE: false, status: 'active', createdAt: Date.now() },
      { schoolId: school2Id, lin: 'BSS-2023-002', nin: 'MW-LRN-202', firstName: 'Rebecca', surname: 'Phiri', gender: 'F', dateOfBirth: '2009-08-30', class: 'Form 2', nationality: 'Malawian', isSNE: false, status: 'active', createdAt: Date.now() },
      { schoolId: school3Id, lin: 'MGS-2023-001', nin: 'MW-LRN-301', firstName: 'Innocent', surname: 'Gondwe', gender: 'M', dateOfBirth: '2008-01-14', class: 'Form 3', nationality: 'Malawian', isSNE: false, status: 'active', createdAt: Date.now() },
    ]);

    // Seed teachers across schools
    await db.teachers.bulkAdd([
      { schoolId: school1Id, emisCode: 'MW-CE-001', tpNumber: 'TP/2010/8842', registrationNumber: 'REG/T/2010/001', nin: 'MW-STF-001', fullName: 'John Kayira', gender: 'M', dateOfBirth: '1985-05-12', phoneNumber: '+265 999 123 456', homeAddress: 'P.O. Box 45, Lilongwe', teachingGrade: 'Grade D', highestQualification: 'Degree in Education', specialization: 'Mathematics, Science', dateOfFirstAppointment: '2010-09-01', dateOfAppointmentToCurrentGrade: '2018-01-15', status: 'Active', responsibility: 'Head Teacher', assignedStandard: 'Standard 8', tcmRegistrationNumber: 'TCM-PR-2010-001', tcmLicenseNumber: 'L-2023-001', tcmLicenseExpiryDate: '2026-12-31', createdAt: Date.now(), updatedAt: Date.now() },
      { schoolId: school1Id, emisCode: 'MW-CE-001', tpNumber: 'TP/2015/1234', registrationNumber: 'REG/T/2015/055', nin: 'MW-STF-002', fullName: 'Mary Mwale', gender: 'F', dateOfBirth: '1992-03-20', phoneNumber: '+265 888 765 432', homeAddress: 'Area 25, Lilongwe', teachingGrade: 'Grade F', highestQualification: 'Diploma in Education', specialization: 'Chichewa, English', dateOfFirstAppointment: '2015-09-01', dateOfAppointmentToCurrentGrade: '2015-09-01', status: 'Active', assignedStandard: 'P-Klass', createdAt: Date.now(), updatedAt: Date.now() },
      { schoolId: school2Id, emisCode: 'MW-SO-102', tpNumber: 'TP/2012/5567', registrationNumber: 'REG/T/2012/088', nin: 'MW-STF-003', fullName: 'Joseph Kachale', gender: 'M', dateOfBirth: '1980-11-08', phoneNumber: '+265 999 111 222', homeAddress: 'P.O. Box 200, Blantyre', teachingGrade: 'Grade C', highestQualification: 'Masters in Education', specialization: 'Biology, Chemistry', dateOfFirstAppointment: '2008-03-01', dateOfAppointmentToCurrentGrade: '2017-06-01', status: 'Active', responsibility: 'Head Teacher', assignedStandard: 'Form 4', tcmRegistrationNumber: 'TCM-PR-2008-003', tcmLicenseNumber: 'L-2023-003', tcmLicenseExpiryDate: '2025-12-31', createdAt: Date.now(), updatedAt: Date.now() },
      { schoolId: school2Id, emisCode: 'MW-SO-102', tpNumber: 'TP/2018/8901', nin: 'MW-STF-004', fullName: 'Esther Manda', gender: 'F', dateOfBirth: '1990-06-15', phoneNumber: '+265 888 444 555', homeAddress: 'Bangwe, Blantyre', teachingGrade: 'Grade E', highestQualification: 'Degree in Education', specialization: 'English, History', dateOfFirstAppointment: '2018-09-01', dateOfAppointmentToCurrentGrade: '2018-09-01', status: 'Active', assignedStandard: 'Form 2', createdAt: Date.now(), updatedAt: Date.now() },
    ]);

    // Seed promotion records
    await db.promotionRecords.bulkAdd([
      { schoolId: school1Id, grade: 'Standard 1', gender: 'M', promoted: 45, repeated: 5, droppedOut: 2, year: 2023 },
      { schoolId: school1Id, grade: 'Standard 1', gender: 'F', promoted: 48, repeated: 3, droppedOut: 1, year: 2023 },
      { schoolId: school1Id, grade: 'Standard 2', gender: 'M', promoted: 42, repeated: 4, droppedOut: 1, year: 2023 },
      { schoolId: school1Id, grade: 'Standard 2', gender: 'F', promoted: 44, repeated: 2, droppedOut: 0, year: 2023 },
      { schoolId: school1Id, grade: 'Standard 3', gender: 'M', promoted: 38, repeated: 6, droppedOut: 3, year: 2023 },
      { schoolId: school1Id, grade: 'Standard 3', gender: 'F', promoted: 40, repeated: 4, droppedOut: 2, year: 2023 },
    ]);

    // Seed exam results
    await db.standardExams.bulkAdd([
      { schoolId: school1Id, studentName: 'Chisomo Kamanga', gender: 'M', grade: 'Standard 8', chi: 88, eng: 75, arts: 60, mat: 92, psci: 85, ses: 70, total: 470, term: 1, year: 2023 },
      { schoolId: school1Id, studentName: 'Mphatso Zulu', gender: 'F', grade: 'Standard 8', chi: 92, eng: 88, arts: 70, mat: 85, psci: 90, ses: 75, total: 500, term: 1, year: 2023 },
      { schoolId: school1Id, studentName: 'Kondwani Mwale', gender: 'M', grade: 'Standard 5', chi: 75, eng: 68, arts: 55, mat: 80, psci: 72, ses: 65, total: 415, term: 1, year: 2023 },
      { schoolId: school2Id, studentName: 'Mary Banda', gender: 'F', grade: 'Form 2', chi: 85, eng: 90, arts: 78, mat: 88, psci: 82, ses: 80, total: 503, term: 1, year: 2023 },
    ]);

    // Seed finance
    await db.financeSIG.bulkAdd([
      { schoolId: school1Id, purpose: 'Classroom Rehabilitation', amount: 1200000, status: 'Spent', date: Date.now() - 30 * 24 * 60 * 60 * 1000 },
      { schoolId: school1Id, purpose: 'Textbook Procurement', amount: 500000, status: 'Planned', date: Date.now() + 15 * 24 * 60 * 60 * 1000 },
      { schoolId: school1Id, purpose: 'Sanitation Upgrade', amount: 350000, status: 'Spent', date: Date.now() - 60 * 24 * 60 * 60 * 1000 },
      { schoolId: school2Id, purpose: 'Science Lab Equipment', amount: 800000, status: 'Spent', date: Date.now() - 45 * 24 * 60 * 60 * 1000 },
      { schoolId: school2Id, purpose: 'Staff Housing', amount: 2000000, status: 'Planned', date: Date.now() + 30 * 24 * 60 * 60 * 1000 },
    ]);

    // Seed assets
    await db.assets.bulkAdd([
      { schoolId: school1Id, name: 'Dell Desktop Computers', category: 'ICT Equipment', condition: 'Good', quantity: 20, serialNumber: 'DL-2022-001', lastAuditDate: Date.now() - 90 * 24 * 60 * 60 * 1000 },
      { schoolId: school1Id, name: 'HP Laser Printers', category: 'Office Equipment', condition: 'Fair', quantity: 4, serialNumber: 'HP-2021-012', lastAuditDate: Date.now() - 90 * 24 * 60 * 60 * 1000 },
      { schoolId: school1Id, name: 'School Bus (Toyota)', category: 'Transport', condition: 'Good', quantity: 1, serialNumber: 'BUS-001-MW', lastAuditDate: Date.now() - 30 * 24 * 60 * 60 * 1000 },
      { schoolId: school2Id, name: 'Microscope Sets', category: 'Lab Equipment', condition: 'Good', quantity: 15, serialNumber: 'MS-2023-045', lastAuditDate: Date.now() - 60 * 24 * 60 * 60 * 1000 },
    ]);

    // Seed inspections
    await db.inspections.bulkAdd([
      { schoolId: school1Id, date: Date.now() - 180 * 24 * 60 * 60 * 1000, inspectorName: 'M. Phiri', score: 85, sections: { leadership: 4, teaching: 5, community: 3 }, comments: 'Strong school leadership and teaching standards. Community engagement needs improvement.' },
      { schoolId: school1Id, date: Date.now() - 365 * 24 * 60 * 60 * 1000, inspectorName: 'G. Banda', score: 62, sections: { leadership: 3, teaching: 3, community: 4 }, comments: 'Satisfactory overall. Teaching quality requires attention in upper standards.' },
      { schoolId: school2Id, date: Date.now() - 150 * 24 * 60 * 60 * 1000, inspectorName: 'S. Nkhoma', score: 78, sections: { leadership: 4, teaching: 4, community: 3 }, comments: 'Good performance in sciences. Lab facilities well maintained.' },
    ]);

    // Seed teacher transfers
    await db.teacherTransfers.bulkAdd([
      { teacherId: 1, sourceSchoolId: school1Id, destinationSchoolId: school2Id, reason: 'Career advancement - promoted to Deputy Head', status: 'Completed', initiatedDate: Date.now() - 120 * 24 * 60 * 60 * 1000, processedDate: Date.now() - 90 * 24 * 60 * 60 * 1000 },
    ]);

    // Seed teacher leaves
    await db.teacherLeaves.bulkAdd([
      { teacherId: 2, type: 'Annual', startDate: '2024-12-15', endDate: '2025-01-05', reason: 'Annual leave', status: 'Approved', initiatedAt: Date.now() - 60 * 24 * 60 * 60 * 1000 },
      { teacherId: 3, type: 'Sick', startDate: '2024-11-10', endDate: '2024-11-17', reason: 'Medical procedure', status: 'Approved', initiatedAt: Date.now() - 90 * 24 * 60 * 60 * 1000 },
    ]);
  }
};
