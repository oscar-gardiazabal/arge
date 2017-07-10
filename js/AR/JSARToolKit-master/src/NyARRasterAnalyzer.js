
NyARRasterAnalyzer_Histogram = ASKlass('NyARRasterAnalyzer_Histogram', {
    _histImpl: null
    ,
    // Vertical direction skip number of histogram analysis. Inheriting class to this number of lines at a time
    // Making a histogram calculation while skipping
    _vertical_skip: 0,
    NyARRasterAnalyzer_Histogram: function(i_raster_format, i_vertical_interval) {
        if (!this.initInstance(i_raster_format, i_vertical_interval)) {
            throw new NyARException();
        }
    }
    ,
    initInstance: function(i_raster_format, i_vertical_interval) {
        switch (i_raster_format) {
            case NyARBufferType.INT1D_GRAY_8:
                this._histImpl = new NyARRasterThresholdAnalyzer_Histogram_INT1D_GRAY_8();
                break;
            case NyARBufferType.INT1D_X8R8G8B8_32:
                this._histImpl = new NyARRasterThresholdAnalyzer_Histogram_INT1D_X8R8G8B8_32();
                break;
            default:
                return false;
        }
        this._vertical_skip = i_vertical_interval; //Initialization
        return true;
    }
    ,
    setVerticalInterval: function(i_step) {
        this._vertical_skip = i_step;
        return;
    }    
    ,
    analyzeRaster: function(i_input, o_histgram) { // output the histogram to o_histgram
        var size = i_input.getSize();
        // Limit on the maximum image size
        NyAS3Utils.assert(size.w * size.h < 0x40000000);
        NyAS3Utils.assert(o_histgram.length == 256); // Now fixed
        var h = o_histgram.data;
        // Histogram initialization
        for (var i = o_histgram.length - 1; i >= 0; i--) {
            h[i] = 0;
        }
        o_histgram.total_of_data = size.w * size.h / this._vertical_skip;
        return this._histImpl.createHistogram(i_input, size, h, this._vertical_skip);
    }
});

ICreateHistogramImpl = ASKlass('ICreateHistogramImpl', {
    createHistogram: function(i_reader, i_size, o_histgram, i_skip) {
    }
});

NyARRasterThresholdAnalyzer_Histogram_INT1D_GRAY_8 = ASKlass('NyARRasterThresholdAnalyzer_Histogram_INT1D_GRAY_8', ICreateHistogramImpl, {
    createHistogram: function(i_reader, i_size, o_histgram, i_skip) {
        NyAS3Utils.assert(i_reader.isEqualBufferType(NyARBufferType.INT1D_GRAY_8));
        var input = (IntVector)(i_reader.getBuffer());
        for (var y = i_size.h - 1; y >= 0; y -= i_skip) {
            var pt = y * i_size.w;
            for (var x = i_size.w - 1; x >= 0; x--) {
                o_histgram[input[pt]]++;
                pt++;
            }
        }
        return i_size.w * i_size.h;
    }
});

NyARRasterThresholdAnalyzer_Histogram_INT1D_X8R8G8B8_32 = ASKlass('NyARRasterThresholdAnalyzer_Histogram_INT1D_X8R8G8B8_32', ICreateHistogramImpl, {
    createHistogram: function(i_reader, i_size, o_histgram, i_skip) {
        NyAS3Utils.assert(i_reader.isEqualBufferType(NyARBufferType.INT1D_X8R8G8B8_32));
        var input = (i_reader.getBuffer());
        for (var y = i_size.h - 1; y >= 0; y -= i_skip) {
            var pt = y * i_size.w;
            for (var x = i_size.w - 1; x >= 0; x--) {
                var p = input[pt];
                o_histgram[((p & 0xff) + (p & 0xff) + (p & 0xff)) / 3]++;
                pt++;
            }
        }
        return i_size.w * i_size.h;
    }
});

INyARRasterThresholdAnalyzer = ASKlass('INyARRasterThresholdAnalyzer', {
    analyzeRaster: function(i_input) {
    }
});

NyARRasterThresholdAnalyzer_SlidePTile = ASKlass('NyARRasterThresholdAnalyzer_SlidePTile', INyARRasterThresholdAnalyzer, {
    _raster_analyzer: null,
    _sptile: null,
    _histgram: null,
    NyARRasterThresholdAnalyzer_SlidePTile: function(i_persentage, i_raster_format, i_vertical_interval) {
        NyAS3Utils.assert(0 <= i_persentage && i_persentage <= 50);
        //Initialization
        if (!this.initInstance(i_raster_format, i_vertical_interval)) {
            throw new NyARException();
        }
        this._sptile = new NyARHistogramAnalyzer_SlidePTile(i_persentage);
        this._histgram = new NyARHistogram(256);
    }
    ,
    initInstance: function(i_raster_format, i_vertical_interval) {
        this._raster_analyzer = new NyARRasterAnalyzer_Histogram(i_raster_format, i_vertical_interval);
        return true;
    }
    ,
    setVerticalInterval: function(i_step) {
        this._raster_analyzer.setVerticalInterval(i_step);
        return;
    }
    ,
    analyzeRaster: function(i_input) {
        this._raster_analyzer.analyzeRaster(i_input, this._histgram);
        return this._sptile.getThreshold(this._histgram);
    }
});
        