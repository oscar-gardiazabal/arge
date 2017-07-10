
FLARDetectMarkerResult = ASKlass('FLARDetectMarkerResult', {
    arcode_id: 0,
    confidence: 0,
    direction: 0,
    square: new NyARSquare()
});

FLARDetectMarkerResultStack = ASKlass('FLARDetectMarkerResultStack', NyARObjectStack, {
    FLARDetectMarkerResultStack: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
    },
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new FLARDetectMarkerResult();
        }
        return (ret);
    }
});

// Class Search by AR code registered in the constructor, an AR code to detect multiple markers, best matches in each. 
// Approximately 100 is the limit to recognize up to 300, but as you might recognize the Gomiraberu.
FLARMultiMarkerDetector = ASKlass('FLARMultiMarkerDetector', {
    _detect_cb: null,
    AR_SQUARE_MAX: 300,
    _is_continue: false,
    _square_detect: null,
    _transmat: null,
    _offset: null,
    _flarcode: null, // import Phenomenon avoidance Decaying

    // Make the object to search from the i_code ARCode to detect a plurality of markers , the best match
    // @ Param i_param = camera parameters
    // @ Param i_code = ARCode array of markers to be detected
    // The index number of the array element will be the ARCode index obtained by getARCodeIndex function as it is
    // For example, if it is a marker that matches the ARCode element of [1], getARCodeIndex returns 1
    // @ Param i_marker_width = array specified in the millimeter size of the marker i_code. The elements of i_number_of_code individual from the beginning
    // @ Param i_number_of_code = included in the specified i_code, the number of ARCode

    FLARMultiMarkerDetector: function(i_param, i_code, i_marker_width, i_number_of_code) {
        this.initInstance(i_param, i_code, i_marker_width, i_number_of_code);
        return;
    },
    initInstance: function(i_ref_param, i_ref_code, i_marker_width, i_number_of_code) {

        var scr_size = i_ref_param.getScreenSize();
        // @todo: I put a check height and width, the ratio of the border marker of how to match all to this part. 
        // Or, it is possible to enter a number of the same forces when generating the FLARCode 
        // I create the analysis object
        var cw = i_ref_code[0].getWidth();
        var ch = i_ref_code[0].getHeight();
        // Percentage of the border (if the same as the standard ARToolKit, 25 - note the treatment of a number> 1.0 system is different!)
        var markerWidthByDec = (100 - i_ref_code[0].markerPercentWidth) / 2;
        var markerHeightByDec = (100 - i_ref_code[0].markerPercentHeight) / 2;
        // Create a holder of evaluation pattern 
        // Parameters of NyARColorPatt_Perspective_O2 
        // (The number of divisions when it was made ​​pat data) resolution of the first and second para ... vertical and horizontal 
        // Vertical and horizontal sampling number of third para ... 1 per pixel. I sample the 2x2 = 4 points if 2. 
        // Either 1, 2, 4, of any number. Concordance rate UP, frame rate decreases as the value is increased. 
        // Resolution 16, number 4 is the default sampling. If the resolution is high, it is possible to avoid a decrease in the frame rate by lowering the number of samples. 
        // (If the same as the standard ARToolKit, 25) percentage of fourth para ... edge width - note the handling of numeric> 1.0 system is different!
        var patt = new NyARColorPatt_Perspective_O2(cw, ch, 4, markerWidthByDec);
        // I can cope even if the ratio of the vertical and horizontal edge is different.
        patt.setEdgeSizeByPercent(markerWidthByDec, markerHeightByDec, 4);
        // trace('w:'+markerWidthByDec+'/h:'+markerHeightByDec);
        // callback function of detectMarker
        this._detect_cb = new MultiDetectSquareCB(patt, i_ref_code, i_number_of_code, i_ref_param);
        this._transmat = new NyARTransMat(i_ref_param);
        // NyARToolkit profile
        this._square_detect = new FLARSquareContourDetector(i_ref_param.getScreenSize());
        this._tobin_filter = new FLARRasterFilter_Threshold(100);
        //Actual size save
        this._offset = NyARRectOffset.createArray(i_number_of_code);
        for (var i = 0; i < i_number_of_code; i++) {
            this._offset[i].setSquare(i_marker_width[i]);
        }
        //I create a binary image buffer
        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
        return;
    },
    _bin_raster: null,
    _tobin_filter: null,
    detectMarkerLite: function(i_raster, i_threshold) { // return number of markers found (i_image detection)
        // @ Param i_raster = image to detect the marker. 
        // @ Param i_thresh = detection threshold. range of 0-255. usually 100-130 . 

        if (!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())) { //Size check
            throw new NyARException();
        }
        // converted to a binary raster image.
        // SOC: threshold incoming image according to brightness.
        // passing -1 for threshold allows developers to apply custom thresholding algorithms
        // prior to passing source image to FLARToolkit.

        if (i_threshold != -1) { // apply FLARToolkit thresholding            
            (FLARRasterFilter_Threshold(this._tobin_filter)).setThreshold(i_threshold);
            this._tobin_filter.doFilter(i_raster, this._bin_raster);

        } else { // copy source BitmapData as-is            
            var srcBitmapData = (i_raster.getBuffer());
            var dstBitmapData = ((this._bin_raster).getBuffer());
            dstBitmapData.copyPixels(srcBitmapData, srcBitmapData.rect, new Point());
        }

        this._detect_cb.init(i_raster); //detect
        this._square_detect.detectMarkerCB(this._bin_raster, this._detect_cb);

        return this._detect_cb.result_stack.getLength(); //return found number
    },
    // Calculates the transformation matrix for the marker of i_index, and stores to o_result the result value. 
    // You can not use detectMarkerLite you ran just before has not been successful. 
    // @ Param i_index = index number of the marker. Must be greater than or equal to 0 and less than the return value of detectMarkerLite that ran just before. 
    // @ Param o_result = specify the object that receives the result value. 
    getTransformMatrix: function(i_index, o_result) {
        var result = this._detect_cb.result_stack.getItem(i_index);
        // Calculate the neighborhood such as the position of the marker that matches most
        if (_is_continue) {
            _transmat.transMatContinue(result.square, this._offset[result.arcode_id], o_result);
        } else {
            _transmat.transMat(result.square, this._offset[result.arcode_id], o_result);
        }
        return;
    },
    // @ Param i_index = index number of marker.
    getConfidence: function(i_index) {  // return coincidence degrees (0 to 1). lower = erroneous recognition 
        return this._detect_cb.result_stack.getItem(i_index).confidence;
    },
    // @ Param i_index = index number of the marker.
    getARCodeIndex: function(i_index) { // return index of ARCode marker of i_index.       
        return this._detect_cb.result_stack.getItem(i_index).arcode_id;
    },
    getDirection: function(i_index) { // return orientation of the marker detected (0,1,2,3)
        return this._detect_cb.result_stack.getItem(i_index).direction;
    },
    getSquare: function(i_index) { // Return one FLARSquare it detects or null. (Detection Dekinakattara null)
        return this._detect_cb.result_stack.getItem(i_index).square;
    },
    // @ Param i_is_continue = If TRUE, use the transMatContinue. If FALSE, use the transMat.
    setContinueMode: function(i_is_continue) { //set getTransmationMatrix calculation mode. 
        this._is_continue = i_is_continue;
    },
    // Inspected the size of the white area 
    // About 320px one side, the minimum size has been analyzed up to about 8px one side maximum size 
    // It is analyzed and, if it is within the above range in the analysis image, but a minimum size does not make sense to be too small. 
    // Reasonable to one side 30px ~ 230px is to determine the internal marker. 
    // If you are captured at 640x480, setting the square of the vertical size i_max. 
    // It should be noted, FLARLabeling.AR_AREA_MAX, FLARLabeling.AR_AREA_MIN is adapted If you specify 0. 

    //(The square of one side)
    // @ param i_max analyzed: 100000 (default maximum number of white pixel areas)
    // @ param i_min analyzed: 70 (default minimum number of white pixel areas)
    setAreaRange: function(i_max, i_min) {
        if (i_max == null)
            i_max = 100000;
        if (i_min == null)
            i_min = 70;
        if (i_max < 0) {
            i_max = FLARLabeling.AR_AREA_MAX;
        }
        if (i_min < 0) {
            i_min = FLARLabeling.AR_AREA_MIN;
        }
        if (i_max < i_min) {
            var tmp = i_max;
            i_max = i_min;
            i_min = tmp;
        }
        this._square_detect.setAreaRange(i_max, i_min);
    },
    thresholdedBitmapData: function() { //return binarized image information 
        try {
            return ((this._bin_raster).getBuffer());
        } catch (e) {
        }
        return null;
    }
});

FLARSingleMarkerDetector = ASKlass('FLARSingleMarkerDetector', {
    _is_continue: false,
    _square_detect: null,
    _transmat: null,
    _bin_raster: null, //Image processing
    _tobin_filter: null,
    _detect_cb: null,
    _offset: null,
    FLARSingleMarkerDetector: function(i_ref_param, i_ref_code, i_marker_width) {

        var th = new FLARRasterFilter_Threshold(100);
        var patt_inst;
        var sqdetect_inst;
        var transmat_inst;
        // Proportion of the border (if same as ARToolKit standard, 25 - note the handling of numeric> 1.0 system is different!)
        var markerWidthByDec = (100 - i_ref_code.markerPercentWidth) / 2;
        var markerHeightByDec = (100 - i_ref_code.markerPercentHeight) / 2;
        // Create a holder of evaluation pattern 
        // Parameters of NyARColorPatt_Perspective_O2 
        // (The number of divisions when it was made ​​pat data) resolution of the first and second para ... vertical and horizontal 
        // Vertical and horizontal sampling number of third para ... 1 per pixel. I sample the 2x2 = 4 points if 2. 
        // Either 1, 2, 4, of any number. Concordance rate UP, frame rate decreases as the value is increased. 
        // Resolution 16, number 4 is the default sampling. If the resolution is high, it is possible to avoid a decrease in the frame rate by lowering the number of samples. 
        // (If the same as the standard ARToolKit, 25) percentage of fourth para ... edge width - note the handling of numeric> 1.0 system is different!
        patt_inst = new NyARColorPatt_Perspective_O2(i_ref_code.getWidth(), i_ref_code.getHeight(), 4, markerWidthByDec);
        // I can cope even if the ratio of the vertical and horizontal edge is different.
        patt_inst.setEdgeSizeByPercent(markerWidthByDec, markerHeightByDec, 4);
        //trace('w:'+markerWidthByDec+'/h:'+markerHeightByDec);
        sqdetect_inst = new FLARSquareContourDetector(i_ref_param.getScreenSize());
        transmat_inst = new NyARTransMat(i_ref_param);
        this.initInstance(patt_inst, sqdetect_inst, transmat_inst, th, i_ref_param, i_ref_code, i_marker_width);
        return;
    },
    initInstance: function(i_patt_inst, i_sqdetect_inst, i_transmat_inst, i_filter, i_ref_param, i_ref_code, i_marker_width) {
        var scr_size = i_ref_param.getScreenSize();

        this._square_detect = i_sqdetect_inst; // I will make the analysis object
        this._transmat = i_transmat_inst;
        this._tobin_filter = i_filter;

        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h); //I create a binary image buffer

        this._detect_cb = new SingleDetectSquareCB(i_patt_inst, i_ref_code, i_ref_param); //_detect_cb

        this._offset = new NyARRectOffset(); //Create offset
        this._offset.setSquare(i_marker_width);
        return;
    },
    // Run the marker detection process i_image, and record the results
    // @ Param i_raster = image to detect the marker. Image size, camera parameters    
    detectMarkerLite: function(i_raster, i_threshold) { // return if is detected

        FLARRasterFilter_Threshold(this._tobin_filter).setThreshold(i_threshold);
        if (!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())) { //Size check
            throw new FLARException();
        }

        this._tobin_filter.doFilter(i_raster, this._bin_raster); //I converted to a binary raster image.
        this._detect_cb.init(i_raster); //Preparing for callback handler
        //
        // Find the rectangle (the return value. Receive the callback function)
        this._square_detect.detectMarkerCB(this._bin_raster, this._detect_cb);
        if (this._detect_cb.confidence == 0) {
            return false;
        }
        return true;
    },
    // set transformation matrix of the detected markers to o_result. 
    // You cannot use detectMarkerLite. ran just before has not been successful. 
    // @ Param o_result = transformation matrix object
    getTransformMatrix: function(o_result) {

        if (this._is_continue) { //Calculate the neighborhood such as the position of the marker that matches most
            this._transmat.transMatContinue(this._detect_cb.square, this._offset, o_result);
        } else {
            this._transmat.transMat(this._detect_cb.square, this._offset, o_result);
        }
        return;
    },
    getConfidence: function() { // return coincidence degrees (0 to 1). lower = erroneous recognition
        return this._detect_cb.confidence;
    },
    getDirection: function() {  // return orientation of the marker detected (0,1,2,3)
        return this._detect_cb.direction;
    },
    getSquare: function() { //Return one FLARSquare it detects or null. (Detection Dekinakattara null)
        return this._detect_cb.square;
    },
    // @ Param i_is_continue = If TRUE, use the transMatContinue. If FALSE, use the transMat.
    setContinueMode: function(i_is_continue) { //set getTransmationMatrix calculation mode. 
        this._is_continue = i_is_continue;
    },
    // Inspected the size of the white area 
    // About 320px one side, the minimum size has been analyzed up to about 8px one side maximum size 
    // It is analyzed and, if it is within the above range in the analysis image, but a minimum size does not make sense to be too small. 
    // Reasonable to one side 30px ~ 230px is to determine the internal marker. 
    // If you are captured at 640x480, setting the square of the vertical size i_max. 
    // It should be noted, FLARLabeling.AR_AREA_MAX, FLARLabeling.AR_AREA_MIN is adapted If you specify 0. 

    //(The square of one side)
    // @ param i_max analyzed: 100000 (default maximum number of white pixel areas)
    // @ param i_min analyzed: 70 (default minimum number of white pixel areas)
    setAreaRange: function(i_max, i_min) {
        if (i_max == null)
            i_max = 100000;
        if (i_min == null)
            i_min = 70;
        if (i_max < 0) {
            i_max = FLARLabeling.AR_AREA_MAX;
        }
        if (i_min < 0) {
            i_min = FLARLabeling.AR_AREA_MIN;
        }
        if (i_max < i_min) {
            var tmp = i_max;
            i_max = i_min;
            i_min = tmp;
        }
        this._square_detect.setAreaRange(i_max, i_min);
    },
    thresholdedBitmapData: function() { //return binarized image information 
        try {
            return ((this._bin_raster).getBuffer());
        } catch (e) {
        }
        return null;
    }
});

MultiDetectSquareCB = ASKlass('MultiDetectSquareCB', { //Callback function detectMarker

    result_stack: new FLARDetectMarkerResultStack(NyARDetectMarker.AR_SQUARE_MAX), //Public properties    
    _ref_raster: null, //Reference instance    
    _inst_patt: null, //Owning instance
    _deviation_data: null,
    _match_patt: null,
    __detectMarkerLite_mr: new NyARMatchPattResult(),
    _coordline: null,
    MultiDetectSquareCB: function(i_inst_patt, i_ref_code, i_num_of_code, i_param) {

        var cw = i_ref_code[0].getWidth();
        var ch = i_ref_code[0].getHeight();
        this._inst_patt = i_inst_patt;
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._deviation_data = new NyARMatchPattDeviationColorData(cw, ch);
        this._match_patt = new Array(i_num_of_code); //NyARMatchPatt_Color_WITHOUT_PCA
        this._match_patt[0] = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[0]);
        for (var i = 1; i < i_num_of_code; i++) {

            if (cw != i_ref_code[i].getWidth() || ch != i_ref_code[i].getHeight()) { //Resolution check
                throw new NyARException();
            }
            this._match_patt[i] = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
        }
        return;
    },
    __tmp_vertex: NyARIntPoint2d.createArray(4),
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) { //ensure pattern vertex data with the orientation

        var mr = this.__detectMarkerLite_mr;

        //Convert to vertex list from the contour coordinate
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

        this._deviation_data.setRaster(this._inst_patt); //Is evaluated by converting the color difference data acquisition pattern.

        var square_index, direction; // assign a pattern that matches the most.
        var confidence;
        this._match_patt[0].evaluate(this._deviation_data, mr);
        square_index = 0;
        direction = mr.direction;
        confidence = mr.confidence;

        //Second and subsequent
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
        // recorded as information of this rectangle, the marker information that matches most
        var result = this.result_stack.prePush();
        result.arcode_id = square_index;
        result.confidence = confidence;
        result.direction = direction;
        var sq = result.square;
        // In view of the direction, to update the square
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - direction) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) {
            // Intersection calculation of straight lines
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException();// OK if the double buffer if an error return here
            }
        }
    },
    init: function(i_raster) {
        this._ref_raster = i_raster;
        this.result_stack.clear();
    }
});

SingleDetectSquareCB = ASKlass('SingleDetectSquareCB', { // callback function of detectMarker
    //Public properties
    confidence: 0,
    square: new NyARSquare(),
    direction: 0,
    //Reference instance
    _ref_raster: null,
    //Owning instance
    _inst_patt: null,
    _deviation_data: null,
    _match_patt: null,
    __detectMarkerLite_mr: new NyARMatchPattResult(),
    _coordline: null,
    SingleDetectSquareCB: function(i_inst_patt, i_ref_code, i_param) {

        this._inst_patt = i_inst_patt;
        this._deviation_data = new NyARMatchPattDeviationColorData(i_ref_code.getWidth(), i_ref_code.getHeight());
        this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
        this._match_patt = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code);
        return;
    },
    __tmp_vertex: NyARIntPoint2d.createArray(4),
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) { //ensure pattern vertex data with the orientation

        var i;
        var mr = this.__detectMarkerLite_mr;
        //Convert to vertex list from the contour coordinate
        var vertex = this.__tmp_vertex;
        vertex[0].x = i_coordx[i_vertex_index[0]];
        vertex[0].y = i_coordy[i_vertex_index[0]];
        vertex[1].x = i_coordx[i_vertex_index[1]];
        vertex[1].y = i_coordy[i_vertex_index[1]];
        vertex[2].x = i_coordx[i_vertex_index[2]];
        vertex[2].y = i_coordy[i_vertex_index[2]];
        vertex[3].x = i_coordx[i_vertex_index[3]];
        vertex[3].y = i_coordy[i_vertex_index[3]];
        //Get the picture
        if (!this._inst_patt.pickFromRaster(this._ref_raster, vertex)) {
            return;
        }
        //Is evaluated by converting the color difference data acquisition pattern
        this._deviation_data.setRaster(this._inst_patt);
        if (!this._match_patt.evaluate(this._deviation_data, mr)) {
            return;
        }
        //Exit is lower than the current rate of match
        if (this.confidence > mr.confidence) {
            return;
        }
        //If there is a square having a high matching rate, to create a vertex information in consideration of the orientation
        var sq = this.square;
        this.confidence = mr.confidence;
        this.direction = mr.direction;
        //In view of the direction, to update the square.
        for (i = 0; i < 4; i++) {
            var idx = (i + 4 - mr.direction) % 4;
            this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
        }
        for (i = 0; i < 4; i++) {
            //Full straight intersection calculation with disabilities
            if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                throw new NyARException(); //OK if the double buffer if an error return here
            }
        }
    }, 
    init: function(i_raster){
        this.confidence = 0;
        this._ref_raster = i_raster;
    }
});
