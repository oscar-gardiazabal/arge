
FLARColorRasterFilter_Threshold = ASKlass('FLARColorRasterFilter_Threshold', {// binarization by a constant threshold.
    FLARColorRasterFilter_Threshold: function() {
    },
    // Threshold for binarizing the image. Will be <bright point <= th scotoma.
    doFilter: function(i_input, i_output) {
        NyAS3Utils.assert(i_input.width == i_output.width && i_input.height == i_output.height);
        var out_buf = (i_output._buf);
        var in_reader = i_input._rgb_reader;
        var d = in_reader.getData().data;
        var obd = out_buf.data;
        for (var i = 0, j = 0; i < d.length; i += 4, ++j) {
            var g = d[i + 1] * 0.95;
            if (g > d[i] && g > d[i + 2]) { //TroLL 
                obd[j] = 0xffffffff; //white
            } else {
                obd[j] = 0xff000000; //black
            }
        }
        if (window.DEBUG) {
            var debugCanvas = document.getElementById('debugCanvas');
            out_buf.drawOnCanvas(debugCanvas);
        }
        return;
    }
});

FLARSquareContourDetector.prototype.detectBoard = function(i_raster, i_callback, _offset) {
    var flagment = this._stack;
    // Up to this point the number of labels is 0
    var label_num = this._labeling.imple_labeling(i_raster, null, null, i_raster._size.h, flagment);

    if (label_num < 1) {
        return;
    }
    flagment.sortByArea(); // I keep sort the label
    // Get the label list
    var xsize = this.width;
    var ysize = this.height;
    var coord_max = this._max_coord;

    var mkvertex = this.__detectMarker_mkvertex;
    var xcoord, ycoord;

    var result = []; //TroLL
    for (var i = label_num - 1; i > -1; i--) {

        xcoord = new IntVector(coord_max);
        ycoord = new IntVector(coord_max);

        var label_pt = flagment._items[i];
        // Exclusion clip region if in contact with the frame of the screen
        if (label_pt.clip_l == 0 || label_pt.clip_r == xsize - 1 ||
                label_pt.clip_t == 0 || label_pt.clip_b == ysize - 1) {
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
        if (coord_num == -1 || coord_num == coord_max) {
            continue;
        }

        // Check the contour, and determining whether the rectangle. Get to mkvertex if rectangular
        if (!this._coord2vertex.getVertexIndexes(xcoord, ycoord, coord_num, label_pt.area, mkvertex)) { // could not get the vertex
            continue;
        }

        // notification callback function that it has found a rectangle
        var param = i_callback.onBoardSquareDetect(xcoord, ycoord, mkvertex);
        if (!param) { //get MARKER info
            continue;
        }

        this._xcoord = xcoord;
        this._ycoord = ycoord;

        param.i_coor_num = coord_num;
        param.i_vertex_index = $.extend({}, this.__detectMarker_mkvertex);

        result.push(param);
    }

    if (result.length) {
        var param = result[result.length - 1];

        var boardCombination = false;
        this.getMarkerCombination(result, function(array, dv) { //TroLL

            //100+20+20
            var x = -(param.marker.p.x + dv / 2) * 140;
            var y = -1500 + (param.marker.p.y + dv / 2) * 140;
            Game.sceneGroup.position = new THREE.Vector3(x, y, 0);

            var offsetWidth = 140 * dv;
//            if (_offset.width != offsetWidth) {
                _offset.setSquare(offsetWidth);
//                _offset.width = offsetWidth;
//            }

            var vX = [], vY = [];
            for (var i = 0; i < array.length; i++) {
                var cp = result[array[i]].centerPoint;
                vX.push(cp[0]);
                vY.push(cp[1]);
//                if (window.DEBUG) {
//                    cv = document.getElementById('debugCanvas').getContext('2d');
//                    cv.fillStyle = 'rgb(255,0,255)'; //magenta
//                    cv.fillRect(cp[0] - 4, cp[1] - 4, 9, 9);
//                }
            }

            i_callback.onSquareCompound(vX, vY); //TroLL
            boardCombination = true;
        });

        if (!boardCombination) {

            //100+20+20
            Game.sceneGroup.position = new THREE.Vector3(-param.marker.p.x * 140, -1500 + param.marker.p.y * 140, 0);

//            if (_offset.width != 100) {
                _offset.setSquare(100);
//                _offset.width = 100;
//            }
            i_callback.onSquareResult(param, this._xcoord, this._ycoord); //TroLL

            if (window.DEBUG) {
                cv = document.getElementById('debugCanvas').getContext('2d');
                cv.fillStyle = 'rgb(255,0,255)'; //magenta
                cv.fillRect(param.centerPoint[0] - 5, param.centerPoint[1] - 5, 10, 10);
            }
        }
        Game.sceneGroup.updateMatrix();
    }
    return;
};

FLARSquareContourDetector.prototype.getMarkerCombination = function(params, callback) { //TroLL

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
};

MarkerBitEncoder = ASKlass('MarkerBitEncoder', {
    _bits: 0
    ,
    setBitByBitIndex: function(i_value) {
        this._bits = parseInt(this._bits.toString(2) + i_value, 2);
        return;
    }
});

NyIdBoardPickup = ASKlass('NyIdBoardPickup', {// NyARIdMarkerData from any rectangle of the raster image
    _perspective_reader: null,
    __pickFromRaster_encoder: new MarkerBitEncoder(),
    NyIdBoardPickup: function() {
        this._perspective_reader = new PerspectivePixelBoardReader();
        return;
    }
    ,
    // read id marker from i_image. Marker data to o_data, marker parameters to o_param.
    pickFromRaster: function(image, i_vertex, o_param) {

        // Calculate the parameters of perspective
        if (!this._perspective_reader.setSourceSquare(i_vertex)) {
            if (window.DEBUG) {
                console.log('NyIdBoardPickup.pickFromRaster: could not setSourceSquare')
            }
            return false;
        }

        var reader = image._gray_reader;
        var encoder = this.__pickFromRaster_encoder;
        encoder._bits = 0;
        // Get the marker parameter
        var cp = this._perspective_reader.readDataBits(reader, encoder)
        if (!cp) {
            return false;
        }

        o_param.bits = encoder._bits; //TroLL
        o_param.marker = board[o_param.bits];
        if (!o_param.marker) {
            return false;
        }
        //TroLL
        o_param.centerPoint = cp;
        o_param.direction = o_param.marker.d;
        return true;
    }
});

NyARCoord2Linear.prototype.coord2LineSquare = function(_xpos, _ypos, o_line) {
    var evec = this.__getSquareLine_evec;
    var ev = this.__getSquareLine_ev;
    var mean = this.__getSquareLine_mean;
    this._pca.pca(_xpos, _ypos, 2, evec, ev, mean);
    o_line.dy = evec.m01;
    o_line.dx = -evec.m00;
    o_line.c = -(o_line.dy * mean[0] + o_line.dx * mean[1]);
    return true;
};

// reading NyARColorPatt_NyIdMarker. Conversion from raster Perspective
PerspectivePixelBoardReader = ASKlass('PerspectivePixelBoardReader', {
    _param_gen: new NyARPerspectiveParamGenerator_O1(1, 1, 100, 100),
    _cparam: new FloatVector(8),
    PerspectivePixelBoardReader: function() {
        return;
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
        var qx = cx;
        var qy = cy;
        this.centerPoint[0] = qx;
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

        var cp;

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
            
            if (i == 1) {
                var x = (ref_x[5] + ref_x[6]) / 2;
                var y = (ref_y[5] + ref_y[6]) / 2;
                cp = new IntVector([x, y]);
            }
            
            if (window.DEBUG) {
                this.debugDataBits(ref_x, ref_y, resolution * 4);
            }
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
        return cp;
    }
    ,
    debugDataBits: function(i_x, i_y, i_num) {
        for (var i = 0; i < i_num; i++) {
            var cv = document.getElementById('debugCanvas').getContext('2d');
            cv.fillStyle = 'red';
            cv.fillRect(i_x[i], i_y[i], 1, 1); //TroLL
        }
    }
});

FLARBoardDetectCB = ASKlass('FLARBoardDetectCB', {// callback function of detectMarker !PLUGIN
// Public properties
    result_stack: new FLARDetectIdMarkerResult(),
    square: new FLARSquare(),
    _ref_raster: null,
    _prev_data: null,
    _id_pickup: new NyIdBoardPickup(),
    _coordline: null,
    __tmp_vertex: NyARIntPoint2d.createArray(4)
    ,
    FLARBoardDetectCB: function(i_param) {
        this._coordline = new NyARCoord2Linear(i_param._screen_size, i_param._dist);
        return;
    }
    ,
    init: function(i_raster) { // Initialize call back handler.                
        this._ref_raster = i_raster;
    }
    ,
    onBoardSquareDetect: function(i_coordx, i_coordy, i_vertex_index) { //ensure pattern vertex data with the orientation
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
                cv.fillRect(vertex[i].x - 2, vertex[i].y - 2, 4, 4);
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
        var result = this.result_stack;
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
        var sq = this.result_stack.square;
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

FLARBoardDetector = ASKlass('FLARBoardDetector', {//!PLUGIN
    _is_continue: false,
    _square_detect: null,
    _offset: null,
    _bin_raster: null, //g [AR] Detectable Full save with results
    _tobin_filter: null,
    _callback: null,
    _transmat: null
    ,
    FLARBoardDetector: function(i_param) {
        var scr_size = i_param._screen_size;
        // make the analysis object
        this._square_detect = new FLARSquareContourDetector(scr_size);
        this._callback = new FLARBoardDetectCB(i_param);
        this._transmat = new NyARTransMat(i_param);
        // create a binary image buffer
        this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
        this._tobin_filter = new FLARColorRasterFilter_Threshold();
        this._offset = new NyARRectOffset();
//        this._offset.width = 0;
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
        this._square_detect.detectBoard(this._bin_raster, this._callback, this._offset);
        //I return the number found
        return true;
    }
    ,
    // Calculates the transformation matrix for the marker of i_index, and stores to o_result 
    // the result value. You can not use detectMarkerLite you ran just before has not been successful. 

    // @ Param i_index = index number of the marker. Must be greater than or equal to 0 and less 
    // than the return value of detectMarkerLite that ran just before. 
    // @ Param o_result = object that receives the result value. 
    getTransformMatrix: function(o_result) { //!IMPORTANT
        var result = this._callback.result_stack; //unique
        // Calculate the neighborhood such as the position of the marker that matches most

//        return this._transmat.transMatContinue(result.square, this._offset, o_result);
        return this._transmat.transMatBoard(result.square, this._offset, o_result);
    }
});

//nothing changes

NyARTransMat.prototype.transMatBoard = function(i_square, i_offset, o_result_conv) {

    var trans = this.__transMat_trans;
    // io_result_conv If the initial value, calculated in transMat.
    if (!o_result_conv.has_value) {
        this.transMat(i_square, i_offset, o_result_conv);
        return true;
    }
    // To determine the threshold of optimization calculation
    var err_threshold = this.makeErrThreshold(i_square.sqvertex);
//    err_threshold = -99999; //.
//    console.log(err_threshold)
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
//    console.log("min_err = " + min_err)

    var rot = this.__rot;
    //  The error rate is greater than the last threshold error value
    if (min_err < o_result_conv.error + err_threshold) { //only try to optimice last trasform        
        rot.setValue_NyARDoubleMatrix33(this._rotmatrix);
        // Try to optimization.
        for (var i = 0; i < 5; i++) { //cinco
            // Optimization of the transformation matrix
            this._mat_optimize.modifyMatrix(rot, trans, i_offset.vertex, vertex_2d, 4);
            var err = this.errRate(rot, trans, i_offset.vertex, vertex_2d, 4, vertex_3d);
//                console.log("E: " + err);
            if (min_err - err < err_threshold / 2) {
                break;
            }
            console.log("OPTIMICE");
            this._transsolver.solveTransportVector(vertex_3d, trans);
            this._rotmatrix.setValue_NyARDoubleMatrix33(rot);
            min_err = err;
        }
        this.updateMatrixValue(this._rotmatrix, trans, o_result_conv);

    } else { // calculate new trasformation
        console.log("new")
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
    return true;
};
