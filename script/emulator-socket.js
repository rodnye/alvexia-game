//Servidor Socket emulado
app.Script(config.PATH.script+"/emulator.js")

const pjs = {};

Emulator._init = function(){
  const serv = new Emulator.Server();
        serv.listen(config.URL.socket);
        
  serv.on("connection", function(d, id){
    const client = serv.of(id);
    pjs[config.USER.name] = {
        nickname: config.USER.name,
        status: {
            level: 1,
            speed: 3,
            xp: 50,
            c_xp: 50,
            hp: 500,
            mp: 500,
            c_hp: 300,
            c_mp: 300,
        },
        skin: "hero_male_1",
        pos: {
          x:50,
          y:50,
          angle:0
        },
        size: "1_1"
    }
    
    client.emit("connect", null);
    
    client.emit("load_map", {
      map: "Bosque",
      pos: {x:50, y:50},
      size: {x:50, y:50},
      biome: "nature",
      objects: {},
      pjs: pjs
    })
    
  });
}