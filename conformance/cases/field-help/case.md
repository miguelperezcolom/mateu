# field-help

**Pins:** a reflected field's help text and slider bounds, ported to .NET (`[Help]`,
`[SliderMin]`, `[SliderMax]`) and Python (`Help()`, `SliderMin()`, `SliderMax()` markers) in
3.0-alpha.426: `@Help` travels as the field's `description`; slider bounds travel as
`sliderMin`/`sliderMax` and make the field a `slider`.

Worth pinning because the ports had no help text at all — a field's explanation, which the
renderers also read as the control's accessible description, could not be declared.
