@echo off
REM Load .env.local and run migration
for /f "delims=" %%a in ('findstr /b "DATABASE_URL=" ..\.env.local') do set %%a
npx ts-node --project tsconfig.json %1
