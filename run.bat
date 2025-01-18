@echo off
echo Checking for Mineflayer installation...

if exist "node_modules\mineflayer" (
    echo Mineflayer is already installed. Skipping installation.
) else (
    echo Installing Mineflayer...
    npm install mineflayer
    if %errorlevel% neq 0 (
        echo Installation failed. Please check the error above.
        exit /b %errorlevel%
    )
)

echo Starting the bot...
node index.js
pause