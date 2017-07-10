
NyARMatchPattDeviationBlackWhiteData = ASKlass('NyARMatchPattDeviationBlackWhiteData', {
    _data: null,
    _pow: 0,
    _number_of_pixels: 0,
    refData: function() {
        return this._data;
    },
    getPow: function() {
        return this._pow;
    },
    NyARMatchPattDeviationBlackWhiteData: function(i_width, i_height) {
        this._number_of_pixels = i_height * i_width;
        this._data = new IntVector(this._number_of_pixels);
        return;
    }
    ,
    setRaster: function(i_raster) { // From an array of XRGB [width * height], to build the pattern data.
        // i_buffer [XRGB] → difference [BW] conversion
        var i;
        var ave; //<PV/>
        var rgb; //<PV/>
        var linput = this._data; //<PV/>
        var buf = (i_raster.getBuffer());
        // wh and size of the input array or update // input = new int [height] [width] [3]
        var number_of_pixels = this._number_of_pixels;
        // (1/8 of deployment FOR) average calculation
        ave = 0;
        for (i = number_of_pixels - 1; i >= 0; i--) {
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
        }
        ave = (number_of_pixels * 255 * 3 - ave) / (3 * number_of_pixels);

        var sum = 0, w_sum;
        // Difference value calculation
        for (i = number_of_pixels - 1; i >= 0; i--) {
            rgb = buf[i];
            w_sum = ((255 * 3 - (rgb & 0xff) - ((rgb >> 8) & 0xff) - ((rgb >> 16) & 0xff)) / 3) - ave;
            linput[i] = w_sum;
            sum += w_sum * w_sum;
        }
        var p = Math.sqrt(sum);
        this._pow = p != 0.0 ? p : 0.0000001;
        return;
    }
});

NyARMatchPattDeviationColorData = ASKlass('NyARMatchPattDeviationColorData', {
    _data: null,
    _pow: 0,
    _number_of_pixels: 0,
    _optimize_for_mod: 0,
    refData: function() {
        return this._data;
    },
    getPow: function() {
        return this._pow;
    }
    ,
    NyARMatchPattDeviationColorData: function(i_width, i_height) {
        this._number_of_pixels = i_height * i_width;
        this._data = new IntVector(this._number_of_pixels * 3);
        this._optimize_for_mod = this._number_of_pixels - (this._number_of_pixels % 8);
        return;
    }
    ,
    // I will set the pattern data from NyARRaster.
    // This function updates the data area that owns based on the data.
    setRaster: function(i_raster) {
        // Pixel format, size limit
        NyAS3Utils.assert(i_raster.isEqualBufferType(NyARBufferType.INT1D_X8R8G8B8_32));
        NyAS3Utils.assert(i_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize()));
        var buf = (i_raster.getBuffer());
        // [R, G, B] conversion i_buffer [XRGB] → difference
        var i;
        var ave; //<PV/>
        var rgb; //<PV/>
        var linput = this._data; //<PV/>
        // wh and size of the input array also update // input = new int [height] [width] [3];
        var number_of_pixels = this._number_of_pixels;
        var for_mod = this._optimize_for_mod;
        // (1/8 deployment FOR) average calculation
        ave = 0;
        for (i = number_of_pixels - 1; i >= for_mod; i--) {
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
        }
        for (; i >= 0; ) {
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
            rgb = buf[i];
            ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
            i--;
        }
        // (1/8 of deployment FOR) average calculation
        ave = number_of_pixels * 255 * 3 - ave;
        ave = 255 - (ave / (number_of_pixels * 3)); //Precomputed for decomposing (255-R)-ave
        var sum = 0, w_sum;
        var input_ptr = number_of_pixels * 3 - 1;
        //(1/8 of deployment FOR) difference value calculation
        for (i = number_of_pixels - 1; i >= for_mod; i--) {
            rgb = buf[i];
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
        }
        for (; i >= 0; ) {
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
            rgb = buf[i];
            i--;
            w_sum = (ave - (rgb & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//B
            w_sum = (ave - ((rgb >> 8) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//G
            w_sum = (ave - ((rgb >> 16) & 0xff));
            linput[input_ptr--] = w_sum;
            sum += w_sum * w_sum;//R
        }
        // (1/8 of deployment FOR) difference value calculation
        var p = Math.sqrt(sum);
        this._pow = p != 0.0 ? p : 0.0000001;
        return;
    }
});

NyARMatchPattResult = ASKlass('NyARMatchPattResult', {
    DIRECTION_UNKNOWN: -1,
    confidence: 0,
    direction: 0
});

NyARCode = ASKlass('NyARCode', { // keep one of the marker code ARToolKit.
    _color_pat: new Array(4),
    _bw_pat: new Array(4),
    _width: 0,
    _height: 0
    ,
    NyARCode: function(i_width, i_height) {
        this._width = i_width;
        this._height = i_height;
        for (var i = 0; i < 4; i++) { // The four create a raster empty
            this._color_pat[i] = new NyARMatchPattDeviationColorData(i_width, i_height);
            this._bw_pat[i] = new NyARMatchPattDeviationBlackWhiteData(i_width, i_height);
        }
        return;
    },
    getColorData: function(i_index) {
        return this._color_pat[i_index];
    },
    getBlackWhiteData: function(i_index) {
        return this._bw_pat[i_index];
    },
    getWidth: function() {
        return this._width;
    },
    getHeight: function() {
        return this._height;
    },
    loadARPattFromFile: function(i_stream) {
        NyARCodeFileReader.loadFromARToolKitFormFile(i_stream, this);
        return;
    },
    setRaster: function(i_raster) {
        NyAS3Utils.assert(i_raster.length != 4);
        for (var i = 0; i < 4; i++) { // I load a raster pattern to
            this._color_pat[i].setRaster(i_raster[i]);
        }
        return;
    }
});

NyARCodeFileReader = ASKlass('NyARCodeFileReader', {    
    loadFromARToolKitFormFile: function(i_stream, o_code) { // Stores o_code by reading the AR code file
        var width = o_code.getWidth();
        var height = o_code.getHeight();
        var tmp_raster = new NyARRaster(width, height, NyARBufferType.INT1D_X8R8G8B8_32);
        // set to raster four elements.
        var token = i_stream.match(/\d+/g);
        var buf = (tmp_raster.getBuffer());
        // read once in the GBRA.
        for (var h = 0; h < 4; h++) {
            this.readBlock(token, width, height, buf);
            // ARCode to set (color)
            o_code.getColorData(h).setRaster(tmp_raster);
            o_code.getBlackWhiteData(h).setRaster(tmp_raster);
        }
        tmp_raster = null;
        return;
    }
    ,
    // I will read to o_buf i_st from the XRGB data of one block.
    readBlock: function(i_st, i_width, i_height, o_buf) {
        var pixels = i_width * i_height;
        var i3;
        for (i3 = 0; i3 < 3; i3++) {
            for (var i2 = 0; i2 < pixels; i2++) {
                // read only the number
                var val = parseInt(i_st.shift());
                if (isNaN(val)) {
                    throw new NyARException("syntax error in pattern file.");
                }
                o_buf[i2] = (o_buf[i2] << 8) | ((0x000000ff & toInt(val)));
            }
        }        
        for (i3 = 0; i3 < pixels; i3++) { //GBR→RGB
            o_buf[i3] = ((o_buf[i3] << 16) & 0xff0000) | (o_buf[i3] & 0x00ff00) | ((o_buf[i3] >> 16) & 0x0000ff);
        }
        return;
    }
});
