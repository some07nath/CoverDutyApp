// Cover Duty Assignment Algorithm
import { TEACHERS, ELIGIBLE_TEACHERS, PERIODS, getTeacherDisplayName } from '../data/teachers';

/**
 * Get the classes an absent teacher has on a specific day
 * Returns array of { period: 0-7, periodLabel: '1st'-'8th', classInfo: 'Class 10', rawEntry: '10 Physics' }
 */
export function getAbsentTeacherClasses(teacherName, dayKey) {
  const teacher = TEACHERS.find(
    (t) =>
      t.name.toLowerCase() === teacherName.toLowerCase() ||
      (t.shortName && t.shortName.toLowerCase() === teacherName.toLowerCase())
  );
  if (!teacher) return [];

  const schedule = teacher.timetable[dayKey];
  if (!schedule) return [];

  const classes = [];
  for (let i = 0; i < schedule.length; i++) {
    const entry = schedule[i];
    if (entry && entry !== '' && entry !== 'ASSEMBLY') {
      classes.push({
        period: i,
        periodLabel: PERIODS[i],
        rawEntry: entry,
        classInfo: parseClassFromEntry(entry),
        absentTeacher: teacher.name,
      });
    }
  }
  return classes;
}

/**
 * Parse class number/name from a timetable entry
 * e.g., '12 Chem' -> { classNum: 12, label: 'Class 12', isNios: false }
 *        'NIOS 10 HS' -> { classNum: 10, label: 'NIOS 10', isNios: true }
 *        '8 Math' -> { classNum: 8, label: 'Class 8', isNios: false }
 */
export function parseClassFromEntry(entry) {
  if (!entry) return null;

  const upper = entry.toUpperCase().trim();

  // NIOS classes
  if (upper.includes('NIOS 12') || upper.includes('NIOS12')) {
    return { classNum: 12, label: 'NIOS 12', isNios: true };
  }
  if (upper.includes('NIOS 10') || upper.includes('NIOS10')) {
    return { classNum: 10, label: 'NIOS 10', isNios: true };
  }
  if (upper.includes('DEO NIOS')) {
    return { classNum: 10, label: 'NIOS 10', isNios: true };
  }

  // Regular classes - try to extract number
  // Patterns: "12 Chem", "12 - HIS", "Sc 6", "Math 6", "Class 12"
  const patterns = [
    /^(\d+)\s*[-–]?\s*/,       // "12 Chem", "12 - HIS", "11 Eco"
    /\s(\d+)$/,                // "Sc 6", "Math 6"
    /class\s*(\d+)/i,          // "Class 12"
    /(\d+)\s*(Math|Sc|Eng|SST|His|Geog|Phy|Chem|Bio|Eco|Pol|Acc|Bst|Ent|Art|KB|KV|FL|IT|PE|Lib|Comm|Hindi|Ben)/i,
    /(Math|Sc|Eng|SST|His|Geog|Phy|Chem|Bio|Eco|Pol|Acc|Bst|Ent|Art|KB|KV|FL|IT|PE|Lib|Comm|Hindi|Ben)\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = entry.match(pattern);
    if (match) {
      const num = parseInt(match[1]) || parseInt(match[2]);
      if (num >= 1 && num <= 12) {
        return { classNum: num, label: `Class ${num}`, isNios: false };
      }
    }
  }

  // OBE or other special
  if (upper.includes('OBE')) {
    return { classNum: 0, label: 'OBE', isNios: false };
  }
  if (upper.includes('UKG')) {
    return { classNum: 0, label: 'UKG', isNios: false };
  }
  if (upper.includes('LKG')) {
    return { classNum: 0, label: 'LKG', isNios: false };
  }

  // Try to find any number
  const numMatch = entry.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    if (num >= 1 && num <= 12) {
      return { classNum: num, label: `Class ${num}`, isNios: false };
    }
  }

  return { classNum: 0, label: entry, isNios: false };
}

/**
 * Check if a teacher can cover a specific class based on the rules:
 * - Junior teachers (teach 6,7,8) can cover 6,7,8
 * - Senior teachers (teach 9,10,11,12) can cover 9,10,11,12
 * - NIOS teachers can only cover NIOS classes
 * - Teachers who teach both ranges can cover any
 */
export function canTeacherCoverClass(teacher, classInfo) {
  if (!classInfo) return false;

  // Principal never covers (Rule 4a)
  if (teacher.category === 'principal') return false;

  // Primary teachers don't cover
  if (teacher.category === 'primary') return false;

  // Excluded teachers don't cover
  if (teacher.category === 'excluded') return false;

  // NIOS class needs NIOS-eligible teacher (Rule 4b)
  if (classInfo.isNios) {
    if (teacher.niosClasses && teacher.niosClasses.length > 0) return true;
    if (teacher.category === 'nios') return true;
    return false;
  }

  // For regular classes (Rule 4b)
  const classNum = classInfo.classNum;
  if (classNum === 0) return true; // Special classes like OBE, UKG

  if (classNum >= 6 && classNum <= 8) {
    // Junior range - junior or both teachers can cover
    return ['junior', 'both'].includes(teacher.category);
  }

  if (classNum >= 9 && classNum <= 12) {
    // Senior range - senior or both teachers can cover
    return ['senior', 'both'].includes(teacher.category);
  }

  // Classes 1-5 - primary only, skip
  return false;
}

/**
 * Get count of classes a teacher has on a specific day
 */
export function getTeacherDayClassCount(teacher, dayKey) {
  const schedule = teacher.timetable[dayKey];
  if (!schedule) return 0;
  return schedule.filter((entry) => entry && entry !== '' && entry !== 'ASSEMBLY').length;
}

/**
 * Find free teachers for a specific period on a specific day
 * Returns array sorted by: eligible to cover > more classes today (Rule 4d) > alphabetical
 */
export function findFreeTeachers(dayKey, periodIndex, classInfo, absentTeacherNames, presentTeacherNames) {
  const freeTeachers = [];

  for (const teacher of ELIGIBLE_TEACHERS) {
    // Skip absent teachers
    if (absentTeacherNames.map((n) => n.toLowerCase()).includes(teacher.name.toLowerCase())) {
      continue;
    }

    // Skip if not in present list (if present list is provided)
    if (presentTeacherNames && presentTeacherNames.length > 0) {
      if (!presentTeacherNames.map((n) => n.toLowerCase()).includes(teacher.name.toLowerCase())) {
        continue;
      }
    }

    // Check if teacher is free at this period
    const schedule = teacher.timetable[dayKey];
    if (!schedule) continue;

    const entry = schedule[periodIndex];
    if (entry && entry !== '' && entry !== 'ASSEMBLY') {
      continue; // Teacher is busy
    }

    // Check if teacher can cover this class (Rule 4b)
    const canCover = canTeacherCoverClass(teacher, classInfo);

    const dayClassCount = getTeacherDayClassCount(teacher, dayKey);

    freeTeachers.push({
      teacher,
      canCover,
      dayClassCount,
      name: teacher.name,
      shortName: teacher.shortName || teacher.name,
    });
  }

  // Sort: eligible teachers first, then by class count (more classes = busier = priority per Rule 4d), then alphabetical
  freeTeachers.sort((a, b) => {
    if (a.canCover && !b.canCover) return -1;
    if (!a.canCover && b.canCover) return 1;
    if (b.dayClassCount !== a.dayClassCount) return b.dayClassCount - a.dayClassCount;
    return a.name.localeCompare(b.name);
  });

  return freeTeachers;
}

/**
 * Find if other present teachers are also teaching the same class at the same period
 * (Rule 4e: for combining sections of classes)
 */
export function findTeachersWithSameClass(dayKey, periodIndex, classInfo, absentTeacherNames) {
  if (!classInfo || classInfo.classNum === 0) return [];

  const teachersWithSameClass = [];

  for (const teacher of TEACHERS) {
    // Skip absent teachers
    if (absentTeacherNames.map((n) => n.toLowerCase()).includes(teacher.name.toLowerCase())) {
      continue;
    }

    // Skip principal
    if (teacher.category === 'principal') continue;

    // Check if this teacher has the same class at the same period
    const schedule = teacher.timetable[dayKey];
    if (!schedule) continue;

    const entry = schedule[periodIndex];
    if (!entry || entry === '' || entry === 'ASSEMBLY') continue;

    const theirClassInfo = parseClassFromEntry(entry);
    if (!theirClassInfo) continue;

    if (theirClassInfo.classNum === classInfo.classNum && theirClassInfo.isNios === classInfo.isNios) {
      teachersWithSameClass.push({
        teacherName: teacher.name,
        shortName: teacher.shortName || teacher.name,
        classInfo: theirClassInfo,
        rawEntry: entry,
      });
    }
  }

  return teachersWithSameClass;
}

/**
 * Generate the final formatted output
 * Headings: Absent Teachers (e.g. Sekhar, Durjoy, Somenath...)
 * Lines: {period} - {class} - {coverTeacher} (combined)
 *
 * assignmentsByAbsentTeacher: { [absentTeacherName]: [{ periodLabel, classLabel, coverTeacher, combined }] }
 */
export function formatCoverOutput(date, assignmentsByAbsentTeacher) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let output = `Cover for ${day}.${month}.${year}\n`;

  for (const [absentTeacher, duties] of Object.entries(assignmentsByAbsentTeacher)) {
    if (!duties || duties.length === 0) continue;
    const absentDisplay = getTeacherDisplayName(absentTeacher);
    output += `\n${absentDisplay}\n`;
    for (const duty of duties) {
      const coverDisplay = getTeacherDisplayName(duty.coverTeacher);
      let line = `${duty.periodLabel} - ${duty.classLabel} - ${coverDisplay}`;
      if (duty.combined) {
        line += ' (combined)';
      }
      output += `${line}\n`;
    }
  }

  return output.trim();
}
