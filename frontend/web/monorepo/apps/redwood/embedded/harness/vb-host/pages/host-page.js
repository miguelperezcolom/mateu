// the HOST page's own module: VB exposes it as $functions in this page. The component's view must
// neither need it nor see it instead of its own.
define([], () => class HostPageModule {
  hostLabel(note) { return note + ' (host page)'; }
});
