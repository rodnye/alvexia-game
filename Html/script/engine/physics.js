// COLISION //
engine.collision = function(oo1, oo2){
  let res = {x:false , y:false};
  
  let o1 = {
    pos: oo1.coll_min !== undefined? oo1.coll_min : oo1.pos,
    size: oo1.coll_max!== undefined? oo1.coll_max : oo1.size,
  }
  let o2 = {
    pos: oo2.coll_min !== undefined? oo2.coll_min : oo2.pos,
    size: oo2.coll_max!== undefined? oo2.coll_max : oo2.size,
  }
  
  if(
     o1.pos.x + o1.size.x >= o2.pos.x && //derecha o1
     o1.pos.x <= o2.pos.x + o2.size.x && //izquierda o1
     o1.pos.y + o1.size.y >= o2.pos.y && //arriba o1
     o1.pos.y <= o2.pos.y + o2.size.y && //abajo o1
     (oo2.ds === undefined || oo2.ds !== 0)
  ) {
     if(m(o1.pos.x - o2.pos.x) > m(o1.pos.y - o2.pos.y)) res.x = true;
     else if(m(o1.pos.x - o2.pos.x) < m(o1.pos.y - o2.pos.y)) res.y = true;
     else {
       res.x = true;
       res.y = true;
     };
  }
  
  res.t = res.x || res.y;
  return res;
  
  function m(n){return n<0?-n:n}
}


// CONVERSOR DE TILES //
engine.tile = function(n){return n * gx._tile_size};
engine.atile = function(n){Math.floor(n / gx._tile_size)};

// DIRECCION //
engine.direction = function(x, y){
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