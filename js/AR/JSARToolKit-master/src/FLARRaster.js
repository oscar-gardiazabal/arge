
FLARCanvas = function(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
};

FLARBinRaster = ASKlass('FLARBinRaster', NyARBinRaster, {
    FLARBinRaster: function(i_width, i_height) {
        NyARBinRaster.initialize.call(this, i_width, i_height, NyARBufferType.OBJECT_AS3_BitmapData, true);
        this._gray_reader = new FLARGrayPixelReader_BitmapData(this._buf);
    }
    , 
    initInstance: function(i_size, i_buf_type, i_is_alloc) {
        this._buf = i_is_alloc ? new BitmapData(i_size.w, i_size.h, 0x00) : null;
        return true;
    }
    , 
    getGrayPixelReader: function() {
        return this._gray_reader;
    }
})


FLARRgbRaster_BitmapData = ASKlass('FLARRgbRaster_BitmapData', NyARRgbRaster_BasicClass, {
    _bitmapData: null,
    _rgb_reader: null
    ,
    //@deprecated It is changed as follows in the next version. FLARRgbRaster_BitmapData (i_width, i_height)    
    FLARRgbRaster_BitmapData: function(bitmapData) {
        NyARRgbRaster_BasicClass.initialize.call(this, bitmapData.width, bitmapData.height, NyARBufferType.OBJECT_AS3_BitmapData);
        this._bitmapData = bitmapData;
        this._rgb_reader = new FLARRgbPixelReader_BitmapData(this._bitmapData);
    }
    , getRgbPixelReader: function() {
        return this._rgb_reader;
    }
    , getBuffer: function() {
        return this._bitmapData;
    }
    , hasBuffer: function() {
        return this._bitmapData != null;
    }
});
