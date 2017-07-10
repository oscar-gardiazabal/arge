
ArrayUtil = ASKlass('ArrayUtil', {
    createJaggedArray: function(len) {
        var arr = new Array(len);
        var args = toArray(arguments).slice(1);
        while (len--) {
            arr[len] = args.length ? this.createJaggedArray.apply(null, args) : 0;
        }
        return arr;
    }
    , create2d: function(height, width) {
        return this.createJaggedArray(height, width);
    }
    , create3d: function(depth, height, width) {
        return this.createJaggedArray(depth, height, width);
    }
    , copy: function(src, srcPos, dest, destPos, length) {
        for (var i = 0; i < length; i++) {
            dest[destPos + i] = src[srcPos + i];
        }
    }
});
