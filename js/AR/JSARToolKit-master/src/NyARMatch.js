
// interface for matching ARColorPatt. about the reference Pat, compare operation between the ARCode calculated data
// define the pattern detection class of three to decompose pattern_match function
INyARMatchPatt = ASKlass('INyARMatchPatt', {
    setARCode: function(i_code) {
    }
});

NyARMatchPatt_Color_WITHOUT_PCA = ASKlass('NyARMatchPatt_Color_WITHOUT_PCA', INyARMatchPatt, {
    _code_patt: null,
    _optimize_for_mod: 0,
    _rgbpixels: 0,
    NyARMatchPatt_Color_WITHOUT_PCA: function() {
        switch (arguments.length) {
            case 1:
                {  // NyARMatchPatt_Color_WITHOUT_PCA : function(i_code_ref)
                    var i_code_ref = arguments[0];
                    var w = i_code_ref.getWidth();
                    var h = i_code_ref.getHeight();
                    // Calculation of constant optimization
                    this._rgbpixels = w * h * 3;
                    this._optimize_for_mod = this._rgbpixels - (this._rgbpixels % 16);
                    this.setARCode(i_code_ref);
                    return;
                }
                break;
            case 2:
                {  //,NyARMatchPatt_Color_WITHOUT_PCA : function(i_width,i_height)
                    var i_width = toInt(arguments[0]), i_height = toInt(arguments[1]);
                    // Calculation of constant optimization
                    this._rgbpixels = i_height * i_width * 3;
                    this._optimize_for_mod = this._rgbpixels - (this._rgbpixels % 16);
                    return;
                }
                break;
            default:
                break;
        }
        throw new NyARException();
    }
    ,
    setARCode: function(i_code_ref) { // set the ARCode to compare.
        this._code_patt = i_code_ref;
        return;
    }
    ,
    evaluate: function(i_patt, o_result) { // compares the i_patt AR and code that is currently set.
        NyAS3Utils.assert(this._code_patt != null);
        //
        var linput = i_patt.refData();
        var sum;
        var max = Number.MIN_VALUE;
        var res = NyARMatchPattResult.DIRECTION_UNKNOWN;
        var for_mod = this._optimize_for_mod;
        for (var j = 0; j < 4; j++) {
            // Total value initialization
            sum = 0;
            var code_patt = this._code_patt.getColorData(j);
            var pat_j = code_patt.refData();
            
            // For all pixels, (1/16 deployment of FOR) comparison
            var i;
            for (i = this._rgbpixels - 1; i >= for_mod; i--) {
                sum += linput[i] * pat_j[i];
            }
            for (; i >= 0; ) {
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
                sum += linput[i] * pat_j[i];
                i--;
            }
            
            var sum2 = sum / code_patt.getPow(); // sum2 = sum / patpow[k][j]/ datapow;
            if (sum2 > max) {
                max = sum2;
                res = j;
            }
        }
        o_result.direction = res;
        o_result.confidence = max / i_patt.getPow();
        return true;
    }
});
