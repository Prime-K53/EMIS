
import { TermlyReport } from '../types';

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  section: string;
  message: string;
  suggestion?: string;
  field?: string;
}

export const validateTermlyReport = (report: Partial<TermlyReport>): ValidationError[] => {
  const errors: ValidationError[] = [];

  const addError = (section: string, message: string, suggestion?: string, field?: string) => {
    errors.push({ id: Math.random().toString(36).substr(2, 9), type: 'error', section, message, suggestion, field });
  };

  const addWarning = (section: string, message: string, suggestion?: string, field?: string) => {
    errors.push({ id: Math.random().toString(36).substr(2, 9), type: 'warning', section, message, suggestion, field });
  };

  // 1. Recursive check for negative values
  const checkNegatives = (obj: Record<string, unknown> | unknown[], section: string, path: string = '') => {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const key in obj) {
      const value = (obj as Record<string, unknown>)[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'number' && value < 0) {
        addError(section, `Value cannot be negative: ${currentPath} (${value})`, 'Enter a positive whole number.', currentPath);
      } else if (typeof value === 'object' && value !== null) {
        checkNegatives(value as Record<string, unknown>, section, currentPath);
      }
    }
  };

  if (report.enrolment) checkNegatives(report.enrolment as unknown as Record<string, unknown>, 'Enrolment');
  if (report.attendance) checkNegatives(report.attendance as unknown as Record<string, unknown>, 'Attendance');
  if (report.infrastructure) checkNegatives(report.infrastructure as unknown as Record<string, unknown>, 'Infrastructure');
  if (report.textbooks) checkNegatives(report.textbooks as unknown as Record<string, unknown>, 'Textbooks');
  if (report.exams) checkNegatives(report.exams as unknown as Record<string, unknown>, 'Exams');
  if (report.finance) checkNegatives(report.finance as unknown as Record<string, unknown>, 'Finance');
  if (report.specialNeeds) checkNegatives(report.specialNeeds as unknown as Record<string, unknown>, 'Special Needs');

  // 2. Enrollment must match class totals (Internal Consistency)
  if (report.enrolment) {
    Object.entries(report.enrolment).forEach(([grade, data]) => {
      const gData = data as { m: number, f: number, overageM: number, overageF: number, underageM: number, underageF: number };
      if (gData.overageM + gData.underageM > gData.m) {
        addError('Enrolment', `${grade}: Sum of overage and underage males exceeds total male enrollment.`, 'Ensure overage/underage are count subsets of total.', `${grade}.m`);
      }
      if (gData.overageF + gData.underageF > gData.f) {
        addError('Enrolment', `${grade}: Sum of overage and underage females exceeds total female enrollment.`, 'Ensure overage/underage are count subsets of total.', `${grade}.f`);
      }
    });
  }

  // 3. Attendance cannot exceed enrollment
  if (report.attendance?.weeklyTotals && report.enrolment) {
    report.attendance.weeklyTotals.forEach((att) => {
      const gradeKey = att.grade.toLowerCase().replace(' ', '') as keyof typeof report.enrolment;
      const enrolled = report.enrolment[gradeKey];
      
      if (enrolled) {
        if (att.m > enrolled.m) {
          addError('Attendance', `${att.grade}: Male attendance (${att.m}) exceeds total enrolled males (${enrolled.m}).`, 'Review attendance logs for accuracy.', `${att.grade}.m`);
        }
        if (att.f > enrolled.f) {
          addError('Attendance', `${att.grade}: Female attendance (${att.f}) exceeds total enrolled females (${enrolled.f}).`, 'Review attendance logs for accuracy.', `${att.grade}.f`);
        }
      }
    });
  }

  // 4. Additional Business Rules (Warnings)
  if (report.infrastructure) {
    if (report.infrastructure.toiletsStaff === 0) {
      addWarning('Infrastructure', 'Zero staff toilets reported.', 'Ensure staff hygiene facilities are documented.');
    }
    if (report.infrastructure.classroomsPermanent === 0 && report.infrastructure.classroomsTemporary === 0) {
      addWarning('Infrastructure', 'No learning structures reported.', 'Verify if the school uses open-air teaching.');
    }
  }

  if (report.teachers?.summary && report.teachers.summary.length === 0) {
    addWarning('Teachers', 'No teachers listed in profile.', 'A functioning school requires at least one faculty member.');
  }

  return errors;
};
