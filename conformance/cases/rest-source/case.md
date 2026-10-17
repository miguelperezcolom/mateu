# rest-source

Pins the two ways a select takes its options from a REST endpoint: a field that declares the
request INLINE (`url` with a `${state.…}` placeholder, `itemsPath`, `valuePath`, `labelPath` — the
method travels as `GET`) and a field that names a catalogue source by `ref`.

The by-ref field must carry ONLY the name. What a surface declares wins over the catalogue entry,
so a surface that sent its annotation/decorator defaults (`method: GET`, `valuePath: value`,
`labelPath: label`) would override the entry's own mapping and every option would read an absent
key — Python did exactly that. The catalogue itself travels apart (`AppDto.restSources`) and is not
part of this case.
