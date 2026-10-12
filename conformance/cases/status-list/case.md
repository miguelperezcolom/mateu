# status-list

Pins the StatusList front-office component on the wire: a fluent component whose metadata (type "StatusList") carries labelled rows, each StatusItem with id/icon/title/description plus either a status chip (status + statusColor) or a small action button (actionLabel + actionId, dispatched with {_item: id}). The two rows deliberately exercise both right-hand variants, which are what the front-office screens (incidents lists, check-in side-effects checklists) depend on. All three backends declare it through their ComponentTreeSupplier idiom, so the case also pins how a fluent component tree reaches the wire in each port.

## Window title

The view declares a title, so the increment carries a `SetWindowTitle` command although a component tree is no reflected page (no Page wrapper in any of the three servers). Without it the browser tab kept the previous page's title and screen readers heard no navigation. (The envelope divergence this section used to predict was closed in the ports: their allow-lists are empty.)
