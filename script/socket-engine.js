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
    world.size.x = engine.tile(d.size.x);
    world.size.y = engine.tile(d.size.y);
    world.pos.x = d.pos.x;
    world.pos.y = d.pos.y;
    world.biome = d.biome;
    //console.log(d)
    
    //cargar jugadores en el area
    for(let i in d.pjs) engine.world_add_player({username:i, pjstats:d.pjs[i]});
    
    //cargar objetos en memoria
    for( let i in d.objects) engine.world_add_obj(d.objects[i], i);
  });

  // AGREGAR NUEVO PLAYER EN LA CAMARA //
  socket.on("new_pj", d=> {
    bytes_r += JSON.stringify(d).replace(/\"/g, "").length;
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
    if(gx.pjs[d]) gx.pjs[d].delete = true;
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
    let pj = is_user? gx.player : gx.pjs[name];
    
    if(pj.smooth) {
      pj.smooth.stop();
      delete pj.smooth;
    }
    let deltaX = x - pj.pos.x;
    let deltaY = y - pj.pos.y;
    pj.mov.x = deltaX / gx._smooth_mov_steps;
    pj.mov.y = deltaY / gx._smooth_mov_steps;
    
    let i = 0;
    pj.smooth = mx.Animate(gx._smooth_mov_fps, ()=>{
      pj.pos.x += pj.mov.x;
      pj.pos.y += pj.mov.y;
      if(i >= gx._smooth_mov_steps) return pj.smooth.stop();
      i++
    });
    pj.smooth.start();
    
    pj.deg = a;
    if (is_user) {
      gx.world.pos.x = -x;
      gx.world.pos.y = -y;
    }
  })

}

engine.world_add_player = d => {
  console.info("player "+d.username+" added");
  let stats = d.pjstats;
  let is_user = config.USER.name==d.username;
  let size  = stats.size.split("_");
  let pj = is_user?gx.player:gx.pjs[d.username];
  
  if(!is_user) {
    if(pj) {
      game.stage.removeChild(pj.sprite);
      game.stage.removeChild(pj.sprite_status);
      pj.sprite.destroy();
      pj.sprite_status.destroy();
    }
    gx.pjs[d.username] = {};
  }
    pj.size = {
      x: engine.tile(parseFloat(size[0])), 
      y: engine.tile(parseFloat(size[1]))
    };
    pj.pos = {
      x: stats.pos.x,
      y: stats.pos.y,
      get z(){return (pj.pos.y + pj.size.y) / gx.world.size.y}
    };
    pj.mov = {x:0, y:0};
    pj.deg = stats.pos.angle;
    pj.texture = stats.skin;
    pj.speed = stats.status.speed;
  
  if(!is_user){
    if(!pj.sprite) pj.sprite = new PIXI.Sprite(gx.src["pj_"+pj.texture].texture);
    if(!pj.sprite_status) pj.sprite_status = new PIXI.Text(d.username, {
      fontSize: 12,
      textAlign: "center"
    });
  }
}

engine.world_add_obj = (d, pos)=>{
  console.log("obj "+d.name+" added "+pos)
  if(gx.obj[pos]){
    game.stage.removeChild(gx.obj[pos].sprite);
    gx.obj[pos].sprite.destroy();
  }
  
  gx.obj[pos] = d;
  const obj = gx.obj[pos];
  let size = obj.size.split("_");
      pos = pos.split("_");
  
  
  obj.size = {
    x: engine.tile(size[0]-0),
    y: engine.tile(size[1]-0)
  };
  obj.pos = {
    x: engine.tile(pos[0]-0), 
    y: engine.tile(pos[1] - size[1] +1),
    get z(){return (obj.pos.y + obj.size.y) / gx.world.size.y}
  };
  
  obj.sprite = new PIXI.Sprite(gx.src["w_"+obj.name].texture);
  obj.sprite.width = cvw(obj.size.x);
  obj.sprite.height = cvw(obj.size.y);
  obj.sprite.zIndex = obj.pos.z;
}