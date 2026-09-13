# fab

Pins that a method annotated @Fab / [Fab] / @fab emits a floating action button on the page wire (the `fabs` list on the page metadata) with the same icon, label and actionId in all three backends. The label is derived from the method name in Java (the annotation's `label` attribute is ignored by `PageButtonsBuilder.getFabs`, which uses `@Label` or the capitalised method name), so the method is named `add` everywhere and the ports declare the label "Add" explicitly — pinning that both spellings land on the same wire text. Worth pinning because the FAB is the standard page-level action affordance and its DTO shape already differs between the reference and the ports (Java carries `buttonStyle`, the ports carry `order`), a drift the corpus should make visible rather than leave buried in three suites.

## Known divergence

Both ports are expected to xfail against the Java golden on the fab entry itself: Java's FabDto always emits buttonStyle:"primary" (and an `id`, which normalisation drops as volatile), while the .NET FabDto and Python Fab have no buttonStyle member at all (they carry `order` instead, which normalisation drops at its 0 default). Additionally, both ports advertise the fab method as an explicit entry in the component's `actions` list ({id:"add"}), which may not match how the Java reference advertises page actions.
