
NyARCustomSingleDetectMarker = ASKlass('NyARCustomSingleDetectMarker', {
    _is_continue: false,
    _square_detect: null,
    _transmat: null,
    //Image processing
    _bin_raster: null,
    _tobin_filter: null,
    _detect_cb: null,
    _offset: null,
    NyARCustomSingleDetectMarker: function() {
        return;
    }
    ,
    initInstance: function(i_patt_inst, i_sqdetect_inst, i_transmat_inst, i_filter, i_ref_param, i_ref_code, i_marker_width) {
        var scr_size = i_ref_param.getScreenSize();
        // make the analysis object
        this._square_detect = i_sqdetect_inst;
        this._transmat = i_transmat_inst;
        this._tobin_filter = i_filter;

        this._bin_raster = new NyARBinRaster(scr_size.w, scr_size.h); // create a binary image buffer        
        this._detect_cb = new DetectSquareCB_3(i_patt_inst, i_ref_code, i_ref_param);
        this._offset = new NyARRectOffset(); // Create offset
        this._offset.setSquare(i_marker_width);
        return;
    }
    ,
    // Run the marker detection process i_image, and record the results
    // @Param i_raster = image to detect the marker (size, camera parameters)
    detectMarkerLiteB: function(i_raster) { // return if marker is detected
        if (!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())) { // Size check
            throw new NyARException();
        }
        this._tobin_filter.doFilter(i_raster, this._bin_raster); // convert to binary raster image        
        this._detect_cb.init(i_raster); // Preparing for callback handler
        // Find the rectangle (the return value. Receive the callback function)
        this._square_detect.detectMarkerCB(this._bin_raster, _detect_cb);
        if (this._detect_cb.confidence == 0) {
            return false;
        }
        return true;
    }
    ,
    // not use detectMarkerLite, you ran just before has not been successful
    // @param o_result = object that receives the transformation matrix
    getTransmationMatrix: function(o_result) { // returns to o_result transformation matrix of detected markers

        // Calculate neighborhood such as the position of the marker that matches most
        if (this._is_continue) {
            this._transmat.transMatContinue(this._detect_cb.square, this._offset, o_result);
        } else {
            this._transmat.transMat(this._detect_cb.square, this._offset, o_result);
        }
        return;
    },
    refSquare: function() { // return the current rectangle.
        return this._detect_cb.square;
    }
    ,
    getConfidence: function() { // return degree marker match (0 to 1). low degree = higher erroneous recognition
        return this._detect_cb.confidence;
    }
    ,
    // @param i_is_continue = if TRUE, get compatible transMatCont. if FALSE, get compatible transMat
    setContinueMode: function(i_is_continue) { //set the calculation mode of getTransmationMatrix. default = TRUE
        this._is_continue = i_is_continue;
    }
});

DetectSquareCB_3 = ASKlass('DetectSquareCB', NyARSquareContourDetector_IDetectMarkerCallback, {// detectMarker callback function
    // Public properties
    confidence: 0,
    square: new NyARSquare(),
    // Reference instance
    _ref_raster: null,
    // Owning instance
    _inst_patt: null,
    _deviation_data: null,
    _match_patt: null,
    __detectMarkerLite_mr: new NyARMatchPattResult(),
    _coordline: null
    ,
    DetectSquareCB: function(i_inst_patt, i_ref_code, i_param) {
        this._inst_patt = i_inst_patt;
        this._deviation_data = new NyARMatchPattDeviationColorData(i_ref_code.getWidth(), i_ref_code.getHeight());
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._match_patt = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code);
        return;
    },
    __tmp_vertex: NyARIntPoint2d.createArray(4)
    ,
    // called each time the rectangle is found
    // inspect the rectangular pattern was found, to ensure the vertex data in consideration of the orientation
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) {
        var i;
        var mr = this.__detectMarkerLite_mr;
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

        if (!this._inst_patt.pickFromRaster(this._ref_raster, vertex)) { // get the picture
            return;
        }
        // is evaluated by converting the color difference data acquisition pattern
        this._deviation_data.setRaster(this._inst_patt);
        if (!this._match_patt.evaluate(this._deviation_data, mr)) {
            return;
        }

        if (this.confidence > mr.confidence) { // Exit is lower than the current rate of match
            return;
        }
        // if high matching rate square, create vertex information whith the orientation
        var sq = this.square;
        this.confidence = mr.confidence;
        // update the square in view of the direction
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - mr.direction) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) {
            // full straight intersection calculation with disabilities
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException(); // OK if the double buffer if an error return here
            }
        }
    },
    init: function(i_raster) {
        this.confidence = 0;
        this._ref_raster = i_raster;
    }
});

// Class Search by AR code registered in the constructor, an AR code to detect multiple markers, best matches in each. 
// Approximately 100 is the limit to recognize up to 300, but as you might recognize the Gomiraberu.
NyARDetectMarker = ASKlass('NyARDetectMarker', {
    _detect_cb: null,
    AR_SQUARE_MAX: 300,
    _is_continue: false,
    _square_detect: null,
    _transmat: null,
    _offset: null
    ,
    // Make the object to search from the i_code ARCode to detect a plurality of markers, the best match.
    // @param i_param = camera parameters
    // @param i_code = array ARCode of index marker detected. obtained by getARCodeIndex
    // @param i_marker_width = marker i_code array size (mm)
    // @param i_number_of_code = number of ARCode included in the i_code
    // @param i_input_raster_type = pixel type of the input raster. of getBufferType of INyARBufferReader interface
    NyARDetectMarker: function(i_param, i_code, i_marker_width, i_number_of_code, i_input_raster_type) {
        this.initInstance(i_param, i_code, i_marker_width, i_number_of_code, i_input_raster_type);
        return;
    }
    ,
    initInstance: function(i_ref_param, i_ref_code, i_marker_width, i_number_of_code, i_input_raster_type) {
        var scr_size = i_ref_param.getScreenSize();
        // make the analysis object
        var cw = i_ref_code[0].getWidth();
        var ch = i_ref_code[0].getHeight();
        // callback function of detectMarker
        this._detect_cb = new NyARDetectSquareCB(
                new NyARColorPatt_Perspective_O2(cw, ch, 4, 25),
                i_ref_code, i_number_of_code, i_ref_param);
        this._transmat = new NyARTransMat(i_ref_param);
        // NyARToolkit profile
        this._square_detect = new NyARSquareContourDetector_Rle(i_ref_param.getScreenSize());
        this._tobin_filter = new NyARRasterFilter_ARToolkitThreshold(100, i_input_raster_type);
        // Actual size save
        this._offset = NyARRectOffset.createArray(i_number_of_code);
        for (var i = 0; i < i_number_of_code; i++) {
            this._offset[i].setSquare(i_marker_width[i]);
        }

        this._bin_raster = new NyARBinRaster(scr_size.w, scr_size.h); // create a binary image buffer
        return;
    },
    _bin_raster: null,
    _tobin_filter: null
    ,
    // Run the marker detection process i_image, and record the results.
    // @param i_raster = image to detect the marker
    // @param i_thresh = detection threshold (0 to 255). as much 100-130 usually
    detectMarkerLite: function(i_raster, i_threshold) { // return number markers found. if marker not found = 0
        if (!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())) { // Size check
            throw new NyARException();
        }
        // converted to a binary raster image.
        (NyARRasterFilter_ARToolkitThreshold(this._tobin_filter)).setThreshold(i_threshold);
        this._tobin_filter.doFilter(i_raster, this._bin_raster);

        this._detect_cb.init(i_raster); //detect
        this._square_detect.detectMarkerCB(this._bin_raster, this._detect_cb);

        return this._detect_cb.result_stack.getLength(); // return the number found
    }
    ,
    // transformation matrix for the marker of i_index, and stores to o_result the result value. You can not use detectMarkerLite you ran just before has not been successful
    // @param i_index = index number of the marker. >= 0 && < of detectMarkerLite function ran before
    // @param o_result = object that receives the result value.
    getTransmationMatrix: function(i_index, o_result) {
        var result = this._detect_cb.result_stack.getItem(i_index);
        // neighborhood such as the position of the marker that matches most
        if (_is_continue) {
            _transmat.transMatContinue(result.square, this._offset[result.arcode_id], o_result);
        } else {
            _transmat.transMat(result.square, this._offset[result.arcode_id], o_result);
        }
        return;
    }
    ,
    // @param i_index = index number of the marker. >=0 && < of detectMarkerLite function ran before    
    getConfidence: function(i_index) { // return degree marker match (0 to 1). low degree = higher erroneous recognition
        return this._detect_cb.result_stack.getItem(i_index).confidence;
    }
    ,
    // @param i_index = marker index. >= 0 && < of detectMarkerLite function ran before
    getARCodeIndex: function(i_index) { // return the index of ARCode marker of i_index.
        return this._detect_cb.result_stack.getItem(i_index).arcode_id;
    }
    ,
    // @param i_is_continue = If TRUE, use the transMatContinue. If FALSE, use the transMat.
    setContinueMode: function(i_is_continue) { // set the calculation mode of getTransmationMatrix.
        this._is_continue = i_is_continue;
    }
});

NyARDetectMarkerResult = ASKlass('NyARDetectMarkerResult', {
    arcode_id: 0,
    confidence: 0,
    square: new NyARSquare()
});

NyARDetectMarkerResultStack = ASKlass('NyARDetectMarkerResultStack ', NyARObjectStack, {
    NyARDetectMarkerResultStack: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new NyARDetectMarkerResult();
        }
        return (ret);
    }
});

NyARDetectSquareCB = ASKlass('NyARDetectSquareCB ', NyARSquareContourDetector_IDetectMarkerCallback, {
    // Public properties
    result_stack: new NyARDetectMarkerResultStack(NyARDetectMarker.AR_SQUARE_MAX),
    // Reference instance
    _ref_raster: null,
    // Owning instance
    _inst_patt: null,
    _deviation_data: null,
    _match_patt: null,
    __detectMarkerLite_mr: new NyARMatchPattResult(),
    _coordline: null
    ,
    NyARDetectSquareCB: function(i_inst_patt, i_ref_code, i_num_of_code, i_param) {
        var cw = i_ref_code[0].getWidth();
        var ch = i_ref_code[0].getHeight();
        this._inst_patt = i_inst_patt;
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._deviation_data = new NyARMatchPattDeviationColorData(cw, ch);
        // Creating NyARMatchPatt_Color_WITHOUT_PCA of []
        this._match_patt = new Array(i_num_of_code);
        this._match_patt[0] = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[0]);
        for (var i = 1; i < i_num_of_code; i++) {
            // Resolution check
            if (cw != i_ref_code[i].getWidth() || ch != i_ref_code[i].getHeight()) {
                throw new NyARException();
            }
            this._match_patt[i] = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
        }
        return;
    },
    __tmp_vertex: NyARIntPoint2d.createArray(4)
    ,
    // is called each time the rectangle is found.
    // Inspect the rectangular pattern was found, to ensure the vertex data in consideration of the orientation.
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) {
        var mr = this.__detectMarkerLite_mr;
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

        if (!this._inst_patt.pickFromRaster(this._ref_raster, vertex)) { // Get the picture
            return;
        }
        // evaluated by converting the color difference data acquisition pattern.
        this._deviation_data.setRaster(this._inst_patt);
        // assign a pattern that matches the most.
        var square_index, direction;
        var confidence;
        this._match_patt[0].evaluate(this._deviation_data, mr);
        square_index = 0;
        direction = mr.direction;
        confidence = mr.confidence;
        // Second and subsequent
        var i;
        for (i = 1; i < this._match_patt.length; i++) {
            this._match_patt[i].evaluate(this._deviation_data, mr);
            if (confidence > mr.confidence) {
                continue;
            }
            // The dumping there was a marker that matches more
            square_index = i;
            direction = mr.direction;
            confidence = mr.confidence;
        }
        // recorded as information of this rectangle, the marker information that matches most.
        var result = this.result_stack.prePush();
        result.arcode_id = square_index;
        result.confidence = confidence;
        var sq = result.square;
        // In view of the direction, to update the square.
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - direction) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) {
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) { //straight lines intersection
                throw new NyARException(); // if double buffer error, return here
            }
        }
    },
    init: function(i_raster) {
        this._ref_raster = i_raster;
        this.result_stack.clear();
    }
});

NyARSingleDetectMarker = ASKlass('NyARSingleDetectMarker', NyARCustomSingleDetectMarker, {// best marker match the ARCode from image
    PF_ARTOOLKIT_COMPATIBLE: 1,
    PF_NYARTOOLKIT: 2,
    PF_NYARTOOLKIT_ARTOOLKIT_FITTING: 100,
    PF_TEST2: 201
    ,
    // from camera parameters and ARCode to be detected, create a NyARSingleDetectMarker detect ARCode instance
    // @param i_param = camera parameters
    // @param i_code = ARCode to be detected
    // @param i_marker_width = physical size of the AR code (mm)
    // @param i_input_raster_type = input raster pixel type. getBufferType value of INyARBufferReader interface
    NyARSingleDetectMarker: function(i_param, i_code, i_marker_width, i_input_raster_type, i_profile_id) {
        if (i_profile_id == null)
            i_profile_id = this.PF_NYARTOOLKIT;
        NyARCustomSingleDetectMarker.initialize.call(this);
        this.initInstance2(i_param, i_code, i_marker_width, i_input_raster_type, i_profile_id);
        return;
    }
    ,
    initInstance2: function(i_ref_param, i_ref_code, i_marker_width, i_input_raster_type, i_profile_id) { //constructor function
        var th = new NyARRasterFilter_ARToolkitThreshold(100, i_input_raster_type);
        var patt_inst;
        var sqdetect_inst;
        var transmat_inst;
        switch (i_profile_id) {
            case this.PF_NYARTOOLKIT: //default
                patt_inst = new NyARColorPatt_Perspective_O2(i_ref_code.getWidth(), i_ref_code.getHeight(), 4, 25);
                sqdetect_inst = new NyARSquareContourDetector_Rle(i_ref_param.getScreenSize());
                transmat_inst = new NyARTransMat(i_ref_param);
                break;
            default:
                throw new NyARException();
        }
        NyARCustomSingleDetectMarker.initInstance.call(this, patt_inst, sqdetect_inst, transmat_inst, th, i_ref_param, i_ref_code, i_marker_width);
    }
    ,
    // Run the marker detection process i_image, and record the results.
    // @param i_raster = image marker detect: i_input_raster_type format with the screen size (image size in i_param)
    detectMarkerLite: function(i_raster, i_threshold) { // return if marker is detected
        (NyARRasterFilter_ARToolkitThreshold(this._tobin_filter)).setThreshold(i_threshold);
        return NyARCustomSingleDetectMarker.detectMarkerLiteB.call(this, i_raster);
    }
});
