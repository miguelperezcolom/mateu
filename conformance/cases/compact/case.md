# compact

Pins the high-density mode marker: a class annotated @Compact / [Compact] / @compact must carry a compact style on the page component of the wire, so a renderer knows to condense the screen. In Java the style is the full Lumo density preset from StyleConstants.COMPACT (ending in the `--mateu-compact:1` marker the frontend detects) and the form layout's auto-responsive column width shrinks to 7em; the marker is what every renderer keys off, so losing it silently loses density for every consumer of a port. The case is two plain string fields — everything interesting is at page level.

## Known divergence

Both ports will diverge from the golden on the page style and the form layout: Java emits the FULL StyleConstants.COMPACT Lumo preset (a ~15-variable CSS blob, with a leading ';' from PageMetadataExtractor.getStyle, ending in the `--mateu-compact:1;` marker) as the page style AND shrinks FormLayoutDto.columnWidth to "7em" (FormLayoutBuilder), while .NET (ReflectionMapper.cs ~line 373) and Python (mapper.py ~line 769) emit only the bare marker string "--mateu-compact:1" as the page style and never set a compact column width. Semantically equivalent for a marker-detecting renderer, structurally different on the wire — expect xfail on both ports until the ports adopt the full preset (or the reference reduces to the marker).
