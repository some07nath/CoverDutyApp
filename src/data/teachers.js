// Teacher timetable data extracted from Google Sheet "NEW SESSION ROUTINE 26 - 27"
// Each teacher has: name, shortName, classes they teach, category (junior/senior/nios), and weekly timetable
// Timetable: { MON: [period1, period2, ...period8], TUE: [...], ... }
// Empty string = free period, "ASSEMBLY" = assembly (period 0 on Monday)

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
export const PERIODS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
export const PERIOD_TIMES = [
  '8:20 - 9:00',
  '9:00 - 9:40',
  '9:40 - 10:30',
  '10:30 - 11:10',
  '11:10 - 11:50',
  '11:50 - 12:30',
  '12:30 - 1:10',
  '1:10 - 2:05',
];

// Category determines which classes a teacher can cover:
// 'junior' = classes 6,7,8 -> can cover 6,7,8
// 'senior' = classes 9,10,11,12 -> can cover 9,10,11,12
// 'both' = teaches both ranges -> can cover any (6-12)
// 'nios' = NIOS classes -> can only cover NIOS
// 'primary' = classes 1-5, UKG, LKG -> excluded from cover duty
// 'principal' = principal -> excluded from cover duty

export const TEACHERS = [
  {
    name: 'Samrin Mumtaz',
    shortName: 'Samrin Mumtaz',
    designation: 'Principal',
    category: 'principal',
    classesRange: [12],
    subjects: ['History'],
    timetable: {
      MON: ['', '', '12 - HIS', '', '', '', '', ''],
      TUE: ['', '', '', '', '', '', '', ''],
      WED: ['', '', '12 - HIS', '', '', '', '12 - HIS', ''],
      THU: ['', '', '', '', '', '', '', ''],
      FRI: ['', '', '', '', '', '', '', ''],
    },
  },
  {
    name: 'Swarnendu Baduri',
    shortName: 'Swarnendu',
    designation: 'Teacher',
    category: 'both',
    classesRange: [8, 9, 12],
    subjects: ['Maths', 'Chemistry'],
    timetable: {
      MON: ['8 Math', '', '12 Chem', '', '9 Math', '', '', '12 Chem'],
      TUE: ['12 Chem', '', '', '', '9 Maths', '9 Chem', '', '8 Math'],
      WED: ['', '8 Math', '12 Chem', '', '9 Math', '9 Chem', '12 Chem', ''],
      THU: ['12 Chem', '9 Math', '', '', '', '8 Math', '', ''],
      FRI: ['9 Math', '', '12 Chem', '', '9 Chem', '8 Math', '', ''],
    },
  },
  {
    name: 'Somenath Mandal',
    shortName: 'Somenath',
    designation: 'Senior Coordinator / CT Class 11',
    category: 'senior',
    classesRange: [9, 10, 12],
    subjects: ['Physics', 'Maths'],
    timetable: {
      MON: ['', '12 Physics', '10 Physics', '', '', '9 Physics', '10 Math', '10 Math'],
      TUE: ['', '', '', '9', '10 Math', '10', '12', ''],
      WED: ['', '12', '', '', '', '12', '10', ''],
      THU: ['9', '', '', '', '', '', '12', '10 Math'],
      FRI: ['', '12', '', '', '12', '', '10 Math', ''],
    },
  },
  {
    name: 'Shivani Singh',
    shortName: 'Shivani',
    designation: 'Teacher',
    category: 'junior',
    classesRange: [6, 7, 8],
    subjects: ['Science', 'Maths', 'CT/AI'],
    timetable: {
      MON: ['', 'Sc 6', 'Sc 7', 'Maths 7', 'CT/AI 8', '', 'Sc 7', ''],
      TUE: ['Math 6', '', 'CT/AI 7', '', 'Maths 7', '', '', ''],
      WED: ['', 'Maths 6', 'Sc 7', 'CT/AI 6', 'Sc 6', 'Maths 7', 'Maths 6', ''],
      THU: ['', 'Maths 6', '', 'Sc 6', '', 'IT prac 7', 'Maths 7', ''],
      FRI: ['', 'Sc 6', '', 'Maths 6', 'Sc 7', '', 'Sc 7', ''],
    },
  },
  {
    name: 'Durjoy Chakrabarty',
    shortName: 'Durjoy',
    designation: 'CT Class 10',
    category: 'senior',
    classesRange: [9, 10, 11, 12],
    subjects: ['Economics', 'Entrepreneurship'],
    timetable: {
      MON: ['11 Eco', '', '9 Eco', '', '', '', '', '11 Eco'],
      TUE: ['', '', '10 Eco', '11 Eco', '12 Eco', '12 Eco', '11 Ent', ''],
      WED: ['', '', '11 Ent', '11 Eco', '12 Eco', '11 Ent', '', ''],
      THU: ['10 Eco', '11 Eco', '11 eco', '', '12 Eco', '9 Eco', '11 Ent', ''],
      FRI: ['12 Eco', '', '11 Ent', '11 Eco', '11 Eco', '', '12 Eco', ''],
    },
  },
  {
    name: 'Sonali Sen',
    shortName: 'Sonali',
    designation: 'CT Class 9',
    category: 'both',
    classesRange: [6, 7, 9, 10, 11, 12],
    subjects: ['History', 'Geography', '2nd lang', '3rd lang'],
    timetable: {
      MON: ['10 - His', 'UKG - 2nd lang', '', '9 His', '11- His', '', '', ''],
      TUE: ['10 - Geog', 'UKG - 2nd lang', '', '11- His', '11- His', '', '12 - His', ''],
      WED: ['', 'UKG - 2nd lang', '10 - His', '11- His', '', '6 - 3rd lang', '9 His', ''],
      THU: ['6 - 3rd lang', '', '', '7 - 3rd lang', '', '10 - Geog', '12 - His', '11- His'],
      FRI: ['10 - His', '12 - His', '', 'UKG - Dance', '12 - His', '11- His', '9 His', ''],
    },
  },
  {
    name: 'Aniket',
    shortName: 'Aniket',
    designation: 'CT Class 7',
    category: 'junior',
    classesRange: [6, 7],
    subjects: ['Maths', 'Science', 'IT'],
    timetable: {
      MON: ['', 'Sc 6', '', 'Maths 7', '', '', 'Sc 7', ''],
      TUE: ['Math 6', 'Sc 7 Prac', 'Sc 6 Prac', '', 'Maths 7', '', '', ''],
      WED: ['', 'Maths 6', '', 'IT Theory 7', 'Sc 6', 'Maths 7', 'Maths 6', ''],
      THU: ['', 'Maths 6', '', 'Sc 6', '', 'IT prac 7', 'Maths 7', ''],
      FRI: ['', 'Sc 6', '', 'Maths 6', 'Sc 7', '', 'Sc 7', ''],
    },
  },
  {
    name: 'Sanjana Biswas',
    shortName: 'Sanjana',
    designation: 'CT Class 6',
    category: 'junior',
    classesRange: [6, 7],
    subjects: ['English', 'SST', 'IT'],
    timetable: {
      MON: ['', '', 'Lib 6', '6 SST', '6 Eng', '7 Eng', '6 IT Theory', ''],
      TUE: ['', '', '', '', '6 SST', '7 Eng', '7 Creative Writing', ''],
      WED: ['6 Eng', '7 Eng', '6 SST', 'CT/AI 6', '7 SST', '', '', ''],
      THU: ['7 Eng', '7 SST', '6 SST', '', '7 SST', '', '', ''],
      FRI: ['', '7 SST', '6 Eng', '7 Eng', '6 IT Prac', '6 SST', '', ''],
    },
  },
  {
    name: 'Soma Mukherjee',
    shortName: 'Soma',
    designation: 'CT NIOS 10',
    category: 'both',
    classesRange: [8, 9, 11],
    niosClasses: [10, 12],
    subjects: ['Geography', 'Home Science', 'SST'],
    timetable: {
      MON: ['NIOS 10 HS', '8 SST', 'SST NIOS 10', 'NIOS 10 HS', '11 Geog', 'NIOS 12 HS', '', ''],
      TUE: ['', '', 'SST NIOS 10', '11 Geog', '11 Geog', 'NIOS 10 HS', '', ''],
      WED: ['9 - Geog', '', 'SST NIOS 10', '11 Geog', 'NIOS 10 HS', '8 SST', 'NIOS 12 HS', ''],
      THU: ['', '', 'SST NIOS 10', 'NIOS 10 HS', '', 'NIOS 12 HS', 'KB 6', '11 Geog'],
      FRI: ['', 'SST NIOS 10', '9 - Geog', 'NIOS 10 HS', '8 SST', '11 Geog', 'NIOS 10 HS', ''],
    },
  },
  {
    name: 'Susmita Dhar',
    shortName: 'Susmita',
    designation: 'Middle Coordinator',
    category: 'senior',
    classesRange: [8, 9, 10, 12],
    subjects: ['Biology', 'Science'],
    timetable: {
      MON: ['', '', '', '', '', '10', '', ''],
      TUE: ['', '', '9 Bio', '', '12', '12', '', ''],
      WED: ['10', '', '', '', '12', '', '', ''],
      THU: ['', '', '', '', '12', '', '10', ''],
      FRI: ['12', '9 Bio', '', '', '', '10', '12', ''],
    },
  },
  {
    name: 'Risha Ghosh',
    shortName: 'Risha',
    designation: 'Teacher',
    category: 'both',
    classesRange: [7, 8, 9, 10],
    subjects: ['Science', 'English', 'Chemistry', 'KB', 'KV'],
    timetable: {
      MON: ['', '', '8 Sc', '', '7 KB', '', '9 KV', '8 Sc'],
      TUE: ['8 Eng', '8 Sc', '9 KV', '', '8 Creative Writing', '', '', ''],
      WED: ['', '', '8 KB', '10 Chem', '', '', '8 Eng', ''],
      THU: ['8 Eng', '8 Sc', '10 Chem', '9 Bio', '8 Eng', '', '', ''],
      FRI: ['8 Eng', '', '8 Sc', '', '', '9 KV', '', '10 Chem'],
    },
  },
  {
    name: 'Satarupa Dutta',
    shortName: 'Satarupa',
    designation: 'CT Class 12',
    category: 'senior',
    classesRange: [6, 7, 8, 11, 12],
    subjects: ['BST', 'Accountancy', 'FL'],
    timetable: {
      MON: ['', '12 Bst', '12 Acc', '11 Acc', '11 Bst', '11 Acc', '', '12 Acc'],
      TUE: ['12 Bst', '6 FL', '11 Acc', '11 Bst', '11 Bst', '', '12 Bst', ''],
      WED: ['', '12 Bst', '12 Acc', '11 Bst', '', '12 BST', '12 Acc', '11 Acc'],
      THU: ['12 Acc', '', '7 FL', '', '', '', '12 Bst', '11 Bst'],
      FRI: ['11 Acc', '12 Bst', '12 Acc', '8 FL', '12 Acc', '11 Bst', '', '11 Acc'],
    },
  },
  {
    name: 'Balaka Roy',
    shortName: 'Balaka',
    designation: 'Hindi Teacher',
    category: 'both',
    classesRange: [5, 8, 9, 10, 12],
    subjects: ['Hindi'],
    timetable: {
      MON: ['9', '10', '', '', '5', '', '12', ''],
      TUE: ['9', '10', '', '8', '', '', '8', ''],
      WED: ['8', '9', '5', '', '', '', '', '10'],
      THU: ['', '10', '8', '12', '', '', '', '12'],
      FRI: ['', '', '10', '9', '', '12', '', ''],
    },
  },
  {
    name: 'Ayan Jana',
    shortName: 'Ayan',
    designation: 'Bengali Teacher',
    category: 'both',
    classesRange: [6, 8, 9, 10, 12],
    niosClasses: [10],
    subjects: ['Bengali'],
    timetable: {
      MON: ['9', '10', 'NIOS 10', '', '', '', '12', ''],
      TUE: ['9', '10', '', '8', '', '', '8', ''],
      WED: ['8', '9', 'NIOS 10', '', '', '', '', '10'],
      THU: ['', '10', '8', '12', '6', '', '', '12'],
      FRI: ['', 'NIOS 10', '10', '9', '', '12', '6', ''],
    },
  },
  {
    name: 'Sagnik Basu',
    shortName: 'Sagnik B',
    designation: 'Maths Teacher',
    category: 'both',
    classesRange: [3, 4, 5, 8, 10, 12],
    subjects: ['Maths'],
    timetable: {
      MON: ['3', '', '5', '12', '4', '', '', ''],
      TUE: ['3', '', '12', '12', '4', '', '', ''],
      WED: ['', '3', '4', '12', '5', '', '5', '12'],
      THU: ['', '', '5', '', '4', '3', '', ''],
      FRI: ['', '5', '3', '12', '4', '', '', '12'],
    },
  },
  {
    name: 'Sekhar Baran Karmakar',
    shortName: 'Sekhar',
    designation: 'Commercial Art Teacher',
    category: 'both',
    classesRange: [6, 7, 8, 11, 12],
    niosClasses: [10],
    subjects: ['Art', 'Painting'],
    timetable: {
      MON: ['11', '', '', '12', 'NIOS 10 PAINTING', '8', '12', '11'],
      TUE: ['NIOS 10 PAINTING', 'NIOS 10 PAINTING', '12', '', '12', '12', '6', ''],
      WED: ['', '', '', '12', '12', '', '', ''],
      THU: ['', '11', '11', '12', '12', '', 'NIOS 10 PAINTING', '12'],
      FRI: ['12', '', '7', '11', '11', '12', '12', '12'],
    },
  },
  {
    name: 'Pradipta Bandyopadhyay',
    shortName: 'Pradipta',
    designation: 'Librarian',
    category: 'both',
    classesRange: [6, 7, 8, 9, 10, 11, 12],
    niosClasses: [10],
    subjects: ['Library', '3rd Lang', 'IT'],
    timetable: {
      MON: ['', '', '6', 'Class 4 lib', '12', 'NIOS 10', '8 3rd lang', ''],
      TUE: ['', '11', '', '12', '', '', '', ''],
      WED: ['11', '', '', '9 IT', '8 3rd lang', 'OBE', 'NIOS 10', '12'],
      THU: ['', '', '', '5', '11', 'NIOS 10', '', ''],
      FRI: ['NIOS 10', 'Class 4 lib', '', '10', '', '', '', '9IT P'],
    },
  },
  {
    name: 'Susmita Bose',
    shortName: 'Susmita B',
    designation: 'CT Class 8',
    category: 'senior',
    classesRange: [6, 7, 8, 9, 10, 11, 12],
    niosClasses: [10],
    subjects: ['English', 'KB', 'Communication', 'Financial Literacy'],
    timetable: {
      MON: ['12', '', '11', '10', '', '12', '', ''],
      TUE: ['11', '12', '', '10', '', '', '9', '12'],
      WED: ['12', 'Eng NIOS 10', '', '', '11', '10', '11', '9'],
      THU: ['11', '12', '9', '', '10', '12', '', '9'],
      FRI: ['', '11', '', '', '10', 'Eng NIOS 10', '11', ''],
    },
  },
  {
    name: 'Sagnik Guha',
    shortName: 'Sagnik G',
    designation: 'NIOS Coordinator',
    category: 'senior',
    classesRange: [8, 9, 10, 11, 12],
    niosClasses: [10],
    subjects: ['Political Science', 'SST', 'Communication'],
    timetable: {
      MON: ['', '', '12', '11', '10', '11', '11 Comm', '12'],
      TUE: ['12', '9', '11', 'Nios 10 Eng', '', '8 SST', '', ''],
      WED: ['', '', '12', '', '10', '', '12', '11'],
      THU: ['12', '', '', '8 SST', '9', '', '8 SST', ''],
      FRI: ['11', '', '12', '12 Comm', '', '', '', '11'],
    },
  },
  {
    name: 'Samaresh Rana',
    shortName: 'Samaresh',
    designation: 'Computer Science Teacher',
    category: 'both',
    classesRange: [8, 9, 10, 11, 12],
    niosClasses: [10],
    subjects: ['IT', 'CS', 'DEO'],
    timetable: {
      MON: ['', 'DEO NIOS 10', '', '8', '', '', '12 S', ''],
      TUE: ['', '', '', '', '12', '12', 'DEO NIOS 10', '10'],
      WED: ['', '10', '', 'DEO NIOS 10', '12', 'DEO NIOS 10', '', '8'],
      THU: ['', 'DEO NIOS 10', '', '10/12 S', '12', '', '', '12 S'],
      FRI: ['12', '', '', '', 'DEO NIOS 10', '12 S', '12', '8'],
    },
  },
  {
    name: 'Sanjay Patra',
    shortName: 'Sanjay',
    designation: 'PE Teacher',
    category: 'both',
    classesRange: [2, 3, 4, 5, 6, 7, 8, 9, 11],
    niosClasses: [10, 12],
    subjects: ['PE'],
    timetable: {
      MON: ['', '9', 'OBE', '', '2', '6', '', ''],
      TUE: ['1', '3', '8', '6', '', '4', '', ''],
      WED: ['', '11P', '', '8', 'OBE', '5', '7', ''],
      THU: ['', '3', '', '4', 'NIOS 10', '11 P', '', ''],
      FRI: ['', '8', 'NIOS 10', '5', '2', '7', '', ''],
    },
  },
  {
    name: 'Ayas Munsi',
    shortName: 'Ayas',
    designation: 'PE Teacher',
    category: 'both',
    classesRange: [6, 7, 8, 10, 11, 12],
    niosClasses: [10],
    subjects: ['PE', 'Yoga'],
    timetable: {
      MON: ['7 T', '11 T', '', 'NIOS 12 P/12', '', '', 'NIOS 10 YOGA', ''],
      TUE: ['', '', '12 T', '7 T', 'NIOS 10 PE', '11T', '10', '11 Yoga'],
      WED: ['NIOS 10 PE', '', '9 T', '12 T', 'NIOS 10 YOGA', '', '', ''],
      THU: ['NIOS 10 YOGA', '', '12 P', '11T', '', '6 T', '', '8 T'],
      FRI: ['6 T', '10 (Indoor)', '5 Theory', '1(Hall)', '', '', '8 T', '12 T'],
    },
  },
  {
    name: 'Vikash Kumar Shaw',
    shortName: 'Vikash',
    designation: 'Hindi Teacher',
    category: 'junior',
    classesRange: [6, 7, 8, 9],
    niosClasses: [10, 12],
    subjects: ['Hindi', '3rd Lang'],
    timetable: {
      MON: ['6', '7', 'HINDI NIOS 10', '', 'NIOS 12 Hindi', '', '8 3RD LANG', '9 - 3rd Lang'],
      TUE: ['7', '', 'HINDI NIOS 10', '', '', '6', '', '9 - 3rd Lang'],
      WED: ['7', '', 'HINDI NIOS 10', '', '8 3RD LANG', '6 3RD LANG', '', ''],
      THU: ['6 3RD LANG', '', 'HINDI NIOS 10', '7 3RD LANG', '6', '', '', ''],
      FRI: ['7', 'HINDI NIOS 10', 'NIOS 12 Hindi', '', '', '', '6', ''],
    },
  },
  {
    name: 'Iti Chakrabarty',
    shortName: 'Iti',
    designation: 'Bengali Teacher',
    category: 'primary',
    classesRange: [2, 3, 4, 5, 6, 7],
    subjects: ['Bengali'],
    timetable: {
      MON: ['6', '7', '4', '3', '5', '2', '', ''],
      TUE: ['7', '', '2', '', '', '6', '5', ''],
      WED: ['7', '', '5', '3', '4', '2', '', ''],
      THU: ['', '2', '4', '3', '', '5', '', ''],
      FRI: ['7', '2', '4', '3', '', '', '5', ''],
    },
  },
  {
    name: 'Chetna Solanki',
    shortName: 'Chetna',
    designation: 'Hindi Teacher',
    category: 'primary',
    classesRange: [1, 2, 3, 4, 5],
    subjects: ['Hindi'],
    timetable: {
      MON: ['1', 'UKG', '4', '3', '', '2', '', ''],
      TUE: ['', 'UKG', '2', '', '', '', '5', ''],
      WED: ['1', 'UKG', '', '3', '4', '2', '', ''],
      THU: ['1', '2', '4', '3', '', '5', '', ''],
      FRI: ['1', '2', '4', '3', '', '', '5', ''],
    },
  },
  {
    name: 'Indrajeet',
    shortName: 'Indrajeet',
    designation: 'NIOS 12 Teacher',
    category: 'nios',
    classesRange: [],
    niosClasses: [12],
    subjects: ['NIOS 12'],
    timetable: {
      MON: ['', '', '', '', 'NIOS 12', '', '', ''],
      TUE: ['', '', 'NIOS 12', 'NIOS 12', '', '', '', ''],
      WED: ['', '', '', '', '', 'NIOS 12', '', ''],
      THU: ['', '', '', '', '', '', '', ''],
      FRI: ['', '', '', 'NIOS 12', '', '', '', ''],
    },
  },
  {
    name: 'Tamasa Das',
    shortName: 'Tamasa',
    designation: 'Special Educator',
    category: 'excluded',
    classesRange: [],
    subjects: ['Special Education'],
    timetable: {
      MON: ['', '', '', '', '', '', '', ''],
      TUE: ['', '', '', '', '', '', '', ''],
      WED: ['', '', '', '', '', '', '', ''],
      THU: ['', '', '', '', '', '', '', ''],
      FRI: ['', '', '', '', '', '', '', ''],
    },
  },
  {
    name: 'Ritu Karmakar Paul',
    shortName: 'Ritu',
    designation: 'Special Educator',
    category: 'excluded',
    classesRange: [],
    subjects: ['Special Education'],
    timetable: {
      MON: ['', '', '', '', '', '', '', ''],
      TUE: ['', '', '', '', '', '', '', ''],
      WED: ['', '', '', '', '', '', '', ''],
      THU: ['', '', '', '', '', '', '', ''],
      FRI: ['', '', '', '', '', '', '', ''],
    },
  },
  {
    name: 'Koushani Sarkar',
    shortName: 'Koushani',
    designation: 'Students Counselor',
    category: 'excluded',
    classesRange: [],
    subjects: ['Counseling'],
    timetable: {
      MON: ['', '', '', '', '', '', '', ''],
      TUE: ['', '', '', '', '', '', '', ''],
      WED: ['', '', '', '', '', '', '', ''],
      THU: ['', '', '', '', '', '', '', ''],
      FRI: ['', '', '', '', '', '', '', ''],
    },
  },
];

// Teachers eligible for cover duty (excluding principal, primary-only, excluded)
export const ELIGIBLE_TEACHERS = TEACHERS.filter(
  (t) => !['principal', 'primary', 'excluded', 'nios'].includes(t.category)
);

// Get short/display name for teacher
export function getTeacherDisplayName(fullName, teachersList = null) {
  if (!fullName) return '';
  const list = teachersList && teachersList.length > 0 ? teachersList : TEACHERS;
  const teacher = list.find(
    (t) =>
      t.name.toLowerCase() === fullName.toLowerCase() ||
      (t.shortName && t.shortName.toLowerCase() === fullName.toLowerCase())
  );
  return teacher?.shortName || fullName;
}

// Get day key from JS date (0=Sunday)
export function getDayKey(date) {
  const dayMap = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI' };
  return dayMap[date.getDay()] || null;
}
