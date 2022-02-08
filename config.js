//propiedades globales
config = {
  
  APP_TOKEN: null,
  PACKAGE: app.GetPackageName(),
  VERSION: "0.0.1",
  
  URL: {
    server: "https://alvexia-server-franky96lol.dcoder.run",
    socket: "",
    auth: this.URL.server+"/auth",
    register: this.URL.server+"/register",
    wake_up: this.URL.server+"/wakeup"
  },
  PATH: {
    img: "./Img",
    sound: "./Snd",
    lib: "./Html",
    script: "./script",
    data: "/sdcard/Android/data/"+this.PACKAGE,
  },
  USER: {
    token: null,
    name: null,
    password: null
  }
};