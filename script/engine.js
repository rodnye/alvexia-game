
//objetos del juego
var gx = {
  player: null,
  world: null,
  pjs: {},
  _emitps: 30
};


// INICIALIZAR JUEGO //
engine.init = ()=> {
  // PLAYER //
  gx.player = {
    pos: [0,0],
    mov_enable: true,
    mov: [0,0],
    size: [20, 20],
    deg: 0,
    texture: "hero_basic",
    img: new Image(),
    
    _emit_joy_enable: true,
  };
  
  var player = gx.player;
  
  
  player.img.onload = ()=>{player.img.ready=true}
  player.img.src = mx.BImg(config.PATH.img_pjs+"/"+player.texture);
  
  // WORLD //
  gx.world = {
    size: [0,0],
    pos: [0,0],
    bioma: "nature",
    textures: [],
    img_data: {
      floor: null
    }
  };
  var world = gx.world;
  engine.load_world();
  
  // MOSTRAR //
  mx.Animate("frame", engine.generate_frame).start();
  mx.Animate("frame", ()=>{
    if(config.USER.is_connect && player._emit_joy_enable && player.mov_enable){
        socket.emit("move_pj", Math.round(player.mov[0])+"_"+Math.round(player.mov[1]));
        player.mov_enable = false;
        window.setTimeout(()=>{player.mov_enable=true}, 1000/gx._emitps)
      }
  }).start()
  
}

// ACCIONES JOYSTICK //
engine.joystick = d => {
    var player = gx.player;
    player._emit_joy_enable = d.x!=0 && d.y!=0;
    player.mov = [d.x, d.y];
}

// GENERAR WORLD //
engine.load_world = () => {
  let path_world = config.PATH.img_world + "/" + gx.world.bioma;
  let img_floor = new Image();
      img_floor.onload = ()=>{img_floor.ready=true};
      img_floor.src = mx.BImg(path_world+"/base");
      img_floor.width = 80;
      img_floor.height = 80;
  
  gx.world.img_data.floor = img_floor;
};

// PINTAR FRAME //
engine.generate_frame = () => {
  engine.clear_frame();
  let player = gx.player;
  let world = gx.world;
  let world_img = world.img_data;
  
  /*let _y = player.pos[1]-screen.height/2;
  
  if (world_img.floor.ready) for(let y = 0; y < world.size[1]; y+=world_img.floor.height){
    
    let _x = player.pos[0]-screen.width/2;
    
    for(let x = 0; x < world.size[0]; x+=world_img.floor.width){
      game.drawImage(world_img.floor, x+world.pos[0], y+world.pos[1], world_img.floor.width, world_img.floor.height);
    }
  }*/
  if (world_img.floor.ready) game.drawImage(world_img.floor, world.pos[0], world.pos[1], world.size[0], world.size[1])
  if (player.img.ready) game.drawImage(player.img, game_view.width/2-player.size[0]/2, game_view.height/2-player.size[1]/2, player.size[0], player.size[1]);
  for (let i in gx.pjs) if(gx.pjs[i]!==undefined) {
    let pj = gx.pjs[i];
    if(pj.img.ready) game.drawImage(
         pj.img, 
         pj.pos[0]-world.pos[0],
         pj.pos[1]-world.pos[1],
         pj.size[0],
         pj.size[1]
    );
  }
  
  engine.debug([
    "player x: "+player.pos[0],
    "player y: "+player.pos[1],
    "world x: "+world.pos[0],
    "world y: "+world.pos[1]
  ])
}

// BORRAR FRAME //
engine.clear_frame = () => game.clearRect(0,0,game_view.width, game_view.height);

engine.tile = n=>n*gx.world.img_data.floor.width;

// DEBUG CANVAS //
engine.debug = txt=>{
  let ww = 10;
  for(let i of txt){
    game.fillText(i,10,ww)
    ww+=10;
  };
}