//propiedades globales
var config = {
  
  APP_TOKEN: null,
  PACKAGE: app.GetPackageName(),
  VERSION: "0.0.1",
  
  URL: {
    server: "https://alvexia-server-franky96lol.dcoder.run",
    socket: "",
    auth: "{{config.URL.server}}"+"/auth",
    register: "{{config.URL.server}}"+"/register",
    wake_up: "{{config.URL.server}}"+"/wakeup"
  },
  PATH: {
    img: "./Img",
    sound: "./Snd",
    lib: "./Html",
    script: "./script",
    data: "/sdcard/Android/data/"+"{{config.PACKAGE}}"
  },
  USER: {
    token: null,
    name: null,
    password: null
  }
};

/*function _recursive(o){
  for(let i in o){
    if(typeof o[i] === "object"&& !Array.isArray(o[i])) _recursive(o[i]);
    else if(typeof o[i] === "string") {
      o[i] = o[i].replace(/\{\{.*?\}\}/, (new Function("return "+/\{\{(.*)\}\}/.exec(o[i])[1]))());
    }
  }
};_recursive(config);*/

//objeto creador de rutas
var PATH = {};
for(let i in config.PATH) 
  PATH[i] = u=>config.PATH[i]+"/"+u.replace(/^\//,"");
  
PATH.lib = (JSON.parse(app.ReadFile("./dependencies.json")))["dependencies"]
for(let i in PATH.lib)
  PATH.lib[i] = config.PATH.lib+"/"+PATH.lib[i];