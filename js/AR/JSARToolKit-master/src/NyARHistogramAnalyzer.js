
INyARHistogramAnalyzer_Threshold = ASKlass('INyARHistogramAnalyzer_Threshold', {
    getThreshold: function(i_histgram) {
    }
});

NyARHistogramAnalyzer_SlidePTile = ASKlass('NyARHistogramAnalyzer_SlidePTile', INyARHistogramAnalyzer_Threshold, {
    _persentage: 0,
    NyARHistogramAnalyzer_SlidePTile: function(i_persentage) {
        NyAS3Utils.assert(0 <= i_persentage && i_persentage <= 50);
        this._persentage = i_persentage; //Initialization
    }
    ,
    getThreshold: function(i_histgram) {
        // Calculate the total number of pixels
        var n = i_histgram.length;
        var sum_of_pixel = i_histgram.total_of_data;
        var hist = i_histgram.data;
        // Threshold number of pixels determined
        var th_pixcels = sum_of_pixel * this._persentage / 100;
        var th_wk;
        var th_w, th_b;
        // Sunspot criteria
        th_wk = th_pixcels;
        for (th_b = 0; th_b < n - 2; th_b++) {
            th_wk -= hist[th_b];
            if (th_wk <= 0) {
                break;
            }
        }
        // White reference point
        th_wk = th_pixcels;
        for (th_w = n - 1; th_w > 1; th_w--) {
            th_wk -= hist[th_w];
            if (th_wk <= 0) {
                break;
            }
        }
        
        return (th_w + th_b) / 2; // Save threshold
    }
});
