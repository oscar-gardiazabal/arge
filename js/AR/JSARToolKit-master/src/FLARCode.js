
FLARCode = ASKlass('FLARCode', NyARCode, {
    markerPercentWidth: 50,
    markerPercentHeight: 50,
    // @param i_width = number of divisions on width direction 
    // @param i_height = number of divisions on height direction
    // @param i_markerPercentWidth = marker in the entire (body + frame), the proportion of the marker body portion (width) 
    // @param i_markerPercentHeight = marker in the entire (body + frame), the proportion of the marker body portion (height)
    FLARCode: function(i_width, i_height, i_markerPercentWidth, i_markerPercentHeight) {
        NyARCode.initialize.call(this, i_width, i_height);
        this.markerPercentWidth = i_markerPercentWidth == null ? 50 : i_markerPercentWidth;
        this.markerPercentHeight = i_markerPercentHeight == null ? 50 : i_markerPercentHeight;
    },
    loadARPatt: function(i_stream) {
        NyARCode.loadARPattFromFile.call(this, i_stream);
        return;
    }
});
