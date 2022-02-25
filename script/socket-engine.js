total_emit = 0;
delay_emit = 0;
delay_emit_count = 0;
bytes_s = 0;
bytes_r = 0;

engine.socket = (socket)=> {

  // LOAD MAP //
  socket.on("load_map", d=> {
    console.log("ws load_map");
    bytes_r += JSON.stringify(d).length;
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
        objects : {
          "x_y": {
            name: 
            type:
            amount: 
            c_amount:
          }
        },
        npcs : {},
        pjs : {}
    } */
    let world = gx.world;
    world.size[0] = engine.tile(d.size.x);
    world.size[1] = engine.tile(d.size.y);
    world.pos[0] = d.pos.x;
    world.pos[1] = d.pos.y;
    world.biome = d.biome;
    alert(JSON.stringify(d))
    //cargar jugadores en el area
    for(let i in d.pjs) engine.world_add_player({username:i, pjstats:d.pjs[i]});
    
    //cargar objetos en memoria
    for( let i in d.objects) engine.world_add_obj(d.objects[i], i);
  });

  // AGREGAR NUEVO PLAYER EN LA CAMARA //
  socket.on("new_pj", d=> {
    bytes_r += JSON.stringify(d).length;
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
    bytes_r += JSON.stringify(d).length;
    console.info("player removed >> "+d)
    try {
      delete gx.pjs[d]}
    catch(e) {
      gx.pjs[d] = undefined
    }
  });

  // MOVER //
  socket.on("move_pj", d=> {
    bytes_r += JSON.stringify(d).length;
    /* formato de datos
       0 => username
       1 => posx
       2 => posy
       3 => angle
    */
    d = d.split("&");
    let name = d[0];
    let x = parseFloat(d[1]);
    let y = parseFloat(d[2]);
    let a = parseFloat(d[3]);
    let is_user = config.USER.name == name;
    let player = is_user? gx.player : gx.pjs[name];
    
    if(player.smooth) {
      player.smooth.stop();
      delete player.smooth;
    }
    let deltaX = x - player.pos[0];
    let deltaY = y - player.pos[1];
    player.mov[0] = deltaX / gx._smooth_mov_steps;
    player.mov[1] = deltaY / gx._smooth_mov_steps;
    
    let i = 0;
    player.smooth = mx.Animate(gx._smooth_mov_fps, ()=>{
      player.pos[0] += player.mov[0];
      player.pos[1] += player.mov[1];
      if(i >= gx._smooth_mov_steps) return player.smooth.stop();
      i++
    });
    player.smooth.start();
    
    player.deg = a;
    delay_emit -= Date.now();
    delay_emit_count = -delay_emit/1000;
    delay_emit = Date.now();
    if (is_user) gx.world.pos = [
      -x,
      -y
    ];
  })

}

engine.world_add_player = d => {
  console.info("player "+d.username+" added");
  //alert(JSON.stringify(d))
  let stats = d.pjstats;
  let is_user = config.USER.name==d.username;
  let size  = stats.size.split("_");
  if(!is_user) gx.pjs[d.username] = {};
  let pj = is_user?gx.player:gx.pjs[d.username];
    pj.pos = [stats.pos.x, stats.pos.y];
    pj.mov = [0,0];
    pj.deg = stats.pos.angle;
    pj.size = [engine.tile(parseFloat(size[0])), engine.tile(parseFloat(size[1]))];
    pj.texture = stats.skin;
    pj.speed = stats.status.speed;
  
  if(!pj.sprite) pj.sprite = new PIXI.Sprite(gx.src["pj_"+pj.texture].texture);
  if(!pj.sprite_status) pj.sprite_status = new PIXI.Text(d.username, {
    fontSize: 12,
    textAlign: "center"
  });
  //else player.sprite.setTexture(gx.src["pj_"+player.texture].texture)
}

engine.world_add_obj = (d, pos)=>{
  console.log("obj "+d.name+" added "+pos)
  //6alert(JSON.stringify(d))
  gx.obj[pos] = d;
  const obj = gx.obj[pos];
  pos = pos.split("_");
  let size = obj.size.split("_");
  obj.pos = [
    engine.tile(parseInt(pos[0])), 
    engine.tile(parseInt(pos[1]))
  ];
  obj.size = [
    engine.tile(parseFloat(size[0])),
    engine.tile(parseFloat(size[1]))
  ];
  obj.sprite = new PIXI.Sprite(gx.src["w_"+obj.name].texture);
  obj.sprite.width = cvw(obj.size[0]);
  obj.sprite.height = cvw(obj.size[1]);
  obj.sprite.zOrder = 2;
}