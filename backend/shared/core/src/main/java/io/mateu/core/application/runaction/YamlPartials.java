package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.InputStream;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * A definition with its YAML partials inlined as SOURCE — each {@code {type: Partial, ref: …}} node
 * replaced by the partial file's own nodes, recursively — before anything else reads it.
 *
 * <p>The access keys ({@code eyesOnly:}, {@code readOnlyUnless:}, {@code disabledUnless:}, {@code
 * access:}) and {@code ${i18n.…}} expressions of a partial are then seen by the passes that apply
 * them to the page ({@code YamlAccess}, the translation pass) and by the decision to re-derive the
 * page per request. Built as components first ({@link PartialRegistry}), a partial had already lost
 * them — the YAML mapper ignores keys it does not know — so a section guarded by {@code eyesOnly:}
 * reached every caller when it lived in a partial instead of inline, and its {@code ${i18n.x}}
 * stayed raw.
 *
 * <p>A ref naming a class (a {@code ComponentTreeSupplier}), a partial registered from code, or a
 * ref that resolves to no file is left as it is: {@link PartialExpander} builds it per request (a
 * class's access is its annotations) or logs the miss. In a list a partial's components are
 * spliced; in a single-component slot one component replaces it and several are stacked in a {@code
 * VerticalLayout} — what {@link PartialExpander} does with built components.
 */
@Slf4j
final class YamlPartials {

  private static final int MAX_DEPTH = 20;
  private static final ObjectMapper MAPPER = YamlUidlMapperFactory.create();

  private YamlPartials() {}

  /** The tree with its YAML partials inlined; the very same instance when it mentions none. */
  static JsonNode compose(JsonNode root) {
    if (root == null || !mentionsYamlPartial(root)) {
      return root;
    }
    return composeNode(root.deepCopy(), new ArrayDeque<>());
  }

  private static boolean mentionsYamlPartial(JsonNode node) {
    if (isYamlPartial(node)) {
      return true;
    }
    if (node.isContainerNode()) {
      for (var child : node) {
        if (mentionsYamlPartial(child)) {
          return true;
        }
      }
    }
    return false;
  }

  private static boolean isYamlPartial(JsonNode node) {
    if (node == null || !node.isObject() || !"Partial".equals(node.path("type").asText(null))) {
      return false;
    }
    var ref = node.path("ref").asText("");
    return !ref.isBlank() && !isClassRef(ref);
  }

  private static boolean isClassRef(String ref) {
    if (ref.indexOf('.') < 0 || PartialRegistry.isYamlPath(ref)) {
      return false;
    }
    try {
      Class.forName(ref, false, Thread.currentThread().getContextClassLoader());
      return true;
    } catch (ClassNotFoundException | LinkageError e) {
      return false;
    }
  }

  private static JsonNode composeNode(JsonNode node, Deque<String> chain) {
    if (node instanceof ArrayNode array) {
      var out = array.arrayNode();
      for (var child : array) {
        var items = isYamlPartial(child) ? itemsOf(child.path("ref").asText(), chain) : null;
        if (items != null) {
          items.forEach(out::add);
        } else {
          out.add(composeNode(child, chain));
        }
      }
      return out;
    }
    if (node instanceof ObjectNode object) {
      var names = new ArrayList<String>();
      object.fieldNames().forEachRemaining(names::add);
      for (var name : names) {
        var value = object.get(name);
        var items = isYamlPartial(value) ? itemsOf(value.path("ref").asText(), chain) : null;
        if (items == null) {
          object.set(name, composeNode(value, chain));
        } else if (items.isEmpty()) {
          object.remove(name);
        } else if (items.size() == 1) {
          object.set(name, items.get(0));
        } else {
          var stack = object.objectNode();
          stack.put("type", "VerticalLayout");
          var content = stack.putArray("content");
          items.forEach(content::add);
          object.set(name, stack);
        }
      }
      return object;
    }
    return node;
  }

  /**
   * The composed nodes a YAML partial stands for; null when no file backs it (left for the
   * expander, which logs it); empty for a cycle or a nesting that is too deep.
   */
  private static List<JsonNode> itemsOf(String ref, Deque<String> chain) {
    if (chain.contains(ref)) {
      var path = new ArrayList<>(chain);
      Collections.reverse(path);
      path.add(ref);
      log.error("Partial '{}' includes itself: {}", ref, String.join(" -> ", path));
      return List.of();
    }
    if (chain.size() >= MAX_DEPTH) {
      log.error("Partial nesting deeper than {} at '{}'; stopping", MAX_DEPTH, ref);
      return List.of();
    }
    var tree = fileOf(ref);
    if (tree == null) {
      return null;
    }
    chain.push(ref);
    try {
      var composed = composeNode(tree, chain);
      var items = new ArrayList<JsonNode>();
      if (composed.has("content") && composed.get("content").isArray()) {
        composed.get("content").forEach(items::add);
      } else {
        items.add(composed);
      }
      return items;
    } finally {
      chain.pop();
    }
  }

  /** The partial's file as a source tree, field types applied; null when there is none. */
  private static JsonNode fileOf(String ref) {
    var cl =
        io.mateu.core.infra.dev.DevSpecs.classLoader(
            Thread.currentThread().getContextClassLoader());
    for (var candidate : PartialRegistry.candidatePaths(ref)) {
      if (cl.getResource(candidate) == null) {
        continue;
      }
      try (InputStream in = cl.getResourceAsStream(candidate)) {
        var root = FieldTypeRegistry.resolveWithAppTypes(MAPPER.readTree(in));
        return root == null || root.isNull() ? null : root;
      } catch (Exception e) {
        log.error("Could not read partial '{}' from classpath:{}", ref, candidate, e);
        return null;
      }
    }
    return null;
  }
}
