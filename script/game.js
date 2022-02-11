app.Script(config.PATH.lib+"/socket-io.min.js");
app.Script(config.PATH.lib+"/joy.min.js");
app.Script(config.PATH.script+"/global.js");
app.Script(config.PATH.script+"/engine.js");

function OnStart() {
  // USER STATUS //
  //app.SetScreenMode("Game");
  config.USER = {
    socket: {query: app.GetData("auth-query")},
    name: mx.LoadText("login-user"),
    pass: mx.LoadText("login-pass"),
    is_connect: false
  }
  
  
  game_view = dom.getId("game-view");
  joy = new JoyStick("joystick", {}, engine.joystick);

  //comprobar si tiene soporte
  if (!game_view.getContext) return app.Quit(raw.parse("CANVAS_ERROR"));

  //inicializando api de canvas
  game = game_view.getContext("2d");
  game_view.width = screen.width;
  game_view.height = screen.height;

  engine.init();
  Connect(false);
}



// CONEXION //
function Connect(ss=true) {
  if(ss)mx.ShowProgress();
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
  
  // LOGICA ONLINE //
  socket.on("load_map", d=>{
    /* map = {
        name : WORDNAME,
        pos : {
            x : POS_X,
            y : POS_Y
        },
        size : {
            x : WORD_WIDTH,
            y : WORD_HEIGHT
        },
        biome : "nature",
        terrain : {},
        objects : {},
        npcs : {},
        pjs : {}
    } */
    player.pos[0] = d.pos.x;
    player.pos[1] = d.pos.y;
  })
}