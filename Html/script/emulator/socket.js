//Servidor Socket emulado
app.Script(config.PATH.script+"/emulator/emulator.js")

const pjs = {};
const obc = {}

Emulator._init = function() {
  const serv = new Emulator.Server();
  let client;
  serv.listen(config.URL.socket);

  serv.on("connection", function(d, id) {
    client = serv.of(id);
    
    //emular jugador
    Emulator.new_AI({name: config.USER.name});
    
    //emular personajes
    for(let i = 0; i<5; i++)
      Emulator.new_AI({
        name: "BOT-"+(i+1),
        pos: {
          x: Math.random()*500,
          y: Math.random()*500,
          angle:0,
        }
      }).automove(100,100)
    
    //emular cesped
    for(let i = 0; i < 90; i++)
      Emulator.new_El({
        name: "flw_3",
        x: 3,
        y: i,
        z: 0
      })
    
    client.emit("connect", null);

    client.emit("load_map", {
      map: "Bosque",
      pos: {
        x: 100, y: 100
      },
      size: {
        x: 50, y: 50
      },
      biome: "nature",
      objects: obc,
      pjs: pjs
    });
    

  });

//crear AI
Emulator.new_AI = function(obj) {
  obj = un(obj, {});
 
  const result = {
    nickname: obj.name,
    status: {
      level: un(obj.level,1),
      speed: un(obj.speed,6),
      xp: 50,
      c_xp: 50,
      hp: 500,
      mp: 500,
      c_hp: 300,
      c_mp: 300,
    },
    skin: un(obj.texture,"hero_male_1"),
    pos: un(obj.pos, {x: 50,y: 50,angle: 0}),
    size: un(obj.size, "1_1"),
  };
  pjs[obj.name] = result;
  
  let callback = function(x,y){
    result.pos.x += x;
    result.pos.y += y;
    result.pos.x = result.pos.x<0?0:(result.pos.x>gx.world.size.x?gx.world.size.x:result.pos.x);
    result.pos.y = result.pos.y<0?0:(result.pos.y>gx.world.size.y?gx.world.size.y:result.pos.y);
    let deg = Math.atan2(y,x) * (180/Math.PI);
        deg = -deg<0? 360-deg: -deg;
      
      client.emit("move_pj", 
        result.nickname+"&"+
        result.pos.x+"&"+
        result.pos.y+"&"+
        deg
      )
  };
  
  return {
    data: result,
    onmove: function(fn){
      callback = fn;
    },
    automove: function(xmax, ymax) {
      window.setInterval(function(){
        callback(
          Math.random()*(xmax*2)-xmax,
          Math.random()*(ymax*2)-ymax
        );
      }, Math.random()*2000+1000);
      return this;
    }
  };
  
  function un(n, v){
    return n!==undefined?n:v;
  }
}

//crear Elemento
Emulator.new_El = function(obj) {
  obc[obj.x+"_"+obj.y] = {
    t: obj.name,
    pz: obj.z
  };
}

}
