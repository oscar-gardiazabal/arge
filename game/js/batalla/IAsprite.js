
var animation = {
    z: function() {
        batalla.stage.addChildAt(this.grupo, this.stats.z);
    },
    efecto: function() {
        for (var i = 0; i < this.stats.efecto.length; i++) {
            this.efectoAnimado(this.stats.efecto[i].efecto, this.stats.efecto[i].rgEfecto);
        }
    },
    sprite: function() {
        var sprite = this.grupo.getChildByName('sprite');
        sprite.gotoAndPlay(this.stats.sprite);
    },
    estado: function() {
        if (this.stats.estado === 'golpe') {
            if (this.criat.clase !== 'barbaro') {

                var objetivo = batalla.grupos[this.stats.objetivo];

                if (this.criat.clase === 'arquero') {
                    this.animacionFlecha(this.grupo.x, this.grupo.y, objetivo.x, objetivo.y);

                } else if (this.criat.clase === 'mago') {
                    this.animacionMagia(this.grupo.x, this.grupo.y, objetivo.x, objetivo.y);

                } else if (this.criat.clase === 'healer') {
                    this.animacionMagiaHealer(this.grupo.x, this.grupo.y, objetivo.x, objetivo.y);
                }

            }
        } else if (this.stats.estado === 'iniEspecial') {
            if (this.criat.clase === 'arquero') {
                var objetivo = batalla.grupos[this.stats.objetivo];
                this.flechaBack(objetivo.x, objetivo.y);

            } else if (this.criat.clase === 'healer') {
                this.curar(this.grupo);
            }

        } else if (this.stats.estado === 'finEspecial') {

            if (this.criat.clase === 'barbaro') {
                this.finSalto();

            } else if (this.criat.clase === 'mago') {
                this.nova(this.grupo);
            }
        }
    },
    x: function() {
        this.grupo.x = this.stats.x;
    },
    y: function() {
        this.grupo.y = this.stats.y;
    },
    vida: function() {
        var subgrupo = this.grupo.getChildByName('subgrupo');
        if (this.stats.vida > 0) {
            subgrupo.visible = true;
            var vida = this.stats.vida / this.criat.vida * 50;
            var rect = subgrupo.getChildByName('rect');
            rect.graphics.clear().beginFill("green").drawRect(-25, -50, vida, 6);
        } else {
            subgrupo.visible = false;
        }
    },
    golpe: function() {
        var tm = this.stats.golpe / this.criat.golpeMax * 20 + "px Arial";
        var golpe1 = new createjs.Text(this.stats.golpe, tm, "black");
        var golpe2 = new createjs.Text(this.stats.golpe, tm, "red");
        golpe1.x = 1;
        golpe1.y = -49;
        golpe2.y = -50;
        this.grupo.addChild(golpe1);
        this.grupo.addChild(golpe2);

        createjs.Ticker.addEventListener("tick", function() {
            golpe1.y -= 5;
            golpe1.alpha -= 0.05;

            golpe2.y -= 5;
            golpe2.alpha -= 0.05;
        });
    },
    magia: function() {
        var tm = this.stats.magia / this.criat.golpeMax * 20 + "px Arial";
        var golpe1 = new createjs.Text(this.stats.magia, tm, "black");
        var golpe2 = new createjs.Text(this.stats.magia, tm, "blue");
        golpe1.x = 1;
        golpe1.y = -49;
        golpe2.y = -50;
        this.grupo.addChild(golpe1);
        this.grupo.addChild(golpe2);

        createjs.Ticker.addEventListener("tick", function() {
            golpe1.y -= 5;
            golpe1.alpha -= 0.05;

            golpe2.y -= 5;
            golpe2.alpha -= 0.05;
        });
    },
    cura: function() {
        var tm = this.stats.cura / this.criat.curaMax * 20 + "px Arial";
        var cura1 = new createjs.Text(this.stats.cura, tm, "black");
        var cura2 = new createjs.Text(this.stats.cura, tm, "green");
        cura1.x = 1;
        cura1.y = -49;
        cura2.y = -50;
        this.grupo.addChild(cura1);
        this.grupo.addChild(cura2);

        createjs.Ticker.addEventListener("tick", function() {
            cura1.y -= 5;
            cura1.alpha -= 0.05;

            cura2.y -= 5;
            cura2.alpha -= 0.05;
        });
    },
    animacionFlecha: function(inicialX, inicialY, terminoX, terminoY) {
        var flechaImg = new Image();
        flechaImg.src = 'img/canvas/flecha.png';

        var theta = (180 / Math.PI) * Math.atan2(terminoY - inicialY, terminoX - inicialX);

        var flecha = new createjs.Bitmap(flechaImg);
        flecha.rotation = theta;

        batalla.stage.addChild(flecha);

        var distancia = (inicialX, inicialY, terminoX, terminoY);
        var tiempo = parseInt(distancia / this.criat.velocidadProyectil);

        var variacionX = (inicialX - terminoX) / tiempo;
        var variacionY = (inicialY - terminoY) / tiempo;

        var intervaloFlecha = setInterval(function() {

            inicialX = inicialX - variacionX;
            inicialY = inicialY - variacionY;

            flecha.x = inicialX;
            flecha.y = inicialY - 20;

            tiempo--;
            if (tiempo === 0) {
                clearTimeout(intervaloFlecha);
                batalla.stage.removeChild(flecha);
            }
        }, 20);
    },
    animacionMagia: function(inicialX, inicialY, terminoX, terminoY) {
        var ths = this;
//        var magia = new createjs.Shape();
//        magia.graphics.beginStroke("blue").beginFill('#00D2FF').drawCircle(0, 0, 5);
//        batalla.stage.addChild(magia);

        //nuevo
        var theta = (180 / Math.PI) * Math.atan2(terminoY - inicialY, terminoX - inicialX);
        
        var image = new Image();
        image.src = "img/canvas/magiaFuego.png";
        var Animaciones = {
            images: [image],
            frames: { //xa un ataque doble invertir X y Y :D
                width: 12.5,
                height: 25,
                regX: 12.5,
                regY: 15
            },
            animations: {
                animation: [0, 3]
            }
        };

        var sprite = new createjs.SpriteSheet(Animaciones);
        var magia = new createjs.BitmapAnimation(sprite);
        magia.rotation = theta - 90;

        magia.currentFrame = 0;
        magia.gotoAndPlay("animation");
        batalla.stage.addChild(magia);
        //nuevo

        var distancia = (inicialX, inicialY, terminoX, terminoY);
        var tiempo = parseInt(distancia / ths.criat.velocidadProyectil);

        var variacionX = (inicialX - terminoX) / tiempo;
        var variacionY = (inicialY - terminoY) / tiempo;

        var intervalo = setInterval(function() {

            inicialX = inicialX - variacionX;
            inicialY = inicialY - variacionY;

            magia.x = inicialX;
            magia.y = inicialY - 20;

            tiempo--;
            if (tiempo === 1) {
                ths.explosionMagia(terminoX, terminoY - 20);
            } else if (tiempo === 0) {
                clearTimeout(intervalo);
                batalla.stage.removeChild(magia);
            }
        }, 20);

    },
    animacionMagiaHealer: function(inicialX, inicialY, terminoX, terminoY) {
        var ths = this;
        var magia = new createjs.Shape()
        magia.graphics.beginStroke("rgba(0,100,0,1)").beginFill("rgba(150,255,150,0.5)").drawCircle(0, 0, 5);
        batalla.stage.addChild(magia);

        var distancia = (inicialX, inicialY, terminoX, terminoY);
        var tiempo = parseInt(distancia / ths.criat.velocidadProyectil);

        var variacionX = (inicialX - terminoX) / tiempo;
        var variacionY = (inicialY - terminoY) / tiempo;

        var intervalo = setInterval(function() {

            inicialX = inicialX - variacionX;
            inicialY = inicialY - variacionY;

            magia.x = inicialX;
            magia.y = inicialY - 20;

            tiempo--;
            if (tiempo === 1) {
                ths.explosionMagia(terminoX, terminoY - 20);
            } else if (tiempo === 0) {
                clearTimeout(intervalo);
                batalla.stage.removeChild(magia);
            }
        }, 40);
    },
    efectoAnimado: function(efecto, rgEfecto) {
        var grupo = this.grupo;
        if (grupo.getChildByName(efecto) === null) {

            var image = new Image();
            image.src = "img/canvas/efecto" + efecto + ".png";

            var Animaciones = {
                images: [image],
                frames: {
                    width: 40,
                    height: 70,
                    regX: 20,
                    regY: 35
                },
                animations: {
                    animation: [0, 2]
                }
            };

            var sprite = new createjs.SpriteSheet(Animaciones);
            var anim = new createjs.BitmapAnimation(sprite);

            anim.currentFrame = 0;
            anim.gotoAndPlay("animation");
            anim.name = efecto;
            anim.y = 0;

            grupo.addChild(anim);

            setTimeout(function() {
                grupo.removeChild(anim);
            }, rgEfecto * 100);
        }
    },
    explosionMagia: function(x, y) {
        var image = new Image();
        image.src = "img/canvas/explosionMagia.png";

        var Animaciones = {
            images: [image],
            frames: {
                width: 100,
                height: 60,
                regX: 50,
                regY: 30
            },
            animations: {
                animation: [0, 8]
            }
        };

        var sprite = new createjs.SpriteSheet(Animaciones);
        var anim = new createjs.BitmapAnimation(sprite);

        anim.currentFrame = 0;
        anim.gotoAndPlay("animation");
        anim.name = 'electricidad';
        anim.x = x;
        anim.y = y;

        batalla.stage.addChild(anim);
        anim.addEventListener("animationend", function(){
            batalla.stage.removeChild(anim);
        });
    },
    finSalto: function() {
        var grupo = this.grupo;
        var image = new Image();
        image.src = "img/canvas/finSalto.png";

        var Animaciones = {
            images: [image],
            frames: {
                width: 100,
                height: 60,
                regX: 50,
                regY: 30
            },
            animations: {
                animation: [0, 5]
            }
        };

        var sprite = new createjs.SpriteSheet(Animaciones);
        var anim = new createjs.BitmapAnimation(sprite);

        anim.currentFrame = 0;
        anim.gotoAndPlay("animation");
        anim.name = 'finSalto';
        anim.y = 10;

        grupo.addChild(anim);
        anim.addEventListener("animationend", function(){
            grupo.removeChild(anim);
        });
    },
    nova: function() {
        var grupo = this.grupo;
        var elemento = "";
        if (typeof grupo.elemento !== 'undefined') {
            elemento = grupo.elemento;
        }

        var image = new Image();
        image.src = "img/canvas/nova" + elemento + ".png";

        var Animaciones = {
            images: [image],
            frames: {
                width: 100,
                height: 60,
                regX: 50,
                regY: 30
            },
            animations: {
                animation: [0, 5]
            }
        };

        var sprite = new createjs.SpriteSheet(Animaciones);
        var anim = new createjs.BitmapAnimation(sprite);

        anim.currentFrame = 0;
        anim.gotoAndPlay("animation");
        anim.name = 'finSalto';
        anim.y = 5;

        grupo.addChild(anim);
        anim.addEventListener("animationend", function(){
            grupo.removeChild(anim);
        });
    },
    curar: function() {
        var grupo = this.grupo;
        var image = new Image();
        image.src = "img/canvas/curar.png";

        var Animaciones = {
            images: [image],
            frames: {
                width: 40,
                height: 75,
                regX: 20,
                regY: 10
            },
            animations: {
                animation: [0, 5]
            }
        };

        var sprite = new createjs.SpriteSheet(Animaciones);
        var anim = new createjs.BitmapAnimation(sprite);

        anim.name = 'curar';
        anim.y = -70;
        grupo.addChild(anim);

        setTimeout(function() {
            anim.currentFrame = 0;
            anim.gotoAndPlay("animation");
        }, 500);

        anim.addEventListener("animationend", function(){
            grupo.removeChild(anim);
        });
    },
    flechaBack: function(objetivoX, objetivoY) {
        var grupo = this.grupo;
        var theta = (180 / Math.PI) * Math.atan2(objetivoY - grupo.y, objetivoX - grupo.x) - 90;

        var image = new Image();
        image.src = "img/canvas/flechaBack.png";

        var Animaciones = {
            images: [image],
            frames: {
                width: 40,
                height: 150,
                regX: 20,
                regY: 10
            },
            animations: {
                animation: [0, 7]
            }
        };

        var sprite = new createjs.SpriteSheet(Animaciones);
        var anim = new createjs.BitmapAnimation(sprite);

        anim.name = 'flechaBack';
        anim.y = 10;
        anim.rotation = theta;

        grupo.addChild(anim);

        setTimeout(function() {
            anim.currentFrame = 0;
            anim.gotoAndPlay("animation");
        }, 500);

        anim.addEventListener("animationend", function(){
            grupo.removeChild(anim);
        });
    },
    distancia: function(inicialX, inicialY, terminoX, terminoY) {
        return Math.sqrt(Math.pow(Math.abs(terminoX - inicialX), 2) + Math.pow(Math.abs(terminoY - inicialY), 2));
    },
    fin: function() {

    }
};

function IAsprite(stats) {

//        if(typeof stats.alert != 'undefined'){
//            alert(stats.alert);
//        }
//        if(typeof stats.alert2 != 'undefined'){
//            alert(stats.alert2);
//        }
//        if(typeof stats.alert3 != 'undefined'){
//            alert(stats.alert3);
//        }

    animation.stats = stats;
    animation.grupo = batalla.grupos[stats.id];
    animation.criat = batalla.criaturas[stats.id];

    for (var name in stats) {
        if (name !== "id" && name !== "objetivo" && name !== "objetivoProyectil" && name !== "vel") {
            animation[name]();
        }
    }
}

function IAfin(stats) {
    animation.stats = stats;
    animation.grupo = batalla.grupos[stats.id];
    animation.criat = batalla.criaturas[stats.id];

    if (!animation.grupo.getChildByName('subgrupo').visible
            && animation.grupo.getChildByName('sprite').currentAnimation.slice(0, 4) !== "muer") {
        stats.sprite = "muerAba";
        animation["sprite"]();
    }
}
