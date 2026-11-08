# inline-form-action

A SECOND request to the `inline-form` fixture (`request.json`): the nested object's toolbar action
`nested-form-action-supplier-verify`, with the supplier's fields edited in the FLATTENED keys the
inline fields bind to (`supplier-name: Globex`) and the non-inline `delivery` sent as a nested map.

The server must rehydrate the nested object from those keys and run the method ON IT: the answer
is the toast `Verified Globex` — the edited value, not the field initializer (`Acme`). A server
that ignored the flattened keys, or ran the method on a fresh nested object, answers `Verified
Acme`; one that does not know the `nested-form-action-<field>-<method>` scheme refuses the call.
