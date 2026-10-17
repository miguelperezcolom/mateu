# field-hints

**Pins:** the input hints of a fluent `FormField`, ported with it to .NET and Python in
3.0-alpha.426: `placeholder`, `description` (help text), `autofocus`, `step` and the slider
bounds `sliderMin`/`sliderMax`.

The fixture sets `colspan` and `optionsColumns` to 1 explicitly: a Java fluent `FormField` built
without them sends 0 (the record's default), while the ports' fluent field always sends 1 — a
pre-existing difference of the fluent field that this case is not about.
