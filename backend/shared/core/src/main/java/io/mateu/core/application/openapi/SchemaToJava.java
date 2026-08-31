package io.mateu.core.application.openapi;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * OpenAPI schemas as Java types, and nested object schemas as records.
 *
 * <p>Records rather than classes with setters because the response of a query is a value: there is
 * nothing to mutate, and a record says so in one line. Nested objects become their own records so a
 * shape like {@code data[].customer.name} is navigable in the IDE instead of being a map lookup
 * that compiles whatever you type.
 *
 * <p>The generated records are deliberately NOT closed to unknown fields at runtime — the contract
 * is a lower bound, so a payload carrying more than the UI reads is normal, not an error.
 */
final class SchemaToJava {

  private SchemaToJava() {}

  /** The Java type of a scalar (or array) schema. */
  static String javaType(JsonNode schema) {
    if (schema == null) {
      return "String";
    }
    var type = text(schema, "type");
    var format = text(schema, "format");
    return switch (type) {
      case "integer" -> "int64".equals(format) ? "Long" : "Integer";
      case "number" -> "double".equals(format) ? "Double" : "java.math.BigDecimal";
      case "boolean" -> "Boolean";
      case "array" -> "java.util.List<" + javaType(schema.get("items")) + ">";
      case "object" -> "java.util.Map<String, Object>";
      case "string" ->
          switch (format) {
            case "date" -> "java.time.LocalDate";
            case "date-time" -> "java.time.OffsetDateTime";
            case "time" -> "java.time.LocalTime";
            default -> "String";
          };
      default -> "String";
    };
  }

  /** The import a fully-qualified type needs, or empty for a type that needs none. */
  static Optional<String> importOf(String javaType) {
    if (javaType == null || javaType.isBlank()) {
      return Optional.empty();
    }
    var outer = javaType.contains("<") ? javaType.substring(0, javaType.indexOf('<')) : javaType;
    return outer.contains(".") && !outer.startsWith("java.lang.")
        ? Optional.of(outer)
        : Optional.empty();
  }

  /** The type as written in a signature once its import is in place. */
  static String simpleName(String javaType) {
    if (javaType == null || javaType.isBlank()) {
      return "String";
    }
    int generic = javaType.indexOf('<');
    if (generic < 0) {
      return tail(javaType);
    }
    var outer = tail(javaType.substring(0, generic));
    var inner = javaType.substring(generic + 1, javaType.lastIndexOf('>'));
    return outer + "<" + simpleName(inner) + ">";
  }

  private static String tail(String qualified) {
    int dot = qualified.lastIndexOf('.');
    return dot < 0 ? qualified : qualified.substring(dot + 1);
  }

  /**
   * The records a response schema needs, keyed by class name: the root one under {@code rootName}
   * plus one per nested object.
   *
   * <p>An array at the root has no record of its own — the operation returns a {@code List} of the
   * item record — because wrapping it in a one-field holder would invent an envelope the endpoint
   * does not have.
   */
  static Map<String, String> records(String packageName, String rootName, JsonNode schema) {
    var out = new LinkedHashMap<String, String>();
    if (schema == null) {
      return out;
    }
    emit(packageName, rootName, schema, out);
    return out;
  }

  /** The type a response schema is returned as, and the records it needs on the way. */
  static String returnTypeOf(
      String packageName, String rootName, JsonNode schema, Map<String, String> records) {
    if (schema == null) {
      return "java.util.Map<String, Object>";
    }
    var type = text(schema, "type");
    if ("array".equals(type)) {
      var items = schema.get("items");
      if (items != null && "object".equals(text(items, "type")) && items.has("properties")) {
        emit(packageName, rootName, items, records);
        return "java.util.List<" + rootName + ">";
      }
      return "java.util.List<" + javaType(items) + ">";
    }
    if ("object".equals(type) && schema.has("properties")) {
      emit(packageName, rootName, schema, records);
      return rootName;
    }
    return javaType(schema);
  }

  /** Emits the record for an object schema, recursing into nested objects and array items. */
  private static void emit(
      String packageName, String name, JsonNode schema, Map<String, String> out) {
    if (out.containsKey(name)) {
      return;
    }
    var properties = schema.get("properties");
    if (properties == null || !properties.isObject()) {
      return;
    }
    out.put(name, ""); // reserve the name first, so a self-referential shape cannot loop

    var components = new StringBuilder();
    var imports = new java.util.TreeSet<String>();
    properties
        .fields()
        .forEachRemaining(
            entry -> {
              var propertyName = entry.getKey();
              var property = entry.getValue();
              var componentName = JavaNames.camel(propertyName);
              String type;
              if ("object".equals(text(property, "type")) && property.has("properties")) {
                var nested = name.replaceAll("Response$", "") + JavaNames.pascal(propertyName);
                emit(packageName, nested, property, out);
                type = nested;
              } else if ("array".equals(text(property, "type"))
                  && property.get("items") != null
                  && "object".equals(text(property.get("items"), "type"))
                  && property.get("items").has("properties")) {
                var nested =
                    name.replaceAll("Response$", "") + JavaNames.pascal(singular(propertyName));
                emit(packageName, nested, property.get("items"), out);
                type = "List<" + nested + ">";
                imports.add("java.util.List");
              } else {
                var javaType = javaType(property);
                importOf(javaType).ifPresent(imports::add);
                if (javaType.startsWith("java.util.List<")) {
                  imports.add("java.util.List");
                }
                type = simpleName(javaType);
              }
              if (components.length() > 0) {
                components.append(",\n");
              }
              components.append("    ").append(type).append(" ").append(componentName);
            });

    var importBlock = new StringBuilder();
    imports.forEach(i -> importBlock.append("import ").append(i).append(";\n"));
    if (importBlock.length() > 0) {
      importBlock.append('\n');
    }

    out.put(
        name,
        """
        package %s;

        %s/**
         * Part of the shape the UI reads back. GENERATED by Mateu — do not edit; it is rewritten on
         * every build.
         *
         * <p>These are the fields the screens actually read, not necessarily every field the endpoint
         * returns: the derived contract is a lower bound.
         */
        public record %s(
        %s) {}
        """
            .formatted(packageName, importBlock, name, components));
  }

  /** {@code items} → {@code item}, so a list of nested objects gets a singular record name. */
  private static String singular(String plural) {
    if (plural.endsWith("ies") && plural.length() > 3) {
      return plural.substring(0, plural.length() - 3) + "y";
    }
    if (plural.endsWith("s") && !plural.endsWith("ss") && plural.length() > 1) {
      return plural.substring(0, plural.length() - 1);
    }
    return plural + "Item";
  }

  private static String text(JsonNode node, String field) {
    return node != null && node.hasNonNull(field) ? node.get(field).asText() : "";
  }
}
