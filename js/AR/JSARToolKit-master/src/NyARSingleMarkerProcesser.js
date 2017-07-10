
// Capable of handling the marker of one, this class is an application processor at the same time.
// can be notified in the event, occurrence, movement, disappearance of the marker.
// can register a plurality of markers in the class. Processor is the same marker found to continue
// It does not recognize the other markers while it continues to recognize only one, to lose sight of.

// Event, OnEnter → OnUpdate [n] → occur in the order of OnLeave.
// OnEnter occurs once first marker is found, what number of marker or was discovered.
// Then by OnUpdate, passed the current transformation matrix. If lose sight of the marker at the end, OnLeave
// Event occurs.

SingleARMarkerProcesser = ASKlass('SingleARMarkerProcesser', {
    // It is a tag variable the owner's disposal
    tag: null,
    _lost_delay_count: 0,
    _lost_delay: 5,
    _square_detect: null,
    _transmat: null,
    _offset: null,
    _threshold: 110,
    // Save for [AR] detection result
    _bin_raster: null,
    _tobin_filter: null,
    _current_arcode_index: -1,
    _threshold_detect: null,
    SingleARMarkerProcesser: function() {
        return;
    },
    _initialized: false
    ,
    initInstance: function(i_param, i_raster_type) {
        // Initialized?
        NyAS3Utils.assert(this._initialized == false);
        var scr_size = i_param.getScreenSize();
        // make the analysis object
        this._square_detect = new NyARSquareContourDetector_Rle(scr_size);
        this._transmat = new NyARTransMat(i_param);
        this._tobin_filter = new NyARRasterFilter_ARToolkitThreshold(110, i_raster_type);
        // create a binary image buffer
        this._bin_raster = new NyARBinRaster(scr_size.w, scr_size.h);
        this._threshold_detect = new NyARRasterThresholdAnalyzer_SlidePTile(15, i_raster_type, 4);
        this._initialized = true;
        // Callback handler
        this._detectmarker_cb = new DetectSquareCB_1(i_param);
        this._offset = new NyARRectOffset();
        return;
    }
    ,
    // Because it can not set up automatic and manual, comment out
    // array of marker code to detect. If you execute this function in the detection state,
    // Forced reset will be applied to the object state.
    setARCodeTable: function(i_ref_code_table, i_code_resolution, i_marker_width) {
        if (this._current_arcode_index != -1) {
            this.reset(true); // Forced reset
        }
        // recreate the marker set to detector. (Pattern area 1 pixel sampling point 4, the marker is 50%)
        this._detectmarker_cb.setNyARCodeTable(i_ref_code_table, i_code_resolution);
        this._offset.setSquare(i_marker_width);
        return;
    }
    ,
    reset: function(i_is_force) {
        if (this._current_arcode_index != -1 && i_is_force == false) {
            this.onLeaveHandler(); // Events call If it is not forced rewrite
        }
        this._current_arcode_index = -1; // Reset the current marker
        return;
    },
    _detectmarker_cb: null
    ,
    detectMarker: function(i_raster) {
        // Size check
        NyAS3Utils.assert(this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h));
        // Conversion to BIN image
        this._tobin_filter.setThreshold(this._threshold);
        this._tobin_filter.doFilter(i_raster, this._bin_raster);
        // look for a square code
        this._detectmarker_cb.init(i_raster, this._current_arcode_index);
        this._square_detect.detectMarkerCB(this._bin_raster, this._detectmarker_cb);
        // Update state recognition
        var is_id_found = updateStatus(this._detectmarker_cb.square, this._detectmarker_cb.code_index);
        // (Also in detectExistMarker) threshold feedback
        if (!is_id_found) {
            // If there is no marker, reference luminance search in the search + DualPTail
            var th = this._threshold_detect.analyzeRaster(i_raster);
            this._threshold = (this._threshold + th) / 2;
        }
        return;
    }
    ,
    setConfidenceThreshold: function(i_new_cf, i_exist_cf) {
        this._detectmarker_cb.cf_threshold_exist = i_exist_cf;
        this._detectmarker_cb.cf_threshold_new = i_new_cf;
    }
    ,
    __NyARSquare_result: new NyARTransMatResult()
    ,
    // Updates the status of the object to drive the handle functions as necessary
    // The return value is "or was able to discover a marker actually". It is different from the state of the class
    updateStatus: function(i_square, i_code_index)    {
        var result = this.__NyARSquare_result;
        if (this._current_arcode_index < 0) { // Unrecognized in
            if (i_code_index < 0) { // Unrecognized transition from unrecognized                
                return false; // that does nothing
            } else {// 未認識から認識の遷移
                this._current_arcode_index = i_code_index;
                // イベント生成
                // OnEnter
                this.onEnterHandler(i_code_index);
                // 変換行列を作成
                this._transmat.transMat(i_square, this._offset, result);
                // OnUpdate
                this.onUpdateHandler(i_square, result);
                this._lost_delay_count = 0;
                return true;
            }
        } else {// 認識中
            if (i_code_index < 0) {// 認識から未認識の遷移
                this._lost_delay_count++;
                if (this._lost_delay < this._lost_delay_count) {
                    // OnLeave
                    this._current_arcode_index = -1;
                    this.onLeaveHandler();
                }
                return false;
            } else if (i_code_index == this._current_arcode_index) {// 同じARCodeの再認識
                // イベント生成
                // 変換行列を作成
                this._transmat.transMatContinue(i_square, this._offset, result);
                // OnUpdate
                this.onUpdateHandler(i_square, result);
                this._lost_delay_count = 0;
                return true;
            } else {// 異なるコードの認識→今はサポートしない。
                throw new NyARException();
            }
        }
    }
    , onEnterHandler: function(i_code)
    {
        throw new NyARException("onEnterHandler not implemented.");
    }
    , onLeaveHandler: function()
    {
        throw new NyARException("onLeaveHandler not implemented.");
    }
    , onUpdateHandler: function(i_square, result)
    {
        throw new NyARException("onUpdateHandler not implemented.");
    }
})











/**
 * detectMarkerのコールバック関数
 */
DetectSquareCB_1 = ASKlass('DetectSquareCB', NyARSquareContourDetector_IDetectMarkerCallback,
        {
            //公開プロパティ
            square: new NyARSquare(),
            confidence: 0.0,
            code_index: -1,
            cf_threshold_new: 0.50,
            cf_threshold_exist: 0.30,
            //参照
            _ref_raster: null,
            //所有インスタンス
            _inst_patt: null,
            _deviation_data: null,
            _match_patt: null,
            __detectMarkerLite_mr: new NyARMatchPattResult(),
            _coordline: null,
            DetectSquareCB: function(i_param)
            {
                this._match_patt = null;
                this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
                return;
            }
            , setNyARCodeTable: function(i_ref_code, i_code_resolution)
            {
                /*unmanagedで実装するときは、ここでリソース解放をすること。*/
                this._deviation_data = new NyARMatchPattDeviationColorData(i_code_resolution, i_code_resolution);
                this._inst_patt = new NyARColorPatt_Perspective_O2(i_code_resolution, i_code_resolution, 4, 25);
                this._match_patt = new Array(i_ref_code.length);
                for (var i = 0; i < i_ref_code.length; i++) {
                    this._match_patt[i] = new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
                }
            },
            __tmp_vertex: NyARIntPoint2d.createArray(4),
            _target_id: 0,
            /**
             * Initialize call back handler.
             */
            init: function(i_raster, i_target_id)
            {
                this._ref_raster = i_raster;
                this._target_id = i_target_id;
                this.code_index = -1;
                this.confidence = Number.MIN_VALUE;
            }
            /**
             * 矩形が見付かるたびに呼び出されます。
             * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
             */
            , onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index)
            {
                if (this._match_patt == null) {
                    return;
                }
                //輪郭座標から頂点リストに変換
                var vertex = this.__tmp_vertex;
                vertex[0].x = i_coordx[i_vertex_index[0]];
                vertex[0].y = i_coordy[i_vertex_index[0]];
                vertex[1].x = i_coordx[i_vertex_index[1]];
                vertex[1].y = i_coordy[i_vertex_index[1]];
                vertex[2].x = i_coordx[i_vertex_index[2]];
                vertex[2].y = i_coordy[i_vertex_index[2]];
                vertex[3].x = i_coordx[i_vertex_index[3]];
                vertex[3].y = i_coordy[i_vertex_index[3]];
                //画像を取得
                if (!this._inst_patt.pickFromRaster(this._ref_raster, vertex)) {
                    return;//取得失敗
                }
                //取得パターンをカラー差分データに変換して評価する。
                this._deviation_data.setRaster(this._inst_patt);
                //code_index,dir,c1にデータを得る。
                var mr = this.__detectMarkerLite_mr;
                var lcode_index = 0;
                var dir = 0;
                var c1 = 0;
                var i;
                for (i = 0; i < this._match_patt.length; i++) {
                    this._match_patt[i].evaluate(this._deviation_data, mr);
                    var c2 = mr.confidence;
                    if (c1 < c2) {
                        lcode_index = i;
                        c1 = c2;
                        dir = mr.direction;
                    }
                }
                //認識処理
                if (this._target_id == -1) { // マーカ未認識
                    //現在は未認識
                    if (c1 < this.cf_threshold_new) {
                        return;
                    }
                    if (this.confidence > c1) {
                        // 一致度が低い。
                        return;
                    }
                    //認識しているマーカIDを保存
                    this.code_index = lcode_index;
                } else {
                    //現在はマーカ認識中
                    // 現在のマーカを認識したか？
                    if (lcode_index != this._target_id) {
                        // 認識中のマーカではないので無視
                        return;
                    }
                    //認識中の閾値より大きいか？
                    if (c1 < this.cf_threshold_exist) {
                        return;
                    }
                    //現在の候補よりも一致度は大きいか？
                    if (this.confidence > c1) {
                        return;
                    }
                    this.code_index = this._target_id;
                }
                //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
                //ココから先はこの条件でしか実行されない。
                //一致率の高い矩形があれば、方位を考慮して頂点情報を作成
                this.confidence = c1;
                var sq = this.square;
                //directionを考慮して、squareを更新する。
                for (i = 0; i < 4; i++) {
                    var idx = (i + 4 - dir) % 4;
                    this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
                }
                for (i = 0; i < 4; i++) {
                    //直線同士の交点計算
                    if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
                    }
                }
            }
        })
SingleNyIdMarkerProcesser = ASKlass('SingleNyIdMarkerProcesser',
        {
            /**
             * オーナーが自由に使えるタグ変数です。
             */
            tag: null,
            /**
             * ロスト遅延の管理
             */
            _lost_delay_count: 0,
            _lost_delay: 5,
            _square_detect: null,
            _transmat: null,
            _offset: null,
            _is_active: null,
            _current_threshold: 110,
            // [AR]検出結果の保存用
            _bin_raster: null,
            _tobin_filter: null,
            _callback: null,
            _data_current: null,
            SingleNyIdMarkerProcesser: function()
            {
                return;
            },
            _initialized: false,
            initInstance: function(i_param, i_encoder, i_marker_width, i_raster_format)
            {
                //初期化済？
                NyAS3Utils.assert(this._initialized == false);
                var scr_size = i_param.getScreenSize();
                // 解析オブジェクトを作る
                this._square_detect = new NyARSquareContourDetector_Rle(scr_size);
                this._transmat = new NyARTransMat(i_param);
                this._callback = new DetectSquareCB_2(i_param, i_encoder);
                // ２値画像バッファを作る
                this._bin_raster = new NyARBinRaster(scr_size.w, scr_size.h);
                //ワーク用のデータオブジェクトを２個作る
                this._data_current = i_encoder.createDataInstance();
                this._tobin_filter = new NyARRasterFilter_ARToolkitThreshold(110, i_raster_format);
                this._threshold_detect = new NyARRasterThresholdAnalyzer_SlidePTile(15, i_raster_format, 4);
                this._initialized = true;
                this._is_active = false;
                this._offset = new NyARRectOffset();
                this._offset.setSquare(i_marker_width);
                return;
            }
            , setMarkerWidth: function(i_width)
            {
                this._offset.setSquare(i_width);
                return;
            }
            , reset: function(i_is_force)
            {
                if (i_is_force == false && this._is_active) {
                    // 強制書き換えでなければイベントコール
                    this.onLeaveHandler();
                }
                //マーカ無効
                this._is_active = false;
                return;
            }
            , detectMarker: function(i_raster)
            {
                // サイズチェック
                if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) {
                    throw new NyARException();
                }
                // ラスタを２値イメージに変換する.
                this._tobin_filter.setThreshold(this._current_threshold);
                this._tobin_filter.doFilter(i_raster, this._bin_raster);
                // スクエアコードを探す(第二引数に指定したマーカ、もしくは新しいマーカを探す。)
                this._callback.init(i_raster, this._is_active ? this._data_current : null);
                this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
                // 認識状態を更新(マーカを発見したなら、current_dataを渡すかんじ)
                var is_id_found = updateStatus(this._callback.square, this._callback.marker_data);
                //閾値フィードバック(detectExistMarkerにもあるよ)
                if (is_id_found) {
                    //マーカがあれば、マーカの周辺閾値を反映
                    this._current_threshold = (this._current_threshold + this._callback.threshold) / 2;
                } else {
                    //マーカがなければ、探索+DualPTailで基準輝度検索
                    var th = this._threshold_detect.analyzeRaster(i_raster);
                    this._current_threshold = (this._current_threshold + th) / 2;
                }
                return;
            },
            _threshold_detect: null,
            __NyARSquare_result: new NyARTransMatResult(),
            /**オブジェクトのステータスを更新し、必要に応じてハンドル関数を駆動します。
             */
            updateStatus: function(i_square, i_marker_data)
            {
                var is_id_found = false;
                var result = this.__NyARSquare_result;
                if (!this._is_active) {// 未認識中
                    if (i_marker_data == null) {// 未認識から未認識の遷移
                        // なにもしないよーん。
                        this._is_active = false;
                    } else {// 未認識から認識の遷移
                        this._data_current.copyFrom(i_marker_data);
                        // イベント生成
                        // OnEnter
                        this.onEnterHandler(this._data_current);
                        // 変換行列を作成
                        this._transmat.transMat(i_square, this._offset, result);
                        // OnUpdate
                        this.onUpdateHandler(i_square, result);
                        this._lost_delay_count = 0;
                        this._is_active = true;
                        is_id_found = true;
                    }
                } else {// 認識中
                    if (i_marker_data == null) {
                        // 認識から未認識の遷移
                        this._lost_delay_count++;
                        if (this._lost_delay < this._lost_delay_count) {
                            // OnLeave
                            this.onLeaveHandler();
                            this._is_active = false;
                        }
                    } else if (this._data_current.isEqual(i_marker_data)) {
                        //同じidの再認識
                        this._transmat.transMatContinue(i_square, this._offset, result);
                        // OnUpdate
                        this.onUpdateHandler(i_square, result);
                        this._lost_delay_count = 0;
                        is_id_found = true;
                    } else {// 異なるコードの認識→今はサポートしない。
                        throw new NyARException();
                    }
                }
                return is_id_found;
            }
            //通知ハンドラ
            , onEnterHandler: function(i_code)
            {
                throw new NyARException("onEnterHandler not implemented.");
            }
            , onLeaveHandler: function()
            {
                throw new NyARException("onLeaveHandler not implemented.");
            }
            , onUpdateHandler: function(i_square, result)
            {
                throw new NyARException("onUpdateHandler not implemented.");
            }
        })













/**
 * detectMarkerのコールバック関数
 */
DetectSquareCB_2 = ASKlass('DetectSquareCB', NyARSquareContourDetector_IDetectMarkerCallback,
        {
            //公開プロパティ
            square: new NyARSquare(),
            marker_data: null,
            threshold: 0,
            //参照
            _ref_raster: null,
            //所有インスタンス
            _current_data: null,
            _id_pickup: new NyIdMarkerPickup(),
            _coordline: null,
            _encoder: null,
            _data_temp: null,
            _prev_data: null,
            DetectSquareCB: function(i_param, i_encoder)
            {
                this._coordline = new NyARCoord2Linear(i_param.getScreenSize(), i_param.getDistortionFactor());
                this._data_temp = i_encoder.createDataInstance();
                this._current_data = i_encoder.createDataInstance();
                this._encoder = i_encoder;
                return;
            },
            __tmp_vertex: NyARIntPoint2d.createArray(4),
            /**
             * Initialize call back handler.
             */
            init: function(i_raster, i_prev_data)
            {
                this.marker_data = null;
                this._prev_data = i_prev_data;
                this._ref_raster = i_raster;
            },
            _marker_param: new NyIdMarkerParam(),
            _marker_data: new NyIdMarkerPattern(),
            /**
             * 矩形が見付かるたびに呼び出されます。
             * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
             */
            onSquareDetect: function(i_sender, i_coordx, i_coordy, i_coor_num, i_vertex_index)
            {
                //既に発見済なら終了
                if (this.marker_data != null) {
                    return;
                }
                //輪郭座標から頂点リストに変換
                var vertex = this.__tmp_vertex;
                vertex[0].x = i_coordx[i_vertex_index[0]];
                vertex[0].y = i_coordy[i_vertex_index[0]];
                vertex[1].x = i_coordx[i_vertex_index[1]];
                vertex[1].y = i_coordy[i_vertex_index[1]];
                vertex[2].x = i_coordx[i_vertex_index[2]];
                vertex[2].y = i_coordy[i_vertex_index[2]];
                vertex[3].x = i_coordx[i_vertex_index[3]];
                vertex[3].y = i_coordy[i_vertex_index[3]];
                var param = this._marker_param;
                var patt_data = this._marker_data;
                // 評価基準になるパターンをイメージから切り出す
                if (!this._id_pickup.pickFromRaster(this._ref_raster, vertex, patt_data, param)) {
                    return;
                }
                //エンコード
                if (!this._encoder.encode(patt_data, this._data_temp)) {
                    return;
                }
                //継続認識要求されている？
                if (this._prev_data == null) {
                    //継続認識要求なし
                    this._current_data.copyFrom(this._data_temp);
                } else {
                    //継続認識要求あり
                    if (!this._prev_data.isEqual((this._data_temp))) {
                        return;//認識請求のあったIDと違う。
                    }
                }
                //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
                //ココから先はこの条件でしか実行されない。
                var sq = this.square;
                //directionを考慮して、squareを更新する。
                var i;
                for (i = 0; i < 4; i++) {
                    var idx = (i + 4 - param.direction) % 4;
                    this._coordline.coord2Line(i_vertex_index[idx], i_vertex_index[(idx + 1) % 4], i_coordx, i_coordy, i_coor_num, sq.line[i]);
                }
                for (i = 0; i < 4; i++) {
                    //直線同士の交点計算
                    if (!NyARLinear.crossPos(sq.line[i], sq.line[(i + 3) % 4], sq.sqvertex[i])) {
                        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
                    }
                }
                this.threshold = param.threshold;
                this.marker_data = this._current_data;//みつかった。
            }
        })
