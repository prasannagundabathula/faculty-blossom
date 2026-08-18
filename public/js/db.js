/**
 * BVCITS College ERP & Student/Faculty Database Singleton
 * Persistent relational storage in localStorage
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'BVCITS_ERP_DATABASE_V3';

  const defaultDatabase = {
    meta: {
      institution: 'Bonam Venkata Chalamayya Institute of Technology & Science',
      code: 'BVTS',
      autonomous: true,
      naac: 'A',
      version: '3.0.0',
      lastUpdated: '2026-08-15'
    },
    users: [
      {
        id: 'usr_ratnaraju',
        username: 'ratnaraju',
        password: 'password123',
        role: 'student',
        fullName: 'G. Ratnaraju',
        rollNo: '22H41A0482',
        email: 'ratnaraju.ece@bvcits.edu.in',
        phone: '+91 98481 23456',
        department: 'Electronics & Communication Engineering (ECE)',
        deptCode: 'ECE',
        program: 'B.Tech — Electronics & Communication Engineering',
        year: 'III Year',
        section: 'A',
        semester: 'Semester V (Current)',
        academicYear: '2025-2026',
        cgpa: 8.72,
        admissionType: 'EAPCET Rank 12450 (Convenor Quota)',
        avatar: 'images/tcs_achievers_7lpa.jpg',
        mentor: 'Dr. B. Lakshmi Narayana (HOD ECE)',
        placementStatus: 'Placed at TCS (7.09 LPA Package)',
        bloodGroup: 'O+',
        dob: '2004-05-14',
        address: 'Batlapalem, Amalapuram, East Godavari Dist., AP - 533201',
        status: 'Active'
      },
      {
        id: 'usr_meenakshi',
        username: 'meenakshi',
        password: 'password123',
        role: 'student',
        fullName: 'G. Meenakshi',
        rollNo: '22H41A0580',
        email: 'meenakshi.cse@bvcits.edu.in',
        phone: '+91 98482 34567',
        department: 'Computer Science & Engineering (CSE)',
        deptCode: 'CSE',
        program: 'B.Tech — Computer Science & Engineering',
        year: 'III Year',
        section: 'A',
        semester: 'Semester V (Current)',
        academicYear: '2025-2026',
        cgpa: 8.94,
        admissionType: 'EAPCET Rank 8420 (Convenor Quota)',
        avatar: 'images/tcs_achievers_7lpa.jpg',
        mentor: 'Dr. M. S. R. Murthy (HOD CSE)',
        placementStatus: 'Placed at TCS (7.09 LPA Package)',
        bloodGroup: 'B+',
        dob: '2004-08-22',
        address: 'Amalapuram Town, East Godavari Dist., AP - 533201',
        status: 'Active'
      },
      {
        id: 'usr_sailakshmi',
        username: 'sailakshmi',
        password: 'password123',
        role: 'student',
        fullName: 'P. Sai Lakshmi',
        rollNo: '22H41A0512',
        email: 'sailakshmi.cse@bvcits.edu.in',
        phone: '+91 98483 45678',
        department: 'Computer Science & Engineering (CSE)',
        deptCode: 'CSE',
        program: 'B.Tech — Computer Science & Engineering',
        year: 'III Year',
        section: 'A',
        semester: 'Semester V (Current)',
        academicYear: '2025-2026',
        cgpa: 8.65,
        admissionType: 'EAPCET Rank 11200 (Convenor Quota)',
        avatar: 'images/achievers_students.jpg',
        mentor: 'Dr. M. S. R. Murthy (HOD CSE)',
        placementStatus: 'Smart India Hackathon Finalist / Infosys Power',
        bloodGroup: 'A+',
        dob: '2004-03-10',
        address: 'Ravulapalem, East Godavari Dist., AP - 533238',
        status: 'Active'
      },
      {
        id: 'usr_teja',
        username: 'teja',
        password: 'password123',
        role: 'student',
        fullName: 'K. V. Teja',
        rollNo: '22H41A0415',
        email: 'teja.ece@bvcits.edu.in',
        phone: '+91 98484 56789',
        department: 'Electronics & Communication Engineering (ECE)',
        deptCode: 'ECE',
        program: 'B.Tech — Electronics & Communication Engineering',
        year: 'II Year',
        section: 'B',
        semester: 'Semester III (Current)',
        academicYear: '2025-2026',
        cgpa: 7.42,
        admissionType: 'EAPCET Rank 24100',
        avatar: 'images/campus_life_walkway.jpg',
        mentor: 'Dr. B. Lakshmi Narayana',
        placementStatus: 'CRT Phase-1 Enrolled',
        bloodGroup: 'O-',
        dob: '2005-01-18',
        address: 'Mummidivaram, East Godavari Dist., AP - 533216',
        status: 'Active'
      },
      {
        id: 'usr_ananya',
        username: 'ananya',
        password: 'password123',
        role: 'student',
        fullName: 'M. Ananya',
        rollNo: '22H41A1208',
        email: 'ananya.it@bvcits.edu.in',
        phone: '+91 98485 67890',
        department: 'Information Technology (IT)',
        deptCode: 'IT',
        program: 'B.Tech — Information Technology',
        year: 'III Year',
        section: 'A',
        semester: 'Semester V (Current)',
        academicYear: '2025-2026',
        cgpa: 8.45,
        admissionType: 'EAPCET Rank 14300',
        avatar: 'images/achievers_students.jpg',
        mentor: 'Prof. Ch. Srinivas',
        placementStatus: 'Cognizant GenC Mentee',
        bloodGroup: 'B+',
        dob: '2004-11-05',
        address: 'Razole, East Godavari Dist., AP - 533242',
        status: 'Active'
      },
      {
        id: 'usr_murthy',
        username: 'murthy',
        password: 'password123',
        role: 'faculty',
        fullName: 'Dr. M. S. R. Murthy',
        employeeId: 'FAC001',
        email: 'murthy.cse@bvcits.edu.in',
        phone: '+91 94401 22334',
        department: 'Computer Science & Engineering (CSE)',
        deptCode: 'CSE',
        designation: 'Professor & Head of Department',
        qualification: 'Ph.D. (Computer Science), M.Tech (AI & Cloud Systems)',
        experience: '18 Years Teaching & Industry Consulting',
        assignedClasses: ['CSE-3A', 'CSE-3B', 'IT-3A'],
        avatar: 'images/bvcits_seal.jpg',
        status: 'Active'
      },
      {
        id: 'usr_narayana',
        username: 'narayana',
        password: 'password123',
        role: 'faculty',
        fullName: 'Dr. B. Lakshmi Narayana',
        employeeId: 'FAC002',
        email: 'narayana.ece@bvcits.edu.in',
        phone: '+91 94402 33445',
        department: 'Electronics & Communication Engineering (ECE)',
        deptCode: 'ECE',
        designation: 'Professor & Head of Department',
        qualification: 'Ph.D. (VLSI & Signal Processing)',
        experience: '20 Years Teaching & Research',
        assignedClasses: ['ECE-3A', 'ECE-2A'],
        avatar: 'images/bvcits_seal.jpg',
        status: 'Active'
      },
      {
        id: 'usr_admin',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        fullName: 'Dr. K. V. N. R. Prasad',
        employeeId: 'ADM001',
        email: 'principal@bvcits.edu.in',
        phone: '+91 99854 22678',
        department: 'Central Administration',
        designation: 'Principal & Chief Administrator',
        qualification: 'Ph.D. (IIT Madras)',
        experience: '24+ Years Administration & Research',
        avatar: 'images/bvcits_seal.jpg',
        status: 'Active'
      }
    ],

    attendance: {
      usr_ratnaraju: {
        overall: 88.6,
        totalClasses: 210,
        attendedClasses: 186,
        missedClasses: 24,
        subjects: [
          { code: 'EC501', name: 'VLSI Design & Embedded Systems', faculty: 'Dr. B. Lakshmi Narayana', totalClasses: 45, attended: 41, missed: 4, percentage: 91.1, status: 'Good' },
          { code: 'EC502', name: 'Digital Communication Systems', faculty: 'Prof. K. Satyanarayana', totalClasses: 42, attended: 38, missed: 4, percentage: 90.5, status: 'Good' },
          { code: 'EC503', name: 'Antennas & Microwave Engineering', faculty: 'Dr. P. Suresh Kumar', totalClasses: 40, attended: 34, missed: 6, percentage: 85.0, status: 'Good' },
          { code: 'EC504', name: 'Digital Signal Processing (DSP)', faculty: 'Prof. M. V. R. Raju', totalClasses: 43, attended: 39, missed: 4, percentage: 90.7, status: 'Good' },
          { code: 'EC505', name: 'Microcontrollers & IoT Lab', faculty: 'Dr. B. Lakshmi Narayana', totalClasses: 40, attended: 34, missed: 6, percentage: 85.0, status: 'Good' }
        ]
      },
      usr_meenakshi: {
        overall: 91.2,
        totalClasses: 215,
        attendedClasses: 196,
        missedClasses: 19,
        subjects: [
          { code: 'CS501', name: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', totalClasses: 45, attended: 42, missed: 3, percentage: 93.3, status: 'Good' },
          { code: 'CS502', name: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', totalClasses: 44, attended: 41, missed: 3, percentage: 93.2, status: 'Good' },
          { code: 'CS503', name: 'Database Management Systems (DBMS)', faculty: 'Prof. S. R. Prasad', totalClasses: 42, attended: 38, missed: 4, percentage: 90.5, status: 'Good' },
          { code: 'CS504', name: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', totalClasses: 44, attended: 39, missed: 5, percentage: 88.6, status: 'Good' },
          { code: 'CS505', name: 'Operating Systems & Cloud Lab', faculty: 'Dr. M. S. R. Murthy', totalClasses: 40, attended: 36, missed: 4, percentage: 90.0, status: 'Good' }
        ]
      },
      usr_sailakshmi: {
        overall: 86.5,
        totalClasses: 215,
        attendedClasses: 186,
        missedClasses: 29,
        subjects: [
          { code: 'CS501', name: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', totalClasses: 45, attended: 39, missed: 6, percentage: 86.7, status: 'Good' },
          { code: 'CS502', name: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', totalClasses: 44, attended: 38, missed: 6, percentage: 86.4, status: 'Good' },
          { code: 'CS503', name: 'Database Management Systems (DBMS)', faculty: 'Prof. S. R. Prasad', totalClasses: 42, attended: 37, missed: 5, percentage: 88.1, status: 'Good' },
          { code: 'CS504', name: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', totalClasses: 44, attended: 37, missed: 7, percentage: 84.1, status: 'Good' },
          { code: 'CS505', name: 'Operating Systems & Cloud Lab', faculty: 'Dr. M. S. R. Murthy', totalClasses: 40, attended: 35, missed: 5, percentage: 87.5, status: 'Good' }
        ]
      },
      usr_teja: {
        overall: 71.4,
        totalClasses: 210,
        attendedClasses: 150,
        missedClasses: 60,
        subjects: [
          { code: 'EC301', name: 'Electronic Devices & Circuits', faculty: 'Dr. B. Lakshmi Narayana', totalClasses: 45, attended: 31, missed: 14, percentage: 68.9, status: 'Shortage' },
          { code: 'EC302', name: 'Network Analysis & Synthesis', faculty: 'Prof. K. Satyanarayana', totalClasses: 42, attended: 30, missed: 12, percentage: 71.4, status: 'Shortage' },
          { code: 'EC303', name: 'Signals & Systems', faculty: 'Prof. M. V. R. Raju', totalClasses: 40, attended: 28, missed: 12, percentage: 70.0, status: 'Shortage' },
          { code: 'EC304', name: 'Digital System Design', faculty: 'Dr. P. Suresh Kumar', totalClasses: 43, attended: 33, missed: 10, percentage: 76.7, status: 'Good' },
          { code: 'EC305', name: 'EDC Simulation Lab', faculty: 'Dr. B. Lakshmi Narayana', totalClasses: 40, attended: 28, missed: 12, percentage: 70.0, status: 'Shortage' }
        ]
      },
      usr_ananya: {
        overall: 84.8,
        totalClasses: 210,
        attendedClasses: 178,
        missedClasses: 32,
        subjects: [
          { code: 'IT501', name: 'Web Programming Frameworks', faculty: 'Prof. Ch. Srinivas', totalClasses: 45, attended: 39, missed: 6, percentage: 86.7, status: 'Good' },
          { code: 'IT502', name: 'Information Security & Cryptography', faculty: 'Dr. G. Suresh Babu', totalClasses: 42, attended: 35, missed: 7, percentage: 83.3, status: 'Good' },
          { code: 'IT503', name: 'Software Engineering & Agile', faculty: 'Prof. S. R. Prasad', totalClasses: 40, attended: 34, missed: 6, percentage: 85.0, status: 'Good' },
          { code: 'IT504', name: 'Cloud Computing & Virtualization', faculty: 'Dr. M. S. R. Murthy', totalClasses: 43, attended: 36, missed: 7, percentage: 83.7, status: 'Good' },
          { code: 'IT505', name: 'Full Stack Development Lab', faculty: 'Prof. Ch. Srinivas', totalClasses: 40, attended: 34, missed: 6, percentage: 85.0, status: 'Good' }
        ]
      }
    },

    marks: {
      usr_ratnaraju: {
        cgpa: 8.72,
        totalCredits: 116,
        maxCredits: 160,
        activeBacklogs: 0,
        classification: 'First Class with Distinction',
        semesters: [
          { sem: 'Sem 1', gpa: 8.20, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 2', gpa: 8.45, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 3', gpa: 8.65, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 4', gpa: 8.85, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 5', gpa: 8.90, totalCredits: 20, status: 'Current' }
        ],
        currentSemesterSubjects: [
          { code: 'EC501', name: 'VLSI Design & Embedded Systems', internalMarks: 28, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 48, maxLab: 50, mid1: 28, mid2: 29, endSem: 62, maxEndSem: 70, total: 90, classAvg: 74, highest: 96, grade: 'O', gradePoint: 10, credits: 4 },
          { code: 'EC502', name: 'Digital Communication Systems', internalMarks: 27, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 46, maxLab: 50, mid1: 27, mid2: 28, endSem: 58, maxEndSem: 70, total: 85, classAvg: 71, highest: 92, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'EC503', name: 'Antennas & Microwave Engineering', internalMarks: 26, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 45, maxLab: 50, mid1: 25, mid2: 27, endSem: 56, maxEndSem: 70, total: 82, classAvg: 68, highest: 89, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'EC504', name: 'Digital Signal Processing (DSP)', internalMarks: 29, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 49, maxLab: 50, mid1: 29, mid2: 30, endSem: 64, maxEndSem: 70, total: 93, classAvg: 73, highest: 95, grade: 'O', gradePoint: 10, credits: 4 },
          { code: 'EC505', name: 'Microcontrollers & IoT Lab', internalMarks: 30, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 49, maxLab: 50, mid1: 30, mid2: 30, endSem: 68, maxEndSem: 70, total: 98, classAvg: 82, highest: 99, grade: 'O', gradePoint: 10, credits: 4 }
        ]
      },
      usr_meenakshi: {
        cgpa: 8.94,
        totalCredits: 116,
        maxCredits: 160,
        activeBacklogs: 0,
        classification: 'First Class with Distinction',
        semesters: [
          { sem: 'Sem 1', gpa: 8.50, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 2', gpa: 8.75, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 3', gpa: 8.95, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 4', gpa: 9.15, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 5', gpa: 9.20, totalCredits: 20, status: 'Current' }
        ],
        currentSemesterSubjects: [
          { code: 'CS501', name: 'Design & Analysis of Algorithms', internalMarks: 29, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 49, maxLab: 50, mid1: 29, mid2: 30, endSem: 65, maxEndSem: 70, total: 94, classAvg: 72, highest: 98, grade: 'O', gradePoint: 10, credits: 4 },
          { code: 'CS502', name: 'Advanced Java Programming', internalMarks: 30, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 50, maxLab: 50, mid1: 30, mid2: 30, endSem: 67, maxEndSem: 70, total: 97, classAvg: 75, highest: 99, grade: 'O', gradePoint: 10, credits: 4 },
          { code: 'CS503', name: 'Database Management Systems (DBMS)', internalMarks: 28, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 48, maxLab: 50, mid1: 28, mid2: 29, endSem: 61, maxEndSem: 70, total: 89, classAvg: 70, highest: 94, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'CS504', name: 'Computer Networks', internalMarks: 28, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 47, maxLab: 50, mid1: 27, mid2: 29, endSem: 60, maxEndSem: 70, total: 88, classAvg: 69, highest: 93, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'CS505', name: 'Operating Systems & Cloud Lab', internalMarks: 30, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 50, maxLab: 50, mid1: 30, mid2: 30, endSem: 68, maxEndSem: 70, total: 98, classAvg: 80, highest: 99, grade: 'O', gradePoint: 10, credits: 4 }
        ]
      },
      usr_sailakshmi: {
        cgpa: 8.65,
        totalCredits: 116,
        maxCredits: 160,
        activeBacklogs: 0,
        classification: 'First Class with Distinction',
        semesters: [
          { sem: 'Sem 1', gpa: 8.10, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 2', gpa: 8.35, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 3', gpa: 8.60, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 4', gpa: 8.80, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 5', gpa: 8.85, totalCredits: 20, status: 'Current' }
        ],
        currentSemesterSubjects: [
          { code: 'CS501', name: 'Design & Analysis of Algorithms', internalMarks: 27, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 46, maxLab: 50, mid1: 26, mid2: 28, endSem: 58, maxEndSem: 70, total: 85, classAvg: 72, highest: 98, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'CS502', name: 'Advanced Java Programming', internalMarks: 28, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 48, maxLab: 50, mid1: 28, mid2: 29, endSem: 62, maxEndSem: 70, total: 90, classAvg: 75, highest: 99, grade: 'O', gradePoint: 10, credits: 4 },
          { code: 'CS503', name: 'Database Management Systems (DBMS)', internalMarks: 27, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 45, maxLab: 50, mid1: 27, mid2: 28, endSem: 57, maxEndSem: 70, total: 84, classAvg: 70, highest: 94, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'CS504', name: 'Computer Networks', internalMarks: 26, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 45, maxLab: 50, mid1: 26, mid2: 27, endSem: 56, maxEndSem: 70, total: 82, classAvg: 69, highest: 93, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'CS505', name: 'Operating Systems & Cloud Lab', internalMarks: 29, maxInternal: 30, assignmentMarks: 10, maxAssignment: 10, labMarks: 48, maxLab: 50, mid1: 29, mid2: 30, endSem: 65, maxEndSem: 70, total: 94, classAvg: 80, highest: 99, grade: 'O', gradePoint: 10, credits: 4 }
        ]
      },
      usr_teja: {
        cgpa: 7.42,
        totalCredits: 70,
        maxCredits: 160,
        activeBacklogs: 0,
        classification: 'First Class',
        semesters: [
          { sem: 'Sem 1', gpa: 7.10, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 2', gpa: 7.35, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 3', gpa: 7.50, totalCredits: 22, status: 'Current' }
        ],
        currentSemesterSubjects: [
          { code: 'EC301', name: 'Electronic Devices & Circuits', internalMarks: 22, maxInternal: 30, assignmentMarks: 8, maxAssignment: 10, labMarks: 38, maxLab: 50, mid1: 21, mid2: 23, endSem: 48, maxEndSem: 70, total: 70, classAvg: 68, highest: 91, grade: 'B+', gradePoint: 7, credits: 4 },
          { code: 'EC302', name: 'Network Analysis & Synthesis', internalMarks: 24, maxInternal: 30, assignmentMarks: 8, maxAssignment: 10, labMarks: 40, maxLab: 50, mid1: 23, mid2: 25, endSem: 52, maxEndSem: 70, total: 76, classAvg: 70, highest: 94, grade: 'A', gradePoint: 8, credits: 4 },
          { code: 'EC303', name: 'Signals & Systems', internalMarks: 23, maxInternal: 30, assignmentMarks: 8, maxAssignment: 10, labMarks: 39, maxLab: 50, mid1: 22, mid2: 24, endSem: 50, maxEndSem: 70, total: 73, classAvg: 67, highest: 89, grade: 'B+', gradePoint: 7, credits: 4 }
        ]
      },
      usr_ananya: {
        cgpa: 8.45,
        totalCredits: 116,
        maxCredits: 160,
        activeBacklogs: 0,
        classification: 'First Class with Distinction',
        semesters: [
          { sem: 'Sem 1', gpa: 8.00, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 2', gpa: 8.25, totalCredits: 21, status: 'Passed' },
          { sem: 'Sem 3', gpa: 8.45, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 4', gpa: 8.65, totalCredits: 22, status: 'Passed' },
          { sem: 'Sem 5', gpa: 8.70, totalCredits: 20, status: 'Current' }
        ],
        currentSemesterSubjects: [
          { code: 'IT501', name: 'Web Programming Frameworks', internalMarks: 27, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 46, maxLab: 50, mid1: 26, mid2: 28, endSem: 59, maxEndSem: 70, total: 86, classAvg: 73, highest: 95, grade: 'A+', gradePoint: 9, credits: 4 },
          { code: 'IT502', name: 'Information Security & Cryptography', internalMarks: 26, maxInternal: 30, assignmentMarks: 9, maxAssignment: 10, labMarks: 45, maxLab: 50, mid1: 25, mid2: 27, endSem: 57, maxEndSem: 70, total: 83, classAvg: 70, highest: 91, grade: 'A+', gradePoint: 9, credits: 4 }
        ]
      }
    },

    timetables: {
      'ECE-III-A': {
        department: 'Electronics & Communication Engineering',
        year: 'III Year',
        section: 'A',
        academicYear: '2025-2026',
        schedule: {
          'Monday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'EC501', subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. B. Lakshmi Narayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'EC502', subject: 'Digital Communication Systems', faculty: 'Prof. K. Satyanarayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'EC504', subject: 'Digital Signal Processing (DSP)', faculty: 'Prof. M. V. R. Raju', room: 'Room 304 (Aryabhata Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'EC503', subject: 'Antennas & Microwave Engineering', faculty: 'Dr. P. Suresh Kumar', room: 'Room 304 (Aryabhata Block)' },
            { period: '5', time: '01:50 PM – 04:20 PM', code: 'EC505', subject: 'Microcontrollers & IoT Laboratory (Practical Batch A)', faculty: 'Dr. B. Lakshmi Narayana', room: 'Advanced IoT Lab (Floor 2)' }
          ],
          'Tuesday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'EC504', subject: 'Digital Signal Processing (DSP)', faculty: 'Prof. M. V. R. Raju', room: 'Room 304 (Aryabhata Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'EC501', subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. B. Lakshmi Narayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'EC502', subject: 'Digital Communication Systems', faculty: 'Prof. K. Satyanarayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CRT501', subject: 'Campus Placement CRT — Quantitative Aptitude', faculty: 'Prof. Ch. Srinivas', room: 'Placement Auditorium' },
            { period: '5', time: '01:50 PM – 03:30 PM', code: 'EC506', subject: 'DSP Simulation Lab (MATLAB)', faculty: 'Prof. M. V. R. Raju', room: 'Computing Lab 3' }
          ],
          'Wednesday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'EC503', subject: 'Antennas & Microwave Engineering', faculty: 'Dr. P. Suresh Kumar', room: 'Room 304 (Aryabhata Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'EC501', subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. B. Lakshmi Narayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'EC502', subject: 'Digital Communication Systems', faculty: 'Prof. K. Satyanarayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'EC504', subject: 'Digital Signal Processing (DSP)', faculty: 'Prof. M. V. R. Raju', room: 'Room 304 (Aryabhata Block)' },
            { period: '5', time: '01:50 PM – 03:30 PM', code: 'CODE501', subject: 'CodeQuest Competitive Coding Track', faculty: 'Dr. M. S. R. Murthy', room: 'CSE Central Lab 2' }
          ],
          'Thursday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'EC502', subject: 'Digital Communication Systems', faculty: 'Prof. K. Satyanarayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'EC503', subject: 'Antennas & Microwave Engineering', faculty: 'Dr. P. Suresh Kumar', room: 'Room 304 (Aryabhata Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'EC501', subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. B. Lakshmi Narayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'EC504', subject: 'Digital Signal Processing (DSP)', faculty: 'Prof. M. V. R. Raju', room: 'Room 304 (Aryabhata Block)' },
            { period: '5', time: '01:50 PM – 04:20 PM', code: 'EC507', subject: 'VLSI Cadence Design Lab (Practical Batch A)', faculty: 'Dr. B. Lakshmi Narayana', room: 'VLSI Research Lab' }
          ],
          'Friday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'EC501', subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. B. Lakshmi Narayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'EC504', subject: 'Digital Signal Processing (DSP)', faculty: 'Prof. M. V. R. Raju', room: 'Room 304 (Aryabhata Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'EC503', subject: 'Antennas & Microwave Engineering', faculty: 'Dr. P. Suresh Kumar', room: 'Room 304 (Aryabhata Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CRT502', subject: 'CRT Technical Interview & Coding Prep', faculty: 'Prof. Ch. Srinivas', room: 'Seminar Hall 1' },
            { period: '5', time: '01:50 PM – 03:30 PM', code: 'LIB501', subject: 'Digital Library & Research Project Hour', faculty: 'Faculty Advisor', room: 'Central Library Floor 2' }
          ],
          'Saturday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'EC503', subject: 'Antennas & Microwave Engineering', faculty: 'Dr. P. Suresh Kumar', room: 'Room 304 (Aryabhata Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'EC502', subject: 'Digital Communication Systems', faculty: 'Prof. K. Satyanarayana', room: 'Room 304 (Aryabhata Block)' },
            { period: '3', time: '11:20 AM – 01:00 PM', code: 'SEMINAR', subject: 'Student Technical Seminar & Hackathon Mentorship', faculty: 'Dr. B. Lakshmi Narayana', room: 'Auditorium' }
          ]
        }
      },
      'CSE-III-A': {
        department: 'Computer Science & Engineering',
        year: 'III Year',
        section: 'A',
        academicYear: '2025-2026',
        schedule: {
          'Monday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'CS501', subject: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', room: 'Room 201 (Ramanujan Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'CS502', subject: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', room: 'Room 201 (Ramanujan Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'CS503', subject: 'Database Management Systems (DBMS)', faculty: 'Prof. S. R. Prasad', room: 'Room 201 (Ramanujan Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CS504', subject: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', room: 'Room 201 (Ramanujan Block)' },
            { period: '5', time: '01:50 PM – 04:20 PM', code: 'CS505', subject: 'Operating Systems & Cloud Lab', faculty: 'Dr. M. S. R. Murthy', room: 'CSE Lab 1' }
          ],
          'Tuesday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'CS503', subject: 'Database Management Systems (DBMS)', faculty: 'Prof. S. R. Prasad', room: 'Room 201 (Ramanujan Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'CS501', subject: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', room: 'Room 201 (Ramanujan Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'CS502', subject: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', room: 'Room 201 (Ramanujan Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CRT501', subject: 'Campus Recruitment Training (CRT)', faculty: 'Prof. Ch. Srinivas', room: 'Auditorium' },
            { period: '5', time: '01:50 PM – 04:20 PM', code: 'CS506', subject: 'Advanced Java Programming Lab', faculty: 'Dr. M. S. R. Murthy', room: 'CSE Lab 2' }
          ],
          'Wednesday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'CS504', subject: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', room: 'Room 201 (Ramanujan Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'CS502', subject: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', room: 'Room 201 (Ramanujan Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'CS503', subject: 'Database Management Systems', faculty: 'Prof. S. R. Prasad', room: 'Room 201 (Ramanujan Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CS501', subject: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', room: 'Room 201 (Ramanujan Block)' },
            { period: '5', time: '01:50 PM – 03:30 PM', code: 'CODE501', subject: 'CodeQuest Arena & Algorithmic Practice', faculty: 'Dr. M. S. R. Murthy', room: 'Cloud Computing Lab' }
          ],
          'Thursday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'CS501', subject: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', room: 'Room 201 (Ramanujan Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'CS504', subject: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', room: 'Room 201 (Ramanujan Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'CS502', subject: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', room: 'Room 201 (Ramanujan Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CS503', subject: 'Database Management Systems', faculty: 'Prof. S. R. Prasad', room: 'Room 201 (Ramanujan Block)' },
            { period: '5', time: '01:50 PM – 04:20 PM', code: 'CS507', subject: 'DBMS & SQL Query Optimization Lab', faculty: 'Prof. S. R. Prasad', room: 'CSE Lab 3' }
          ],
          'Friday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'CS502', subject: 'Advanced Java Programming', faculty: 'Dr. M. S. R. Murthy', room: 'Room 201 (Ramanujan Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'CS503', subject: 'Database Management Systems', faculty: 'Prof. S. R. Prasad', room: 'Room 201 (Ramanujan Block)' },
            { period: '3', time: '11:20 AM – 12:10 PM', code: 'CS504', subject: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', room: 'Room 201 (Ramanujan Block)' },
            { period: '4', time: '12:10 PM – 01:00 PM', code: 'CRT502', subject: 'Soft Skills & Mock Interviews', faculty: 'Prof. Ch. Srinivas', room: 'Seminar Hall 2' },
            { period: '5', time: '01:50 PM – 03:30 PM', code: 'PROJ501', subject: 'Industry Capstone Project Hour', faculty: 'Dr. M. S. R. Murthy', room: 'Innovation Hub' }
          ],
          'Saturday': [
            { period: '1', time: '09:30 AM – 10:20 AM', code: 'CS501', subject: 'Design & Analysis of Algorithms', faculty: 'Prof. T. Vijay Kumar', room: 'Room 201 (Ramanujan Block)' },
            { period: '2', time: '10:20 AM – 11:10 AM', code: 'CS504', subject: 'Computer Networks', faculty: 'Dr. G. Suresh Babu', room: 'Room 201 (Ramanujan Block)' },
            { period: '3', time: '11:20 AM – 01:00 PM', code: 'HACK501', subject: 'Smart India Hackathon Mentorship', faculty: 'Dr. M. S. R. Murthy', room: 'Central Computing Complex' }
          ]
        }
      }
    },

    codingQuestions: [
      // -------------------- EASY PROBLEMS --------------------
      {
        id: 'cq_easy_1',
        title: 'Two Sum Target Problem',
        slug: 'two-sum-target-problem',
        difficulty: 'Easy',
        category: 'Arrays & Math',
        xpReward: 100,
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Print the two 0-based indices separated by a space, with the smaller index first.',
        inputFormat: 'Line 1: Two integers N (array length) and Target.\nLine 2: N space-separated integers.',
        outputFormat: 'Two space-separated integers representing the indices.',
        constraints: '2 <= N <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one valid answer exists.',
        sampleCases: [
          { input: '4 9\n2 7 11 15', expectedOutput: '0 1' },
          { input: '3 6\n3 2 4', expectedOutput: '1 2' }
        ],
        hiddenTestCases: [
          { input: '5 10\n1 3 5 7 9', expectedOutput: '0 4' },
          { input: '4 8\n4 2 6 5', expectedOutput: '1 2' },
          { input: '2 7\n3 4', expectedOutput: '0 1' }
        ],
        starterCode: {
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int target = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        \n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < n; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                System.out.println(map.get(complement) + " " + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}',
          python: 'import sys\n\ndef solve():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n, target = int(input_data[0]), int(input_data[1])\n    nums = [int(x) for x in input_data[2:2+n]]\n    \n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            print(f"{seen[diff]} {i}")\n            return\n        seen[num] = i\n\nsolve()',
          c: '#include <stdio.h>\n\nint main() {\n    int n, target;\n    if (scanf("%d %d", &n, &target) != 2) return 0;\n    int nums[10000];\n    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);\n    \n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) {\n                printf("%d %d\\n", i, j);\n                return 0;\n            }\n        }\n    }\n    return 0;\n}',
          cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n, target;\n    if (!(cin >> n >> target)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    \n    unordered_map<int, int> map;\n    for (int i = 0; i < n; i++) {\n        int complement = target - nums[i];\n        if (map.count(complement)) {\n            cout << map[complement] << " " << i << endl;\n            return 0;\n        }\n        map[nums[i]] = i;\n    }\n    return 0;\n}',
          javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = Number(tokens[0]);\n  const target = Number(tokens[1]);\n  const nums = tokens.slice(2, 2 + n).map(Number);\n  const map = new Map();\n  for (let i = 0; i < n; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      console.log(`${map.get(diff)} ${i}`);\n      break;\n    }\n    map.set(nums[i], i);\n  }\n}'
        }
      },
      {
        id: 'cq_easy_2',
        title: 'Factorial Digit Sum',
        slug: 'factorial-digit-sum',
        difficulty: 'Easy',
        category: 'Loops & Math',
        xpReward: 100,
        description: 'Given an integer N, calculate its factorial (N!) and find the sum of all the digits in N!.',
        inputFormat: 'A single integer N.',
        outputFormat: 'A single integer representing the sum of digits of N!.',
        constraints: '1 <= N <= 15',
        sampleCases: [
          { input: '5', expectedOutput: '3' },
          { input: '4', expectedOutput: '6' }
        ],
        hiddenTestCases: [
          { input: '6', expectedOutput: '9' },
          { input: '7', expectedOutput: '9' },
          { input: '3', expectedOutput: '6' }
        ],
        starterCode: {
          java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long fact = 1;\n        for (int i = 1; i <= n; i++) fact *= i;\n        long sum = 0;\n        while (fact > 0) {\n            sum += fact % 10;\n            fact /= 10;\n        }\n        System.out.println(sum);\n    }\n}',
          python: 'import math\nn = int(input().strip())\nfact = math.factorial(n)\nprint(sum(int(d) for d in str(fact)))',
          c: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    long long fact = 1;\n    for (int i = 1; i <= n; i++) fact *= i;\n    long long sum = 0;\n    while (fact > 0) {\n        sum += fact % 10;\n        fact /= 10;\n    }\n    printf("%lld\\n", sum);\n    return 0;\n}',
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long fact = 1;\n    for (int i = 1; i <= n; i++) fact *= i;\n    long long sum = 0;\n    while (fact > 0) {\n        sum += fact % 10;\n        fact /= 10;\n    }\n    cout << sum << endl;\n    return 0;\n}',
          javascript: 'const fs = require("fs");\nconst n = Number(fs.readFileSync(0, "utf-8").trim());\nlet fact = 1n;\nfor (let i = 1n; i <= BigInt(n); i++) fact *= i;\nconst sum = String(fact).split("").reduce((acc, d) => acc + Number(d), 0);\nconsole.log(sum);'
        }
      },
      {
        id: 'cq_easy_3',
        title: 'Palindrome String Checker',
        slug: 'palindrome-string-checker',
        difficulty: 'Easy',
        category: 'Strings & Two Pointers',
        xpReward: 100,
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Print "true" or "false".',
        inputFormat: 'A string s.',
        outputFormat: '"true" or "false".',
        constraints: '1 <= s.length <= 1000',
        sampleCases: [
          { input: 'racecar', expectedOutput: 'true' },
          { input: 'bvcits', expectedOutput: 'false' }
        ],
        hiddenTestCases: [
          { input: 'radar', expectedOutput: 'true' },
          { input: 'amalapuram', expectedOutput: 'false' }
        ],
        starterCode: {
          java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim().toLowerCase();\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? "true" : "false");\n    }\n}',
          python: 's = input().strip().lower()\nprint("true" if s == s[::-1] else "false")',
          c: '#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main() {\n    char s[1005];\n    if (scanf("%s", s) != 1) return 0;\n    int len = strlen(s);\n    int isPal = 1;\n    for (int i = 0; i < len / 2; i++) {\n        if (tolower(s[i]) != tolower(s[len - 1 - i])) {\n            isPal = 0;\n            break;\n        }\n    }\n    printf("%s\\n", isPal ? "true" : "false");\n    return 0;\n}',
          cpp: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    string r = s;\n    reverse(r.begin(), r.end());\n    cout << (s == r ? "true" : "false") << endl;\n    return 0;\n}',
          javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim().toLowerCase();\nconst rev = s.split("").reverse().join("");\nconsole.log(s === rev ? "true" : "false");'
        }
      },

      // -------------------- MEDIUM PROBLEMS --------------------
      {
        id: 'cq_med_1',
        title: 'Valid Parentheses Validator',
        slug: 'valid-parentheses-validator',
        difficulty: 'Medium',
        category: 'Stacks & Parsing',
        xpReward: 200,
        description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order. Print "true" or "false".',
        inputFormat: 'A string s containing bracket characters.',
        outputFormat: '"true" or "false".',
        constraints: '1 <= s.length <= 10^4',
        sampleCases: [
          { input: '()[]{}', expectedOutput: 'true' },
          { input: '(]', expectedOutput: 'false' }
        ],
        hiddenTestCases: [
          { input: '([{}])', expectedOutput: 'true' },
          { input: '[(])', expectedOutput: 'false' },
          { input: '{[]}', expectedOutput: 'true' }
        ],
        starterCode: {
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().trim();\n        Stack<Character> st = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n            else {\n                if (st.isEmpty()) { System.out.println("false"); return; }\n                char top = st.pop();\n                if (c == \')\' && top != \'(\') { System.out.println("false"); return; }\n                if (c == \'}\' && top != \'{\') { System.out.println("false"); return; }\n                if (c == \']\' && top != \'[\') { System.out.println("false"); return; }\n            }\n        }\n        System.out.println(st.isEmpty() ? "true" : "false");\n    }\n}',
          python: 's = input().strip()\nstack = []\nmapping = {")": "(", "}": "{", "]": "["}\nvalid = True\nfor char in s:\n    if char in mapping.values():\n        stack.append(char)\n    elif char in mapping:\n        if not stack or stack.pop() != mapping[char]:\n            valid = False\n            break\nprint("true" if valid and not stack else "false")',
          c: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[10005];\n    if (scanf("%s", s) != 1) return 0;\n    char stack[10005];\n    int top = -1;\n    for (int i = 0; s[i]; i++) {\n        char c = s[i];\n        if (c == \'(\' || c == \'{\' || c == \'[\') stack[++top] = c;\n        else {\n            if (top == -1) { printf("false\\n"); return 0; }\n            char prev = stack[top--];\n            if (c == \')\' && prev != \'(\') { printf("false\\n"); return 0; }\n            if (c == \'}\' && prev != \'{\') { printf("false\\n"); return 0; }\n            if (c == \']\' && prev != \'[\') { printf("false\\n"); return 0; }\n        }\n    }\n    printf("%s\\n", top == -1 ? "true" : "false");\n    return 0;\n}',
          cpp: '#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    stack<char> st;\n    for (char c : s) {\n        if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n        else {\n            if (st.empty()) { cout << "false" << endl; return 0; }\n            char top = st.top(); st.pop();\n            if (c == \')\' && top != \'(\') { cout << "false" << endl; return 0; }\n            if (c == \'}\' && top != \'{\') { cout << "false" << endl; return 0; }\n            if (c == \']\' && top != \'[\') { cout << "false" << endl; return 0; }\n        }\n    }\n    cout << (st.empty() ? "true" : "false") << endl;\n    return 0;\n}',
          javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nconst stack = [];\nconst pairs = { ")": "(", "}": "{", "]": "[" };\nlet valid = true;\nfor (const c of s) {\n  if (["(", "{", "["].includes(c)) stack.push(c);\n  else if (pairs[c]) {\n    if (stack.pop() !== pairs[c]) { valid = false; break; }\n  }\n}\nconsole.log(valid && stack.length === 0 ? "true" : "false");'
        }
      },
      {
        id: 'cq_med_2',
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating',
        difficulty: 'Medium',
        category: 'Sliding Window',
        xpReward: 250,
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        inputFormat: 'A string s.',
        outputFormat: 'Length of the longest non-repeating substring.',
        constraints: '0 <= s.length <= 10^4',
        sampleCases: [
          { input: 'abcabcbb', expectedOutput: '3' },
          { input: 'bbbbb', expectedOutput: '1' }
        ],
        hiddenTestCases: [
          { input: 'pwwkew', expectedOutput: '3' },
          { input: 'bvcits', expectedOutput: '6' }
        ],
        starterCode: {
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) { System.out.println(0); return; }\n        String s = sc.nextLine().trim();\n        int maxLen = 0, left = 0;\n        Map<Character, Integer> map = new HashMap<>();\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (map.containsKey(c)) left = Math.max(left, map.get(c) + 1);\n            map.put(c, right);\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        System.out.println(maxLen);\n    }\n}',
          python: 's = input().strip()\nseen = {}\nmax_len = 0\nleft = 0\nfor right, char in enumerate(s):\n    if char in seen and seen[char] >= left:\n        left = seen[char] + 1\n    seen[char] = right\n    max_len = max(max_len, right - left + 1)\nprint(max_len)',
          c: '#include <stdio.h>\n#include <string.h>\n#define MAX(a,b) ((a) > (b) ? (a) : (b))\n\nint main() {\n    char s[10005];\n    if (scanf("%s", s) != 1) { printf("0\\n"); return 0; }\n    int last[256];\n    memset(last, -1, sizeof(last));\n    int maxLen = 0, left = 0;\n    for (int right = 0; s[right]; right++) {\n        unsigned char c = s[right];\n        if (last[c] >= left) left = last[c] + 1;\n        last[c] = right;\n        maxLen = MAX(maxLen, right - left + 1);\n    }\n    printf("%d\\n", maxLen);\n    return 0;\n}',
          cpp: '#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) { cout << 0 << endl; return 0; }\n    vector<int> last(256, -1);\n    int maxLen = 0, left = 0;\n    for (int right = 0; right < s.length(); right++) {\n        unsigned char c = s[right];\n        if (last[c] >= left) left = last[c] + 1;\n        last[c] = right;\n        maxLen = max(maxLen, right - left + 1);\n    }\n    cout << maxLen << endl;\n    return 0;\n}',
          javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nconst map = new Map();\nlet maxLen = 0, left = 0;\nfor (let right = 0; right < s.length; right++) {\n  const c = s[right];\n  if (map.has(c) && map.get(c) >= left) left = map.get(c) + 1;\n  map.set(c, right);\n  maxLen = Math.max(maxLen, right - left + 1);\n}\nconsole.log(maxLen);'
        }
      },

      // -------------------- HARD PROBLEMS --------------------
      {
        id: 'cq_hard_1',
        title: '0/1 Knapsack Dynamic Programming',
        slug: 'knapsack-dynamic-programming',
        difficulty: 'Hard',
        category: 'Dynamic Programming',
        xpReward: 400,
        description: 'Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value in the knapsack.',
        inputFormat: 'Line 1: Two integers N (number of items) and W (knapsack capacity).\nLine 2: N space-separated integers representing item values.\nLine 3: N space-separated integers representing item weights.',
        outputFormat: 'A single integer representing the maximum possible value.',
        constraints: '1 <= N <= 100\n1 <= W <= 1000',
        sampleCases: [
          { input: '3 4\n1 2 3\n4 5 1', expectedOutput: '3' },
          { input: '3 50\n60 100 120\n10 20 30', expectedOutput: '220' }
        ],
        hiddenTestCases: [
          { input: '4 8\n10 40 30 50\n5 4 6 3', expectedOutput: '90' },
          { input: '2 10\n100 200\n10 20', expectedOutput: '100' }
        ],
        starterCode: {
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int w = sc.nextInt();\n        int[] val = new int[n];\n        int[] wt = new int[n];\n        for (int i = 0; i < n; i++) val[i] = sc.nextInt();\n        for (int i = 0; i < n; i++) wt[i] = sc.nextInt();\n        \n        int[] dp = new int[w + 1];\n        for (int i = 0; i < n; i++) {\n            for (int cap = w; cap >= wt[i]; cap--) {\n                dp[cap] = Math.max(dp[cap], dp[cap - wt[i]] + val[i]);\n            }\n        }\n        System.out.println(dp[w]);\n    }\n}',
          python: 'n, w = map(int, input().split())\nval = list(map(int, input().split()))\nwt = list(map(int, input().split()))\ndp = [0] * (w + 1)\nfor i in range(n):\n    for cap in range(w, wt[i] - 1, -1):\n        dp[cap] = max(dp[cap], dp[cap - wt[i]] + val[i])\nprint(dp[w])',
          c: '#include <stdio.h>\n#define MAX(a,b) ((a) > (b) ? (a) : (b))\n\nint main() {\n    int n, w;\n    if (scanf("%d %d", &n, &w) != 2) return 0;\n    int val[105], wt[105];\n    for (int i = 0; i < n; i++) scanf("%d", &val[i]);\n    for (int i = 0; i < n; i++) scanf("%d", &wt[i]);\n    int dp[1005] = {0};\n    for (int i = 0; i < n; i++) {\n        for (int cap = w; cap >= wt[i]; cap--) {\n            dp[cap] = MAX(dp[cap], dp[cap - wt[i]] + val[i]);\n        }\n    }\n    printf("%d\\n", dp[w]);\n    return 0;\n}',
          cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, w;\n    if (!(cin >> n >> w)) return 0;\n    vector<int> val(n), wt(n);\n    for (int i = 0; i < n; i++) cin >> val[i];\n    for (int i = 0; i < n; i++) cin >> wt[i];\n    vector<int> dp(w + 1, 0);\n    for (int i = 0; i < n; i++) {\n        for (int cap = w; cap >= wt[i]; cap--) {\n            dp[cap] = max(dp[cap], dp[cap - wt[i]] + val[i]);\n        }\n    }\n    cout << dp[w] << endl;\n    return 0;\n}',
          javascript: 'const fs = require("fs");\nconst lines = fs.readFileSync(0, "utf-8").trim().split("\\n");\nconst [n, w] = lines[0].trim().split(/\\s+/).map(Number);\nconst val = lines[1].trim().split(/\\s+/).map(Number);\nconst wt = lines[2].trim().split(/\\s+/).map(Number);\nconst dp = new Array(w + 1).fill(0);\nfor (let i = 0; i < n; i++) {\n  for (let cap = w; cap >= wt[i]; cap--) {\n    dp[cap] = Math.max(dp[cap], dp[cap - wt[i]] + val[i]);\n  }\n}\nconsole.log(dp[w]);'
        }
      }
    ],

    codingProgress: {
      usr_ratnaraju: {
        totalXp: 1240,
        streakDays: 7,
        accuracy: 91.5,
        problemsSolved: 42,
        solvedQuestionIds: ['cq_easy_1', 'cq_easy_2', 'cq_med_1'],
        unlockedBadges: ['badge_first_code', 'badge_7_streak', 'badge_speed_coder', 'badge_algorithm_master']
      },
      usr_meenakshi: {
        totalXp: 1980,
        streakDays: 12,
        accuracy: 95.0,
        problemsSolved: 58,
        solvedQuestionIds: ['cq_easy_1', 'cq_easy_2', 'cq_easy_3', 'cq_med_1', 'cq_med_2', 'cq_hard_1'],
        unlockedBadges: ['badge_first_code', 'badge_7_streak', 'badge_speed_coder', 'badge_perfect_score', 'badge_algorithm_master']
      },
      usr_sailakshmi: {
        totalXp: 1450,
        streakDays: 8,
        accuracy: 89.2,
        problemsSolved: 46,
        solvedQuestionIds: ['cq_easy_1', 'cq_easy_2', 'cq_med_1'],
        unlockedBadges: ['badge_first_code', 'badge_7_streak', 'badge_speed_coder']
      },
      usr_teja: {
        totalXp: 280,
        streakDays: 2,
        accuracy: 75.0,
        problemsSolved: 8,
        solvedQuestionIds: ['cq_easy_1'],
        unlockedBadges: ['badge_first_code']
      },
      usr_ananya: {
        totalXp: 620,
        streakDays: 4,
        accuracy: 84.0,
        problemsSolved: 18,
        solvedQuestionIds: ['cq_easy_1', 'cq_easy_2'],
        unlockedBadges: ['badge_first_code', 'badge_speed_coder']
      }
    },

    notifications: {
      usr_ratnaraju: [
        {
          id: 'notif_1',
          category: 'college',
          categoryLabel: 'College Announcement',
          title: 'TCS Placement Drive — 7.09 LPA Package Achievers Felicitation',
          text: 'Hearty congratulations to G. Ratnaraju (ECE) & G. Meenakshi (CSE) for securing 7.09 LPA CTC in the #2026_Placements drive. Felicitation ceremony on Monday at 10:00 AM in the Main Auditorium.',
          time: '2 hours ago',
          sender: 'Principal Office & T&P Cell',
          unread: true
        },
        {
          id: 'notif_2',
          category: 'exam',
          categoryLabel: 'Exam Notification',
          title: 'Autonomous Mid-1 Examination Timetable Released',
          text: 'Mid-1 examinations for Semester V will commence from September 2, 2026. Hall tickets will be issued in the examination cell from Aug 28.',
          time: '5 hours ago',
          sender: 'Controller of Examinations (Autonomous)',
          unread: true
        },
        {
          id: 'notif_3',
          category: 'assignment',
          categoryLabel: 'Assignment Notification',
          title: 'Assignment 1 Evaluated — VLSI Design (EC501)',
          text: 'Dr. B. Lakshmi Narayana graded your Verilog HDL FSM assignment. Score: 10/10 with feedback: "Perfect Verilog FSM testbench with clean timing diagrams."',
          time: '1 day ago',
          sender: 'Dr. B. Lakshmi Narayana (HOD ECE)',
          unread: false
        },
        {
          id: 'notif_4',
          category: 'attendance',
          categoryLabel: 'Attendance Notification',
          title: 'Weekly Attendance Verification Notice',
          text: 'Your current attendance is 88.6% (Good Standing). Keep maintaining above 75% to be eligible for autonomous semester end examinations without condonation fees.',
          time: '2 days ago',
          sender: 'Academic Attendance Cell',
          unread: false
        }
      ],
      usr_meenakshi: [
        {
          id: 'notif_1',
          category: 'college',
          categoryLabel: 'College Announcement',
          title: 'TCS Placement Drive — 7.09 LPA Package Achievers Felicitation',
          text: 'Felicitation ceremony on Monday at 10:00 AM in the Auditorium.',
          time: '1 hour ago',
          sender: 'Principal Office & T&P Cell',
          unread: true
        },
        {
          id: 'notif_2',
          category: 'assignment',
          categoryLabel: 'Assignment Notification',
          title: 'Assignment 1 Evaluated — Advanced Java (CS502)',
          text: 'Grade: 10/10 — Flawless thread-safe queue implementation with excellent performance benchmarks.',
          time: '3 hours ago',
          sender: 'Dr. M. S. R. Murthy (HOD CSE)',
          unread: true
        },
        {
          id: 'notif_3',
          category: 'exam',
          categoryLabel: 'Exam Notification',
          title: 'Mid-1 Examination Hall Allotment',
          text: 'Exam Hall 301 allotted for CS502 & CS503 mid-semester examinations.',
          time: '1 day ago',
          sender: 'Autonomous Examination Cell',
          unread: false
        },
        {
          id: 'notif_4',
          category: 'attendance',
          categoryLabel: 'Attendance Notification',
          title: 'Outstanding Attendance Commendation',
          text: 'Your attendance is 91.2%, placing you in the top 5% of the Computer Science department.',
          time: '3 days ago',
          sender: 'Academic Cell',
          unread: false
        }
      ],
      usr_teja: [
        {
          id: 'notif_att_warn',
          category: 'attendance',
          categoryLabel: 'Attendance Notification',
          title: '⚠️ CRITICAL: Attendance Shortage Alert (< 75%)',
          text: 'Your overall attendance is currently 71.4%, which is below the mandatory autonomous threshold of 75%. You need to attend 14 consecutive classes to reach 75%. Please contact your faculty advisor.',
          time: '1 hour ago',
          sender: 'Academic Attendance Cell',
          unread: true
        },
        {
          id: 'notif_ex',
          category: 'exam',
          categoryLabel: 'Exam Notification',
          title: 'Autonomous Mid-1 Examination Schedule',
          text: 'Semester III Mid-1 exams begin September 4, 2026. Hall tickets subject to attendance clearance.',
          time: '4 hours ago',
          sender: 'Examination Cell',
          unread: true
        },
        {
          id: 'notif_clg',
          category: 'college',
          categoryLabel: 'College Announcement',
          title: 'Smart India Hackathon 2026 Delta Round',
          text: 'Register your innovation project teams before August 25.',
          time: '1 day ago',
          sender: 'R&D Cell',
          unread: false
        }
      ]
    },

    // ----------------- FACULTY: ASSIGNMENTS -----------------
    assignments: [
      {
        id: 'asg_1',
        title: 'Assignment 1 — Spring Boot REST Microservice',
        subjectCode: 'CS502',
        subjectName: 'CS502 — Advanced Java',
        facultyId: 'usr_msrmurthy',
        facultyName: 'Dr. M. S. R. Murthy',
        assignedClass: 'CSE-3A',
        dueDate: '2026-08-22',
        maxMarks: 10,
        description: 'Build a Spring Boot REST service exposing CRUD endpoints for a Student entity with Hibernate JPA persistence, DTO mapping and Bean Validation. Submit source with JUnit tests.',
        instructions: 'Upload PDF report and ZIP archive with unit tests',
        createdAt: '2026-08-08',
        submissions: [
          { studentId: 'usr_meenakshi', studentName: 'G. Meenakshi', rollNo: '22H41A0580', submittedAt: '2026-08-19', marks: 10, feedback: 'Excellent layered architecture and complete JUnit coverage.' },
          { studentId: 'usr_sailakshmi', studentName: 'P. Sai Lakshmi', rollNo: '22H41A0512', submittedAt: '2026-08-20', marks: 9, feedback: 'Good REST design; add validation for negative IDs.' },
          { studentId: 'usr_teja', studentName: 'K. V. Teja', rollNo: '22H41A0415', submittedAt: '2026-08-21', marks: null, feedback: '' }
        ]
      },
      {
        id: 'asg_2',
        title: 'Assignment 2 — Normalization & Query Optimisation',
        subjectCode: 'CS503',
        subjectName: 'CS503 — DBMS',
        facultyId: 'usr_msrmurthy',
        facultyName: 'Dr. M. S. R. Murthy',
        assignedClass: 'CSE-3A',
        dueDate: '2026-08-29',
        maxMarks: 10,
        description: 'Normalize the given College ERP schema up to BCNF, justify every decomposition, and rewrite three nested queries using joins with EXPLAIN plan comparison.',
        instructions: 'Submit handwritten scan (PDF) with SQL scripts',
        createdAt: '2026-08-12',
        submissions: [
          { studentId: 'usr_meenakshi', studentName: 'G. Meenakshi', rollNo: '22H41A0580', submittedAt: '2026-08-26', marks: 9.5, feedback: 'Clear BCNF proof and solid EXPLAIN analysis.' },
          { studentId: 'usr_ananya', studentName: 'M. Ananya', rollNo: '22H41A1208', submittedAt: '2026-08-27', marks: null, feedback: '' }
        ]
      },
      {
        id: 'asg_3',
        title: 'Assignment 3 — Verilog HDL FSM Design',
        subjectCode: 'EC501',
        subjectName: 'EC501 — VLSI Design',
        facultyId: 'usr_msrmurthy',
        facultyName: 'Dr. B. Lakshmi Narayana',
        assignedClass: 'ECE-3A',
        dueDate: '2026-09-05',
        maxMarks: 10,
        description: 'Design a Moore FSM based traffic light controller in Verilog HDL, verify with a self-checking testbench and attach annotated timing diagrams.',
        instructions: 'Upload .v files with waveform screenshots',
        createdAt: '2026-08-16',
        submissions: [
          { studentId: 'usr_ratnaraju', studentName: 'G. Ratnaraju', rollNo: '22H41A0482', submittedAt: '2026-09-02', marks: 10, feedback: 'Perfect Verilog FSM testbench with clean timing diagrams.' }
        ]
      }
    ],

    // ----------------- FACULTY: EXAMINATIONS -----------------
    exams: [
      {
        id: 'exam_1',
        title: 'Autonomous Mid-1 Examination — Advanced Java',
        subject: 'Advanced Java (CS502)',
        department: 'CSE — Semester V',
        date: '2026-09-02',
        time: '10:00 AM – 11:30 AM',
        room: 'Hall 301',
        syllabus: 'Unit I (Collections & Generics), Unit II (JDBC & Multithreading)',
        createdBy: 'Dr. M. S. R. Murthy'
      },
      {
        id: 'exam_2',
        title: 'Autonomous Mid-1 Examination — DBMS',
        subject: 'Database Management Systems (CS503)',
        department: 'CSE — Semester V',
        date: '2026-09-03',
        time: '10:00 AM – 11:30 AM',
        room: 'Hall 301',
        syllabus: 'Unit I (ER Modelling), Unit II (Relational Algebra & Normalization)',
        createdBy: 'Dr. M. S. R. Murthy'
      },
      {
        id: 'exam_3',
        title: 'Autonomous Mid-1 Examination — VLSI Design',
        subject: 'VLSI Design & Embedded Systems (EC501)',
        department: 'ECE — Semester V',
        date: '2026-09-04',
        time: '02:00 PM – 03:30 PM',
        room: 'Hall 208',
        syllabus: 'Unit I (MOS Fundamentals), Unit II (Verilog HDL Modelling)',
        createdBy: 'Dr. B. Lakshmi Narayana'
      },
      {
        id: 'exam_4',
        title: 'Semester End Practical — Operating Systems & Cloud Lab',
        subject: 'Operating Systems & Cloud Lab (CS505)',
        department: 'CSE — Semester V',
        date: '2026-11-18',
        time: '09:30 AM – 12:30 PM',
        room: 'Cloud Computing Lab (Block C)',
        syllabus: 'Full lab record — process scheduling, threads, Docker deployment viva',
        createdBy: 'Dr. M. S. R. Murthy'
      }
    ],

    // ----------------- FACULTY: CODING SUBMISSIONS -----------------
    submissions: [
      {
        id: 'sub_1',
        studentId: 'usr_meenakshi',
        studentName: 'G. Meenakshi',
        rollNo: '22H41A0580',
        questionId: 'cq_med_1',
        questionTitle: 'Longest Substring Without Repeating Characters',
        language: 'Java',
        status: 'Accepted',
        score: 100,
        executionTime: '38ms',
        memory: '9.1 MB',
        submittedAt: '2026-08-17 18:42',
        studentCode: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        int[] last = new int[256];\n        Arrays.fill(last, -1);\n        int best = 0, start = 0;\n        for (int i = 0; i < s.length(); i++) {\n            char c = s.charAt(i);\n            if (last[c] >= start) start = last[c] + 1;\n            last[c] = i;\n            best = Math.max(best, i - start + 1);\n        }\n        System.out.println(best);\n    }\n}'
      },
      {
        id: 'sub_2',
        studentId: 'usr_ratnaraju',
        studentName: 'G. Ratnaraju',
        rollNo: '22H41A0482',
        questionId: 'cq_easy_2',
        questionTitle: 'Reverse an Integer',
        language: 'Python',
        status: 'Accepted',
        score: 100,
        executionTime: '52ms',
        memory: '7.4 MB',
        submittedAt: '2026-08-17 20:15',
        studentCode: 'n = int(input())\nsign = -1 if n < 0 else 1\nrev = int(str(abs(n))[::-1])\nprint(sign * rev)'
      },
      {
        id: 'sub_3',
        studentId: 'usr_sailakshmi',
        studentName: 'P. Sai Lakshmi',
        rollNo: '22H41A0512',
        questionId: 'cq_easy_1',
        questionTitle: 'Two Sum',
        language: 'C++',
        status: 'Accepted',
        score: 100,
        executionTime: '21ms',
        memory: '6.8 MB',
        submittedAt: '2026-08-18 09:05',
        studentCode: '#include <iostream>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n, target;\n    cin >> n >> target;\n    unordered_map<int,int> seen;\n    for (int i = 0; i < n; i++) {\n        int x; cin >> x;\n        if (seen.count(target - x)) { cout << seen[target-x] << " " << i; return 0; }\n        seen[x] = i;\n    }\n    return 0;\n}'
      },
      {
        id: 'sub_4',
        studentId: 'usr_teja',
        studentName: 'K. V. Teja',
        rollNo: '22H41A0415',
        questionId: 'cq_med_2',
        questionTitle: '0/1 Knapsack Problem',
        language: 'Java',
        status: 'Wrong Answer',
        score: 60,
        executionTime: '74ms',
        memory: '11.6 MB',
        submittedAt: '2026-08-18 11:30',
        studentCode: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // greedy attempt — fails on fractional-value cases\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), w = sc.nextInt();\n        System.out.println(0);\n    }\n}'
      },
      {
        id: 'sub_5',
        studentId: 'usr_ananya',
        studentName: 'M. Ananya',
        rollNo: '22H41A1208',
        questionId: 'cq_easy_3',
        questionTitle: 'Valid Palindrome',
        language: 'JavaScript',
        status: 'Accepted',
        score: 100,
        executionTime: '45ms',
        memory: '8.2 MB',
        submittedAt: '2026-08-18 13:12',
        studentCode: 'const s = require("fs").readFileSync(0, "utf-8").trim().toLowerCase().replace(/[^a-z0-9]/g, "");\nconsole.log(s === [...s].reverse().join("") ? "true" : "false");'
      }
    ],

    // ----------------- FACULTY: ANNOUNCEMENTS -----------------
    announcements: [
      {
        id: 'anc_1',
        title: 'Extra Lab Session — Spring Boot Deployment',
        message: 'An additional hands-on lab on containerised Spring Boot deployment will be conducted on Saturday, 10:00 AM in the Cloud Computing Lab (Block C). Attendance is mandatory for CSE-3A.',
        target: 'Class CSE-3A',
        department: 'Computer Science & Engineering (CSE)',
        subject: 'Advanced Java (CS502)',
        author: 'Dr. M. S. R. Murthy',
        date: '2026-08-16'
      },
      {
        id: 'anc_2',
        title: 'Mid-1 Syllabus Coverage Confirmed',
        message: 'Mid-1 examinations will cover Units I and II only. Revision classes are scheduled during the last hour from August 26 to August 30.',
        target: 'III Year Students',
        department: 'Computer Science & Engineering (CSE)',
        subject: 'Advanced Java (CS502)',
        author: 'Dr. M. S. R. Murthy',
        date: '2026-08-14'
      },
      {
        id: 'anc_3',
        title: 'CodeQuest Arena Weekly Contest',
        message: 'Weekly coding contest goes live every Friday 6:00 PM in the CodeQuest Arena. Top three performers earn bonus internal assessment credit.',
        target: 'All Students',
        department: 'Computer Science & Engineering (CSE)',
        subject: 'CodeQuest Arena',
        author: 'Dr. M. S. R. Murthy',
        date: '2026-08-10'
      }
    ],

    // ----------------- FACULTY: NOTIFICATIONS -----------------
    facultyNotifications: [
      {
        id: 'fnotif_1',
        category: 'assignment',
        title: 'New Submission — Assignment 2 (CS503 DBMS)',
        text: 'M. Ananya (22H41A1208) submitted "Normalization & Query Optimisation". Pending evaluation.',
        time: '35 minutes ago',
        sender: 'ERP Assignment Module',
        unread: true
      },
      {
        id: 'fnotif_2',
        category: 'attendance',
        title: 'Attendance Shortage Alert — CSE-3A',
        text: 'K. V. Teja (22H41A0415) has dropped to 68.4% attendance. Condonation notice must be issued before Mid-1 hall tickets.',
        time: '3 hours ago',
        sender: 'Attendance Monitoring Cell',
        unread: true
      },
      {
        id: 'fnotif_3',
        category: 'exam',
        title: 'Invigilation Duty Allotted — Mid-1',
        text: 'You are allotted Hall 301 invigilation for CS502 on September 2, 2026 (10:00 AM session). Report by 9:30 AM.',
        time: '1 day ago',
        sender: 'Controller of Examinations (Autonomous)',
        unread: true
      },
      {
        id: 'fnotif_4',
        category: 'coding',
        title: 'CodeQuest Activity Summary',
        text: '5 new code submissions were evaluated by the sandbox in the last 24 hours — 4 Accepted, 1 Wrong Answer.',
        time: '1 day ago',
        sender: 'CodeQuest Arena',
        unread: false
      },
      {
        id: 'fnotif_5',
        category: 'college',
        title: 'Faculty Council Meeting — NAAC Documentation',
        text: 'Department heads and senior faculty are requested to attend the NAAC criteria-III documentation review on Thursday, 3:00 PM in the Board Room.',
        time: '2 days ago',
        sender: 'Principal Office',
        unread: false
      }
    ]
  };

  class BVCITSDatabase {
    constructor() {
      this.data = this.loadDatabase();
    }

    loadDatabase() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migration: older saved databases were created before the faculty
          // modules existed, so top-level collections such as assignments,
          // exams, submissions, announcements and facultyNotifications were
          // missing entirely — which made those views render empty.
          let patched = false;
          Object.keys(defaultDatabase).forEach(key => {
            if (parsed[key] === undefined || parsed[key] === null) {
              parsed[key] = defaultDatabase[key];
              patched = true;
            }
          });
          this.data = parsed;
          if (patched) this.saveDatabase(parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
      this.saveDatabase(defaultDatabase);
      return defaultDatabase;
    }


    saveDatabase(newData) {
      if (newData) this.data = newData;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Error writing to localStorage:', e);
      }
    }

    // ----------------- USER METHODS -----------------
    getUsers() {
      return this.data.users || [];
    }

    getUserById(id) {
      return (this.data.users || []).find(u => u.id === id) || null;
    }

    findUserByCredential(identifier, password) {
      const clean = (identifier || '').trim().toLowerCase();
      return (this.data.users || []).find(u =>
        (u.username.toLowerCase() === clean ||
         u.email.toLowerCase() === clean ||
         (u.rollNo && u.rollNo.toLowerCase() === clean) ||
         (u.employeeId && u.employeeId.toLowerCase() === clean)) &&
        u.password === password
      ) || null;
    }

    // ----------------- ATTENDANCE METHODS -----------------
    getAttendanceForUser(userId) {
      return this.data.attendance[userId] || {
        overall: 85.0,
        totalClasses: 200,
        attendedClasses: 170,
        missedClasses: 30,
        subjects: []
      };
    }

    // ----------------- MARKS & CGPA METHODS -----------------
    getMarksForUser(userId) {
      return this.data.marks[userId] || {
        cgpa: 8.50,
        totalCredits: 116,
        maxCredits: 160,
        activeBacklogs: 0,
        classification: 'First Class with Distinction',
        semesters: [],
        currentSemesterSubjects: []
      };
    }

    // ----------------- TIMETABLE METHODS -----------------
    getTimetableForUser(userId, dayName) {
      const user = this.getUserById(userId);
      let key = 'ECE-III-A';
      if (user && user.deptCode === 'CSE') key = 'CSE-III-A';
      else if (user && user.deptCode === 'ECE') key = 'ECE-III-A';

      const tt = this.data.timetables[key] || this.data.timetables['ECE-III-A'];
      if (!dayName || dayName === 'all') {
        return tt;
      }
      return {
        ...tt,
        schedule: {
          [dayName]: tt.schedule[dayName] || []
        }
      };
    }

    // ----------------- CODING PRACTICE (CODEQUEST) METHODS -----------------
    getCodingQuestions(difficulty) {
      const all = this.data.codingQuestions || [];
      if (!difficulty || difficulty.toLowerCase() === 'all') {
        return all;
      }
      return all.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    getCodingQuestionById(id) {
      return (this.data.codingQuestions || []).find(q => q.id === id || q.slug === id) || null;
    }

    getCodingProgress(userId) {
      return this.data.codingProgress[userId] || {
        totalXp: 0,
        streakDays: 1,
        accuracy: 100,
        problemsSolved: 0,
        solvedQuestionIds: [],
        unlockedBadges: ['badge_first_code']
      };
    }

    recordSuccessfulSubmission(userId, questionId, language, code, runtime, memory) {
      if (!this.data.codingProgress[userId]) {
        this.data.codingProgress[userId] = {
          totalXp: 0,
          streakDays: 1,
          accuracy: 100,
          problemsSolved: 0,
          solvedQuestionIds: [],
          unlockedBadges: ['badge_first_code']
        };
      }

      const prog = this.data.codingProgress[userId];
      const question = this.getCodingQuestionById(questionId);
      const xp = question ? question.xpReward : 100;

      prog.totalXp += xp;
      if (!prog.solvedQuestionIds.includes(questionId)) {
        prog.solvedQuestionIds.push(questionId);
        prog.problemsSolved += 1;
      }

      this.saveDatabase();
      return { progress: prog, xpGained: xp };
    }

    getLeaderboard() {
      const students = (this.data.users || []).filter(u => u.role === 'student');
      return students.map(st => {
        const prog = this.getCodingProgress(st.id);
        return {
          id: st.id,
          name: st.fullName,
          rollNo: st.rollNo,
          department: st.deptCode || st.department,
          avatar: st.avatar,
          xp: prog.totalXp,
          streak: prog.streakDays,
          accuracy: prog.accuracy,
          problemsSolved: prog.problemsSolved
        };
      }).sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    // ----------------- NOTIFICATIONS METHODS -----------------
    getNotifications(userId, category) {
      const notifs = this.data.notifications[userId] || this.data.notifications['usr_ratnaraju'] || [];
      if (!category || category === 'all') {
        return notifs;
      }
      return notifs.filter(n => n.category === category);
    }

    markNotificationRead(userId, notifId) {
      const notifs = this.data.notifications[userId];
      if (notifs) {
        const item = notifs.find(n => n.id === notifId);
        if (item) item.unread = false;
        this.saveDatabase();
      }
    }

    getNotificationsForUser(userId) {
      const own = this.data.notifications && this.data.notifications[userId];
      if (own && own.length) return own;
      return this.data.facultyNotifications || [];
    }

    // ----------------- ASSIGNMENT METHODS -----------------
    getAssignments(subjectCode) {
      const all = this.data.assignments || [];
      if (!subjectCode || subjectCode === 'all') return all;
      return all.filter(a => a.subjectCode === subjectCode);
    }

    addAssignment(asg) {
      if (!Array.isArray(this.data.assignments)) this.data.assignments = [];
      const record = {
        id: 'asg_' + Date.now(),
        createdAt: new Date().toISOString().slice(0, 10),
        submissions: [],
        assignedClass: 'CSE-3A',
        description: '',
        instructions: '',
        maxMarks: 10,
        ...asg
      };
      this.data.assignments.unshift(record);
      this.saveDatabase();
      return record;
    }

    deleteAssignment(asgId) {
      this.data.assignments = (this.data.assignments || []).filter(a => a.id !== asgId);
      this.saveDatabase();
    }

    gradeAssignmentSubmission(asgId, studentId, marks, feedback) {
      const asg = (this.data.assignments || []).find(a => a.id === asgId);
      if (!asg) return null;
      const sub = (asg.submissions || []).find(s => s.studentId === studentId);
      if (!sub) return null;
      sub.marks = marks;
      sub.feedback = feedback;
      sub.gradedAt = new Date().toISOString().slice(0, 10);
      this.saveDatabase();
      return sub;
    }

    // ----------------- EXAM METHODS -----------------
    getExams() {
      return this.data.exams || [];
    }

    addExam(exam) {
      if (!Array.isArray(this.data.exams)) this.data.exams = [];
      const record = { id: 'exam_' + Date.now(), ...exam };
      this.data.exams.unshift(record);
      this.saveDatabase();
      return record;
    }

    deleteExam(examId) {
      this.data.exams = (this.data.exams || []).filter(e => e.id !== examId);
      this.saveDatabase();
    }

    // ----------------- CODING SUBMISSION METHODS -----------------
    getSubmissions(studentId) {
      const all = this.data.submissions || [];
      if (!studentId) return all;
      return all.filter(s => s.studentId === studentId);
    }

    addSubmission(sub) {
      if (!Array.isArray(this.data.submissions)) this.data.submissions = [];
      const record = { id: 'sub_' + Date.now(), status: 'Accepted', score: 100, ...sub };
      this.data.submissions.unshift(record);
      this.saveDatabase();
      return record;
    }

    // ----------------- ANNOUNCEMENT METHODS -----------------
    getAnnouncements() {
      return this.data.announcements || [];
    }

    broadcastAnnouncement(anc) {
      if (!Array.isArray(this.data.announcements)) this.data.announcements = [];
      const record = {
        id: 'anc_' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        ...anc
      };
      this.data.announcements.unshift(record);

      // Push the notice into every student's notification feed
      const notifCard = {
        id: 'notif_' + Date.now(),
        category: 'college',
        categoryLabel: 'College Announcement',
        title: record.title,
        text: record.message,
        time: 'Just now',
        sender: record.author || 'Faculty',
        unread: true
      };
      if (!this.data.notifications) this.data.notifications = {};
      (this.data.users || []).filter(u => u.role === 'student').forEach(st => {
        if (!Array.isArray(this.data.notifications[st.id])) this.data.notifications[st.id] = [];
        this.data.notifications[st.id].unshift({ ...notifCard, id: notifCard.id + '_' + st.id });
      });

      this.saveDatabase();
      return record;
    }

    // ----------------- CODING QUESTION MANAGEMENT -----------------
    addCodingQuestion(question) {
      if (!Array.isArray(this.data.codingQuestions)) this.data.codingQuestions = [];
      const record = { id: 'cq_' + Date.now(), ...question };
      this.data.codingQuestions.push(record);
      this.saveDatabase();
      return record;
    }

    deleteCodingQuestion(qId) {
      this.data.codingQuestions = (this.data.codingQuestions || []).filter(q => q.id !== qId);
      this.saveDatabase();
    }

    // ----------------- FACULTY WRITE-BACK HELPERS -----------------
    updateStudentAttendance(studentId, subjectCode, isPresent) {
      const att = this.data.attendance && this.data.attendance[studentId];
      if (!att) return null;
      const subject = (att.subjects || []).find(s => s.code === subjectCode);
      if (subject) {
        subject.total = (subject.total || 0) + 1;
        if (isPresent) subject.attended = (subject.attended || 0) + 1;
        subject.percentage = parseFloat((((subject.attended || 0) / subject.total) * 100).toFixed(1));
      }
      att.totalClasses = (att.totalClasses || 0) + 1;
      if (isPresent) att.attendedClasses = (att.attendedClasses || 0) + 1;
      att.missedClasses = att.totalClasses - att.attendedClasses;
      att.overall = parseFloat(((att.attendedClasses / att.totalClasses) * 100).toFixed(1));
      this.saveDatabase();
      return att;
    }

    saveSubjectMarks(studentId, subjectCode, values) {
      const marks = this.data.marks && this.data.marks[studentId];
      if (!marks) return null;
      const subject = (marks.currentSemesterSubjects || []).find(s => s.code === subjectCode);
      if (!subject) return null;
      if (values.mid1 !== undefined) subject.mid1 = values.mid1;
      if (values.mid2 !== undefined) subject.mid2 = values.mid2;
      if (values.assignment !== undefined) subject.assignmentMarks = values.assignment;
      if (values.lab !== undefined) subject.labMarks = values.lab;
      if (values.endSem !== undefined) subject.endSem = values.endSem;
      subject.internalMarks = Math.round(((subject.mid1 || 0) + (subject.mid2 || 0)) / 2);
      subject.total = (subject.internalMarks || 0) + (subject.assignmentMarks || 0) + (subject.endSem || 0);
      this.saveDatabase();
      return subject;
    }

    updateFacultyProfile(userId, updates) {
      const user = this.getUserById(userId);
      if (!user) return null;
      Object.assign(user, updates);
      this.saveDatabase();
      return user;
    }
  }

  // Attach singleton to window
  window.BVCITS_DB = new BVCITSDatabase();

})(window);
