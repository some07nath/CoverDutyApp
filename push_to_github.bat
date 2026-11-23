@echo off
set PATH=%LOCALAPPDATA%\Programs\gh\bin;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%
cd /d "%~dp0"
echo ===================================================
echo     Push CoverDutyApp to GitHub to Build APK
echo ===================================================
echo.

echo Checking GitHub login...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 1. Your browser will open GitHub to authorize access.
    echo 2. Enter the one-time code shown below if prompted.
    echo.
    gh auth login -w -p https
    gh auth setup-git
)

echo.
echo Configuring remote repository for some07nath/CoverDutyApp...
git remote remove origin 2>nul
git remote add origin https://github.com/some07nath/CoverDutyApp.git
git branch -M main

echo.
echo Pushing your project to GitHub...
git push -u origin main --force

echo.
echo ===================================================
echo SUCCESS! Your code has been pushed to GitHub.
echo.
echo Now open this link in your browser:
echo https://github.com/some07nath/CoverDutyApp/actions
echo.
echo You will see "Build Android APK" running!
echo In ~3-4 minutes, click it and download your APK!
echo ===================================================
pause
