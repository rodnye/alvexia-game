
//objetos del juego
gx = {
  player: null,
  world: null,
  pjs: {},
  obj: {},
  cache: PIXI.utils.TextureCache,
  get src(){return game.loader.resources},
  
  /* atributos editables */
  _paint_offset: 100, //espacio de dibujado fuera de la pantalla
  _tile_size: 50, //tamaño de cuadrícula
  _screen_reference: 620, //ancho de pantalla de referencia para escala
  _emitps: 5,  //emit por segundo
  _engine_fps: 30,  //cuadros por segundo
  _smooth_mov_fps: 60, //velocidad de suavizado de movimiento
  _smooth_mov_steps: 30, //cantidad de pasos en el suavisado
};


// INICIALIZAR JUEGO //
engine.init = ()=> {
  let callback = ()=>{};
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
    
    _emit_joy_enable: false,
  };
  
  // WORLD //
  gx.world = {
    size: [0,0],
    pos: [0,0],
    bioma: "nature",
    textures: [],
    sprite: null
  };
  
  engine.load_textures().ready(()=>{
    gx.player.sprite = new PIXI.Sprite(gx.src["pj_hero_male_1"].texture);
    gx.world.sprite = new PIXI.TilingSprite(gx.src["w_floor"].texture);
    
    engine.animation()
    callback();
  });
  return {ready: n=>{callback = n}}
}

engine.animation = ()=>{
  var world = gx.world;
  var player = gx.player;
  
  // MOSTRAR //
  game.ticker.add(engine.generate_frame);
  
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
      
      //AUN EN DESARROLLO
      //esta colisionando con algo?
      /*const obj1 = gx.obj[engine.atile(p_cx - player.size[0]/2)+"_"+engine.atile(p_cy - player.size[1]/2)];
      const obj2 = gx.obj[engine.atile(p_cx + player.size[0]/2)+"_"+engine.atile(p_cy + player.size[1]/2)]
      if(obj1 || obj2){
        let obj = obj1 || obj2;
        let colision = engine.colision(player, obj, engine.direction(player.mov[0], player.mov[1]));
        if(colision.t) p_cx = player.pos[0];
        if(colision.t) p_cy = player.pos[1];
      }*/
      
      
      //desplazar
      player.pos[0] = p_cx;
      player.pos[1] = p_cy;
      gx.world.pos = [-player.pos[0],-player.pos[1]];
      
    }
  }).start()
  
  // EMITIR AL SERVIDOR //
  mx.Animate(gx._emitps, ()=>{
    if(player._emit_joy_enable){
        let emit_data = player.pos[0]+"&"+player.pos[1]+"&"+player.deg;
        socket.emit("move_pj", emit_data);
        bytes_s += emit_data.length;
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
engine.load_textures = () => {
  let callback = ()=>{};
  
  const world = gx.world;
  const path_world = config.PATH.img_world + "/" + gx.world.bioma;
  const path_pj = config.PATH.img_pjs;
  
  // CARGAR TEXTURAS EN LA CACHÉ //
  const loader = new engine.texture_loader();
  loader.add("w_floor", mx.BImg(path_world+"/base"));
  for (let i = 1; i <= 1; i++) loader.add("w_tree_"+i, mx.BImg(path_world+"/tree_"+i));
  for (let i = 1; i <= 4; i++) loader.add("pj_hero_male_"+i, mx.BImg(path_pj+"/hero_male_"+i));
  loader.load(()=>callback());
  
  return {ready: n=>{callback=n}}
};

// COLISION //
engine.colision = (o1, o2, coord="N") => {
  let res = {x:false , y:false};
  
  if(/N|S/i.test(coord) &&
     o1.pos[0] + o1.size[0] >= o2.pos[0] && //derecha o1
     o1.pos[0] <= o2.pos[0] + o2.size[0]    //izquierda o1
  ) res.x = true;
  
  if(/W|E/i.test(coord) &&
     o1.pos[1] + o1.size[1] >= o2.pos[1] && //arriba o1
     o1.pos[1] <= (o2.pos[1] + o2.size[1])  //abajo o1
  ) res.y = true;
  
  res.t = res.x||res.y;
  return res;
}

// PINTAR FRAME //
engine.generate_frame = () => {
  if(config.TEST_ENABLE) fps_count.tickStart();
  let player = gx.player;
  let world = gx.world;
  
  // DIBUJAR TERRENO //
  if(!world.incanvas) {
    world.sprite.x = 0;
    world.sprite.y = 0;
    world.sprite.width = game_view.width;
    world.sprite.height = game_view.height;
    game.stage.addChild(world.sprite);
    world.incanvas = true
  }
  
  /*if (world_img.floor.ready) 
   for(let y = my; y < cvw(world.size[1]+world.pos[1]-2)+game_view.height/2; y+=cvw(world_img.floor.height)) {
     if(y >= -gx._paint_offset)
       for(let x = mx; x < cvw(world.size[0]+world.pos[0]-2)+game_view.width/2; x+=cvw(world_img.floor.width))
         if(x >= -gx._paint_offset) bgame.drawImage(world_img.floor, x, y, cvw(world_img.floor.width), cvw(world_img.floor.height));
   }*/
  
  // DIBUJAR JUGADOR //
  if(!player.incanvas) {
    game.stage.addChild(player.sprite);
    player.sprite.x = game_view.width/2-cvw(player.size[0])/2;
    player.sprite.y = game_view.height/2-cvw(player.size[1])/2;
    player.incanvas = true;
  }
  player.sprite.width = cvw(player.size[0]);
  player.sprite.height = cvw(player.size[1]);
  
  let mx = cvw(world.pos[0]) + game_view.width/2;
  let my = cvw(world.pos[1]) + game_view.height/2;
  world.sprite.tilePosition.x = mx;
  world.sprite.tilePosition.y = my;
  
  /*
  world.sprite.tilePosition.x = 
  world.sprite.tilePosition.y = cvw(world.pos[1]) + game_view.height/2;
  */
  //if (player.img.ready) fgame.drawImage(player.img, game_view.width/2-cvw(player.size[0])/2, game_view.height/2-cvw(player.size[1])/2, cvw(player.size[0]), cvw(player.size[1]));
 
  // DIBUJAR PLAYERS //
  for (let i in gx.pjs) if(gx.pjs[i]) {
    if(!gx.pjs[i].delete) {
      let pj = gx.pjs[i];
      
      if(!pj.incanvas) {
        game.stage.addChild(pj.sprite);
        game.stage.addChild(pj.sprite_status);
        pj.incanvas = true;
      }
      
      let pos = [
        cvw(pj.pos[0] + world.pos[0] - pj.size[0]/2)+game_view.width/2,
        cvw(pj.pos[1] + world.pos[1] - pj.size[1]/2)+game_view.height/2
      ];
    
      //si está dentro del rango de visión
      if(
        pos[0] >= -gx._paint_offset && 
        pos[0] <= game_view.width + gx._paint_offset &&
        pos[1] >= -gx._paint_offset && 
        pos[1] <= game_view.height + gx._paint_offset
      ) {
          //dibujar letrero del player
          pj.sprite_status.x = pos[0];
          pj.sprite_status.y = pos[1]-cvw(20);
          pj.sprite_status.width = cvw(pj.size[0]);
    
          //ubicar personaje
          pj.sprite.x = pos[0];
          pj.sprite.y = pos[1];
          pj.sprite.width = cvw(pj.size[0]);
          pj.sprite.height = cvw(pj.size[1]);
        }
    }
    else {
      
    }
  }
  
  // DIBUJAR OBJETOS //
  for(let i in gx.obj ) {
    let obj = gx.obj[i];
    
    if(!obj.incanvas) {
      game.stage.addChild(obj.sprite);
      obj.incanvas = true;
    }
    
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
    ) {
      if(!obj.sprite.visible) obj.sprite.visible = true;
      obj.sprite.x = pos[0];
      obj.sprite.y = pos[1];
      obj.sprite.width = cvw(obj.size[0]);
      obj.sprite.height = cvw(obj.size[1]);
    } else if(obj.sprite.visible) obj.sprite.visible = false;
  }
  
  if(config.TEST_ENABLE) {
    engine.debug(
      "player x: "+player.pos[0]+"\n"+
      "player y: "+player.pos[1]+"\n"+
      "mov x: "+player.mov[0]+"\n"+
      "mov y: "+player.mov[1]+"\n"+
      "world x: "+world.pos[0]+"\n"+
      "world y: "+world.pos[1]+"\n"+
      "joy emits sent: "+total_emit+" ("+gx._emitps+"emit/s)"+"\n"+
      "bytes enviados: "+Number(bytes_s/1024).toFixed(2)+"kb\n"+
      "bytes recibidos: "+Number(bytes_r/1024).toFixed(2)+"kb"
    );
    fps_count.tick();
  }
  if(!gx.zindexed) {
    game.stage.sortChildren();
    game.stage.sortableChildren = false;
  } else gx.zindexed = true;
}

// IMAGENES CACHÉ //
engine.texture_loader = class {
  constructor(){
    this.list = [];
  }
  add(name, url){
    this.list.push({name:name, url:url});
  }
  load(callback){
    return game.loader.add(this.list).load(callback)
  }
}

// CONVERSOR DE TILES //
engine.tile = n=> n * gx._tile_size;
engine.atile = n=> Math.floor(n/gx._tile_size);

// DIRECCION //
engine.direction = (x, y) => {
  let rad = Math.atan2(y,x);
  let deg = rad * (180/Math.PI);
  /*
      N
    W   E
      S
  */
  return 45<=deg && deg<135? "N" :
        135<=deg && deg<225? "W" :
        225<=deg && deg<315? "S" : "E" 
}

// DEBUG CANVAS //
engine.debug = txt=>{
  if(!gx.txt_debug) {
    gx.txt_debug = new PIXI.Text("", {
      fontSize: 10
    });
    gx.txt_debug.x = 5;
    gx.txt_debug.y = 5;
    gx.txt_debug.zIndex = 100;
    game.stage.addChild(gx.txt_debug);
  }
  gx.txt_debug.text = txt
}