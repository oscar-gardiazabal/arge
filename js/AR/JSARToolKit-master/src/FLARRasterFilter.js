
IFLdoThFilterImpl = ASKlass('IFLdoThFilterImpl', {// Filter implementation for each raster
    doThFilter: function(i_input, i_output, i_size, i_threshold) {
    }
});

FLARRasterFilter_Threshold = ASKlass('FLARRasterFilter_Threshold', {// binarization by a constant threshold.
    _threshold: 0,
    _do_threshold_impl: null,
    FLARRasterFilter_Threshold: function(i_threshold) {
    },
    // Threshold for binarizing the image. Will be <bright point <= th scotoma.
    setThreshold: function(i_threshold) {
        this._threshold = i_threshold;
    }
    ,
    doFilter: function(i_input, i_output) {
        NyAS3Utils.assert(i_input._width == i_output._width && i_input._height == i_output._height);
        var out_buf = (i_output.getBuffer());
        var in_reader = i_input.getRgbPixelReader();
        var d = in_reader.getData().data;
        var obd = out_buf.data;
        var th3 = this._threshold * 10000;
        for (var i = 0, j = 0; i < d.length; i += 4, ++j) {
            var c = d[i] * 2989 + d[i + 1] * 5866 + d[i + 2] * 1145;
            var t = (c <= th3) ? 0xffffffff : 0xff000000;
            obd[j] = t;
        }
        if (window.DEBUG) {
            var debugCanvas = document.getElementById('debugCanvas');
            out_buf.drawOnCanvas(debugCanvas);
        }
        return;
    }
});

Point = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

doThFilterImpl_BUFFERFORMAT_OBJECT_AS_BitmapData = {
    doThFilter: function(i_input, i_output, i_threshold) {
        var out_buf = (i_output.getBuffer());
        var in_buf = (i_input.getBuffer());
        var d = in_buf.data;
        var obd = out_buf.data;
        for (var i = 0; i < d.length; i++) {
            var dc = d[i];
            var c = ((dc >> 16) & 0xff) * 0.2989 + ((dc >> 8) & 0xff) * 0.5866 + (dc & 0xff) * 0.1145;
            var f = (c <= i_threshold);
            var t = f * 0xffffffff + (1 - f) * 0xff000000;
            obd[j] = t;
        }
    }
};