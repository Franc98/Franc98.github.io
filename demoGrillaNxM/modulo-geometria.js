

/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}

var forma= getUrlVars()["forma"]

// parametros del plano
var ancho = 3;
var largo = 3;

// parametros de la esfera
var radio = 2;

// parametros del tubo senoidal
var amplitud = 0.1;
var longitudOnda = 0.4;
var RadioTubo = 0.8;
var altura = 2.0;


var superficie3D;

switch (forma) {
	case ("esfera"):
        superficie3D = new Esfera(radio);
        break;
    case ("tubo"):
        superficie3D = new TuboSenoidal(amplitud , longitudOnda, RadioTubo, altura);
        break;
    default:
        superficie3D=new Plano(ancho,largo);
        break;


}

//superficie3D = new Plano(3,3);
//superficie3D = new Esfera(2);
//superficie3D = new TuboSenoidal(0.1,0.4,0.8,2.0);

var mallaDeTriangulos;

var filas=100;
var columnas=100;


function crearGeometria(){
        

    
    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){

    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radio){

    this.getPosicion=function(u,v){

        phi = 2*Math.PI*u;
        tita = Math.PI*v;
        /*
        Utilizo como cordenadas
        z = x'
        x = y'
        y = z'

        resuelvo para x', y' y z'
        */


        var z= radio*Math.cos(phi)*Math.sin(tita);
        var x= radio*Math.sin(phi)*Math.sin(tita);
        var y= radio*Math.cos(tita);
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        phi = 2*Math.PI*u;
        tita = Math.PI*v;
        var z= Math.cos(phi)*Math.sin(tita);
        var x= Math.sin(phi)*Math.sin(tita);
        var y= Math.cos(tita);
        return [x,y,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function TuboSenoidal(amplitud , longitudOnda, RadioTubo, altura){

    this.getPosicion=function(u,v){

        var y= (v-0.5)*altura;

        phi = 2*Math.PI*u;
        radio = RadioTubo-amplitud*Math.cos(2*Math.PI*y/longitudOnda);

        var z= radio*Math.cos(phi);
        var x= radio*Math.sin(phi);
        
        return [x,y,z];
    }

    // calclua el vector normal para una coordenada
    this.getNormalAux=function(u,v, deltaU, deltaV)
    {
        var dU = deltaU;
        var dV = deltaV;

        if(u < deltaU)
        {
            dU = u;
        }
        if((1-u) < deltaU)
        {
            dU = (1-u);
        }
        if(v < deltaV)
        {
            dV = v;
        }
        if((1-v) < deltaV)
        {
            dV = (1-v);
        }

        var modNorma = 1;
        if(v == 1)
        {
            dV = -dV;
            if(u == 0)
            {
                modNorma = -1;
            }
            else
            {
                dU = - dU;
            }
        }
        if(u == 1)
        {
            dU = -deltaU;
            if(v == 0)
            {
                modNorma = -1;
            }
            else
            {
                dV = - dV;
            }
        }

        var p1 = this.getPosicion(u,v);
        var p2 = this.getPosicion(u+dU,v);
        var p3 = this.getPosicion(u,v+dV);

        var vecU = [p2[0]-p1[0],p2[1]-p1[1],p2[2]-p1[2]];
        var vecV = [p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]];

        var vecN = [vecU[1]*vecV[2]-vecU[2]*vecV[1],vecU[2]*vecV[0]-vecU[0]*vecV[2],vecU[0]*vecV[1]-vecU[1]*vecV[0]];

        var NormaVecN = modNorma*Math.sqrt(vecN[0]*vecN[0]+vecN[1]*vecN[1]+vecN[2]*vecN[2]);
        vecN[0] = vecN[0]/NormaVecN;
        vecN[1] = vecN[1]/NormaVecN;
        vecN[2] = vecN[2]/NormaVecN;

        return vecN;        
    }

    this.getNormal=function(u,v){

        phi = 2*Math.PI*u;
        tita = 2*Math.PI*(v-0.5)*altura/longitudOnda; 

        var dU = 0.0001;
        var dV = 0.0001;
        return this.getNormalAux(u,v,dU,dV);
        
        /*
        var z= Math.cos(phi)*Math.sin(tita);
        var x= Math.sin(phi)*Math.sin(tita);

        var y= Math.cos(tita);
        return [x,y,z];
        */
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }

}




function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    
    indexBuffer=[];  
    //indexBuffer=[0,1,2,2,1,3]; // Estos valores iniciales harcodeados solo dibujan 2 triangulos, REMOVER ESTA LINEA!

    var verticeSuperior;
    var verticeinferior;
    
    // como fila y columnas están en quads tango que sumarle 1 para que lo calcule como vertices
    for (i=0; i < filas; i++) {
        verticeSuperior = i*(filas+1);
        verticeinferior = (i+1)*(filas+1);
        for (j=0; j < columnas; j++) {

            indexBuffer.push(verticeSuperior);
            indexBuffer.push(verticeinferior);

            verticeSuperior = verticeSuperior + 1;
            verticeinferior = verticeinferior + 1;
            
        }

        // oara el cambio de linea
        indexBuffer.push(verticeSuperior);
        indexBuffer.push(verticeinferior);

        indexBuffer.push(verticeinferior);
        indexBuffer.push((i+1)*(filas+1));

        
    }
   

    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

