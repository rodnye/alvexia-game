//propiedades globales
config = {
      APP_TOKEN: "La_6362kwjsbd&uwueb277291",
      PACKAGE: app.GetPackageName(),
      VERSION: "0.0.1",

      URL: {
        server: "https://jewel-bottlenose-volleyball.glitch.me",
        socket: "{{URL.server}}",
        auth: "{{URL.server}}" + "/auth/login",
        register: "{{URL.server}}" + "/auth/register",
        wake_up: "{{URL.server}}" + "/wakeup"
      },
      PATH: {
        img: "./Img",
        img_pjs: "{{PATH.img}}"+"/pjs",
        img_world: "{{PATH.img}}"+"/world",
        sound: "./Snd",
        lib: "./Html",
        script: "./script",
        data: "/sdcard/Android/data/"+"{{PACKAGE}}",
      },
      TEST_ENABLE: true
}

//function parseadora de string
function pp(c){
  let isObj = (v)=>(typeof v == "object" && !Array.isArray(v) && typeof v!=null);
  for(let i in c){
    if(isObj(c[i])) pp(c[i]);
    else if(typeof c[i] == "string") {
      let syntax = /\{\{(.*)?\}\}/;
      let value = ()=>{
        if(syntax.test(c[i])) return eval("config."+syntax.exec(c[i])[1]);
        else return "";
      }
      c[i] = c[i].replace(syntax, value())
    }
  }
} pp(config);