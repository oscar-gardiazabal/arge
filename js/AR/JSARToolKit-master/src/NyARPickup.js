
INyARColorPatt = ASKlass('INyARColorPatt', INyARRgbRaster, {
    // extracting color pattern of i_square part from the raster image and stores it in this member
    // @param image = Source raster object from which to extract
    // @param i_vertexs = 4 vertices top group constituting the square of the original projective transformation
    pickFromRaster: function(image, i_vertexs) { // return if success to get the raster
    }
});

NyARColorPatt_Perspective = ASKlass('NyARColorPatt_Perspective', INyARColorPatt, {
    _patdata: null,
    _pickup_lt: new NyARIntPoint2d(),
    _resolution: 0,
    _size: null,
    _perspective_gen: null,
    _pixelreader: null,
    LOCAL_LT: 1,
    BUFFER_FORMAT: NyARBufferType.INT1D_X8R8G8B8_32
    ,
    initializeInstance: function(i_width, i_height, i_point_per_pix) {
        NyAS3Utils.assert(i_width > 2 && i_height > 2);
        this._resolution = i_point_per_pix;
        this._size = new NyARIntSize(i_width, i_height);
        this._patdata = new IntVector(i_height * i_width);
        this._pixelreader = new NyARRgbPixelReader_INT1D_X8R8G8B8_32(this._patdata, this._size);
        return;
    }
    ,
    // For example, 64
    // @param i_width = Width resolution of the acquired image
    // @param i_height = Height resolution of the acquired image
    // @param i_point_per_pix = Vertical and horizontal number of samples per pixel. I sample the 2x2 = 4 points if 2. 
    // @param i_edge_percentage = Percentage of edge width (if the same as the standard ARToolKit, 25)
    NyARColorPatt_Perspective: function(i_width, i_height, i_point_per_pix, i_edge_percentage) {
        if (i_edge_percentage == null)
            i_edge_percentage = -1;
        if (i_edge_percentage == -1) {
            this.initializeInstance(i_width, i_height, i_point_per_pix);
            this.setEdgeSize(0, 0, i_point_per_pix);
        } else {
            // Input limit
            this.initializeInstance(i_width, i_height, i_point_per_pix);
            this.setEdgeSizeByPercent(i_edge_percentage, i_edge_percentage, i_point_per_pix);
        }
        return;
    }
    ,
    // Calculation of the edge size of the rectangular area is as follows:
    // 1. calculate parameters in the resolution (i_x_edge * 2 + width) x of (i_y_edge * 2 + height) the whole marker
    // 2. Go (i_x_edge / 2, i_y_edge / 2) to get the starting position of the pixel
    // 3. From the starting position, I get the pixel width x height of the individual
    // In case of standard ARToolKit marker, specify the width/2, height/2
    setEdgeSize: function(i_x_edge, i_y_edge, i_resolution) {
        NyAS3Utils.assert(i_x_edge >= 0);
        NyAS3Utils.assert(i_y_edge >= 0);
        // Create Perspective parameter calculator
        this._perspective_gen = new NyARPerspectiveParamGenerator_O1(
                this.LOCAL_LT, this.LOCAL_LT,
                (i_x_edge * 2 + this._size.w) * i_resolution,
                (i_y_edge * 2 + this._size.h) * i_resolution);
        // Calculate the starting position pickup
        this._pickup_lt.x = i_x_edge * i_resolution + this.LOCAL_LT;
        this._pickup_lt.y = i_y_edge * i_resolution + this.LOCAL_LT;
        return;
    }
    , setEdgeSizeByPercent: function(i_x_percent, i_y_percent, i_resolution) {
        NyAS3Utils.assert(i_x_percent >= 0);
        NyAS3Utils.assert(i_y_percent >= 0);
        this.setEdgeSize(this._size.w * i_x_percent / 50, this._size.h * i_y_percent / 50, i_resolution);
        return;
    }
    , getWidth: function() {
        return this._size.w;
    }
    , getHeight: function() {
        return this._size.h;
    }
    , getSize: function() {
        return   this._size;
    }
    , getRgbPixelReader: function() {
        return this._pixelreader;
    }
    , getBuffer: function() {
        return this._patdata;
    }
    , hasBuffer: function() {
        return this._patdata != null;
    }
    , wrapBuffer: function(i_ref_buf) {
        NyARException.notImplement();
    }
    , getBufferType: function() {
        return BUFFER_FORMAT;
    }
    , isEqualBufferType: function(i_type_value) {
        return BUFFER_FORMAT == i_type_value;
    }
    ,
    __pickFromRaster_rgb_tmp: new IntVector(3)
    ,
    __pickFromRaster_cpara: new FloatVector(8)
    ,
    pickFromRaster: function(image, i_vertexs) { //Calculate the parameters of perspective
        var cpara = this.__pickFromRaster_cpara;
        if (!this._perspective_gen.getParam(i_vertexs, cpara)) {
            return false;
        }
        var resolution = this._resolution;
        var img_x = image.getWidth();
        var img_y = image.getHeight();
        var res_pix = resolution * resolution;
        var rgb_tmp = this.__pickFromRaster_rgb_tmp;
        // Get pixel leader
        var reader = image.getRgbPixelReader();
        var p = 0;
        for (var iy = 0; iy < this._size.h * resolution; iy += resolution) {
            // take the point of resolution minute.
            for (var ix = 0; ix < this._size.w * resolution; ix += resolution) {
                var r, g, b;
                r = g = b = 0;
                for (var i2y = iy; i2y < iy + resolution; i2y++) {
                    var cy = this._pickup_lt.y + i2y;
                    for (var i2x = ix; i2x < ix + resolution; i2x++) {
                        // Create 1 pixel
                        var cx = this._pickup_lt.x + i2x;
                        var d = cpara[6] * cx + cpara[7] * cy + 1.0;
                        var x = toInt((cpara[0] * cx + cpara[1] * cy + cpara[2]) / d);
                        var y = toInt((cpara[3] * cx + cpara[4] * cy + cpara[5]) / d);
                        if (x < 0) {
                            x = 0;
                        }
                        if (x >= img_x) {
                            x = img_x - 1;
                        }
                        if (y < 0) {
                            y = 0;
                        }
                        if (y >= img_y) {
                            y = img_y - 1;
                        }
                        reader.getPixel(x, y, rgb_tmp);
                        r += rgb_tmp[0];
                        g += rgb_tmp[1];
                        b += rgb_tmp[2];
                    }
                }
                r /= res_pix;
                g /= res_pix;
                b /= res_pix;
                this._patdata[p] = ((r & 0xff) << 16) | ((g & 0xff) << 8) | ((b & 0xff));
                p++;
            }
        }
        // Set of pixels
        return true;
    }
});

NyARColorPatt_Perspective_O2 = ASKlass('NyARColorPatt_Perspective_O2', NyARColorPatt_Perspective, {
    _pickup: null
    ,
    NyARColorPatt_Perspective_O2: function(i_width, i_height, i_resolution, i_edge_percentage) {
        NyARColorPatt_Perspective.initialize.call(this, i_width, i_height, i_resolution, i_edge_percentage);
        switch (i_resolution) {
            case 1:
                this._pickup = new NyARPickFromRaster_1(this._pickup_lt, this._size);
                break;
            case 2:
                this._pickup = new NyARPickFromRaster_2x(this._pickup_lt, this._size);
                break;
            case 4:
                this._pickup = new NyARPickFromRaster_4x(this._pickup_lt, this._size);
                break;
            default:
                this._pickup = new NyARPickFromRaster_N(this._pickup_lt, i_resolution, this._size);
        }
        return;
    }
    ,
    pickFromRaster: function(image, i_vertexs) {
        // Calculate the parameters of perspective
        var cpara = this.__pickFromRaster_cpara;
        if (!this._perspective_gen.getParam(i_vertexs, cpara)) {
            return false;
        }
        this._pickup.pickFromRaster(cpara, image, this._patdata);
        return true;
    }
});

IpickFromRaster_Impl = ASKlass('IpickFromRaster_Impl', {
    pickFromRaster: function(i_cpara, image, o_patt) {
    }
});

// Check digit: 4127936236942444153655776299710081208144715171590159116971715177917901890204024192573274828522936312731813388371037714083
NyARPickFromRaster_1 = ASKlass('NyARPickFromRaster_1', IpickFromRaster_Impl, {
    _size_ref: null, _lt_ref: null
    ,
    NyARPickFromRaster_1: function(i_lt, i_source_size) {
        this._lt_ref = i_lt;
        this._size_ref = i_source_size;
        this._rgb_temp = new IntVector(i_source_size.w * 3);
        this._rgb_px = new IntVector(i_source_size.w);
        this._rgb_py = new IntVector(i_source_size.w);
        return;
    },
    _rgb_temp: null, _rgb_px: null, _rgb_py: null
    ,
    pickFromRaster: function(i_cpara, image, o_patt) {
        var d0, m0;
        var x, y;
        var img_x = image.getWidth();
        var img_y = image.getHeight();
        var patt_w = this._size_ref.w;
        var rgb_tmp = this._rgb_temp;
        var rgb_px = this._rgb_px;
        var rgb_py = this._rgb_py;
        var cp0 = i_cpara[0];
        var cp3 = i_cpara[3];
        var cp6 = i_cpara[6];
        var cp1 = i_cpara[1];
        var cp4 = i_cpara[4];
        var cp7 = i_cpara[7];
        var pick_y = this._lt_ref.y;
        var pick_x = this._lt_ref.x;
        // Get pixel leader
        var reader = image.getRgbPixelReader();
        var p = 0;
        var cp0cx0, cp3cx0;
        var cp1cy_cp20 = cp1 * pick_y + i_cpara[2] + cp0 * pick_x;
        var cp4cy_cp50 = cp4 * pick_y + i_cpara[5] + cp3 * pick_x;
        var cp7cy_10 = cp7 * pick_y + 1.0 + cp6 * pick_x;
        for (var iy = this._size_ref.h - 1; iy >= 0; iy--) {
            m0 = 1 / (cp7cy_10);
            d0 = -cp6 / (cp7cy_10 * (cp7cy_10 + cp6));
            cp0cx0 = cp1cy_cp20;
            cp3cx0 = cp4cy_cp50;
            // Pickup sequence
            // Pick pixel 0th (inspected)
            var ix;
            for (ix = patt_w - 1; ix >= 0; ix--) {
                // Create a 1 pixel
                x = rgb_px[ix] = toInt(cp0cx0 * m0);
                y = rgb_py[ix] = toInt(cp3cx0 * m0);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[ix] = 0;
                    } else if (x >= img_x) {
                        rgb_px[ix] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[ix] = 0;
                    } else if (y >= img_y) {
                        rgb_py[ix] = img_y - 1;
                    }
                }
                cp0cx0 += cp0;
                cp3cx0 += cp3;
                m0 += d0;
            }
            cp1cy_cp20 += cp1;
            cp4cy_cp50 += cp4;
            cp7cy_10 += cp7;
            reader.getPixelSet(rgb_px, rgb_py, patt_w, rgb_tmp);
            for (ix = patt_w - 1; ix >= 0; ix--) {
                var idx = ix * 3;
                o_patt[p] = (rgb_tmp[idx] << 16) | (rgb_tmp[idx + 1] << 8) | ((rgb_tmp[idx + 2] & 0xff));
                p++;
            }
        }
        return;
    }
});

// 2x2
// Check digit: 207585881161241401501892422483163713744114324414474655086016467027227327958629279571017
NyARPickFromRaster_2x = ASKlass('NyARPickFromRaster_2x', IpickFromRaster_Impl, {
    _size_ref: null, _lt_ref: null
    ,
    NyARPickFromRaster_2x: function(i_lt, i_source_size) {
        this._lt_ref = i_lt;
        this._size_ref = i_source_size;
        this._rgb_temp = new IntVector(i_source_size.w * 4 * 3);
        this._rgb_px = new IntVector(i_source_size.w * 4);
        this._rgb_py = new IntVector(i_source_size.w * 4);
        return;
    }
    ,
    _rgb_temp: null, _rgb_px: null, _rgb_py: null
    ,
    pickFromRaster: function(i_cpara, image, o_patt) {
        var d0, m0, d1, m1;
        var x, y;
        var img_x = image.getWidth();
        var img_y = image.getHeight();
        var patt_w = this._size_ref.w;
        var rgb_tmp = this._rgb_temp;
        var rgb_px = this._rgb_px;
        var rgb_py = this._rgb_py;
        var cp0 = i_cpara[0];
        var cp3 = i_cpara[3];
        var cp6 = i_cpara[6];
        var cp1 = i_cpara[1];
        var cp4 = i_cpara[4];
        var cp7 = i_cpara[7];
        var pick_y = this._lt_ref.y;
        var pick_x = this._lt_ref.x;
        // Get pixel leader
        var reader = image.getRgbPixelReader();
        var p = 0;
        var cp0cx0, cp3cx0;
        var cp1cy_cp20 = cp1 * pick_y + i_cpara[2] + cp0 * pick_x;
        var cp4cy_cp50 = cp4 * pick_y + i_cpara[5] + cp3 * pick_x;
        var cp7cy_10 = cp7 * pick_y + 1.0 + cp6 * pick_x;
        var cp0cx1, cp3cx1;
        var cp1cy_cp21 = cp1cy_cp20 + cp1;
        var cp4cy_cp51 = cp4cy_cp50 + cp4;
        var cp7cy_11 = cp7cy_10 + cp7;
        var cw0 = cp1 + cp1;
        var cw7 = cp7 + cp7;
        var cw4 = cp4 + cp4;
        for (var iy = this._size_ref.h - 1; iy >= 0; iy--) {
            cp0cx0 = cp1cy_cp20;
            cp3cx0 = cp4cy_cp50;
            cp0cx1 = cp1cy_cp21;
            cp3cx1 = cp4cy_cp51;
            m0 = 1.0 / (cp7cy_10);
            d0 = -cp6 / (cp7cy_10 * (cp7cy_10 + cp6));
            m1 = 1.0 / (cp7cy_11);
            d1 = -cp6 / (cp7cy_11 * (cp7cy_11 + cp6));
            var n = patt_w * 2 * 2 - 1;
            var ix;
            for (ix = patt_w * 2 - 1; ix >= 0; ix--) {
                //[n,0]
                x = rgb_px[n] = toInt(cp0cx0 * m0);
                y = rgb_py[n] = toInt(cp3cx0 * m0);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[n] = 0;
                    } else if (x >= img_x) {
                        rgb_px[n] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[n] = 0;
                    } else if (y >= img_y) {
                        rgb_py[n] = img_y - 1;
                    }
                }
                cp0cx0 += cp0;
                cp3cx0 += cp3;
                m0 += d0;
                n--;
                //[n,1]
                x = rgb_px[n] = toInt(cp0cx1 * m1);
                y = rgb_py[n] = toInt(cp3cx1 * m1);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[n] = 0;
                    } else if (x >= img_x) {
                        rgb_px[n] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[n] = 0;
                    } else if (y >= img_y) {
                        rgb_py[n] = img_y - 1;
                    }
                }
                cp0cx1 += cp0;
                cp3cx1 += cp3;
                m1 += d1;
                n--;
            }
            cp7cy_10 += cw7;
            cp7cy_11 += cw7;
            cp1cy_cp20 += cw0;
            cp4cy_cp50 += cw4;
            cp1cy_cp21 += cw0;
            cp4cy_cp51 += cw4;
            reader.getPixelSet(rgb_px, rgb_py, patt_w * 4, rgb_tmp);
            for (ix = patt_w - 1; ix >= 0; ix--) {
                var idx = ix * 12; //3*2*2
                var r = (rgb_tmp[idx + 0] + rgb_tmp[idx + 3] + rgb_tmp[idx + 6] + rgb_tmp[idx + 9]) / 4;
                var g = (rgb_tmp[idx + 1] + rgb_tmp[idx + 4] + rgb_tmp[idx + 7] + rgb_tmp[idx + 10]) / 4;
                var b = (rgb_tmp[idx + 2] + rgb_tmp[idx + 5] + rgb_tmp[idx + 8] + rgb_tmp[idx + 11]) / 4;
                o_patt[p] = (r << 16) | (g << 8) | ((b & 0xff));
                p++;
            }
        }
        return;
    }
});

// 4x4
NyARPickFromRaster_4x = ASKlass('NyARPickFromRaster_4x', IpickFromRaster_Impl, {
    _size_ref: null, _lt_ref: null
    ,
    NyARPickFromRaster_4x: function(i_lt, i_source_size) {
        this._lt_ref = i_lt;
        this._size_ref = i_source_size;
        this._rgb_temp = new IntVector(4 * 4 * 3);
        this._rgb_px = new IntVector(4 * 4);
        this._rgb_py = new IntVector(4 * 4);
        return;
    },
    _rgb_temp: null, _rgb_px: null, _rgb_py: null
    ,
    pickFromRaster: function(i_cpara, image, o_patt) {
        var x, y;
        var d, m;
        var cp6cx, cp0cx, cp3cx;
        var rgb_px = this._rgb_px;
        var rgb_py = this._rgb_py;
        var r, g, b;
        // Calculate the parameters of perspective
        var img_x = image.getWidth();
        var img_y = image.getHeight();
        var rgb_tmp = this._rgb_temp;
        var cp0 = i_cpara[0];
        var cp3 = i_cpara[3];
        var cp6 = i_cpara[6];
        var cp1 = i_cpara[1];
        var cp2 = i_cpara[2];
        var cp4 = i_cpara[4];
        var cp5 = i_cpara[5];
        var cp7 = i_cpara[7];
        var pick_lt_x = this._lt_ref.x;
        // Get pixel leader
        var reader = image.getRgbPixelReader();
        var p = 0;
        var py = this._lt_ref.y;
        for (var iy = this._size_ref.h - 1; iy >= 0; iy--, py += 4) {
            var cp1cy_cp2_0 = cp1 * py + cp2;
            var cp4cy_cp5_0 = cp4 * py + cp5;
            var cp7cy_1_0 = cp7 * py + 1.0;
            var cp1cy_cp2_1 = cp1cy_cp2_0 + cp1;
            var cp1cy_cp2_2 = cp1cy_cp2_1 + cp1;
            var cp1cy_cp2_3 = cp1cy_cp2_2 + cp1;
            var cp4cy_cp5_1 = cp4cy_cp5_0 + cp4;
            var cp4cy_cp5_2 = cp4cy_cp5_1 + cp4;
            var cp4cy_cp5_3 = cp4cy_cp5_2 + cp4;
            var px = pick_lt_x;
            // take the point of resolution minute
            for (var ix = this._size_ref.w - 1; ix >= 0; ix--, px += 4) {
                cp6cx = cp6 * px;
                cp0cx = cp0 * px;
                cp3cx = cp3 * px;
                cp6cx += cp7cy_1_0;
                m = 1 / cp6cx;
                d = -cp7 / ((cp6cx + cp7) * cp6cx);

                // Create [0,0] pixel
                x = rgb_px[0] = toInt((cp0cx + cp1cy_cp2_0) * m);
                y = rgb_py[0] = toInt((cp3cx + cp4cy_cp5_0) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[0] = 0;
                    } else if (x >= img_x) {
                        rgb_px[0] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[0] = 0;
                    } else if (y >= img_y) {
                        rgb_py[0] = img_y - 1;
                    }
                }

                // Create [0,1] pixel
                m += d;
                x = rgb_px[4] = toInt((cp0cx + cp1cy_cp2_1) * m);
                y = rgb_py[4] = toInt((cp3cx + cp4cy_cp5_1) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[4] = 0;
                    } else if (x >= img_x) {
                        rgb_px[4] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[4] = 0;
                    } else if (y >= img_y) {
                        rgb_py[4] = img_y - 1;
                    }
                }

                // Create [0,2] pixel
                m += d;
                x = rgb_px[8] = toInt((cp0cx + cp1cy_cp2_2) * m);
                y = rgb_py[8] = toInt((cp3cx + cp4cy_cp5_2) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[8] = 0;
                    } else if (x >= img_x) {
                        rgb_px[8] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[8] = 0;
                    } else if (y >= img_y) {
                        rgb_py[8] = img_y - 1;
                    }
                }

                // Create [0,3] pixel
                m += d;
                x = rgb_px[12] = toInt((cp0cx + cp1cy_cp2_3) * m);
                y = rgb_py[12] = toInt((cp3cx + cp4cy_cp5_3) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[12] = 0;
                    } else if (x >= img_x) {
                        rgb_px[12] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[12] = 0;
                    } else if (y >= img_y) {
                        rgb_py[12] = img_y - 1;
                    }
                }
                cp6cx += cp6;
                cp0cx += cp0;
                cp3cx += cp3;
                m = 1 / cp6cx;
                d = -cp7 / ((cp6cx + cp7) * cp6cx);

                // Create [1,0] pixel
                x = rgb_px[1] = toInt((cp0cx + cp1cy_cp2_0) * m);
                y = rgb_py[1] = toInt((cp3cx + cp4cy_cp5_0) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[1] = 0;
                    } else if (x >= img_x) {
                        rgb_px[1] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[1] = 0;
                    } else if (y >= img_y) {
                        rgb_py[1] = img_y - 1;
                    }
                }

                // Create [1,1] pixel
                m += d;
                x = rgb_px[5] = toInt((cp0cx + cp1cy_cp2_1) * m);
                y = rgb_py[5] = toInt((cp3cx + cp4cy_cp5_1) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[5] = 0;
                    } else if (x >= img_x) {
                        rgb_px[5] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[5] = 0;
                    } else if (y >= img_y) {
                        rgb_py[5] = img_y - 1;
                    }
                }

                // Create [1,2] pixel
                m += d;
                x = rgb_px[9] = toInt((cp0cx + cp1cy_cp2_2) * m);
                y = rgb_py[9] = toInt((cp3cx + cp4cy_cp5_2) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[9] = 0;
                    } else if (x >= img_x) {
                        rgb_px[9] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[9] = 0;
                    } else if (y >= img_y) {
                        rgb_py[9] = img_y - 1;
                    }
                }

                // Create [1,3] pixel
                m += d;
                x = rgb_px[13] = toInt((cp0cx + cp1cy_cp2_3) * m);
                y = rgb_py[13] = toInt((cp3cx + cp4cy_cp5_3) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[13] = 0;
                    } else if (x >= img_x) {
                        rgb_px[13] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[13] = 0;
                    } else if (y >= img_y) {
                        rgb_py[13] = img_y - 1;
                    }
                }
                cp6cx += cp6;
                cp0cx += cp0;
                cp3cx += cp3;
                m = 1 / cp6cx;
                d = -cp7 / ((cp6cx + cp7) * cp6cx);

                // Create [2,0] pixel
                x = rgb_px[2] = toInt((cp0cx + cp1cy_cp2_0) * m);
                y = rgb_py[2] = toInt((cp3cx + cp4cy_cp5_0) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[2] = 0;
                    } else if (x >= img_x) {
                        rgb_px[2] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[2] = 0;
                    } else if (y >= img_y) {
                        rgb_py[2] = img_y - 1;
                    }
                }

                // Create [2,1] pixel
                m += d;
                x = rgb_px[6] = toInt((cp0cx + cp1cy_cp2_1) * m);
                y = rgb_py[6] = toInt((cp3cx + cp4cy_cp5_1) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[6] = 0;
                    } else if (x >= img_x) {
                        rgb_px[6] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[6] = 0;
                    } else if (y >= img_y) {
                        rgb_py[6] = img_y - 1;
                    }
                }

                // Create [2,2] pixel
                m += d;
                x = rgb_px[10] = toInt((cp0cx + cp1cy_cp2_2) * m);
                y = rgb_py[10] = toInt((cp3cx + cp4cy_cp5_2) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[10] = 0;
                    } else if (x >= img_x) {
                        rgb_px[10] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[10] = 0;
                    } else if (y >= img_y) {
                        rgb_py[10] = img_y - 1;
                    }
                }

                // Create [2,3] pixel (I will shift calculation here)
                m += d;
                x = rgb_px[14] = toInt((cp0cx + cp1cy_cp2_3) * m);
                y = rgb_py[14] = toInt((cp3cx + cp4cy_cp5_3) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[14] = 0;
                    } else if (x >= img_x) {
                        rgb_px[14] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[14] = 0;
                    } else if (y >= img_y) {
                        rgb_py[14] = img_y - 1;
                    }
                }
                cp6cx += cp6;
                cp0cx += cp0;
                cp3cx += cp3;
                m = 1 / cp6cx;
                d = -cp7 / ((cp6cx + cp7) * cp6cx);

                // Create [3,0] pixel
                x = rgb_px[3] = toInt((cp0cx + cp1cy_cp2_0) * m);
                y = rgb_py[3] = toInt((cp3cx + cp4cy_cp5_0) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[3] = 0;
                    } else if (x >= img_x) {
                        rgb_px[3] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[3] = 0;
                    } else if (y >= img_y) {
                        rgb_py[3] = img_y - 1;
                    }
                }

                // Create [3,1] pixel
                m += d;
                x = rgb_px[7] = toInt((cp0cx + cp1cy_cp2_1) * m);
                y = rgb_py[7] = toInt((cp3cx + cp4cy_cp5_1) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[7] = 0;
                    } else if (x >= img_x) {
                        rgb_px[7] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[7] = 0;
                    } else if (y >= img_y) {
                        rgb_py[7] = img_y - 1;
                    }
                }

                // Create [3,2] pixel
                m += d;
                x = rgb_px[11] = toInt((cp0cx + cp1cy_cp2_2) * m);
                y = rgb_py[11] = toInt((cp3cx + cp4cy_cp5_2) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[11] = 0;
                    } else if (x >= img_x) {
                        rgb_px[11] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[11] = 0;
                    } else if (y >= img_y) {
                        rgb_py[11] = img_y - 1;
                    }
                }

                // Create [3,3] pixel
                m += d;
                x = rgb_px[15] = toInt((cp0cx + cp1cy_cp2_3) * m);
                y = rgb_py[15] = toInt((cp3cx + cp4cy_cp5_3) * m);
                if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                    if (x < 0) {
                        rgb_px[15] = 0;
                    } else if (x >= img_x) {
                        rgb_px[15] = img_x - 1;
                    }
                    if (y < 0) {
                        rgb_py[15] = 0;
                    } else if (y >= img_y) {
                        rgb_py[15] = img_y - 1;
                    }
                }
                reader.getPixelSet(rgb_px, rgb_py, 4 * 4, rgb_tmp);
                r = (rgb_tmp[ 0] + rgb_tmp[ 3] + rgb_tmp[ 6] + rgb_tmp[ 9] + rgb_tmp[12] + rgb_tmp[15] + rgb_tmp[18] + rgb_tmp[21] + rgb_tmp[24] + rgb_tmp[27] + rgb_tmp[30] + rgb_tmp[33] + rgb_tmp[36] + rgb_tmp[39] + rgb_tmp[42] + rgb_tmp[45]) / 16;
                g = (rgb_tmp[ 1] + rgb_tmp[ 4] + rgb_tmp[ 7] + rgb_tmp[10] + rgb_tmp[13] + rgb_tmp[16] + rgb_tmp[19] + rgb_tmp[22] + rgb_tmp[25] + rgb_tmp[28] + rgb_tmp[31] + rgb_tmp[34] + rgb_tmp[37] + rgb_tmp[40] + rgb_tmp[43] + rgb_tmp[46]) / 16;
                b = (rgb_tmp[ 2] + rgb_tmp[ 5] + rgb_tmp[ 8] + rgb_tmp[11] + rgb_tmp[14] + rgb_tmp[17] + rgb_tmp[20] + rgb_tmp[23] + rgb_tmp[26] + rgb_tmp[29] + rgb_tmp[32] + rgb_tmp[35] + rgb_tmp[38] + rgb_tmp[41] + rgb_tmp[44] + rgb_tmp[47]) / 16;
                o_patt[p] = ((r & 0xff) << 16) | ((g & 0xff) << 8) | ((b & 0xff));
                p++;
            }
        }
        return;
    }
});

NyARPickFromRaster_N = ASKlass('NyARPickFromRaster_N', IpickFromRaster_Impl, {// General-purpose pick-up function
    _resolution: 0,
    _size_ref: null, _lt_ref: null
    ,
    NyARPickFromRaster_N: function(i_lt, i_resolution, i_source_size) {
        this._lt_ref = i_lt;
        this._resolution = i_resolution;
        this._size_ref = i_source_size;
        this._rgb_temp = new IntVector(i_resolution * i_resolution * 3);
        this._rgb_px = new IntVector(i_resolution * i_resolution);
        this._rgb_py = new IntVector(i_resolution * i_resolution);
        this._cp1cy_cp2 = new FloatVector(i_resolution);
        this._cp4cy_cp5 = new FloatVector(i_resolution);
        this._cp7cy_1 = new FloatVector(i_resolution);
        return;
    }
    ,
    _rgb_temp: null, _rgb_px: null, _rgb_py: null,
    _cp1cy_cp2: null, _cp4cy_cp5: null, _cp7cy_1: null
    ,
    pickFromRaster: function(i_cpara, image, o_patt) {
        var i2x, i2y; // Prime variable
        var x, y;
        var w;
        var r, g, b;
        var resolution = this._resolution;
        var res_pix = resolution * resolution;
        var img_x = image.getWidth();
        var img_y = image.getHeight();
        var rgb_tmp = this._rgb_temp;
        var rgb_px = this._rgb_px;
        var rgb_py = this._rgb_py;
        var cp1cy_cp2 = this._cp1cy_cp2;
        var cp4cy_cp5 = this._cp4cy_cp5;
        var cp7cy_1 = this._cp7cy_1;
        var cp0 = i_cpara[0];
        var cp3 = i_cpara[3];
        var cp6 = i_cpara[6];
        var cp1 = i_cpara[1];
        var cp2 = i_cpara[2];
        var cp4 = i_cpara[4];
        var cp5 = i_cpara[5];
        var cp7 = i_cpara[7];
        var pick_y = this._lt_ref.y;
        var pick_x = this._lt_ref.x;
        // Get pixel leader
        var reader = image.getRgbPixelReader();
        var p = 0;
        for (var iy = 0; iy < this._size_ref.h * resolution; iy += resolution) {
            w = pick_y + iy;
            cp1cy_cp2[0] = cp1 * w + cp2;
            cp4cy_cp5[0] = cp4 * w + cp5;
            cp7cy_1[0] = cp7 * w + 1.0;
            for (i2y = 1; i2y < resolution; i2y++) {
                cp1cy_cp2[i2y] = cp1cy_cp2[i2y - 1] + cp1;
                cp4cy_cp5[i2y] = cp4cy_cp5[i2y - 1] + cp4;
                cp7cy_1[i2y] = cp7cy_1[i2y - 1] + cp7;
            }
            // take the point of resolution minute
            for (var ix = 0; ix < this._size_ref.w * resolution; ix += resolution) {
                var n = 0;
                w = pick_x + ix;
                for (i2y = resolution - 1; i2y >= 0; i2y--) {
                    var cp0cx = cp0 * w + cp1cy_cp2[i2y];
                    var cp6cx = cp6 * w + cp7cy_1[i2y];
                    var cp3cx = cp3 * w + cp4cy_cp5[i2y];
                    var m = 1 / (cp6cx);
                    var d = -cp6 / (cp6cx * (cp6cx + cp6));
                    var m2 = cp0cx * m;
                    var m3 = cp3cx * m;
                    var d2 = cp0cx * d + cp0 * (m + d);
                    var d3 = cp3cx * d + cp3 * (m + d);
                    for (i2x = resolution - 1; i2x >= 0; i2x--) {
                        // Create a 1 pixel
                        x = rgb_px[n] = toInt(m2);
                        y = rgb_py[n] = toInt(m3);
                        if (x < 0 || x >= img_x || y < 0 || y >= img_y) {
                            if (x < 0) {
                                rgb_px[n] = 0;
                            } else if (x >= img_x) {
                                rgb_px[n] = img_x - 1;
                            }
                            if (y < 0) {
                                rgb_py[n] = 0;
                            } else if (y >= img_y) {
                                rgb_py[n] = img_y - 1;
                            }
                        }
                        n++;
                        m2 += d2;
                        m3 += d3;
                    }
                }
                reader.getPixelSet(rgb_px, rgb_py, res_pix, rgb_tmp);
                r = g = b = 0;
                for (var i = res_pix * 3 - 1; i > 0; ) {
                    b += rgb_tmp[i--];
                    g += rgb_tmp[i--];
                    r += rgb_tmp[i--];
                }
                r /= res_pix;
                g /= res_pix;
                b /= res_pix;
                o_patt[p] = ((r & 0xff) << 16) | ((g & 0xff) << 8) | ((b & 0xff));
                p++;
            }
        }
        return;
    }
});
