/* chat */
engine.chat = {
  tab: {},
  new_tab: function(name, fa){
    const This = this;
    const cont_tab_chat = dom.get("#cont-btn-view-chat");
    const cont_view_chat = dom.get("#cont-view-chat");
    
    const tab_chat = dom.create("div"),
          icon_tab_chat = dom.create("i");
          icon_tab_chat.dom.set("class", "fa "+ fa);
          tab_chat.dom.set("class", "btn-view-chat");
          tab_chat.dom.add(icon_tab_chat);
          tab_chat.dom.on("touch", function(e){
            This.open_tab(name);
          });
    
    const view_chat = dom.create("div");
          view_chat.dom.set("class", "view-chat");
    This.tab[name] = {
      button: tab_chat,
      view: view_chat,
      icon: icon_tab_chat
    }
          
    cont_tab_chat.dom.add(tab_chat);
    cont_view_chat.dom.add(view_chat);
    This.close_tabs();
    return view_chat;
  },
  
  open_tab: function(name){
    this.close_tabs();
    let tab = this.tab[name];
    tab.view.style.display = "flex";
    dom.animate(function(t){
      var tono = 150*t + 100;
      tab.icon.style.color = "rgb("+tono+","+tono+","+tono+")";
    }, 300).start();
  },
  
  close_tabs: function(){
    for(let i in this.tab) {
      let tab = this.tab[i];
      tab.view.style.display = "none";
      tab.icon.style.color = "rgb(100,100,100)";
    }
  },
  
  //abrir/cerrar chat drawer
  open: function(){
    const This = this,
          duration = 500,
          porc = This._drawer_bottom / This._drawer_bottom_abs,
          distance = This._drawer_bottom,
          isOpen = this.isOpen;
    
    const anima = dom.animate(function(time){
      This._drawer_bottom = This._drawer_bottom_abs * (isOpen?time:1-time);
      This._drawer.style.bottom = -This._drawer_bottom + "px";
    }, duration);
    
    if(This.isOpening) {
      This.isOpening.stop();
      This.isOpening = false;
    }
    This.isOpening = anima.start();
    anima.finish(function(){
      This.isOpening = false;
      This.isOpen = !This.isOpen;
    })
  }
  
}

/* Inicializar chat */
engine.chat_init = function(){
  const chat = engine.chat;
        chat._drawer_bottom = screen.height * 0.4;
        chat._drawer_bottom_abs = screen.height * 0.4;
        chat._drawer = dom.get("#drawer-lay-chat");
        chat._drawer.style.bottom = -chat._drawer_bottom+"px";
        chat.isOpen = false;
        
        
  const global_view_chat = chat.new_tab("global", "fa-users");
  const pv_view_chat = chat.new_tab("private", "fa-user");
  const action_view_chat = chat.new_tab("action", "fa-bullhorn");
  const spiner_view_chat = chat.new_tab("spiner", "fa-spinner fa-spin")
  
  const btn_drawer = dom.get("#drawer-btn-chat");
        btn_drawer.dom.on("touch", function(){chat.open()});
 
  chat.open_tab("global");
  const action_global_sms = dom.create("div"),
        input = dom.create("input"),
        btn_send = dom.create("button"),
        global_sms = new interface.chat(dom.create("div"));
        
  global_sms.container.dom.style({
    flexGrow: "1",
  });
  
  global_sms.send("lalala");
  global_sms.receive("lolo");
  global_view_chat.dom.style({
    flexDirection: "column"
  });
  
  action_global_sms.dom.add([input, btn_send]);
  global_view_chat.dom.add([global_sms.container, action_global_sms]);
}