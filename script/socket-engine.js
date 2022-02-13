total_emit = 0;
delay_emit = 0;
delay_emit_count = 0;
engine.socket = (socket)=> {

  // LOAD MAP //
  socket.on("load_map", d=> {
    console.log("ws load_map ><")
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
    let world = gx.world;
    world.size[0] = engine.tile(d.size.x);
    world.size[1] = engine.tile(d.size.y);
    world.pos[0] = d.pos.x;
    world.pos[1] = d.pos.y;
    world.biome = d.biome;
    
    //cargar jugadores en el area
    for(let i in d.pjs) engine.world_add_player({username:i, pjstats:d.pjs[i]});
  });

  // AGREGAR NUEVO PLAYER EN LA CAMARA //
  socket.on("new_pj", d=> {
    //console.log("ws new_pj>> username:"+d.username)
    /*username,
      pjstats: {
        nickname,
        status: {
            level,
            xp,
            c_xp,
            hp,
            mp,
            c_hp,
            c_mp,
        }
        pos: {x,y,angle}
        size: {x,y}
      }
    };
    */
    engine.world_add_player(d);
  });

  // ACTUALIZAR PLAYER EN LA CAMARA //
  socket.on("del_pj", d=> {
    console.log("ws del_pj>> "+d)
    try {
      delete gx.pjs[d]}
    catch(e) {
      gx.pjs[d] = undefined
    }
  });

  // MOVER //
  socket.on("move_pj", d=> {
    let is_user = config.USER.name == d.username;
    let player = is_user? gx.player : gx.pjs[d.username];
    player.pos = [d.pos.x, d.pos.y];
    player.deg = d.pos.angle;
    delay_emit -= Date.now();
    delay_emit_count = -delay_emit/1000;
    delay_emit = Date.now();
    dg("ws move_pj")
    if (is_user) gx.world.pos = [
      -d.pos.x,
      -d.pos.y
    ];
  })

}

engine.world_add_player = d=> {
  let stats = d.pjstats;
  let is_user = config.USER.name==d.username;
  if(!is_user) gx.pjs[d.username] = {};
  let player = is_user?gx.player:gx.pjs[d.username];
    player.pos = [stats.pos.x, stats.pos.y];
    player.deg = stats.pos.angle;
    player.size = [stats.size.x, stats.size.y];
    player.texture = stats.skin;
    player.speed = stats.status.speed;
  
  player.img = new Image();
  player.img.onload = ()=> {player.img.ready = true};
  player.img.src = mx.BImg(config.PATH.img_pjs+"/"+player.texture);//+player.texture);
}