
// It provides a way to get the bitmap from the peripheral region of the marker
// Load is relatively large, they are not suitable for applications that continue to get the pattern continuously
TransformedBitmapPickup = ASKlass('TransformedBitmapPickup', NyARColorPatt_Perspective_O2, {
    _work_points: NyARIntPoint2d.createArray(4),
    _ref_perspective: null
    ,
    // @param i_width = Width of the bitmap
    // @param i_height = Height of the bitmap
    // @param i_resolution = resolution of reading pixel per point
    // on acquisition: 1 = high resolution, >1 = low resolution
    TransformedBitmapPickup: function(i_ref_cparam, i_width, i_height, i_resolution) {
        NyARColorPatt_Perspective_O2.initialize.call(this, i_width, i_height, i_resolution, 0);
        this._ref_perspective = i_ref_cparam;
    }
    ,
    // This, retrieves bitmap from the area defined by RECT : function(i_l,i_t,i_r,i_b) above transform matrix i_base_mat

    // This function, basement. From the region defined by A in the plane represented by read the bitmap
    // For example, Marker 8cmRECT(i_l,i_t,i_r,i_b)に-40,0,0,-40.0 
    // If you specify, and then extract the image in the lower left part of the marker

    // In addition, as will be away from the marker, the error will increase as you deviate from the vertical direction of the marker
    // @param i_src_imege = image of the original that writes out
    // @param i_l = relative coordinates of the upper left corner from the reference point (x)
    // @param i_t = relative coordinates of the upper left corner from the reference point (y)
    // @param i_r = relative coordinates of the lower right from the reference point (x)
    // @param i_b = relative coordinates of the lower right from the reference point (y)    
    pickupImage2d: function(i_src_imege, i_l, i_t, i_r, i_b, i_base_mat) { // return if image acquisition success or not
        var cp00, cp01, cp02, cp11, cp12;
        cp00 = this._ref_perspective.m00;
        cp01 = this._ref_perspective.m01;
        cp02 = this._ref_perspective.m02;
        cp11 = this._ref_perspective.m11;
        cp12 = this._ref_perspective.m12;
        // The coordinate transformation the four vertices of a rectangle that is coplanar with the marker on the screen by projection transformation
        // calculate the vertex
        // [hX,hY,h]=[P][RT][x,y,z]
        // Output first
        var poinsts = this._work_points;
        var yt0, yt1, yt2;
        var x3, y3, z3;
        var m00 = i_base_mat.m00;
        var m10 = i_base_mat.m10;
        var m20 = i_base_mat.m20;
        // The previously calculated elements of y and t
        yt0 = i_base_mat.m01 * i_t + i_base_mat.m03;
        yt1 = i_base_mat.m11 * i_t + i_base_mat.m13;
        yt2 = i_base_mat.m21 * i_t + i_base_mat.m23;
        // l,t
        x3 = m00 * i_l + yt0;
        y3 = m10 * i_l + yt1;
        z3 = m20 * i_l + yt2;
        poinsts[0].x = toInt((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
        poinsts[0].y = toInt((y3 * cp11 + z3 * cp12) / z3);
        // r,t
        x3 = m00 * i_r + yt0;
        y3 = m10 * i_r + yt1;
        z3 = m20 * i_r + yt2;
        poinsts[1].x = toInt((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
        poinsts[1].y = toInt((y3 * cp11 + z3 * cp12) / z3);
        // The previously calculated elements of y and t
        yt0 = i_base_mat.m01 * i_b + i_base_mat.m03;
        yt1 = i_base_mat.m11 * i_b + i_base_mat.m13;
        yt2 = i_base_mat.m21 * i_b + i_base_mat.m23;
        // r,b
        x3 = m00 * i_r + yt0;
        y3 = m10 * i_r + yt1;
        z3 = m20 * i_r + yt2;
        poinsts[2].x = toInt((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
        poinsts[2].y = toInt((y3 * cp11 + z3 * cp12) / z3);
        // l,b
        x3 = m00 * i_l + yt0;
        y3 = m10 * i_l + yt1;
        z3 = m20 * i_l + yt2;
        poinsts[3].x = toInt((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
        poinsts[3].y = toInt((y3 * cp11 + z3 * cp12) / z3);
        return this.pickFromRaster(i_src_imege, poinsts);
    }
});
