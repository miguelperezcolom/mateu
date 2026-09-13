# toc

Pins the tri-state @Toc page marker in its forced-on form: a class annotated @Toc with five stacked @Section fields must emit toc=true on the page metadata, so every renderer knows to show the sticky right-hand sections index instead of re-deriving the auto heuristic (>4 sections, no zones/fold) per port. The five sections also pin that the index has real entries to enumerate — section titles on the wire in declaration order. Worth pinning because toc is a nullable tri-state (absent = auto), so a port that drops the flag silently degrades to heuristic behaviour and the difference only shows up as a missing sidebar in one renderer.

## Known divergence

Python is expected to diverge structurally on the section shape, exactly as documented for simple-form: Java wraps each @Section in a Card and hangs the rows off metadata/content, while Python nests the fields directly under children — and this fixture has five sections, so the divergence appears five times over. The toc=true page flag itself is emitted by all three ports (Java PageDto.toc, .NET PageMetadataDto.Toc, Python PageMetadata.toc), so the flag should match even where the section tree does not.
