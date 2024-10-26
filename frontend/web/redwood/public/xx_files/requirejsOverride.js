// Tap into require() to also call applicationBootstrapComplete
// This is loaded by injectResources.js so that the require() call in demo.js
// files will automatically call BusyContext.applicationBootstrapComplete()
let _origRequire = window.require;
let bootstrapResolved = false;
function resolveBootstrap() {
  if (!bootstrapResolved) {
    _origRequire(['ojs/ojcontext'], function(Context) {
      let bc = Context.getPageContext().getBusyContext();
      bc.applicationBootstrapComplete();
      bootstrapResolved = true;
      console.log('RequireJS override: applicationBootstrapComplete');
      bc.whenReady().then(function() {
        console.log('RequireJS override: BusyContext ready');
      });
    });
  }
}
window.require = function(modules, callback, onError) {
  if (typeof callback === 'function') {
    return _origRequire(modules, function() {
      callback.apply(null, arguments);
      resolveBootstrap();
    }, onError);
  }
  resolveBootstrap();
  return _origRequire.apply(null, arguments);
};

Object.keys(_origRequire).forEach(function(prop) { window.require[prop] = _origRequire[prop] });
