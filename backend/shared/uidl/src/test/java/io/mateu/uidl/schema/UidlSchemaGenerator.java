package io.mateu.uidl.schema;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.uidl.fluent.Component;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.RecordComponent;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Stream;

/**
 * Builds {@code uidl-schema.json} by reflecting over the UIDL component records, instead of keeping
 * it as a hand-written file.
 *
 * <p>Why generated: the schema is the public contract for authoring UIs in YAML/JSON (editors point
 * their IntelliSense at it), and a hand-maintained mirror of a growing catalog drifts silently — it
 * was written in one commit and never updated while the catalog nearly doubled. A generated schema
 * is an <em>artifact</em>: it cannot disagree with the code, because it is derived from it.
 *
 * <p>Deliberately NOT in the schema (see {@link #EXCLUDED}): wire plumbing that a YAML author never
 * writes by hand.
 */
public final class UidlSchemaGenerator {

  /**
   * Components that exist in the catalog but are NOT part of the YAML/JSON authoring surface.
   *
   * <ul>
   *   <li>{@code ServerSideComponent} / {@code ModelViewComponent} — wire plumbing: the server
   *       emits them, an author never writes them.
   *   <li>{@code PageView} — the page envelope. A YAML page is declared with {@code modelView} +
   *       {@code layout}, so exposing the envelope as a content component too would give two ways
   *       to say the same thing.
   * </ul>
   */
  public static final Set<String> EXCLUDED =
      Set.of("ServerSideComponent", "ModelViewComponent", "PageView");

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** $defs being built, sorted by name so the output is byte-stable across runs. */
  private final Map<String, ObjectNode> defs = new TreeMap<>();

  /** Every UIDL class, scanned once: needed to resolve an interface into its implementations. */
  private final List<Class<?>> catalog = classesUnder("io.mateu.uidl");

  private UidlSchemaGenerator() {}

  /** Generates the whole schema document. */
  public static ObjectNode generate() {
    var generator = new UidlSchemaGenerator();
    var components = componentRecords();

    for (var component : components) {
      generator.defineDiscriminated(component);
    }

    var componentDef = MAPPER.createObjectNode();
    componentDef.put(
        "description",
        "Any UI component. Use the 'type' field to indicate the concrete component.");
    ArrayNode oneOf = componentDef.putArray("oneOf");
    components.stream()
        .map(Class::getSimpleName)
        .sorted()
        .forEach(name -> oneOf.addObject().put("$ref", "#/$defs/" + name));
    generator.defs.put("Component", componentDef);

    var root = MAPPER.createObjectNode();
    root.put("$schema", "http://json-schema.org/draft-07/schema#");
    root.put("$id", "https://mateu.io/uidl/schema.json");
    root.put("title", "Mateu UIDL Schema");
    root.put(
        "description",
        "JSON Schema for Mateu UI Definition Language (UIDL) components. Use the 'type'"
            + " discriminator field to identify the concrete component type. GENERATED from the"
            + " component records by UidlSchemaGenerator — do not edit by hand.");
    root.putArray("oneOf").addObject().put("$ref", "#/$defs/Component");
    var defsNode = root.putObject("$defs");
    generator.defs.forEach(defsNode::set);
    return root;
  }

  /** Every component record that belongs to the authoring surface, sorted by simple name. */
  public static List<Class<?>> componentRecords() {
    var found = new ArrayList<Class<?>>();
    for (var type : classesUnder("io.mateu.uidl")) {
      if (type.isRecord()
          && Component.class.isAssignableFrom(type)
          && !EXCLUDED.contains(type.getSimpleName())) {
        found.add(type);
      }
    }
    found.sort(java.util.Comparator.comparing(Class::getSimpleName));
    return found;
  }

  /** A record that travels with a {@code type} discriminator: a Component or a union member. */
  private void defineDiscriminated(Class<?> type) {
    var node = MAPPER.createObjectNode();
    node.put("type", "object");
    node.putArray("required").add("type");
    var properties = node.putObject("properties");
    properties.putObject("type").put("type", "string").put("const", type.getSimpleName());
    for (RecordComponent recordComponent : type.getRecordComponents()) {
      if ("type".equals(recordComponent.getName())) {
        continue; // the discriminator is emitted above
      }
      properties.set(
          recordComponent.getName(),
          schemaFor(recordComponent.getType(), recordComponent.getGenericType()));
    }
    defs.put(type.getSimpleName(), node);
  }

  /**
   * The schema of one field. Component-typed fields become a {@code $ref} to the polymorphic
   * Component; nested records and enums get their own $def (emitted on first sight); anything the
   * generator cannot describe becomes the permissive empty schema rather than a wrong constraint —
   * a schema that rejects valid YAML is worse than one that accepts too much.
   */
  private ObjectNode schemaFor(Class<?> raw, Type generic) {
    var node = MAPPER.createObjectNode();

    if (Component.class.isAssignableFrom(raw) || Component.class.equals(raw)) {
      return node.put("$ref", "#/$defs/Component");
    }
    if (raw == String.class || raw == CharSequence.class) {
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
        || raw == Short.class) {
      return node.put("type", "integer");
    }
    if (raw == double.class || raw == Double.class || raw == float.class || raw == Float.class) {
      return node.put("type", "number");
    }
    if (raw.isEnum()) {
      defineEnum(raw);
      return node.put("$ref", "#/$defs/" + raw.getSimpleName());
    }
    if (Collection.class.isAssignableFrom(raw)) {
      node.put("type", "array");
      var itemType = typeArgument(generic, 0);
      node.set(
          "items", itemType == null ? MAPPER.createObjectNode() : schemaFor(itemType, itemType));
      return node;
    }
    if (Map.class.isAssignableFrom(raw)) {
      return node.put("type", "object");
    }
    if (raw.isRecord() && raw.getName().startsWith("io.mateu.uidl")) {
      defineValueRecord(raw);
      return node.put("$ref", "#/$defs/" + raw.getSimpleName());
    }
    // A UIDL interface used as a field type is a second polymorphic family (Actionable, UserTrigger
    // …): describe it as a union of its record implementations, exactly like Component.
    if (raw.isInterface() && raw.getName().startsWith("io.mateu.uidl")) {
      definePolymorphic(raw);
      return node.put("$ref", "#/$defs/" + raw.getSimpleName());
    }
    // Callables, Suppliers, Object, java.time, anything else: describe nothing rather than wrongly.
    return node;
  }

  /**
   * A UIDL interface used as a field type: a union of the record implementations found in the
   * catalog, each carrying the {@code type} discriminator the wire uses to tell them apart. An
   * interface with no record implementation (a pure marker) describes nothing rather than an empty
   * union, which would reject every value.
   */
  private void definePolymorphic(Class<?> type) {
    if (defs.containsKey(type.getSimpleName())) {
      return;
    }
    defs.put(type.getSimpleName(), MAPPER.createObjectNode()); // placeholder: breaks cycles
    var implementations =
        catalog.stream()
            .filter(Class::isRecord)
            .filter(type::isAssignableFrom)
            .filter(candidate -> !EXCLUDED.contains(candidate.getSimpleName()))
            .sorted(java.util.Comparator.comparing(Class::getSimpleName))
            .toList();
    if (implementations.isEmpty()) {
      return;
    }
    var node = MAPPER.createObjectNode();
    node.put("description", "One of the " + type.getSimpleName() + " implementations.");
    var oneOf = node.putArray("oneOf");
    for (var implementation : implementations) {
      defineDiscriminated(implementation);
      oneOf.addObject().put("$ref", "#/$defs/" + implementation.getSimpleName());
    }
    defs.put(type.getSimpleName(), node);
  }

  private void defineEnum(Class<?> type) {
    if (defs.containsKey(type.getSimpleName())) {
      return;
    }
    var node = MAPPER.createObjectNode();
    node.put("type", "string");
    var values = node.putArray("enum");
    for (var constant : type.getEnumConstants()) {
      values.add(((Enum<?>) constant).name());
    }
    defs.put(type.getSimpleName(), node);
  }

  /**
   * A non-component record used as a field type (Option, Sort, ChartData…). No {@code required}
   * list: these are authored piecemeal in YAML and an over-strict schema would reject valid files.
   */
  private void defineValueRecord(Class<?> type) {
    if (defs.containsKey(type.getSimpleName())) {
      return;
    }
    defs.put(type.getSimpleName(), MAPPER.createObjectNode()); // placeholder: breaks record cycles
    var node = MAPPER.createObjectNode();
    node.put("type", "object");
    var properties = node.putObject("properties");
    for (RecordComponent recordComponent : type.getRecordComponents()) {
      properties.set(
          recordComponent.getName(),
          schemaFor(recordComponent.getType(), recordComponent.getGenericType()));
    }
    defs.put(type.getSimpleName(), node);
  }

  private static Class<?> typeArgument(Type generic, int index) {
    if (generic instanceof ParameterizedType parameterized) {
      var arguments = parameterized.getActualTypeArguments();
      if (index < arguments.length && arguments[index] instanceof Class<?> argument) {
        return argument;
      }
    }
    return null;
  }

  /** Loads every class under a package from the directory this module compiled into. */
  private static List<Class<?>> classesUnder(String packageName) {
    Path classesDir;
    try {
      classesDir =
          Path.of(Component.class.getProtectionDomain().getCodeSource().getLocation().toURI());
    } catch (URISyntaxException e) {
      throw new IllegalStateException("cannot locate the uidl classes directory", e);
    }
    var prefix = packageName.replace('.', '/');
    var result = new ArrayList<Class<?>>();
    try (Stream<Path> paths = Files.walk(classesDir.resolve(prefix))) {
      paths
          .filter(path -> path.toString().endsWith(".class"))
          .map(path -> classesDir.relativize(path).toString())
          .map(relative -> relative.substring(0, relative.length() - ".class".length()))
          .map(relative -> relative.replace(java.io.File.separatorChar, '.').replace('/', '.'))
          .sorted()
          .forEach(
              className -> {
                try {
                  result.add(
                      Class.forName(className, false, UidlSchemaGenerator.class.getClassLoader()));
                } catch (Throwable ignored) {
                  // Classes whose optional dependencies are absent (reactor, validation) simply do
                  // not take part in the schema.
                }
              });
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    return result;
  }

  /**
   * Writes the schema to disk. Used by the schema test when run with {@code -Duidl.schema.write}.
   */
  public static void write(Path target) {
    try {
      Files.writeString(
          target, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(generate()) + "\n");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
