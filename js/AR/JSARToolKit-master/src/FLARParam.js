
FLARParam = ASKlass('FLARParam', NyARParam, {
    FLARParam: function(w, h) {

        w = w || 640;
        h = h || 480;
        
        this._screen_size.w = w;
        this._screen_size.h = h;
        
        var f = (w / h) / (4 / 3);
        var dist = new FloatVector([w / 2, 1.1 * h / 2, 26.2, 1.0127565206658486]);

        var projection = new FloatVector([
            f * 700.9514702992245, 0, w / 2 - 0.5, 0,
            0, 726.0941816535367, h / 2 - 0.5, 0,
            0, 0, 1, 0
        ]);

        this.setValue(dist, projection);
    }
});
