app.Script(config.PATH.lib+"/socket-io.min.js");
app.Script(config.PATH.lib+"/joy.min.js");
app.Script(config.PATH.script+"/global.js");
var engine = {};
app.Script(config.PATH.script+"/engine.js");
app.Script(config.PATH.script+"/socket-engine.js");


function OnStart() {
  mx.debug_init();
  
  // USER STATUS //
  config.USER = {
    socket: {query: app.GetData("auth-query")},
    name: mx.LoadText("login-user"),
    pass: mx.LoadText("login-pass"),
    is_connect: false,
    socket_enabled: false,
  }
  
  
  game_view = dom.get("#game-view");
  joy = new JoyStick("joystick", {}, engine.joystick);

  //comprobar si tiene soporte
  if (!game_view.getContext) return app.Quit(raw.parse("CANVAS_ERROR"));

  //inicializando api de canvas
  game = game_view.getContext("2d");
  game_view.width = screen.width;
  game_view.height = screen.height;

  engine.init();
  Connect();
}



// CONEXION //
function Connect() {
  mx.ShowProgress();
  config.USER.socket_enabled = true;
  socket = io.connect(config.URL.socket, config.USER.socket);

  socket.on("connect", ()=>{
    mx.HideProgress();
    config.USER.is_connect = true;
  });
  
  socket.on("disconnect", ()=>{
    mx.ShowProgress("Reconectando...");
    config.USER.is_connect = false;
  });
  
  socket.on("reconnected", ()=>{
    mx.HideProgress();
    config.USER.is_connect = true;
  });
  
  engine.socket(socket);
  
}