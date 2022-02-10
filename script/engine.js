var engine = {};
var player ={};


// INICIALIZAR JUEGO //
engine.init = ()=> {

  player = {
    pos: [0, 0],
    mov: [0, 0],
    size: [100, 100],
    speed: 1,
    deg: 0,
    texture: "hero.png",
    img: null
  };
  
  player.img = new Image(player.size[0], player.size[1]);
  player.img.onload = ()=>{player.img.ready=true}
  player.img.src = config.PATH.img+"/"+player.texture;
  
  
  // LOGICA //
  mx.Animate(60, ()=>{
    player.pos[0] += player.mov[0];
    player.pos[1] -= player.mov[1];
  }).start();
  
  // MOSTRAR //
  mx.Animate("frame", engine.generate_frame).start();
  
}


// ACCIONES JOYSTICK //
engine.joystick = d => {
    player.mov[0] = d.x/100*player.speed;
    player.mov[1] = d.y/100*player.speed;
}

// PINTAR FRAME //
engine.generate_frame = () => {
  engine.clear_frame();
  if(player.img.ready) game.drawImage(player.img, player.pos[0], player.pos[1]);
  
}

// BORRAR FRAME //
engine.clear_frame = () => game.clearRect(0,0,game_view.width, game_view.height);