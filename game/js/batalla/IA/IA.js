        
function IA(conjunto, equipo, posicion) {
    
    var random = batalla.random;
        
    var statsAliado, statsEnemigo, stats, statsObjetivo;
    var bloqueadoAliado = false;
    var bloqueadoAliadoX = false;
    var bloqueadoAliadoY = false;
    
    var bloqueadoEnemigo = false;
    var bloqueadoEnemigoX = false;
    var bloqueadoEnemigoY = false;
    
    var bloqueadoObjetivo = false;
    var bloqueadoObjetivoX = false;
    var bloqueadoObjetivoY = false;

    stats = conjunto[posicion];
    
    var z = 0;
    for(i = 0; i < conjunto.length; i++) {
        if(stats.y > conjunto[i].y) {
            z++;
        }
    }
    stats.z = z;

    if(equipo == 1) {
        statsAliado = obtenerEquipo(1);
        statsAliado = cortarEquipo(statsAliado, stats.id);
        statsEnemigo = obtenerEquipo(2);
    }
    if(equipo == 2) {
        statsAliado = obtenerEquipo(2);
        statsAliado = cortarEquipo(statsAliado, stats.id);
        statsEnemigo = obtenerEquipo(1);
    }
    
    var criaturas = batalla.criaturas;
    
    var criatura = criaturas[stats.id];
    var criatObj;
    
    var alto = criatura.alto;
    var ancho = criatura.ancho;
    
    var aliados = statsAliado.length;
    var enemigos = statsEnemigo.length;
    
    stats.vel = criaturas[stats.id].vel;
    stats.arm = criaturas[stats.id].arm;
    stats.def = criaturas[stats.id].def;
        
    if(stats.efecto != null){
        
        for(var i = 0; i < stats.efecto.length; i++){
            stats.efecto[i].rgEfecto--;
            var rgEfecto = stats.efecto[i].rgEfecto;
            var efecto = stats.efecto[i].efecto;
            
            if(efecto == "hielo"){
                stats.vel = stats.vel * 0.5;
                
            }else if(efecto == "rayo"){
                stats.vel = 0;
                criatura.rgMovimiento = 0;
                criatura.rgAtaque = -1;
                if(rgEfecto == 0){
                    criatura.rgAtaque = 999;
                }
                
            }else if(efecto == "piedra"){
                stats.arm = stats.arm * 1.4;
                stats.def = stats.def * 1.2;
                
            }else if(efecto == "veneno"){
                if(rgEfecto%10 == 0){
                    golpe(criatura, stats, Math.round(stats.vida * 0.05));
                }
            }
            
            if(rgEfecto == 0){
                stats.efecto.splice(i,1);
            }
        }
        
    }
    
    if(criatura.rgProyectil == 0){
        if(criatura.clase == 'mago'){
            var imp = stats.objetivoProyectil;
            
            //            var elemento = false;
            var objetivo, efecto, rgEfecto, danoExtra = 0;
            //            if(typeof criaturas[stats.id].elemento != 'undefined' && criaturas[stats.id].elemento != ""){
            //                elemento = true;
            //                efecto = criaturas[stats.id].elemento;
            //                if(efecto == "fuego"){
            //                    danoExtra = criatura.poder * 2;
            //                }
            //            }
            
            for(var i = 0; i < statsEnemigo.length; i++){
                
                if((statsEnemigo[i].x < imp.x + 50 && statsEnemigo[i].x > imp.x - 50) && (statsEnemigo[i].y < imp.y + 50 && statsEnemigo[i].y > imp.y - 50)){
                    
                    criatObj = criaturas[statsEnemigo[i].id];
                    magia(criatObj, statsEnemigo[i], Math.round((criatura.poder * 0.7 + danoExtra) * criatObj.def));                    
                    
                //                    if(elemento){                        
                //                        efectoElemento(statsEnemigo[i], efecto);                        
                //                    }
                }
            }
        
        }else if (criatura.clase == 'arquero'){            
            var objetivo = getObjetivoById(stats.objetivoProyectil);
            criatObj = criaturas[objetivo.id];
            golpe(criatObj, objetivo, Math.round(criatura.dano * 0.8 * criatObj.arm));
            
        }else if (criatura.clase == 'healer'){            
            var objetivo = getObjetivoById(stats.objetivoProyectil);
            criatObj = criaturas[objetivo.id];
            magia(criatObj, objetivo, Math.round(criatura.poder * 0.8 * criatObj.def));
        }
    }
    
    if(stats.vida <= 0) {
        if(stats.estado != 'muerto'){
            var muerto = true;
            if(criatura.raza == "muerto"){
                muerto = false;
                if(typeof criatura.muerto == 'undefined'){
                    criatura.muerto = 80;
                    criatura.rgEspecial = 999;
                    criatura.vel = criatura.vel *1.5;
                    criatura.ataq = criatura.ataq *1.5;
                    criatura.actitud = "agresivo";
                    
                }else{
                    if(criatura.muerto == 0){
                        muerto = true;
                    }else{
                        criatura.muerto--;
                    }        
                }
            }
            if(muerto){
                stats.estado = 'muerto';
                if(typeof stats.objetivo == "undefined"){
                    stats.objetivo = statsEnemigo[0].id;
                }
                statsObjetivo = getObjetivoById(stats.objetivo);
                stats.sprite = direccionAccion("muer");
            }
        }
    }

    if(stats.estado != 'muerto') {

        if (criatura.rgParado < 3){            
            avanzarTurno();
            criatura.rgParado++;                     
            return conjunto;
        }
    
        var existeEnemigo = false;

        if(statsEnemigo.length > 0) {
            existeEnemigo = true;
        }

        if(existeEnemigo) {
            
            if(criatura.rgAtaque == 6) {
                statsObjetivo = getObjetivoById(stats.objetivo);
                
                var distancia;
                stats.estado = 'golpe';
                if(criatura.clase == 'barbaro' || criatura.clase == 'paladin' || criatura.clase == 'shinobi'){
                    if(typeof statsObjetivo == 'undefined'){
                        alert($.param(statsEnemigo))
                    }
                    criatObj = criaturas[stats.objetivo];
                    golpe(criatObj, statsObjetivo, Math.round(criatura.dano * criatObj.arm));
                                        
                }else if(criatura.clase == 'arquero' || criatura.clase == 'healer'){
                    stats.objetivoProyectil = statsObjetivo.id;
                    distancia = distanciaRel(stats, statsObjetivo);
                    criatura.rgProyectil = parseInt(distancia/criatura.velocidadProyectil);
                    
                }else if(criatura.clase == 'mago'){
                    stats.objetivoProyectil = {
                        x: statsObjetivo.x, 
                        y: statsObjetivo.y
                    };
                    distancia = distanciaRel(stats, statsObjetivo);
                    criatura.rgProyectil = parseInt(distancia/criatura.velocidadProyectil);  
                    
                }
                
            }else if(criatura.rgAtaque == 7){
                stats.estado = 'atacar';
            
            }else if(criatura.especial < 16){
                
                if(criatura.clase == 'barbaro'){
                    stats.x = criatura.arrayDespl[criatura.especial].x;
                    stats.y = criatura.arrayDespl[criatura.especial].y;
                    
                    if(criatura.especial == 15){
                        stats.estado = "finEspecial";                        
                        moverVacio();
                        statsObjetivo = getObjetivoById(stats.objetivo);
                        if(distancia(statsObjetivo, stats) < 50){
                            var c = criaturas[stats.objetivo];
                            magia(c, statsObjetivo, Math.round(criatura.poder));
                            
                            if(statsObjetivo.vida > 0 && typeof criatura.elemento != 'undefined'){
                                efectoElemento(statsObjetivo, criatura.elemento, 0.7);
                            }
                        }
                    }
                    
                }else if(criatura.clase == 'arquero'){
                    stats.x = criatura.arrayDespl[criatura.especial].x;
                    stats.y = criatura.arrayDespl[criatura.especial].y;
                    statsObjetivo = getObjetivoById(stats.objetivo);
                    if(criatura.especial == 15){
                        if(statsObjetivo.vida > 0 && typeof criatura.elemento != 'undefined'){
                            efectoElemento(statsObjetivo, criatura.elemento, 1);
                        }
                    }
                    
                }else if(criatura.clase == 'mago'){
                    
                    if(criatura.especial == 15){
                        stats.estado = "finEspecial";                        
                        for(var i = 0; i < statsEnemigo.length; i++){
                            if((statsEnemigo[i].x < stats.x + 100 && statsEnemigo[i].x > stats.x - 100) && (statsEnemigo[i].y < stats.y + 100 && statsEnemigo[i].y > stats.y - 100)){
                                
                                var c = criaturas[statsEnemigo[i].id];
                                magia(c, statsEnemigo[i], Math.round(criatura.poder * 0.7 * criaturas[statsEnemigo[i].id].def));
                                                                   
                                if(statsEnemigo[i].vida > 0 && typeof criatura.elemento != 'undefined'){
                                    efectoElemento(statsEnemigo[i], criatura.elemento, 0.7);
                                }
                            }
                        }                        
                    }
                    
                }else if(criatura.clase == 'shinobi'){
                    if(criatura.especial == 15){
                        stats.estado = "finEspecial";
                        
                        for(var i = 0; i < statsEnemigo.length; i++){
                            if((statsEnemigo[i].x < stats.x + 100 && statsEnemigo[i].x > stats.x - 100) && (statsEnemigo[i].y < stats.y + 100 && statsEnemigo[i].y > stats.y - 100)){
                                
                                var c = criaturas[statsEnemigo[i].id];
                                magia(c, statsEnemigo[i], Math.round(criatura.poder * 0.7 * criaturas[statsEnemigo[i].id].def));
                                
                                if(statsEnemigo[i].vida > 0 && typeof criatura.elemento != 'undefined'){
                                    efectoElemento(statsEnemigo[i], criatura.elemento, 0.7);
                                }                                
                            }
                        }                        
                    }
                    
                }else if(criatura.clase == 'paladin'){
                    if(criatura.especial == 15){
                        stats.estado = "finEspecial";
                        
                        for(var i = 0; i < statsEnemigo.length; i++){
                            if((statsEnemigo[i].x < stats.x + 100 && statsEnemigo[i].x > stats.x - 100) && (statsEnemigo[i].y < stats.y + 100 && statsEnemigo[i].y > stats.y - 100)){
                                
                                var c = criaturas[statsEnemigo[i].id];
                                magia(c, statsEnemigo[i], Math.round(criatura.poder * 0.7 * criaturas[statsEnemigo[i].id].def));
                                                                   
                                if(statsEnemigo[i].vida > 0 && typeof criatura.elemento != 'undefined'){
                                    efectoElemento(statsEnemigo[i], criatura.elemento, 0.7);
                                }                                
                            }
                        }                        
                    }
                    
                }else if(criatura.clase == 'healer'){
                    if(criatura.especial == 15){
                        stats.estado = "finEspecial";
                        
                        for(var i = 0; i < statsAliado.length; i++){
                            if((statsAliado[i].x < stats.x + 500 && statsAliado[i].x > stats.x - 500) && (statsAliado[i].y < stats.y + 500 && statsAliado[i].y > stats.y - 500)){
                                                                
                                if(statsEnemigo[i].vida > 0 && typeof criatura.elemento != 'undefined'){
                                    efectoElemento(statsEnemigo[i], criatura.elemento, 0.7);
                                }
                            }
                        }                        
                    }
                }
                
                criatura.especial++;
                
            }else if(criatura.rgMovimiento >= criatura.reac && criatura.rgAtaque > 9) {
                                    
                statsObjetivo = getObjetivo();
                var noEspecial = true;
                
                if(criatura.rgEspecial > criatura.reacEspecial){
                    
                    var dist = distancia(statsObjetivo, stats)
                    if(criatura.clase == 'barbaro' && dist < 200 && dist > 80){
                        stats.estado = "iniEspecial";
                        reaccion('salto');
                        noEspecial = false;
                        
                    }else if(criatura.clase == 'arquero' && dist < 50){
                        stats.estado = "iniEspecial";
                        reaccion('flecha');
                        noEspecial = false;    
                        
                    }else if(criatura.clase == 'mago' && dist < 50){
                        stats.estado = "iniEspecial";
                        reaccion('nova');
                        noEspecial = false;
                        
                    }else if(criatura.clase == 'paladin' && dist < 50){
                        stats.estado = "iniEspecial";
                        reaccion('empuje');
                        noEspecial = false;  
                        
                    }else if(criatura.clase == 'shinobi' && dist < 50){
                        stats.estado = "iniEspecial";
                        reaccion('rueda');
                        noEspecial = false;
                        
                    }else if(criatura.clase == 'healer'){
                        stats.estado = "iniEspecial";
                        reaccion('curar');
                        noEspecial = false;                        
                    }
                }            
                
                if(noEspecial == true){
                    
                    if(criatura.rgAtaque > criatura.ataq && distancia(statsObjetivo, stats) <= criatura.alcance){
                        reaccion('atacar'); 
                    }else{
                    
                        if(criatura.actitud == 'cauto') {
                            criatObj = criaturas[statsObjetivo.id];
                            if(distancia(statsObjetivo, stats) < criatObj.alcance) {                            
                                huir();
                            } else {
                                perseguir();
                            }
                        } else if(criatura.actitud == 'agresivo'){
                            perseguir();
                        }else if(criatura.actitud == 'moderado'){
                            if(criatura.alcance < distancia(statsObjetivo, stats)){                                
                                perseguir();
                            }else{
                                reaccion('parado');
                            }                        
                        }
                    }
                }
             
            }else if(criatura.rgAtaque > criatura.ataq && stats.objetivo != null && distancia(getObjetivoById(stats.objetivo), stats) <= criatura.alcance){
                statsObjetivo = getObjetivoById(stats.objetivo)
                reaccion('atacar');
                
            }else if (stats.estado == 'perseguir'){
                statsObjetivo = getObjetivoById(stats.objetivo);
                perseguir();
            }else if(stats.estado == 'huir'){
                statsObjetivo = getObjetivoById(stats.objetivo);
                huir(); 
            }else if(criatura.rgAtaque > 9){
                statsObjetivo = getObjetivo();
                reaccion('parado');                
            }
        }
        
        criatura.xAnterior = stats.x;
        criatura.yAnterior = stats.y;

    }
    
    avanzarTurno();
    return conjunto;
    
    
    //FUNCIONES BATALLA IA
    
    function avanzarTurno(){
        criatura.rgProyectil--;
        criatura.rgAtaque++;
        criatura.rgEspecial++;
        criatura.rgMovimiento++;                   
    }
            
    function reaccion(estado){
    
        if(estado == 'perseguir') {
            if(stats.estado != 'perseguir'){
                stats.estado = 'perseguir';
                stats.objetivo = statsObjetivo.id;
                
                criatura.rgMovimiento = 0;
            }
            
        }else if(estado == 'huir') {
            stats.sprite = direccionSprite(estado);
            if(stats.estado != 'huir'){
                stats.estado = 'huir';
                stats.objetivo = statsObjetivo.id;
                criatura.rgMovimiento = 0;
            }
            
        }else if(estado == 'parado') {
            stats.estado = 'parado';
            stats.sprite = direccionAccion("para");
            
        }else if(estado == 'atacar') {
            stats.estado = 'atacar';
            stats.objetivo = statsObjetivo.id;
            criatura.rgAtaque = 0;
            stats.sprite = direccionAccion("golp");
            
        }else if(estado == 'salto') {
            stats.estado = 'iniEspecial';
            stats.objetivo = statsObjetivo.id;
            criatura.rgEspecial = 0;
            stats.sprite = direccionAccion("espe");
            
            criatura.arrayDespl = [];
            criatura.especial = 0;
            var varX = statsObjetivo.x - stats.x;
            var varY = statsObjetivo.y - stats.y;
            
            for(var i = 0; i < 16; i++){
                var frame = {};
                frame.x = stats.x + Math.round(varX / 16 * i);
                frame.y = stats.y + Math.round(varY / 16 * i - Math.abs(Math.abs(i-8) -8)*10);
                criatura.arrayDespl[i] = frame;
            }
            
        } else if(estado == 'flecha') {
            stats.estado = 'iniEspecial';
            stats.objetivo = statsObjetivo.id;
            criatura.rgEspecial = 0;
            stats.sprite = direccionAccion("espe");
            
            criatura.arrayDespl = [];
            criatura.especial = 0;
            var dist = distanciaRel(statsObjetivo, stats);
            var varX = (statsObjetivo.x - stats.x) * 150 / dist;
            var varY = (statsObjetivo.y - stats.y) * 150 / dist;
                        
            for(i = 0; i < 6; i++){
                var frame = {};
                frame.x = stats.x;
                frame.y = stats.y;
                criatura.arrayDespl[criatura.arrayDespl.length] = frame;                                   
            }
            
            for(i = 0; i < 10; i++){
                var frame = {};
                frame.x = stats.x - Math.round(varX / 10 * i);
                frame.y = stats.y - Math.round(varY / 10 * i);
                criatura.arrayDespl[criatura.arrayDespl.length] = frame;
            }            
        } else if(estado == 'nova' || estado == 'rueda' || estado == 'empuje' || estado == 'curar') {
            stats.estado = 'iniEspecial';
            stats.objetivo = statsObjetivo.id;
            criatura.rgEspecial = 0;
            stats.sprite = direccionAccion("espe");
            criatura.especial = 0;
        }
    }
    
    function obtenerEquipo(equipo){
    
        var retorno = [];
        var contador = 0;
    
        for (var i = 0; i < conjunto.length; i++) {
            if (conjunto[i].vida > 0 && conjunto[i].equipo == equipo) {
                retorno[contador] = conjunto[i];
                contador++;
            }
        }
        return retorno;
    }

    function cortarEquipo(equipo, id) {
        var retorno = [];
        var j = 0;    
        for (var i = 0; i < equipo.length; i++) {
            if (equipo[i].id != id && equipo[i].vida > 0) {
                retorno[j] = equipo[i];
                j++;
            }
        }
        return retorno;
    }
    
    function getObjetivo(){
        var objetivo = null;
        var i;
        for(var j = 0; j < enemigos; j++) {
            if(objetivo == null) {
                objetivo = statsEnemigo[j];
                i = distancia(objetivo, stats);
            }else if(distancia(statsEnemigo[j], stats) <= i) {
                objetivo = statsEnemigo[j];
                i = distancia(objetivo, stats);
            }
        }        
        return objetivo;
    }
            
    function getObjetivoById(id){
        for(var i = 0; i < conjunto.length; i++){
            if(conjunto[i].id == id){
                return conjunto[i];
            }
        }
        return null;
    }
      
    function distancia(objetivo, yo) {
        var obj = criaturas[objetivo.id];
        var distancia = Math.sqrt(Math.pow(Math.abs(objetivo.x - yo.x)- obj.ancho/2, 2) + Math.pow(Math.abs(objetivo.y - yo.y)- obj.alto/2, 2));
        return distancia;
    }
    
    function distanciaRel(objetivo, yo) {
        var distancia = Math.sqrt(Math.pow(Math.abs(objetivo.x - yo.x), 2) + Math.pow(Math.abs(objetivo.y - yo.y), 2));
        return distancia;
    }
        
    function variacion(x, y) {
        var variacion = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return variacion;
    }


    function colisiones(X, Y) {
                
        var enemigos;        
        enemigos = cortarEquipo(statsEnemigo, statsObjetivo.id);
        
        var posibleBloqueadoAliadoX = false;
        var posibleBloqueadoAliadoY = false;
        var posibleBloqueadoEnemigoX = false;
        var posibleBloqueadoEnemigoY = false;
                    
        var p;
        
        for(var i = 0; i < aliados; i++) {
            if((X > (statsAliado[i].x - ancho) && X < (statsAliado[i].x + ancho))
                && (Y > (statsAliado[i].y - alto) && Y < (statsAliado[i].y + alto))) {

                bloqueadoAliado = true;
                posibleBloqueadoAliadoX = true;
                posibleBloqueadoAliadoY = true;

                if(stats.y <= (statsAliado[i].y - alto) || stats.y >= (statsAliado[i].y + alto)) {
                    posibleBloqueadoAliadoX = false;
                    for(p = 0; p < aliados; p++) {
                        if(X > (statsAliado[p].x - ancho) && X < (statsAliado[p].x + ancho)
                            && (stats.y > (statsAliado[p].y - alto) && stats.y < (statsAliado[p].y + alto))) {
                            bloqueadoAliadoX = true;
                        }
                            
                    }
                }
                if(bloqueadoAliadoX == false) bloqueadoAliadoX = posibleBloqueadoAliadoX;

                if(stats.x <= (statsAliado[i].x - ancho) || stats.x >= (statsAliado[i].x + ancho)) {
                    posibleBloqueadoAliadoY = false;
                    for(p = 0; p < aliados; p++) {
                        if(Y > (statsAliado[p].y - alto) && Y < (statsAliado[p].y + alto)
                            && (stats.x > (statsAliado[p].x - ancho) && stats.x < (statsAliado[p].x + ancho))) {
                            bloqueadoAliadoY = true;
                        }
                            
                    }
                }
                if(bloqueadoAliadoY == false)bloqueadoAliadoY = posibleBloqueadoAliadoY;
                    
            }
        }        

        for(i = 0; i < enemigos.length; i++) {
            if((X > (enemigos[i].x - ancho) && X < (enemigos[i].x + ancho))
                && (Y > (enemigos[i].y - alto) && Y < (enemigos[i].y + alto))) {

                bloqueadoEnemigo = true;
                posibleBloqueadoEnemigoX = true;
                posibleBloqueadoEnemigoY = true;

                if(stats.y <= (enemigos[i].y - alto) || stats.y >= (enemigos[i].y + alto)) {
                    posibleBloqueadoEnemigoX = false;
                    for(p = 0; p < enemigos; p++) {
                        if(X > (enemigos[p].x - ancho) && X < (enemigos[p].x + ancho)
                            && (stats.y > (enemigos[p].y - alto) && stats.y < (enemigos[p].y + alto))) {
                            bloqueadoEnemigoX = true;
                        }
                            
                    }
                }
                if(bloqueadoEnemigoX == false) bloqueadoEnemigoX = posibleBloqueadoEnemigoX;

                if(stats.x <= (enemigos[i].x - ancho) || stats.x >= (enemigos[i].x + ancho)) {
                    posibleBloqueadoEnemigoY = false;
                    for(p = 0; p < enemigos; p++) {
                        if(Y > (enemigos[p].y - alto) && Y < (enemigos[p].y + alto)
                            && (stats.x > (enemigos[p].x - ancho) && stats.x < (enemigos[p].x + ancho))) {
                            bloqueadoEnemigoY = true;
                        }
                            
                    }
                }
                if(bloqueadoEnemigoY == false) bloqueadoEnemigoY = posibleBloqueadoEnemigoY;
                    
            }
        }        
        
        
        if(X < statsObjetivo.x + ancho && X > statsObjetivo.x - ancho && Y < statsObjetivo.y + alto && Y > statsObjetivo.y - alto){
            
            bloqueadoObjetivo = true;
            
            if(X < statsObjetivo.x + ancho && X > statsObjetivo.x - ancho && stats.y < statsObjetivo.y + alto && stats.y > statsObjetivo.y - alto){
                bloqueadoObjetivoX = true;
            }
            if(stats.x < statsObjetivo.x + ancho && stats.x > statsObjetivo.x - ancho && Y < statsObjetivo.y + alto && Y > statsObjetivo.y - alto){
                bloqueadoObjetivoY = true;
            }
        }
    }

    function perseguir() {
        
        function Aba(){
            desvioX = stats.x;
            desvioY = stats.y + criatura.vel;
            colisiones(desvioX, desvioY);
        }
        function Arr(){
            desvioX = stats.x;
            desvioY = stats.y - criatura.vel
            colisiones(desvioX, desvioY);
        }
        function Der(){
            desvioX = stats.x + criatura.vel;
            desvioY = stats.y;
            colisiones(desvioX, desvioY);
        }
        function Izq(){
            desvioX = stats.x - criatura.vel;
            desvioY = stats.y;
            colisiones(desvioX, desvioY);
        }
        function desviar(){
            stats.x = desvioX;
            stats.y = desvioY;
        }
            
        var varX = statsObjetivo.x - stats.x;
        var varY = statsObjetivo.y - stats.y;
        var perseguirX = stats.x;
        var perseguirY = stats.y;
            
        if(varX != 0 || varY != 0){
            perseguirX = stats.x + Math.round((criatura.vel * (varX / (Math.abs(varX) + Math.abs(varY)))));
            perseguirY = stats.y + Math.round((criatura.vel * (varY / (Math.abs(varX) + Math.abs(varY)))));
        }
            
        var desvioX, desvioY;
            
        colisiones(perseguirX, perseguirY);
        
        if(bloqueadoAliado == false && bloqueadoEnemigo == false && bloqueadoObjetivo == false){
            stats.x = perseguirX;
            stats.y = perseguirY;
            stats.sprite = direccionSprite('perseguir');
            
        }else if((bloqueadoAliadoY == false && bloqueadoEnemigoY == false && bloqueadoAliadoX == false && bloqueadoEnemigoX == false) && 
            (bloqueadoObjetivoY == true || bloqueadoObjetivoX == true)){
            
            var desviarX = stats.x;
            var desviarY = stats.y;
            
            if(bloqueadoObjetivoX == false){
                criatObj = criaturas[stats.objetivo];
                if(stats.y < statsObjetivo.y){
                    if(Math.abs(statsObjetivo.y - stats.y) > Math.abs(perseguirY - stats.y)){
                        desviarY = perseguirY + Math.abs(perseguirY - statsObjetivo.y) - (criatura.alto/2 + criatObj.alto/2);
                    }else{
                        desviarY = perseguirY - Math.abs(perseguirY - statsObjetivo.y) - (criatura.alto/2 + criatObj.alto/2);
                    }
                }else if(stats.y > statsObjetivo.y){
                    if(Math.abs(statsObjetivo.y - stats.y) > Math.abs(perseguirY - stats.y)){
                        desviarY = perseguirY - Math.abs(perseguirY - statsObjetivo.y) + (criatura.alto/2 + criatObj.alto/2);
                    }else{
                        desviarY = perseguirY + Math.abs(perseguirY - statsObjetivo.y) + (criatura.alto/2 + criatObj.alto/2);
                    }
                }
                if(desviarY != stats.y){
                    stats.y = desviarY;
                    stats.sprite = direccionSprite('perseguir');
                    reaccion('perseguir');
                }else{
                    Para();
                }
                return;
            
            }else if(bloqueadoObjetivoY == false){
                criatObj = criaturas[stats.objetivo];
                if(stats.x < statsObjetivo.x){
                    if(Math.abs(statsObjetivo.x - stats.x) > Math.abs(perseguirX - stats.x)){
                        desviarX = perseguirX + Math.abs(perseguirX - statsObjetivo.x) - (criatura.ancho/2 + criatObj.ancho/2);                        
                    }else{
                        desviarX = perseguirX - Math.abs(perseguirX - statsObjetivo.x) - (criatura.ancho/2 + criatObj.ancho/2);
                    }
                }else if(stats.x > statsObjetivo.x){
                    if(Math.abs(statsObjetivo.x - stats.x) > Math.abs(perseguirX - stats.x)){                        
                        desviarX = perseguirX - Math.abs(perseguirX - statsObjetivo.x) + (criatura.ancho/2 + criatObj.ancho/2);
                    }else{
                        desviarX = perseguirX + Math.abs(perseguirX - statsObjetivo.x) + (criatura.ancho/2 + criatObj.ancho/2);
                    }
                }
                if(desviarX != stats.x){
                    stats.x = desviarX;
                    stats.sprite = direccionSprite('perseguir');
                    reaccion('perseguir');
                }else{
                    Para();
                }
                return;
            }
                        
        }else if((bloqueadoAliadoX == true || bloqueadoEnemigoX == true) && bloqueadoObjetivo == false){
            
            if(stats.sprite != 'moveArr' && stats.sprite != 'moveArrDer' && stats.sprite != 'moveArrIzq' && stats.sprite != 'moveAba' && stats.sprite != 'moveAbaDer' && stats.sprite != 'moveAbaIzq'){
                
                if(perseguirX > stats.x){
                        
                    if(perseguirY > stats.y){
                        stats.sprite = 'moveAbaDer';
                    }else{
                        stats.sprite = 'moveArrDer';
                    }                
                }else{
                        
                    if(perseguirY > stats.y){
                        stats.sprite = 'moveAbaIzq';
                    }else{
                        stats.sprite = 'moveArrIzq';
                    }                
                }
                criatura.rgPerseg = 0;
            }
            
            if(stats.sprite == 'moveArr' || stats.sprite == 'moveArrDer' || stats.sprite == 'moveArrIzq'){
                Arr();
                if(bloqueadoAliadoY == true || bloqueadoEnemigoY == true){
                    Aba();
                    if(bloqueadoAliadoY == true || bloqueadoEnemigoY == true){
                        Para();
                    }else{
                        desviar()
                    }
                }else{
                    desviar()
                }
            }else if(stats.sprite == 'moveAba' || stats.sprite == 'moveAbaDer' || stats.sprite == 'moveAbaIzq'){
                Aba();
                if(bloqueadoAliadoY == true || bloqueadoEnemigoY == true){
                    Arr();
                    if(bloqueadoAliadoY == true || bloqueadoEnemigoY == true){
                        Para();
                    }else{
                        desviar()
                    }
                }else{
                    desviar()
                }
            }else{
                Para();
            }
            
            if(criatura.rgPerseg < 2){
                criatura.rgPerseg++;
            }else{
                stats.sprite = direccionSprite('perseguir');
            }
            
        }else if((bloqueadoAliadoY == true || bloqueadoEnemigoY == true) && bloqueadoObjetivo == false){
            
            if(stats.sprite != 'moveDer' && stats.sprite != 'moveArrDer' && stats.sprite != 'moveArrIzq' && stats.sprite != 'moveIzq' && stats.sprite != 'moveAbaDer' && stats.sprite != 'moveAbaIzq'){

                if(perseguirY > stats.y){
                        
                    if(perseguirX > stats.x){
                        stats.sprite = 'moveArrDer';
                    }else{
                        stats.sprite = 'moveArrIzq';
                    }                
                }else{
                        
                    if(perseguirX > stats.x){
                        stats.sprite = 'moveAbaDer';
                    }else{
                        stats.sprite = 'moveAbaIzq';
                    }
                }
                criatura.rgPerseg = 0;
            }
            
            if(stats.sprite == 'moveDer' || stats.sprite == 'moveArrDer' || stats.sprite == 'moveAbaDer'){
                Der();
                if(bloqueadoAliadoX == true || bloqueadoEnemigoX == true){
                    Izq();
                    if(bloqueadoAliadoX == true || bloqueadoEnemigoX == true){
                        Para();
                    }else{
                        desviar()
                    }
                }else{
                    desviar()
                }
            }else if(stats.sprite == 'moveIzq' || stats.sprite == 'moveArrIzq' || stats.sprite == 'moveAbaIzq'){
                Izq();
                if(bloqueadoAliadoX == true || bloqueadoEnemigoX == true){
                    Der();
                    if(bloqueadoAliadoX == true || bloqueadoEnemigoX == true){
                        Para();
                    }else{
                        desviar()
                    }
                }else{
                    desviar()
                }
            }else{
                Para();
            }
            
            if(criatura.rgPerseg < 2){
                criatura.rgPerseg++;
            }else{
                stats.sprite = direccionSprite('perseguir');
            }
            
        }else{
            
            perseguirY = stats.y;            
            colisiones(perseguirX, perseguirY);
            
            if(bloqueadoAliadoX == false && bloqueadoEnemigoX == false && bloqueadoObjetivoX == false){
                stats.x = perseguirX;
                stats.y = perseguirY;
                stats.sprite = direccionSprite('perseguir');
            }else{
                perseguirX = stats.x;
                perseguirY = stats.y + (criatura.vel * (varY / (Math.abs(varX) + Math.abs(varY))));
                colisiones(perseguirX, perseguirY);
                if(bloqueadoAliadoX == false && bloqueadoEnemigoX == false && bloqueadoObjetivoX == false){
                    stats.x = perseguirX;
                    stats.y = perseguirY;
                    stats.sprite = direccionSprite('perseguir');
                }else{
                    Para();
                }
            }
        }
        
        //CÓDIGO CONTRA ERRORES (desactivar xa ver los errores)
        //        if((stats.x == statsObjetivo.x && stats.y == statsObjetivo.y) || isNaN(stats.x) || isNaN(stats.y)){
        //            if(random * 2 > 1){
        //                stats.x = statsObjetivo.x - (random * criatura.vel);
        //            }else{
        //                stats.x = statsObjetivo.x + (random * criatura.vel);
        //            }
        //            if(random * 2 > 1){
        //                stats.y = statsObjetivo.y - (random * criatura.vel);
        //            }else{
        //                stats.y = statsObjetivo.y + (random * criatura.vel);
        //            }
        //        }
        
        reaccion('perseguir');
    }

    function huir() {
        
        function desviar(){
            stats.x = desvioX;
            stats.y = desvioY;
        }
        
        var varX = statsObjetivo.x - stats.x;
        var varY = statsObjetivo.y - stats.y;
            
        var huirX = Math.round(stats.x - (criatura.vel * (varX / (Math.abs(varX) + Math.abs(varY)))));
        var huirY = Math.round(stats.y - (criatura.vel * (varY / (Math.abs(varX) + Math.abs(varY)))));
            
        var desvioX, desvioY;
        
        colisiones(huirX, huirY);
        
        if(bloqueadoAliadoX == false && bloqueadoEnemigoX == false && bloqueadoAliadoY == false && bloqueadoEnemigoY == false){
            stats.x = huirX;
            stats.y = huirY;
            
        }else if((bloqueadoAliadoX == false && bloqueadoEnemigoX == false) && (bloqueadoAliadoY == true || bloqueadoEnemigoY == true)) {
            
            if(varX == 0){
                varX = random * 2 - 1;
                if(varX == 0){
                    varX = 1;
                }
            } 
            
            desvioX = stats.x - Math.round(criatura.vel * (varX / Math.abs(varX)));
            desvioY = stats.y;
            colisiones(desvioX, desvioY);
            if(bloqueadoAliadoX == true || bloqueadoEnemigoX == true){
                desvioX = stats.x + Math.round(criatura.vel * (varX / Math.abs(varX)));
                desvioY = stats.y;
                colisiones(desvioX, desvioY);
                if(bloqueadoAliadoX == true || bloqueadoEnemigoX == true){
                    Para();
                }else{
                    desviar();
                }
            }else{
                desviar();
            }
            
        }else if((bloqueadoAliadoY == false && bloqueadoEnemigoY == false) && (bloqueadoAliadoX == true || bloqueadoEnemigoX == true)) {
            
            if(varY == 0){
                varY = random * 2 - 1;
                if(varY == 0){
                    varY = 1;
                }
            } 
            
            desvioX = stats.x;
            desvioY = stats.y - (criatura.vel * (varY / Math.abs(varY)));
            
            colisiones(desvioX, desvioY);
            if(bloqueadoAliadoY == true || bloqueadoEnemigoY == true){
                desvioX = stats.x;
                desvioY = stats.y + (criatura.vel * (varY / Math.abs(varY)));
                colisiones(desvioX, desvioY);
                if(bloqueadoAliadoY == true || bloqueadoEnemigoY == true){
                    Para();
                }else{
                    desviar();
                }
            }else{
                desviar();
            }
            
        }else{
            Para();
        }
        reaccion('huir');
    }
    
    function Para(){
        
        moverVacio();
        
        stats.estado = 'parado';
        stats.sprite = direccionAccion('para');
    }
      
    function direccionSprite(estado){
        
        if(criatura.rgSprite < 2 && stats.estado == 'perseguir' && estado == 'perseguir'){
            criatura.rgSprite++;
            return stats.sprite;
        }
        
        var variacionX = Math.abs(criatura.xAnterior - stats.x);
        var variacionY = Math.abs(criatura.yAnterior - stats.y);
        var margen = variacion(variacionX, variacionY);
                
        if(variacionX > 2*variacionY){
                    
            if (criatura.xAnterior < stats.x){
                return mover(margen,'Der');
            }
            if (criatura.xAnterior > stats.x){
                return mover(margen,'Izq');
            }
        }

        if(variacionY > 2*variacionX){
            if (criatura.yAnterior < stats.y){
                return mover(margen,'Aba');
            }
            if (criatura.yAnterior > stats.y){
                return mover(margen,'Arr');
            }
        }
                
        if (criatura.xAnterior < stats.x && criatura.yAnterior < stats.y){
            return mover(margen,'AbaDer');
        }
        if (criatura.xAnterior < stats.x && criatura.yAnterior > stats.y){
            return mover(margen,'ArrDer');
        }
        if (criatura.xAnterior > stats.x && criatura.yAnterior < stats.y){
            return mover(margen,'AbaIzq');
        }
        if (criatura.xAnterior > stats.x && criatura.yAnterior > stats.y){
            return mover(margen,'ArrIzq');
        }
        return direccionAccion("para");
    }
            
            
    function mover(margen, direccion){
        
        if(direccion != stats.sprite){
            criatura.rgSprite = 0;
        }else{
            criatura.rgSprite++;
        }
        
        //        if(margen > criatura.vel /10){                    
        return 'move' + direccion;                    
    //        }else{                    
    //            return 'para' + direccion;                    
    //        }                
    }
            
            
    function direccionAccion(accion){
          
        var variacionX = Math.abs(stats.x - statsObjetivo.x);
        var variacionY = Math.abs(stats.y - statsObjetivo.y);
        
        if(variacionX > 2*variacionY){
                    
            if (statsObjetivo.x > stats.x){
                return accion+'Der';
            }
            if (statsObjetivo.x < stats.x){
                return accion+'Izq';
            }
        }

        if(variacionY > 2*variacionX){
            if (statsObjetivo.y > stats.y){
                return accion+'Aba';
            }
            if (statsObjetivo.y < stats.y){
                return accion+'Arr';
            }
        }
                
        if (statsObjetivo.x > stats.x && statsObjetivo.y > stats.y){
            return accion+'AbaDer';
        }
        if (statsObjetivo.x > stats.x && statsObjetivo.y < stats.y){
            return accion+'ArrDer';
        }
        if (statsObjetivo.x < stats.x && statsObjetivo.y > stats.y){
            return accion+'AbaIzq';
        }
        if (statsObjetivo.x < stats.x && statsObjetivo.y < stats.y){
            return accion+'ArrIzq';
        }
    }
    
    function contarKill(idObjetivo){
        calculoBatalla.muertes = calculoBatalla.muertes + stats.id + ":" + idObjetivo + ",";
    }
    
    function moverVacio(){
        
        for(i = 0; i < conjunto.length; i++){
            
            if(conjunto[i].id != stats.id){
                
                var sepAncho = (criatura.ancho/2 + criaturas[conjunto[i].id].ancho/2) -4;
                var sepAlto = (criatura.alto/2 + criaturas[conjunto[i].id].alto/2) -4;
                
                while(Math.abs(conjunto[i].x - stats.x) < sepAncho && Math.abs(conjunto[i].y - stats.y) < sepAlto){
                    
                    if(conjunto[i].x - stats.x > conjunto[i].y - stats.y){
                        
                        if(conjunto[i].x < stats.x){
                            stats.x = stats.x - (stats.x - conjunto[i].x) + sepAncho;
                        }else{
                            stats.x = stats.x + (conjunto[i].x - stats.x) - sepAncho;
                        }                        
                    }else{
                        
                        if(conjunto[i].y < stats.y){
                            stats.y = stats.y - (stats.y - conjunto[i].y) + sepAlto;
                        }else{
                            stats.y = stats.y + (conjunto[i].y - stats.y) - sepAlto;
                        }
                    }
                }
            }
        }
    }
    
    function golpe(criatura, objetivo, golpe){
        danoCausado(criatura, objetivo, golpe)
        objetivo.golpe = golpe;
    }
    
    function magia(criatura, objetivo, golpe){
        danoCausado(criatura, objetivo, golpe)
        objetivo.magia = golpe;  
    }
    
    function danoCausado(criatura, objetivo, golpe){
        objetivo.vida = objetivo.vida - golpe;
        if(objetivo.vida <= 0){
            contarKill(objetivo.id);
        }              
        if(criatura.golpeMax < golpe) criatura.golpeMax = golpe; 
    }
    
    function cura(objetivo, cura){
        var c = criaturas[objetivo.id];
        var vidaOrig = objetivo.vida;
        objetivo.vida = objetivo.vida + cura;
        var vida = criaturas[objetivo.id].vida;
        if(objetivo.vida > vida){
            cura = vida - vidaOrig;
            objetivo.vida = vida;                                
        }
        objetivo.cura = cura;
        if(c.curaMax < cura) c.curaMax = cura;
    }
    
    function efectoElemento(objetivo, efecto, fraccion){
        
        if(efecto == "fuego"){
            rgEfecto = 1;
            
        }else if(efecto == "rayo"){
            rgEfecto = 5;
                            
        }else if(efecto == "hielo"){
            rgEfecto = 15;
                            
        }else if(efecto == "veneno"){
            rgEfecto = 200;
                            
        }else if(efecto == "piedra"){
            objetivo = stats;
            rgEfecto = 50;
                            
        }
        else if(efecto == "naturaleza"){
            objetivo = stats;
            rgEfecto = 5;
            cura(stats, Math.round(criatura.poder * fraccion));
        }
                        
        var obj = {};
        obj.efecto = efecto;
        obj.rgEfecto = rgEfecto;
        if(typeof objetivo.efecto != 'undefined' && objetivo.efecto != null){
            objetivo.efecto[objetivo.efecto.length] = obj;
        }else{
            objetivo.efecto = [];
            objetivo.efecto[0] = obj;
        }   
    }
    
}
