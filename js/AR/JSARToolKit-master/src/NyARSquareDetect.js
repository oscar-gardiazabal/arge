
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
        var i_buf = i_raster.getBuffer();
        var width = i_raster.getWidth();
        var height = i_raster.getHeight();
        // get the point that is in contact with the upper end of the clip region
        var coord_num = 1;
        o_coord_x[0] = i_entry_x;
        o_coord_y[0] = i_entry_y;
        var dir = 5;
        var c = i_entry_x;
        var r = i_entry_y;
        for (; ; ) {
            dir = (dir + 5) % 8; //normalization of dir
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
        this._xpos = new FloatVector(i_size.w + i_size.h); // Maximum side length this._width + this._height
        this._ypos = new FloatVector(i_size.w + i_size.h); // Maximum side length this._width + this._height
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
        if (st <= ed) {
            // Search interval is one section
            n = ed - st + 1;
            this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st, n, this._xpos, this._ypos, 0);
        } else {
            // Search interval is two sections
            n = ed + 1 + i_cood_num - st;
            this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st, i_cood_num - st, this._xpos, this._ypos, 0);
            this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, 0, ed + 1, this._xpos, this._ypos, i_cood_num - st);
        }
        //Confirmation of the number of elements
        if (n < 2) {
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
    // from the contour coordinate of i_point, look for the index of the contour coordinate in the most distant
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
NyARSquareContourDetector = ASKlass('NyARSquareContourDetector', {
    detectMarkerCB: function(i_raster, i_callback) {
        NyARException.trap("getRgbPixelReader not implemented.");
    }
});
NyARSquareContourDetector_IDetectMarkerCallback = ASKlass('NyARSquareContourDetector_IDetectMarkerCallback', {
    onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index) {
    }
});
RleLabelOverlapChecker = ASKlass('RleLabelOverlapChecker', NyARLabelOverlapChecker, {
    RleLabelOverlapChecker: function(i_max_label) {
        NyARLabelOverlapChecker.initialize.call(this, i_max_label);
    }
    , createArray: function(i_length) {
        return new Array(i_length);
    }
});
NyARSquareContourDetector_Rle = ASKlass('NyARSquareContourDetector_Rle', NyARSquareContourDetector, {
    AR_AREA_MAX: 100000, // define AR_AREA_MAX 100000
    AR_AREA_MIN: 70, // define AR_AREA_MIN 70
    _width: 0,
    _height: 0,
    _labeling: null,
    _overlap_checker: new RleLabelOverlapChecker(32),
    _cpickup: new NyARContourPickup(),
    _stack: null,
    _coord2vertex: new NyARCoord2SquareVertexIndexes(),
    _max_coord: 0,
    _xcoord: null,
    _ycoord: null
    ,
    NyARSquareContourDetector_Rle: function(i_size) { // create a class detects marker of maximum individual i_squre_max 
        this._width = i_size.w;
        this._height = i_size.h;
        //use the setAreaRange If you want to specify the size of the labeling.
        this._labeling = new NyARLabeling_Rle(this._width, this._height);
        this._labeling.setAreaRange(this.AR_AREA_MAX, this.AR_AREA_MIN);
        this._stack = new NyARRleLabelFragmentInfoStack(i_size.w * i_size.h * 2048 / (320 * 240) + 32);//検出可能な最大ラベル数
        // The maximum length of the outline rectangle the size of the maximum that can be reflected on the screen.
        var number_of_coord = (this._width + this._height) * 2;
        // Contour buffer
        this._max_coord = number_of_coord;
        this._xcoord = new IntVector(number_of_coord);
        this._ycoord = new IntVector(number_of_coord);
        return;
    },
    __detectMarker_mkvertex: new IntVector(4)
    , detectMarkerCB: function(i_raster, i_callback)
    {
        var flagment = this._stack;
        var overlap = this._overlap_checker;
        // Up to this point the number of labels is 0
        var label_num = this._labeling.labeling_NyARBinRaster(i_raster, 0, i_raster.getHeight(), flagment);
        if (label_num < 1) {
            return;
        }
        // keep sort the label
        flagment.sortByArea();
        // Get label list
        var labels = (flagment.getArray());
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

            if (!overlap.check(label_pt)) { // Check the overlap of detected rectangle
                // Seems to overlap
                continue;
            }
            // Get the outline
            var coord_num = _cpickup.getContour_NyARBinRaster(i_raster, label_pt.entry_x, label_pt.clip_t, coord_max, xcoord, ycoord);
            if (coord_num == coord_max) { // Outline is too large.                
                continue;
            }
            // Check the contour, and determining whether the rectangle. Get to mkvertex if rectangular
            if (!this._coord2vertex.getVertexIndexes(xcoord, ycoord, coord_num, label_area, mkvertex)) {
                // could not get the vertex
                continue;
            }

            i_callback.onSquareDetect(this, xcoord, ycoord, coord_num, mkvertex); // callback that found rectangle

            overlap.push(label_pt); // add to the overlap check the label belonged rectangular Discovered.
        }
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
