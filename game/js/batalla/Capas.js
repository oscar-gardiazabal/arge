var spriteJson = {};

function crearCapas(criaturasCapa, equipoCapa){        
    var redFilter = new createjs.ColorFilter(1,0.5,0.5,1);
        
    batalla.click = false;
    var src;
    
    var canvas = document.getElementById("container").getElementsByTagName("canvas")[0];
    var stage = new createjs.Stage(canvas);
    
    stage.enableMouseOver();
    
    $(document).mouseup(function (e){
        var container = $("#gameArea");
        if (container.has(e.target).length === 0){
            batalla.oval.visible = false;
            $(".cuerpo").css("display", "none")        
            $("#resultadosBatalla").css("display", "inherit");
        }
    });
    
    var image = new Image();
    var i, id, raza, clase;    
           
    for(i = 0; i < criaturasCapa.length; i++){
            
        id = criaturasCapa[i].id;
        
        if(typeof criaturasCapa[i].equipo != 'undefined'){
            equipoCapa = criaturasCapa[i].equipo;
        }
        
        raza = batalla.criaturas[id].raza;
        if(raza == "duende")raza = "goblin";
        clase = batalla.criaturas[id].clase;
            
        image = new Image();
        src = "img/sprites/" + raza + clase + ".png";
        image.src = src;

        var grupo = new createjs.Container();
        grupo.name = 'grupo';  
        
        var Animaciones = {
            images: [image],
            frames:[],
            animations:{}
        }
        
        Animaciones.frames = spriteJson[raza + clase].frames;
        
        var acciones = ['para','move','golp','espe','muer'];
        var direcciones = ['AbaDer', 'AbaIzq', 'Der', 'Izq', 'Arr', 'Aba', 'ArrDer', 'ArrIzq'];

        for(var j = 0; j < acciones.length; j++){
            for(var k = 0; k < direcciones.length; k++){
                Animaciones.animations[acciones[j] + direcciones[k]] = Sprite(spriteJson[raza + clase], acciones[j], direcciones[k]);
            }
        }
        
        var sprite = new createjs.SpriteSheet(Animaciones);
        var animation = new createjs.BitmapAnimation(sprite);
        
        if(equipoCapa == 2){
            sprite.createFilter("red", [redFilter]);            
            animation.applyFilter("red"); 
        }
        
        animation.name = "sprite";
        animation.currentFrame = 0;
        animation.gotoAndPlay("moveDer");    
        animation.cursor = "pointer";
        grupo.addChild(animation);
        
        eventListener(id);
        
        var subgrupo = new createjs.Container();
        subgrupo.name = 'subgrupo';
        
        var rect = new createjs.Shape();
        rect.name = "rect";
        subgrupo.addChild(rect);
        
        var contorno = new createjs.Shape();
        contorno.graphics.beginStroke("black").drawRect(-25,-50,50,6);
        subgrupo.addChild(contorno);
        
        for(var q = 1; q < criaturasCapa[i].vida/50; q++){
            var linea = new createjs.Shape();
            linea.graphics.beginStroke('rgba(0,0,0,0.3)').drawRect(-25 + q * ((50/criaturasCapa[i].vida)*50) ,-50,1,5);
            subgrupo.addChild(linea);
        }
        
        grupo.addChild(subgrupo);
        stage.addChild(grupo);
        
        batalla.grupos[criaturasCapa[i].id] = grupo;
    }
    
    function Sprite(json, accion, direccion){
        
        var serie = {
            AbaIzq: '0',
            Aba: '45',
            AbaDer: '90',
            Der: '135',
            ArrDer: '180',
            Arr: '225',
            ArrIzq: '270',
            Izq: '315'            
        }        
            
        var sprite = [];
           
        var inicio = '00';
        var termino = '00';
            
        
        if(accion === 'move'){
            inicio = '00';
            termino = '07';
        }
        if(accion === 'muer'){
            inicio = '36';
            termino = '40';
            
            sprite[0] = json.animations[ serie[direccion] + '/c' + inicio ][0];
            sprite[1] = json.animations[ serie[direccion] + '/c' + termino ][0];
            sprite[2] = '';
            sprite[3] = 2;
        }else if(accion === 'para'){
            inicio = '32';
            termino = '35';
            
            sprite[0] = json.animations[ serie[direccion] + '/c' + inicio ][0];
            sprite[1] = json.animations[ serie[direccion] + '/c' + termino ][0];
            sprite[2] = 'para' + direccion;
            sprite[3] = 3;
            
        }else if(accion === 'golp'){
            inicio = '08';
            termino = '13';
                
            sprite[0] = json.animations[ serie[direccion] + '/c' + inicio ][0];
            sprite[1] = json.animations[ serie[direccion] + '/c' + termino ][0];
            sprite[2] = 'para' + direccion;
            sprite[3] = 2;
        }else if(accion === 'espe'){
            inicio = '14';
            termino = '24';
                
            sprite[0] = json.animations[ serie[direccion] + '/c' + inicio ][0];
            sprite[1] = json.animations[ serie[direccion] + '/c' + termino ][0];
            sprite[2] = 'para' + direccion;
            sprite[3] = 2;
        }else{
            sprite[0] = json.animations[ serie[direccion] + '/c' + inicio ][0];
            sprite[1] = json.animations[ serie[direccion] + '/c' + termino ][0];
            sprite[2] = accion + direccion;
            sprite[3] = 2;
        }
        return sprite;
    }
    
    var oval = new createjs.Shape();
    oval.graphics.beginStroke("black").beginFill("yellow").drawEllipse(-21,10,45,20);
    oval.name = "oval";
    batalla.oval = oval;
      
    batalla.stage = stage;
    
    function eventListener(id){        
        animation.addEventListener("mousedown", function(){
            batalla.grupos[id].addChildAt(batalla.oval, 0);
            batalla.oval.visible = true;
            expandir(id);
            stage.update(); 
        });             
    }
}
