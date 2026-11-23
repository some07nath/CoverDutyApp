# 📋 Teacher Cover Duty App

An Android mobile application built with React Native and Expo to automatically calculate, assign, and manage daily teacher substitution/cover duties based on the school timetable Google Sheet.

---

## 🚀 Features & Rules Implemented

1. **Timetable Database (Extracted from Google Sheet)**:
   - Full 5-day timetable for all teachers (Period 1 to Period 8).
   - Differentiates junior (6–8), senior (9–12), NIOS (NIOS 10, NIOS 12), and primary levels.

2. **Absent Teachers Selection (Rule 2)**:
   - Select the date (Monday to Friday).
   - Choose which teachers are absent today.

3. **Smart Period Search & Rules (Rule 3 & 4)**:
   - Finds every class period the absent teachers have.
   - **Rule 4a**: Principal (Samrin Mumtaz) is **never** assigned cover duties.
   - **Rule 4b**:
     - Teachers of classes 6, 7, 8 can cover classes 6, 7, 8.
     - Teachers of classes 9, 10, 11, 12 can cover classes 9 to 12.
     - NIOS classes are strictly covered by NIOS-eligible teachers.
     - Teachers who teach both ranges can cover either.
   - **Rule 4c**: Provides choices of all free & present teachers for each period.
   - **Rule 4d**: Displays each teacher's total classes today (e.g. 6 classes vs 5 classes), prioritizing those with more classes.
   - **Rule 4e**: Detects if another teacher has the same class at the same period and highlights **"(combined)"** section opportunities.

4. **Duty Counter Tracking (Rule 5)**:
   - Tracks how many cover classes each teacher has taken over time.
   - Stored persistently on the device.
   - View, increment, decrement, or reset counters anytime.

5. **Exact Output Formatting (Rule 6)**:
   - Formats the final routine into the exact text format:
     ```text
     Cover for 21.11.2026
     Sekhar
     1st - Class 11 - Samaresh (combined)
     4th - Class 12 - Ayas (combined)
     ...
     ```
   - One-tap **Copy to Clipboard**.
   - Direct **Share via WhatsApp** or SMS.
   - **Save & Update Duty Counters** with one tap.

---

## 📱 How to Run the App on Your Phone (Immediate Test)

1. On your Android phone, install the free **Expo Go** app from the Google Play Store.
2. In the `CoverDutyApp` folder, double-click **`run_app.bat`** (or run `npx expo start` in terminal).
3. Scan the QR code displayed in the command window using the Expo Go app.
4. The app will launch immediately on your phone!

---

## 📦 How to Generate the Standalone APK

1. In the `CoverDutyApp` folder, double-click **`build_apk.bat`** (or run `npx eas build -p android --profile preview`).
2. Log in with your free Expo account (create one at [expo.dev](https://expo.dev) if you don't have one).
3. EAS Cloud will compile the Android `.apk` file.
4. Once completed, a download link for the `.apk` will be printed in the terminal. Download and install it directly on any Android device!
