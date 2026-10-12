package io.mateu.core.application.export;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * Resolves, at BUILD time, the two references a shipped (specs-mode) definition may carry that the
 * browser cannot: a {@code type: Partial} (its file lives in {@code specs/ui/partials/}, which a
 * bundle does not ship) and a {@code type: ComponentRef} (the business component catalogue, {@code
 * specs/ui/components.yaml}). A specsOnly bundle showed "Unknown metadata type Partial" and
 * "Unknown business component" where the served app rendered both.
 *
 * <p>Same rules as the server ({@code PartialExpander}, {@code ComponentRegistry}): a partial of
 * several components is SPLICED into the list holding it (a single slot gets them stacked in a
 * VerticalLayout), partials compose, a cycle or an unknown file is logged and left as it was (the
 * browser then shows its placeholder, as before). A shipped definition is frozen anyway, exactly
 * like the field types already resolved at the same step.
 */
@Slf4j
final class DefinitionInliner {

  private static final int MAX_DEPTH = 20;
  private static final String COMPONENTS = "specs/ui/components.yaml";

  private final ClassLoader cl;
  private final YAMLMapper mapper = new YAMLMapper();
  private Map<String, JsonNode> components;

  DefinitionInliner(ClassLoader cl) {
    this.cl = cl;
  }

  /** The definition with its partials and business-component references inlined. */
  JsonNode inline(JsonNode definition) {
    return rewrite(definition, new ArrayDeque<>());
  }

  private JsonNode rewrite(JsonNode node, Deque<String> chain) {
    if (node instanceof ArrayNode array) {
      var out = JsonNodeFactory.instance.arrayNode();
      for (var element : array) {
        var expanded = expand(element, chain);
        if (expanded == null) {
          out.add(rewrite(element, chain));
        } else {
          expanded.forEach(out::add);
        }
      }
      return out;
    }
    if (node instanceof ObjectNode object) {
      var single = expand(object, chain);
      if (single != null) {
        return single.size() == 1 ? single.get(0) : stack(single);
      }
      var out = JsonNodeFactory.instance.objectNode();
      object.fields().forEachRemaining(f -> out.set(f.getKey(), slot(f.getValue(), chain)));
      return out;
    }
    return node;
  }

  /** A field value: a reference standing alone in a single slot gets its own expansion. */
  private JsonNode slot(JsonNode value, Deque<String> chain) {
    if (value instanceof ObjectNode object) {
      var expanded = expand(object, chain);
      if (expanded != null) {
        return expanded.size() == 1 ? expanded.get(0) : stack(expanded);
      }
    }
    return rewrite(value, chain);
  }

  /** What a reference stands for (already rewritten), or null when the node is not one. */
  private ArrayNode expand(JsonNode node, Deque<String> chain) {
    if (!(node instanceof ObjectNode object)) {
      return null;
    }
    var type = object.path("type").asText("");
    var ref = object.path("ref").asText("");
    if (ref.isBlank()) {
      return null;
    }
    if ("ComponentRef".equals(type)) {
      var component = components().get(ref);
      if (component == null) {
        log.warn(
            "bundle: business component '{}' is not in {} — left as a reference", ref, COMPONENTS);
        return null;
      }
      var out = JsonNodeFactory.instance.arrayNode();
      out.add(rewrite(component, chain));
      return out;
    }
    if (!"Partial".equals(type)) {
      return null;
    }
    if (chain.contains(ref) || chain.size() >= MAX_DEPTH) {
      log.error("bundle: partial '{}' includes itself or nests too deep; left as it was", ref);
      return null;
    }
    var root = partial(ref);
    if (root == null) {
      return null;
    }
    chain.push(ref);
    try {
      var out = JsonNodeFactory.instance.arrayNode();
      var content = root.has("content") && !root.has("type") ? root.get("content") : null;
      if (content != null && content.isArray()) {
        for (var child : content) {
          var nested = expand(child, chain);
          if (nested == null) {
            out.add(rewrite(child, chain));
          } else {
            nested.forEach(out::add);
          }
        }
      } else {
        out.add(rewrite(root, chain));
      }
      return out;
    } finally {
      chain.pop();
    }
  }

  private JsonNode partial(String ref) {
    if (ref.indexOf('.') >= 0 && !ref.endsWith(".yaml") && !ref.endsWith(".yml")) {
      return null; // a class partial: rendered by a server, not inlinable here
    }
    var path =
        ref.endsWith(".yaml") || ref.endsWith(".yml") ? ref : "specs/ui/partials/" + ref + ".yaml";
    try (var is = cl.getResourceAsStream(path)) {
      if (is == null) {
        log.warn("bundle: no partial '{}' at classpath:{} — left as a reference", ref, path);
        return null;
      }
      return mapper.readTree(is);
    } catch (Exception e) {
      log.warn("bundle: could not read partial '{}': {}", ref, e.toString());
      return null;
    }
  }

  private Map<String, JsonNode> components() {
    if (components == null) {
      components = new HashMap<>();
      try (var is = cl.getResourceAsStream(COMPONENTS)) {
        if (is != null) {
          var root = mapper.readTree(is);
          var list = root != null && root.has("components") ? root.get("components") : root;
          if (list != null && list.isArray()) {
            for (var entry : list) {
              var name = entry.path("name").asText("");
              if (!name.isBlank() && entry.path("component").isObject()) {
                components.put(name, entry.get("component"));
              }
            }
          }
        }
      } catch (Exception e) {
        log.warn("bundle: could not read {}: {}", COMPONENTS, e.toString());
      }
    }
    return components;
  }

  private static ObjectNode stack(ArrayNode children) {
    var layout = JsonNodeFactory.instance.objectNode();
    layout.put("type", "VerticalLayout");
    layout.set("content", children);
    return layout;
  }
}
