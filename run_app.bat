@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
echo ===================================================
echo     Starting Teacher Cover Duty Android App
echo ===================================================
echo.
echo 1. Open the Expo Go app on your Android phone.
echo 2. Scan the QR code that appears in the terminal.
echo 3. The app will launch immediately on your phone!
echo.
npx expo start
pause
