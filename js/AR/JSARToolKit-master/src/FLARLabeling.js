
FLARLabeling = ASKlass('FLARLabeling', {
    AR_AREA_MAX: 100000,
    AR_AREA_MIN: 70,
    ZERO_POINT: new Point(),
    ONE_POINT: new Point(1, 1),
    hSearch: null,
    hLineRect: null,
    _tmp_bmp: null,
    areaMax: 0,
    areaMin: 0
    ,
    FLARLabeling: function(i_width, i_height) {
        this._tmp_bmp = new BitmapData(i_width, i_height, false, 0x00);
        this.hSearch = new BitmapData(i_width, 1, false, 0x000000);
        this.hLineRect = new Rectangle(0, 0, 1, 1);
        this.setAreaRange(this.AR_AREA_MAX, this.AR_AREA_MIN);
        return;
    }
    // Inspected the size of the white area
    //  About 320px one side, the minimum size has been analyzed up to about 8px one side maximum size
    //  The object to be analyzed and, if it is within the above range in the analysis image, but a minimum size does not make sense to be too small.

    // @param i_max = maximum number of white pixel area to be analyzed (one side square)
    // @param i_min = minimum number of white pixel area to be analyzed (one side square)
    ,
    setAreaRange: function(i_max, i_min) {
        this.areaMax = i_max;
        this.areaMin = i_min;
    }
    ,
    labeling: function(i_bin_raster, o_stack) {
        var label_img = this._tmp_bmp;
        label_img.fillRect(label_img.rect, 0x0);
        var rect = label_img.rect.clone();
        rect.inflate(-1, -1);
        label_img.copyPixels(i_bin_raster.getBuffer(), rect, this.ONE_POINT);
        var currentRect = label_img.getColorBoundsRect(0xffffff, 0xffffff, true);
        var hLineRect = this.hLineRect;
        hLineRect.y = 0;
        hLineRect.width = label_img.width;
        var hSearch = this.hSearch;
        var hSearchRect;
        var labelRect;
        var index = 0;
        var label;
        o_stack.clear();

        while (!currentRect.isEmpty()) {
            hLineRect.y = currentRect.top;
            hSearch.copyPixels(label_img, hLineRect, this.ZERO_POINT);
            hSearchRect = hSearch.getColorBoundsRect(0xffffff, 0xffffff, true);
            label_img.floodFill(hSearchRect.x, hLineRect.y, ++index);
            labelRect = label_img.getColorBoundsRect(0xffffff, index, true);
            label = o_stack.prePush();
            var area = labelRect.width * labelRect.height;
            
            if (area <= this.areaMax && area >= this.areaMin) { // Area regulations
                label.area = area;
                label.clip_l = labelRect.left;
                label.clip_r = labelRect.right - 1;
                label.clip_t = labelRect.top;
                label.clip_b = labelRect.bottom - 1;
                label.pos_x = (labelRect.left + labelRect.right - 1) * 0.5;
                label.pos_y = (labelRect.top + labelRect.bottom - 1) * 0.5;
                // look for an entry point
                label.entry_x = this.getTopClipTangentX(label_img, index, label);
                if (label.entry_x == -1) {
                    return -1;
                }
            } else {
                o_stack.pop();
            }
            currentRect = label_img.getColorBoundsRect(0xffffff, 0xffffff, true);
        }

        return o_stack.getLength();
    }
    ,
    getTopClipTangentX: function(i_image, i_index, i_label) {
        var w;
        var clip1 = i_label.clip_r;
        var i;
        for (i = i_label.clip_l; i <= clip1; i++) {
            w = i_image.getPixel(i, i_label.clip_t);
            if (w > 0 && w == i_index) {
                return i;
            }
        }        
        return -1; // That one? Missing?
    }
});
