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
        _animation = window.setInterval(callback, 1000/_fps);
      },
      stop: function(){
        window.clearInterval(_animation);
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