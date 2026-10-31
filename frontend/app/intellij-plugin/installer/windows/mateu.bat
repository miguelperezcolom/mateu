@echo off
rem Mateu desktop launcher (Windows): applies a staged update, then opens the bundled workspace.
rem Arguments go through to the IDE (a mateu:// link from the registered URL protocol).
rem
rem A restart from inside the app ("Restart to update", or any IDE restart) EXITS with 88 instead of
rem relaunching idea64.exe directly (IDEA_RESTART_VIA_EXIT_CODE, read by the platform's Restarter),
rem so the relaunch comes back here and the update is applied first. A batch file waits for the IDE
rem (even a GUI program) and sees its exit code. The arguments are not repeated on a restart.
setlocal
set "HERE=%~dp0"
set "IDEA_RESTART_VIA_EXIT_CODE=88"

call "%HERE%apply-update.cmd" "%HERE%data\plugins" "%HERE%data\mateu-update"
"%HERE%bin\idea64.exe" "%HERE%workspace" %*
if not "%ERRORLEVEL%"=="88" goto :eof

:relaunch
call "%HERE%apply-update.cmd" "%HERE%data\plugins" "%HERE%data\mateu-update"
"%HERE%bin\idea64.exe" "%HERE%workspace"
if "%ERRORLEVEL%"=="88" goto relaunch
