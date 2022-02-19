
//objetos del juego
var gx = {
  player: null,
  world: null,
  pjs: {},
  obj: {},
  
  /*atributos editables*/
  _paint_offset: 100, //espacio de dibujado fuera de la pantalla
  _tile_size: 50, //tamaño de cuadrícula
  _screen_reference: 620, //ancho de pantalla de referencia para escala
  _emitps: 30,  //emit por segundo
  _engine_fps: 30,  //cuadros por segundo
};


// INICIALIZAR JUEGO //
engine.init = ()=> {
  cvw = n => screen.width * (n * 100 / gx._screen_reference) / 100;
  gx._paint_offset = cvw(gx._paint_offset);
  
  // PLAYER //
  gx.player = {
    pos: [0,0],
    speed: 0,
    mov: [0,0],
    size: [40, 50],
    deg: 0,
    texture: null,
    img: new Image(),
    
    _emit_joy_enable: false,
  };
  
  var player = gx.player;
  
  // WORLD //
  gx.world = {
    size: [0,0],
    pos: [0,0],
    bioma: "nature",
    textures: [],
    img_data: {
      floor: null,
      tree_1: null,
    }
  };
  var world = gx.world;
  engine.load_world();
  
  // MOSTRAR //
  mx.Animate("frame", engine.generate_frame).start();
  
  // LOGICA //
  mx.Animate(gx._engine_fps, ()=>{
    if(config.USER.is_connect){
      
      let p_cx = mx.round(player.pos[0] + (player.mov[0]>player.speed?player.speed:player.mov[0]));
      let p_cy = mx.round(player.pos[1] + (player.mov[1]>player.speed?player.speed:player.mov[1]));
      
      //no salirse del mapa
      if( p_cx > 0 ) {
        if (p_cx > world.size[0]) p_cx = world.size[0]// - player.size[0]/2;
      } else p_cx = 0;
      
      if( p_cy > 0 ) {
        if (p_cy > world.size[1]) p_cy = world.size[1]//- player.size[1]/2;
      } else p_cy = 0;
      
      /*AUN EN DESARROLLO
      
      //esta colisionando con algo?
      const obj = gx.obj[engine.atile(p_cx)+"_"+engine.atile(p_cy)];
      if(obj){
        let colision = engine.colision(player,obj);
        if(colision.x) p_cx = player.pos[0];
        if(colision.y) p_cy = player.pos[1];
      }
      */
      
      //desplazar
      player.pos[0] = p_cx;
      player.pos[1] = p_cy;
      
      gx.world.pos = [-player.pos[0],-player.pos[1]];
      
    }
  }).start()
  
  // EMITIR AL SERVIDOR //
  mx.Animate(gx._emitps, ()=>{
    if(player._emit_joy_enable){
        socket.emit("move_pj", player.pos[0]+"&"+player.pos[1]+"&"+player.deg);
        total_emit++;
    }
  }).start()
  
}

// ACCIONES JOYSTICK //
engine.joystick = d => {
    var player = gx.player;
    player._emit_joy_enable = d.x!=0 && d.y!=0;
    player.mov[0] = mx.round(d.x/100*player.speed);
    player.mov[1] = mx.round(-d.y/100*player.speed);
}

// CARGAR DATOS LOCALES DEL MUNDO //
engine.load_world = () => {
  const world = gx.world;
  let path_world = config.PATH.img_world + "/" + gx.world.bioma;
  
  world.img_data.floor = engine.img(mx.BImg(path_world+"/base"),gx._tile_size,gx._tile_size);
  world.img_data.tree_1 = engine.img(mx.BImg(path_world+"/tree_1"),50,50)
};

// COLISION //
engine.colision = (o1, o2) => {
  let res = {x:false,y:false};
  if(o1.pos[0] + o1.size[0] >= o2.pos[0] && //derecha o1
     o1.pos[0] <= o2.pos[0] + o2.size[0]    //izquierda o1
  ) res.x = true;
  
  if(o1.pos[1] + o1.size[1] >= o2.pos[1] && //arriba o1
     o1.pos[1] <= (o2.pos[1] + o2.size[1])  //abajo o1
  ) res.y = true;
  
  res.t = res.x||res.y;
  return res;
}

// PINTAR FRAME //
engine.generate_frame = () => {
  engine.clear_frame();
  let player = gx.player;
  let world = gx.world;
  let world_img = world.img_data;
  
  // DIBUJAR TERRENO //
  let mx = cvw(world.pos[0]) + game_view.width/2;
  let my = cvw(world.pos[1]) + game_view.height/2
  if (world_img.floor.ready) 
   for(let y = my; y < cvw(world.size[1]+world.pos[1]-2)+game_view.height/2; y+=cvw(world_img.floor.height)) {
     if(y >= -gx._paint_offset)
       for(let x = mx; x < cvw(world.size[0]+world.pos[0]-2)+game_view.width/2; x+=cvw(world_img.floor.width))
         if(x >= -gx._paint_offset) bgame.drawImage(world_img.floor, x, y, cvw(world_img.floor.width), cvw(world_img.floor.height));
   }
  
  
  if (player.img.ready) fgame.drawImage(player.img, game_view.width/2-cvw(player.size[0])/2, game_view.height/2-cvw(player.size[1])/2, cvw(player.size[0]), cvw(player.size[1]));
 
  // DIBUJAR PLAYERS //
  for (let i in gx.pjs) if(gx.pjs[i]!==undefined) {
    let pj = gx.pjs[i];
    let pos = [
      cvw(pj.pos[0] + world.pos[0])+game_view.width/2,
      cvw(pj.pos[1] + world.pos[1])+game_view.height/2
    ];
    
    //si está dentro del rango de visión
    if(
      pos[0] >= -gx._paint_offset && 
      pos[0] <= game_view.width + gx._paint_offset &&
      pos[1] >= -gx._paint_offset && 
      pos[1] <= game_view.height + gx._paint_offset
    ) 
     if(pj.img.ready) fgame.drawImage(pj.img, pos[0], pos[1], cvw(pj.size[0]), cvw(pj.size[1]));
  }
  
  // DIBUJAR OBJETOS //
  for(let i in gx.obj ) {
    let obj = gx.obj[i];
    let img = gx.world.img_data[obj.name];
    let pos = [
      cvw(obj.pos[0] + world.pos[0])+game_view.width/2,
      cvw(obj.pos[1] + world.pos[1])+game_view.height/2
    ];
    
    //si está dentro del rango de visión
    if(
      pos[0] >= -gx._paint_offset && 
      pos[0] <= game_view.width + gx._paint_offset &&
      pos[1] >= -gx._paint_offset && 
      pos[1] <= game_view.height + gx._paint_offset
    ) 
      if(img.ready) fgame.drawImage(img, pos[0], pos[1], cvw(obj.size[0]),cvw(obj.size[1]))
  }
  
  
  if(config.TEST_ENABLE) engine.debug([
    "player x: "+player.pos[0],
    "player y: "+player.pos[1],
    "mov x: "+player.mov[0],
    "mov y: "+player.mov[1],
    "world x: "+world.pos[0],
    "world y: "+world.pos[1],
    "joy emits sent: "+total_emit+" ("+gx._emitps+"emit/s)",
    "delay emits: "+delay_emit_count+"s"
  ])
}

// BORRAR FRAME //
engine.clear_frame = () => {
  fgame.clearRect(0,0,game_view.width, game_view.height);
  bgame.clearRect(0,0,game_view.width, game_view.height);
}

// crear imagen //
engine.img = (src, w, h)=>{
  let img = new Image();
  img.src = src;
  img.onload = ()=>{img.ready=true};
  img.width = w;
  img.height = h;
  return img;
}

// parseador de tile //
engine.tile = n=> n * gx.world.img_data.floor.width;
engine.atile = n=> Math.floor(n/gx.world.img_data.floor.width);

// DEBUG CANVAS //
engine.debug = txt=>{
  let ww = 10;
  for(let i of txt){
    fgame.fillText(i,10,ww)
    ww+=10;
  };
}