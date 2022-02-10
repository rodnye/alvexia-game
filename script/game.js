app.Script(config.PATH.script+"/global.js");
app.Script(config.PATH.script+"/engine.js");

function OnStart(){
  game_view = dom.getId("game-view");
  joy = new JoyStick("joystick",{}, engine.joystick);
  
  //comprobar si tiene soporte
  if(!game_view.getContext) return app.Quit("El motor gráfico de su dispositivo no es compatible con el juego");
  
  //inicializando api de canvas
  game = game_view.getContext("2d");
  game_view.width = screen.width;
  game_view.height = screen.height;
  
  engine.init();
}