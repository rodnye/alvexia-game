//motor del juego
app.Script(config.PATH.script + "/engine-frame.js");
app.Script(config.PATH.script + "/engine-physics.js");
app.Script(config.PATH.script + "/engine-textures.js");
app.Script(config.PATH.script + "/engine-loop.js");
app.Script(config.PATH.script + "/engine-interface.js");
app.Script(config.PATH.script + "/engine-chat.js");
app.Script(config.PATH.script + "/engine-socket.js");

//elementos del juego
gx = {
  player: null,
  world: null,
  pjs: {},
  obj: {},
  cache: PIXI.utils.TextureCache,
  obj_colision: {},
  src: null,
  
  /* atributos editables */
  _paint_offset: 200, //espacio de dibujado fuera de la pantalla
  _tile_size: 100, //tamaño de cuadrícula
  _screen_reference: 620*2, //ancho de pantalla de referencia para escala
  _emitps: 5,  //emit por segundo
  _engine_fps: 30,  //cuadros por segundo
  _smooth_mov_steps: 30, //cantidad de pasos en el suavisado

  _colision_enable: true,
  _colision_axis: true,
  _colision_center: true,
};

//inicio del juego
engine.init = function () {
  let callback = ()=>{};
  gx.src = game.loader.resources;
  cvw = function (n){return screen.width * (n * 100 / gx._screen_reference) / 100};
  gx._paint_offset = cvw(gx._paint_offset);
  
  // PLAYER //
  gx.player = {
    pos: {
      x: 0, 
      y: 0,
      get z(){return (gx.player.pos.y + gx.player.size.y) / gx.world.size.y}
    },
    speed: 0,
    deg: 0,
    mov: {x:0, y:0},
    size: {x:0, y:0},
    status: {
      level: 0,
      hp: 0,
      mp: 0,
      xp: 0,
      hp_max: 0,
      mp_max: 0,
      xp_max: 0,
      // % escala
      get $hp(){return gx.player.status.hp / gx.player.status.hp_max * 100},
      get $mp(){return gx.player.status.mp / gx.player.status.mp_max * 100},
      get $xp(){return gx.player.status.xp / gx.player.status.xp_max * 100}
    },
    texture: null,
    mov_sprite: {
      texture: 0,
      time: 1,
      x: 0
    },
    
    _emit_joy_enable: false,
  };
  
  // WORLD //
  gx.world = {
    size: {x:0, y:0},
    pos: {x:0, y:0},
    bioma: "nature",
    textures: [],
    sprite: null
  };
  
  engine.chat_init();
  engine.load_textures().ready(()=>{
    gx.player.sprite = new PIXI.Sprite(gx.src["pj_hero_male_1"].texture);
    gx.world.sprite = new PIXI.TilingSprite(gx.src["w_floor"].texture);
   
    callback();
  });
  return {ready(n){callback = n}}
}


// joystick
engine.joystick = function(d){
    var player = gx.player;
    player._emit_joy_enable = d.x!=0 && d.y!=0;
    player.mov.x = d.x/100 * player.speed;
    player.mov.y = -d.y/100 * player.speed;
    let deg = Math.atan2(gx.player.mov.y, gx.player.mov.x) * (180/Math.PI);
    player.deg = -deg<0? 360-deg: -deg;
}