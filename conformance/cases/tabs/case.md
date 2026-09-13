# tabs

Pins the tab-strip wire shape: consecutive fields annotated @Tab("General")/@Tab("Details") must come back as one TabLayout component carrying two Tab children labeled "General" and "Details", each wrapping a FormLayout with its two fields — with groupRelationship "alternative" (dev-declared tabs are always alternative groups). This is worth pinning because all three backends implement the grouping rule independently (Java FormLayoutBuilder, .NET ReflectionMapper.TabLayout, Python mapper.tab_layout, the latter two explicitly claiming to mirror the Java pair.first().open() rule), so any drift in labels, grouping or the layout discriminator silently breaks every renderer's tab strip for that port.

## Known divergence

Both ports mark the FIRST tab active=true on first render (ReflectionMapper.TabLayout's activeIndex = Math.Max(0, first Open) and mapper.tab_layout's active_index = 0 when no Tab declares open), while Java's TabDto.active stays false for every tab unless one declares @Tab(open=true) — the frontend defaults to index 0 itself. Normalisation drops the false but keeps the ports' true, so .NET and Python will likely xfail on that member; the ports may also differ from Java in the wrapper nesting around the tab strip (section-card structure), as already documented for simple-form.
