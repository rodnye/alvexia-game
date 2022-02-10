//importación de librerías
app.Script(config.PATH.lib+"/dom.min.js");

//funciones complementarias
mx = {};

mx.ShowProgress = txt => app.ShowProgress(txt);
mx.HideProgress = txt => app.HideProgress(txt);
mx.open = url => window.open(url);
mx.Alert = txt=>app.Alert(txt);

//evitar interacciones del usuario
mx.CreateBlock = function(){
    var _block = dom.create("div");
    _block.dom.style({
        display:"none",
        position:"fixed",
        zIndex:"49",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0)"
    });
    dom.get("body").dom.add(_block);
    return {
        show: function(){
            _block.style.display = "block";
        },
        hide: function(){
            _block.style.display = "none";
        }
    }
};

//funcion para animaciones
mx.Animate = function(_fps, callback){
    let _animation;
    return {
      start: function(){
        if(_fps!="frame") _animation = window.setInterval(callback, 1000/_fps);
        else {
          _animation = ()=>{callback(); requestAnimationFrame(_animation)}
          _animation();
        }
      },
      stop: function(){
        if(_fps!="frame") window.clearInterval(_animation);
      }
  }
}

//funciones de gestion de datos
mx.SaveText = function(_param, _value){
   app.SaveText(_param, _value);
};
mx.LoadText = function(_param){
  var _data = app.LoadText(_param, "%%null");
  return _data!=="%%null"?_data:undefined;
};

//parseador de status del server
var raw;
class RawParser {
  constructor(_type){
    this.type = _type;
    this.raw_list = [];
  }
  add(_data, _result){
    this.raw_list.push({r:_data,s:_result})
  }
  parse(_data){
    for(let i of this.raw_list) if(i.r === _data) return i.s;
    return "PARSE ERROR, string not found: "+_data;
  }
};

raw = new RawParser();
raw.add("DATA_ERROR",        "La sintaxis de los parámetros enviados es incorrecta")
raw.add("WRONG_USER",        "El usuario o la contraseña son incorrectos");
raw.add("WRONG_EMAIL",       "El correo electrónico no es válido");
raw.add("WRONG_APP_TOKEN",   "Estás usando una versión obsoleta de la aplicación, por favor actualice")
raw.add("USERNAME_BAD_CHAR", "El nombre de usuario posee caracteres no válidos")
raw.add("ACC_ERROR",         "Los datos de la cuenta tienen un error");
raw.add("EMPTY_USER",        "El usuario no puede estar en blanco");
raw.add("EMPTY_PASS",        "La contraseña no puede estar vacía");
raw.add("EMPTY_EMAIL",       "El email no puede estar vacío");
raw.add("EMAIL_USED",        "El email introducido ya se encuentra en uso");
raw.add("PASS_MATH",         "Las contraseñas no coinciden");
raw.add("PASS_LENGTH",       "La contraseña debe estar en el rango de 8 a 15 letras");
raw.add("SUCCESS",           "Operación efectuada correctamente");
raw.add("REGISTERED",        "Usted a sido registrado correctamente");
//local
raw.add("HTTP_ERROR",        "Upps! Hubo un error al conectarse al servidor :(\nHTTP ERROR: ")