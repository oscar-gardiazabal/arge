setlocal EnableDelayedExpansion EnableExtensions

set name="arge"

SET CurrDir=%CD%

CD..
CD..

SET NewDir=%CD%

IF EXIST "%name%.js" del "%name%.js"

for /d /r %%i in (*.js) do (
    echo ola %i%
    ::copy %i% %name%.js
)

::IF EXIST "%name%.min.js" del "%name%.min.js"
::for %%a in (%name%.js) do @java -jar %CurrDir%/yuicompressor.jar "%%a" -o "%name%.min.js"

pause
