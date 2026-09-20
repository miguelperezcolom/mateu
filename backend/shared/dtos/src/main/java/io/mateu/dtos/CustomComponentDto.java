package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/**
 * A genuinely NEW component type the platform does not ship (coherence-plan #14): the per-renderer
 * escape hatch. The wire carries a type {@link #name()} a renderer registers against and a bag of
 * {@link #props()} it reads; the slotted children ride on the {@code
 * ClientSideComponentDto.children} like any other component. Where a renderer provides no renderer
 * for the name it degrades to the {@code <mateu-unsupported>} placeholder — it does NOT port for
 * free, unlike a business component.
 */
public record CustomComponentDto(String name, Map<String, Object> props)
    implements ComponentMetadataDto {

  public CustomComponentDto {
    props = props != null ? Collections.unmodifiableMap(props) : Map.of();
  }
}
