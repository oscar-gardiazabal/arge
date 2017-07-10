setlocal EnableDelayedExpansion EnableExtensions

set name=threex.jsartoolkit

IF EXIST "%name%.js" del "%name%.js"

SET CurrDir=%CD%

cd src

copy /b NyAs3Utils.js+FLARArrayUtil.js+FLARException.js+FLARMat.js+FLARRgbPixelReader.js+NyARHistogramAnalyzer.js+NyARPca2d.js+NyARRasterReader.js+NyARTypes.js+FLARRasterFilter.js+FLARTypes.js+NyARLabel.js+FLARLabeling.js+NyARParam.js+FLARParam.js+NyARRaster.js+FLARRaster.js+NyARCode.js+FLARCode.js+NyARMatch.js+NyARRasterAnalyzer.js+FLARRasterAnalyzer.js+NyARRasterFilter.js+NyARSquareDetect.js+FLARSquareDetect.js+NyARTransMat.js+FLARTransMat.js+NyARUtils.js+NyARIdMarker.js+NyARPickup.js+FLARProcessor.js+NyARDetector.js+FLARDetector.js+FLARIdMarkerDetector.js+NyARSingleMarkerProcesser.js+NyUtils.js %CurrDir%\%name%.js

cd..

IF EXIST "%name%.min.js" del "%name%.min.js"
for %%a in (%name%.js) do @java -jar yuicompressor.jar "%%a" -o "%name%.min.js"

pause
