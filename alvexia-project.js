const ext = {};
function OnStart(){
   //configuraciones
   app.SetOnShowKeyboard( OnKeyboard );
   app.SetOrientation( "Landscape" );
   app.SetScreenMode("Game");
   
   //elementos
   parent = app.CreateLayout( "Linear", "FillXY" );
   viewApp = app.CreateWebView( 1, 1 );
   viewApp.LoadUrl( "view-login.html" );
   
   //agregar
   parent.AddChild( viewApp );
   app.AddLayout( parent );
   
   ext.update_webview = function(){
       viewApp.SetTouchMode( false);
       viewApp.Execute("console.warn('ext.update_webview')")
       viewApp.SetTouchMode( true );
   }
   
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