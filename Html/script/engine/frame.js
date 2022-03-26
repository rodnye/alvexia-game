
// GENERAR ESCENA //
engine.generate_frame = function() {
  if (config.TEST_ENABLE) fps_count.tickStart();
  let player = gx.player;
  let world = gx.world;




  // DIBUJAR TERRENO //
  if (!world.incanvas) {
    world.sprite.x = 0;
    world.sprite.y = 0;
    world.sprite.width = game_view.width;
    world.sprite.height = game_view.height;
    game.stage.addChild(world.sprite);
    world.incanvas = true
  }
  
  
  

  // DIBUJAR JUGADOR //
  if (!player.incanvas) {
    game.stage.addChild(player.sprite);
    player.incanvas = true;
  }
    //animación movimiento
    if (player.mov.x || player.mov.y) {
      player.mov_sprite.time++;
      let mvl = Math.round(Math.max(Math.abs(player.mov.x), Math.abs(player.mov.y))*2);
      if (!(player.mov_sprite.time%(15-mvl))) player.mov_sprite.texture++;
      if (player.mov_sprite.texture > 3) player.mov_sprite.texture = 1;
      if (player.deg > 90 && player.deg <= 270) {
        player.sprite.scale.x = -1;
        player.mov_sprite.x = cvw(player.size.x);
      } else {
        player.sprite.scale.x = 1;
        player.mov_sprite.x = 0;
      }
    } else {
      player.mov_sprite.texture = 0;
      player.mov_sprite.time = 0;
    }
    //cambiar textura de animacion
    if (player.mov_sprite.texture) player.sprite.texture = gx.src["pj_"+player.texture+"_m"+player.mov_sprite.texture].texture;
    else player.sprite.texture = gx.src["pj_"+player.texture].texture;

    //actualizar tamaño del player
    player.sprite.width = cvw(player.size.x);
    player.sprite.height = cvw(player.size.y);

  let mx = cvw(world.pos.x) + game_view.width/2; //posicion mundo x
  let my = cvw(world.pos.y) + game_view.height/2; //posicion mundo y
  let pX = 0; //player paint x
  let pY = 0; //player paint y
  
  //camara
  let maxValueCamX = -cvw(world.size.x) + game_view.width;
  let maxValueCamY = -cvw(world.size.y) + game_view.height;

  //detener seguimiento de cámara en límite X
  if (mx >= 0) {
    mx = 0;
    pX -= cvw(world.pos.x);
  } else if (mx <= maxValueCamX) {
    mx = maxValueCamX;
    pX -= cvw(world.pos.x) - mx;
  } else pX = game_view.width/2;

  //detener seguimiento de cámara en límite Y
  if (my >= 0) {
    my = 0;
    pY -= cvw(world.pos.y);
  } else if (my <= maxValueCamY) {
    my = maxValueCamY;
    pY -= cvw(world.pos.y) - my;
  } else pY = game_view.height/2;

  // UBICAR MUNDO Y JUGADOR //
  player.sprite.x = pX + player.mov_sprite.x - cvw(player.size.x)/2;
  player.sprite.y = pY - cvw(player.size.y)/2;
  player.sprite.zIndex = player.pos.z+1;
  world.sprite.tilePosition.x = mx;
  world.sprite.tilePosition.y = my;



  // DIBUJAR OTROS PLAYERS //
  for (let i in gx.pjs) if (gx.pjs[i]) {
    let pj = gx.pjs[i];
    if (!gx.pjs[i].delete) {

      if (!pj.incanvas) {
        game.stage.addChild(pj.sprite);
        game.stage.addChild(pj.sprite_status);
        pj.incanvas = true;
      }

      let pos = {
        x: cvw(pj.pos.x - pj.size.x/2) + mx,
        y: cvw(pj.pos.y - pj.size.y/2) + my
      };

      //solo dentro del rango de visión
      if (
        pos.x >= -gx._paint_offset &&
        pos.x <= game_view.width + gx._paint_offset &&
        pos.y >= -gx._paint_offset &&
        pos.y <= game_view.height + gx._paint_offset
      ) {
        //dibujar letrero del player
        pj.sprite_status.visible = true;
        pj.sprite_status.x = pos.x;
        pj.sprite_status.y = pos.y - cvw(20);
        pj.sprite_status.zIndex = 5;
        pj.sprite_status.width = cvw(pj.size.x);

        //animación de movimiento
        if (pj.mov.x || pj.mov.y) {
          pj.mov_sprite.time++;
          let mvl = Math.round(Math.max(Math.abs(pj.mov.x), Math.abs(pj.mov.y))*2);
          if (!(pj.mov_sprite.time%(15-mvl))) pj.mov_sprite.texture++;
          if (pj.mov_sprite.texture > 3) pj.mov_sprite.texture = 1;
          if (pj.deg > 90 && pj.deg <= 270) {
            pj.sprite.scale.x = -1;
            pj.mov_sprite.x = cvw(pj.size.x);
          } else {
            pj.sprite.scale.x = 1;
            pj.mov_sprite.x = 0;
          }
        } else {
          pj.mov_sprite.texture = 0;
          pj.mov_sprite.time = 0;
        }
        if (pj.mov_sprite.texture) pj.sprite.texture = gx.src["pj_"+pj.texture+"_m"+pj.mov_sprite.texture].texture;
        else pj.sprite.texture = gx.src["pj_"+pj.texture].texture;

        //ubicar personaje
        pj.sprite.visible = true;
        pj.sprite.x = pos.x + pj.mov_sprite.x;
        pj.sprite.y = pos.y;
        pj.sprite.zIndex = pj.pos.z + 1;
        pj.sprite.width = cvw(pj.size.x);
        pj.sprite.height = cvw(pj.size.y);
      } else {
        pj.sprite.visible = false;
        pj.sprite_status.visible = false;
      }
    } else {
      //si se va eliminar jugador
      game.stage.removeChild(pj.sprite);
      game.stage.removeChild(pj.sprite_status);
      pj.sprite.destroy();
      try {
        delete gx.pjs[i]} catch(e) {
        gx.pjs[i] = undefined;
      }
    }
  }


  // DIBUJAR OBJETOS //
  for (let i in gx.obj) {
    let obj = gx.obj[i];
    if (!obj.delete) {
      if (!obj.incanvas) {
        game.stage.addChild(obj.sprite);
        obj.incanvas = true;
      }

      let pos = {
        x: cvw(obj.pos.x) + mx,
        y: cvw(obj.pos.y) + my
      };

      //solo dentro del rango de visión
      if (
        pos.x >= -gx._paint_offset &&
        pos.x <= game_view.width + gx._paint_offset &&
        pos.y >= -gx._paint_offset &&
        pos.y <= game_view.height + gx._paint_offset
      ) {
        obj.sprite.visible = true;
        obj.sprite.x = pos.x;
        obj.sprite.y = pos.y;
        obj.sprite.zIndex = obj.pos.z + 1;
        obj.sprite.width = cvw(obj.size.x);
        obj.sprite.height = cvw(obj.size.y);
        gx.obj_colision[i] = obj;
      } else if (obj.sprite.visible) {
        obj.sprite.visible = false;
        delete gx.obj_colision[i];
      }
    } else {
      //si se va eliminar objeto
      game.stage.removeChild(obj.sprite);
      obj.sprite.destroy();
      delete gx.obj[i];
    }
  }

  if (config.TEST_ENABLE) {
    engine.debug(
      "player=> x:" + player.pos.x + "/y:" + player.pos.y + "/z:"+player.pos.z.toFixed(2)+"\n"+
      "mov=> x:" + player.mov.x.toFixed(2) + "/y:" + player.mov.y.toFixed(2) + "/a: "+player.deg.toFixed(2) + "\n"+
      "emits enviados: " + total_emit + " ("+gx._emitps+"emit/s)"+"\n"+
      "bytes enviados: " + Number(bytes_s/1024).toFixed(2)+"KB\n"+
      "bytes recibidos: " + Number(bytes_r/1024).toFixed(2)+"KB"+"\n"+
      "total de bytes: " + Number((bytes_r+bytes_s)/1024/1024).toFixed(2)+"MB"
    );
    fps_count.tick();
  }
  game.stage.sortChildren();
}


// DEBUG CANVAS //
engine.debug = async function(txt){
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