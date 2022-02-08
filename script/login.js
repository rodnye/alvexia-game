
app.Script(config.PATH.script+"/global.js")
app.Script(config.PATH.lib+"/ajax-send.min.js");

function OnStart() {
  
  tab_login = dom.get("#open-login-btn");
  tab_register = dom.get("#open-register-btn");

  //elementos del TAB login
  aut_form = dom.get("#login-view");
  aut_input_user = dom.get("#login-input-user");
  aut_input_pass = dom.get("#login-input-pass");
  aut_submit = dom.get("#login-submit");

  //elementos del TAB register
  reg_form = dom.get("#register-view");
  reg_input_user = dom.get("#register-input-user");
  reg_input_email = dom.get("#register-input-email");
  reg_input_pass = dom.get("#register-input-pass");
  reg_input_rpass = dom.get("#register-input-rpass");
  reg_submit = dom.get("#register-submit");

  TAB.login.init();
  TAB.register.init();
}


//***functiones para los TABs***//
TAB = {
  login: {},
  register: {}
};

//TABs init
TAB.login.init = ()=> {
  //login init
  TAB.login.open();
  tab_login.onclick = TAB.login.open;
  aut_submit.innerHTML = "Acceder";
  aut_submit.onclick = e=> {
    e.preventDefault();
    TAB.login.submit({});
  }
  aut_input_user.dom.set("placeholder", "Usuario...");
  aut_input_user.dom.set("value", (mx.LoadText("login-user") || ""));
  aut_input_pass.dom.set("placeholder", "Contraseña...");
  aut_input_pass.dom.set("value", (mx.LoadText("login-pass") || ""));
};
TAB.register.init = ()=> {
  //register init
  tab_register.onclick = TAB.register.open;
  reg_submit.innerHTML = "Crear Cuenta";
  reg_submit.onclick = e=> {
    e.preventDefault();
    TAB.register.submit({});
  }
  reg_input_user.dom.set("placeholder", "Usuario...");
  reg_input_email.dom.set("placeholder", "Correo electrónico...");
  reg_input_pass.dom.set("placeholder", "Contraseña...");
  reg_input_rpass.dom.set("placeholder", "Repetir contraseña...");
}

//TABs acciones
TAB.login.open = ()=> {
  //open auth
  TAB.disable();
  tab_login.dom.style("background:#ffffff");
  aut_form.dom.style("display:flex");
}
TAB.register.open = ()=> {
  //open register
  TAB.disable();
  tab_register.dom.style("background:#ffffff");
  reg_form.dom.style("display:flex")
}

//deseleccionar TABs
TAB.disable = ()=>{
  tab_login.dom.style("background:#eeeeee");
  tab_register.dom.style("background:#eeeeee");
  aut_form.dom.style("display:none");
  reg_form.dom.style("display:none");
}

//**funciones para comunicacion con el servidor**//
//submit REGISTER
TAB.register.submit = ({
    _user = reg_input_user.value,
    _email = reg_input_email.value,
    _pass = reg_input_pass.value,
    _rpass = reg_input_rpass.value
}) => {
  mx.ShowProgress();
  //http
  server.post(config.URL.register, {
    username: _user,
    email: _email,
    password: _pass,
    rpassword: _rpass,
    app_token: config.APP_TOKEN
  },
   (_data, _status)=>{
      if (_status === 200) {
        if(_data.status) {
           mx.SaveText("login-user", _user);
           mx.SaveText("login-pass", _pass);
        }
        mx.Alert(_data.data);
      } else mx.Alert("Upps! Hubo un error, no se pudo establecer la conexión :(\n\nHTTP ERROR: "+(_status?_status: "NOT_INTERNET"));
      mx.HideProgress();
    })
}

//submit AUTH
TAB.login.submit = ({
  _user = aut_input_user.value,
  _pass = aut_input_pass.value
})=>{
  mx.ShowProgress("Estableciendo conexión...")
  //http
  server.post(config.URL.auth,
    {
      username: _user,
      password: _pass,
      app_token: config.APP_TOKEN
    },
    function(_data, _status) {
      app.HideProgress();
      if (_status === 200) {
        if (_data.status) {
          mx.ShowProgress("Conectandose...");
          var auth_query = "token="+_data.message+"&username="+_user;
          app.SetData("auth-query", auth_query);
          mx.SaveText("login-user", _user);
          mx.SaveText("login-pass", _pass);
          mx.open("./view-game.html");
        } else mx.Alert(_data.data)
      } else mx.Alert("Upps! Hubo un error, no se pudo establecer la conexión :(\n\nHTTP ERROR: "+(_status?_status: "NOT_INTERNET"));
    })
}