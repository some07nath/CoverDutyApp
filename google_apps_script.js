/**
 * =======================================================================
 * GOOGLE APPS SCRIPT FOR COVER DUTY APP - LIVE ROUTINE SYNC
 * =======================================================================
 *
 * HOW TO SET THIS UP (Takes ~1 minute):
 * 1. Open your Google Spreadsheet:
 *    https://docs.google.com/spreadsheets/d/1eYj4exBEX8j6X8gm8q8OUyL3h3PfwUQsEj2fjpf9tqY/edit
 * 2. In the top menu, click: Extensions -> Apps Script
 * 3. Delete any default code in Code.gs, and PASTE THIS ENTIRE FILE.
 * 4. Click the Save icon (or Ctrl+S).
 * 5. At the top right, click the blue "Deploy" button -> click "New deployment".
 * 6. Click the gear icon next to "Select type" -> choose "Web app".
 * 7. Set Description: "Cover Duty API"
 * 8. Set "Execute as": "Me"
 * 9. Set "Who has access": "Anyone"
 * 10. Click "Deploy".
 *     (If prompted to authorize: click "Review permissions" -> choose your account ->
 *      click "Advanced" -> click "Go to ... (unsafe)" -> click "Allow")
 * 11. Copy the "Web app URL" (looks like: https://script.google.com/macros/s/.../exec).
 * 12. In the Cover Duty App on your phone:
 *     Tap the gear icon (⚙️) -> paste this URL -> tap "Save & Sync Now"!
 *
 * Anytime you change ANY period in the Google Sheet, tap "🔄 Sync" in the app
 * and the app will immediately update!
 */

function doGet(e) {
  try {
    const result = getSheetTimetableData();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: err.toString(),
        stack: err.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetTimetableData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Find the routine sheet tab
  let sheet = ss.getSheetByName('NEW SESSION ROUTINE 26 - 27');
  if (!sheet) {
    const allSheets = ss.getSheets();
    sheet = allSheets.find(s => s.getName().toUpperCase().includes('ROUTINE')) || allSheets[0];
  }

  // Use getDisplayValues() so cells like "10/12" or dates remain exact text strings
  const values = sheet.getDataRange().getDisplayValues();

  // Master teacher registry with classifications and metadata matching app rules
  const masterTeachers = [
    {
      name: 'Samrin Mumtaz',
      shortName: 'Samrin Mumtaz',
      designation: 'Principal',
      category: 'principal',
      classesRange: [12],
      subjects: ['History']
    },
    {
      name: 'Swarnendu Baduri',
      shortName: 'Swarnendu',
      designation: 'Teacher',
      category: 'both',
      classesRange: [8, 9, 12],
      subjects: ['Maths', 'Chemistry']
    },
    {
      name: 'Somenath Mandal',
      shortName: 'Somenath',
      designation: 'Senior Coordinator / CT Class 11',
      category: 'senior',
      classesRange: [9, 10, 12],
      subjects: ['Physics', 'Maths']
    },
    {
      name: 'Shivani Singh',
      shortName: 'Shivani',
      designation: 'Teacher',
      category: 'junior',
      classesRange: [6, 7, 8],
      subjects: ['Science', 'Maths', 'CT/AI']
    },
    {
      name: 'Durjoy Chakrabarty',
      shortName: 'Durjoy',
      designation: 'CT Class 10',
      category: 'senior',
      classesRange: [9, 10, 11, 12],
      subjects: ['Economics', 'Entrepreneurship']
    },
    {
      name: 'Sonali Sen',
      shortName: 'Sonali',
      designation: 'CT Class 9',
      category: 'both',
      classesRange: [6, 7, 9, 10, 11, 12],
      subjects: ['History', 'Geography', '2nd lang', '3rd lang']
    },
    {
      name: 'Aniket',
      shortName: 'Aniket',
      designation: 'CT Class 7',
      category: 'junior',
      classesRange: [6, 7],
      subjects: ['Maths', 'Science', 'IT']
    },
    {
      name: 'Sanjana Biswas',
      shortName: 'Sanjana',
      designation: 'CT Class 6',
      category: 'junior',
      classesRange: [6, 7],
      subjects: ['English', 'SST', 'IT']
    },
    {
      name: 'Soma Mukherjee',
      shortName: 'Soma',
      designation: 'CT NIOS 10',
      category: 'both',
      classesRange: [8, 9, 11],
      niosClasses: [10, 12],
      subjects: ['Geography', 'Home Science', 'SST']
    },
    {
      name: 'Susmita Dhar',
      shortName: 'Susmita',
      designation: 'Middle Coordinator',
      category: 'senior',
      classesRange: [8, 9, 10, 12],
      subjects: ['Biology', 'Science']
    },
    {
      name: 'Risha Ghosh',
      shortName: 'Risha',
      designation: 'Teacher',
      category: 'both',
      classesRange: [7, 8, 9, 10],
      subjects: ['Science', 'English', 'Chemistry', 'KB', 'KV']
    },
    {
      name: 'Satarupa Dutta',
      shortName: 'Satarupa',
      designation: 'CT Class 12',
      category: 'senior',
      classesRange: [6, 7, 8, 11, 12],
      subjects: ['BST', 'Accountancy', 'FL']
    },
    {
      name: 'Balaka Roy',
      shortName: 'Balaka',
      designation: 'Hindi Teacher',
      category: 'both',
      classesRange: [5, 8, 9, 10, 12],
      subjects: ['Hindi']
    },
    {
      name: 'Ayan Jana',
      shortName: 'Ayan',
      designation: 'Bengali Teacher',
      category: 'both',
      classesRange: [6, 8, 9, 10, 12],
      niosClasses: [10],
      subjects: ['Bengali']
    },
    {
      name: 'Sagnik Basu',
      shortName: 'Sagnik B',
      designation: 'Maths Teacher',
      category: 'both',
      classesRange: [3, 4, 5, 8, 10, 12],
      subjects: ['Maths']
    },
    {
      name: 'Sekhar Baran Karmakar',
      shortName: 'Sekhar',
      designation: 'Commercial Art Teacher',
      category: 'both',
      classesRange: [6, 7, 8, 11, 12],
      niosClasses: [10],
      subjects: ['Art', 'Painting']
    },
    {
      name: 'Pradipta Bandyopadhyay',
      shortName: 'Pradipta',
      designation: 'Librarian',
      category: 'both',
      classesRange: [6, 7, 8, 9, 10, 11, 12],
      niosClasses: [10],
      subjects: ['Library', '3rd Lang', 'IT']
    },
    {
      name: 'Susmita Bose',
      shortName: 'Susmita B',
      designation: 'CT Class 8',
      category: 'senior',
      classesRange: [6, 7, 8, 9, 10, 11, 12],
      niosClasses: [10],
      subjects: ['English', 'KB', 'Communication', 'Financial Literacy']
    },
    {
      name: 'Sagnik Guha',
      shortName: 'Sagnik G',
      designation: 'NIOS Coordinator',
      category: 'senior',
      classesRange: [8, 9, 10, 11, 12],
      niosClasses: [10],
      subjects: ['Political Science', 'SST', 'Communication']
    },
    {
      name: 'Samaresh Rana',
      shortName: 'Samaresh',
      designation: 'Computer Science Teacher',
      category: 'both',
      classesRange: [8, 9, 10, 11, 12],
      niosClasses: [10],
      subjects: ['IT', 'CS', 'DEO']
    },
    {
      name: 'Sanjay Patra',
      shortName: 'Sanjay',
      designation: 'PE Teacher',
      category: 'both',
      classesRange: [2, 3, 4, 5, 6, 7, 8, 9, 11],
      niosClasses: [10, 12],
      subjects: ['PE']
    },
    {
      name: 'Ayas Munsi',
      shortName: 'Ayas',
      designation: 'PE Teacher',
      category: 'both',
      classesRange: [6, 7, 8, 10, 11, 12],
      niosClasses: [10],
      subjects: ['PE', 'Yoga']
    },
    {
      name: 'Vikash Kumar Shaw',
      shortName: 'Vikash',
      designation: 'Hindi Teacher',
      category: 'junior',
      classesRange: [6, 7, 8, 9],
      niosClasses: [10, 12],
      subjects: ['Hindi', '3rd Lang']
    },
    {
      name: 'Iti Chakrabarty',
      shortName: 'Iti',
      designation: 'Bengali Teacher',
      category: 'primary',
      classesRange: [2, 3, 4, 5, 6, 7],
      subjects: ['Bengali']
    },
    {
      name: 'Chetna Solanki',
      shortName: 'Chetna',
      designation: 'Hindi Teacher',
      category: 'primary',
      classesRange: [1, 2, 3, 4, 5],
      subjects: ['Hindi']
    },
    {
      name: 'Indrajeet',
      shortName: 'Indrajeet',
      designation: 'NIOS 12 Teacher',
      category: 'nios',
      classesRange: [],
      niosClasses: [12],
      subjects: ['NIOS 12']
    },
    {
      name: 'Tamasa Das',
      shortName: 'Tamasa',
      designation: 'Special Educator',
      category: 'excluded',
      classesRange: [],
      subjects: ['Special Education']
    },
    {
      name: 'Ritu Karmakar Paul',
      shortName: 'Ritu',
      designation: 'Special Educator',
      category: 'excluded',
      classesRange: [],
      subjects: ['Special Education']
    },
    {
      name: 'Koushani Sarkar',
      shortName: 'Koushani',
      designation: 'Students Counselor',
      category: 'excluded',
      classesRange: [],
      subjects: ['Counseling']
    }
  ];

  // Parse all timetable blocks from the sheet
  const parsedBlocks = [];
  for (let r = 0; r < values.length; r++) {
    const row = values[r] || [];
    const upperCells = row.map(c => (c || '').toString().trim().toUpperCase());
    const startCol = upperCells.indexOf('1ST');

    // Look for the 1ST, 2ND, 3RD period header row
    if (startCol !== -1 && upperCells.includes('2ND') && upperCells.includes('3RD')) {
      // Find the teacher header above this row
      let teacherHeader = '';
      for (let back = r - 1; back >= Math.max(0, r - 5); back--) {
        const prevRow = values[back] || [];
        const text = prevRow.find(cell => cell && cell.toString().trim().length > 3);
        if (text) {
          teacherHeader = text.toString().trim();
          break;
        }
      }

      // Skip class-wise timetable blocks (e.g. "CLASS - 1 ...", "NIOS 10 - ...")
      const upperHeader = teacherHeader.toUpperCase();
      if (upperHeader.startsWith('CLASS ') || upperHeader.startsWith('CLASS-') || upperHeader.startsWith('NIOS ')) {
        continue;
      }

      // Read timetable for MON, TUE, WED, THU, FRI
      const timetable = {
        MON: ['', '', '', '', '', '', '', ''],
        TUE: ['', '', '', '', '', '', '', ''],
        WED: ['', '', '', '', '', '', '', ''],
        THU: ['', '', '', '', '', '', '', ''],
        FRI: ['', '', '', '', '', '', '', '']
      };

      for (let f = r + 1; f <= Math.min(values.length - 1, r + 10); f++) {
        const fRow = values[f] || [];
        let targetDay = null;

        for (let c = 0; c < startCol; c++) {
          const cellText = (fRow[c] || '').toString().trim().toUpperCase();
          if (cellText.startsWith('MON')) { targetDay = 'MON'; break; }
          if (cellText.startsWith('TUE')) { targetDay = 'TUE'; break; }
          if (cellText.startsWith('WED')) { targetDay = 'WED'; break; }
          if (cellText.startsWith('THU')) { targetDay = 'THU'; break; }
          if (cellText.startsWith('FRI')) { targetDay = 'FRI'; break; }
        }

        if (targetDay) {
          const periods = [];
          for (let p = startCol; p < startCol + 8; p++) {
            const cell = (fRow[p] !== undefined && fRow[p] !== null) ? fRow[p].toString().trim() : '';
            periods.push(cell);
          }
          timetable[targetDay] = periods;
        }
      }

      parsedBlocks.push({ teacherHeader, timetable });
    }
  }

  // Helper to match a teacher header with a master teacher
  function clean(str) {
    return (str || '').toUpperCase().replace(/[^A-Z]/g, ' ');
  }

  const resultTeachers = masterTeachers.map(master => {
    const mParts = clean(master.name).split(' ').filter(p => p.length > 2);

    // Find matching block
    let matchedBlock = parsedBlocks.find(b => {
      const hClean = clean(b.teacherHeader);
      return mParts.every(part => hClean.includes(part));
    });

    if (!matchedBlock && mParts.length >= 2) {
      const first = mParts[0];
      const last = mParts[mParts.length - 1];
      matchedBlock = parsedBlocks.find(b => {
        const hClean = clean(b.teacherHeader);
        return hClean.includes(first) && hClean.includes(last);
      });
    }

    if (!matchedBlock) {
      const first = mParts[0];
      matchedBlock = parsedBlocks.find(b => {
        const hClean = clean(b.teacherHeader);
        return hClean.includes(first);
      });
    }

    const finalTimetable = matchedBlock ? matchedBlock.timetable : {
      MON: ['', '', '', '', '', '', '', ''],
      TUE: ['', '', '', '', '', '', '', ''],
      WED: ['', '', '', '', '', '', '', ''],
      THU: ['', '', '', '', '', '', '', ''],
      FRI: ['', '', '', '', '', '', '', '']
    };

    // Dynamically detect NIOS classes from the teacher's current sheet timetable
    const detectedNios = new Set(master.niosClasses || []);
    Object.values(finalTimetable).forEach(dayPeriods => {
      (dayPeriods || []).forEach(cell => {
        const up = (cell || '').toString().toUpperCase();
        if (up.includes('NIOS 10') || up.includes('NIOS10')) detectedNios.add(10);
        if (up.includes('NIOS 12') || up.includes('NIOS12')) detectedNios.add(12);
      });
    });

    return {
      name: master.name,
      shortName: master.shortName || master.name,
      designation: master.designation,
      category: master.category,
      classesRange: master.classesRange,
      subjects: master.subjects,
      niosClasses: Array.from(detectedNios),
      timetable: finalTimetable
    };
  });

  return {
    success: true,
    count: resultTeachers.length,
    updatedAt: new Date().toISOString(),
    teachers: resultTeachers
  };
}
