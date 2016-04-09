@echo off
echo.
echo discord f(x)
echo.
if [%1] == [] goto :needprocess

set effect=none
set/p effect=Name of effect: 
if %effect% EQU none goto :blank
rem // https://stackoverflow.com/questions/24635754/batch-search-if-a-variable-contains-spaces
if not "%effect%" == "%effect: =%" goto :spaced

echo.
echo loading...
echo.

set new=1
if not exist %~dp0\fx\%effect% goto new
rem // https://stackoverflow.com/questions/11645226/choose-highest-numbered-file-batch-file
setlocal enabledelayedexpansion
set max=0
for %%x in (%~dp0\fx\%effect%\*.mp3) do (
    set "FN=%%~nx"
    if !FN! GTR !max! set max=!FN!
)
set/a new=%max%+1

:process
echo.
echo processing and saving to %effect%\%new%.mp3...
echo.

ffmpeg -i %1 -f s16le -ar 48000 -ac 2 %~dp0\fx\%effect%\%new%.mp3

echo.
echo script finished
echo.
pause

exit


:new
md %~dp0\fx\%effect%
goto process


:needprocess
echo.
echo -- you need to drag a file on fxef.cmd to be processed --
echo.
pause
exit 1

:blank
echo.
echo -- the input cannot be blank --
echo.
pause
exit 1

:spaced
echo.
echo -- the input cannot have spaced --
echo.
pause
exit 1