
FLARException = ASKlass('FLARException', NyARException, {
    FLARException: function(m) {
        NyARException.initialize.call(this, m || '');
    },
    trap: function(m) {
        throw new FLARException("trap:" + m);
    },
    notImplement: function() {
        throw new FLARException("Not Implement!");
    }
});
