
INyARRasterFilter = ASKlass('INyARRasterFilter', {
    doFilter: function(i_input, i_output) {
    }
});

INyARRasterFilter_Gs2Bin = ASKlass('INyARRasterFilter_Gs2Bin', {
    doFilter: function(i_input, i_output) {
    }
});

INyARRasterFilter_Rgb2Gs = ASKlass('INyARRasterFilter_Rgb2Gs', {
    doFilter: function(i_input, i_output) {
    }
});

INyARRasterFilter_Rgb2Bin = ASKlass('INyARRasterFilter_Rgb2Bin', {
    doFilter: function(i_input, i_output) {
    }
});

NyARRasterFilter_ARToolkitThreshold = ASKlass('NyARRasterFilter_ARToolkitThreshold', INyARRasterFilter_Rgb2Bin, {// binarization by a constant threshold
    _threshold: 0,
    _do_threshold_impl: null,
    NyARRasterFilter_ARToolkitThreshold: function(i_threshold, i_input_raster_type) {
        this._threshold = i_threshold;
        switch (i_input_raster_type) {
            case NyARBufferType.INT1D_X8R8G8B8_32:
                this._do_threshold_impl = new doThFilterImpl_BUFFERFORMAT_INT1D_X8R8G8B8_32();
                break;
            default:
                throw new NyARException();
        }
    }
    ,
    setThreshold: function(i_threshold) { // Threshold for binarizing the image. Scotoma <= th < It becomes the bright point
        this._threshold = i_threshold;
    }
    ,
    doFilter: function(i_input, i_output) {
        NyAS3Utils.assert(i_output.isEqualBufferType(NyARBufferType.INT1D_BIN_8));
        NyAS3Utils.assert(i_input.getSize().isEqualSize_NyARIntSize(i_output.getSize()) == true);
        this._do_threshold_impl.doThFilter(i_input, i_output, i_output.getSize(), this._threshold);
        return;
    }
});

IdoThFilterImpl = ASKlass('IdoThFilterImpl', {// Filter implementation for each raster from here
    doThFilter: function(i_input, i_output, i_size, i_threshold) {
    }
});

doThFilterImpl_BUFFERFORMAT_INT1D_X8R8G8B8_32 = ASKlass('doThFilterImpl_BUFFERFORMAT_INT1D_X8R8G8B8_32', IdoThFilterImpl, {
    doThFilter: function(i_input, i_output, i_size, i_threshold) {
        NyAS3Utils.assert(i_output.isEqualBufferType(NyARBufferType.INT1D_BIN_8));
        var out_buf = (IntVector)(i_output.getBuffer());
        var in_buf = (IntVector)(i_input.getBuffer());
        var th = i_threshold * 3;
        var w;
        var xy;
        var pix_count = i_size.h * i_size.w;
        var pix_mod_part = pix_count - (pix_count % 8);
        for (xy = pix_count - 1; xy >= pix_mod_part; xy--) {
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
        }
        // Tiling
        for (; xy >= 0; ) {
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
            w = in_buf[xy];
            out_buf[xy] = (((w >> 16) & 0xff) + ((w >> 8) & 0xff) + (w & 0xff)) <= th ? 0 : 1;
            xy--;
        }
    }
});
