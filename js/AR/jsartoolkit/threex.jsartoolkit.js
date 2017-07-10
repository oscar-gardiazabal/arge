
ASVector = function(elements) {
    elements = elements || 0;
    if (elements.length) {
        this.length = elements.length;
        for (var i = 0; i < elements.length; i++)
            this[i] = elements[i];
    } else {
        this.length = elements;
        for (var i = 0; i < elements; i++)
            this[i] = 0;
    }
};
ASVector.prototype = {};
ASVector.prototype.set = function(idx, val) {
    if (idx.length)
        ASVector.call(this, idx);
    else
        this[idx] = val;
};
if (typeof Float32Array == 'undefined') {
    FloatVector = ASVector;
    IntVector = ASVector;
    UintVector = ASVector;
} else {
    FloatVector = Float32Array;
    IntVector = Int32Array;
    UintVector = Uint32Array;
}

toInt = Math.floor;
Object.extend = function(dst, src) {
    for (var i in src) {
        try {
            dst[i] = src[i];
        } catch (e) {
        }
    }
    return dst;
};
toArray = function(obj) {
    var a = new Array(obj.length);
    for (var i = 0; i < obj.length; i++)
        a[i] = obj[i];
    return a;
};
Klass = (function() {
    var c = function() {
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };
    c.ancestors = toArray(arguments);
    c.prototype = {};
    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        if (a.prototype) {
            Object.extend(c.prototype, a.prototype);
        } else {
            Object.extend(c.prototype, a);
        }
    }
    Object.extend(c, c.prototype);
    return c;
});
Object.asCopy = function(obj) {
    if (typeof obj != 'object') {
        return obj;
    } else if (obj instanceof FloatVector) {
        var v = new FloatVector(obj.length);
        for (var i = 0; i < v.length; i++)
            v[i] = obj[i];
        return v;
    } else if (obj instanceof IntVector) {
        var v = new IntVector(obj.length);
        for (var i = 0; i < v.length; i++)
            v[i] = obj[i];
        return v;
    } else if (obj instanceof UintVector) {
        var v = new UintVector(obj.length);
        for (var i = 0; i < v.length; i++)
            v[i] = obj[i];
        return v;
    } else if (obj instanceof Array) {
        return obj.map(Object.asCopy);
    } else {
        var newObj = {};
        for (var i in obj) {
            var v = obj[i];
            if (typeof v == 'object') {
                v = Object.asCopy(v);
            }
            newObj[i] = v;
        }
        return newObj;
    }
};
ASKlass = (function(name) {
    var c = function() {
        var cc = this.__copyObjects__;
        for (var i = 0; i < cc.length; i++)
            this[cc[i]] = Object.asCopy(this[cc[i]])
        if (this.initialize)
            this.initialize.apply(this, arguments);
    }
    c.ancestors = toArray(arguments).slice(1);
    c.prototype = {};
    for (var i = 1; i < arguments.length; i++) {
        var a = arguments[i];
        if (a.prototype) {
            Object.extend(c.prototype, a.prototype);
        } else {
            Object.extend(c.prototype, a);
        }
    }
    c.prototype.className = name;
    c.prototype.initialize = c.prototype[name];
    c.prototype.__copyObjects__ = [];
    for (var i in c.prototype) {
        var v = c.prototype[i];
        if (i != '__copyObjects__') {
            if (typeof v == 'object') {
                c.prototype.__copyObjects__.push(i);
            }
        }
    }
    Object.extend(c, c.prototype);
    return c;
});
// partial implementation of the ActionScript3 BitmapData class
// See: http://www.adobe.com/livedocs/flash/9.0/ActionScriptLangRefV3/flash/display/BitmapData.html
BitmapData = Klass({
    initialize: function(i_width, i_height, transparent, fill) {
        this.width = i_width;
        this.height = i_height;
        this.transparent = (transparent == null ? true : transparent);
        this.fill = (fill == null ? 0xffffffff : fill);
        this.data = new UintVector(i_width * i_height);
        for (var i = 0; i < this.data.length; i++) {
            this.data[i] = fill;
        }
        this.rect = new Rectangle(0, 0, this.width, this.height);
    }
    ,
    fillRect: function(rect, value) {
        var stride = this.width;
        var y = Math.clamp(rect.y, 0, this.height) * stride
                , y2 = Math.clamp(rect.y + rect.height, 0, this.height) * stride
                , x = Math.clamp(rect.x, 0, this.width)
                , x2 = Math.clamp(rect.x + rect.width, 0, this.width);
        var d = this.data;
        for (var y1 = y; y1 < y2; y1 += stride)
            for (var x1 = x; x1 < x2; x1++)
                d[y1 + x1] = value;
    }
    ,
    getPixel: function(x, y) {
        return this.data[y * this.width + x] & 0x00ffffff;
    }
    ,
    setPixel: function(x, y, v) {
        return this.data[y * this.width + x] = v | (this.data[y * this.width + x] & 0xff000000);
    }
    ,
    putImageData: function(imageData, x, y, w, h) {
        w = Math.clamp(w, 0, imageData.width), h = Math.clamp(h, 0, imageData.height);
        var stride = this.width;
        var d = this.data;
        var td = imageData.data;
        var y = Math.clamp(y, 0, this.height) * stride
                , y2 = Math.clamp(y + h, 0, this.height) * stride
                , x = Math.clamp(x, 0, this.width)
                , x2 = Math.clamp(x + w, 0, this.width);
        for (var y1 = y, ty1 = 0; y1 < y2; y1 += stride, ty1 += imageData.width * 4) {
            for (var x1 = x, tx1 = 0; x1 < x2; x1++, tx1 += 4) {
                d[y1 + x1] = (// transform canvas pixel to 32-bit ARGB int
                        (td[ty1 + tx1] << 16) |
                        (td[ty1 + tx1 + 1] << 8) |
                        (td[ty1 + tx1 + 2]) |
                        (td[ty1 + tx1 + 3] << 24)
                        );
            }
        }
    }
    ,
    drawOnCanvas: function(canvas) {
        var ctx = canvas.getContext('2d');
        var id = ctx.getImageData(0, 0, this.width, this.height);
        var stride = this.width;
        var length = this.height * stride;
        var d = this.data;
        var td = id.data;
        for (var y = 0; y < length; y += stride) {
            for (var x = 0; x < stride; x++) {
                var base = 4 * (y + x);
                var c = d[y + x];
                td[base] = (c >> 16) & 0xff;
                td[++base] = (c >> 8) & 0xff;
                td[++base] = (c) & 0xff;
                td[++base] = (c >> 24) & 0xff;
            }
        }
        ctx.putImageData(id, 0, 0);
    }
});
Rectangle = Klass({
    initialize: function(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.top = y;
        this.left = x;
        this.bottom = y + h;
        this.right = x + w;
        this.width = w;
        this.height = h;
    }
});
NyARException = Klass(Error, {// The Exception object used by NyARToolkit.
    initialize: function(m) {
        Error.call(this, m);
    },
    trap: function(m) {
        throw new NyARException("trap:" + m);
    },
    notImplement: function() {
        throw new NyARException("Not Implement!");
    }
});
NyAS3Utils = Klass({
    assert: function(e, mess) {
        if (!e) {
            throw new Error("NyAS3Utils.assert:" + mess != null ? mess : "");
        }
    }
});
// Class typedef struct corresponding to ARMat structure {double * m; int row; int clm;} ARMat;
NyARMat = Klass({
    // Matrix size and array size is not to use it as the size of the matrix the size of the array returned note may not always agree!
    m: null,
    __matrixSelfInv_nos: null,
    clm: null,
    row: null,
    initialize: function(i_row, i_clm) {
        this.m = new Array(i_row);
        for (var i = 0; i < i_row; i++) {
            this.m[i] = new FloatVector(i_clm);
            for (var j = 0; j < i_clm; j++)
                this.m[i][j] = 0.0;
        }
        this.__matrixSelfInv_nos = new FloatVector(i_row);
        this.clm = i_clm;
        this.row = i_row;
        return;
    }
    ,
    matrixSelfInv: function() { // By calculating the inverse matrix, and stores to this

        var ap = this.m;
        var dimen = this.row;
        var dimen_1 = dimen - 1;
        var ap_n, ap_ip, ap_i; // wap;
        var j, ip, nwork;
        var nos = this.__matrixSelfInv_nos; //Work variable
        // double epsl
        var p, pbuf, work;
        // check size
        switch (dimen) {
            case 0:
                throw new NyARException();
            case 1:
                ap[0][0] = 1.0 / ap[0][0]; // *ap = 1.0 / (*ap);
                return true; // 1 dimension 
        }
        var n;
        for (n = 0; n < dimen; n++) {
            nos[n] = n;
        }

        //Insert because there are cases where the calculation is performed in is not determined nyatla memo ip. 
        //I do not know whether you want to 0 initialization in a loop.
        ip = 0;
        // For. order change ban
        for (n = 0; n < dimen; n++) {
            ap_n = ap[n]; // wcp = ap + n * rowa;
            p = 0.0;
            for (var i = n; i < dimen; i++) {
                if (p < (pbuf = Math.abs(ap[i][0]))) {
                    p = pbuf;
                    ip = i;
                }
            }
            // if (p <= matrixSelfInv_epsl){
            if (p == 0.0) {
                return false;
                // throw new NyARException();
            }

            nwork = nos[ip];
            nos[ip] = nos[n];
            nos[n] = nwork;
            ap_ip = ap[ip];
            for (j = 0; j < dimen; j++) {// for(j = 0, wap = ap + ip * rowa,
                // wbp = wcp; j < dimen ; j++) {
                work = ap_ip[j]; // work = *wap;
                ap_ip[j] = ap_n[j];
                ap_n[j] = work;
            }

            work = ap_n[0];
            for (j = 0; j < dimen_1; j++) {
                ap_n[j] = ap_n[j + 1] / work; // *wap = *(wap + 1) / work;
            }
            ap_n[j] = 1.0 / work; // *wap = 1.0 / work;
            for (i = 0; i < dimen; i++) {
                if (i != n) {
                    ap_i = ap[i]; // wap = ap + i * rowa;
                    work = ap_i[0];
                    for (j = 0; j < dimen_1; j++) {// for(j = 1, wbp = wcp,work = *wap;j < dimen ;j++, wap++, wbp++)
                        ap_i[j] = ap_i[j + 1] - work * ap_n[j]; // wap = *(wap +1) - work *(*wbp);
                    }
                    ap_i[j] = -work * ap_n[j]; // *wap = -work * (*wbp);
                }
            }
        }

        for (n = 0; n < dimen; n++) {
            for (j = n; j < dimen; j++) {
                if (nos[j] == n) {
                    break;
                }
            }
            nos[j] = nos[n];
            for (i = 0; i < dimen; i++) {
                ap_i = ap[i];
                work = ap_i[j]; // work = *wap;
                ap_i[j] = ap_i[n]; // *wap = *wbp;
                ap_i[n] = work; // *wbp = work;
            }
        }
        return true;
    }
});
ArrayUtil = ASKlass('ArrayUtil', {
    createJaggedArray: function(len) {
        var arr = new Array(len);
        var args = toArray(arguments).slice(1);
        while (len--) {
            arr[len] = args.length ? this.createJaggedArray.apply(null, args) : 0;
        }
        return arr;
    }
});

FLARMat = NyARMat;
FLARGrayPixelReader_BitmapData = ASKlass('FLARGrayPixelReader_BitmapData', {
    _ref_bitmap: null
    ,
    FLARGrayPixelReader_BitmapData: function(i_buffer) {
        this._ref_bitmap = i_buffer;
    }
    ,
    getPixel: function(i_x, i_y, i_num, o_gray) {
        NyARException.notImplement();
        var w = this._ref_bitmap.width;
        var d = this._ref_bitmap._buf;
        o_gray[0] = o_gray[1] = o_gray[2] = ~d(i_x + w * i_y) & 0xff;
    }
    ,
    getPixelSet: function(i_x, i_y, i_num, o_gray) {
        var w = this._ref_bitmap.width;
        var d = this._ref_bitmap.data;
        for (var i = 0; i < i_num; i++) {
            if (window.DEBUG) {
                var cv = document.getElementById('debugCanvas').getContext('2d');
                cv.fillRect(i_x[i] - 1, i_y[i] - 1, 2, 2); //TroLL
            }
            o_gray[i] = ~d[i_x[i] + w * i_y[i]] & 0xff;
        }
    }
});
NyARPca2d_MatrixPCA_O2 = ASKlass('NyARPca2d_MatrixPCA_O2', {
    PCA_EPS: 1e-6, // #define EPS 1e-6
    PCA_MAX_ITER: 100, // #define MAX_ITER 100
    PCA_VZERO: 1e-16, // #define VZERO 1e-16
    PCA_QRM: function(o_matrix, dv) { // static int QRM( ARMat *a, ARVec *dv ) (alternate function)
        var w, t, s, x, y, c;
        var ev1;
        var dv_x, dv_y;
        var mat00, mat01, mat10, mat11;
        // this.vecTridiagonalize2d(i_mat, dv, ev)
        dv_x = o_matrix.m00; // this.m[dim - 2][dim - 2];// d.v[dim-2]=a.m[dim-2][dim-2];//d->v[dim-2]=a->m[(dim-2)*dim+(dim-2)];
        ev1 = o_matrix.m01; // this.m[dim - 2][dim - 1];// e.v[dim-2+i_e_start]=a.m[dim-2][dim-1];//e->v[dim-2] = a->m[(dim-2)*dim+(dim-1)];
        dv_y = o_matrix.m11; // this.m[dim - 1][dim - 1];// d.v[dim-1]=a_array[dim-1][dim-1];//d->v[dim-1] =a->m[(dim-1)*dim+(dim-1)];
        // unit matrix
        mat00 = mat11 = 1;
        mat01 = mat10 = 0;
        var iter = 0;
        do {
            iter++;
            if (iter > this.PCA_MAX_ITER) {
                break;
            }
            w = (dv_x - dv_y) / 2;
            t = ev1 * ev1;
            s = Math.sqrt(w * w + t);
            if (w < 0) {
                s = -s;
            }
            x = dv_x - dv_y + t / (w + s);
            y = ev1;
            if (Math.abs(x) >= Math.abs(y)) {
                if (Math.abs(x) > this.PCA_VZERO) {
                    t = -y / x;
                    c = 1 / Math.sqrt(t * t + 1);
                    s = t * c;
                } else {
                    c = 1.0;
                    s = 0.0;
                }
            } else {
                t = -x / y;
                s = 1.0 / Math.sqrt(t * t + 1);
                c = t * s;
            }
            w = dv_x - dv_y;
            t = (w * s + 2 * c * ev1) * s;
            dv_x -= t;
            dv_y += t;
            ev1 += s * (c * w - 2 * s * ev1);
            x = mat00;
            y = mat10;
            mat00 = c * x - s * y;
            mat10 = s * x + c * y;
            x = mat01;
            y = mat11;
            mat01 = c * x - s * y;
            mat11 = s * x + c * y;
        } while (Math.abs(ev1) > this.PCA_EPS * (Math.abs(dv_x) + Math.abs(dv_y)));
        t = dv_x;
        if (dv_y > t) {
            t = dv_y;
            dv_y = dv_x;
            dv_x = t;
            // Replacement of the line
            o_matrix.m00 = mat10;
            o_matrix.m01 = mat11;
            o_matrix.m10 = mat00;
            o_matrix.m11 = mat01;
        } else {
            // No replacement of line
            o_matrix.m00 = mat00;
            o_matrix.m01 = mat01;
            o_matrix.m10 = mat10;
            o_matrix.m11 = mat11;
        }
        dv[0] = dv_x;
        dv[1] = dv_y;
        return;
    }
    ,
    PCA_PCA: function(i_v1, i_v2, i_number_of_data, o_matrix, o_ev, o_mean) { //Static int PCA (ARMat * input, ARMat * output, ARVec * ev) 
        var i;
        // double[] mean_array=mean._items; 
        // mean.zeroClear();
        //PCA_Processing of EX
        var sx = 0;
        var sy = 0;
        for (i = 0; i < i_number_of_data; i++) {
            sx += i_v1[i];
            sy += i_v2[i];
        }
        sx = sx / i_number_of_data;
        sy = sy / i_number_of_data;
        // processing together PCA_xt_by_x and PCA_CENTER
        var srow = Math.sqrt((i_number_of_data));
        var w00, w11, w10;
        w00 = w11 = w10 = 0.0; // *out = 0.0;
        for (i = 0; i < i_number_of_data; i++) {
            var x = (i_v1[i] - sx) / srow;
            var y = (i_v2[i] - sy) / srow;
            w00 += (x * x); // *out += *in1 * *in2;
            w10 += (x * y); // *out += *in1 * *in2;
            w11 += (y * y); // *out += *in1 * *in2;
        }
        o_matrix.m00 = w00;
        o_matrix.m01 = o_matrix.m10 = w10;
        o_matrix.m11 = w11;
        // Processing of PCA_PCA
        this.PCA_QRM(o_matrix, o_ev);
        // m2 = o_output.m;// m2 = output->m;
        if (o_ev[0] < this.PCA_VZERO) {// if( ev->v[i] < VZERO ){
            o_ev[0] = 0.0; // ev->v[i] = 0.0;
            o_matrix.m00 = 0.0; // *(m2++) = 0.0;
            o_matrix.m01 = 0.0; // *(m2++) = 0.0;
        }
        if (o_ev[1] < this.PCA_VZERO) {// if( ev->v[i] < VZERO ){
            o_ev[1] = 0.0; // ev->v[i] = 0.0;
            o_matrix.m10 = 0.0; // *(m2++) = 0.0;
            o_matrix.m11 = 0.0; // *(m2++) = 0.0;
        }
        o_mean[0] = sx;
        o_mean[1] = sy;
        return;
    }
    ,
    pca: function(i_v1, i_v2, i_number_of_point, o_evec, o_ev, o_mean) {
        this.PCA_PCA(i_v1, i_v2, i_number_of_point, o_evec, o_ev, o_mean);
        var sum = o_ev[0] + o_ev[1];
        // For order change ban
        o_ev[0] /= sum; // ev->v[i] /= sum;
        o_ev[1] /= sum; // ev->v[i] /= sum;
        return;
    }
});
NyARRgbPixelReader_Canvas2D = ASKlass("NyARRgbPixelReader_Canvas2D", {
    _ref_canvas: null,
    _data: null
    ,
    NyARRgbPixelReader_Canvas2D: function(i_canvas) {
        this._ref_canvas = i_canvas;
    }
    ,
    getData: function() {
        if (this._ref_canvas.changed || !this._data) {
            var canvas = this._ref_canvas;
            var ctx = canvas.getContext('2d');
            this._data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this._ref_canvas.changed = false;
        }
        return this._data;
    }
    ,
    getPixel: function(i_x, i_y, o_rgb) {
        var idata = this.getData();
        var w = idata.width;
        var h = idata.height;
        var d = idata.data;
        o_rgb[0] = d[i_y * w + i_x]; // R
        o_rgb[1] = d[i_y * w + i_x + 1]; // G
        o_rgb[2] = d[i_y * w + i_x + 2]; // B
        return;
    }
});
NyARDoubleMatrix22 = Klass({
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
});
NyARDoubleMatrix33 = Klass({
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
});
NyARDoubleMatrix34 = Klass({
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
});
NyARDoubleMatrix44 = Klass({
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
        for (var i = 0; i < i_number; i++) {
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
    getItem: function(i_index) {
        return this._items[i_index];
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
                //  08-15(8)Bit format ID
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
        for (var i = 0; i < i_number; i++) {
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

NyARIntPoint2d = Klass({
    x: 0,
    y: 0,
    createArray: function(i_number) {
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++) {
            ret[i] = new NyARIntPoint2d();
        }
        return ret;
    }
    , copyArray: function(i_from, i_to) {
        for (var i = i_from.length - 1; i >= 0; i--) {
            i_to[i].x = i_from[i].x;
            i_to[i].y = i_from[i].y;
        }
        return;
    }
});
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
    }
    ,
    isEqualSize_int: function(i_width, i_height) { // confirm size is either identical.
        if (i_width == this.w && i_height == this.h) {
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
    ,
    copyFrom: function(i_source) {
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
FLARRasterFilter_Threshold = ASKlass('FLARRasterFilter_Threshold', {// binarization by a constant threshold.
    FLARRasterFilter_Threshold: function() {
    },
    // Threshold for binarizing the image. Will be <bright point <= th scotoma.
    doFilter: function(i_input, i_output) {
        NyAS3Utils.assert(i_input.width == i_output.width && i_input.height == i_output.height);
        var out_buf = (i_output._buf);
        var in_reader = i_input._rgb_reader;
        var d = in_reader.getData().data;
        var obd = out_buf.data;
        for (var i = 0, j = 0; i < d.length; i += 4, ++j) {
            if (d[i] > 1.15 * d[i + 1] && d[i] > 1.15 * d[i + 2]) { //TroLL 
                obd[j] = 0xffffffff;
            } else {
                obd[j] = 0xff000000;
            }
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
NyARLabelInfoStack = ASKlass('NyARLabelInfoStack', {
    _items: null,
    _length: 0,
    NyARLabelInfoStack: function(i_length) {
        this._items = this.createArray(i_length); // Partitioning        
        this._length = 0; // Reset busy number
        return;
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = {};
        }
        return (ret);
    }
    ,
    sortByArea: function() { // sort the label in descending order of area.
        var len = this._length;
        if (len < 1) {
            return;
        }
        var h = Math.floor(len * 13 / 10);
        var item = this._items;
        for (; ; ) {
            var swaps = 0;
            for (var i = 0; i + h < len; i++) {
                if (item[i + h].area > item[i].area) {
                    var temp = item[i + h];
                    item[i + h] = item[i];
                    item[i] = temp;
                    swaps++;
                }
            }
            if (h == 1) {
                if (swaps == 0) {
                    break;
                }
            } else {
                h = Math.floor(h * 10 / 13);
            }
        }
    }
    ,
    prePush: function() { // reserve the new area. (return Null if fails)

        if (this._length >= this._items.length) { // Allocated as needed
            return null;
        }
        // To +1 space used, and return the space reservation.
        var ret = this._items[this._length];
        this._length++;
        return ret;
    }
    ,
    // @param i_reserv_length = Size to the used 
    init: function(i_reserv_length) { // initialize the stack        
        if (i_reserv_length >= this._items.length) { // Allocated as needed
            throw new NyARException();
        }
        this._length = i_reserv_length;
    }
    ,
    pops: function(i_count) { // reduce i_count individual the number of elements of apparent. 
        NyAS3Utils.assert(this._length >= i_count);
        this._length -= i_count;
        return;
    }
    ,
    getItem: function(i_index) {
        return this._items[i_index];
    }
});
NyARLabelOverlapChecker = ASKlass('NyARLabelOverlapChecker', {
    _labels: null,
    _length: 0,
    NyARLabelOverlapChecker: function(i_max_label) {
        this._labels = this.createArray(i_max_label);
    }
    ,
    createArray: function(i_length) {
        return new Array(i_length);
    }
    ,
    push: function(i_label_ref) { // add a label to be checked.
        this._labels[this._length] = i_label_ref;
        this._length++;
    }
    ,
    check: function(i_label) { // Returns if overlaps with the label on the current list
        // processing overlap?
        var label_pt = this._labels;
        var px1 = toInt(i_label.pos_x);
        var py1 = toInt(i_label.pos_y);
        for (var i = this._length - 1; i >= 0; i--) {
            var px2 = toInt(label_pt[i].pos_x);
            var py2 = toInt(label_pt[i].pos_y);
            var d = (px1 - px2) * (px1 - px2) + (py1 - py2) * (py1 - py2);
            if (d < label_pt[i].area / 4) {
                return false; // Excluded
            }
        }
        return true; // Target
    }
    ,
    setMaxLabels: function(i_max_label) { //Reset object to accumulate the largest label i_max_label individual
        if (i_max_label > this._labels.length) {
            this._labels = this.createArray(i_max_label);
        }
        this._length = 0;
    }
});
NyARLabeling_Rle = ASKlass('NyARLabeling_Rle', {// labeling RleImage
    AR_AREA_MAX: 100000, // #define AR_AREA_MAX 100000
    AR_AREA_MIN: 70, // #define AR_AREA_MIN 70
    _rlestack: null,
    _rle1: null,
    _rle2: null,
    _max_area: 0,
    _min_area: 0,
    NyARLabeling_Rle: function(i_width, i_height) {
        this._rlestack = new RleInfoStack(i_width * i_height * 2048 / (320 * 240) + 32);
        this._rle1 = RleElement.createArray(i_width / 2 + 1);
        this._rle2 = RleElement.createArray(i_width / 2 + 1);
        this.setAreaRange(this.AR_AREA_MAX, this.AR_AREA_MIN);
        return;
    }
    ,
    setAreaRange: function(i_max, i_min) { // Target size
        this._max_area = i_max;
        this._min_area = i_min;
        return;
    }
    ,
    // RLE compress the image of gs i_bin_buf
    // threshold at the time of 0, GS raster when the BIN raster    
    // Scotoma <= th < bright point
    toRLE: function(i_bin_buf, i_st, i_len, i_out) { // function recognized as a dark point threshold
        var current = 0;
        var lidx = 0;
        var ridx = 1;
        var off = 3;
        var r = -1;
        // Line fixed start
        var x = i_st;
        var right_edge = i_st + i_len - 1;
        while (x < right_edge) {
            // Scotoma (0) scan
            if (i_bin_buf[x] != 0xffffffff) {
                x++; //Bright point
                continue;
            }
            // examine the point length dark → discovery of dark spots
            r = (x - i_st);
            i_out[current + lidx] = r;
            r++; // +1 Scotoma
            x++;
            while (x < right_edge) {
                if (i_bin_buf[x] != 0xffffffff) {
                    // Point dark bright point (1) → (0) array end> registration
                    i_out[current + ridx] = r;
                    current += off;
                    x++; // Confirmation of the runner-up.
                    r = -1; // 0 to the position of the right edge.
                    break;
                } else { // Scotoma (0) additional length                    
                    r++;
                    x++;
                }
            }
        }
        // Judgment approach is slightly different only one point in the last
        if (i_bin_buf[x] != 0xffffffff) {
            // Registration>-terminated array of dark spots if bright point → r count in
            if (r >= 0) {
                i_out[current + ridx] = r;
                current += off;
            }
        } else {
            // Add l1 if not in → count scotoma
            if (r >= 0) {
                i_out[current + ridx] = (r + 1);
            } else {
                // In the case of one point of the last
                i_out[current + lidx] = (i_len - 1);
                i_out[current + ridx] = (i_len);
            }
            current += off;
        }
        return current / off; // Fixed line
    }
    ,
    addFragment: function(i_rel_img, i_img_idx, i_nof, i_row_index, o_stack) {
        var lidx = 0, ridx = 1, fidx = 2, off = 3;
        var l = i_rel_img[i_img_idx + lidx];
        var r = i_rel_img[i_img_idx + ridx];
        var len = r - l;
        i_rel_img[i_img_idx + fidx] = i_nof; // unique ID of each REL
        var v = o_stack.prePush();
        v.entry_x = l;
        v.area = len;
        v.clip_l = l;
        v.clip_r = r - 1;
        v.clip_t = i_row_index;
        v.clip_b = i_row_index;
        v.pos_x = (len * (2 * l + (len - 1))) / 2;
        v.pos_y = i_row_index * len;
        return;
    }
    ,
    imple_labeling: function(i_raster, i_th, i_top, i_bottom, o_stack) {
        // Reset process
        var rlestack = this._rlestack;
        rlestack._length = 0;
        var rle_prev = this._rle1;
        var rle_current = this._rle2;
        var len_prev = 0;
        var len_current = 0;
        var width = i_raster._size.w;
        var in_buf = (i_raster._buf.data);
        var id_max = 0;
        var label_count = 0;
        var lidx = 0, ridx = 1, fidx = 2, off = 3;
        // The first-stage registration
        len_prev = this.toRLE(in_buf, 0, width, rle_prev);
        var i;
        for (i = 0; i < len_prev; i++) {
            // Fragment fragment ID = initial value, POS = Y value, REL index = line
            this.addFragment(rle_prev, i * off, id_max, 0, rlestack);
            id_max++;
            label_count++; // maximum value check
        }
        var f_array = (rlestack._items);
        // Join the next stage
        for (var y = 1; y < i_bottom; y++) {
            // Read the current line
            len_current = this.toRLE(in_buf, y * width, width, rle_current);
            var index_prev = 0;
            SCAN_CUR: for (i = 0; i < len_current; i++) {
                // adjust the position index_prev, of len_prev
                var id = -1;
                SCAN_PREV: while (index_prev < len_prev) { // Check if there is a prev to be checked
                    if (rle_current[i * off + lidx] - rle_prev[index_prev * off + ridx] > 0) { //8 orientation labeling if 0
                        // located to the left of the cur prev → Explore the next fragment
                        index_prev++;
                        continue;
                    } else if (rle_prev[index_prev * off + lidx] - rle_current[i * off + ridx] > 0) { //8 orientation labeling if 0
                        // cur in the rightward prev → Independent fragment
                        this.addFragment(rle_current, i * off, id_max, y, rlestack);
                        id_max++;
                        label_count++;
                        // examine the index of the next
                        continue SCAN_CUR;
                    }
                    id = rle_prev[index_prev * off + fidx]; // Root fragment id
                    var id_ptr = f_array[id];
                    //Binding partner (first time) -> Copy prev ID, and update root fragment information
                    rle_current[i * off + fidx] = id; // Save ID fragment
                    //
                    var l = rle_current[i * off + lidx];
                    var r = rle_current[i * off + ridx];
                    var len = r - l;
                    id_ptr.area += len; // update binding target fragment information

                    // entry_x t and does not update it because it uses the binding of destination.
                    id_ptr.clip_l = l < id_ptr.clip_l ? l : id_ptr.clip_l;
                    id_ptr.clip_r = r > id_ptr.clip_r ? r - 1 : id_ptr.clip_r;
                    id_ptr.clip_b = y;
                    id_ptr.pos_x += (len * (2 * l + (len - 1))) / 2;
                    id_ptr.pos_y += y * len;
                    // Confirmation of multiple bonds (second and subsequent)
                    index_prev++;
                    while (index_prev < len_prev) {
                        if (rle_current[i * off + lidx] - rle_prev[index_prev * off + ridx] > 0) { // 8 orientation labeling if 0
                            // located to the left of the cur prev → prev not linked to cur
                            break SCAN_PREV;
                        } else if (rle_prev[index_prev * off + lidx] - rle_current[i * off + ridx] > 0) { // It is 8 orientation labeling if 0
                            // located to the right of the cur is prev → prev not linked to cur.
                            index_prev--;
                            continue SCAN_CUR;
                        }
                        // cur prev and are linked → Integration of root fragments
                        // Get the root fragments that bind
                        var prev_id = rle_prev[index_prev * off + fidx];
                        var prev_ptr = f_array[prev_id];
                        if (id != prev_id) {
                            label_count--;
                            // rewrite the fragment id of current and prev.
                            var i2;
                            for (i2 = index_prev; i2 < len_prev; i2++) {
                                // prev until the end of the current id of
                                if (rle_prev[i2 * off + fidx] == prev_id) {
                                    rle_prev[i2 * off + fidx] = id;
                                }
                            }
                            for (i2 = 0; i2 < i; i2++) {
                                // current until now -1 from 0
                                if (rle_current[i2 * off + fidx] == prev_id) {
                                    rle_current[i2 * off + fidx] = id;
                                }
                            }
                            // The aggregate information to route the current fragment
                            id_ptr.area += prev_ptr.area;
                            id_ptr.pos_x += prev_ptr.pos_x;
                            id_ptr.pos_y += prev_ptr.pos_y;
                            //tとentry_xの決定
                            if (id_ptr.clip_t > prev_ptr.clip_t) {
                                // The underlying direction of the current.
                                id_ptr.clip_t = prev_ptr.clip_t;
                                id_ptr.entry_x = prev_ptr.entry_x;
                            } else if (id_ptr.clip_t < prev_ptr.clip_t) {
                                // Are on the person of the current. Feedback to prev
                            } else {
                                // Smaller entry point in the horizontal direction.
                                if (id_ptr.entry_x > prev_ptr.entry_x) {
                                    id_ptr.entry_x = prev_ptr.entry_x;
                                } else {
                                }
                            }
                            // determination of l
                            if (id_ptr.clip_l > prev_ptr.clip_l) {
                                id_ptr.clip_l = prev_ptr.clip_l;
                            } else {
                            }
                            // determination of r
                            if (id_ptr.clip_r < prev_ptr.clip_r) {
                                id_ptr.clip_r = prev_ptr.clip_r;
                            } else {
                            }
                            // determination of b
                            // I want to disable the root fragment of the binding already.
                            prev_ptr.area = 0;
                        }
                        index_prev++;
                    }
                    index_prev--;
                    break;
                }
                // Check whether id is assigned to the cur
                // Add the right edge independent fragment
                if (id < 0) {
                    this.addFragment(rle_current, i * off, id_max, y, rlestack);
                    id_max++;
                    label_count++;
                }
            }
            // exchange of prev and rel
            var tmp = rle_prev;
            rle_prev = rle_current;
            len_prev = len_current;
            rle_current = tmp;
        }
        // Transfer only the label of the target
        o_stack.init(label_count); // set _length
        var o_dest_array = (o_stack._items);
        var max = this._max_area;
        var min = this._min_area;
        var active_labels = 0;
        for (i = id_max - 1; i >= 0; i--) {
            var area = f_array[i].area;
            if (area < min || area > max) { // I also shed in the area 0 min of non-target
                continue;
            }

            var src_info = f_array[i];
            var dest_info = o_dest_array[active_labels];
            dest_info.area = area;
            dest_info.clip_b = src_info.clip_b;
            dest_info.clip_r = src_info.clip_r;
            dest_info.clip_t = src_info.clip_t;
            dest_info.clip_l = src_info.clip_l;
            dest_info.entry_x = src_info.entry_x;
            dest_info.pos_x = src_info.pos_x / src_info.area;
            dest_info.pos_y = src_info.pos_y / src_info.area;
            active_labels++;
        }
        // Re-set the number of labels
        o_stack.pops(label_count - active_labels);
        // To return the number of labels
        return active_labels;
    }
});
RleInfoStack = ASKlass('RleInfoStack', NyARObjectStack, {
    RleInfoStack: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
        return;
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(toInt(i_length));
        for (var i = 0; i < i_length; i++) {
            ret[i] = {};
        }
        return ret;
    }
});
RleElement = ASKlass('RleElement', {
    l: 0,
    r: 0,
    fid: 0,
    createArray: function(i_length) {
        return new IntVector(toInt(i_length) * 3);
        var ret = new Array(toInt(i_length));
        for (var i = 0; i < i_length; i++) {
            ret[i] = new RleElement();
        }
        return ret;
    }
});

// The class that contains the distortion component of the camera, the correction function group
// http://www.hitl.washington.edu/artoolkit/Papers/ART02-Tutorial.pdf, page 11
NyARCameraDistortionFactor = ASKlass('NyARCameraDistortionFactor', {
    PD_LOOP: 3,
    _f0: 0, //x0
    _f1: 0, //y0
    _f2: 0, //100000000.0*ｆ
    _f3: 0 //s
    ,
    copyFrom: function(i_ref) {
        this._f0 = i_ref._f0;
        this._f1 = i_ref._f1;
        this._f2 = i_ref._f2;
        this._f3 = i_ref._f3;
        return;
    }
    ,
    // @param i_factor = Array of four or more elements
    setValue: function(i_factor) { // set as a factor the value of the array.
        this._f0 = i_factor[0];
        this._f1 = i_factor[1];
        this._f2 = i_factor[2];
        this._f3 = i_factor[3];
        return;
    }
    ,
    changeScale: function(i_scale) {
        this._f0 = this._f0 * i_scale; // newparam->dist_factor[0] =source->dist_factor[0] *scale;
        this._f1 = this._f1 * i_scale; // newparam->dist_factor[1] =source->dist_factor[1] *scale;
        this._f2 = this._f2 / (i_scale * i_scale); // newparam->dist_factor[2]=source->dist_factor[2]/ (scale*scale);
        //this.f3=this.f3;// newparam->dist_factor[3] =source->dist_factor[3];
        return;
    }
    ,
    // This is done by collectively ideal2Observ.
    ideal2ObservBatch: function(i_in, o_out, i_size) {
        var x, y;
        var d0 = this._f0;
        var d1 = this._f1;
        var d3 = this._f3;
        var d2_w = this._f2 / 100000000.0;
        for (var i = 0; i < i_size; i++) {
            x = (i_in[i].x - d0) * d3;
            y = (i_in[i].y - d1) * d3;
            if (x == 0.0 && y == 0.0) {
                o_out[i].x = d0;
                o_out[i].y = d1;
            } else {
                var d = 1.0 - d2_w * (x * x + y * y);
                o_out[i].x = x * d + d0;
                o_out[i].y = y * d + d1;
            }
        }
        return;
    }
    ,
    // int arParamObserv2Ideal( const double dist_factor[4], const double ox,const double oy,double *ix, double *iy );
    observ2Ideal: function(ix, iy, o_point) {
        var z02, z0, p, q, z, px, py, opttmp_1;
        var d0 = this._f0;
        var d1 = this._f1;
        px = ix - d0;
        py = iy - d1;
        p = this._f2 / 100000000.0;
        z02 = px * px + py * py;
        q = z0 = Math.sqrt(z02); // Optimize
        for (var i = 1; ; i++) {
            if (z0 != 0.0) {
                // Optimize opttmp_1
                opttmp_1 = p * z02;
                z = z0 - ((1.0 - opttmp_1) * z0 - q) / (1.0 - 3.0 * opttmp_1);
                px = px * z / z0;
                py = py * z / z0;
            } else {
                px = 0.0;
                py = 0.0;
                break;
            }
            if (i == this.PD_LOOP) {
                break;
            }
            z02 = px * px + py * py;
            z0 = Math.sqrt(z02); // Optimize
        }
        o_point.x = px / this._f3 + d0;
        o_point.y = py / this._f3 + d1;
        return;
    }
});
NyARObserv2IdealMap = ASKlass('NyARObserv2IdealMap', {
    _stride: 0,
    _mapx: null,
    _mapy: null,
    NyARObserv2IdealMap: function(i_distfactor, i_screen_size) {
        var opoint = new NyARDoublePoint2d();
        this._mapx = new FloatVector(i_screen_size.w * i_screen_size.h);
        this._mapy = new FloatVector(i_screen_size.w * i_screen_size.h);
        this._stride = i_screen_size.w;
        var ptr = i_screen_size.h * i_screen_size.w - 1;
        // Build a distortion map
        for (var i = i_screen_size.h - 1; i >= 0; i--) {
            for (var i2 = i_screen_size.w - 1; i2 >= 0; i2--) {
                i_distfactor.observ2Ideal(i2, i, opoint);
                this._mapx[ptr] = opoint.x;
                this._mapy[ptr] = opoint.y;
                ptr--;
            }
        }
        return;
    }
    ,
    observ2IdealBatch: function(i_x_coord, i_y_coord, i_start, i_num, o_x_coord, o_y_coord, ptr) {

        console.log("i_num = " + i_num)

        var idx;
        var mapx = this._mapx;
        var mapy = this._mapy;
        var stride = this._stride;
        for (var j = 0; j < i_num; j++) {
            idx = i_x_coord[i_start + j] + i_y_coord[i_start + j] * stride;
            o_x_coord[ptr] = mapx[idx];
            o_y_coord[ptr] = mapy[idx];
            ptr++;
        }
        return;
    }
    ,
    observ2IdealBatch2: function(i_x_coord, i_y_coord, i_num, o_x_coord, o_y_coord, ptr) {
        var idx;
        var mapx = this._mapx;
        var mapy = this._mapy;
        var stride = this._stride;
        for (var j = 0; j < i_num; j++) {
            idx = i_x_coord[j] + i_y_coord[j] * stride;
            o_x_coord[ptr] = mapx[idx];
            o_y_coord[ptr] = mapy[idx];
            ptr++;
        }
        return;
    }
});
NyARPerspectiveProjectionMatrix = ASKlass('NyARPerspectiveProjectionMatrix', NyARDoubleMatrix34, {
    // static double dot( double a1, double a2, double a3,double b1, double b2,double b3 )
    dot: function(a1, a2, a3, b1, b2, b3) {
        return (a1 * b1 + a2 * b2 + a3 * b3);
    }
    ,
    // static double norm( double a, double b, double c )     
    norm: function(a, b, c) {
        return Math.sqrt(a * a + b * b + c * c);
    }
    ,
    // int arParamDecompMat( double source[3][4], double cpara[3][4], double trans[3][4] ); Replacing the function. Optimize STEP[754->665]
    // @param o_cpara = return argument. To specify a matrix of 3x4.
    // @param o_trans = return argument. To specify a matrix of 3x4.
    decompMat: function(o_cpara, o_trans) {
        var r, c;
        var rem1, rem2, rem3;
        var c00, c01, c02, c03, c10, c11, c12, c13, c20, c21, c22, c23;
        if (this.m23 >= 0) { // if( source[2][3] >= 0 ) {
            c00 = this.m00;
            c01 = this.m01;
            c02 = this.m02;
            c03 = this.m03;
            c10 = this.m10;
            c11 = this.m11;
            c12 = this.m12;
            c13 = this.m13;
            c20 = this.m20;
            c21 = this.m21;
            c22 = this.m22;
            c23 = this.m23;
        } else {
            c00 = -this.m00;
            c01 = -this.m01;
            c02 = -this.m02;
            c03 = -this.m03;
            c10 = -this.m10;
            c11 = -this.m11;
            c12 = -this.m12;
            c13 = -this.m13;
            c20 = -this.m20;
            c21 = -this.m21;
            c22 = -this.m22;
            c23 = -this.m23;
        }
        var cpara = o_cpara.m;
        var trans = o_trans.m;
        for (r = 0; r < 3; r++) {
            for (c = 0; c < 4; c++) {
                cpara[r][c] = 0.0;
            }
        }
        cpara[2][2] = this.norm(c20, c21, c22);
        trans[2][0] = c20 / cpara[2][2];
        trans[2][1] = c21 / cpara[2][2];
        trans[2][2] = c22 / cpara[2][2];
        trans[2][3] = c23 / cpara[2][2];
        cpara[1][2] = this.dot(trans[2][0], trans[2][1], trans[2][2], c10, c11, c12);
        rem1 = c10 - cpara[1][2] * trans[2][0];
        rem2 = c11 - cpara[1][2] * trans[2][1];
        rem3 = c12 - cpara[1][2] * trans[2][2];
        cpara[1][1] = this.norm(rem1, rem2, rem3);
        trans[1][0] = rem1 / cpara[1][1];
        trans[1][1] = rem2 / cpara[1][1];
        trans[1][2] = rem3 / cpara[1][1];
        cpara[0][2] = this.dot(trans[2][0], trans[2][1], trans[2][2], c00, c01, c02);
        cpara[0][1] = this.dot(trans[1][0], trans[1][1], trans[1][2], c00, c01, c02);
        rem1 = c00 - cpara[0][1] * trans[1][0] - cpara[0][2] * trans[2][0];
        rem2 = c01 - cpara[0][1] * trans[1][1] - cpara[0][2] * trans[2][1];
        rem3 = c02 - cpara[0][1] * trans[1][2] - cpara[0][2] * trans[2][2];
        cpara[0][0] = this.norm(rem1, rem2, rem3);
        trans[0][0] = rem1 / cpara[0][0];
        trans[0][1] = rem2 / cpara[0][0];
        trans[0][2] = rem3 / cpara[0][0];
        trans[1][3] = (c13 - cpara[1][2] * trans[2][3]) / cpara[1][1];
        trans[0][3] = (c03 - cpara[0][1] * trans[1][3] - cpara[0][2] * trans[2][3]) / cpara[0][0];
        for (r = 0; r < 3; r++) {
            for (c = 0; c < 3; c++) {
                cpara[r][c] /= cpara[2][2];
            }
        }
        return;
    }
    ,
    // int arParamChangeSize( ARParam *source, int xsize, int ysize, ARParam *newparam );
    // convert the scale of the Matrix.
    changeScale: function(i_scale) {
        this.m00 = this.m00 * i_scale;
        this.m10 = this.m10 * i_scale;
        this.m01 = this.m01 * i_scale;
        this.m11 = this.m11 * i_scale;
        this.m02 = this.m02 * i_scale;
        this.m12 = this.m12 * i_scale;
        this.m03 = this.m03 * i_scale;
        this.m13 = this.m13 * i_scale;
        return;
    }
    // projective transformation the three-dimensional coordinates in the current matrix.
    ,
    projectionConvert_NyARDoublePoint3d: function(i_3dvertex, o_2d) {
        var w = i_3dvertex.z * this.m22;
        o_2d.x = (i_3dvertex.x * this.m00 + i_3dvertex.y * this.m01 + i_3dvertex.z * this.m02) / w;
        o_2d.y = (i_3dvertex.y * this.m11 + i_3dvertex.z * this.m12) / w;
        return;
    }
    ,
    projectionConvert_Number: function(i_x, i_y, i_z, o_2d) {
        var w = i_z * this.m22;
        o_2d.x = (i_x * this.m00 + i_y * this.m01 + i_z * this.m02) / w;
        o_2d.y = (i_y * this.m11 + i_z * this.m12) / w;
        return;
    }
});
// typedef struct { int xsize, ysize; double mat[3][4]; double dist_factor[4]; } ARParam;
NyARParam = ASKlass('NyARParam', {// Class that contains the operating parameters of NyAR
    _screen_size: new NyARIntSize(),
    SIZE_OF_PARAM_SET: 4 + 4 + (3 * 4 * 8) + (4 * 8),
    _dist: new NyARCameraDistortionFactor(),
    _projection_matrix: new NyARPerspectiveProjectionMatrix()
    ,
    // Copy the perspective projection matrix to the given m_projection FloatVector GL camera matrix.
    copyCameraMatrix: function(m_projection, NEAR_CLIP, FAR_CLIP) { //!IMPORTANT
        var trans_mat = new FLARMat(3, 4);
        var icpara_mat = new FLARMat(3, 4);
        var p = ArrayUtil.createJaggedArray(3, 3);
        var q = ArrayUtil.createJaggedArray(4, 4);
        var i = 0;
        var j = 0;
        var size = this._screen_size;
        var width = size.w;
        var height = size.h;
        this._projection_matrix.decompMat(icpara_mat, trans_mat);
        var icpara = icpara_mat.m;
        var trans = trans_mat.m;
        for (i = 0; i < 4; i++) {
            icpara[1][i] = (height - 1) * (icpara[2][i]) - icpara[1][i];
        }

        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                p[i][j] = icpara[i][j] / icpara[2][2];
            }
        }
        q[0][0] = (2.0 * p[0][0] / (width - 1));
        q[0][1] = (2.0 * p[0][1] / (width - 1));
        q[0][2] = -((2.0 * p[0][2] / (width - 1)) - 1.0);
        q[0][3] = 0.0;
        q[1][0] = 0.0;
        q[1][1] = -(2.0 * p[1][1] / (height - 1));
        q[1][2] = -((2.0 * p[1][2] / (height - 1)) - 1.0);
        q[1][3] = 0.0;
        q[2][0] = 0.0;
        q[2][1] = 0.0;
        q[2][2] = -(FAR_CLIP + NEAR_CLIP) / (NEAR_CLIP - FAR_CLIP);
        q[2][3] = 2.0 * FAR_CLIP * NEAR_CLIP / (NEAR_CLIP - FAR_CLIP);
        q[3][0] = 0.0;
        q[3][1] = 0.0;
        q[3][2] = 1.0;
        q[3][3] = 0.0;
        for (i = 0; i < 4; i++) { // Row.
            // First 3 columns of the current row.
            for (j = 0; j < 3; j++) { // Column.
                m_projection[j * 4 + i] =
                        q[i][0] * trans[0][j] +
                        q[i][1] * trans[1][j] +
                        q[i][2] * trans[2][j];
            }
            // Fourth column of the current row.
            m_projection[i + 4 * 3] =
                    q[i][0] * trans[0][3] +
                    q[i][1] * trans[1][3] +
                    q[i][2] * trans[2][3] +
                    q[i][3];
        }
    }
    ,
    // @param i_factor = sequence set to NyARCameraDistortionFactor. That the number of elements is 4.
    // @param i_projection = sequence that NyARPerspectiveProjectionMatrix set. That the number of elements is 12.
    setValue: function(i_factor, i_projection) {
        this._dist.setValue(i_factor);
        this._projection_matrix.setValue(i_projection);
        return;
    }
    ,
    // int arParamChangeSize( ARParam *source, int xsize, int ysize, ARParam *newparam );
    // change i_xsize, to i_ysize an alternative function of the size property function
    changeScreenSize: function(i_xsize, i_ysize) {
        var scale = i_xsize / this._screen_size.w; // scale = (double)xsize / (double)(source->xsize);
        // Change the scale
        this._dist.changeScale(scale);
        this._projection_matrix.changeScale(scale);
        this._screen_size.w = i_xsize; // newparam->xsize = xsize;
        this._screen_size.h = i_ysize; // newparam->ysize = ysize;
        return;
    }
    ,
    loadARParam: function(i_stream) {
        var tmp = new FloatVector(12); //new double[12];
        i_stream.endian = Endian.BIG_ENDIAN;
        this._screen_size.w = i_stream.readInt(); //bb.getInt();
        this._screen_size.h = i_stream.readInt(); //bb.getInt();
        // read 12 double value
        var i;
        for (i = 0; i < 12; i++) {
            tmp[i] = i_stream.readDouble(); //bb.getDouble();
        }
        // Set Projection to object
        this._projection_matrix.setValue(tmp);
        // I read four double value
        for (i = 0; i < 4; i++) {
            tmp[i] = i_stream.readDouble(); //bb.getDouble();
        }
        // The object set to Factor
        this._dist.setValue(tmp);
        return;
    }
});
FLARParam = ASKlass('FLARParam', NyARParam, {
    FLARParam: function(w, h) {

        w = w || 640;
        h = h || 480;
        this._screen_size.w = w;
        this._screen_size.h = h;
        var f = 1;
        var dist = new FloatVector([w / 2, 1.1 * h / 2, 26.2, 1.0127565206658486]);
        var projection = new FloatVector([
            f * 700.9514702992245, 0, w / 2 - 0.5, 0,
            0, 726.0941816535367, h / 2 - 0.5, 0,
            0, 0, 1, 0
        ]);
        this.setValue(dist, projection);
    }
});
NyARRaster_BasicClass = ASKlass('NyARRaster_BasicClass', {
    _size: null,
    _buffer_type: 0,
    NyARRaster_BasicClass: function() { // function(int i_width,int i_height,int i_buffer_type)
        switch (arguments.length) {
            case 1:
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
    }
    ,
    isEqualBufferType: function(i_type_value) {
        return this._buffer_type == i_type_value;
    }
});
NyARBinRaster = ASKlass('NyARBinRaster', NyARRaster_BasicClass, {
    _buf: null,
    _is_attached_buffer: null, // Buffer true if the object is attached

    NyARBinRaster: function() {
        NyARRaster_BasicClass.initialize.call(this, {});
        switch (arguments.length) {
            case 1:
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
    }
    ,
    override_NyARBinRaster4: function(i_width, i_height, i_raster_type, i_is_alloc) { // Please specify a constant value defined in NyARBufferType.
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, i_raster_type);
        if (!this.initInstance(this._size, i_raster_type, i_is_alloc)) {
            throw new NyARException();
        }
    }
    ,
    override_NyARBinRaster3: function(i_width, i_height, i_is_alloc) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, NyARBufferType.INT1D_BIN_8);
        if (!this.initInstance(this._size, NyARBufferType.INT1D_BIN_8, i_is_alloc)) {
            throw new NyARException();
        }
    }
    ,
    override_NyARBinRaster2: function(i_width, i_height) {
        NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this, i_width, i_height, NyARBufferType.INT1D_BIN_8);
        if (!this.initInstance(this._size, NyARBufferType.INT1D_BIN_8, true)) {
            throw new NyARException();
        }
    }
    ,
    initInstance: function(i_size, i_buf_type, i_is_alloc) {
        switch (i_buf_type) {
            case NyARBufferType.INT1D_BIN_8:
                this._buf = i_is_alloc ? new IntVector(i_size.w * i_size.h) : null;
                break;
            default:
                return false;
        }
        this._is_attached_buffer = i_is_alloc;
        return true;
    }
    ,
    wrapBuffer: function(i_ref_buf) {
        NyAS3Utils.assert(!this._is_attached_buffer); //It does not work buffer if it is attached.
        this._buf = i_ref_buf;
    }
});
NyARRaster = ASKlass('NyARRaster', NyARRaster_BasicClass, {// This class is a single-function NyARRaster.
    _buf: null,
    _buf_type: 0,
    _is_attached_buffer: null, // Buffer true if the object is attached
    NyARRaster: function() {
        NyARRaster_BasicClass.initialize.call(this, {});
        switch (arguments.length) {
            case 1:
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
    }
    ,
    wrapBuffer: function(i_ref_buf) {
        NyAS3Utils.assert(!this._is_attached_buffer); // It does not work buffer if it is attached.
        this._buf = i_ref_buf;
    }
});
NyARRgbRaster_BasicClass = ASKlass('NyARRgbRaster_BasicClass', {// Class that implements the basic function / member of NyARRaster interface
    _size: null,
    _buffer_type: 0
    ,
    NyARRgbRaster_BasicClass: function() {
        switch (arguments.length) {
            case 1:
                break;
            case 3: //(int,int,int)                
                this.overload_NyARRgbRaster_BasicClass(toInt(arguments[0]), toInt(arguments[1]), toInt(arguments[2]));
                break;
            default:
                throw new NyARException();
        }
    }
    ,
    overload_NyARRgbRaster_BasicClass: function(i_width, i_height, i_buffer_type) {
        this._size = new NyARIntSize(i_width, i_height);
        this._buffer_type = i_buffer_type;
    }
    ,
    isEqualBufferType: function(i_type_value) {
        return this._buffer_type == i_type_value;
    }
});
NyARRgbRaster_Canvas2D = ASKlass("NyARRgbRaster_Canvas2D", NyARRgbRaster_BasicClass, {//!IMPORTANT
    _canvas: null,
    _rgb_reader: null,
    NyARRgbRaster_Canvas2D: function(canvas) {
        NyARRgbRaster_BasicClass.initialize.call(this, canvas.width, canvas.height, NyARBufferType.OBJECT_JS_Canvas);
        this._canvas = canvas;
        this._rgb_reader = new NyARRgbPixelReader_Canvas2D(this._canvas);
    }
});
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
});
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
    setVerticalInterval: function(i_step) {
        this._vertical_skip = i_step;
        return;
    }
    ,
    analyzeRaster: function(i_input, o_histgram) { // output the histogram to o_histgram
        var size = i_input._size;
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
        var size = i_input._size;
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
        var input = (i_reader._buf);
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
NyARContourPickup = ASKlass('NyARContourPickup', {
    // In order to be able to patrol reference, duplicating table
    // 0  1  2  3  4  5  6  7   0  1  2  3  4  5  6
    _getContour_xdir: new IntVector([0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1]),
    _getContour_ydir: new IntVector([-1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0]),
    getContour_NyARBinRaster: function(i_raster, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y) {
        return this.impl_getContour(i_raster, 0, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y);
    }
    ,
    // @param i_th = Threshold for binarizing the image. Will be <bright point <= i_th scotoma
    // @param i_entry_x = tracking start point of the contour
    getContour_NyARGrayscaleRaster: function(i_raster, i_th, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y) {
        return this.impl_getContour(i_raster, i_th, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y);
    }
    ,
    // return length array of the contour traced line from the entry point of the raster
    impl_getContour: function(i_raster, i_th, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y) {
        var xdir = this._getContour_xdir; // static int xdir[8] = { 0, 1, 1, 1, 0,-1,-1,-1};
        var ydir = this._getContour_ydir; // static int ydir[8] = {-1,-1, 0, 1, 1, 1, 0,-1};
        var i_buf = i_raster._buf;
        var width = i_raster.width;
        var height = i_raster.height;
        // get the point that is in contact with the upper end of the clip region
        var coord_num = 1;
        o_coord_x[0] = i_entry_x;
        o_coord_y[0] = i_entry_y;
        var dir = 5; //cinco
        var c = i_entry_x;
        var r = i_entry_y;
        for (; ; ) {
            dir = (dir + 5) % 8; //normalization of dir //cinco
            // I think that it can be optimized more if you work hard here.
            // In the case of the boundary of the ground other than the four corners, not be such as bounds checking
            if (c >= 1 && c < width - 1 && r >= 1 && r < height - 1) {
                for (; ; ) { // for statement of emulating the goto
                    // When it is not in contact with the boundary (decision point dark)
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    dir++;
                    if (i_buf[(r + ydir[dir]) * width + (c + xdir[dir])] <= i_th) {
                        break;
                    }
                    // Were examined all eight directions, but is does not have a label?
                    throw new NyARException();
                }
            } else {
                // When you are in contact with the boundary
                var i;
                for (i = 0; i < 8; i++) {
                    var x = c + xdir[dir];
                    var y = r + ydir[dir];
                    // Bounds checking
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        if (i_buf[(y) * width + (x)] <= i_th) {
                            break;
                        }
                    }
                    dir++; // No problem since you will want to refer to the double-length table
                }
                if (i == 8) {
                    // Were examined all eight directions, but is does not have a label?
                    throw new NyARException(); // return(-1);
                }
            }
            dir = dir % 8; // normalization of dir
            // Save c, to the r ycoord and xcoord
            c = c + xdir[dir];
            r = r + ydir[dir];
            o_coord_x[coord_num] = c;
            o_coord_y[coord_num] = r;
            // Exit condition determination
            if (c == i_entry_x && r == i_entry_y) {
                coord_num++;
                break;
            }
            coord_num++;
            if (coord_num == i_array_size) {
                return coord_num; // Profile has reached the end
            }
        }
        return coord_num;
    }
});
NyARCoord2Linear = ASKlass('NyARCoord2Linear', {
    _xpos: null,
    _ypos: null,
    _pca: null,
    __getSquareLine_evec: new NyARDoubleMatrix22(),
    __getSquareLine_mean: new FloatVector(2),
    __getSquareLine_ev: new FloatVector(2),
    _dist_factor: null,
    NyARCoord2Linear: function(i_size, i_distfactor_ref) {
        // When you create the distortion calculation table, consuming an area of ​​8 * width / height * 2
        // If you do not want to take the area, please just use the value of i_dist_factor_ref
        this._dist_factor = new NyARObserv2IdealMap(i_distfactor_ref, i_size);
        // Contour buffer
        this._pca = new NyARPca2d_MatrixPCA_O2();
        this._xpos = new FloatVector(i_size.w + i_size.h); // Maximum side length this.width + this.height
        this._ypos = new FloatVector(i_size.w + i_size.h); // Maximum side length this.width + this.height
        return;
    }
    ,
    // calculate the linear equation of ay + bx + c = 0 from the contour point set
    coord2Line: function(i_st, i_ed, i_xcoord, i_ycoord, i_cood_num, o_line) {
        // Get the vertex
        var n, st, ed;
        var w1;
        // Determination of search interval
        if (i_ed >= i_st) {
            // Contour vertices to [i +1] is, when in the one section from the vertex [i]
            w1 = (i_ed - i_st + 1) * 0.05 + 0.5;
            // Determination of search interval
            st = Math.floor(i_st + w1);
            ed = Math.floor(i_ed - w1);
        } else {
            // Contour vertices to [i +1] is, when it is divided into two sections of vertices [i]
            w1 = ((i_ed + i_cood_num - i_st + 1) % i_cood_num) * 0.05 + 0.5;
            // Determination of search interval
            st = (Math.floor(i_st + w1)) % i_cood_num;
            ed = (Math.floor(i_ed + i_cood_num - w1)) % i_cood_num;
        }
        // Check the search interval number
        if (st <= ed) { // Search interval is one section
            n = ed - st + 1;
            this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st, n, this._xpos, this._ypos, 0);

        } else {// Search interval is two sections            
            n = ed + 1 + i_cood_num - st;
            this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st, i_cood_num - st, this._xpos, this._ypos, 0);
            this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, 0, ed + 1, this._xpos, this._ypos, i_cood_num - st);
        }

        if (n < 2) { //Confirmation of the number of elements
            // As it is not possible n to calculate matrix.PCA less than or equal to 2, an error
            return false;
        }
        //To principal component analysis
        var evec = this.__getSquareLine_evec;
        var mean = this.__getSquareLine_mean;
        this._pca.pca(this._xpos, this._ypos, n, evec, this.__getSquareLine_ev, mean);
        o_line.dy = evec.m01;
        o_line.dx = -evec.m00;
        o_line.c = -(o_line.dy * mean[0] + o_line.dx * mean[1]);
        return true;
    }
    ,
    coord2LineSquare: function(_xpos, _ypos, o_line) {
        var evec = this.__getSquareLine_evec;
        var ev = this.__getSquareLine_ev;
        var mean = this.__getSquareLine_mean;
        this._pca.pca(_xpos, _ypos, 2, evec, ev, mean);
        o_line.dy = evec.m01;
        o_line.dx = -evec.m00;
        o_line.c = -(o_line.dy * mean[0] + o_line.dx * mean[1]);
        return true;
    }
});

NyARVertexCounter = ASKlass('NyARVertexCounter', {// class for disconnecting the get_vertex function
    vertex: new IntVector(10), // scraped up to 6
    number_of_vertex: 0,
    thresh: 0,
    x_coord: null,
    y_coord: null,
    getVertex: function(i_x_coord, i_y_coord, i_coord_len, st, ed, i_thresh) {
        this.number_of_vertex = 0;
        this.thresh = i_thresh;
        this.x_coord = i_x_coord;
        this.y_coord = i_y_coord;
        return this.get_vertex(st, ed, i_coord_len);
    }
    ,
    // alternative of the function (int * vnum], int st, int ed, double thresh, int vertex [], int y_coord [], int x_coord [) static int get_vertex
    get_vertex: function(st, ed, i_coord_len) {
        var i;
        var d;
        //Note: The coordinate values ​​change because it is okay to dealing in int32 and does not exceed 65536.
        var v1 = 0;
        var lx_coord = this.x_coord;
        var ly_coord = this.y_coord;
        var a = ly_coord[ed] - ly_coord[st];
        var b = lx_coord[st] - lx_coord[ed];
        var c = lx_coord[ed] * ly_coord[st] - ly_coord[ed] * lx_coord[st];
        var dmax = 0;
        if (st < ed) {
            //ed and st is one section
            for (i = st + 1; i < ed; i++) {
                d = a * lx_coord[i] + b * ly_coord[i] + c;
                if (d * d > dmax) {
                    dmax = d * d;
                    v1 = i;
                }
            }
        } else {
            //ed and st 2 interval
            for (i = st + 1; i < i_coord_len; i++) {
                d = a * lx_coord[i] + b * ly_coord[i] + c;
                if (d * d > dmax) {
                    dmax = d * d;
                    v1 = i;
                }
            }
            for (i = 0; i < ed; i++) {
                d = a * lx_coord[i] + b * ly_coord[i] + c;
                if (d * d > dmax) {
                    dmax = d * d;
                    v1 = i;
                }
            }
        }
        if (dmax / (a * a + b * b) > this.thresh) {
            if (!this.get_vertex(st, v1, i_coord_len)) {
                return false;
            }
            if (this.number_of_vertex > 5) {
                return false;
            }
            this.vertex[this.number_of_vertex] = v1;
            this.number_of_vertex++;
            if (!this.get_vertex(v1, ed, i_coord_len)) {
                return false;
            }
        }
        return true;
    }
});
NyARCoord2SquareVertexIndexes = ASKlass('NyARCoord2SquareVertexIndexes', {
    VERTEX_FACTOR: 1.0, // Factor of the line detection
    __getSquareVertex_wv1: new NyARVertexCounter(),
    __getSquareVertex_wv2: new NyARVertexCounter(),
    NyARCoord2SquareVertexIndexes: function() {
        return;
    }
    ,
    // From the coordinate set, looking four places where going to be a candidate vertex, and returns index number
    getVertexIndexes: function(i_x_coord, i_y_coord, i_coord_num, i_area, o_vertex) {
        var wv1 = this.__getSquareVertex_wv1;
        var wv2 = this.__getSquareVertex_wv2;
        var vertex1_index = this.getFarPoint(i_x_coord, i_y_coord, i_coord_num, 0);
        var prev_vertex_index = (vertex1_index + i_coord_num) % i_coord_num;
        var v1 = this.getFarPoint(i_x_coord, i_y_coord, i_coord_num, vertex1_index);
        var thresh = (i_area / 0.75) * 0.01 * this.VERTEX_FACTOR;
        o_vertex[0] = vertex1_index;
        if (!wv1.getVertex(i_x_coord, i_y_coord, i_coord_num, vertex1_index, v1, thresh)) {
            return false;
        }
        if (!wv2.getVertex(i_x_coord, i_y_coord, i_coord_num, v1, prev_vertex_index, thresh)) {
            return false;
        }
        var v2;
        if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
            o_vertex[1] = wv1.vertex[0];
            o_vertex[2] = v1;
            o_vertex[3] = wv2.vertex[0];
        } else if (wv1.number_of_vertex > 1 && wv2.number_of_vertex == 0) {
            // In anticipation to be in the 1/2 diagonal line between starting point and vertex position, search
            if (v1 >= vertex1_index) {
                v2 = (v1 - vertex1_index) / 2 + vertex1_index;
            } else {
                v2 = ((v1 + i_coord_num - vertex1_index) / 2 + vertex1_index) % i_coord_num;
            }
            if (!wv1.getVertex(i_x_coord, i_y_coord, i_coord_num, vertex1_index, v2, thresh)) {
                return false;
            }
            if (!wv2.getVertex(i_x_coord, i_y_coord, i_coord_num, v2, v1, thresh)) {
                return false;
            }
            if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
                o_vertex[1] = wv1.vertex[0];
                o_vertex[2] = wv2.vertex[0];
                o_vertex[3] = v1;
            } else {
                return false;
            }
        } else if (wv1.number_of_vertex == 0 && wv2.number_of_vertex > 1) {
            //v2 = (v1+ end_of_coord)/2;
            if (v1 <= prev_vertex_index) {
                v2 = (v1 + prev_vertex_index) / 2;
            } else {
                v2 = ((v1 + i_coord_num + prev_vertex_index) / 2) % i_coord_num;
            }
            if (!wv1.getVertex(i_x_coord, i_y_coord, i_coord_num, v1, v2, thresh)) {
                return false;
            }
            if (!wv2.getVertex(i_x_coord, i_y_coord, i_coord_num, v2, prev_vertex_index, thresh)) {
                return false;
            }
            if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
                o_vertex[1] = v1;
                o_vertex[2] = wv1.vertex[0];
                o_vertex[3] = wv2.vertex[0];
            } else {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }
    ,
    // from the contour coordinate of i_point, look for the index of the most distant
    getFarPoint: function(i_coord_x, i_coord_y, i_coord_num, i_point) {
        var sx = i_coord_x[i_point];
        var sy = i_coord_y[i_point];
        var d = 0;
        var w, x, y;
        var ret = 0;
        var i;
        for (i = i_point + 1; i < i_coord_num; i++) {
            x = i_coord_x[i] - sx;
            y = i_coord_y[i] - sy;
            w = x * x + y * y;
            if (w > d) {
                d = w;
                ret = i;
            }
        }
        for (i = 0; i < i_point; i++) {
            x = i_coord_x[i] - sx;
            y = i_coord_y[i] - sy;
            w = x * x + y * y;
            if (w > d) {
                d = w;
                ret = i;
            }
        }
        return ret;
    }
});
NyARSquare = ASKlass('NyARSquare', {// Class corresponding to ARMarkerInfo. hold the rectangle information
    line: NyARLinear.createArray(4),
    sqvertex: NyARDoublePoint2d.createArray(4),
    getCenter2d: function(o_out) {
        o_out.x = (this.sqvertex[0].x + this.sqvertex[1].x + this.sqvertex[2].x + this.sqvertex[3].x) / 4;
        o_out.y = (this.sqvertex[0].y + this.sqvertex[1].y + this.sqvertex[2].y + this.sqvertex[3].y) / 4;
        return;
    }
});
NyARSquareStack = ASKlass('NyARSquareStack', NyARObjectStack, {
    NyARSquareStack: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new NyARSquare();
        }
        return (ret);
    }
});
FLARSquare = NyARSquare;
FLContourPickup = ASKlass('FLContourPickup', NyARContourPickup, {
    FLContourPickup: function() {
    }
    ,
    getContour_FLARBinRaster: function(i_raster, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y) {
        var xdir = this._getContour_xdir; // static int xdir[8] = { 0, 1, 1, 1, 0,-1,-1,-1};
        var ydir = this._getContour_ydir; // static int ydir[8] = {-1,-1, 0, 1, 1, 1, 0,-1};
        var i_buf = i_raster._buf;
        var width = i_raster._size.w;
        var height = i_raster._size.h;
        // get the point that is in contact with the upper end of the clip region.
        var coord_num = 1;
        o_coord_x[0] = i_entry_x;
        o_coord_y[0] = i_entry_y;
        var dir = 5; //cinco
        var c = i_entry_x;
        var r = i_entry_y;
        for (; ; ) {
            dir = (dir + 5) % 8; // normalization of dir //cinco
            // that it can be optimized more if you work hard here.
            // In case of boundary of the ground other than the four corners, not be such as bounds checking
            if (c >= 1 && c < width - 1 && r >= 1 && r < height - 1) {
                for (; ; ) { // for statement of emulating the goto
                    // When it is not in contact with the boundary (decision point dark)
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    dir++;
                    if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) > 0) {
                        break;
                    }
                    // Were examined all eight directions, but is does not have a label?
                    return -1;
                }
            } else {
                // When are in contact with the boundary
                var i;
                for (i = 0; i < 8; i++) {
                    var x = c + xdir[dir];
                    var y = r + ydir[dir];
                    // Bounds checking
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        if (i_buf.getPixel(y, x) > 0) {
                            break;
                        }
                    }
                    dir++; // No problem since you will want to refer to the double-length table
                }
                if (i == 8) { // Were examined all eight directions, but is does not have a label?                    
                    return -1;
                }
            }
            dir = dir % 8; // normalization of dir
            // Save c, to the r ycoord and xcoord
            c = c + xdir[dir];
            r = r + ydir[dir];
            o_coord_x[coord_num] = c;
            o_coord_y[coord_num] = r;
            // Exit condition determination
            if (c == i_entry_x && r == i_entry_y) {
                coord_num++;
                break;
            }
            coord_num++;
            if (coord_num == i_array_size) {// Profile has reached the end                
                return coord_num;
            }
        }
        return coord_num;
    }
});

FLARSquareContourDetector = ASKlass('FLARSquareContourDetector', {
    AR_AREA_MAX: 100000, // define AR_AREA_MAX 100000
    AR_AREA_MIN: 70, // define AR_AREA_MIN 70
    _width: 0,
    _height: 0,
    _labeling: null, _overlap_checker: new NyARLabelOverlapChecker(32),
    _cpickup: new FLContourPickup(),
    _stack: null,
    _coord2vertex: new NyARCoord2SquareVertexIndexes(),
    _max_coord: 0,
    _xcoord: null,
    _ycoord: null
    ,
    FLARSquareContourDetector: function(i_size) { // detects the marker of maximum i_squre_max individual
        this.width = i_size.w;
        this.height = i_size.h;
        this._labeling = new NyARLabeling_Rle(this.width, this.height);
        this._stack = new NyARLabelInfoStack(i_size.w * i_size.h * 2048 / (320 * 240) + 32); //Detect maximum number of labels
        // The maximum length of the outline rectangle the size of the maximum that can be reflected on the screen.
        var number_of_coord = (this.width + this.height) * 2;
        // Contour buffer
        this._max_coord = number_of_coord;
        this._xcoord = new IntVector(number_of_coord);
        this._ycoord = new IntVector(number_of_coord);
        return;
    }
    ,
    __detectMarker_mkvertex: new IntVector(4)
    ,
    detectMarkerCB: function(i_raster, i_callback, _offset) {
        var flagment = this._stack;
        var overlap = this._overlap_checker;
        // Up to this point the number of labels is 0
        var label_num = this._labeling.imple_labeling(i_raster, i_raster._size.h, flagment)

        if (label_num < 1) {
            return;
        }
        flagment.sortByArea(); // I keep sort the label
        // Get the label list
        var xsize = this.width;
        var ysize = this.height;
        var xcoord = this._xcoord;
        var ycoord = this._ycoord;
        var coord_max = this._max_coord;
        var mkvertex = this.__detectMarker_mkvertex;
        // Set the maximum number of overlapping checker        
        overlap.setMaxLabels(label_num); //GET ALL POSSIBLE SQUARES 

        var result = []; //TroLL
        for (var i = label_num - 1; i > -1; i--) {
            var label_pt = flagment._items[i];
            // Exclusion clip region if in contact with the frame of the screen
            if (label_pt.clip_l == 0 || label_pt.clip_r == xsize - 1) {
                continue;
            }
            if (label_pt.clip_t == 0 || label_pt.clip_b == ysize - 1) {
                continue;
            }
            // Check the overlap of the rectangle has already been detected
            if (!overlap.check(label_pt)) { // Seems to overlap.                
                continue;
            }
            if (window.DEBUG) {
                var cv = document.getElementById('debugCanvas').getContext('2d');
                cv.strokeStyle = 'red';
                cv.strokeRect(
                        label_pt.clip_l, label_pt.clip_t, label_pt.clip_r - label_pt.clip_l, label_pt.clip_b - label_pt.clip_t
                        );
                cv.fillStyle = 'red';
                cv.fillRect(label_pt.entry_x - 1, label_pt.clip_t - 1, 3, 3);
                cv.fillStyle = 'cyan';
                cv.fillRect(label_pt.pos_x - 1, label_pt.pos_y - 1, 3, 3);
            }
            // Get the outline
            var coord_num = this._cpickup.getContour_FLARBinRaster(
                    i_raster, label_pt.entry_x, label_pt.clip_t, coord_max, xcoord, ycoord
                    );
            if (coord_num == -1)
                return -1;
            if (coord_num == coord_max) { // Outline is too large.                
                continue;
            }
            // Check the contour, and determining whether the rectangle. Get to mkvertex if rectangular
            if (!this._coord2vertex.getVertexIndexes(xcoord, ycoord, coord_num, label_pt.area, mkvertex)) { // could not get the vertex                
                continue;
            }
            // notification callback function that it has found a rectangle
            var param = i_callback.onSquareDetect(xcoord, ycoord, mkvertex);
            if (!param) { //get MARKER info
                continue;
            }

            param.i_coor_num = coord_num;
            param.i_vertex_index = $.extend({}, mkvertex);

            result.push(param);
            overlap.push(label_pt);
        }

        if (result.length) {
            var param = result[result.length - 1];

            console.log(param.marker.d);

            ///////////////////////////////////////////////////////////////////////////////////////////
            Game.sceneGroup.position = new THREE.Vector3(250 - param.marker.p.x * 200, -1750 + param.marker.p.y * 200, 0);
            Game.sceneGroup.updateMatrix();
            ///////////////////////////////////////////////////////////////////////////////////////////

            var boardCombination = false;
            getMarkerCombination(result, function(array, dv) { //TroLL

//                console.log("dv = " + dv)
                _offset.setSquare(100 * dv); //..

//                if (window.DEBUG) {
//                    console.log("ids = " + result[0].bits + " , " + result[1].bits + " , " + result[2].bits + " , " + result[3].bits);
//                }

                var vX = [], vY = [];
                for (var i = 0; i < array.length; i++) {
                    var cp = result[array[i]].centerPoint;
                    vX.push(cp[0]);
                    vY.push(cp[1]);
                    if (window.DEBUG) {
                        cv = document.getElementById('debugCanvas').getContext('2d');
                        cv.fillStyle = 'rgb(255,0,255)';
                        cv.fillRect(cp[0] - 5, cp[1] - 5, 10, 10);
                    }
                }

                i_callback.onSquareCompound(vX, vY); //TroLL
                boardCombination = true;
            });

            if (!boardCombination) {
                _offset.setSquare(100); //OPTIMICE FUNCTION
                if (window.DEBUG) {
                    cv = document.getElementById('debugCanvas').getContext('2d');
                    cv.fillStyle = 'rgb(255,0,255)';
                    cv.fillRect(param.centerPoint[0] - 5, param.centerPoint[1] - 5, 10, 10);
                }
                i_callback.onSquareResult(param, xcoord, ycoord); //TroLL
            }
        }
        return;
    }
});

function getMarkerCombination(params, callback) { //TroLL

    var b = [];
    for (var i = 0; i < 12; i++) {//make board
        b[i] = [];
        for (var j = 0; j < 12; j++) {
            b[i][j] = null;
        }
    }

    for (var i = 0; i < params.length; i++) { //set board values
        var p = params[i].marker.p;
        b[p.x][p.y] = i;
    }

    var p = params[params.length - 1].marker.p;
    var p0 = params.length - 1;
    var dv;
    for (var i = 1; i < params.length; i++) { //-2
        var p2 = params[i].marker.p;
        if (p2.x == p.x) {
            dv = Math.abs(p2.y - p.y);
        } else if (p2.y == p.y) {
            dv = Math.abs(p2.x - p.x);
        } else {
            continue;
        }
        if (dv == 0) { //same marker
            return;
        }
        if (check()) {
            return;
        }
    }

    function check() {
        var p1 = exists(p.x + dv, p.y);
        if (p1 != null) {
            var p2 = exists(p.x + dv, p.y + dv);
            var p3 = exists(p.x, p.y + dv);
            if (p2 != null && p3 != null) {
                callback([p0, p1, p2, p3], dv);
                return true;
            }

            var p2 = exists(p.x + dv, p.y - dv);
            var p3 = exists(p.x, p.y - dv);
            if (p2 != null && p3 != null) {
                callback([p0, p1, p2, p3], dv);
                return true;
            }
        }
        var p1 = exists(p.x - dv, p.y);
        if (p1 != null) {
            var p2 = exists(p.x - dv, p.y + dv);
            var p3 = exists(p.x, p.y + dv);
            if (p2 != null && p3 != null) {
                callback([p0, p1, p2, p3], dv);
                return true;
            }

            var p2 = exists(p.x - dv, p.y - dv);
            var p3 = exists(p.x, p.y - dv);
            if (p2 != null && p3 != null) {
                callback([p0, p1, p2, p3], dv);
                return true;
            }
        }
        return false;
    }

    function exists(x, y) {
        if (b[x] && b[x][y] != null) {
            return b[x][y];
        }
        return null;
    }
}

NyARRectOffset = ASKlass('NyARRectOffset', { // store the vertex information of the rectangle.

    vertex: NyARDoublePoint3d.createArray(4),
    createArray: function(i_number) {
        var ret = new Array(i_number);
        for (var i = 0; i < i_number; i++) {
            ret[i] = new NyARRectOffset();
        }
        return ret;
    },
    // Side length from the center position, you need to configure and create the offset information.
    setSquare: function(i_width) {
        var w_2 = i_width / 2.0;
        var vertex3d_ptr;
        vertex3d_ptr = this.vertex[0];
        vertex3d_ptr.x = -w_2;
        vertex3d_ptr.y = w_2;
        vertex3d_ptr.z = 0.0;
        vertex3d_ptr = this.vertex[1];
        vertex3d_ptr.x = w_2;
        vertex3d_ptr.y = w_2;
        vertex3d_ptr.z = 0.0;
        vertex3d_ptr = this.vertex[2];
        vertex3d_ptr.x = w_2;
        vertex3d_ptr.y = -w_2;
        vertex3d_ptr.z = 0.0;
        vertex3d_ptr = this.vertex[3];
        vertex3d_ptr.x = -w_2;
        vertex3d_ptr.y = -w_2;
        vertex3d_ptr.z = 0.0;
        return;
    }
});
NyARTransMat = ASKlass('NyARTransMat', {// class calculates ARMatrix from square information and holds it
    _projection_mat_ref: null,
    _rotmatrix: null,
    _transsolver: null,
    _mat_optimize: null,
    _ref_dist_factor: null,
    NyARTransMat: function(i_param) {
        var dist = i_param._dist;
        var pmat = i_param._projection_matrix;
        this._transsolver = new NyARTransportVectorSolver(pmat, 4);
        // If compatibility is important, and to use the NyARRotMatrix_ARToolKit.
        // The theory NyARRotMatrix_NyARToolKit and NyARRotMatrix_ARToolKit is the same, 
        // but value is shifted only slightly
        this._rotmatrix = new NyARRotMatrix(pmat);
        this._mat_optimize = new NyARPartialDifferentiationOptimize(pmat);
        this._ref_dist_factor = dist;
        this._projection_mat_ref = pmat;
        this.__transMat_vertex_2d = NyARDoublePoint2d.createArray(4);
        this.__transMat_vertex_3d = NyARDoublePoint3d.createArray(4);
        this.__transMat_trans = new NyARDoublePoint3d();
        this.__rot = new NyARDoubleMatrix33();
    }
    ,
    makeErrThreshold: function(i_vertex) { // Based on the vertex information, calculate the error threshold.
        var a, b, l1, l2;
        a = i_vertex[0].x - i_vertex[2].x;
        b = i_vertex[0].y - i_vertex[2].y;
        l1 = a * a + b * b;
        a = i_vertex[1].x - i_vertex[3].x;
        b = i_vertex[1].y - i_vertex[3].y;
        l2 = a * a + b * b;
        return (Math.sqrt(l1 > l2 ? l1 : l2)) / 200;
    }
    ,
    // double arGetTransMat( ARMarkerInfo *marker_info,double center[2], double width, double conv[3][4] )
    // @param i_square = * NyARSquare object to be calculated
    transMat: function(i_square, i_offset, o_result_conv) {
        console.log("transMat")

        var trans = this.__transMat_trans;
        var err_threshold = this.makeErrThreshold(i_square.sqvertex);
        // The amount of translation computer, and set the 2D coordinate system
        var vertex_2d = this.__transMat_vertex_2d;
        var vertex_3d = this.__transMat_vertex_3d;
        this._ref_dist_factor.ideal2ObservBatch(i_square.sqvertex, vertex_2d, 4);
        this._transsolver.set2dVertex(vertex_2d, 4);
        // Calculate the rotation matrix
        this._rotmatrix.initRotBySquare(i_square.line, i_square.sqvertex);
        // From the 3D coordinate system after the rotation, and calculate the amount of translation
        this._rotmatrix.getPoint3dBatch(i_offset.vertex, vertex_3d, 4);
        this._transsolver.solveTransportVector(vertex_3d, trans);
        // (Optimization of the rotation matrix and the amount of translation) optimization of the calculation results
        o_result_conv.error = this.optimize(this._rotmatrix, trans, this._transsolver, i_offset.vertex, vertex_2d, err_threshold);
        // Save matrix
        this.updateMatrixValue(this._rotmatrix, trans, o_result_conv);
        return;
    },
    // (non-Javadoc)
    // @see jp.nyatla.nyartoolkit.core.transmat.INyARTransMat#transMatContinue
    // (jp.nyatla.nyartoolkit.core.NyARSquare, int, double, jp.nyatla.nyartoolkit.core.transmat.NyARTransMatResult)
    transMatContinue: function(i_square, i_offset, o_result_conv) {

        var trans = this.__transMat_trans;
        // io_result_conv If the initial value, calculated in transMat.
        if (!o_result_conv.has_value) {
            this.transMat(i_square, i_offset, o_result_conv);
            return;
        }
        // To determine the threshold of optimization calculation
        var err_threshold = this.makeErrThreshold(i_square.sqvertex);
        // The amount of translation computer, and set the 2D coordinate system
        var vertex_2d = this.__transMat_vertex_2d;
        var vertex_3d = this.__transMat_vertex_3d;
        this._ref_dist_factor.ideal2ObservBatch(i_square.sqvertex, vertex_2d, 4);
        this._transsolver.set2dVertex(vertex_2d, 4);
        // Calculate the rotation matrix
        this._rotmatrix.initRotByPrevResult(o_result_conv);
        // From the 3D coordinate system after the rotation, and calculate the amount of translation
        this._rotmatrix.getPoint3dBatch(i_offset.vertex, vertex_3d, 4);
        this._transsolver.solveTransportVector(vertex_3d, trans);
        // keep to calculate the error rate of the current
        var min_err = this.errRate(this._rotmatrix, trans, i_offset.vertex, vertex_2d, 4, vertex_3d);
        var rot = this.__rot;
        // Again the error rate is greater than the last threshold error value
        if (min_err < o_result_conv.error + err_threshold) {
            console.log("HI")
            rot.setValue_NyARDoubleMatrix33(this._rotmatrix);
            // Try to optimization.
            for (var i = 0; i < 5; i++) { //cinco
                // Optimization of the transformation matrix
                this._mat_optimize.modifyMatrix(rot, trans, i_offset.vertex, vertex_2d, 4);
                var err = this.errRate(rot, trans, i_offset.vertex, vertex_2d, 4, vertex_3d);
//                console.log("E: " + err);
                if (min_err - err < err_threshold / 2) {
//                    console.log("break");
                    break;
                }
                this._transsolver.solveTransportVector(vertex_3d, trans);
                this._rotmatrix.setValue_NyARDoubleMatrix33(rot);
                min_err = err;
            }
            this.updateMatrixValue(this._rotmatrix, trans, o_result_conv);
        } else {
            console.log("BYE")
            // Calculate the rotation matrix
            this._rotmatrix.initRotBySquare(i_square.line, i_square.sqvertex);
            // From the 3D coordinate system after the rotation, and calculate the amount of translation
            this._rotmatrix.getPoint3dBatch(i_offset.vertex, vertex_3d, 4);
            this._transsolver.solveTransportVector(vertex_3d, trans);
            // (Optimization of the rotation matrix and the amount of translation) optimization of the calculation results
            min_err = this.optimize(this._rotmatrix, trans, this._transsolver, i_offset.vertex, vertex_2d, err_threshold);
            this.updateMatrixValue(this._rotmatrix, trans, o_result_conv);
        }
        o_result_conv.error = min_err;
        return;
    }
    ,
    optimize: function(io_rotmat, io_transvec, i_solver, i_offset_3d, i_2d_vertex, i_err_threshold) {
        var vertex_3d = this.__transMat_vertex_3d;
        // Calculate the value of the initial error
        var min_err = this.errRate(io_rotmat, io_transvec, i_offset_3d, i_2d_vertex, 4, vertex_3d);
        var rot = this.__rot;
        rot.setValue_NyARDoubleMatrix33(io_rotmat);
        for (var i = 0; i < 5; i++) { //cinco
            // Optimization of the transformation matrix
            this._mat_optimize.modifyMatrix(rot, io_transvec, i_offset_3d, i_2d_vertex, 4);
            var err = this.errRate(rot, io_transvec, i_offset_3d, i_2d_vertex, 4, vertex_3d);
//            console.log("E: " + err);
            if (min_err - err < i_err_threshold) {
                break;
            }
            i_solver.solveTransportVector(vertex_3d, io_transvec);
            io_rotmat.setValue_NyARDoubleMatrix33(rot);
            min_err = err;
        }
        return min_err;
    },
    // Error rate calculator
    errRate: function(io_rot, i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, o_rot_vertex) {
        var cp = this._projection_mat_ref;
        var cp00 = cp.m00;
        var cp01 = cp.m01;
        var cp02 = cp.m02;
        var cp11 = cp.m11;
        var cp12 = cp.m12;
        var err = 0;
        for (var i = 0; i < i_number_of_vertex; i++) {
            var x3d, y3d, z3d;
            o_rot_vertex[i].x = x3d = io_rot.m00 * i_vertex3d[i].x + io_rot.m01 * i_vertex3d[i].y + io_rot.m02 * i_vertex3d[i].z;
            o_rot_vertex[i].y = y3d = io_rot.m10 * i_vertex3d[i].x + io_rot.m11 * i_vertex3d[i].y + io_rot.m12 * i_vertex3d[i].z;
            o_rot_vertex[i].z = z3d = io_rot.m20 * i_vertex3d[i].x + io_rot.m21 * i_vertex3d[i].y + io_rot.m22 * i_vertex3d[i].z;
            x3d += i_trans.x;
            y3d += i_trans.y;
            z3d += i_trans.z;
            // Projective transformation
            var x2d = x3d * cp00 + y3d * cp01 + z3d * cp02;
            var y2d = y3d * cp11 + z3d * cp12;
            var h2d = z3d;
            // Error rate calculation
            var t1 = i_vertex2d[i].x - x2d / h2d;
            var t2 = i_vertex2d[i].y - y2d / h2d;
            err += t1 * t1 + t2 * t2;
        }
        return err / i_number_of_getContour_FLARBinRasterertex;
    }
    ,
    updateMatrixValue: function(i_rot, i_trans, o_result) { // update the transformation matrix parameters
        o_result.m00 = i_rot.m00;
        o_result.m01 = i_rot.m01;
        o_result.m02 = i_rot.m02;
        o_result.m03 = i_trans.x;
        o_result.m10 = i_rot.m10;
        o_result.m11 = i_rot.m11;
        o_result.m12 = i_rot.m12;
        o_result.m13 = i_trans.y;
        o_result.m20 = i_rot.m20;
        o_result.m21 = i_rot.m21;
        o_result.m22 = i_rot.m22;
        o_result.m23 = i_trans.z;
        o_result.has_value = true;
        return;
    }
});

NyARTransMatResult = ASKlass('NyARTransMatResult', NyARDoubleMatrix34, {//!IMPORTANT
    error: 0, // Error rate. INyARTransMat derived class will use this value.
    has_value: false,
    transformVertex_Number: function(i_x, i_y, i_z, o_out) {
        o_out.x = this.m00 * i_x + this.m01 * i_y + this.m02 * i_z + this.m03;
        o_out.y = this.m10 * i_x + this.m11 * i_y + this.m12 * i_z + this.m13;
        o_out.z = this.m20 * i_x + this.m21 * i_y + this.m22 * i_z + this.m23;
        return;
    }
});

// To match the actual image and the basic position, and fine-tune the angle → recalculate the amount of translation and optimizing the transform matrix
NyARPartialDifferentiationOptimize = ASKlass('NyARPartialDifferentiationOptimize', {
    _projection_mat_ref: null
    ,
    NyARPartialDifferentiationOptimize: function(i_projection_mat_ref) {
        this._projection_mat_ref = i_projection_mat_ref;
        this.__angles_in = TSinCosValue.createArray(3);
        this.__ang = new NyARDoublePoint3d();
        this.__sin_table = new FloatVector(4);
        return;
    }
    ,
    rotation2Sincos_ZXY: function(i_rot_matrix, o_out, o_ang) {
        var x, y, z;
        var sina = i_rot_matrix.m21;
        if (sina >= 1.0) {
            x = Math.PI / 2;
            y = 0;
            z = Math.atan2(-i_rot_matrix.m10, i_rot_matrix.m00);
        } else if (sina <= -1.0) {
            x = -Math.PI / 2;
            y = 0;
            z = Math.atan2(-i_rot_matrix.m10, i_rot_matrix.m00);
        } else {
            x = Math.asin(sina);
            y = Math.atan2(-i_rot_matrix.m20, i_rot_matrix.m22);
            z = Math.atan2(-i_rot_matrix.m01, i_rot_matrix.m11);
        }
        o_ang.x = x;
        o_ang.y = y;
        o_ang.z = z;
        o_out[0].sin_val = Math.sin(x);
        o_out[0].cos_val = Math.cos(x);
        o_out[1].sin_val = Math.sin(y);
        o_out[1].cos_val = Math.cos(y);
        o_out[2].sin_val = Math.sin(z);
        o_out[2].cos_val = Math.cos(z);
        return;
    }
    ,
    optimizeParamX: function(i_angle_y, i_angle_z, i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, i_hint_angle) {
        var cp = this._projection_mat_ref;
        var sinb = i_angle_y.sin_val;
        var cosb = i_angle_y.cos_val;
        var sinc = i_angle_z.sin_val;
        var cosc = i_angle_z.cos_val;
        var L, J, K, M, N, O;
        L = J = K = M = N = O = 0;
        for (var i = 0; i < i_number_of_vertex; i++) {
            var ix, iy, iz;
            ix = i_vertex3d[i].x;
            iy = i_vertex3d[i].y;
            iz = i_vertex3d[i].z;
            var cp00 = cp.m00;
            var cp01 = cp.m01;
            var cp02 = cp.m02;
            var cp11 = cp.m11;
            var cp12 = cp.m12;
            var X0 = (cp00 * (-sinc * sinb * ix + sinc * cosb * iz) + cp01 * (cosc * sinb * ix - cosc * cosb * iz) + cp02 * (iy));
            var X1 = (cp00 * (-sinc * iy) + cp01 * ((cosc * iy)) + cp02 * (-sinb * ix + cosb * iz));
            var X2 = (cp00 * (i_trans.x + cosc * cosb * ix + cosc * sinb * iz) + cp01 * ((i_trans.y + sinc * cosb * ix + sinc * sinb * iz)) + cp02 * (i_trans.z));
            var Y0 = (cp11 * (cosc * sinb * ix - cosc * cosb * iz) + cp12 * (iy));
            var Y1 = (cp11 * ((cosc * iy)) + cp12 * (-sinb * ix + cosb * iz));
            var Y2 = (cp11 * ((i_trans.y + sinc * cosb * ix + sinc * sinb * iz)) + cp12 * (i_trans.z));
            var H0 = (iy);
            var H1 = (-sinb * ix + cosb * iz);
            var H2 = i_trans.z;
            var VX = i_vertex2d[i].x;
            var VY = i_vertex2d[i].y;
            var a, b, c, d, e, f;
            a = (VX * H0 - X0);
            b = (VX * H1 - X1);
            c = (VX * H2 - X2);
            d = (VY * H0 - Y0);
            e = (VY * H1 - Y1);
            f = (VY * H2 - Y2);
            L += d * e + a * b;
            N += d * d + a * a;
            J += d * f + a * c;
            M += e * e + b * b;
            K += e * f + b * c;
            O += f * f + c * c;
        }
        L *= 2;
        J *= 2;
        K *= 2;
        return this.getMinimumErrorAngleFromParam(L, J, K, M, N, O, i_hint_angle);
    }
    ,
    optimizeParamY: function(i_angle_x, i_angle_z, i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, i_hint_angle) {
        var cp = this._projection_mat_ref;
        var sina = i_angle_x.sin_val;
        var cosa = i_angle_x.cos_val;
        var sinc = i_angle_z.sin_val;
        var cosc = i_angle_z.cos_val;
        var L, J, K, M, N, O;
        L = J = K = M = N = O = 0;
        for (var i = 0; i < i_number_of_vertex; i++) {
            var ix, iy, iz;
            ix = i_vertex3d[i].x;
            iy = i_vertex3d[i].y;
            iz = i_vertex3d[i].z;
            var cp00 = cp.m00;
            var cp01 = cp.m01;
            var cp02 = cp.m02;
            var cp11 = cp.m11;
            var cp12 = cp.m12;
            var X0 = (cp00 * (-sinc * sina * ix + cosc * iz) + cp01 * (cosc * sina * ix + sinc * iz) + cp02 * (-cosa * ix));
            var X1 = (cp01 * (sinc * ix - cosc * sina * iz) + cp00 * (cosc * ix + sinc * sina * iz) + cp02 * (cosa * iz));
            var X2 = (cp00 * (i_trans.x + (-sinc * cosa) * iy) + cp01 * (i_trans.y + (cosc * cosa) * iy) + cp02 * (i_trans.z + (sina) * iy));
            var Y0 = (cp11 * (cosc * sina * ix + sinc * iz) + cp12 * (-cosa * ix));
            var Y1 = (cp11 * (sinc * ix - cosc * sina * iz) + cp12 * (cosa * iz));
            var Y2 = (cp11 * (i_trans.y + (cosc * cosa) * iy) + cp12 * (i_trans.z + (sina) * iy));
            var H0 = (-cosa * ix);
            var H1 = (cosa * iz);
            var H2 = i_trans.z + (sina) * iy;
            var VX = i_vertex2d[i].x;
            var VY = i_vertex2d[i].y;
            var a, b, c, d, e, f;
            a = (VX * H0 - X0);
            b = (VX * H1 - X1);
            c = (VX * H2 - X2);
            d = (VY * H0 - Y0);
            e = (VY * H1 - Y1);
            f = (VY * H2 - Y2);
            L += d * e + a * b;
            N += d * d + a * a;
            J += d * f + a * c;
            M += e * e + b * b;
            K += e * f + b * c;
            O += f * f + c * c;
        }
        L *= 2;
        J *= 2;
        K *= 2;
        return this.getMinimumErrorAngleFromParam(L, J, K, M, N, O, i_hint_angle);
    }
    ,
    optimizeParamZ: function(i_angle_x, i_angle_y, i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, i_hint_angle) {
        var cp = this._projection_mat_ref;
        var sina = i_angle_x.sin_val;
        var cosa = i_angle_x.cos_val;
        var sinb = i_angle_y.sin_val;
        var cosb = i_angle_y.cos_val;
        var L, J, K, M, N, O;
        L = J = K = M = N = O = 0;
        for (var i = 0; i < i_number_of_vertex; i++) {
            var ix, iy, iz;
            ix = i_vertex3d[i].x;
            iy = i_vertex3d[i].y;
            iz = i_vertex3d[i].z;
            var cp00 = cp.m00;
            var cp01 = cp.m01;
            var cp02 = cp.m02;
            var cp11 = cp.m11;
            var cp12 = cp.m12;
            var X0 = (cp00 * (-sina * sinb * ix - cosa * iy + sina * cosb * iz) + cp01 * (ix * cosb + sinb * iz));
            var X1 = (cp01 * (sina * ix * sinb + cosa * iy - sina * iz * cosb) + cp00 * (cosb * ix + sinb * iz));
            var X2 = cp00 * i_trans.x + cp01 * (i_trans.y) + cp02 * (-cosa * sinb) * ix + cp02 * (sina) * iy + cp02 * ((cosb * cosa) * iz + i_trans.z);
            var Y0 = cp11 * (ix * cosb + sinb * iz);
            var Y1 = cp11 * (sina * ix * sinb + cosa * iy - sina * iz * cosb);
            var Y2 = (cp11 * i_trans.y + cp12 * (-cosa * sinb) * ix + cp12 * ((sina) * iy + (cosb * cosa) * iz + i_trans.z));
            var H0 = 0;
            var H1 = 0;
            var H2 = ((-cosa * sinb) * ix + (sina) * iy + (cosb * cosa) * iz + i_trans.z);
            var VX = i_vertex2d[i].x;
            var VY = i_vertex2d[i].y;
            var a, b, c, d, e, f;
            a = (VX * H0 - X0);
            b = (VX * H1 - X1);
            c = (VX * H2 - X2);
            d = (VY * H0 - Y0);
            e = (VY * H1 - Y1);
            f = (VY * H2 - Y2);
            L += d * e + a * b;
            N += d * d + a * a;
            J += d * f + a * c;
            M += e * e + b * b;
            K += e * f + b * c;
            O += f * f + c * c;
        }
        L *= 2;
        J *= 2;
        K *= 2;
        return this.getMinimumErrorAngleFromParam(L, J, K, M, N, O, i_hint_angle);
    }
    ,
    modifyMatrix: function(io_rot, i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex) {
        var angles_in = this.__angles_in; // x,y,z
        var ang = this.__ang;
        // Extract sin / cos value of ZXY system
        this.rotation2Sincos_ZXY(io_rot, angles_in, ang);
        ang.x += this.optimizeParamX(angles_in[1], angles_in[2], i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, ang.x);
        ang.y += this.optimizeParamY(angles_in[0], angles_in[2], i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, ang.y);
        ang.z += this.optimizeParamZ(angles_in[0], angles_in[1], i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, ang.z);
        io_rot.setZXYAngle_Number(ang.x, ang.y, ang.z);
        return;
    }
    ,
    getMinimumErrorAngleFromParam: function(iL, iJ, iK, iM, iN, iO, i_hint_angle) { //get point which error rate is minimized
        var sin_table = this.__sin_table;
        var M = (iN - iM) / iL;
        var J = iJ / iL;
        var K = -iK / iL;
        // Create a table from the parameter sin
        var number_of_sin = NyAREquationSolver.solve4Equation(
                -4 * M * M - 4,
                4 * K - 4 * J * M,
                4 * M * M - (K * K - 4) - J * J,
                4 * J * M - 2 * K, J * J - 1,
                sin_table
                );
        // keep getting the two minimum value.
        var min_ang_0 = Number.MAX_VALUE;
        var min_ang_1 = Number.MAX_VALUE;
        var min_err_0 = Number.MAX_VALUE;
        var min_err_1 = Number.MAX_VALUE;
        for (var i = 0; i < number_of_sin; i++) {
            // +-cos_v[i] vertex candidate
            var sin_rt = sin_table[i];
            var cos_rt = Math.sqrt(1 - (sin_rt * sin_rt));
            // Repair cos. Closer to 0 correct answers in the differential equation
            var a1 = 2 * cos_rt * sin_rt * M + sin_rt * (K - sin_rt) + cos_rt * (cos_rt + J);
            var a2 = 2 * (-cos_rt) * sin_rt * M + sin_rt * (K - sin_rt) + (-cos_rt) * ((-cos_rt) + J);
            // The cure to the absolute value, to keep getting cos value of true
            a1 = a1 < 0 ? -a1 : a1;
            a2 = a2 < 0 ? -a2 : a2;
            cos_rt = (a1 < a2) ? cos_rt : -cos_rt;
            var ang = Math.atan2(sin_rt, cos_rt);
            // Calculate the error value
            var err = iN * sin_rt * sin_rt + (iL * cos_rt + iJ) * sin_rt + iM * cos_rt * cos_rt + iK * cos_rt + iO;
            // earn a minimum of two.
            if (min_err_0 > err) {
                min_err_1 = min_err_0;
                min_ang_1 = min_ang_0;
                min_err_0 = err;
                min_ang_0 = ang;
            } else if (min_err_1 > err) {
                min_err_1 = err;
                min_ang_1 = ang;
            }
        }
        // Test [0]
        var gap_0;
        gap_0 = min_ang_0 - i_hint_angle;
        if (gap_0 > Math.PI) {
            gap_0 = (min_ang_0 - Math.PI * 2) - i_hint_angle;
        } else if (gap_0 < -Math.PI) {
            gap_0 = (min_ang_0 + Math.PI * 2) - i_hint_angle;
        }
        // Test [1]
        var gap_1;
        gap_1 = min_ang_1 - i_hint_angle;
        if (gap_1 > Math.PI) {
            gap_1 = (min_ang_1 - Math.PI * 2) - i_hint_angle;
        } else if (gap_1 < -Math.PI) {
            gap_1 = (min_ang_1 + Math.PI * 2) - i_hint_angle;
        }
        return Math.abs(gap_1) < Math.abs(gap_0) ? gap_1 : gap_0;
    }
});
TSinCosValue = ASKlass('TSinCosValue', {
    cos_val: 0,
    sin_val: 0,
    createArray: function(i_size) {
        var result = new Array(i_size);
        for (var i = 0; i < i_size; i++) {
            result[i] = new TSinCosValue();
        }
        return result;
    }
});
NyARRotMatrix = ASKlass('NyARRotMatrix', NyARDoubleMatrix33, {// Of rotation matrix calculation, 3x3 matrix
    NyARRotMatrix: function(i_matrix) { // will prepare the instance
        this.__initRot_vec1 = new NyARRotVector(i_matrix);
        this.__initRot_vec2 = new NyARRotVector(i_matrix);
        return;
    },
    __initRot_vec1: null,
    __initRot_vec2: null,
    // will restore the NyARRotMatrix from the contents of NyARTransMatResult.
    initRotByPrevResult: function(i_prev_result) {
        this.m00 = i_prev_result.m00;
        this.m01 = i_prev_result.m01;
        this.m02 = i_prev_result.m02;
        this.m10 = i_prev_result.m10;
        this.m11 = i_prev_result.m11;
        this.m12 = i_prev_result.m12;
        this.m20 = i_prev_result.m20;
        this.m21 = i_prev_result.m21;
        this.m22 = i_prev_result.m22;
        return;
    }
    ,
    initRotBySquare: function(i_linear, i_sqvertex) {
        var vec1 = this.__initRot_vec1;
        var vec2 = this.__initRot_vec2;
        // From the opposite side, to calculate the two vectors
        // Axis 1
        vec1.exteriorProductFromLinear(i_linear[0], i_linear[2]);
        vec1.checkVectorByVertex(i_sqvertex[0], i_sqvertex[1]);
        // Axis 2
        vec2.exteriorProductFromLinear(i_linear[1], i_linear[3]);
        vec2.checkVectorByVertex(i_sqvertex[3], i_sqvertex[0]);
        // Optimization of the rotation?
        NyARRotVector.checkRotation(vec1, vec2);
        this.m00 = vec1.v1;
        this.m10 = vec1.v2;
        this.m20 = vec1.v3;
        this.m01 = vec2.v1;
        this.m11 = vec2.v2;
        this.m21 = vec2.v3;
        // Calculate the last axis
        var w02 = vec1.v2 * vec2.v3 - vec1.v3 * vec2.v2;
        var w12 = vec1.v3 * vec2.v1 - vec1.v1 * vec2.v3;
        var w22 = vec1.v1 * vec2.v2 - vec1.v2 * vec2.v1;
        var w = Math.sqrt(w02 * w02 + w12 * w12 + w22 * w22);
        this.m02 = w02 / w;
        this.m12 = w12 / w;
        this.m22 = w22 / w;
        return;
    }
    ,
    // To convert a batch of multiple vertices
    getPoint3dBatch: function(i_in_point, i_out_point, i_number_of_vertex) {
        for (var i = i_number_of_vertex - 1; i >= 0; i--) {
            var out_ptr = i_out_point[i];
            var in_ptr = i_in_point[i];
            var x = in_ptr.x;
            var y = in_ptr.y;
            var z = in_ptr.z;
            out_ptr.x = this.m00 * x + this.m01 * y + this.m02 * z;
            out_ptr.y = this.m10 * x + this.m11 * y + this.m12 * z;
            out_ptr.z = this.m20 * x + this.m21 * y + this.m22 * z;
        }
        return;
    }
});
NyARRotVector = ASKlass('NyARRotVector', {
    // public member who
    v1: 0,
    v2: 0,
    v3: 0,
    // private members who
    _projection_mat_ref: null,
    _inv_cpara_array_ref: null,
    NyARRotVector: function(i_cmat) {
        var mat_a = new NyARMat(3, 3);
        var a_array = mat_a.m;
        a_array[0][0] = i_cmat.m00;
        a_array[0][1] = i_cmat.m01;
        a_array[0][2] = i_cmat.m02;
        a_array[1][0] = i_cmat.m10;
        a_array[1][1] = i_cmat.m11;
        a_array[1][2] = i_cmat.m12;
        a_array[2][0] = i_cmat.m20;
        a_array[2][1] = i_cmat.m21;
        a_array[2][2] = i_cmat.m22;
        mat_a.matrixSelfInv();
        this._projection_mat_ref = i_cmat;
        this._inv_cpara_array_ref = mat_a.m;
        // If the language is not GC, I own right transfer of the array here!
    }
    ,
    // I think it's ... to calculate the vector perpendicular to the two lines.
    exteriorProductFromLinear: function(i_linear1, i_linear2) {
        // First line
        var cmat = this._projection_mat_ref;
        var w1 = i_linear1.dy * i_linear2.dx - i_linear2.dy * i_linear1.dx;
        var w2 = i_linear1.dx * i_linear2.c - i_linear2.dx * i_linear1.c;
        var w3 = i_linear1.c * i_linear2.dy - i_linear2.c * i_linear1.dy;
        var m0 = w1 * (cmat.m01 * cmat.m12 - cmat.m02 * cmat.m11) + w2 * cmat.m11 - w3 * cmat.m01;
        var m1 = -w1 * cmat.m00 * cmat.m12 + w3 * cmat.m00;
        var m2 = w1 * cmat.m00 * cmat.m11;
        var w = Math.sqrt(m0 * m0 + m1 * m1 + m2 * m2);
        this.v1 = m0 / w;
        this.v2 = m1 / w;
        this.v3 = m2 / w;
        return;
    },
    // static int check_dir( double dir[3], double st[2], double ed[2],double cpara[3][4] ) Optimize[526->468]
    // By specifying the start / end coordinates of the vector, to adjust the direction of the vector
    checkVectorByVertex: function(i_start_vertex, i_end_vertex) {
        var h;
        var inv_cpara = this._inv_cpara_array_ref;
        //final double[] world = __checkVectorByVertex_world; // [2][3];
        var world0 = inv_cpara[0][0] * i_start_vertex.x * 10.0 + inv_cpara[0][1] * i_start_vertex.y * 10.0 + inv_cpara[0][2] * 10.0; // mat_a->m[0]*st[0]*10.0+
        var world1 = inv_cpara[1][0] * i_start_vertex.x * 10.0 + inv_cpara[1][1] * i_start_vertex.y * 10.0 + inv_cpara[1][2] * 10.0; // mat_a->m[3]*st[0]*10.0+
        var world2 = inv_cpara[2][0] * i_start_vertex.x * 10.0 + inv_cpara[2][1] * i_start_vertex.y * 10.0 + inv_cpara[2][2] * 10.0; // mat_a->m[6]*st[0]*10.0+
        var world3 = world0 + this.v1;
        var world4 = world1 + this.v2;
        var world5 = world2 + this.v3;
        // </Optimize>
        //final double[] camera = __checkVectorByVertex_camera; // [2][2];
        var cmat = this._projection_mat_ref;
        h = cmat.m20 * world0 + cmat.m21 * world1 + cmat.m22 * world2;
        if (h == 0.0) {
            throw new NyARException();
        }
        var camera0 = (cmat.m00 * world0 + cmat.m01 * world1 + cmat.m02 * world2) / h;
        var camera1 = (cmat.m10 * world0 + cmat.m11 * world1 + cmat.m12 * world2) / h;
        h = cmat.m20 * world3 + cmat.m21 * world4 + cmat.m22 * world5;
        if (h == 0.0) {
            throw new NyARException();
        }
        var camera2 = (cmat.m00 * world3 + cmat.m01 * world4 + cmat.m02 * world5) / h;
        var camera3 = (cmat.m10 * world3 + cmat.m11 * world4 + cmat.m12 * world5) / h;
        var v = (i_end_vertex.x - i_start_vertex.x) * (camera2 - camera0) + (i_end_vertex.y - i_start_vertex.y) * (camera3 - camera1);
        if (v < 0) {
            this.v1 = -this.v1;
            this.v2 = -this.v2;
            this.v3 = -this.v3;
        }
    }
    ,
    checkRotation: function(io_vec1, io_vec2) { // check_rotation (double rot[2][3]) to adjust the vector
        var w;
        var f;
        var vec10 = io_vec1.v1;
        var vec11 = io_vec1.v2;
        var vec12 = io_vec1.v3;
        var vec20 = io_vec2.v1;
        var vec21 = io_vec2.v2;
        var vec22 = io_vec2.v3;
        var vec30 = vec11 * vec22 - vec12 * vec21;
        var vec31 = vec12 * vec20 - vec10 * vec22;
        var vec32 = vec10 * vec21 - vec11 * vec20;
        w = Math.sqrt(vec30 * vec30 + vec31 * vec31 + vec32 * vec32);
        if (w == 0.0) {
            throw new NyARException();
        }
        vec30 /= w;
        vec31 /= w;
        vec32 /= w;
        var cb = vec10 * vec20 + vec11 * vec21 + vec12 * vec22;
        if (cb < 0) {
            cb = -cb;
        }
        var ca = (Math.sqrt(cb + 1.0) + Math.sqrt(1.0 - cb)) * 0.5;
        if (vec31 * vec10 - vec11 * vec30 != 0.0) {
            f = 0;
        } else {
            if (vec32 * vec10 - vec12 * vec30 != 0.0) {
                w = vec11;
                vec11 = vec12;
                vec12 = w;
                w = vec31;
                vec31 = vec32;
                vec32 = w;
                f = 1;
            } else {
                w = vec10;
                vec10 = vec12;
                vec12 = w;
                w = vec30;
                vec30 = vec32;
                vec32 = w;
                f = 2;
            }
        }
        if (vec31 * vec10 - vec11 * vec30 == 0.0) {
            throw new NyARException();
        }
        var k1, k2, k3, k4;
        var a, b, c, d;
        var p1, q1, r1;
        var p2, q2, r2;
        var p3, q3, r3;
        var p4, q4, r4;
        k1 = (vec11 * vec32 - vec31 * vec12) / (vec31 * vec10 - vec11 * vec30);
        k2 = (vec31 * ca) / (vec31 * vec10 - vec11 * vec30);
        k3 = (vec10 * vec32 - vec30 * vec12) / (vec30 * vec11 - vec10 * vec31);
        k4 = (vec30 * ca) / (vec30 * vec11 - vec10 * vec31);
        a = k1 * k1 + k3 * k3 + 1;
        b = k1 * k2 + k3 * k4;
        c = k2 * k2 + k4 * k4 - 1;
        d = b * b - a * c;
        if (d < 0) {
            throw new NyARException();
        }
        r1 = (-b + Math.sqrt(d)) / a;
        p1 = k1 * r1 + k2;
        q1 = k3 * r1 + k4;
        r2 = (-b - Math.sqrt(d)) / a;
        p2 = k1 * r2 + k2;
        q2 = k3 * r2 + k4;
        if (f == 1) {
            w = q1;
            q1 = r1;
            r1 = w;
            w = q2;
            q2 = r2;
            r2 = w;
            w = vec11;
            vec11 = vec12;
            vec12 = w;
            w = vec31;
            vec31 = vec32;
            vec32 = w;
            f = 0;
        }
        if (f == 2) {
            w = p1;
            p1 = r1;
            r1 = w;
            w = p2;
            p2 = r2;
            r2 = w;
            w = vec10;
            vec10 = vec12;
            vec12 = w;
            w = vec30;
            vec30 = vec32;
            vec32 = w;
            f = 0;
        }
        if (vec31 * vec20 - vec21 * vec30 != 0.0) {
            f = 0;
        } else {
            if (vec32 * vec20 - vec22 * vec30 != 0.0) {
                w = vec21;
                vec21 = vec22;
                vec22 = w;
                w = vec31;
                vec31 = vec32;
                vec32 = w;
                f = 1;
            } else {
                w = vec20;
                vec20 = vec22;
                vec22 = w;
                w = vec30;
                vec30 = vec32;
                vec32 = w;
                f = 2;
            }
        }
        if (vec31 * vec20 - vec21 * vec30 == 0.0) {
            throw new NyARException();
        }
        k1 = (vec21 * vec32 - vec31 * vec22) / (vec31 * vec20 - vec21 * vec30);
        k2 = (vec31 * ca) / (vec31 * vec20 - vec21 * vec30);
        k3 = (vec20 * vec32 - vec30 * vec22) / (vec30 * vec21 - vec20 * vec31);
        k4 = (vec30 * ca) / (vec30 * vec21 - vec20 * vec31);
        a = k1 * k1 + k3 * k3 + 1;
        b = k1 * k2 + k3 * k4;
        c = k2 * k2 + k4 * k4 - 1;
        d = b * b - a * c;
        if (d < 0) {
            throw new NyARException();
        }
        r3 = (-b + Math.sqrt(d)) / a;
        p3 = k1 * r3 + k2;
        q3 = k3 * r3 + k4;
        r4 = (-b - Math.sqrt(d)) / a;
        p4 = k1 * r4 + k2;
        q4 = k3 * r4 + k4;
        if (f == 1) {
            w = q3;
            q3 = r3;
            r3 = w;
            w = q4;
            q4 = r4;
            r4 = w;
            w = vec21;
            vec21 = vec22;
            vec22 = w;
            w = vec31;
            vec31 = vec32;
            vec32 = w;
            f = 0;
        }
        if (f == 2) {
            w = p3;
            p3 = r3;
            r3 = w;
            w = p4;
            p4 = r4;
            r4 = w;
            w = vec20;
            vec20 = vec22;
            vec22 = w;
            w = vec30;
            vec30 = vec32;
            vec32 = w;
            f = 0;
        }
        var e1 = p1 * p3 + q1 * q3 + r1 * r3;
        if (e1 < 0) {
            e1 = -e1;
        }
        var e2 = p1 * p4 + q1 * q4 + r1 * r4;
        if (e2 < 0) {
            e2 = -e2;
        }
        var e3 = p2 * p3 + q2 * q3 + r2 * r3;
        if (e3 < 0) {
            e3 = -e3;
        }
        var e4 = p2 * p4 + q2 * q4 + r2 * r4;
        if (e4 < 0) {
            e4 = -e4;
        }
        if (e1 < e2) {
            if (e1 < e3) {
                if (e1 < e4) {
                    io_vec1.v1 = p1;
                    io_vec1.v2 = q1;
                    io_vec1.v3 = r1;
                    io_vec2.v1 = p3;
                    io_vec2.v2 = q3;
                    io_vec2.v3 = r3;
                } else {
                    io_vec1.v1 = p2;
                    io_vec1.v2 = q2;
                    io_vec1.v3 = r2;
                    io_vec2.v1 = p4;
                    io_vec2.v2 = q4;
                    io_vec2.v3 = r4;
                }
            } else {
                if (e3 < e4) {
                    io_vec1.v1 = p2;
                    io_vec1.v2 = q2;
                    io_vec1.v3 = r2;
                    io_vec2.v1 = p3;
                    io_vec2.v2 = q3;
                    io_vec2.v3 = r3;
                } else {
                    io_vec1.v1 = p2;
                    io_vec1.v2 = q2;
                    io_vec1.v3 = r2;
                    io_vec2.v1 = p4;
                    io_vec2.v2 = q4;
                    io_vec2.v3 = r4;
                }
            }
        } else {
            if (e2 < e3) {
                if (e2 < e4) {
                    io_vec1.v1 = p1;
                    io_vec1.v2 = q1;
                    io_vec1.v3 = r1;
                    io_vec2.v1 = p4;
                    io_vec2.v2 = q4;
                    io_vec2.v3 = r4;
                } else {
                    io_vec1.v1 = p2;
                    io_vec1.v2 = q2;
                    io_vec1.v3 = r2;
                    io_vec2.v1 = p4;
                    io_vec2.v2 = q4;
                    io_vec2.v3 = r4;
                }
            } else {
                if (e3 < e4) {
                    io_vec1.v1 = p2;
                    io_vec1.v2 = q2;
                    io_vec1.v3 = r2;
                    io_vec2.v1 = p3;
                    io_vec2.v2 = q3;
                    io_vec2.v3 = r3;
                } else {
                    io_vec1.v1 = p2;
                    io_vec1.v2 = q2;
                    io_vec1.v3 = r2;
                    io_vec2.v1 = p4;
                    io_vec2.v2 = q4;
                    io_vec2.v3 = r4;
                }
            }
        }
        return;
    }
});
// get rotation matrix of the base already from [M] 3-dimensional coordinates and [b] the translation vector [T]

// Of ARToolKit augmented reality introductory programming, algorithm, is a thing of the P207

// Calculation procedure to the [A] T * [A] * [T] = [A] T * [b], the [A] * [T] = b
// calculating the [A] T * [A] = [M] in set2dVertex, and store only the information in the third column of A
// simultaneous equations [M] * [T] = [A] T * [b] in getTransportVector to obtain [T]
NyARTransportVectorSolver = ASKlass('NyARTransportVectorSolver', {
    _cx: null,
    _cy: null,
    _projection_mat: null,
    _nmber_of_vertex: 0,
    NyARTransportVectorSolver: function(i_projection_mat_ref, i_max_vertex) {
        this._projection_mat = i_projection_mat_ref;
        this._cx = new FloatVector(i_max_vertex);
        this._cy = new FloatVector(i_max_vertex);
        return;
    },
    _a00: 0, _a01_10: 0, _a02_20: 0, _a11: 0, _a12_21: 0, _a22: 0,
    // specify the coordinate group on the screen.
    // @param i_ref_vertex_2d = point to the reference value to vertex coordinate group of on-screen distortion correction already

    set2dVertex: function(i_ref_vertex_2d, i_number_of_vertex) {
        // create a 3x3 matrix in order from the matrix of 2n * 3 and 3x2n, the least-squares method calculation
        // Cache in the third column of the matrix [A]
        var cx = this._cx;
        var cy = this._cy;
        var m22;
        var p00 = this._projection_mat.m00;
        var p01 = this._projection_mat.m01;
        var p11 = this._projection_mat.m11;
        var p12 = this._projection_mat.m12;
        var p02 = this._projection_mat.m02;
        var w1, w2, w3, w4;
        this._a00 = i_number_of_vertex * p00 * p00;
        this._a01_10 = i_number_of_vertex * p00 * p01;
        this._a11 = i_number_of_vertex * (p01 * p01 + p11 * p11);
        // Calculation of [A] T * [A]
        m22 = 0;
        w1 = w2 = 0;
        for (var i = 0; i < i_number_of_vertex; i++) {
            // keep a coordinate
            w3 = p02 - (cx[i] = i_ref_vertex_2d[i].x);
            w4 = p12 - (cy[i] = i_ref_vertex_2d[i].y);
            w1 += w3;
            w2 += w4;
            m22 += w3 * w3 + w4 * w4;
        }
        this._a02_20 = w1 * p00;
        this._a12_21 = p01 * w1 + p11 * w2;
        this._a22 = m22;
        this._nmber_of_vertex = i_number_of_vertex;
        return;
    },
    // From three-dimensional coordinate group and the screen coordinate group, calculate the amount of translation
    // 2d coordinate system, use the ones that set2dVertex just performed
    // @param i_vertex_2d = same as that specified in the previous call to set2dVertex
    // @param i_vertex3d = three-dimensional space coordinate group (same order as the screen coordinate group)
    solveTransportVector: function(i_vertex3d, o_transfer) {
        var number_of_vertex = this._nmber_of_vertex;
        var p00 = this._projection_mat.m00;
        var p01 = this._projection_mat.m01;
        var p02 = this._projection_mat.m02;
        var p11 = this._projection_mat.m11;
        var p12 = this._projection_mat.m12;
        // Cache in the third column of the matrix [A]
        var cx = this._cx;
        var cy = this._cy;
        // The adaptation to the vertices of the original coordinate the rotation matrix
        // Calculate the [A] T * [b]
        var b1, b2, b3;
        b1 = b2 = b3 = 0;
        for (var i = 0; i < number_of_vertex; i++) {
            var w1 = i_vertex3d[i].z * cx[i] - p00 * i_vertex3d[i].x - p01 * i_vertex3d[i].y - p02 * i_vertex3d[i].z;
            var w2 = i_vertex3d[i].z * cy[i] - p11 * i_vertex3d[i].y - p12 * i_vertex3d[i].z;
            b1 += w1;
            b2 += w2;
            b3 += cx[i] * w1 + cy[i] * w2;
        }
        // Calculate the [A] T * [b]
        b3 = p02 * b1 + p12 * b2 - b3; // No good I have switched to order
        b2 = p01 * b1 + p11 * b2;
        b1 = p00 * b1;
        // Solved in equation ([A] T * [A]) * [T] = [A] T * [b].
        // and I think we may be assumed to be zero the a10 and a01?
        var a00 = this._a00;
        var a01 = this._a01_10;
        var a02 = this._a02_20;
        var a11 = this._a11;
        var a12 = this._a12_21;
        var a22 = this._a22;
        var t1 = a22 * b2 - a12 * b3;
        var t2 = a12 * b2 - a11 * b3;
        var t3 = a01 * b3 - a02 * b2;
        var t4 = a12 * a12 - a11 * a22;
        var t5 = a02 * a12 - a01 * a22;
        var t6 = a02 * a11 - a01 * a12;
        var det = a00 * t4 - a01 * t5 + a02 * t6;
        o_transfer.x = (a01 * t1 - a02 * t2 + b1 * t4) / det;
        o_transfer.y = -(a00 * t1 + a02 * t3 + b1 * t5) / det;
        o_transfer.z = (a00 * t2 + a01 * t3 + b1 * t6) / det;
        return;
    }
});

NyARMath = Klass({// http://aoki2.si.gunma-u.ac.jp/JavaScript/src/3jisiki.html    
    cubeRoot: function(i_in) { // On systems that do not asks for the cube root, I will ask the third root.
        var res = Math.pow(Math.abs(i_in), 1.0 / 3.0);
        return (i_in >= 0) ? res : -res;
    }
});
NyAREquationSolver = Klass({
    solve2Equation_2b: function(i_b, i_c, o_result, i_result_st) {

        var t = i_b * i_b - 4 * i_c;
        if (t < 0) { // Imaginary roots                    
            return 0;
        } else if (t == 0) { // Multiple root
            o_result[i_result_st + 0] = -i_b / (2);
            return 1;
        } else { // Two real roots
            t = Math.sqrt(t);
            o_result[i_result_st + 0] = (-i_b + t) / (2);
            o_result[i_result_st + 1] = (-i_b - t) / (2);
            return 2;
        }
    },
    // seek only the real roots of the fourth-order equation. 
    // @ Param i_a = Coefficient of X ^ 3
    // @ Param i_b = Coefficient of X ^ 2 
    // @ Param i_c = Coefficient of X ^ 1 
    // @ Param i_d = Coefficient of X ^ 0 
    // @ Param o_result = Real roots. By specifying a double [3].
    solve4Equation: function(i_a, i_b, i_c, i_d, i_e, o_result) {

        NyAS3Utils.assert(i_a != 0);
        var A3, A2, A1, A0, B3;
        A3 = i_b / i_a;
        A2 = i_c / i_a;
        A1 = i_d / i_a;
        A0 = i_e / i_a;
        B3 = A3 / 4;
        var p, q, r;
        var B3_2 = B3 * B3;
        p = A2 - 6 * B3_2; //A2-6*B3*B3;
        q = A1 + B3 * (-2 * A2 + 8 * B3_2); //A1-2*A2*B3+8*B3*B3*B3;
        r = A0 + B3 * (-A1 + A2 * B3) - 3 * B3_2 * B3_2; //A0-A1*B3+A2*B3*B3-3*B3*B3*B3*B3;

        if (q == 0) {
            var result_0, result_1;
            var res = this.solve2Equation_2b(p, r, o_result, 0); //Quadratic multiple

            switch (res) {

                case 0: // All imaginary solution                            
                    return 0;
                case 1: // Multiple root

                    result_0 = o_result[0]; // 0, 1 or 2.

                    if (result_0 < 0) { // All imaginary solution                                
                        return 0;
                    } else if (result_0 == 0) { // One real root
                        o_result[0] = 0 - B3;
                        return 1;
                    } else { //Two real roots                                
                        result_0 = Math.sqrt(result_0);
                        o_result[0] = result_0 - B3;
                        o_result[1] = -result_0 - B3;
                        return 2;
                    }

                case 2: //T2 == 0 t == is impossible because it is two real roots. (case1)
                    result_0 = o_result[0]; //0, 2, or 4
                    result_1 = o_result[1]; //0, 2, or 4
                    var number_of_result = 0;
                    if (result_0 > 0) { //NC
                        result_0 = Math.sqrt(result_0);
                        o_result[0] = result_0 - B3;
                        o_result[1] = -result_0 - B3;
                        number_of_result += 2;
                    }

                    if (result_1 > 0) { //NC
                        result_1 = Math.sqrt(result_1);
                        o_result[number_of_result + 0] = result_1 - B3;
                        o_result[number_of_result + 1] = -result_1 - B3;
                        number_of_result += 2;
                    }

                    return number_of_result;
                default:
                    throw new NyARException();
            }

        } else { //Other
            // Optimization point:                    
            var u = this.solve3Equation_1(// u^3  + (2*p)*u^2  +((- 4*r)+(p^2))*u -q^2= 0
                    (2 * p),
                    (-4 * r) + Math.pow(p, 2),
                    Math.pow(-q, 2)
                    );
            if (u < 0) { //All imaginary solution       
                return 0;
            }

            var ru = Math.sqrt(u);
            //By solving the quadratic equation calculation (optimization point) and y
            var result_1st, result_2nd;
            result_1st = this.solve2Equation_2b(-ru, (p + u) / 2 + ru * q / (2 * u), o_result, 0);
            switch (result_1st) { //For sequence repeated use, are saved to the variable

                case 0:
                    break;
                case 1:
                    o_result[0] = o_result[0] - B3;
                    break;
                case 2:
                    o_result[0] = o_result[0] - B3;
                    o_result[1] = o_result[1] - B3;
                    break;
                default:
                    throw new NyARException();
            }

            result_2nd = this.solve2Equation_2b(ru, (p + u) / 2 - ru * q / (2 * u), o_result, result_1st);
            switch (result_2nd) { //Stored in 0,1 th

                case 0:
                    break;
                case 1:
                    o_result[result_1st + 0] = o_result[result_1st + 0] - B3;
                    break;
                case 2:
                    o_result[result_1st + 0] = o_result[result_1st + 0] - B3;
                    o_result[result_1st + 1] = o_result[result_1st + 1] - B3;
                    break;
                default:
                    throw new NyARException();
            }
            return result_1st + result_2nd;
        }
    },
    solve3Equation_1: function(i_b, i_c, i_d) { // ask only one real root of the cubic equation, 4 characters in equation. 
        var tmp, b, p, q;
        b = i_b / (3);
        p = b * b - i_c / 3;
        q = (b * (i_c - 2 * b * b) - i_d) / 2;
        if ((tmp = q * q - p * p * p) == 0) { // Multiple root                    
            q = NyARMath.cubeRoot(q);
            return 2 * q - b;
        } else if (tmp > 0) { // Real roots 1, 2 Kyone
            var a3 = NyARMath.cubeRoot(q + ((q > 0) ? 1 : -1) * Math.sqrt(tmp));
            var b3 = p / a3;
            return a3 + b3 - b;
        } else { // Three real roots
            tmp = 2 * Math.sqrt(p);
            var t = Math.acos(q / (p * tmp / 2));
            return tmp * Math.cos(t / 3) - b;
        }
    }
});
NyARPerspectiveParamGenerator_O1 = Klass({
    _local_x: 0,
    _local_y: 0,
    _width: 0,
    _height: 0,
    initialize: function(i_local_x, i_local_y, i_width, i_height) {

        this.height = i_height;
        this.width = i_width;
        this._local_x = i_local_x;
        this._local_y = i_local_y;
        return;
    },
    getParam: function(i_vertex, o_param) {

        var ltx = this._local_x;
        var lty = this._local_y;
        var rbx = ltx + this.width;
        var rby = lty + this.height;
        var det_1;
        var a13, a14, a23, a24, a33, a34, a43, a44;
        var b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;
        var t1, t2, t3, t4, t5, t6;
        var v1, v2, v3, v4;
        var kx0, kx1, kx2, kx3, kx4, kx5, kx6, kx7;
        var ky0, ky1, ky2, ky3, ky4, ky5, ky6, ky7;
        {
            v1 = i_vertex[0].x;
            v2 = i_vertex[1].x;
            v3 = i_vertex[2].x;
            v4 = i_vertex[3].x;
            a13 = -ltx * v1;
            a14 = -lty * v1;
            a23 = -rbx * v2;
            a24 = -lty * v2;
            a33 = -rbx * v3;
            a34 = -rby * v3;
            a43 = -ltx * v4;
            a44 = -rby * v4;
            t1 = a33 * a44 - a34 * a43;
            t4 = a34 * ltx - rbx * a44;
            t5 = rbx * a43 - a33 * ltx;
            t2 = rby * (a34 - a44);
            t3 = rby * (a43 - a33);
            t6 = rby * (rbx - ltx);
            b21 = -a23 * t4 - a24 * t5 - rbx * t1;
            b11 = (a23 * t2 + a24 * t3) + lty * t1;
            b31 = (a24 * t6 - rbx * t2) + lty * t4;
            b41 = (-rbx * t3 - a23 * t6) + lty * t5;
            t1 = a43 * a14 - a44 * a13;
            t2 = a44 * lty - rby * a14;
            t3 = rby * a13 - a43 * lty;
            t4 = ltx * (a44 - a14);
            t5 = ltx * (a13 - a43);
            t6 = ltx * (lty - rby);
            b12 = -rby * t1 - a33 * t2 - a34 * t3;
            b22 = (a33 * t4 + a34 * t5) + rbx * t1;
            b32 = (-a34 * t6 - rby * t4) + rbx * t2;
            b42 = (-rby * t5 + a33 * t6) + rbx * t3;
            t1 = a13 * a24 - a14 * a23;
            t4 = a14 * rbx - ltx * a24;
            t5 = ltx * a23 - a13 * rbx;
            t2 = lty * (a14 - a24);
            t3 = lty * (a23 - a13);
            t6 = lty * (ltx - rbx);
            b23 = -a43 * t4 - a44 * t5 - ltx * t1;
            b13 = (a43 * t2 + a44 * t3) + rby * t1;
            b33 = (a44 * t6 - ltx * t2) + rby * t4;
            b43 = (-ltx * t3 - a43 * t6) + rby * t5;
            t1 = a23 * a34 - a24 * a33;
            t2 = a24 * rby - lty * a34;
            t3 = lty * a33 - a23 * rby;
            t4 = rbx * (a24 - a34);
            t5 = rbx * (a33 - a23);
            t6 = rbx * (rby - lty);
            b14 = -lty * t1 - a13 * t2 - a14 * t3;
            b24 = a13 * t4 + a14 * t5 + ltx * t1;
            b34 = -a14 * t6 - lty * t4 + ltx * t2;
            b44 = -lty * t5 + a13 * t6 + ltx * t3;
            det_1 = (ltx * (b11 + b14) + rbx * (b12 + b13));
            if (det_1 == 0) {
                det_1 = 0.0001;
//                console.log("Could not get inverse matrix(1). NyARUtils.js. return false?");
//                return false;
            }

            det_1 = 1 / det_1;
            kx0 = (b11 * v1 + b12 * v2 + b13 * v3 + b14 * v4) * det_1;
            kx1 = (b11 + b12 + b13 + b14) * det_1;
            kx2 = (b21 * v1 + b22 * v2 + b23 * v3 + b24 * v4) * det_1;
            kx3 = (b21 + b22 + b23 + b24) * det_1;
            kx4 = (b31 * v1 + b32 * v2 + b33 * v3 + b34 * v4) * det_1;
            kx5 = (b31 + b32 + b33 + b34) * det_1;
            kx6 = (b41 * v1 + b42 * v2 + b43 * v3 + b44 * v4) * det_1;
            kx7 = (b41 + b42 + b43 + b44) * det_1;
        }
        {
            v1 = i_vertex[0].y;
            v2 = i_vertex[1].y;
            v3 = i_vertex[2].y;
            v4 = i_vertex[3].y;
            a13 = -ltx * v1;
            a14 = -lty * v1;
            a23 = -rbx * v2;
            a24 = -lty * v2;
            a33 = -rbx * v3;
            a34 = -rby * v3;
            a43 = -ltx * v4;
            a44 = -rby * v4;
            t1 = a33 * a44 - a34 * a43;
            t4 = a34 * ltx - rbx * a44;
            t5 = rbx * a43 - a33 * ltx;
            t2 = rby * (a34 - a44);
            t3 = rby * (a43 - a33);
            t6 = rby * (rbx - ltx);
            b21 = -a23 * t4 - a24 * t5 - rbx * t1;
            b11 = (a23 * t2 + a24 * t3) + lty * t1;
            b31 = (a24 * t6 - rbx * t2) + lty * t4;
            b41 = (-rbx * t3 - a23 * t6) + lty * t5;
            t1 = a43 * a14 - a44 * a13;
            t2 = a44 * lty - rby * a14;
            t3 = rby * a13 - a43 * lty;
            t4 = ltx * (a44 - a14);
            t5 = ltx * (a13 - a43);
            t6 = ltx * (lty - rby);
            b12 = -rby * t1 - a33 * t2 - a34 * t3;
            b22 = (a33 * t4 + a34 * t5) + rbx * t1;
            b32 = (-a34 * t6 - rby * t4) + rbx * t2;
            b42 = (-rby * t5 + a33 * t6) + rbx * t3;
            t1 = a13 * a24 - a14 * a23;
            t4 = a14 * rbx - ltx * a24;
            t5 = ltx * a23 - a13 * rbx;
            t2 = lty * (a14 - a24);
            t3 = lty * (a23 - a13);
            t6 = lty * (ltx - rbx);
            b23 = -a43 * t4 - a44 * t5 - ltx * t1;
            b13 = (a43 * t2 + a44 * t3) + rby * t1;
            b33 = (a44 * t6 - ltx * t2) + rby * t4;
            b43 = (-ltx * t3 - a43 * t6) + rby * t5;
            t1 = a23 * a34 - a24 * a33;
            t2 = a24 * rby - lty * a34;
            t3 = lty * a33 - a23 * rby;
            t4 = rbx * (a24 - a34);
            t5 = rbx * (a33 - a23);
            t6 = rbx * (rby - lty);
            b14 = -lty * t1 - a13 * t2 - a14 * t3;
            b24 = a13 * t4 + a14 * t5 + ltx * t1;
            b34 = -a14 * t6 - lty * t4 + ltx * t2;
            b44 = -lty * t5 + a13 * t6 + ltx * t3;
            det_1 = (ltx * (b11 + b14) + rbx * (b12 + b13));
            if (det_1 == 0) {
                det_1 = 0.0001;
//                console.log("Could not get inverse matrix(2). NyARUtils.js. return false?");
//                return false;
            }
            det_1 = 1 / det_1;
            ky0 = (b11 * v1 + b12 * v2 + b13 * v3 + b14 * v4) * det_1;
            ky1 = (b11 + b12 + b13 + b14) * det_1;
            ky2 = (b21 * v1 + b22 * v2 + b23 * v3 + b24 * v4) * det_1;
            ky3 = (b21 + b22 + b23 + b24) * det_1;
            ky4 = (b31 * v1 + b32 * v2 + b33 * v3 + b34 * v4) * det_1;
            ky5 = (b31 + b32 + b33 + b34) * det_1;
            ky6 = (b41 * v1 + b42 * v2 + b43 * v3 + b44 * v4) * det_1;
            ky7 = (b41 + b42 + b43 + b44) * det_1;
        }
        det_1 = kx5 * (-ky7) - (-ky5) * kx7;
        if (det_1 == 0) {
            det_1 = 0.0001;
//            console.log("Could not get inverse matrix(3). NyARUtils. return false?");
//            return false;
        }
        det_1 = 1 / det_1;
        var C, F;
        o_param[2] = C = (-ky7 * det_1) * (kx4 - ky4) + (ky5 * det_1) * (kx6 - ky6); // C
        o_param[5] = F = (-kx7 * det_1) * (kx4 - ky4) + (kx5 * det_1) * (kx6 - ky6); // F
        o_param[6] = kx4 - C * kx5;
        o_param[7] = kx6 - C * kx7;
        o_param[0] = kx0 - C * kx1;
        o_param[1] = kx2 - C * kx3;
        o_param[3] = ky0 - F * ky1;
        o_param[4] = ky2 - F * ky3;
        return true;
    }
});
NyIdMarkerPattern = ASKlass('NyIdMarkerPattern', {
    data: new IntVector(32),
    init: function() { //TroLL
        this.data = new IntVector(32);
    }
});
MarkerPattEncoder = ASKlass('MarkerPattEncoder', {//DEFAULT6
    _bits: 0
    ,
    setBitByBitIndex: function(i_value) {
        this._bits = parseInt(this._bits.toString(2) + i_value, 2);
        return;
    }
});
NyIdMarkerPickup = ASKlass('NyIdMarkerPickup', {// NyARIdMarkerData from any rectangle of the raster image //DEFAULT5
    _perspective_reader: null,
    __pickFromRaster_encoder: new MarkerPattEncoder(),
    NyIdMarkerPickup: function() {
        this._perspective_reader = new PerspectivePixelReader();
        return;
    }
    ,
    init: function() { // Initialize the marker for a new frame. Clears old cache values
        this._perspective_reader.newFrame();
    }
    ,
    // read id marker from i_image. Marker data to o_data, marker parameters to o_param.
    pickFromRaster: function(image, i_vertex, o_param) {

        // Calculate the parameters of perspective
        if (!this._perspective_reader.setSourceSquare(i_vertex)) {
            if (window.DEBUG)
//                console.log('NyIdMarkerPickup.pickFromRaster: could not setSourceSquare')
                return false;
        }

        var reader = image._gray_reader;
        var encoder = this.__pickFromRaster_encoder;
        encoder._bits = 0;
        // Get the marker parameter
        if (!this._perspective_reader.readDataBits(reader, encoder)) {
            if (window.DEBUG)
//                console.log('NyIdMarkerPickup.pickFromRaster: could not readDataBits')
                return false;
        }

        o_param.bits = encoder._bits; //TroLL
        o_param.marker = board[o_param.bits];
        if (!o_param.marker) {
            return false;
        }
        //TroLL
        var cp = this._perspective_reader.centerPoint;
        o_param.centerPoint = new IntVector([cp[0], cp[1]]);
        o_param.direction = o_param.marker.d;
        return true;
    }
});
// reading NyARColorPatt_NyIdMarker. Conversion from raster Perspective
PerspectivePixelReader = ASKlass('PerspectivePixelReader', {
    _param_gen: new NyARPerspectiveParamGenerator_O1(1, 1, 100, 100),
    _cparam: new FloatVector(8),
    PerspectivePixelReader: function() {
        return;
    },
    maxPreviousFrameAge: 1
    ,
    newFrame: function() {
        for (var i in this.previousFrames) {
            var pf = this.previousFrames[i];
            pf.age++;
            if (pf.age > this.maxPreviousFrameAge) {
                delete this.previousFrames[i];
            }
        }
    }
    ,
    setSourceSquare: function(i_vertex) {
        var cx = 0, cy = 0;
        for (var i = 0; i < 4; i++) {
            cx += i_vertex[i].x;
            cy += i_vertex[i].y;
        }
        cx /= 4;
        cy /= 4;
//        var qx = toInt(cx / 10);
//        var qy = toInt(cy / 10);
        var qx = cx;
        var qy = cy;
        this.centerPoint[0] = qx;//.
        this.centerPoint[1] = qy;
        return this._param_gen.getParam(i_vertex, this._cparam);
    }
    ,
    FRQ_EDGE: 10,
    _ref_x: new IntVector(108),
    _ref_y: new IntVector(108),
    // whichever is greater this.THRESHOLD_PIXEL * 3 and (model +1) * 4 * 3
    _pixcel_temp: new IntVector(108)
    ,
    centerPoint: new IntVector(2)
    ,
    readDataBits: function(i_reader, o_bitbuffer) {
        // Get the reading position        
        var index_x = new FloatVector([26, 34, 46, 54, 66, 74]); //TroLL
        var index_y = new FloatVector([26, 34, 46, 54, 66, 74]);
        var resolution = 3;
        o_bitbuffer._bits = 0;
        var cpara = this._cparam;
        var ref_x = this._ref_x;
        var ref_y = this._ref_y;
        var pixcel_temp = this._pixcel_temp;
        var cpara_0 = cpara[0];
        var cpara_1 = cpara[1];
        var cpara_3 = cpara[3];
        var cpara_6 = cpara[6];
        var p = 0;
        for (var i = 0; i < resolution; i++) {
            var i2;
            // calculate the index values ​​of the pixels of one column.
            var cy0 = 1 + index_y[i * 2 + 0];
            var cy1 = 1 + index_y[i * 2 + 1];
            var cpy0_12 = cpara_1 * cy0 + cpara[2];
            var cpy0_45 = cpara[4] * cy0 + cpara[5];
            var cpy0_7 = cpara[7] * cy0 + 1.0;
            var cpy1_12 = cpara_1 * cy1 + cpara[2];
            var cpy1_45 = cpara[4] * cy1 + cpara[5];
            var cpy1_7 = cpara[7] * cy1 + 1.0;
            var pt = 0;
            for (i2 = 0; i2 < resolution; i2++) {
                var d;
                var cx0 = 1 + index_x[i2 * 2 + 0];
                var cx1 = 1 + index_x[i2 * 2 + 1];
                var cp6_0 = cpara_6 * cx0;
                var cpx0_0 = cpara_0 * cx0;
                var cpx3_0 = cpara_3 * cx0;
                var cp6_1 = cpara_6 * cx1;
                var cpx0_1 = cpara_0 * cx1;
                var cpx3_1 = cpara_3 * cx1;
                d = cp6_0 + cpy0_7;
                ref_x[pt] = toInt((cpx0_0 + cpy0_12) / d);
                ref_y[pt] = toInt((cpx3_0 + cpy0_45) / d);
                pt++;
                d = cp6_0 + cpy1_7;
                ref_x[pt] = toInt((cpx0_0 + cpy1_12) / d);
                ref_y[pt] = toInt((cpx3_0 + cpy1_45) / d);
                pt++;
                d = cp6_1 + cpy0_7;
                ref_x[pt] = toInt((cpx0_1 + cpy0_12) / d);
                ref_y[pt] = toInt((cpx3_1 + cpy0_45) / d);
                pt++;
                d = cp6_1 + cpy1_7;
                ref_x[pt] = toInt((cpx0_1 + cpy1_12) / d);
                ref_y[pt] = toInt((cpx3_1 + cpy1_45) / d);
                pt++;
            }

            // (The person who wrote the only accessor is good in some cases) to get the pixel of one line
            i_reader.getPixelSet(ref_x, ref_y, resolution * 4, pixcel_temp);
            // While the gray scale, transfer to the line → map
            for (i2 = 0; i2 < resolution; i2++) {
                var index = i2 * 4;
                var pixel = (pixcel_temp[index + 0] + pixcel_temp[index + 1] + pixcel_temp[index + 2] + pixcel_temp[index + 3]) / (4);
                // 1 = bright point, 0 = dark point                
                if (pixel == 255) {
                    o_bitbuffer.setBitByBitIndex(0);
                } else if (pixel == 0) {
                    o_bitbuffer.setBitByBitIndex(1);
                } else {
                    return false;
                }
                p++;
            }
        }
        o_bitbuffer.size = 0;
        return true;
    }
});
FLARIdMarkerData = ASKlass('FLARIdMarkerData', {
    _packet: new IntVector(22), // express Vector packet data. (Maximum number of packets: 21 + (1) in the model 7
    _dataDot: 0,
    packetLength: 0,
    FLARIdMarkerData: function() {
    }
    ,
    isEqual: function(i_target) {
        if (i_target == null || !(i_target instanceof FLARIdMarkerData)) {
            return false;
        }
        var s = i_target;
        if (s.packetLength != this.packetLength ||
                s._dataDot != this._dataDot) {
            return false;
        }
        for (var i = s.packetLength - 1; i >= 0; i--) {
            if (s._packet[i] != this._packet[i]) {
                return false;
            }
        }
        return true;
    }
    ,
    copyFrom: function(i_source) {
        var s = i_source;
        if (s == null)
            return;
        this._dataDot = s._dataDot;
        this.packetLength = s.packetLength;
        for (var i = s.packetLength - 1; i >= 0; i--) {
            this._packet[i] = s._packet[i];
        }
        return;
    },
    ////////////////////////////////////////////////////////////////////////////
    // SETTERS
    setPacketData: function(index, data) {
        if (index < this.packetLength) {
            this._packet[index] = data;
        } else {
            throw ("packet index over " + index + " >= " + this.packetLength);
        }
    }
    ,
    ////////////////////////////////////////////////////////////////////////////
    // GETTERS
    getPacketData: function(index) {
        if (this.packetLength <= index)
            throw new ArgumentError("packet index over");
        return this._packet[index];
    }
});
FLARDetectIdMarkerResult = ASKlass('FLARDetectIdMarkerResult', {
    markerdata: new FLARIdMarkerData(),
    square: new NyARSquare()
});
FLARDetectIdMarkerResultStack = ASKlass('FLARDetectIdMarkerResultStack', NyARObjectStack, {
    FLARDetectIdMarkerResultStack: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
    },
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new FLARDetectIdMarkerResult();
        }
        return (ret);
    }
});
FLARMultiIdMarkerDetectCB = ASKlass('FLARMultiIdMarkerDetectCB', {// callback function of detectMarker DEFAULT3
// Public properties
    result_stack: new FLARDetectIdMarkerResultStack(300),
    square: new FLARSquare(),
    _ref_raster: null,
    _data_temp: null,
    _prev_data: null,
    _id_pickup: new NyIdMarkerPickup(),
    _coordline: null,
    __tmp_vertex: NyARIntPoint2d.createArray(4),
    _maker_pattern: new NyIdMarkerPattern()
    ,
    FLARMultiIdMarkerDetectCB: function(i_param) {
        this._coordline = new NyARCoord2Linear(i_param._screen_size, i_param._dist);
        this._data_temp = new FLARIdMarkerData();
        return;
    }
    ,
    init: function(i_raster) { // Initialize call back handler.
        this.result_stack._length = 0;
        this._id_pickup.init();
        this._ref_raster = i_raster;
    }
    ,
    onSquareDetect: function(i_coordx, i_coordy, i_vertex_index) { //ensure pattern vertex data with the orientation
        // Convert to vertex list from the contour coordinate
        var vertex = this.__tmp_vertex;
        vertex[0].x = i_coordx[i_vertex_index[0]];
        vertex[0].y = i_coordy[i_vertex_index[0]];
        vertex[1].x = i_coordx[i_vertex_index[1]];
        vertex[1].y = i_coordy[i_vertex_index[1]];
        vertex[2].x = i_coordx[i_vertex_index[2]];
        vertex[2].y = i_coordy[i_vertex_index[2]];
        vertex[3].x = i_coordx[i_vertex_index[3]];
        vertex[3].y = i_coordy[i_vertex_index[3]];
        // I cut out from the image a pattern of the evaluation criteria
        var cv;
        if (window.DEBUG) {
            cv = document.getElementById('debugCanvas').getContext('2d');
            cv.fillStyle = 'blue';
            for (var i = 0; i < 4; i++) {
                cv.fillRect(vertex[i].x - 2, vertex[i].y - 2, 5, 5); //cinco
            }
        }
        var cx = 0, cy = 0;
        for (var i = 0; i < 4; i++) {
            cx += vertex[i].x;
            cy += vertex[i].y;
        }
        cx /= 4;
        cy /= 4;

        var param = {};
        if (!this._id_pickup.pickFromRaster(this._ref_raster, vertex, param)) {
            return false; //check next square
        }

        if (window.DEBUG) {
            cv.font = "bold 16px Verdana";
            cv.fillStyle = '#ff0000';
            cv.fillText(param.bits, cx + 3, cy);
        }
        return param; //marker info
    }
    ,
    onSquareResult: function(param, i_coordx, i_coordy) {
        var i_coor_num = param.i_coor_num;
        var i_vertex_index = param.i_vertex_index;

        // record the marker information.
        var result = this.result_stack.prePush();
        //result.direction = param.direction;

        // Only when there is an update in the ongoing recognition or recognition, new, 
        // I want to update the information Square
        // Above is executed only under this condition from here
        var sq = result.square;
        //In view of the direction, to update the square
        var i;
        for (i = 0; i < 4; i++) { // 4 lines
            var idx = (i + 4 - param.direction) % 4;
            this._coordline.coord2Line(
                    i_vertex_index[idx],
                    i_vertex_index[(idx + 1) % 4],
                    i_coordx,
                    i_coordy,
                    i_coor_num,
                    sq.line[i] //return
                    );
        }
        for (i = 0; i < 4; i++) {
            // Full straight intersection calculation with disabilities
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException(); // OK if the double buffer if an error return here
            }
        }
    }
    ,
    onSquareCompound: function(vX, vY) {
        // Only when there is an update in the ongoing recognition or recognition, new, 
        // I want to update the information Square
        // Above is executed only under this condition from here
        var sq = this.result_stack.prePush().square;
        //In view of the direction, to update the square
        var i;
        for (i = 0; i < 4; i++) { // 4 lines
            var ii = (i + 1) % 4;
            this._coordline.coord2LineSquare([vX[i], vX[ii]], [vY[i], vY[ii]], sq.line[i]); //sq.line                    
        }
        for (i = 0; i < 4; i++) {
            // Full straight intersection calculation with disabilities
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException(); // OK if the double buffer if an error return here
            }
        }
    }
});
FLARMultiIdMarkerDetector = ASKlass('FLARMultiIdMarkerDetector', {//DEFAULT1
    _is_continue: false,
    _square_detect: null,
    _offset: null,
    _bin_raster: null, // [AR] Detectable Full save with results
    _tobin_filter: null,
    _callback: null,
    _data_current: null,
    _transmat: null
    ,
    FLARMultiIdMarkerDetector: function(i_param, i_marker_width) {
        var scr_size = i_param._screen_size;
        // make the analysis object
        this._square_detect = new FLARSquareContourDetector(scr_size);
        this._callback = new FLARMultiIdMarkerDetectCB(i_param);
        this._transmat = new NyARTransMat(i_param);
        // create a binary image buffer
        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
        // make two data objects for work
        this._data_current = new FLARIdMarkerData();
        this._tobin_filter = new FLARRasterFilter_Threshold();
        this._offset = new NyARRectOffset();
        this._offset.setSquare(i_marker_width);
        return;
    },
    detectMarkerLite: function(i_raster) {
        // Size check
        if (!this._bin_raster._size.isEqualSize_int(i_raster._size.w, i_raster._size.h)) {
            throw new NyARException();
        }
        // I converted to a binary raster image
        this._tobin_filter.doFilter(i_raster, this._bin_raster);
        // find new marker or markers, specified in the second argument) to find the square code
        this._callback.init(this._bin_raster);
        this._square_detect.detectMarkerCB(this._bin_raster, this._callback, this._offset);
        //I return the number found
        return this._callback.result_stack._length;
    }
    ,
    // Calculates the transformation matrix for the marker of i_index, and stores to o_result 
    // the result value. You can not use detectMarkerLite you ran just before has not been successful. 

    // @ Param i_index = index number of the marker. Must be greater than or equal to 0 and less 
    // than the return value of detectMarkerLite that ran just before. 
    // @ Param o_result = object that receives the result value. 
    getTransformMatrix: function(i_index, o_result) { //!IMPORTANT
        var result = this._callback.result_stack.getItem(i_index);
        // Calculate the neighborhood such as the position of the marker that matches most
        if (this._is_continue) {
            this._transmat.transMatContinue(result.square, this._offset, o_result);
        } else {
            this._transmat.transMat(result.square, this._offset, o_result);
        }
        return;
    }
    ,
    getIdMarkerData: function(i_index) { //!IMPORTANT
        var result = new FLARIdMarkerData();
        result.copyFrom(this._callback.result_stack.getItem(i_index).markerdata);
        return result;
    }
    ,
    getSquare: function(i_index) { // Returns one FLARSquare it detects. Detection Dekinakattara null.    
        return this._callback.result_stack.getItem(i_index).square;
    }
    ,
    // I set the calculation mode of getTransmationMatrix.
    // If it is TRUE, then use the transMatContinue. If it is FALSE, then use the transMat.
    setContinueMode: function(i_is_continue) {
        this._is_continue = i_is_continue;
    }
});
