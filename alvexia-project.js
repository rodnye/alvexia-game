const ext = {};
function OnStart(){
   //configuraciones
   app.SetOnShowKeyboard( OnKeyboard );
   app.SetOrientation( "Landscape" );
   app.SetScreenMode("Game");
   
   //elementos
   parent = app.CreateLayout( "Linear", "FillXY" );
   viewApp = app.CreateWebView( 1, 1);
   viewApp.LoadUrl( "view-login.html" );
   
   //agregar
   parent.AddChild( viewApp );
   app.AddLayout( parent );
   
   ext.reload_url = () => viewApp.Reload();
   
}


function OnKeyboard(show){
  if(show){
     var kHeight = app.GetKeyboardHeight()
     var width = app.GetScreenWidth();
     var height = app.GetDisplayHeight() - kHeight;
     viewApp.SetSize( width, height ,"px" )
  } else {
      viewApp.SetSize( 1, 1 );
  }
  
}