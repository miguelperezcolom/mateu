package io.mateu.dtos;

/**
 * One entry of the app's business-component catalogue on the wire (coherence-plan #13): a name and
 * the composition it stands for, already mapped to the wire. It rides the APP metadata (like the
 * REST source catalogue) so a {@code ComponentRef} can be resolved by the renderer — or the
 * client-side expander — with no backend.
 *
 * @param name what a reference names
 * @param component the resolved composition
 */
public record ComponentEntryDto(String name, ComponentDto component) {}
