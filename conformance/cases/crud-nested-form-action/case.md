# crud-nested-form-action

The `crud-nested-form` record form's nested action `nested-form-action-supplier-verify`, sent the
way the form's own component sends it: to the ENTITY's server-side type (`PurchaseOrder`), with the
form's flattened state (`supplier-name: Globex`…).

What it pins: the method runs ON the nested object hydrated from that state (it greets "Globex",
not the initializer's "Acme"), and its answer is the message alone — no fragment, no navigation.
