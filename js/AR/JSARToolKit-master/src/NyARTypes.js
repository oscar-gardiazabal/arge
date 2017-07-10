
INyARDoubleMatrix = Klass({
    // set matrix to the contents of the array.
    // not use too much because it slow
    setValue: function(o_value) {
    }, // double[]

    // return array of the contents of the matrix.
    // not use too much because it slow.
    getValue: function(o_value) {
    } // double[]
});

NyARDoubleMatrix22 = Klass(INyARDoubleMatrix, {
    m00: 0,
    m01: 0,
    m10: 0,
    m11: 0,
    setValue: function(i_value) { // not use it so much slower
        this.m00 = i_value[0];
        this.m01 = i_value[1];
        this.m10 = i_value[3];
        this.m11 = i_value[4];
        return;
    }
    ,
    getValue: function(o_value) { // not use it so much slower
        o_value[0] = this.m00;
        o_value[1] = this.m01;
        o_value[3] = this.m10;
        o_value[4] = this.m11;
        return;
    }
    ,
    inverse: function(i_src) {
        var a11, a12, a21, a22;
        a11 = i_src.m00;
        a12 = i_src.m01;
        a21 = i_src.m10;
        a22 = i_src.m11;
        var det = a11 * a22 - a12 * a21;
        if (det == 0) {
            return false;
        }
        det = 1 / det;
        this.m00 = a22 * det;
        this.m01 = -a12 * det;
        this.m10 = -a21 * det;
        this.m11 = a11 * det;
        return true;
    }
});

NyARDoubleMatrix33 = Klass(INyARDoubleMatrix, {
    m00: 0,
    m01: 0,
    m02: 0,
    m10: 0,
    m11: 0,
    m12: 0,
    m20: 0,
    m21: 0,
    m22: 0,
    createArray: function(i_number) {
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++)
        {
            ret[i] = new NyARDoubleMatrix33();
        }
        return ret;
    }
    ,
    setValue: function(i_value) { // not use it so much slower
        this.m00 = i_value[0];
        this.m01 = i_value[1];
        this.m02 = i_value[2];
        this.m10 = i_value[3];
        this.m11 = i_value[4];
        this.m12 = i_value[5];
        this.m20 = i_value[6];
        this.m21 = i_value[7];
        this.m22 = i_value[8];
        return;
    }
    ,
    setValue_NyARDoubleMatrix33: function(i_value) {
        this.m00 = i_value.m00;
        this.m01 = i_value.m01;
        this.m02 = i_value.m02;
        this.m10 = i_value.m10;
        this.m11 = i_value.m11;
        this.m12 = i_value.m12;
        this.m20 = i_value.m20;
        this.m21 = i_value.m21;
        this.m22 = i_value.m22;
        return;
    }
    ,
    getValue: function(o_value) { // not use it so much slower
        o_value[0] = this.m00;
        o_value[1] = this.m01;
        o_value[2] = this.m02;
        o_value[3] = this.m10;
        o_value[4] = this.m11;
        o_value[5] = this.m12;
        o_value[6] = this.m20;
        o_value[7] = this.m21;
        o_value[8] = this.m22;
        return;
    }
    ,
    inverse: function(i_src) {
        var a11, a12, a13, a21, a22, a23, a31, a32, a33;
        var b11, b12, b13, b21, b22, b23, b31, b32, b33;
        a11 = i_src.m00;
        a12 = i_src.m01;
        a13 = i_src.m02;
        a21 = i_src.m10;
        a22 = i_src.m11;
        a23 = i_src.m12;
        a31 = i_src.m20;
        a32 = i_src.m21;
        a33 = i_src.m22;

        b11 = a22 * a33 - a23 * a32;
        b12 = a32 * a13 - a33 * a12;
        b13 = a12 * a23 - a13 * a22;

        b21 = a23 * a31 - a21 * a33;
        b22 = a33 * a11 - a31 * a13;
        b23 = a13 * a21 - a11 * a23;

        b31 = a21 * a32 - a22 * a31;
        b32 = a31 * a12 - a32 * a11;
        b33 = a11 * a22 - a12 * a21;

        var det_1 = a11 * b11 + a21 * b12 + a31 * b13;
        if (det_1 == 0) {
            return false;
        }
        det_1 = 1 / det_1;

        this.m00 = b11 * det_1;
        this.m01 = b12 * det_1;
        this.m02 = b13 * det_1;

        this.m10 = b21 * det_1;
        this.m11 = b22 * det_1;
        this.m12 = b23 * det_1;

        this.m20 = b31 * det_1;
        this.m21 = b32 * det_1;
        this.m22 = b33 * det_1;

        return true;
    }
    // This function returns a value between,0-PI
    ,
    getZXYAngle: function(o_out) {
        var sina = this.m21;
        if (sina >= 1.0) {
            o_out.x = Math.PI / 2;
            o_out.y = 0;
            o_out.z = Math.atan2(-this.m10, this.m00);
        } else if (sina <= -1.0) {
            o_out.x = -Math.PI / 2;
            o_out.y = 0;
            o_out.z = Math.atan2(-this.m10, this.m00);
        } else {
            o_out.x = Math.asin(sina);
            o_out.z = Math.atan2(-this.m01, this.m11);
            o_out.y = Math.atan2(-this.m20, this.m22);
        }
    }
    ,
    setZXYAngle_NyARDoublePoint3d: function(i_angle) {
        this.setZXYAngle_Number(i_angle.x, i_angle.y, i_angle.z);
        return;
    }
    ,
    setZXYAngle_Number: function(i_x, i_y, i_z) {
        var sina = Math.sin(i_x);
        var cosa = Math.cos(i_x);
        var sinb = Math.sin(i_y);
        var cosb = Math.cos(i_y);
        var sinc = Math.sin(i_z);
        var cosc = Math.cos(i_z);
        this.m00 = cosc * cosb - sinc * sina * sinb;
        this.m01 = -sinc * cosa;
        this.m02 = cosc * sinb + sinc * sina * cosb;
        this.m10 = sinc * cosb + cosc * sina * sinb;
        this.m11 = cosc * cosa;
        this.m12 = sinc * sinb - cosc * sina * cosb;
        this.m20 = -cosa * sinb;
        this.m21 = sina;
        this.m22 = cosb * cosa;
        return;
    }
    ,
    // coordinate transformation to adapt the rotation matrix
    transformVertex_NyARDoublePoint3d: function(i_position, o_out) {
        transformVertex_double(i_position.x, i_position.y, i_position.z, o_out);
        return;
    }
    ,
    transformVertex_double: function(i_x, i_y, i_z, o_out) {
        o_out.x = this.m00 * i_x + this.m01 * i_y + this.m02 * i_z;
        o_out.y = this.m10 * i_x + this.m11 * i_y + this.m12 * i_z;
        o_out.z = this.m20 * i_x + this.m21 * i_y + this.m22 * i_z;
        return;
    }
});

NyARDoubleMatrix34 = Klass(INyARDoubleMatrix, {
    m00: 0,
    m01: 0,
    m02: 0,
    m03: 0,
    m10: 0,
    m11: 0,
    m12: 0,
    m13: 0,
    m20: 0,
    m21: 0,
    m22: 0,
    m23: 0,
    setValue: function(i_value) {
        this.m00 = i_value[0];
        this.m01 = i_value[1];
        this.m02 = i_value[2];
        this.m03 = i_value[3];
        this.m10 = i_value[4];
        this.m11 = i_value[5];
        this.m12 = i_value[6];
        this.m13 = i_value[7];
        this.m20 = i_value[8];
        this.m21 = i_value[9];
        this.m22 = i_value[10];
        this.m23 = i_value[11];
        return;
    }
    ,
    setValue_NyARDoubleMatrix34: function(i_value) {
        this.m00 = i_value.m00;
        this.m01 = i_value.m01;
        this.m02 = i_value.m02;
        this.m03 = i_value.m03;
        this.m10 = i_value.m10;
        this.m11 = i_value.m11;
        this.m12 = i_value.m12;
        this.m13 = i_value.m13;
        this.m20 = i_value.m20;
        this.m21 = i_value.m21;
        this.m22 = i_value.m22;
        this.m23 = i_value.m23;
        return;
    }
    ,
    getValue: function(o_value) {
        o_value[0] = this.m00;
        o_value[1] = this.m01;
        o_value[2] = this.m02;
        o_value[3] = this.m03;
        o_value[4] = this.m10;
        o_value[5] = this.m11;
        o_value[6] = this.m12;
        o_value[7] = this.m13;
        o_value[8] = this.m20;
        o_value[9] = this.m21;
        o_value[10] = this.m22;
        o_value[11] = this.m23;
        return;
    }
});

NyARDoubleMatrix44 = Klass(INyARDoubleMatrix, {
    m00: 0,
    m01: 0,
    m02: 0,
    m03: 0,
    m10: 0,
    m11: 0,
    m12: 0,
    m13: 0,
    m20: 0,
    m21: 0,
    m22: 0,
    m23: 0,
    m30: 0,
    m31: 0,
    m32: 0,
    m33: 0,
    createArray: function(i_number) {
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++)
        {
            ret[i] = new NyARDoubleMatrix44();
        }
        return ret;
    }
    ,
    setValue: function(i_value) { // not use it so much slower.
        this.m00 = i_value[ 0];
        this.m01 = i_value[ 1];
        this.m02 = i_value[ 2];
        this.m03 = i_value[ 3];
        this.m10 = i_value[ 4];
        this.m11 = i_value[ 5];
        this.m12 = i_value[ 6];
        this.m13 = i_value[ 7];
        this.m20 = i_value[ 8];
        this.m21 = i_value[ 9];
        this.m22 = i_value[10];
        this.m23 = i_value[11];
        this.m30 = i_value[12];
        this.m31 = i_value[13];
        this.m32 = i_value[14];
        this.m33 = i_value[15];
        return;
    }
    ,
    getValue: function(o_value) { // not use it so much slower.
        o_value[ 0] = this.m00;
        o_value[ 1] = this.m01;
        o_value[ 2] = this.m02;
        o_value[ 3] = this.m03;
        o_value[ 4] = this.m10;
        o_value[ 5] = this.m11;
        o_value[ 6] = this.m12;
        o_value[ 7] = this.m13;
        o_value[ 8] = this.m20;
        o_value[ 9] = this.m21;
        o_value[10] = this.m22;
        o_value[11] = this.m23;
        o_value[12] = this.m30;
        o_value[13] = this.m31;
        o_value[14] = this.m32;
        o_value[15] = this.m33;
        return;
    }
    ,
    inverse: function(i_src) {
        var a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44;
        var b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;
        var t1, t2, t3, t4, t5, t6;
        a11 = i_src.m00;
        a12 = i_src.m01;
        a13 = i_src.m02;
        a14 = i_src.m03;
        a21 = i_src.m10;
        a22 = i_src.m11;
        a23 = i_src.m12;
        a24 = i_src.m13;
        a31 = i_src.m20;
        a32 = i_src.m21;
        a33 = i_src.m22;
        a34 = i_src.m23;
        a41 = i_src.m30;
        a42 = i_src.m31;
        a43 = i_src.m32;
        a44 = i_src.m33;

        t1 = a33 * a44 - a34 * a43;
        t2 = a34 * a42 - a32 * a44;
        t3 = a32 * a43 - a33 * a42;
        t4 = a34 * a41 - a31 * a44;
        t5 = a31 * a43 - a33 * a41;
        t6 = a31 * a42 - a32 * a41;

        b11 = a22 * t1 + a23 * t2 + a24 * t3;
        b21 = -(a23 * t4 + a24 * t5 + a21 * t1);
        b31 = a24 * t6 - a21 * t2 + a22 * t4;
        b41 = -(a21 * t3 - a22 * t5 + a23 * t6);

        t1 = a43 * a14 - a44 * a13;
        t2 = a44 * a12 - a42 * a14;
        t3 = a42 * a13 - a43 * a12;
        t4 = a44 * a11 - a41 * a14;
        t5 = a41 * a13 - a43 * a11;
        t6 = a41 * a12 - a42 * a11;

        b12 = -(a32 * t1 + a33 * t2 + a34 * t3);
        b22 = a33 * t4 + a34 * t5 + a31 * t1;
        b32 = -(a34 * t6 - a31 * t2 + a32 * t4);
        b42 = a31 * t3 - a32 * t5 + a33 * t6;

        t1 = a13 * a24 - a14 * a23;
        t2 = a14 * a22 - a12 * a24;
        t3 = a12 * a23 - a13 * a22;
        t4 = a14 * a21 - a11 * a24;
        t5 = a11 * a23 - a13 * a21;
        t6 = a11 * a22 - a12 * a21;

        b13 = a42 * t1 + a43 * t2 + a44 * t3;
        b23 = -(a43 * t4 + a44 * t5 + a41 * t1);
        b33 = a44 * t6 - a41 * t2 + a42 * t4;
        b43 = -(a41 * t3 - a42 * t5 + a43 * t6);

        t1 = a23 * a34 - a24 * a33;
        t2 = a24 * a32 - a22 * a34;
        t3 = a22 * a33 - a23 * a32;
        t4 = a24 * a31 - a21 * a34;
        t5 = a21 * a33 - a23 * a31;
        t6 = a21 * a32 - a22 * a31;

        b14 = -(a12 * t1 + a13 * t2 + a14 * t3);
        b24 = a13 * t4 + a14 * t5 + a11 * t1;
        b34 = -(a14 * t6 - a11 * t2 + a12 * t4);
        b44 = a11 * t3 - a12 * t5 + a13 * t6;

        var det_1 = (a11 * b11 + a21 * b12 + a31 * b13 + a41 * b14);
        if (det_1 == 0) {
            return false;
        }
        det_1 = 1 / det_1;

        this.m00 = b11 * det_1;
        this.m01 = b12 * det_1;
        this.m02 = b13 * det_1;
        this.m03 = b14 * det_1;

        this.m10 = b21 * det_1;
        this.m11 = b22 * det_1;
        this.m12 = b23 * det_1;
        this.m13 = b24 * det_1;

        this.m20 = b31 * det_1;
        this.m21 = b32 * det_1;
        this.m22 = b33 * det_1;
        this.m23 = b34 * det_1;

        this.m30 = b41 * det_1;
        this.m31 = b42 * det_1;
        this.m32 = b43 * det_1;
        this.m33 = b44 * det_1;

        return true;
    }
});

// Variable-length array of stacked.
// store the entity in the array.

// Notes
// Aimed at limiting breakthrough of Generics of Java, but in Vector. <*>, For trouble is large, the change to. <Object> Vector
// You may receive an error may appear in some places, but in such as compile option,
// strict = be avoided by setting the false.
// Root fix is ​​scheduled to be addressed in the next version or later.
NyARObjectStack = Klass({
    _items: null,
    _length: 0
    ,
    initialize: function(i_length) { // prepare a dynamic buffer allocation of maximum ARRAY_MAX individual.
        // Partitioning
        i_length = toInt(i_length);
        this._items = this.createArray(i_length);
        this._length = 0; //Reset busy number
        return;
    }
    ,
    // Where you decide whether to store what array (Vector).
    // override this function.
    createArray: function(i_length) {
        throw new NyARException();
    }
    ,
    prePush: function() { // reserve a new area (return Null on failure)
        // Allocated as needed
        if (this._length >= this._items.length) {
            return null;
        }
        // To +1 space used, and return the space reservation.
        var ret = this._items[this._length];
        this._length++;
        return ret;
    }
    ,
    // @param i_reserv_length = Size to be used to
    init: function(i_reserv_length) { // initialize the stack.
        // Allocated as needed
        if (i_reserv_length >= this._items.length) {
            throw new NyARException();
        }
        this._length = i_reserv_length;
    }
    ,
    // By reducing the number of elements one of apparent, and returns the object
    // The contents of the object you return is valid until the next push
    pop: function() {
        NyAS3Utils.assert(this._length >= 1);
        this._length--;
        return this._items[this._length];
    }
    ,
    // reduce i_count individual the number of elements of apparent
    pops: function(i_count) {
        NyAS3Utils.assert(this._length >= i_count);
        this._length -= i_count;
        return;
    }
    ,
    // return an array.
    getArray: function() {
        return this._items;
    }

    , getItem: function(i_index) {
        return this._items[i_index];
    }
    ,
    // return the number of elements in the array apparent.
    getLength: function() {
        return this._length;
    }
    ,
    // reset the number of elements of apparent.    
    clear: function() {
        this._length = 0;
    }
});

NyARIntPointStack = Klass(NyARObjectStack, {
    initialize: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new NyARIntPoint2d();
        }
        return ret;
    }
});

// import jp.nyatla.nyartoolkit.as3.core.types.*;
NyARIntRectStack = Klass(/*NyARObjectStack,*/ {
    _items: null,
    _length: null
    ,
    initialize: function(i_length) {
        this._items = this.createArray(i_length); // Partitioning        
        this._length = 0; // Reset busy number
        return;
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new NyARIntRect();
        }
        return ret;
    }
    ,
    // reserve a new area, return Null on failure
    prePush: function() {
        // Allocated as needed
        if (this._length >= this._items.length) {
            return null;
        }
        // To +1 the use area , Returns the space reservation
        var ret = this._items[this._length];
        this._length++;
        return ret;
    }
    ,
    // @param i_reserv_length = Size to be used to
    init: function(i_reserv_length) { // initialize the stack        
        if (i_reserv_length >= this._items.length) { // Allocated as needed
            throw new NyARException();
        }
        this._length = i_reserv_length;
    }
    ,
    // By reducing the number of elements one of apparent, and returns the object
    // The contents of the object you return is valid until the next push
    pop: function() {
        NyAS3Utils.assert(this._length >= 1);
        this._length--;
        return this._items[this._length];
    }
    ,
    pops: function(i_count) { // reduce i_count individual the number of elements of apparent.
        NyAS3Utils.assert(this._length >= i_count);
        this._length -= i_count;
        return;
    }
    ,
    getArray: function() { // return an array.
        return this._items;
    }
    ,
    getItem: function(i_index) {
        return this._items[i_index];
    }
    ,
    getLength: function() { // return the number of elements in the array apparent
        return this._length;
    }
    ,
    clear: function() { // reset the number of elements of apparent.
        this._length = 0;
    }
});

NyARBufferType = Klass((
        function() {
            var T_BYTE1D = 0x00010000;
            var T_INT2D = 0x00020000;
            var T_SHORT1D = 0x00030000;
            var T_INT1D = 0x00040000;
            var T_OBJECT = 0x00100000;
            var T_USER = 0x00FF0000;

            return ({
                //  24-31(8) Reservation
                //  16-27(8) Type ID
                //      00:Disable/01[]/02[][]/03[]
                //  08-15(8)ビットフォーマットID
                //      00/01/02
                //  00-07(8)Model number

                NULL_ALLZERO: 0x00000001, // In RGB24 format, all the pixels 0

                USER_DEFINE: T_USER, // USER - USER + 0xFFFF is user-defined type. For experimentation.

                BYTE1D_R8G8B8_24: T_BYTE1D | 0x0001, // Pixels stored in 24-bit R8G8B8 (byte[])

                BYTE1D_B8G8R8_24: T_BYTE1D | 0x0002, // Pixels stored in 24-bit B8G8R8 (byte[])

                BYTE1D_B8G8R8X8_32: T_BYTE1D | 0x0101, // Pixels stored in 32-bit R8G8B8X8 (byte[])

                BYTE1D_X8R8G8B8_32: T_BYTE1D | 0x0102, // Pixels stored in 32-bit X8R8G8B8 (byte[])

                // Pixels stored in a (little / big endian) 16-bit RGB565 (byte[])
                BYTE1D_R5G6B5_16LE: T_BYTE1D | 0x0201,
                BYTE1D_R5G6B5_16BE: T_BYTE1D | 0x0202,
                //Pixels are stored in a (little / big endian) 16-bit RGB565 (byte[])
                WORD1D_R5G6B5_16LE: T_SHORT1D | 0x0201,
                WORD1D_R5G6B5_16BE: T_SHORT1D | 0x0202,
                INT2D: T_INT2D | 0x0000, // In it does not define the value range in particular (int[][])

                INT2D_GRAY_8: T_INT2D | 0x0001, // In gray scale image of 0-255 (int[][])

                // This is the same tone value of BUFFERFORMAT_INT2D_GRAY_1 1bit.
                INT2D_BIN_8: T_INT2D | 0x0002, // In the binary image of the 0/1 (int[][])

                INT1D: T_INT1D | 0x0000, // In it does not define the value range in particular (int[])

                INT1D_GRAY_8: T_INT1D | 0x0001, // In gray scale image of 0-255 (int[])

                // This is the same tone of INT1D_GRAY_1 1bit
                INT1D_BIN_8: T_INT1D | 0x0002, // In the binary image of the 0/1 (int[])

                INT1D_X8R8G8B8_32: T_INT1D | 0x0102, // Pixels are stored in 32-bit XRGB32 (int[])

                INT1D_X7H9S8V8_32: T_INT1D | 0x0103, // H(0-359),S(0-255),V(0-255)

                // Platform-specific object
                OBJECT_Java: T_OBJECT | 0x0100,
                OBJECT_CS: T_OBJECT | 0x0200,
                OBJECT_AS3: T_OBJECT | 0x0300,
                OBJECT_JS: T_OBJECT | 0x0400,
                // Raster that contains the BufferedImage of Java
                OBJECT_Java_BufferedImage: T_OBJECT | 0x0100 | 0x01,
                OBJECT_AS3_BitmapData: T_OBJECT | 0x0300 | 0x01,
                // Raster that contains the Canvas and JavaScript
                OBJECT_JS_Canvas: T_OBJECT | 0x0400 | 0x01
            });
        }
)());

NyARDoublePoint2d = Klass({
    x: 0,
    y: 0
    ,
    createArray: function(i_number) { // Array factory
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++)
        {
            ret[i] = new NyARDoublePoint2d();
        }
        return ret;
    }
    ,
    initialize: function() {
        switch (arguments.length) {
            case 0:
                { //public function NyARDoublePoint2d()
                    this.x = 0;
                    this.y = 0;
                }
                return;
            case 1:
                this.x = args[0].x;
                this.y = args[0].y;
                return;
                break;
            case 2:
                { //public function NyARDoublePoint2d(i_x,i_y)
                    this.x = Number(args[0]);
                    this.y = Number(args[1]);
                    return;
                }
            default:
                break;
        }
        throw new NyARException();
    }
    ,
    setValue_NyARDoublePoint2d: function(i_src) {
        this.x = i_src.x;
        this.y = i_src.y;
        return;
    }
    ,
    setValue_NyARIntPoint2d: function(i_src) {
        this.x = (i_src.x);
        this.y = (i_src.y);
        return;
    }
    ,
    dist: function() { // As vectors stored value, return the distance
        return Math.sqrt(this.x * this.x + this.y + this.y);
    }
    ,
    sqNorm: function() {
        return this.x * this.x + this.y + this.y;
    }
});

NyARDoublePoint3d = Klass({
    x: 0,
    y: 0,
    z: 0,
    createArray: function(i_number) { // Array factory
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++)
        {
            ret[i] = new NyARDoublePoint3d();
        }
        return ret;
    }
    ,
    setValue: function(i_in) {
        this.x = i_in.x;
        this.y = i_in.y;
        this.z = i_in.z;
        return;
    }
    ,
    // calculate the distance from the vector of the i_point    
    dist: function(i_point) {
        var x, y, z;
        x = this.x - i_point.x;
        y = this.y - i_point.y;
        z = this.z - i_point.z;
        return Math.sqrt(x * x + y * y + z * z);
    }
});


NyARHistogram = Klass({// It is a class that contains a histogram.    
    data: null, // Storage variable of the sampling values    
    length: 0, // The range of valid sampling value. [0-data.length-1]
    total_of_data: 0, // The total number of valid data sample [i]

    initialize: function(i_length) {
        this.data = new FloatVector(i_length);
        this.length = i_length;
        this.total_of_data = 0;
    }
    ,
    // return the total number of data from the interval to i_ed i_st    
    getTotal: function(i_st, i_ed) {
        NyAS3Utils.assert(i_st < i_ed && i_ed < this.length);
        var result = 0;
        var s = this.data;
        for (var i = i_st; i <= i_ed; i++) {
            result += s[i];
        }
        return result;
    }
    ,
    lowCut: function(i_pos) { // Then to 0 i_pos less than sample that you specify
        var s = 0;
        for (var i = 0; i < i_pos; i++) {
            s += this.data[i];
            this.data[i] = 0;
        }
        this.total_of_data -= s;
    }
    ,
    highCut: function(i_pos) { // Turn 0 of the sample i_pos greater than or equal to the specified.
        var s = 0;
        for (var i = this.length - 1; i >= i_pos; i--) {
            s += this.data[i];
            this.data[i] = 0;
        }
        this.total_of_data -= s;
    }
    ,
    getMinSample: function() { // return the sample number of the minimum value is stored.
        var data = this.data;
        var ret = this.length - 1;
        var min = data[ret];
        for (var i = this.length - 2; i >= 0; i--) {
            if (data[i] < min) {
                min = data[i];
                ret = i;
            }
        }
        return ret;
    }
    ,
    getMinData: function() { // return the value of the smallest of the sample.
        return this.data[this.getMinSample()];
    }
    ,
    getAverage: function() { // calculate the average value.
        var sum = 0;
        for (var i = this.length - 1; i >= 0; i--) {
            sum += this.data[i] * i;
        }
        return toInt(sum / this.total_of_data);
    }

});

NyARIntPoint2d = Klass({
    x: 0,
    y: 0,
    /**
     * 配列ファクトリ
     * @param i_number
     * @return
     */
    createArray: function(i_number)
    {
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++)
        {
            ret[i] = new NyARIntPoint2d();
        }
        return ret;
    }
    , copyArray: function(i_from, i_to)
    {
        for (var i = i_from.length - 1; i >= 0; i--)
        {
            i_to[i].x = i_from[i].x;
            i_to[i].y = i_from[i].y;
        }
        return;
    }
});

NyARIntRect = Klass({
    x: 0,
    y: 0,
    w: 0,
    h: 0
})

NyARIntSize = Klass({
    h: 0,
    w: 0,
    //	public function NyARIntSize()
    // 	public function NyARIntSize(i_width,i_height)
    //	public function NyARIntSize(i_ref_object)
    initialize: function() {
        switch (arguments.length) {
            case 0:
                { //public function NyARIntSize()
                    this.w = 0;
                    this.h = 0;
                    return;
                }
            case 1:
                this.w = arguments[0].w;
                this.h = arguments[0].h;
                return;
                break;
            case 2:
                { //public function NyARIntSize(i_ref_object)
                    this.w = toInt(arguments[0]);
                    this.h = toInt(arguments[1]);
                    return;
                }
                break;
            default:
                break;
        }
        throw new NyARException();
    },
    isEqualSize_int: function(i_width, i_height) { // confirm size is either identical.
        if (i_width == this.w && i_height == this.h) {
            return true;
        }
        return false;
    }
    ,
    isEqualSize_NyARIntSize: function(i_size) { // confirm size is either identical.
        if (i_size.w == this.w && i_size.h == this.h) {
            return true;
        }
        return false;
    }
});

// store the parameters: 0=dx*x+dy*y+c 
// increasing direction of x, y and x = L → R, y = B → T
NyARLinear = Klass({
    dx: 0, // increase the amount of dx axis
    dy: 0, // increase the amount of dy-axis
    c: 0, // Section
    createArray: function(i_number) {
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++)
        {
            ret[i] = new NyARLinear();
        }
        return ret;
    }
    , copyFrom: function(i_source) {
        this.dx = i_source.dx;
        this.dy = i_source.dy;
        this.c = i_source.c;
        return;
    }
    ,    
    crossPos: function(l_line_i, l_line_2, o_point) { // calculate the intersection of two straight lines.
        var w1 = l_line_2.dy * l_line_i.dx - l_line_i.dy * l_line_2.dx;
        if (w1 == 0.0) {
            return false;
        }
        o_point.x = (l_line_2.dx * l_line_i.c - l_line_i.dx * l_line_2.c) / w1;
        o_point.y = (l_line_i.dy * l_line_2.c - l_line_2.dy * l_line_i.c) / w1;
        return true;
    }
});
