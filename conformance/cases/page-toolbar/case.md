# page-toolbar

**Pins:** a page header toolbar action, ported to .NET (`[Toolbar]`) and Python (`@toolbar`) in
3.0-alpha.426: a toolbar method becomes a `Button` in the page's `toolbar` (label = the declared
one, else the humanized method name; `buttonStyle` when declared) and an advertised action
(`validationRequired`).

Worth pinning because the ports had no toolbar declaration at all (Python hard-coded an empty
`toolbar`), so a port page could not put an action in its header.

One toolbar method only: the JVM does not promise the order of a class's declared methods, so two
of them could swap places in the advertised actions between runs of the reference.
