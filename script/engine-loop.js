
// BUCLES DE ANIMACIONES //
engine.loop = function(){
  var world = gx.world;
  var player = gx.player;
  
  // MOSTRAR //
  if(gx.render) gx.render.stop()
  else gx.render = mx.Animate("pixi", engine.generate_frame);
  
  // LOGICA //
  const logic = mx.Animate(gx._engine_fps, ()=>{
    if(config.USER.is_connect){
      
      let p_cx = mx.round(player.pos.x + (player.mov.x>player.speed? player.speed:player.mov.x));
      let p_cy = mx.round(player.pos.y + (player.mov.y>player.speed? player.speed:player.mov.y));
      
      // COLISION BORDE DEL MAPA //
      //x
      if( p_cx > 0 ) {
        if (p_cx > world.size.x) p_cx = world.size.x
      } else p_cx = 0;
      //y
      if( p_cy > 0 ) {
        if (p_cy > world.size.y) p_cy = world.size.y
      } else p_cy = 0;
      
     //AUN EN DESARROLLO
     //esta colisionando con algo?
     if(gx._colision_enable) {
      let _player = {
        pos: {
          x: p_cx - (!gx._colision_center?player.size.x/2:0),
          y: p_cy - (!gx._colision_center?player.size.y/2:0),
        },
        size: gx._colision_center?{x:0,y:0}:player.size
      }
      
      for(let i in gx.obj_colision){
        let obj = gx.obj_colision[i];
        let colision = engine.collision(_player, obj);
        if(obj.type === 0 ){
          if(colision.x || (colision.t && gx._colision_axis)) {
            p_cx = player.pos.x;
          }
          if(colision.y || (colision.t && gx._colision_axis)) {
            p_cy = player.pos.y;
          }
        }
      }
     }
      
      //desplazar
      player.pos.x = p_cx;
      player.pos.y = p_cy;
      world.pos.x = -p_cx;
      world.pos.y = -p_cy;
      
    }
  });
  
  // EMITIR AL SERVIDOR //
  const emit = mx.Animate(gx._emitps, function(){
    if(player._emit_joy_enable){
        let emit_data = 
          player.pos.x.toFixed(2) + "&" + 
          player.pos.y.toFixed(2) + "&" + 
          player.deg.toFixed(2);
        socket.emit("move_pj", emit_data);
        bytes_s += emit_data.length;
        total_emit++;
    }
  });
  
  //iniciar
  return {
    start: function () {
      logic.start();
      emit.start();
      gx.render.start();
    },
    stop: function () {
      logic.stop();
      emit.stop();
      gx.render.stop();
    }
  }
}
