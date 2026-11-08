# dialog-placement

**Pins (a second request: the `openNotes` action):** an action returning a placed `Dialog` — an
ADD fragment carrying the dialog with `headerTitle`, `top`/`left`, `draggable`, `resizable`,
`width`/`height`, `modeless` and `closeButtonOnHeader`, and its content IN the metadata (`content`).

Worth pinning because the ports could open a dialog (the `drawer` case pins the overlay mechanism)
but never set its placement members: a .NET or Python dialog could not be dragged, resized or
placed.
