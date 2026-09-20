package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * A genuinely NEW component type the platform does not ship (coherence-plan #14): the explicit,
 * relegated per-renderer escape hatch. Unlike a {@link ComponentRef} — which composes EXISTING
 * pieces and ports for free — a custom component is a new RENDERING, so it does NOT port for free:
 * each renderer must register a renderer for {@link #name()} (the frontend's {@code
 * registerCustomComponent}), and where none is provided it degrades to the {@code
 * <mateu-unsupported>} placeholder rather than breaking the screen.
 *
 * <p>The model only DECLARES it: a type name, a bag of {@code props} the renderer reads, and {@code
 * content} slots (ordinary components, so a custom shell can wrap known children). The wire carries
 * exactly that; the backends emit it identically (it is data), which is why parity here is cheap
 * even though the RENDERING is per-renderer.
 *
 * @param name the custom type a renderer registers against
 * @param props the properties the renderer reads
 * @param content slotted children (ordinary components)
 */
@Builder
public record CustomComponent(
    String id, String name, Map<String, Object> props, List<Component> content)
    implements Component {

  public CustomComponent {
    props = props == null ? Map.of() : Map.copyOf(props);
    content = content == null ? List.of() : List.copyOf(content);
  }

  public CustomComponent(String name) {
    this(null, name, Map.of(), List.of());
  }

  public CustomComponent(String name, Map<String, Object> props) {
    this(null, name, props, List.of());
  }
}
