var engine = {};


// INICIALIZAR JUEGO //
engine.init = ()=> {
  // PLAYER //
  player = {
    pos: [0, 0],
    mov: [0, 0],
    size: [50, 50],
    speed: 1,
    deg: 0,
    texture: "hero.png",
    img: new Image()
  };
  player.img.onload = ()=>{player.img.ready=true}
  player.img.src = config.PATH.img+"/"+player.texture;
  
  // WORLD //
  world = {
    size: [500, 500],
    pos: [0,0],
    bioma: "nature",
    textures: [],
    img_data: {
      floor: null
    }
  };
  engine.load_world();
  
  // LOGICA //
  mx.Animate(60, ()=>{
    if (player.mov[0]) {
      //si hay movimiento en x
      player.pos[0] += player.mov[0];
      world.pos[0] = -player.pos[0]
    }
    if (player.mov[1]) {
      player.pos[1] -= player.mov[1];
      world.pos[1] = -player.pos[1]
    }
  }).start();
  
  // MOSTRAR //
  mx.Animate("frame", engine.generate_frame).start();
  
}

// ACCIONES JOYSTICK //
engine.joystick = d => {
    player.mov[0] = d.x/100*player.speed;
    player.mov[1] = d.y/100*player.speed;
}

// GENERAR WORLD //
engine.load_world = () => {
  let path_world = config.PATH.img + "/world/" + world.bioma;
  let img_floor = new Image();
      img_floor.onload = ()=>{img_floor.ready=true};
      img_floor.src = path_world+"/base.png";
      img_floor.width = 80;
      img_floor.height = 80;
  
  world.img_data.floor = img_floor;
};

// PINTAR FRAME //
engine.generate_frame = () => {
  engine.clear_frame();
  let world_img = world.img_data;
  
  let _y = player.pos[1]-screen.height/2;
  
  if (world_img.floor.ready) for(let y = _y; y < _y+screen.height*2; y+=world_img.floor.height){
    
    let _x = player.pos[0]-screen.width/2;
    
    for(let x = _x; x < _x+screen.width*2; x+=world_img.floor.width){
      game.drawImage(world_img.floor, x+world.pos[0], y+world.pos[1], world_img.floor.width, world_img.floor.height);
    }
  }
  if (player.img.ready) game.drawImage(player.img, game_view.width/2-player.size[0]/2, game_view.height/2-player.size[1]/2, player.size[0], player.size[1]);
  
  engine.debug([
    "player x: "+player.pos[0],
    "player y: "+player.pos[1],
    "world x: "+world.pos[0],
    "world y: "+world.pos[1]
  ])
}

// BORRAR FRAME //
engine.clear_frame = () => game.clearRect(0,0,game_view.width, game_view.height);

// DEBUG CANVAS //
engine.debug = txt=>{
  let ww = 10;
  for(let i of txt){
    game.fillText(i,10,ww)
    ww+=10;
  };
}