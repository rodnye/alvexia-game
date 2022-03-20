// CARGAR DATOS LOCALES DEL MUNDO //
engine.load_textures = function(){
  let callback = ()=>{};
  
  const world = gx.world;
  const path_world = config.PATH.img_world + "/" + gx.world.bioma;
  const path_pj = config.PATH.img_pjs;
  
  // CARGAR TEXTURAS EN LA CACHÉ //
  const cache = new engine.cache();
  cache.add("w_floor", mx.BImg(path_world+"/base"));
  for (let i = 1; i <= 1; i++) cache.add("w_tree_"+i, mx.BImg(path_world+"/tree_"+i));
  for (let i = 1; i <= 1; i++) {
    let _path = path_pj+"/hero_male_"+i;
    cache.add("pj_hero_male_"+i, mx.BImg(_path+"/hero_male_"+i));
    for (let o = 1; o <= 3; o++) cache.add("pj_hero_male_"+i+"_m"+o, mx.BImg(_path+"/hero_male_"+i+"_m"+o));
  }
  cache.save(() => callback());
  
  return {ready: n=>{callback=n}}
};


// IMAGENES CACHÉ //
engine.cache = class {
  constructor(){
    this.list = [];
  }
  add(name, url){
    this.list.push({name:name, url:url});
  }
  save(callback){
    callback = callback || function(){};
    return game.loader.add(this.list).load(callback)
  }
}