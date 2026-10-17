package io.mateu.uidl.schema;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.BeanPropertyDefinition;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * Builds {@code wire-schema.json}: the JSON Schema of the RESPONSE wire ({@link UIIncrementDto} and
 * everything reachable from it — every {@code ComponentMetadataDto}, {@code ComponentDto} and
 * {@code TriggerDto} subtype) plus the request ({@link RunActionRqDto}), derived from the {@code
 * mateu-dtos} records.
 *
 * <p>The authoring schemas ({@code uidl-schema.json} and friends) describe what an author WRITES;
 * this one describes what a server SENDS and a renderer READS. It is derived through Jackson's own
 * bean introspection — the same one that serialises the wire — so a {@code @JsonIgnore}, a
 * {@code @JsonProperty} rename or an extra getter is reflected exactly as it travels.
 *
 * <p>The schema is OPEN (no {@code additionalProperties: false}): the wire is additive within a
 * major, and a reader must ignore what it does not know. Nothing is {@code required} except the
 * {@code type} discriminator, because a producer may omit any member at its default (see the
 * "absent == default" rule in {@code reference/wire-specification.md}).
 */
public final class WireSchemaGenerator {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** $defs being built, sorted so the output is byte-stable. */
  private final Map<String, ObjectNode> defs = new TreeMap<>();

  /** Discriminator name of each registered subtype, by class. */
  private final Map<Class<?>, String> discriminators = new HashMap<>();

  private final Deque<Class<?>> pending = new ArrayDeque<>();

  private WireSchemaGenerator() {}

  /** Generates the whole schema document. */
  public static ObjectNode generate() {
    var generator = new WireSchemaGenerator();
    generator.enqueue(UIIncrementDto.class);
    generator.enqueue(RunActionRqDto.class);
    generator.drain();

    var root = MAPPER.createObjectNode();
    root.put("$schema", "http://json-schema.org/draft-07/schema#");
    root.put(
        "$id",
        "https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/wire-schema.json");
    root.put("version", UIIncrementDto.WIRE_VERSION);
    root.put("title", "Mateu wire schema");
    root.put(
        "description",
        "JSON Schema of the Mateu wire: the response envelope (UIIncrementDto) a backend sends"
            + " and a renderer reads, and the request (RunActionRqDto) a renderer sends. Open by"
            + " design — additive within a major, readers ignore unknown members — and nothing is"
            + " required but the 'type' discriminator, since a member at its default may be"
            + " omitted. GENERATED from the mateu-dtos records by WireSchemaGenerator — do not"
            + " edit by hand.");
    root.put("$ref", "#/$defs/UIIncrementDto");
    var defsNode = root.putObject("$defs");
    generator.defs.forEach(defsNode::set);
    return root;
  }

  private void enqueue(Class<?> type) {
    if (!defs.containsKey(name(type)) && !pending.contains(type)) {
      pending.add(type);
    }
  }

  private void drain() {
    while (!pending.isEmpty()) {
      var type = pending.poll();
      if (defs.containsKey(name(type))) {
        continue;
      }
      define(type);
    }
  }

  private static String name(Class<?> type) {
    return type.getSimpleName();
  }

  private void define(Class<?> type) {
    if (type.isEnum()) {
      var def = MAPPER.createObjectNode().put("type", "string");
      var values = def.putArray("enum");
      for (var constant : type.getEnumConstants()) {
        values.add(((Enum<?>) constant).name());
      }
      defs.put(name(type), def);
      return;
    }
    var subTypes = type.getAnnotation(JsonSubTypes.class);
    if (subTypes != null && (type.isInterface() || type.getSuperclass() == null)) {
      var def = MAPPER.createObjectNode();
      def.put("description", "Polymorphic: discriminated by 'type'.");
      var oneOf = def.putArray("oneOf");
      var byName = new TreeMap<String, Class<?>>();
      for (var sub : subTypes.value()) {
        byName.put(sub.name(), sub.value());
        discriminators.put(sub.value(), sub.name());
      }
      byName.values().forEach(sub -> oneOf.addObject().put("$ref", "#/$defs/" + name(sub)));
      defs.put(name(type), def);
      byName.values().forEach(this::enqueue);
      return;
    }
    var def = MAPPER.createObjectNode().put("type", "object");
    defs.put(name(type), def); // placed first: a type may reference itself
    if (type.isAnnotationPresent(Deprecated.class)) {
      // nothing produces it; a renderer need not draw it (still valid on the wire until a major)
      def.put("deprecated", true);
    }
    var properties = def.putObject("properties");
    var discriminator = discriminatorOf(type);
    if (discriminator != null) {
      properties.putObject("type").put("const", discriminator);
      def.putArray("required").add("type");
    }
    var javaType = MAPPER.constructType(type);
    var description = MAPPER.getSerializationConfig().introspect(javaType);
    var sorted = new TreeMap<String, BeanPropertyDefinition>();
    for (var property : description.findProperties()) {
      if (property.couldSerialize()) {
        sorted.put(property.getName(), property);
      }
    }
    sorted.forEach((n, p) -> properties.set(n, schemaFor(p.getPrimaryType())));
  }

  /** The name a subtype travels under, looked up on the families it belongs to. */
  private String discriminatorOf(Class<?> type) {
    var known = discriminators.get(type);
    if (known != null) {
      return known;
    }
    var supers = new ArrayDeque<Class<?>>(java.util.Arrays.asList(type.getInterfaces()));
    if (type.getSuperclass() != null) {
      supers.add(type.getSuperclass());
    }
    while (!supers.isEmpty()) {
      var candidate = supers.poll();
      var subTypes = candidate.getAnnotation(JsonSubTypes.class);
      if (subTypes != null) {
        for (var sub : subTypes.value()) {
          if (sub.value() == type) {
            discriminators.put(type, sub.name());
            enqueue(candidate);
            return sub.name();
          }
        }
      }
      supers.addAll(java.util.Arrays.asList(candidate.getInterfaces()));
    }
    return null;
  }

  private ObjectNode schemaFor(JavaType type) {
    var raw = type.getRawClass();
    var node = MAPPER.createObjectNode();
    if (raw == String.class || raw == char.class || raw == Character.class) {
      return node.put("type", "string");
    }
    if (raw == boolean.class || raw == Boolean.class) {
      return node.put("type", "boolean");
    }
    if (raw == int.class
        || raw == Integer.class
        || raw == long.class
        || raw == Long.class
        || raw == short.class
        || raw == Short.class
        || raw == byte.class
        || raw == Byte.class
        || raw == BigInteger.class) {
      return node.put("type", "integer");
    }
    if (raw == double.class
        || raw == Double.class
        || raw == float.class
        || raw == Float.class
        || raw == BigDecimal.class
        || raw == Number.class) {
      return node.put("type", "number");
    }
    if (raw.getName().startsWith("java.time.")) {
      return node.put("type", "string").put("format", raw.getSimpleName());
    }
    if (type.isArrayType() || type.isCollectionLikeType()) {
      node.put("type", "array");
      node.set("items", schemaFor(type.getContentType()));
      return node;
    }
    if (type.isMapLikeType()) {
      node.put("type", "object");
      node.set("additionalProperties", schemaFor(type.getContentType()));
      return node;
    }
    if (raw.getPackageName().equals("io.mateu.dtos")) {
      enqueue(raw);
      return node.put("$ref", "#/$defs/" + name(raw));
    }
    // Object and other open slots (state, data, initial data): any JSON value
    return node.put("description", "Any JSON value.");
  }
}
