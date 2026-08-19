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
   * The schema of a mount's route registry ({@code specs/ui/routes.yaml}), derived from {@link
   * io.mateu.uidl.data.RouteEntry} the same way — so the file that binds URLs to definitions gets
   * the same editor validation and completion as the definitions themselves.
   *
   * <p>Both shapes the loader accepts are described: a {@code routes:} envelope and a bare list.
   */
  public static ObjectNode generateRoutes() {
    var generator = new UidlSchemaGenerator();
    generator.defineValueRecord(io.mateu.uidl.data.RouteEntry.class);

    var entryRef = MAPPER.createObjectNode().put("$ref", "#/$defs/RouteEntry");
    var list = MAPPER.createObjectNode().put("type", "array");
    list.set("items", entryRef);

    var envelope = MAPPER.createObjectNode();
    envelope.put("type", "object");
    var envelopeProps = envelope.putObject("properties");
    // The optional `type: Routes` discriminator — uniform with the mount (UI) and app (AppShell)
    // files, so every specs/ui file can be told apart by its `type`. A bare list has no room for
    // it.
    envelopeProps.putObject("type").put("const", "Routes");
    envelopeProps.set("routes", list);
    envelope.putArray("required").add("routes");

    var root = MAPPER.createObjectNode();
    root.put("$schema", "http://json-schema.org/draft-07/schema#");
    root.put("$id", "https://mateu.io/uidl/routes-schema.json");
    root.put("title", "Mateu route registry");
    root.put(
        "description",
        "JSON Schema for a mount's route file — a pure routing table binding each URL to a"
            + " definition, a view model and its parameters. Routes are relative to the mount."
            + " GENERATED from RouteEntry by UidlSchemaGenerator — do not edit by hand.");
    var oneOf = root.putArray("oneOf");
    oneOf.add(envelope);
    oneOf.add(list);
    var defsNode = root.putObject("$defs");
    generator.defs.forEach(defsNode::set);
    return root;
  }

  /**
   * The schema of the authored REST source catalogue ({@code specs/ui/sources.yaml}), derived from
   * {@link io.mateu.uidl.data.RestSourceEntry} the same way as the route registry — so the file
   * that names the endpoints the UI consumes gets the same editor validation and completion as the
   * definitions that reference them.
   *
   * <p>Both shapes the loader accepts are described: a {@code sources:} envelope and a bare list.
   */
  public static ObjectNode generateSources() {
    var generator = new UidlSchemaGenerator();
    generator.defineValueRecord(io.mateu.uidl.data.RestSourceEntry.class);

    var entryRef = MAPPER.createObjectNode().put("$ref", "#/$defs/RestSourceEntry");
    var list = MAPPER.createObjectNode().put("type", "array");
    list.set("items", entryRef);

    var envelope = MAPPER.createObjectNode();
    envelope.put("type", "object");
    var envelopeProps = envelope.putObject("properties");
    // The optional `type: Sources` discriminator, uniform with the mount (UI) and routes (Routes)
    // files so every specs/ui file can be told apart by its `type`. A bare list has no room for it.
    envelopeProps.putObject("type").put("const", "Sources");
    envelopeProps.set("sources", list);
    envelope.putArray("required").add("sources");

    var root = MAPPER.createObjectNode();
    root.put("$schema", "http://json-schema.org/draft-07/schema#");
    root.put("$id", "https://mateu.io/uidl/sources-schema.json");
    root.put("title", "Mateu REST source catalogue");
    root.put(
        "description",
        "JSON Schema for a mount's REST source catalogue — the endpoints the UI consumes, each named"
            + " once so any surface can reference it instead of repeating its URL. `provenance`"
            + " decides whether the derived API contract generates a server for it. GENERATED from"
            + " RestSourceEntry by UidlSchemaGenerator — do not edit by hand.");
    var oneOf = root.putArray("oneOf");
    oneOf.add(envelope);
    oneOf.add(list);
    var defsNode = root.putObject("$defs");
    generator.defs.forEach(defsNode::set);
    return root;
  }

  /**
   * The schema of a MOUNT descriptor ({@code type: UI}) — the data-driven {@code @UI}: a base path
   * and the ordered route files that make up its registry. A separate, tiny schema so the mount
   * file gets the same editor validation and completion as the definitions it points at.
   */
  public static ObjectNode generateMount() {
    var root = MAPPER.createObjectNode();
    root.put("$schema", "http://json-schema.org/draft-07/schema#");
    root.put("$id", "https://mateu.io/uidl/mount-schema.json");
    root.put("title", "Mateu UI mount");
    root.put(
        "description",
        "JSON Schema for a `type: UI` mount descriptor — a UI served at a base path (the data-driven"
            + " @UI), listing the route files that make up its registry (merged, last wins)."
            + " GENERATED by UidlSchemaGenerator — do not edit by hand.");
    root.put("type", "object");
    var props = root.putObject("properties");
    props.putObject("type").put("const", "UI");
    props.putObject("basePath").put("type", "string");
    var routes = props.putObject("routes");
    routes.put("type", "array");
    routes.putObject("items").put("type", "string");
    root.putArray("required").add("type");
    return root;
  }

  /**
   * The UNIFIED authoring schema for any {@code specs/ui/**} file: a {@code oneOf} of the four file
   * kinds, discriminated by {@code type}. Editors (e.g. the IntelliJ plugin) map every {@code
   * specs/ui} YAML to this one schema, and the {@code type} field selects the branch:
   *
   * <ul>
   *   <li>{@code type: UI} — a mount descriptor.
   *   <li>{@code type: Routes} (or a {@code routes:} envelope / bare list) — a route file.
   *   <li>{@code type: AppShell} or any other component — an app shell / page definition (a
   *       component tree; {@code AppShell} is itself a component).
   * </ul>
   *
   * Combines the component catalog ({@link #generate()}) with the {@code RouteEntry} def and the
   * mount/routes envelopes, so it carries every {@code $def} it references.
   */
  public static ObjectNode generateSpecs() {
    var root = generate(); // all component $defs + the Component union, oneOf: [Component]
    var defs = (ObjectNode) root.get("$defs");

    // Add RouteEntry (and anything it nests) to the shared $defs.
    var routeGen = new UidlSchemaGenerator();
    routeGen.defineValueRecord(io.mateu.uidl.data.RouteEntry.class);
    routeGen.defs.forEach(defs::set);

    var entryList = MAPPER.createObjectNode().put("type", "array");
    entryList.putObject("items").put("$ref", "#/$defs/RouteEntry");

    var mount = MAPPER.createObjectNode().put("type", "object");
    var mountProps = mount.putObject("properties");
    mountProps.putObject("type").put("const", "UI");
    mountProps.putObject("basePath").put("type", "string");
    mountProps.putObject("routes").put("type", "array").putObject("items").put("type", "string");
    mount.putArray("required").add("type");

    var routesEnvelope = MAPPER.createObjectNode().put("type", "object");
    var routesProps = routesEnvelope.putObject("properties");
    routesProps.putObject("type").put("const", "Routes");
    routesProps.set("routes", entryList);
    routesEnvelope.putArray("required").add("routes");

    // Add RestSourceEntry (and anything it nests) to the shared $defs, for the catalogue branch.
    var sourceGen = new UidlSchemaGenerator();
    sourceGen.defineValueRecord(io.mateu.uidl.data.RestSourceEntry.class);
    sourceGen.defs.forEach(defs::set);

    var sourceList = MAPPER.createObjectNode().put("type", "array");
    sourceList.putObject("items").put("$ref", "#/$defs/RestSourceEntry");

    var sourcesEnvelope = MAPPER.createObjectNode().put("type", "object");
    var sourcesProps = sourcesEnvelope.putObject("properties");
    sourcesProps.putObject("type").put("const", "Sources");
    sourcesProps.set("sources", sourceList);
    sourcesEnvelope.putArray("required").add("sources");

    var oneOf = MAPPER.createArrayNode();
    oneOf.add(mount);
    oneOf.add(routesEnvelope);
    oneOf.add(entryList.deepCopy()); // a bare list of route entries
    oneOf.add(sourcesEnvelope);
    oneOf.add(MAPPER.createObjectNode().put("$ref", "#/$defs/Component")); // app shell / page
    root.set("oneOf", oneOf);

    root.put("$id", "https://mateu.io/uidl/specs-schema.json");
    root.put("title", "Mateu specs/ui authoring schema");
    root.put(
        "description",
        "Unified JSON Schema for every file under specs/ui/: a `type: UI` mount, a `type: Routes`"
            + " route file, a `type: Sources` REST source catalogue, or a component definition"
            + " (`type: AppShell` app shell / a page). The `type` field selects the branch."
            + " GENERATED by UidlSchemaGenerator — do not edit by hand.");
    return root;
  }

  /**
   * Writes the schema to disk. Used by the schema test when run with {@code -Duidl.schema.write}.
   */
  public static void write(Path target) {
    write(target, generate());
  }

  static void write(Path target, ObjectNode schema) {
    try {
      Files.writeString(
          target, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(schema) + "\n");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
