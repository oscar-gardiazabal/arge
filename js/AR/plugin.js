//
////var markerCount = 0;
//
//NyARRotMatrix = ASKlass('NyARRotMatrix', NyARDoubleMatrix33, {// Of rotation matrix calculation, 3x3 matrix
//    NyARRotMatrix: function(i_matrix) { // will prepare the instance
//        this.__initRot_vec1 = new NyARRotVector(i_matrix);
//        this.__initRot_vec2 = new NyARRotVector(i_matrix);
//        return;
//    },
//    __initRot_vec1: null,
//    __initRot_vec2: null,
//    // will restore the NyARRotMatrix from the contents of NyARTransMatResult.
//    initRotByPrevResult: function(i_prev_result) {
//        this.m00 = i_prev_result.m00;
//        this.m01 = i_prev_result.m01;
//        this.m02 = i_prev_result.m02;
//        this.m10 = i_prev_result.m10;
//        this.m11 = i_prev_result.m11;
//        this.m12 = i_prev_result.m12;
//        this.m20 = i_prev_result.m20;
//        this.m21 = i_prev_result.m21;
//        this.m22 = i_prev_result.m22;
//        return;
//    },
//    initRotBySquare: function(i_linear, i_sqvertex) {
//
////        if (markerCount >= 4) {
////            alert("ola")
//            i_sqvertex[0].x = 100;
//            i_sqvertex[0].y = 100;
//            i_sqvertex[1].x = 300;
//            i_sqvertex[1].y = 100;
//            i_sqvertex[2].x = 100;
//            i_sqvertex[2].y = 300;
//            i_sqvertex[3].x = 300;
//            i_sqvertex[3].y = 300;
//            
//            i_linear[0].dx = -1;
//            i_linear[0].dy = -1;
//            i_linear[0].c = 1000;
//            
//            i_linear[1].dx = 1;
//            i_linear[1].dy = -1;
//            i_linear[1].c = 1000;
//            
//            i_linear[2].dx = -1;
//            i_linear[2].dy = 1;
//            i_linear[2].c = 1000;
//            
//            i_linear[3].dx = 1;
//            i_linear[3].dy = 1;
//            i_linear[3].c = 1000;
////        }
//
//        if (aaa == 101) {
//            console.log("i_linear = ")
//            console.log(i_linear[0].c + " , " + i_linear[0].dx + " , " + i_linear[0].dy);
//            console.log(i_linear[1].c + " , " + i_linear[1].dx + " , " + i_linear[1].dy);
//            console.log(i_linear[2].c + " , " + i_linear[2].dx + " , " + i_linear[2].dy);
//            console.log(i_linear[3].c + " , " + i_linear[3].dx + " , " + i_linear[3].dy);
//
//            console.log("i_sqvertex = ")
//            console.log(i_sqvertex[0].x + " , " + i_sqvertex[0].y);
//            console.log(i_sqvertex[1].x + " , " + i_sqvertex[1].y);
//            console.log(i_sqvertex[2].x + " , " + i_sqvertex[2].y);
//            console.log(i_sqvertex[3].x + " , " + i_sqvertex[3].y);
//
//            aaa = 0;
//        } else {
//            aaa++;
//        }
//
//        var vec1 = this.__initRot_vec1;
//        var vec2 = this.__initRot_vec2;
//        // From the opposite side, to calculate the two vectors
//        // Axis 1
//
//        vec1.exteriorProductFromLinear(i_linear[0], i_linear[2]);
////        if (aaa == 101) {
////            console.log("vec1 = ");
////            console.log(vec1);
////        }
//        vec1.checkVectorByVertex(i_sqvertex[0], i_sqvertex[1]);
////        if (aaa == 101) {
////            console.log("vec1 = ");
////            console.log(vec1);
////            aaa = 0;
////        } else {
////            aaa++;
////        }
//
//        // Axis 2
//        vec2.exteriorProductFromLinear(i_linear[1], i_linear[3]);
//        vec2.checkVectorByVertex(i_sqvertex[3], i_sqvertex[0]);
//        // Optimization of the rotation?
//        NyARRotVector.checkRotation(vec1, vec2);
//        this.m00 = vec1.v1;
//        this.m10 = vec1.v2;
//        this.m20 = vec1.v3;
//        this.m01 = vec2.v1;
//        this.m11 = vec2.v2;
//        this.m21 = vec2.v3;
//        // Calculate the last axis
//        var w02 = vec1.v2 * vec2.v3 - vec1.v3 * vec2.v2;
//        var w12 = vec1.v3 * vec2.v1 - vec1.v1 * vec2.v3;
//        var w22 = vec1.v1 * vec2.v2 - vec1.v2 * vec2.v1;
//        var w = Math.sqrt(w02 * w02 + w12 * w12 + w22 * w22);
//        this.m02 = w02 / w;
//        this.m12 = w12 / w;
//        this.m22 = w22 / w;
//        return;
//    },
//    // coordinate transformation in the transformation matrix i_in_point.
//    getPoint3d: function(i_in_point, i_out_point) {
//        var x = i_in_point.x;
//        var y = i_in_point.y;
//        var z = i_in_point.z;
//        i_out_point.x = this.m00 * x + this.m01 * y + this.m02 * z;
//        i_out_point.y = this.m10 * x + this.m11 * y + this.m12 * z;
//        i_out_point.z = this.m20 * x + this.m21 * y + this.m22 * z;
//        return;
//    },
//    // To convert a batch of multiple vertices
//    getPoint3dBatch: function(i_in_point, i_out_point, i_number_of_vertex) {
//        for (var i = i_number_of_vertex - 1; i >= 0; i--) {
//            var out_ptr = i_out_point[i];
//            var in_ptr = i_in_point[i];
//            var x = in_ptr.x;
//            var y = in_ptr.y;
//            var z = in_ptr.z;
//            out_ptr.x = this.m00 * x + this.m01 * y + this.m02 * z;
//            out_ptr.y = this.m10 * x + this.m11 * y + this.m12 * z;
//            out_ptr.z = this.m20 * x + this.m21 * y + this.m22 * z;
//        }
//        return;
//    }
//});
