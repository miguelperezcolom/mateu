@echo off
rem Applies a staged Mateu plugin update BEFORE the IDE starts — the Windows twin of apply-update.sh
rem (same layout, same two renames, same repair of an interrupted swap; see that file).
rem
rem   apply-update.cmd <plugins dir> <update dir>
setlocal
set "PLUGINS=%~1"
set "UPDATE=%~2"
set "NAME=mateu-intellij-plugin"
set "PENDING=%UPDATE%\pending"
set "PREVIOUS=%UPDATE%\previous"

rem Repair an interrupted swap: the installed plugin is gone but its copy was moved aside.
if not exist "%PLUGINS%\%NAME%\" if exist "%PREVIOUS%\" (
  if not exist "%PLUGINS%\" mkdir "%PLUGINS%"
  move "%PREVIOUS%" "%PLUGINS%\%NAME%" >nul
)

if not exist "%PENDING%\READY" goto :done
if not exist "%PENDING%\%NAME%\lib\" goto :done

if exist "%PREVIOUS%\" rmdir /s /q "%PREVIOUS%"
if not exist "%PLUGINS%\" mkdir "%PLUGINS%"
if exist "%PLUGINS%\%NAME%\" (
  move "%PLUGINS%\%NAME%" "%PREVIOUS%" >nul || goto :done
)
move "%PENDING%\%NAME%" "%PLUGINS%\%NAME%" >nul && goto :applied
echo mateu: could not apply the staged update; keeping the installed plugin 1>&2
if exist "%PREVIOUS%\" move "%PREVIOUS%" "%PLUGINS%\%NAME%" >nul
goto :done

:applied
if exist "%PENDING%\version.txt" copy /y "%PENDING%\version.txt" "%UPDATE%\applied.txt" >nul
if exist "%PREVIOUS%\" rmdir /s /q "%PREVIOUS%"
rmdir /s /q "%PENDING%"

:done
endlocal
exit /b 0
