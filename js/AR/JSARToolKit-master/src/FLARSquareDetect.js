
FLARSquare = NyARSquare;
Cxdir = new IntVector([0, 1, 1, 1, 0, -1, -1, -1]);
Cydir = new IntVector([-1, -1, 0, 1, 1, 1, 0, -1]);
FLContourPickup = ASKlass('FLContourPickup', NyARContourPickup, {
    FLContourPickup: function() {
    }
    ,
    getContour_FLARBinRaster: function(i_raster, i_entry_x, i_entry_y, i_array_size, o_coord_x, o_coord_y) {
        var xdir = this._getContour_xdir;// static int xdir[8] = { 0, 1, 1, 1, 0,-1,-1,-1};
        var ydir = this._getContour_ydir;// static int ydir[8] = {-1,-1, 0, 1, 1, 1, 0,-1};
        var i_buf = i_raster.getBuffer();
        var width = i_raster.getWidth();
        var height = i_raster.getHeight();
        // get the point that is in contact with the upper end of the clip region.
        var coord_num = 1;
        o_coord_x[0] = i_entry_x;
        o_coord_y[0] = i_entry_y;
        var dir = 5;
        var c = i_entry_x;
        var r = i_entry_y;
        for (; ; ) {
            dir = (dir + 5) % 8; // normalization of dir
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

FLARSquareContourDetector = ASKlass('FLARSquareContourDetector', NyARSquareContourDetector, {
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
        this._width = i_size.w;
        this._height = i_size.h;
        // use the setAreaRange If you want to specify the size of the labeling.
        this._labeling = new NyARLabeling_Rle(this._width, this._height);
        this._stack = new NyARRleLabelFragmentInfoStack(i_size.w * i_size.h * 2048 / (320 * 240) + 32);//Detect maximum number of labels
        // The maximum length of the outline rectangle the size of the maximum that can be reflected on the screen.
        var number_of_coord = (this._width + this._height) * 2;
        // Contour buffer
        this._max_coord = number_of_coord;
        this._xcoord = new IntVector(number_of_coord);
        this._ycoord = new IntVector(number_of_coord);
        return;
    }
    ,
    // Inspected the size of the white area
    // About 320px one side, the minimum size has been analyzed up to about 8px one side maximum size
    // The object to be analyzed and, if it is within the above range in the analysis image, but a minimum size does not make sense to be too small

    //(The square of one side)
    // i_max = maximum number of white pixel area to be analyzed
    // i_min = and the minimum number of white pixel area to be analyzed
    setAreaRange: function(i_max, i_min) {
        this._labeling.setAreaRange(i_max, i_min);
    },
    __detectMarker_mkvertex: new IntVector(4)
    ,
    detectMarkerCB: function(i_raster, i_callback) {
        var flagment = this._stack;
        var overlap = this._overlap_checker;
        // Up to this point the number of labels is 0
        var label_num = this._labeling.labeling(i_raster, flagment);
        if (label_num < 1) {
            return;
        }        
        flagment.sortByArea(); // I keep sort the label
        // Get the label list
        var labels = flagment.getArray();
        var xsize = this._width;
        var ysize = this._height;
        var xcoord = this._xcoord;
        var ycoord = this._ycoord;
        var coord_max = this._max_coord;
        var mkvertex = this.__detectMarker_mkvertex;
        // Set the maximum number of overlapping checker
        overlap.setMaxLabels(label_num);
        for (var i = 0; i < label_num; i++) {
            var label_pt = labels[i];
            var label_area = label_pt.area;
            // Exclusion clip region if in contact with the frame of the screen
            if (label_pt.clip_l == 0 || label_pt.clip_r == xsize - 1) {
                continue;
            }
            if (label_pt.clip_t == 0 || label_pt.clip_b == ysize - 1) {
                continue;
            }
            // Check the overlap of the rectangle has already been detected
            if (!overlap.check(label_pt)) {
                // Seems to overlap.
                continue;
            }
            if (window.DEBUG) {
                var cv = document.getElementById('debugCanvas').getContext('2d');
                cv.strokeStyle = 'red';
                cv.strokeRect(label_pt.clip_l, label_pt.clip_t, label_pt.clip_r - label_pt.clip_l, label_pt.clip_b - label_pt.clip_t);
                cv.fillStyle = 'red';
                cv.fillRect(label_pt.entry_x - 1, label_pt.clip_t - 1, 3, 3);
                cv.fillStyle = 'cyan';
                cv.fillRect(label_pt.pos_x - 1, label_pt.pos_y - 1, 3, 3);
            }
            // Get the outline
            var coord_num = this._cpickup.getContour_FLARBinRaster(i_raster, label_pt.entry_x, label_pt.clip_t, coord_max, xcoord, ycoord);
            if (coord_num == -1)
                return -1;
            if (coord_num == coord_max) { // Outline is too large.                
                continue;
            }
            // Check the contour, and determining whether the rectangle. Get to mkvertex if rectangular
            var vertex = this._coord2vertex.getVertexIndexes(xcoord, ycoord, coord_num, label_area, mkvertex);
            if (!vertex) { // could not get the vertex                
                continue;
            }
            // notification callback function that it has found a rectangle
            i_callback.onSquareDetect(this, xcoord, ycoord, coord_num, mkvertex);
            // add to the overlap check the label belonged rectangular Discovered
            overlap.push(label_pt);
        }
        return;
    }
});
