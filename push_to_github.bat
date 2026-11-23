@echo off
set PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%
cd /d "%~dp0"
echo ===================================================
echo     Push CoverDutyApp to GitHub to Build APK
echo ===================================================
echo.
echo 1. Go to https://github.com/new and create a new repository.
echo    (Name it e.g. "CoverDutyApp", do NOT check 'Add README')
echo.
echo 2. Copy the repository URL (e.g. https://github.com/your-username/CoverDutyApp.git)
echo.
set /p REPO_URL="Paste your GitHub repository URL here: "

if "%REPO_URL%"=="" (
    echo No URL entered. Aborting.
    pause
    exit /b
)

echo.
echo Setting remote repository...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Pushing code to GitHub...
git push -u origin main

echo.
echo ===================================================
echo Done! Now open your GitHub repository in your browser:
echo 1. Click on the "Actions" tab at the top.
echo 2. You will see "Build Android APK" running.
echo 3. In about 3 minutes, click on it and download your APK!
echo ===================================================
pause
