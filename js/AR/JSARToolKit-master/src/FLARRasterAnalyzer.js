
FLARRasterAnalyzer_Histogram = ASKlass('FLARRasterAnalyzer_Histogram', NyARRasterAnalyzer_Histogram, {
    FLARRasterAnalyzer_Histogram: function(i_vertical_interval) {
        NyARRasterAnalyzer_Histogram.initialize.call(this, NyARBufferType.OBJECT_AS3_BitmapData, i_vertical_interval);
    }
    ,
    initInstance: function(i_raster_format, i_vertical_interval) {
        if (i_raster_format != NyARBufferType.OBJECT_AS3_BitmapData) {
            return false;
        } else {
            this._vertical_skip = i_vertical_interval;
        }
        return true;
    }
    ,    
    analyzeRaster: function(i_input, o_histgram) { // output the histogram to o_histgram
        var size = i_input.getSize();        
        NyAS3Utils.assert(size.w * size.h < 0x40000000); // Limit on the maximum image size
        NyAS3Utils.assert(o_histgram.length == 256); // Now fixed
        var h = o_histgram.data;
        // Histogram initialization
        for (var i = o_histgram.length - 1; i >= 0; i--) {
            h[i] = 0;
        }
        o_histgram.total_of_data = size.w * size.h / this._vertical_skip;
        return this.createHistgram_AS3_BitmapData(i_input, size, h, this._vertical_skip);
    }
    ,
    createHistgram_AS3_BitmapData: function(i_reader, i_size, o_histgram, i_skip) {
        //[TO DO:] from non-performance and it is this way, of Bitmapdata
        NyAS3Utils.assert(i_reader.isEqualBufferType(NyARBufferType.OBJECT_AS3_BitmapData));
        var input = (i_reader.getBuffer());
        for (var y = i_size.h - 1; y >= 0; y -= i_skip) {
            var pt = y * i_size.w;
            for (var x = i_size.w - 1; x >= 0; x--) {
                var p = input.getPixel(x, y);
                o_histgram[toInt((((p >> 8) & 0xff) + ((p >> 16) & 0xff) + (p & 0xff)) / 3)]++;
                pt++;
            }
        }
        return i_size.w * i_size.h;
    }
});

FLARRasterThresholdAnalyzer_SlidePTile = ASKlass('FLARRasterThresholdAnalyzer_SlidePTile', NyARRasterThresholdAnalyzer_SlidePTile, {
    FLARRasterThresholdAnalyzer_SlidePTile: function(i_persentage, i_vertical_interval) {
        NyARRasterThresholdAnalyzer_SlidePTile.initialize.call(this, i_persentage, NyARBufferType.OBJECT_AS3_BitmapData, i_vertical_interval);
    }
    ,
    initInstance: function(i_raster_format, i_vertical_interval) {
        if (i_raster_format != NyARBufferType.OBJECT_AS3_BitmapData) {
            return false;
        }
        this._raster_analyzer = new FLARRasterAnalyzer_Histogram(i_vertical_interval);
        return true;
    }
});
