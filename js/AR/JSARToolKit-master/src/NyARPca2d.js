
INyARPca2d = ASKlass('INyARPca2d', {
    // @param o_evec = variable element of 2
    // @param o_ev = variable element of 2
    pca: function(i_v1, i_v2, i_number_of_point, o_evec, o_ev, o_mean) { // PCA normal
    }
});

NyARPca2d_MatrixPCA_O2 = ASKlass('NyARPca2d_MatrixPCA_O2', INyARPca2d, {
    PCA_EPS: 1e-6, // #define EPS 1e-6
    PCA_MAX_ITER: 100, // #define MAX_ITER 100
    PCA_VZERO: 1e-16, // #define VZERO 1e-16
    PCA_QRM: function(o_matrix, dv) { // static int QRM( ARMat *a, ARVec *dv ) (alternate function)
        var w, t, s, x, y, c;
        var ev1;
        var dv_x, dv_y;
        var mat00, mat01, mat10, mat11;
        // this.vecTridiagonalize2d(i_mat, dv, ev)
        dv_x = o_matrix.m00;// this.m[dim - 2][dim - 2];// d.v[dim-2]=a.m[dim-2][dim-2];//d->v[dim-2]=a->m[(dim-2)*dim+(dim-2)];
        ev1 = o_matrix.m01;// this.m[dim - 2][dim - 1];// e.v[dim-2+i_e_start]=a.m[dim-2][dim-1];//e->v[dim-2] = a->m[(dim-2)*dim+(dim-1)];
        dv_y = o_matrix.m11;// this.m[dim - 1][dim - 1];// d.v[dim-1]=a_array[dim-1][dim-1];//d->v[dim-1] =a->m[(dim-1)*dim+(dim-1)];
        // unit matrix
        mat00 = mat11 = 1;
        mat01 = mat10 = 0;

        var iter = 0;
        do {
            iter++;
            if (iter > this.PCA_MAX_ITER) {
                break;
            }
            w = (dv_x - dv_y) / 2;
            t = ev1 * ev1;
            s = Math.sqrt(w * w + t);
            if (w < 0) {
                s = -s;
            }
            x = dv_x - dv_y + t / (w + s);
            y = ev1;
            if (Math.abs(x) >= Math.abs(y)) {
                if (Math.abs(x) > this.PCA_VZERO) {
                    t = -y / x;
                    c = 1 / Math.sqrt(t * t + 1);
                    s = t * c;
                } else {
                    c = 1.0;
                    s = 0.0;
                }
            } else {
                t = -x / y;
                s = 1.0 / Math.sqrt(t * t + 1);
                c = t * s;
            }
            w = dv_x - dv_y;
            t = (w * s + 2 * c * ev1) * s;
            dv_x -= t;
            dv_y += t;
            ev1 += s * (c * w - 2 * s * ev1);
            x = mat00;
            y = mat10;
            mat00 = c * x - s * y;
            mat10 = s * x + c * y;
            x = mat01;
            y = mat11;
            mat01 = c * x - s * y;
            mat11 = s * x + c * y;
        } while (Math.abs(ev1) > this.PCA_EPS * (Math.abs(dv_x) + Math.abs(dv_y)));

        t = dv_x;
        if (dv_y > t) {
            t = dv_y;
            dv_y = dv_x;
            dv_x = t;
            // Replacement of the line
            o_matrix.m00 = mat10;
            o_matrix.m01 = mat11;
            o_matrix.m10 = mat00;
            o_matrix.m11 = mat01;
        } else {
            // No replacement of line
            o_matrix.m00 = mat00;
            o_matrix.m01 = mat01;
            o_matrix.m10 = mat10;
            o_matrix.m11 = mat11;
        }
        dv[0] = dv_x;
        dv[1] = dv_y;
        return;
    }
    ,
    PCA_PCA: function(i_v1, i_v2, i_number_of_data, o_matrix, o_ev, o_mean) { //Static int PCA (ARMat * input, ARMat * output, ARVec * ev) 
        var i;
        // double[] mean_array=mean.getArray();
        // mean.zeroClear();
        //PCA_Processing of EX
        var sx = 0;
        var sy = 0;
        for (i = 0; i < i_number_of_data; i++) {
            sx += i_v1[i];
            sy += i_v2[i];
        }
        sx = sx / i_number_of_data;
        sy = sy / i_number_of_data;
        // processing together PCA_xt_by_x and PCA_CENTER
        var srow = Math.sqrt((i_number_of_data));
        var w00, w11, w10;
        w00 = w11 = w10 = 0.0;// *out = 0.0;
        for (i = 0; i < i_number_of_data; i++) {
            var x = (i_v1[i] - sx) / srow;
            var y = (i_v2[i] - sy) / srow;
            w00 += (x * x);// *out += *in1 * *in2;
            w10 += (x * y);// *out += *in1 * *in2;
            w11 += (y * y);// *out += *in1 * *in2;
        }
        o_matrix.m00 = w00;
        o_matrix.m01 = o_matrix.m10 = w10;
        o_matrix.m11 = w11;
        // Processing of PCA_PCA
        this.PCA_QRM(o_matrix, o_ev);
        // m2 = o_output.m;// m2 = output->m;
        if (o_ev[0] < this.PCA_VZERO) {// if( ev->v[i] < VZERO ){
            o_ev[0] = 0.0;// ev->v[i] = 0.0;
            o_matrix.m00 = 0.0;// *(m2++) = 0.0;
            o_matrix.m01 = 0.0;// *(m2++) = 0.0;
        }
        if (o_ev[1] < this.PCA_VZERO) {// if( ev->v[i] < VZERO ){
            o_ev[1] = 0.0;// ev->v[i] = 0.0;
            o_matrix.m10 = 0.0;// *(m2++) = 0.0;
            o_matrix.m11 = 0.0;// *(m2++) = 0.0;
        }
        o_mean[0] = sx;
        o_mean[1] = sy;
        return;
    }
    ,
    pca: function(i_v1, i_v2, i_number_of_point, o_evec, o_ev, o_mean) {
        this.PCA_PCA(i_v1, i_v2, i_number_of_point, o_evec, o_ev, o_mean);
        var sum = o_ev[0] + o_ev[1];
        // For order change ban
        o_ev[0] /= sum; // ev->v[i] /= sum;
        o_ev[1] /= sum; // ev->v[i] /= sum;
        return;
    }
});
