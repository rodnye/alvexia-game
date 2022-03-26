total_emit = 0;
delay_emit = 0;
delay_emit_count = 0;
bytes_s = 0;
bytes_r = 0;

engine.socket = socket => {

  // cargar terreno
  socket.on("load_map", d => {
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
            t: textura
            d: 0 traspasable 
               1 destructiblr
               2 no traspasable
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
    
    //cargar jugadores en el area
    for(let i in d.pjs) engine.world_add_player({username:i, pjstats:d.pjs[i]});
    
    //cargar objetos en memoria
    for( let i in d.objects) engine.world_add_obj(d.objects[i], i);
    
    if(!gx._animation) gx._animation = engine.loop();
    gx._animation.start();
  });

  // añadir jugador
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
        skin,
        pos: {x,y,angle}
        size: "x_y"
      }
    };
    */
    engine.world_add_player(d);
  });

  // eliminar jugadores
  socket.on("del_pj", d=> {
    bytes_r += JSON.stringify(d).length;
    console.info("player removed >> "+d)
    if(gx.pjs[d]) gx.pjs[d].delete = true;
  });

  // mover jugadores
  socket.on("move_pj", function(d) {
    bytes_r += JSON.stringify(d).length;
    /* formato de datos
       @params 0 String(username)
       @params 1 String(posx)
       @params 2 String(posy)
       @params 3 String(angle)
    */
    d = d.split("&");
    let name = d[0];
    let x = parseFloat(d[1]);
    let y = parseFloat(d[2]);
    let a = parseFloat(d[3]);
    let is_user = config.USER.name == name;
    let pj = is_user? gx.player : gx.pjs[name];
    
    //suavisado de movimiento
    if(pj.smooth) {
      pj.smooth.stop();
      delete pj.smooth;
    }
    let deltaX = x - pj.pos.x;
    let deltaY = y - pj.pos.y;
    pj.mov.x = deltaX / gx._smooth_mov_steps;
    pj.mov.y = deltaY / gx._smooth_mov_steps;
    
    const pos = {
      x: pj.pos.x,
      y: pj.pos.y
    }
    pj.smooth = dom.animate(function(time){
      pj.pos.x = pos.x + pj.mov.x * gx._smooth_mov_steps * time;
      pj.pos.y = pos.y + pj.mov.y * gx._smooth_mov_steps * time;
    }, 500);
    
    pj.smooth.start();
    pj.smooth.finish(function(){
      pj.mov.x = 0;
      pj.mov.y = 0;
    })
    
    pj.deg = a;
    if (is_user) {
      //ubicar mundo
      gx.world.pos.x = -x;
      gx.world.pos.y = -y;
    }
  })
  
  // chat
  socket.on("load_chat", function(d){
    console.log("ws load_chat")
    console.log(d)
  })

}

//añadir jugador
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
    gx.pjs[d.username] = {status:{}};
    pj = gx.pjs[d.username];
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
    
    pj.status.hp = stats.status.c_hp;
    pj.status.level = stats.status.level;
    pj.status.xp = stats.status.c_xp;
    pj.status.mp = stats.status.c_mp;
    pj.status.hp_max = stats.status.hp;
    pj.status.xp_max = stats.status.xp;
    pj.status.mp_max = stats.status.mp;
    
    pj.mov_sprite = {
      texture: 0,
      time: 0,
      x: 0
    }
  
  if(!is_user){
    if(!pj.sprite) pj.sprite = new PIXI.Sprite(gx.src["pj_"+pj.texture].texture);
    if(!pj.sprite_status) pj.sprite_status = new PIXI.Text(d.username, {
      fontSize: 12,
      textAlign: "center"
    });
  }
  else {
    interface.player_status.level = pj.status.level;
    interface.player_status.bars = {
      hp: pj.status.$hp,
      mp: pj.status.$mp,
      xp: pj.status.$xp,
    };
    interface.player_status.name = config.USER.name;
    interface.player_status.img = mx.BImg(config.PATH.img_pjs+"/" + pj.texture + "/" + pj.texture + "_profile");
  }
}

//añadir objeto
engine.world_add_obj = (d, pos)=>{
  console.log("obj "+d.t+" added "+pos)
  if(gx.obj[pos]){
    game.stage.removeChild(gx.obj[pos].sprite);
    gx.obj[pos].sprite.destroy();
  }
  
  gx.obj[pos] = {
    name: d.t,
    ds: d.d
  };
  const obj = gx.obj[pos];
  pos = pos.split("_");
  pos = {
    x: pos[0]-0,
    y: pos[1]-0
  };
  let size = {
    x: 1,
    y: 1
  }
  
  // opciones por defecto //
  switch(obj.name) {
    
    // ARBOL 1 //
    case "tree_1": 
      size.y = 2;
      set_pos();
      obj.coll_min = {
        x: engine.tile(pos.x),
        y: engine.tile(pos.y + 1)
      };
      obj.coll_max = {
        x: engine.tile(1),
        y: engine.tile(1)
      };
      obj.ds = 3;
    break;
    
    // CÉSPED //
    case "lawn":
      size.y = 1.2;
      size.x = 1.2;
      set_pos();
      obj.ds = 0;
    break;
    
    default:
    
    // FLORES //
    if(/flw_[0-9]/.test(obj.name)) {
      size.y = 0.5;
      size.x = 0.5;
      set_pos("center");
      obj.ds = 0;
    }
  }
  
  function set_pos(type){
    obj.pos = {
      x: engine.tile(type!="center"?pos.x:pos.x+0.5-size.x/2), 
      y: engine.tile(type!="center"?pos.y:pos.y+0.5-size.y/2), 
      get z(){return (obj.pos.y + obj.size.y) / gx.world.size.y}
    }
    obj.size = {
      x: engine.tile(size.x),
      y: engine.tile(size.y)
    }
    if(d.pz!==undefined) {
      delete obj.pos.z;
      obj.pos.z = d.pz;
    }
  }
  
  obj.sprite = new PIXI.Sprite(gx.src["w_"+obj.name].texture);
  obj.sprite.width = cvw(obj.size.x);
  obj.sprite.height = cvw(obj.size.y);
  obj.sprite.zIndex = obj.pos.z;
  
}