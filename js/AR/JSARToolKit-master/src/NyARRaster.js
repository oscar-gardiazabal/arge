
INyARRaster = ASKlass('INyARRaster', {
    getWidth: function() {
    },
    getHeight: function() {
    },
    getSize: function() {
    },
    getBuffer: function() { // return the buffer object.
    },
    getBufferType: function() { // return the type of the buffer object.
    },
    isEqualBufferType: function(i_type_value) { //check buffer is either i_type_value, defined in NyARBufferType
    },
    hasBuffer: function() { //boolean getBuffer
    },
    // wrap the i_ref_buf. Performs a consistency check as much as possible
    // Only possible function, re-wrapping of the buffer please implement this function
    wrapBuffer: function(i_ref_buf) {
    }
});

NyARRaster_BasicClass = ASKlass('NyARRaster_BasicClass', INyARRaster, {
    _size: null,
    _buffer_type: 0,
    NyARRaster_BasicClass: function() { // function(int i_width,int i_height,int i_buffer_type)
        switch (arguments.length) {
            case 1:
                if (arguments[0] == NyAS3Const_Inherited) {
                    //blank
                }
                break;

            case 3:
                this.overload_NyARRaster_BasicClass(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]));
                break;

            default:
                throw new NyARException();
        }
    },
    overload_NyARRaster_BasicClass: function(i_width, i_height, i_buffer_type) {
        this._size = new NyARIntSize(i_width, i_height);
        this._buffer_type = i_buffer_type;
    },
    getWidth: function() {
        return this._size.w;
    },
    getHeight: function() {
        return this._size.h;
    },
    getSize: function() {
        return this._size;
    },
    getBufferType: function() {
        return this._buffer_type;
    },
    isEqualBufferType: function(i_type_value) {
        return this._buffer_type == i_type_value;
    },
    getBuffer: function() {
        throw new NyARException();
    },
    hasBuffer: function() {
        throw new NyARException();
    },
    wrapBuffer: function(i_ref_buf) {
        throw new NyARException();
    }
});

NyARBinRaster = ASKlass('NyARBinRaster', NyARRaster_BasicClass, {
    _buf: null,
    _is_attached_buffer: null, // Buffer true if the object is attached

    NyARBinRaster: function() {
        NyARRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
        switch (arguments.length) {
            case 1:
                if (arguments[0] == NyAS3Const_Inherited) {
                    //blank
                }
                break;
            case 2: //(int,int)
                this.override_NyARBinRaster2(toInt(arguments[0]), toInt(arguments[1]));
                break;
            case 3: //(int,int,bool)
                this.override_NyARBinRaster3(toInt(arguments[0]), toInt(arguments[1]), Boolean(arguments[2]));
                break;
            case 4: //(int,int,int,bool)
                this.override_NyARBinRaster4(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]), Boolean(arguments[3]));
                break;
            default:
                throw new NyARException();
        }
    },
    override_NyARBinRaster4: function(i_width, i_height, i_raster_type, i_is_alloc) { // Please specify a constant value defined in NyARBufferType.
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, i_raster_type);
        if (!this.initInstance(this._size, i_raster_type, i_is_alloc)) {
            throw new NyARException();
        }
    },
    override_NyARBinRaster3: function(i_width, i_height, i_is_alloc) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, NyARBufferType.INT1D_BIN_8);
        if (!this.initInstance(this._size, NyARBufferType.INT1D_BIN_8, i_is_alloc)) {
            throw new NyARException();
        }
    },
    override_NyARBinRaster2: function(i_width, i_height) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, NyARBufferType.INT1D_BIN_8);
        if (!this.initInstance(this._size, NyARBufferType.INT1D_BIN_8, true)) {
            throw new NyARException();
        }
    },
    initInstance: function(i_size, i_buf_type, i_is_alloc) {
        switch (i_buf_type)
        {
            case NyARBufferType.INT1D_BIN_8:
                this._buf = i_is_alloc ? new IntVector(i_size.w * i_size.h) : null;
                break;
            default:
                return false;
        }
        this._is_attached_buffer = i_is_alloc;
        return true;
    },
    getBuffer: function() {
        return this._buf;
    },
    // return the instance owns the buffer.
    // If you create a raster with i_is_alloc to false in the constructor,
    // before you can access the buffer, please check in this function the presence or absence of a buffer.
    hasBuffer: function() {
        return this._buf != null;
    },
    wrapBuffer: function(i_ref_buf) {
        NyAS3Utils.assert(!this._is_attached_buffer);//It does not work buffer if it is attached.
        this._buf = i_ref_buf;
    }
});

NyARGrayscaleRaster = ASKlass('NyARGrayscaleRaster', NyARRaster_BasicClass, {
    _buf: null,
    _is_attached_buffer: null, // Buffer true if the object is attached
    NyARGrayscaleRaster: function() {
        NyARRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
        switch (arguments.length) {
            case 1:
                if (arguments[0] == NyAS3Const_Inherited) {
                    //blank
                }
                break;
            case 2:
                //(int,int)
                this.overload_NyARGrayscaleRaster2(toInt(arguments[0]), toInt(arguments[1]));
                break;
            case 3:
                //(int,int,boolean)
                this.overload_NyARGrayscaleRaster3(toInt(arguments[0]), toInt(arguments[1]), Boolean(arguments[2]));
                break;
            case 4:
                //(int,int,int,boolean)
                this.overload_NyARGrayscaleRaster4(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]), Boolean(arguments[3]));
                break;
            default:
                throw new NyARException();
        }
    },
    overload_NyARGrayscaleRaster2: function(i_width, i_height) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, NyARBufferType.INT1D_GRAY_8);
        if (!this.initInstance(this._size, NyARBufferType.INT1D_GRAY_8, true)) {
            throw new NyARException();
        }
    },
    overload_NyARGrayscaleRaster3: function(i_width, i_height, i_is_alloc) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, NyARBufferType.INT1D_GRAY_8);
        if (!this.initInstance(this._size, NyARBufferType.INT1D_GRAY_8, i_is_alloc)) {
            throw new NyARException();
        }
    },
    overload_NyARGrayscaleRaster4: function(i_width, i_height, i_raster_type, i_is_alloc) { //Please specify a constant value defined in NyARBufferType.
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, i_raster_type);
        if (!this.initInstance(this._size, i_raster_type, i_is_alloc)) {
            throw new NyARException();
        }
    },
    initInstance: function(i_size, i_buf_type, i_is_alloc) {
        switch (i_buf_type) {
            case NyARBufferType.INT1D_GRAY_8:
                this._buf = i_is_alloc ? new IntVector(i_size.w * i_size.h) : null;
                break;
            default:
                return false;
        }
        this._is_attached_buffer = i_is_alloc;
        return true;
    },
    getBuffer: function() {
        return this._buf;
    },
    // return the instance owns the buffer.
    // If you create a raster with i_is_alloc to false in the constructor,
    // before you can access the buffer, please check in this function the presence or absence of a buffer.
    hasBuffer: function() {
        return this._buf != null;
    },
    wrapBuffer: function(i_ref_buf) {
        NyAS3Utils.assert(!this._is_attached_buffer); // It does not work buffer if it is attached.
        this._buf = i_ref_buf;
    }
});

NyARRaster = ASKlass('NyARRaster', NyARRaster_BasicClass, {// This class is a single-function NyARRaster.
    _buf: null,
    _buf_type: 0,
    _is_attached_buffer: null, // Buffer true if the object is attached
    NyARRaster: function() {
        NyARRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
        switch (arguments.length) {
            case 1:
                if (arguments[0] == NyAS3Const_Inherited) {
                    //blank
                }
                break;
            case 3:
                this.overload_NyARRaster3(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]));
                break;
            case 4:
                this.overload_NyARRaster4(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]), Boolean(arguments[3]));
                break;
            default:
                throw new NyARException();
        }
    },
    overload_NyARRaster4: function(i_width, i_height, i_buffer_type, i_is_alloc) { // Create a raster of buffer, value defined in NyARBufferType.
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, i_buffer_type);
        if (!this.initInstance(this._size, i_buffer_type, i_is_alloc)) {
            throw new NyARException();
        }
        return;
    },
    overload_NyARRaster3: function(i_width, i_height, i_buffer_type) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, i_buffer_type);
        if (!this.initInstance(this._size, i_buffer_type, true)) {
            throw new NyARException();
        }
        return;
    },
    initInstance: function(i_size, i_buf_type, i_is_alloc) {
        switch (i_buf_type)
        {
            case NyARBufferType.INT1D_X8R8G8B8_32:
                this._buf = i_is_alloc ? new IntVector(i_size.w * i_size.h) : null;
                break;
            default:
                return false;
        }
        this._is_attached_buffer = i_is_alloc;
        return true;
    },
    getBuffer: function() {
        return this._buf;
    },
    // return the instance owns the buffer.
    // If you create a raster with i_is_alloc to false in the constructor,
    // Before you can access the buffer, please check in this function the presence or absence of a buffer.
    hasBuffer: function() {
        return this._buf != null;
    },
    wrapBuffer: function(i_ref_buf) {
        NyAS3Utils.assert(!this._is_attached_buffer); // It does not work buffer if it is attached.
        this._buf = i_ref_buf;
    }
});
INyARRgbRaster = ASKlass('INyARRgbRaster', INyARRaster, {// Raster can represent 8bitRGB
    getRgbPixelReader: function() {
    }
});

NyARRgbRaster_BasicClass = ASKlass('NyARRgbRaster_BasicClass', INyARRgbRaster, {// Class that implements the basic function / member of NyARRaster interface
    _size: null,
    _buffer_type: 0,
    NyARRgbRaster_BasicClass: function() {
        switch (arguments.length) {
            case 1:
                if (arguments[0] == NyAS3Const_Inherited) {
                    //blank
                }
                break;
            case 3: //(int,int,int)                
                this.overload_NyARRgbRaster_BasicClass(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]));
                break;
            default:
                throw new NyARException();
        }
    },
    overload_NyARRgbRaster_BasicClass: function(i_width, i_height, i_buffer_type) {
        this._size = new NyARIntSize(i_width, i_height);
        this._buffer_type = i_buffer_type;
    },
    getWidth: function() {
        return this._size.w;
    },
    getHeight: function() {
        return this._size.h;
    },
    getSize: function() {
        return this._size;
    },
    getBufferType: function() {
        return this._buffer_type;
    },
    isEqualBufferType: function(i_type_value) {
        return this._buffer_type == i_type_value;
    },
    getRgbPixelReader: function() {
        throw new NyARException();
    },
    getBuffer: function() {
        throw new NyARException();
    },
    hasBuffer: function() {
        throw new NyARException();
    },
    wrapBuffer: function(i_ref_buf) {
        throw new NyARException();
    }
});

NyARRgbRaster = ASKlass('NyARRgbRaster', NyARRgbRaster_BasicClass, {
    _buf: null,
    _reader: null, // Buffer true if the object is attached
    _is_attached_buffer: null,
    NyARRgbRaster: function() {
        NyARRgbRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
        switch (arguments.length) {
            case 1:
                if (arguments[0] == NyAS3Const_Inherited) {
                    //blank
                }
                break;
            case 3:
                this.overload_NyARRgbRaster3(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]));
                break;
            case 4:
                this.overload_NyARRgbRaster4(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]), Boolean(arguments[3]));
                break;
            default:
                throw new NyARException();
        }
    },
    overload_NyARRgbRaster4: function(i_width, i_height, i_raster_type, i_is_alloc) { // specify a constant defined in NyARBufferType.
        NyARRgbRaster_BasicClass.overload_NyARRgbRaster_BasicClass.call(this, i_width, i_height, i_raster_type);
        if (!this.initInstance(this._size, i_raster_type, i_is_alloc)) {
            throw new NyARException();
        }
    },
    overload_NyARRgbRaster3: function(i_width, i_height, i_raster_type) { // specify a constant defined in NyARBufferType.
        NyARRgbRaster_BasicClass.overload_NyARRgbRaster_BasicClass.call(this, i_width, i_height, i_raster_type);
        if (!this.initInstance(this._size, i_raster_type, true)) {
            throw new NyARException();
        }
    },
    initInstance: function(i_size, i_raster_type, i_is_alloc) {
        switch (i_raster_type)
        {
            case NyARBufferType.INT1D_X8R8G8B8_32:
                this._buf = i_is_alloc ? new IntVector(i_size.w * i_size.h) : null;
                this._reader = new NyARRgbPixelReader_INT1D_X8R8G8B8_32(this._buf || new IntVector(1), i_size);
                break;
            case NyARBufferType.BYTE1D_B8G8R8X8_32:
            case NyARBufferType.BYTE1D_R8G8B8_24:
            default:
                return false;
        }
        this._is_attached_buffer = i_is_alloc;
        return true;
    },
    getRgbPixelReader: function() {
        return this._reader;
    },
    getBuffer: function() {
        return this._buf;
    },
    hasBuffer: function() {
        return this._buf != null;
    },
    wrapBuffer: function(i_ref_buf) {
        NyAS3Utils.assert(!this._is_attached_buffer); // buffer not work if is attached.
        this._buf = i_ref_buf;
        this._reader.switchBuffer(i_ref_buf); // switch the reference buffer of pixels leader.
    }
});

NyARRgbRaster_Canvas2D = ASKlass("NyARRgbRaster_Canvas2D", NyARRgbRaster_BasicClass, {
    _canvas: null,
    _rgb_reader: null,
    NyARRgbRaster_Canvas2D: function(canvas) {
        NyARRgbRaster_BasicClass.initialize.call(this, canvas.width, canvas.height, NyARBufferType.OBJECT_JS_Canvas);
        this._canvas = canvas;
        this._rgb_reader = new NyARRgbPixelReader_Canvas2D(this._canvas);
    },
    getRgbPixelReader: function() {
        return this._rgb_reader;
    },
    getBuffer: function() {
        return this._canvas;
    },
    hasBuffer: function() {
        return this._bitmapData != null;
    }
});
