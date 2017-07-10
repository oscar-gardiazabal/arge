
FLARRgbPixelReader_BitmapData = ASKlass('FLARRgbPixelReader_BitmapData', {
    _ref_bitmap: null
    ,
    FLARRgbPixelReader_BitmapData: function(i_buffer) {
        this._ref_bitmap = i_buffer;
    }
    ,
    getPixel: function(i_x, i_y, o_rgb) {
        var c = this._ref_bitmap.getPixel(i_x, i_y);
        o_rgb[0] = (c >> 16) & 0xff;// R
        o_rgb[1] = (c >> 8) & 0xff;// G
        o_rgb[2] = c & 0xff;// B
        return;
    }
    ,
    getPixelSet: function(i_x, i_y, i_num, o_rgb) {
        var bmp = this._ref_bitmap;
        var c;
        var i;
        for (i = 0; i < i_num; i++) {
            c = bmp.getPixel(i_x[i], i_y[i]);
            o_rgb[i * 3 + 0] = (c >> 16) & 0xff;
            o_rgb[i * 3 + 1] = (c >> 8) & 0xff;
            o_rgb[i * 3 + 2] = c & 0xff;
        }
    }
    ,
    setPixel: function(i_x, i_y, i_rgb) {
        NyARException.notImplement();
    }
    ,
    setPixels: function(i_x, i_y, i_num, i_intrgb) {
        NyARException.notImplement();
    }
    ,
    switchBuffer: function(i_ref_buffer) {
        NyARException.notImplement();
    }
});

FLARGrayPixelReader_BitmapData = ASKlass('FLARGrayPixelReader_BitmapData', {
    _ref_bitmap: null
    ,
    FLARGrayPixelReader_BitmapData: function(i_buffer) {
        this._ref_bitmap = i_buffer;
    }
    ,
    getPixel: function(i_x, i_y, i_num, o_gray) {
        NyARException.notImplement();
        var w = this._ref_bitmap.getWidth();
        var d = this._ref_bitmap.getBuffer();
        o_gray[0] = o_gray[1] = o_gray[2] = ~d(i_x + w * i_y) & 0xff;
    }
    ,
    getPixelSet: function(i_x, i_y, i_num, o_gray) {
        var w = this._ref_bitmap.getWidth();
        var d = this._ref_bitmap.data;
        for (var i = 0; i < i_num; i++) {
            o_gray[i] = ~d[i_x[i] + w * i_y[i]] & 0xff;
        }
    }
    ,
    setPixel: function(i_x, i_y, i_rgb) {
        NyARException.notImplement();
    }
    ,
    setPixels: function(i_x, i_y, i_num, i_intrgb) {
        NyARException.notImplement();
    }
    ,
    switchBuffer: function(i_ref_buffer) {
        NyARException.notImplement();
    }
});
