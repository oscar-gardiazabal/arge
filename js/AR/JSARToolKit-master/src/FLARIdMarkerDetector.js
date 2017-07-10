
FLARIdMarkerData = ASKlass('FLARIdMarkerData', {
    _packet: new IntVector(22), // express Vector packet data. (Maximum number of packets: 21 + (1) in the model 7
    _model: 0,
    _controlDomain: 0,
    _controlMask: 0,
    _check: 0,
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
                s._check != this._check ||
                s._controlDomain != this._controlDomain ||
                s._controlMask != this._controlMask ||
                s._dataDot != this._dataDot ||
                s._model != this._model) {
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
        this._check = s._check;
        this._controlDomain = s._controlDomain;
        this._controlMask = s._controlMask;
        this._dataDot = s._dataDot;
        this._model = s._model;
        this.packetLength = s.packetLength;
        for (var i = s.packetLength - 1; i >= 0; i--) {
            this._packet[i] = s._packet[i];
        }
        return;
    },
    ////////////////////////////////////////////////////////////////////////////
    // SETTERS
    setModel: function(value) {
        this._model = value;
    },
    setControlDomain: function(value) {
        this._controlDomain = value;
    },
    setControlMask: function(value) {
        this._controlMask = value;
    },
    setCheck: function(value) {
        this._check = value;
    },
    setPacketData: function(index, data) {
        if (index < this.packetLength) {
            this._packet[index] = data;
        } else {
            throw ("packet index over " + index + " >= " + this.packetLength);
        }
    },
    setDataDotLength: function(value) {
        this._dataDot = value;
    },
    setPacketLength: function(value) {
        this.packetLength = value;
    },
    ////////////////////////////////////////////////////////////////////////////
    // GETTERS
    dataDotLength: function() {
        return this._dataDot;
    }, model: function() {
        return this._model;
    },
    controlDomain: function() {
        return this._controlDomain;
    },
    controlMask: function() {
        return this._controlMask;
    },
    check: function() {
        return this._check;
    },
    getPacketData: function(index) {
        if (this.packetLength <= index)
            throw new ArgumentError("packet index over");
        return this._packet[index];
    }
});

FLARDetectIdMarkerResult = ASKlass('FLARDetectIdMarkerResult', {
    arcode_id: 0,
    direction: 0,
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

FLARMultiIdMarkerDetectCB = ASKlass('FLARMultiIdMarkerDetectCB', {// callback function of detectMarker
    // Public properties
    result_stack: new FLARDetectIdMarkerResultStack(NyARDetectMarker.AR_SQUARE_MAX),
    square: new FLARSquare(),
    marker_data: null,
    threshold: 0,
    direction: 0,
    _ref_raster: null,
    _current_data: null,
    _data_temp: null,
    _prev_data: null,
    _id_pickup: new NyIdMarkerPickup(),
    _coordline: null,
    _encoder: null,
    __tmp_vertex: NyARIntPoint2d.createArray(4),
    _marker_param: new NyIdMarkerParam(),
    _maker_pattern: new NyIdMarkerPattern()
    ,
    FLARMultiIdMarkerDetectCB: function(i_param, i_encoder) {
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._data_temp = i_encoder.createDataInstance();
        this._current_data = i_encoder.createDataInstance();
        this._encoder = i_encoder;
        return;
    }
    ,
    init: function(i_raster) { // Initialize call back handler.
        this.marker_data = null;
        this.result_stack.clear();
        this._id_pickup.init();
        this._ref_raster = i_raster;
    },
    _previous_verts: {}
    ,
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) { //ensure pattern vertex data with the orientation

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
        var param = this._marker_param;
        var patt_data = this._maker_pattern;
        // I cut out from the image a pattern of the evaluation criteria
        var cv;
        if (window.DEBUG) {
            cv = document.getElementById('debugCanvas').getContext('2d');
            cv.fillStyle = 'blue';
            for (var i = 0; i < 4; i++) {
                cv.fillRect(vertex[i].x - 2, vertex[i].y - 2, 5, 5);
            }
        }
        var cx = 0, cy = 0;
        for (var i = 0; i < 4; i++) {
            cx += vertex[i].x;
            cy += vertex[i].y;
        }
        cx /= 4;
        cy /= 4;
        var pick = this._id_pickup.pickFromRaster(this._ref_raster, vertex, patt_data, param);
        if (!pick) {
            if (window.DEBUG) {
                cv.fillStyle = '#ff0000';
                cv.fillText('No pick', cx + 3, cy);
            }
            return;
        }

        var enc = this._encoder.encode(patt_data, this._data_temp); //Encode
        if (!enc) {
            return;
        }
        this._current_data.copyFrom(this._data_temp);
        this.marker_data = this._current_data; //found
        this.threshold = param.threshold;
        this.direction = param.direction;

        // record the marker information.
        var result = this.result_stack.prePush();
        result.direction = this.direction;
        result.markerdata.copyFrom(this.marker_data);
        result.arcode_id = this.getId(result.markerdata);
        if (window.DEBUG) {
            cv.fillStyle = '#00ffff';
            cv.fillText(result.arcode_id, cx + 3, cy);
        }
        // Only when there is an update in the ongoing recognition or recognition, new, I want to update the information Square
        // Above is executed only under this condition from here
        var sq = result.square;
        // In view of the direction, to update the square
        var i;
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - param.direction) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) {
            // Full straight intersection calculation with disabilities
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException(); // OK if the double buffer if an error return here
            }
        }
    }
    ,
    getId: function(data) {
        var currId;
        if (data.packetLength > 4) {
            currId = -1;
        } else {
            currId = 0;
            for (var i = 0; i < data.packetLength; i++) { // convert to value of one by connecting up to four bytes
                currId = (currId << 8) | data.getPacketData(i);
            }
        }
        return currId;
    }
});

FLARMultiIdMarkerDetector = ASKlass('FLARMultiIdMarkerDetector', {
    _is_continue: false,
    _square_detect: null,
    _offset: null,
    _current_threshold: 110,
    _bin_raster: null, // [AR] Detectable Full save with results
    _tobin_filter: null,
    _callback: null,
    _data_current: null,
    _threshold_detect: null,
    _transmat: null
    ,
    FLARMultiIdMarkerDetector: function(i_param, i_marker_width) {
        var scr_size = i_param.getScreenSize();
        var encoder = new FLARIdMarkerDataEncoder_RawBit();
        // make the analysis object
        this._square_detect = new FLARSquareContourDetector(scr_size);
        this._callback = new FLARMultiIdMarkerDetectCB(i_param, encoder);
        this._transmat = new NyARTransMat(i_param);
        // create a binary image buffer
        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
        // make two data objects for work
        this._data_current = encoder.createDataInstance();
        this._tobin_filter = new FLARRasterFilter_Threshold(110);
        this._threshold_detect = new FLARRasterThresholdAnalyzer_SlidePTile(15, 4);
        this._offset = new NyARRectOffset();
        this._offset.setSquare(i_marker_width);
        return;
    },
    detectMarkerLite: function(i_raster, i_threshold) {
        // Size check
        if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) {
            throw new FLARException();
        }
        // I converted to a binary raster image
        this._tobin_filter.setThreshold(i_threshold);
        this._tobin_filter.doFilter(i_raster, this._bin_raster);
        // find new marker or markers, specified in the second argument) to find the square code
        this._callback.init(this._bin_raster);
        this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
        //I return the number found
        return this._callback.result_stack.getLength();
    }
    ,
    // Calculates the transformation matrix for the marker of i_index, and stores to o_result the result value. You can not use detectMarkerLite you ran just before has not been successful. 

    // @ Param i_index = index number of the marker. Must be greater than or equal to 0 and less than the return value of detectMarkerLite that ran just before. 
    // @ Param o_result = object that receives the result value. 
    getTransformMatrix: function(i_index, o_result) {

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
    getIdMarkerData: function(i_index) {
        var result = new FLARIdMarkerData();
        result.copyFrom(this._callback.result_stack.getItem(i_index).markerdata);
        return result;
    }
    ,
    // return the index of ARCode marker of i_index. 
    // @ Param i_index = index number of the marker. Must be greater than or equal to 0 and less than the return value of detectMarkerLite that ran just before.   
    getARCodeIndex: function(i_index) {
        return this._callback.result_stack.getItem(i_index).arcode_id;
    }
    ,
    getDirection: function(i_index) { // return the orientation of the marker detected (0,1,2,3)
        return this._callback.result_stack.getItem(i_index).direction;
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
    ,
    thresholdedBitmapData: function() { // returns the binarized image.
        try {
            return ((this._bin_raster).getBuffer());
        } catch (e) {
            return null;
        }
        return null;
    }
});

FLARSingleIdMarkerDetectCB = ASKlass('FLARSingleIdMarkerDetectCB', { // callback function of detectMarker
    // Public properties
    square: new FLARSquare(),
    marker_data: null,
    threshold: 0,
    direction: 0,
    _ref_raster: null,
    _current_data: null,
    _data_temp: null,
    _prev_data: null,
    _id_pickup: new NyIdMarkerPickup(),
    _coordline: null,
    _encoder: null,
    __tmp_vertex: NyARIntPoint2d.createArray(4),
    _marker_param: new NyIdMarkerParam(),
    _maker_pattern: new NyIdMarkerPattern()
    ,
    FLARSingleIdMarkerDetectCB: function(i_param, i_encoder) {

        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._data_temp = i_encoder.createDataInstance();
        this._current_data = i_encoder.createDataInstance();
        this._encoder = i_encoder;
        return;
    }
    ,
    init: function(i_raster, i_prev_data) { // Initialize call back handler
        this.marker_data = null;
        this._prev_data = i_prev_data;
        this._ref_raster = i_raster;
    },
    // called each time the rectangle is found.
    // Inspect the rectangular pattern was found, to ensure the vertex data in consideration of the orientation.
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) {

        if (this.marker_data != null) { // End if found already
            return;
        }
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
        var param = this._marker_param;
        var patt_data = this._maker_pattern;
        // cut out from the image a pattern of the evaluation criteria
        var pick = this._id_pickup.pickFromRaster(this._ref_raster, vertex, patt_data, param)
        if (window.DEBUG) {
            var cv = document.getElementById('debugCanvas').getContext('2d');
            cv.fillStyle = 'blue';
            for (var i = 0; i < 4; i++) {
                cv.fillRect(vertex[i].x - 2, vertex[i].y - 2, 5, 5);
            }
        }
        if (!pick) {
            return;
        }
        this.direction = param.direction;

        if (!this._encoder.encode(patt_data, this._data_temp)) { // Encode
            return;
        }

        //It is continued recognition request?
        if (this._prev_data == null) { //No continuation recognition request            
            this._current_data.copyFrom(this._data_temp);

        } else { // There is continued recognition request            
            if (!this._prev_data.isEqual((this._data_temp))) {
                return; //Is this different from a ID that had recognized claims.
            }
        }
        // Only when there is an update in the ongoing recognition or recognition, new, update the information Square.
        // Above is executed only under this condition from here.
        var sq = this.square;
        // In view of the direction, to update the square.
        var i;
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - param.direction) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) { // Full straight intersection calculation with disabilities            
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException();// OK if the double buffer if an error return here
            }
        }
        this.threshold = param.threshold;
        this.marker_data = this._current_data; //Found
    }
});

FLARSingleIdMarkerDetector = ASKlass('FLARSingleIdMarkerDetector', {
    _is_continue: false,
    _square_detect: null,
    _offset: null,
    _is_active: null,
    _current_threshold: 110,
    // [AR] Detectable Full save with results
    _bin_raster: null,
    _tobin_filter: null,
    _callback: null,
    _data_current: null,
    _threshold_detect: null,
    _transmat: null
    ,
    FLARSingleIdMarkerDetector: function(i_param, i_marker_width) {

        var scr_size = i_param.getScreenSize();
        var encoder = new FLARIdMarkerDataEncoder_RawBit();
        // make the analysis object
        this._square_detect = new FLARSquareContourDetector(scr_size);
        this._callback = new FLARSingleIdMarkerDetectCB(i_param, encoder);
        this._transmat = new NyARTransMat(i_param);

        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h); // create a binary image buffer
        // I make two data objects for work
        this._data_current = encoder.createDataInstance();
        this._tobin_filter = new FLARRasterFilter_Threshold(110);
        this._threshold_detect = new FLARRasterThresholdAnalyzer_SlidePTile(15, 4);
        this._offset = new NyARRectOffset();
        this._offset.setSquare(i_marker_width);
        return;
    }
    ,
    detectMarkerLite: function(i_raster, i_threshold) {

        if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) { // Size check
            throw new FLARException();
        }
        // converted to a binary raster image.
        this._tobin_filter.setThreshold(i_threshold);
        this._tobin_filter.doFilter(i_raster, this._bin_raster);
        // Find new marker or marker, the specified Find square code (second argument)
        this._callback.init(this._bin_raster, this._is_active ? this._data_current : null);
        this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
        // False if not found
        if (this._callback.marker_data == null) {
            this._is_active = false;
            return false;
        }
        this._is_active = true;
        this._data_current.copyFrom(this._callback.marker_data);
        return true;
    }
    ,
    getIdMarkerData: function() {
        var result = new FLARIdMarkerData();
        result.copyFrom(this._callback.marker_data);
        return result;
    }
    ,
    getDirection: function() {
        return this._callback.direction;
    }
    ,
    getTransformMatrix: function(o_result) {
        if (this._is_continue)
            this._transmat.transMatContinue(this._callback.square, this._offset, o_result);
        else
            this._transmat.transMat(this._callback.square, this._offset, o_result);
        return;
    }
    ,
    setContinueMode: function(i_is_continue) {
        this._is_continue = i_is_continue;
    }
});

FLARIdMarkerDataEncoder_RawBit = ASKlass('FLARIdMarkerDataEncoder_RawBit', {
    _DOMAIN_ID: 0,
    _mod_data: new IntVector([7, 31, 127, 511, 2047, 4095]), // Value to use for the control of mod dot creation
    encode: function(i_data, o_dest) {

        var dest = o_dest;
        if (dest == null) {
            throw new FLARException("type of o_dest must be \"FLARIdMarkerData\"");
        }
        if (i_data.ctrl_domain != this._DOMAIN_ID) {
            return false;
        }
        dest.setCheck(i_data.check);
        dest.setControlDomain(i_data.ctrl_domain);
        dest.setControlMask(i_data.ctrl_mask);
        dest.setModel(i_data.model);
        // Data number of dots calculation
        var resolution_len = toInt(i_data.model * 2 - 1); //trace("resolution", resolution_len);
        dest.setDataDotLength(resolution_len);
        // Data the number of dots, "(2 * model value - 1) ^ 2" in resolution_len next, the value is the source of this square,
        // and packet count is "(data number of dots / 8) + 1" (1 plus the last packet 0) 
        var packet_length = toInt((resolution_len * resolution_len) / 8) + 1;
        // trace("packet", packet_length);
        dest.setPacketLength(packet_length);
        var sum = 0;
        for (var i = 0; i < packet_length; i++) {
            dest.setPacketData(i, i_data.data[i]);
            // trace("i_data[",i,"]",i_data.data[i]);
            sum += i_data.data[i];
        }
        // Check dot value calculation
        sum = sum % this._mod_data[i_data.model - 2];
        // trace("check dot", i_data.check, sum);
        // Check dot comparison
        if (i_data.check != sum) {
            return false;
        }
        return true;
    },
    createDataInstance: function() {
        return new FLARIdMarkerData();
    }
});
