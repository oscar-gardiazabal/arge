
NyARLabelInfo = ASKlass('NyARLabelInfo', {
    area: 0,
    clip_r: 0,
    clip_l: 0,
    clip_b: 0,
    clip_t: 0,
    pos_x: 0,
    pos_y: 0,
    NyARLabelInfo: function() {
    }
});

NyARLabelInfoStack = ASKlass('NyARLabelInfoStack', {
    _items: null,
    _length: 0,
    NyARLabelInfoStack: function(i_length) {
        this._items = this.createArray(i_length); // Partitioning        
        this._length = 0; // Reset busy number
        return;
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(i_length);
        for (var i = 0; i < i_length; i++) {
            ret[i] = new NyARLabelInfo();
        }
        return (ret);
    }
    ,
    sortByArea: function() { // sort the label in descending order of area.
        var len = this._length;
        if (len < 1) {
            return;
        }
        var h = Math.floor(len * 13 / 10);
        var item = this._items;
        for (; ; ) {
            var swaps = 0;
            for (var i = 0; i + h < len; i++) {
                if (item[i + h].area > item[i].area) {
                    var temp = item[i + h];
                    item[i + h] = item[i];
                    item[i] = temp;
                    swaps++;
                }
            }
            if (h == 1) {
                if (swaps == 0) {
                    break;
                }
            } else {
                h = Math.floor(h * 10 / 13);
            }
        }
    }
    ,
    prePush: function() { // reserve the new area. (return Null if fails)

        if (this._length >= this._items.length) { // Allocated as needed
            return null;
        }
        // To +1 space used, and return the space reservation.
        var ret = this._items[this._length];
        this._length++;
        return ret;
    }
    ,
    // @param i_reserv_length = Size to the used 
    init: function(i_reserv_length) { // initialize the stack
        // Allocated as needed
        if (i_reserv_length >= this._items.length) {
            throw new NyARException();
        }
        this._length = i_reserv_length;
    }
    ,
    pop: function() { // reduce the number of elements one of apparent. returns the object (valid until the next push)
        NyAS3Utils.assert(this._length >= 1);
        this._length--;
        return this._items[this._length];
    }
    ,
    pops: function(i_count) { // reduce i_count individual the number of elements of apparent. 
        NyAS3Utils.assert(this._length >= i_count);
        this._length -= i_count;
        return;
    }
    , getArray: function() { //array return
        return this._items;
    }
    ,
    getItem: function(i_index) {
        return this._items[i_index];
    }
    ,
    getLength: function() { // return the number of elements in the array apparent
        return this._length;
    }
    ,
    clear: function() { // reset the number of elements of apparent
        this._length = 0;
    }
});

NyARLabelOverlapChecker = ASKlass('NyARLabelOverlapChecker', {
    _labels: null,
    _length: 0,
    NyARLabelOverlapChecker: function(i_max_label) {
        this._labels = this.createArray(i_max_label);
    }
    ,
    createArray: function(i_length) {
        return new Array(i_length);
    }
    ,
    push: function(i_label_ref) { // add a label to be checked.
        this._labels[this._length] = i_label_ref;
        this._length++;
    }
    ,
    check: function(i_label) { // Returns if overlaps with the label on the current list
        // processing overlap?
        var label_pt = this._labels;
        var px1 = toInt(i_label.pos_x);
        var py1 = toInt(i_label.pos_y);
        for (var i = this._length - 1; i >= 0; i--) {
            var px2 = toInt(label_pt[i].pos_x);
            var py2 = toInt(label_pt[i].pos_y);
            var d = (px1 - px2) * (px1 - px2) + (py1 - py2) * (py1 - py2);
            if (d < label_pt[i].area / 4) {
                return false; // Excluded
            }
        }
        return true; // Target
    }
    ,
    setMaxLabels: function(i_max_label) { //Reset object to accumulate the largest label i_max_label individual
        if (i_max_label > this._labels.length) {
            this._labels = this.createArray(i_max_label);
        }
        this._length = 0;
    }
});

NyARLabeling_Rle = ASKlass('NyARLabeling_Rle', {// labeling RleImage
    AR_AREA_MAX: 100000, // #define AR_AREA_MAX 100000
    AR_AREA_MIN: 70, // #define AR_AREA_MIN 70
    _rlestack: null,
    _rle1: null,
    _rle2: null,
    _max_area: 0,
    _min_area: 0,
    NyARLabeling_Rle: function(i_width, i_height) {
        this._rlestack = new RleInfoStack(i_width * i_height * 2048 / (320 * 240) + 32);
        this._rle1 = RleElement.createArray(i_width / 2 + 1);
        this._rle2 = RleElement.createArray(i_width / 2 + 1);
        this.setAreaRange(this.AR_AREA_MAX, this.AR_AREA_MIN);
        return;
    }
    ,
    setAreaRange: function(i_max, i_min) { // Target size
        this._max_area = i_max;
        this._min_area = i_min;
        return;
    }
    ,
    // RLE compress the image of gs i_bin_buf
    // threshold at the time of 0, GS raster when the BIN raster    
    // Scotoma <= th < bright point
    toRLE: function(i_bin_buf, i_st, i_len, i_out, i_th) { // function recognized as a dark point threshold
        var current = 0;
        var lidx = 0, ridx = 1, fidx = 2, off = 3;
        var r = -1;
        // Line fixed start
        var x = i_st;
        var right_edge = i_st + i_len - 1;
        while (x < right_edge) {
            // Scotoma (0) scan
            if (i_bin_buf[x] != 0xffffffff) {
                x++;//Bright point
                continue;
            }
            // examine the point length dark → discovery of dark spots
            r = (x - i_st);
            i_out[current + lidx] = r;
            r++; // +1 Scotoma
            x++;
            while (x < right_edge) {
                if (i_bin_buf[x] != 0xffffffff) {
                    // Point dark bright point (1) → (0) array end> registration
                    i_out[current + ridx] = r;
                    current += off;
                    x++; // Confirmation of the runner-up.
                    r = -1; // 0 to the position of the right edge.
                    break;

                } else { // Scotoma (0) additional length                    
                    r++;
                    x++;
                }
            }
        }
        // Judgment approach is slightly different only one point in the last
        if (i_bin_buf[x] != 0xffffffff) {
            // Registration>-terminated array of dark spots if bright point → r count in
            if (r >= 0) {
                i_out[current + ridx] = r;
                current += off;
            }
        } else {
            // Add l1 if not in → count scotoma
            if (r >= 0) {
                i_out[current + ridx] = (r + 1);
            } else {
                // In the case of one point of the last
                i_out[current + lidx] = (i_len - 1);
                i_out[current + ridx] = (i_len);
            }
            current += off;
        }
        return current / off; // Fixed line
    }
    ,
    addFragment: function(i_rel_img, i_img_idx, i_nof, i_row_index, o_stack) {
        var lidx = 0, ridx = 1, fidx = 2, off = 3;
        var l = i_rel_img[i_img_idx + lidx];
        var r = i_rel_img[i_img_idx + ridx];
        var len = r - l;
        i_rel_img[i_img_idx + fidx] = i_nof; // unique ID of each REL
        var v = o_stack.prePush();
        v.entry_x = l;
        v.area = len;
        v.clip_l = l;
        v.clip_r = r - 1;
        v.clip_t = i_row_index;
        v.clip_b = i_row_index;
        v.pos_x = (len * (2 * l + (len - 1))) / 2;
        v.pos_y = i_row_index * len;
        return;
    }
    ,
    // try to also prepare low-speed system while converting to BIN-RLE raster from the desired
    // The labeling while converted into BIN raster GS raster using a single threshold
    labeling_NyARBinRaster: function(i_bin_raster, i_top, i_bottom, o_stack) {
        NyAS3Utils.assert(i_bin_raster.isEqualBufferType(NyARBufferType.INT1D_BIN_8));
        return this.imple_labeling(i_bin_raster, 0, i_top, i_bottom, o_stack);
    }
    ,
    // @param i_th = Threshold for binarizing the image. Will be <bright point <= th scotoma     
    labeling_NyARGrayscaleRaster: function(i_gs_raster, i_th, i_top, i_bottom, o_stack) { // label the BIN raster
        NyAS3Utils.assert(i_gs_raster.isEqualBufferType(NyARBufferType.INT1D_GRAY_8));
        return this.imple_labeling(i_gs_raster, i_th, i_top, i_bottom, o_stack);
    }
    ,
    labeling: function(i_bin_raster, o_stack) {
        return this.imple_labeling(i_bin_raster, 0, 0, i_bin_raster.getHeight(), o_stack);
    }
    ,
    imple_labeling: function(i_raster, i_th, i_top, i_bottom, o_stack) {
        // Reset process
        var rlestack = this._rlestack;
        rlestack.clear();

        var rle_prev = this._rle1;
        var rle_current = this._rle2;
        var len_prev = 0;
        var len_current = 0;
        var width = i_raster.getWidth();
        var in_buf = (i_raster.getBuffer().data);
        var id_max = 0;
        var label_count = 0;
        var lidx = 0, ridx = 1, fidx = 2, off = 3;
        // The first-stage registration
        len_prev = this.toRLE(in_buf, i_top, width, rle_prev, i_th);
        var i;
        for (i = 0; i < len_prev; i++) {
            // Fragment fragment ID = initial value, POS = Y value, REL index = line
            this.addFragment(rle_prev, i * off, id_max, i_top, rlestack);
            id_max++;
            label_count++; // maximum value check
        }
        var f_array = (rlestack.getArray());
        // Join the next stage
        for (var y = i_top + 1; y < i_bottom; y++) {
            // Read the current line
            len_current = this.toRLE(in_buf, y * width, width, rle_current, i_th);
            var index_prev = 0;
            SCAN_CUR: for (i = 0; i < len_current; i++) {
                // adjust the position index_prev, of len_prev
                var id = -1;
                SCAN_PREV: while (index_prev < len_prev) { // Check if there is a prev to be checked
                    if (rle_current[i * off + lidx] - rle_prev[index_prev * off + ridx] > 0) { //8 orientation labeling if 0
                        // located to the left of the cur prev → Explore the next fragment
                        index_prev++;
                        continue;
                    } else if (rle_prev[index_prev * off + lidx] - rle_current[i * off + ridx] > 0) { //8 orientation labeling if 0
                        // cur in the rightward prev → Independent fragment
                        this.addFragment(rle_current, i * off, id_max, y, rlestack);
                        id_max++;
                        label_count++;
                        // examine the index of the next
                        continue SCAN_CUR;
                    }
                    id = rle_prev[index_prev * off + fidx];// Root fragment id
                    var id_ptr = f_array[id];
                    //Binding partner (first time) -> Copy prev ID, and update root fragment information
                    rle_current[i * off + fidx] = id; // Save ID fragment
                    //
                    var l = rle_current[i * off + lidx];
                    var r = rle_current[i * off + ridx];
                    var len = r - l;
                    id_ptr.area += len; // update binding target fragment information

                    // entry_x t and does not update it because it uses the binding of destination.
                    id_ptr.clip_l = l < id_ptr.clip_l ? l : id_ptr.clip_l;
                    id_ptr.clip_r = r > id_ptr.clip_r ? r - 1 : id_ptr.clip_r;
                    id_ptr.clip_b = y;
                    id_ptr.pos_x += (len * (2 * l + (len - 1))) / 2;
                    id_ptr.pos_y += y * len;
                    // Confirmation of multiple bonds (second and subsequent)
                    index_prev++;
                    while (index_prev < len_prev) {
                        if (rle_current[i * off + lidx] - rle_prev[index_prev * off + ridx] > 0) { // 8 orientation labeling if 0
                            // located to the left of the cur prev → prev not linked to cur
                            break SCAN_PREV;
                        } else if (rle_prev[index_prev * off + lidx] - rle_current[i * off + ridx] > 0) { // It is 8 orientation labeling if 0
                            // located to the right of the cur is prev → prev not linked to cur.
                            index_prev--;
                            continue SCAN_CUR;
                        }
                        // cur prev and are linked → Integration of root fragments
                        // Get the root fragments that bind
                        var prev_id = rle_prev[index_prev * off + fidx];
                        var prev_ptr = f_array[prev_id];
                        if (id != prev_id) {
                            label_count--;
                            // rewrite the fragment id of current and prev.
                            var i2;
                            for (i2 = index_prev; i2 < len_prev; i2++) {
                                // prev until the end of the current id of
                                if (rle_prev[i2 * off + fidx] == prev_id) {
                                    rle_prev[i2 * off + fidx] = id;
                                }
                            }
                            for (i2 = 0; i2 < i; i2++) {
                                // current until now -1 from 0
                                if (rle_current[i2 * off + fidx] == prev_id) {
                                    rle_current[i2 * off + fidx] = id;
                                }
                            }
                            // The aggregate information to route the current fragment
                            id_ptr.area += prev_ptr.area;
                            id_ptr.pos_x += prev_ptr.pos_x;
                            id_ptr.pos_y += prev_ptr.pos_y;
                            //tとentry_xの決定
                            if (id_ptr.clip_t > prev_ptr.clip_t) {
                                // The underlying direction of the current.
                                id_ptr.clip_t = prev_ptr.clip_t;
                                id_ptr.entry_x = prev_ptr.entry_x;
                            } else if (id_ptr.clip_t < prev_ptr.clip_t) {
                                // Are on the person of the current. Feedback to prev
                            } else {
                                // Smaller entry point in the horizontal direction.
                                if (id_ptr.entry_x > prev_ptr.entry_x) {
                                    id_ptr.entry_x = prev_ptr.entry_x;
                                } else {
                                }
                            }
                            // determination of l
                            if (id_ptr.clip_l > prev_ptr.clip_l) {
                                id_ptr.clip_l = prev_ptr.clip_l;
                            } else {
                            }
                            // determination of r
                            if (id_ptr.clip_r < prev_ptr.clip_r) {
                                id_ptr.clip_r = prev_ptr.clip_r;
                            } else {
                            }
                            // determination of b
                            // I want to disable the root fragment of the binding already.
                            prev_ptr.area = 0;
                        }
                        index_prev++;
                    }
                    index_prev--;
                    break;
                }
                // Check whether id is assigned to the cur
                // Add the right edge independent fragment
                if (id < 0) {
                    this.addFragment(rle_current, i * off, id_max, y, rlestack);
                    id_max++;
                    label_count++;
                }
            }
            // exchange of prev and rel
            var tmp = rle_prev;
            rle_prev = rle_current;
            len_prev = len_current;
            rle_current = tmp;
        }
        // Transfer only the label of the target
        o_stack.init(label_count);
        var o_dest_array = (o_stack.getArray());
        var max = this._max_area;
        var min = this._min_area;
        var active_labels = 0;
        for (i = id_max - 1; i >= 0; i--) {
            var area = f_array[i].area;
            if (area < min || area > max) { // I also shed in the area 0 min of non-target
                continue;
            }

            var src_info = f_array[i];
            var dest_info = o_dest_array[active_labels];
            dest_info.area = area;
            dest_info.clip_b = src_info.clip_b;
            dest_info.clip_r = src_info.clip_r;
            dest_info.clip_t = src_info.clip_t;
            dest_info.clip_l = src_info.clip_l;
            dest_info.entry_x = src_info.entry_x;
            dest_info.pos_x = src_info.pos_x / src_info.area;
            dest_info.pos_y = src_info.pos_y / src_info.area;
            active_labels++;
        }
        // Re-set the number of labels
        o_stack.pops(label_count - active_labels);
        // To return the number of labels
        return active_labels;
    }
});

RleInfo = ASKlass('RleInfo', {
    // Inherited members
    entry_x: 0, // Position of the fragment label
    area: 0,
    clip_r: 0,
    clip_l: 0,
    clip_b: 0,
    clip_t: 0,
    pos_x: 0,
    pos_y: 0
});

RleInfoStack = ASKlass('RleInfoStack', NyARObjectStack, {
    RleInfoStack: function(i_length) {
        NyARObjectStack.initialize.call(this, i_length);
        return;
    }
    ,
    createArray: function(i_length) {
        var ret = new Array(toInt(i_length));
        for (var i = 0; i < i_length; i++) {
            ret[i] = new RleInfo();
        }
        return ret;
    }
});

RleElement = ASKlass('RleElement', {
    l: 0,
    r: 0,
    fid: 0,
    createArray: function(i_length) {
        return new IntVector(toInt(i_length) * 3);
        var ret = new Array(toInt(i_length));
        for (var i = 0; i < i_length; i++) {
            ret[i] = new RleElement();
        }
        return ret;
    }
});

NyARRleLabelFragmentInfo = ASKlass('NyARRleLabelFragmentInfo', NyARLabelInfo, {
    // Inherited members
    // int area; // Number of regions of the fragment label
    entry_x: 0 // Position of the fragment label
});

NyARRleLabelFragmentInfoStack = ASKlass('NyARRleLabelFragmentInfoStack', NyARLabelInfoStack, {
    NyARRleLabelFragmentInfoStack: function(i_length) {
        NyARLabelInfoStack.initialize.call(this, i_length);
        return;
    }
    , createArray: function(i_length) {
        var ret = new Array(toInt(i_length));
        for (var i = 0; i < i_length; i++) {
            ret[i] = new NyARRleLabelFragmentInfo();
        }
        return (ret);
    }
});
