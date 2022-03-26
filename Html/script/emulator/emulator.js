// sockets emulador
const socket_connection = {};


//cliente
Emulator.Client = class {
  constructor(client){
    this.eventHandler = {};
    
    this.is = {};
    this.is.connect = false;
    this.is.client = Emulator.generate_id(); 
  }

  //conectar
  connect(url){
    this.url = url;
    if(socket_connection[this.url]) {
      this.is.connect = true;
      window.setTimeout(() => this.emit("connection", {
        client: this.is.client,
        eventHandler: this.eventHandler
      }), 2500);
      console.log("connect socket emulator>>" + url);
    }
    else console.error("failed connect socket emulator>>"+url)
    return this;
  }
  
  //asignar eventos
  on(event, action){
    if(!this.eventHandler[event]) this.eventHandler[event] = [];
    this.eventHandler[event].push(action);
  }
  
  //emitir
  emit(event, data){
    const serv = socket_connection[this.url];
    if(serv){
      let events = serv.eventHandler[event];
      if (events) for(let action of events) action(Emulator.parse_data(data), this.is.client);
    }
    else alert(raw.parse("HTTP_ERROR"));
  }
};

//servidor
Emulator.Server = class {
  constructor(){
    this.clients = {};
    this.eventHandler = {};
    this.url = null;
  }
  
  listen(url){
    this.url = url;
    const This = this;
    socket_connection[url] = {
      eventHandler: this.eventHandler
    }
    console.info("server socket emulator running>>"+url);
    
    this.on("connection", function(client){
      This.clients[client.client] = client;
    })
  }
  
  //eventos
  on(event, action){
    if(!this.eventHandler[event]) this.eventHandler[event] = [];
    this.eventHandler[event].push(action);
  }
  
  //usuarios
  of(client_id){
    const reply = {};
    const This = this;
    const client = this.clients[client_id];
    
    return {
      emit: function(event, data){
        const events = client.eventHandler[event];
        if(events) for(let action of events) {
          action(Emulator.parse_data(data))
        }
      },
      
      disconnect: function(){
        if(client) {
          This.of(client_id).emit("disconnect", null);
          delete This.clients[client_id];
        }
      }
    };
  }
  
  //broadcast
  broadcast(event, data){
    const This = this;
    for(let client_id in This.clients) This.of(client_id).emit(event, data);
  }
  
}

//convertir data
Emulator.parse_data = function(data){
  return data;
};

//generar id
Emulator.generate_id = function(){
  let possible = "abcdefghijklmnopqrstuvwxyz";
      possible += possible.toUpperCase();
      for(let i = 0; i < 10; i++) possible += i;
  
  let result = "";
  for(let i = 0; i < 6; i ++) result += possible.charAt(
    Math.round(Math.random()*(possible.length-1))
  );
  
  return result;
}