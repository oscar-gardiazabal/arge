
/**
 Capable of handling the marker of one, this class is an application processor at the same time.
 You can be notified in the event, occurrence, movement, disappearance of the marker.
 register a plurality of markers in the class. Marker of one is found, the processor is the same marker to continue
 It does not recognize the other markers while it continues to recognize only one, to lose sight of.
 
 Event occurs in the order OnEnter → OnUpdate of [n] → OnLeave.
 know OnEnter occurs once first marker is found, what number of marker or was discovered.
 Then by OnUpdate, passed the current transformation matrix is continuously. If lose sight of the marker at the end, OnLeave Event occurs. 
 */

FLSingleARMarkerProcesser = ASKlass('FLSingleARMarkerProcesser', {
    tag: null, // It is a tag variable the owner's disposal
    _lost_delay_count: 0,
    _lost_delay: 5,
    _square_detect: null,
    _transmat: null,
    _offset: null,
    _threshold: 110,
    // [AR] Detectable Full save with results
    _bin_raster: null,
    _tobin_filter: null,
    _current_arcode_index: -1,
    _threshold_detect: null,
    FLSingleARMarkerProcesser: function() {
        return;
    },
    _initialized: false
    ,
    initInstance: function(i_param) {

        NyAS3Utils.assert(this._initialized == false); // Economic initialization?
        var scr_size = i_param.getScreenSize();

        this._square_detect = new FLARSquareContourDetector(scr_size); // make the analysis object
        this._transmat = new NyARTransMat(i_param);
        this._tobin_filter = new FLARRasterFilter_Threshold(110);

        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h); // create a binary image buffer
        this._threshold_detect = new FLARRasterThresholdAnalyzer_SlidePTile(15, 4);
        this._initialized = true;
        // Callback handler
        this._detectmarker_cb = new FLARDetectSquareCB_1(i_param);
        this._offset = new NyARRectOffset();
        return;
    }
    ,
    // Specifies an array of marker code to detect. If you execute this function in the detection state,
    // Forced reset will be applied to the object state.
    setARCodeTable: function(i_ref_code_table, i_code_resolution, i_marker_width) {
        if (this._current_arcode_index != -1) {
            this.reset(true); // Forced reset
        }
        // To recreate the marker set to detect, information, a detector. (Pattern area 1 pixel sampling point 4, the marker is 50%)
        this._detectmarker_cb.setNyARCodeTable(i_ref_code_table, i_code_resolution);
        this._offset.setSquare(i_marker_width);
        return;
    }
    ,
    reset: function(i_is_force) {
        if (this._current_arcode_index != -1 && i_is_force == false) {
            this.onLeaveHandler(); // Events call If it is not forced rewrite
        }
        this._current_arcode_index = -1; // Reset the current marker
        return;
    },
    _detectmarker_cb: null
    ,
    detectMarker: function(i_raster) {
        NyAS3Utils.assert(this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)); // Size check
        // Conversion to BIN image
        this._tobin_filter.setThreshold(this._threshold);
        this._tobin_filter.doFilter(i_raster, this._bin_raster);
        // look for a square code
        this._detectmarker_cb.init(i_raster, this._current_arcode_index);
        this._square_detect.detectMarkerCB(this._bin_raster, this._detectmarker_cb);

        var is_id_found = updateStatus(this._detectmarker_cb.square, this._detectmarker_cb.code_index); // Recognizing the state update

        if (!is_id_found) { // (Also in detectExistMarker) threshold feedback
            // If there is no marker, reference luminance search in the search + DualPTail
            var th = this._threshold_detect.analyzeRaster(i_raster);
            this._threshold = (this._threshold + th) / 2;
        }
        return;
    }
    ,
    setConfidenceThreshold: function(i_new_cf, i_exist_cf) {
        this._detectmarker_cb.cf_threshold_exist = i_exist_cf;
        this._detectmarker_cb.cf_threshold_new = i_new_cf;
    }
    ,
    __NyARSquare_result: new FLARTransMatResult(),
    //  Updates the status of the object to drive the handle functions as necessary.
    // The return value is "or was able to discover a marker actually". It is different from the state of the class.
    updateStatus: function(i_square, i_code_index) {
        var result = this.__NyARSquare_result;
        if (this._current_arcode_index < 0) { // Not understanding
            if (i_code_index < 0) {
                return false; // that does nothing.

            } else { // Transition from recognition of unrecognized
                this._current_arcode_index = i_code_index;
                // Event generation
                // OnEnter
                this.onEnterHandler(i_code_index);
                // Create a transformation matrix
                this._transmat.transMat(i_square, this._offset, result);
                // OnUpdate
                this.onUpdateHandler(i_square, result);
                this._lost_delay_count = 0;
                return true;
            }
        } else { // Cognition
            if (i_code_index < 0) { // Unrecognized transition from the recognition
                this._lost_delay_count++;
                if (this._lost_delay < this._lost_delay_count) {
                    // OnLeave
                    this._current_arcode_index = -1;
                    this.onLeaveHandler();
                }
                return false;
            } else if (i_code_index == this._current_arcode_index) {// Re-recognition of same ARCode
                // Event generation
                // Create a transformation matrix
                this._transmat.transMat(i_square, this._offset, result);
                // OnUpdate
                this.onUpdateHandler(i_square, result);
                this._lost_delay_count = 0;
                return true;
            } else { // Does not support recognition → now different code.
                throw new NyARException();
            }
        }
    },
    onEnterHandler: function(i_code) {
        throw new NyARException("onEnterHandler not implemented.");
    },
    onLeaveHandler: function() {
        throw new NyARException("onLeaveHandler not implemented.");
    },
    onUpdateHandler: function(i_square, result) {
        throw new NyARException("onUpdateHandler not implemented.");
    }
});

FLARDetectSquareCB_1 = ASKlass('DetectSquareCB', {// callback function of detectMarker
    // Public properties
    square: new FLARSquare(),
    confidence: 0.0,
    code_index: -1,
    cf_threshold_new: 0.50,
    cf_threshold_exist: 0.30,
    _ref_raster: null, // Refer
    _inst_patt: null, // Owning instance
    _deviation_data: null,
    _match_patt: null,
    __detectMarkerLite_mr: new NyARMatchPattResult(),
    _coordline: null
    ,
    DetectSquareCB: function(i_param) {
        this._match_patt = null;
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        return;
    }
    ,
    setNyARCodeTable: function(i_ref_code, i_code_resolution) {
        // When implemented in unmanaged, it can be a resource release here.
        this._deviation_data = new NyARMatchPattDeviationColorData(i_code_resolution, i_code_resolution);
        this._inst_patt = new NyARColorPatt_Perspective_O2(i_code_resolution, i_code_resolution, 4, 25);
        this._match_patt = new Array(i_ref_code.length);
        for (var i = 0; i < i_ref_code.length; i++) {
            this._match_patt[i] = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
        }
    },
    __tmp_vertex: NyARIntPoint2d.createArray(4)
    , _target_id: 0
    ,
    init: function(i_raster, i_target_id) { // Initialize call back handler.
        this._ref_raster = i_raster;
        this._target_id = i_target_id;
        this.code_index = -1;
        this.confidence = Number.MIN_VALUE;
    }
    ,
    // called each time the rectangle is found
    // Inspect the rectangular pattern was found, to ensure the vertex data in consideration of the orientation
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) {
        if (this._match_patt == null) {
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
        // Get the picture
        if (!this._inst_patt.pickFromRaster(this._ref_raster, vertex)) {
            return; // Failure to obtain
        }
        // Is evaluated by converting the color difference data acquisition pattern.
        this._deviation_data.setRaster(this._inst_patt);
        // get the data in, c1 code_index, dir.
        var mr = this.__detectMarkerLite_mr;
        var lcode_index = 0;
        var dir = 0;
        var c1 = 0;
        var i;
        for (i = 0; i < this._match_patt.length; i++) {
            this._match_patt[i].evaluate(this._deviation_data, mr);
            var c2 = mr.confidence;
            if (c1 < c2) {
                lcode_index = i;
                c1 = c2;
                dir = mr.direction;
            }
        }
        // Recognizing deal
        if (this._target_id == -1) { // Marker unrecognized            
            if (c1 < this.cf_threshold_new) { // Now not know
                return;
            }
            if (this.confidence > c1) {
                return; // Low degree of coincidence
            }
            this.code_index = lcode_index; // Save the marker ID that is recognized
        } else {
            // COGNITION
            // Did you recognize the current marker?
            if (lcode_index != this._target_id) {
                return; // Ignore, it is not a marker of recognition in
            }
            if (c1 < this.cf_threshold_exist) { //Or greater than the threshold of being recognized?
                return;
            }
            if (this.confidence > c1) { // Degree of coincidence greater than the current candidate?
                return;
            }
            this.code_index = this._target_id;
        }
        // Only when there is an update in the ongoing recognition or recognition, new, I want to update the information Square.
        // Above is executed only under this condition from here.
        // If there is a square having a high matching rate, to create a vertex information in consideration of the orientation
        this.confidence = c1;
        var sq = this.square;
        // In view of the direction, to update the square
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - dir) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) {
            // Full straight intersection calculation with disabilities
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException(); // OK if the double buffer if an error return here
            }
        }
    }
});

FLSingleNyIdMarkerProcesser = ASKlass('FLSingleNyIdMarkerProcesser', {
    // It is a tag variable the owner's disposal.
    tag: null,
    _lost_delay_count: 0, // Management of Lost delay
    _lost_delay: 5,
    _square_detect: null,
    _transmat: null,
    _offset: null,
    _is_active: null,
    _current_threshold: 110,
    _bin_raster: null, // [AR] Detectable Full save with results
    _tobin_filter: null,
    _callback: null,
    _data_current: null,
    FLSingleNyIdMarkerProcesser: function() {
        return;
    }
    , _initialized: false
    ,
    initInstance: function(i_param, i_encoder, i_marker_width) {
        // Economic initialization?
        NyAS3Utils.assert(this._initialized == false);
        var scr_size = i_param.getScreenSize();
        // make the analysis object
        this._square_detect = new FLARSquareContourDetector(scr_size);
        this._transmat = new NyARTransMat(i_param);
        this._callback = new FLARDetectSquareCB_2(i_param, i_encoder);

        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h); // create a binary image buffer
        // make two data objects for work
        this._data_current = i_encoder.createDataInstance();
        this._tobin_filter = new FLARRasterFilter_Threshold(110);
        this._threshold_detect = new FLARRasterThresholdAnalyzer_SlidePTile(15, 4);
        this._initialized = true;
        this._is_active = false;
        this._offset = new NyARRectOffset();
        this._offset.setSquare(i_marker_width);
        return;
    }
    ,
    setMarkerWidth: function(i_width) {
        this._offset.setSquare(i_width);
        return;
    }
    ,
    reset: function(i_is_force) {
        if (i_is_force == false && this._is_active) {
            // Events call If it is not forced rewrite
            this.onLeaveHandler();
        }
        // Marker invalid
        this._is_active = false;
        return;
    }
    ,
    detectMarker: function(i_raster) {

        if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) { // Size check
            throw new NyARException();
        }
        // converted to a binary raster image
        this._tobin_filter.setThreshold(this._current_threshold);
        this._tobin_filter.doFilter(i_raster, this._bin_raster);
        // find the square code (Find a new marker or markers, specified in the second argument)
        this._callback.init(i_raster, this._is_active ? this._data_current : null);
        this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
        // update the state recognition (I feel that if you have discovered a marker, to pass current_data)
        var is_id_found = updateStatus(this._callback.square, this._callback.marker_data);
        // threshold feedback (Also in detectExistMarker) 
        if (is_id_found) {
            // If there is a marker, to reflect the peripheral threshold of the marker
            this._current_threshold = (this._current_threshold + this._callback.threshold) / 2;
        } else {
            // If there is no marker, reference luminance search in the search + DualPTail
            var th = this._threshold_detect.analyzeRaster(i_raster);
            this._current_threshold = (this._current_threshold + th) / 2;
        }
        return;
    }
    , _threshold_detect: null
    , __NyARSquare_result: new FLARTransMatResult()
    ,
    updateStatus: function(i_square, i_marker_data) { // Updates the status of the object to drive the handle functions as necessary
        var is_id_found = false;
        var result = this.__NyARSquare_result;
        if (!this._is_active) {// Not understanding
            if (i_marker_data == null) {// Did not know did not know Full migration
                // なにもしないよーん。
                this._is_active = false;
            } else {// Transition from recognition of unrecognized
                this._data_current.copyFrom(i_marker_data);
                // Event generation
                // OnEnter
                this.onEnterHandler(this._data_current);
                // Create a transformation matrix
                this._transmat.transMat(i_square, this._offset, result);
                // OnUpdate
                this.onUpdateHandler(i_square, result);
                this._lost_delay_count = 0;
                this._is_active = true;
                is_id_found = true;
            }
        } else {// Cognition
            if (i_marker_data == null) {
                // Unrecognized transition from the recognition
                this._lost_delay_count++;
                if (this._lost_delay < this._lost_delay_count) {
                    // OnLeave
                    this.onLeaveHandler();
                    this._is_active = false;
                }
            } else if (this._data_current.isEqual(i_marker_data)) {
                // Re-recognition of same id
                this._transmat.transMatContinue(i_square, this._offset, result);
                // OnUpdate
                this.onUpdateHandler(i_square, result);
                this._lost_delay_count = 0;
                is_id_found = true;
            } else {// Recognition of different codes → not supported now
                throw new NyARException();
            }
        }
        return is_id_found;
    }
    ,
    onEnterHandler: function(i_code) { // Notification handler
        throw new NyARException("onEnterHandler not implemented.");
    }
    ,
    onLeaveHandler: function() {
        throw new NyARException("onLeaveHandler not implemented.");
    }
    , onUpdateHandler: function(i_square, result) {
        throw new NyARException("onUpdateHandler not implemented.");
    }
});

FLARDetectSquareCB_2 = ASKlass('DetectSquareCB', {// callback function of detectMarker
    // Public properties
    square: new FLARSquare(),
    marker_data: null,
    threshold: 0,
    _ref_raster: null, //Refer            
    _current_data: null, // Owning instance
    _id_pickup: new NyIdMarkerPickup(),
    _coordline: null,
    _encoder: null,
    _data_temp: null,
    _prev_data: null,
    DetectSquareCB: function(i_param, i_encoder) {
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._data_temp = i_encoder.createDataInstance();
        this._current_data = i_encoder.createDataInstance();
        this._encoder = i_encoder;
        return;
    }
    ,
    __tmp_vertex: NyARIntPoint2d.createArray(4)
    ,
    init: function(i_raster, i_prev_data) { //Initialize call back handler
        this.marker_data = null;
        this._prev_data = i_prev_data;
        this._ref_raster = i_raster;
    }
    , _marker_param: new NyIdMarkerParam()
    , _marker_data: new NyIdMarkerPattern()
    // called each time the rectangle is found
    // Inspect the rectangular pattern was found, to ensure the vertex data in consideration of the orientation             
    ,
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
        var patt_data = this._marker_data;
        // cut out from the image a pattern of the evaluation criteria
        if (!this._id_pickup.pickFromRaster(this._ref_raster, vertex, patt_data, param)) {
            return;
        }

        if (!this._encoder.encode(patt_data, this._data_temp)) { // Encode
            return;
        }
        // continued recognition request?
        if (this._prev_data == null) {
            this._current_data.copyFrom(this._data_temp); // No continuation recognition request
        } else {

            if (!this._prev_data.isEqual((this._data_temp))) { // There is continued recognition request
                return; // Is this different from a ID that had recognized claims.
            }
        }
        // Only when there is an update in the ongoing recognition or recognition, new, I want to update the information Square
        // Above is executed only under this condition from here
        var sq = this.square;
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
        this.threshold = param.threshold;
        this.marker_data = this._current_data; // Found
    }
});
