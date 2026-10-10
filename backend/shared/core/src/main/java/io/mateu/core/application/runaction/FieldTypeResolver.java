package io.mateu.core.application.runaction;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.uidl.data.FieldTypeCatalog;
import io.mateu.uidl.data.FieldTypeEntry;
import java.util.HashSet;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

/**
 * Resolves {@code fieldType: <id>} references in an AUTHORED component tree (a parsed YAML/JSON
 * definition), before it is turned into components.
 *
 * <p>The rule — identical in the browser expander ({@code fieldTypes.ts}) and in the .NET and
 * Python loaders, because a definition must render the same wherever it is expanded:
 *
 * <ol>
 *   <li>any OBJECT carrying a string {@code fieldType} is a reference (a {@code FormField}, a
 *       {@code GridColumn}, a filter — whatever names one);
 *   <li>every attribute the referenced type declares is copied onto it UNLESS the object already
 *       declares that attribute with a non-null value — the type supplies defaults, the field's own
 *       attributes win (a semantic annotation overridden locally);
 *   <li>the {@code fieldType} key is removed, so the wire never carries it;
 *   <li>an unknown type is WARNed about and the object rendered as declared — never a failed page.
 * </ol>
 *
 * <p>Works on JSON trees rather than records on purpose: a {@code FormField} and a {@code
 * GridColumn} share most of these keys, and resolving before deserialisation is what lets one
 * vocabulary serve both — and the browser, which has no records at all.
 */
@Slf4j
public final class FieldTypeResolver {

  /** The authored key a field or a column references a type by. */
  public static final String KEY = "fieldType";

  private static final ObjectMapper MAPPER =
      new ObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_EMPTY);

  private FieldTypeResolver() {}

  /**
   * A copy of {@code tree} with every {@code fieldType} reference resolved against {@code types}.
   */
  public static JsonNode resolve(JsonNode tree, FieldTypeCatalog types) {
    if (tree == null || !mentionsAFieldType(tree)) {
      return tree; // the overwhelmingly common case: nothing to do, nothing copied
    }
    var copy = tree.deepCopy();
    resolveInPlace(copy, types == null ? FieldTypeCatalog.empty() : types, new HashSet<>());
    return copy;
  }

  /** The attributes a type supplies, as authored keys (absent ones omitted). */
  public static ObjectNode attributesOf(FieldTypeEntry type) {
    ObjectNode node = MAPPER.valueToTree(type);
    node.remove("id");
    return node;
  }

  static boolean mentionsAFieldType(JsonNode node) {
    if (node.isObject()) {
      if (node.hasNonNull(KEY)) {
        return true;
      }
      for (var child : node) {
        if (mentionsAFieldType(child)) {
          return true;
        }
      }
    } else if (node.isArray()) {
      for (var child : node) {
        if (mentionsAFieldType(child)) {
          return true;
        }
      }
    }
    return false;
  }

  private static void resolveInPlace(JsonNode node, FieldTypeCatalog types, Set<String> warned) {
    if (node instanceof ObjectNode object) {
      var reference = object.get(KEY);
      if (reference != null && reference.isTextual()) {
        apply(object, reference.asText(), types, warned);
      }
      object.forEach(child -> resolveInPlace(child, types, warned));
    } else if (node != null && node.isArray()) {
      node.forEach(child -> resolveInPlace(child, types, warned));
    }
  }

  private static void apply(
      ObjectNode field, String typeId, FieldTypeCatalog types, Set<String> warned) {
    field.remove(KEY);
    var type = types.get(typeId);
    if (type.isEmpty()) {
      if (warned.add(typeId)) {
        log.warn(
            "Unknown field type '{}' (on '{}') — rendered as declared. Declare it in"
                + " specs/ui/types.yaml or a FieldTypeCatalogSupplier.",
            typeId,
            field.path("id").asText(""));
      }
      return;
    }
    attributesOf(type.get())
        .fields()
        .forEachRemaining(
            attribute -> {
              var own = field.get(attribute.getKey());
              if (own == null || own.isNull()) {
                field.set(attribute.getKey(), attribute.getValue().deepCopy());
              }
            });
  }
}
