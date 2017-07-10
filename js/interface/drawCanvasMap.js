
function drawCanvasMap(map) {
    var array = JSON.parse(map);
    var size = array.length;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    var canvasData = ctx.getImageData(0, 0, size, size);

    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[0].length; j++) {
            if (array[i][j] == 1) {
                drawPixel(i, j, 150, 150, 150, 255);
            }
        }
    }
    updateCanvas();
    return canvas;

    function drawPixel(x, y, r, g, b, a) {
        var index = (x + y * size) * 4;

        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    }
    function updateCanvas() {
        ctx.putImageData(canvasData, 0, 0);
    }
}
