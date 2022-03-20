// estado del jugador
interface.player_status = {
  set img(url) {
    let img = dom.get("div.profile-status-box > img");
    img.src = url;
  },
  
  set level(n) {
    let level = dom.get("div.level-status");
    level.innerText = Number(n) + "";
  },
  
  set name(s) {
    let name = dom.get("div.name-status");
    name.innerText = s;
  },
  
  set bars(o) {
    let hp = dom.getId("hp-bar");
    let mp = dom.getId("mp-bar");
    let xp = dom.getId("xp-bar");
    if(o.hp) hp.style.width = o.hp+"%";
    if(o.mp) hp.style.width = o.mp+"%";
    if(o.xp) hp.style.width = o.xp+"%";
  },
};

// chat ingame
interface.chat = class {
  
  constructor(el){
    this.container = el;
  }
  
  send(txt){
    const cont = dom.create("div");
    const bubble = dom.create("div");
    const text = dom.create("div");
    
    cont.dom.set("class", "cont-bubble-chay-my");
    bubble.dom.set("class", "bubble-chat");
    text.innerText = txt;
    
    bubble.dom.add(text);
    cont.dom.add(bubble);
    this.container.dom.add(cont);
    this.scroll();
  }
  
  receive(txt, nick){
    const cont = dom.create("div");
    const bubble = dom.create("div");
    const name = dom.create("h4");
    const text = dom.create("div");
    
    cont.dom.set("class", "cont-bubble-chay-pj");
    bubble.dom.set("class", "bubble-chat");
    name.innerText = nick;
    text.innerText = txt;
    
    bubble.dom.add([name,text]);
    cont.dom.add(bubble);
    this.container.dom.add(cont);
    this.scroll();
  }
  
  scroll(){
    this.container.scrollTop = this.container.scrollHeight;
  }
};


//minimapa
interface.map = {
  reload: () => {},
}

//burbuja de testeo
interface.debug = class {
  constructor(){
    let btn_float = dom.create("div");
    let container = dom.create("div");
    let float_box = dom.create("div");
    let icon = dom.create("i");
        icon.dom.set("class","fa fa-cubes");
        icon.style.color = "white";
        
    let visible = false;
    
    container.dom.style({
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      position: "fixed",
      top: "0",
      left: "0"
    });
    
    btn_float.dom.style({
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    });
    
    float_box.dom.style({
      width: "180px",
      height: "100px",
      background: "rgba(0,0,0,0.5)",
      overflow: "auto",
      flexDirection: "column",
      display: "none",
      alignItems: "center"
    });
    
    btn_float.ontouchstart = e => {
      btn_float.dragging = true;
      btn_float.clicked = true;
      setTimeout(()=>{btn_float.clicked = false}, 200);
    };
    btn_float.ontouchmove = e => {
      if(btn_float.dragging) container.dom.style({
        top: e.changedTouches[0].pageY+"px",
        left: e.changedTouches[0].pageX+"px",
      })
      btn_float.style.border = "solid white 3px";
    }
    btn_float.ontouchend = e => {
      btn_float.dragging = false;
      btn_float.style.border = "none";
      if(btn_float.clicked) {
        float_box.style.display = !visible?"flex":"none";
        visible = !visible;
      }
    }
    
    
    btn_float.dom.add(icon);
    container.dom.add([btn_float, float_box]);
    dom.get("body").dom.add(container);
    this.float_box = float_box;
  }
  
  /* BUTTON */
  add_button(name, action) {
    let button = dom.create("button");
    button.dom.on("click", action);
    button.innerText = name;
    button.dom.style({
      background: "black",
      borderRadius: "100px",
      color: "white",
      padding: "2px",
      marginBottom: "2px",
      border: "none",
      width: "80%",
    })
    this.float_box.dom.add(button);
    return button;
  }
  
  /* TOGGLE */
  add_toggle(name, on=true, action) {
    let icon = dom.create("i");
    update_toggle(on);
    let button = this.add_button(name, ()=>{
      update_toggle(!on);
      action(on)
    });
    
    button.dom.style({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    });
    button.insertBefore(icon, button.childNodes[0]);
    
    function update_toggle(b){
      on = b;
      icon.dom.set("class", "fa fa-toggle-"+(on?"on":"off"))
    }
    
    return button;
  }
  
  /* AÑADIR ELEMENTO PERSONALIZADO */
  add(element){
    this.float_box.dom.add(element);
  }
}