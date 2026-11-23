@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
echo ===================================================
echo       Building Cover Duty Android APK (EAS)
echo ===================================================
echo.
echo Step 1: Login to Expo (free account at expo.dev)
npx eas login
echo.
echo Step 2: Triggering Cloud Android APK build...
npx eas build -p android --profile preview
echo.
echo When the build completes, a direct .apk download link will be shown above!
pause
