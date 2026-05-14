
import { db } from '../db';

export interface ZonalAggregate {
    totalEnrolment: number;
    totalTeachers: number;
    boysEnrolment: number;
    girlsEnrolment: number;
    term: string;
    year: number;
    schoolsSubmitted: number;
    totalSchools: number;
}

export async function recalculateZonalAggregates(term: string, year: number) {
    console.log(`Recalculating Zonal Aggregates for ${term} ${year}...`);
    
    const reports = await db.termlyReports
        .where('[term+year]')
        .equals([term, year])
        .filter(r => r.status === 'Submitted')
        .toArray();

    const schools = await db.schools.toArray();
    
    let totalEnrolment = 0;
    let boysEnrolment = 0;
    let girlsEnrolment = 0;
    let totalTeachers = 0;

    reports.forEach(report => {
        // Sum enrolment
        if (report.enrolment) {
            Object.values(report.enrolment).forEach(g => {
                totalEnrolment += (g.m + g.f);
                boysEnrolment += g.m;
                girlsEnrolment += g.f;
            });
        }

        // Sum teachers
        if (report.teachers?.summary) {
            totalTeachers += report.teachers.summary.length;
        }
    });

    const aggregate: ZonalAggregate = {
        totalEnrolment,
        boysEnrolment,
        girlsEnrolment,
        totalTeachers,
        term,
        year,
        schoolsSubmitted: reports.length,
        totalSchools: schools.length
    };

    // In a real app, we might save this to a 'zonalAggregates' table
    // For now, we'll return it and perhaps store in localStorage or just let the dashboard compute it.
    localStorage.setItem(`zonal_aggregate_${term}_${year}`, JSON.stringify(aggregate));
    
    return aggregate;
}
