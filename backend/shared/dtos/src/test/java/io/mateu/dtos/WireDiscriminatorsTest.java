package io.mateu.dtos;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.lang.reflect.Modifier;
import java.lang.reflect.RecordComponent;
import java.net.URISyntaxException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;

/**
 * The {@code "type"} discriminator is the whole contract between a backend and a renderer: every
 * renderer dispatches on it, and a DTO that leaves without it — or under a name nobody registered —
 * renders as nothing, silently (the Helidon JSON-B incident). So for each polymorphic family:
 *
 * <ul>
 *   <li>every implementation in this package is registered, under a unique name;
 *   <li>every registered DTO serialises with its name and reads back as the same type, the JSON
 *       stable across the round trip — what a server writes is what a client (or the static bundle)
 *       can read.
 * </ul>
 */
class WireDiscriminatorsTest {

  /** The polymorphic roots in use ({@code PageMainContentDto} is a deprecated leftover). */
  private static final List<Class<?>> FAMILIES =
      List.of(ComponentMetadataDto.class, ComponentDto.class, TriggerDto.class);

  private static final ObjectMapper JSON = new ObjectMapper();

  /**
   * Known exceptions, each with its reason. Adding a wire name ripples into every renderer's parity
   * gate (IntelliJ's WireTypeParityTest, the RN and Redwood coverage maps, parity.md), so these are
   * fixed there together, not here alone. Nothing may join this list.
   *
   * <ul>
   *   <li>{@code KPIDto}: travels as a typed list ({@code PageDto.kpis}), never dispatched on; its
   *       wire name has always been the default {@code "KPIDto"}, which the ports mirror.
   * </ul>
   */
  private static final java.util.Set<Class<?>> KNOWN_UNREGISTERED = java.util.Set.of(KPIDto.class);

  private static Map<Class<?>, String> registered(Class<?> family) {
    var names = new HashMap<Class<?>, String>();
    for (var type : family.getAnnotation(JsonSubTypes.class).value()) {
      names.put(type.value(), type.name());
    }
    return names;
  }

  @Test
  void everyImplementationOfAFamilyIsRegisteredUnderAUniqueName() throws Exception {
    var unregistered = new ArrayList<String>();
    var duplicated = new ArrayList<String>();
    var classes = dtoClasses();
    for (var family : FAMILIES) {
      var types = family.getAnnotation(JsonSubTypes.class).value();
      var names = Arrays.stream(types).map(JsonSubTypes.Type::name).toList();
      names.stream()
          .filter(n -> names.indexOf(n) != names.lastIndexOf(n))
          .distinct()
          .forEach(n -> duplicated.add(family.getSimpleName() + ": " + n));
      var registered = registered(family).keySet();
      for (var c : classes) {
        if (family.isAssignableFrom(c)
            && c != family
            && !c.isInterface()
            && !Modifier.isAbstract(c.getModifiers())
            && !leftover(c)
            && !KNOWN_UNREGISTERED.contains(c)
            && !registered.contains(c)) {
          unregistered.add(family.getSimpleName() + " <- " + c.getSimpleName());
        }
      }
    }
    var strangers = new ArrayList<String>();
    for (var family : FAMILIES) {
      registered(family).keySet().stream()
          .filter(c -> !family.isAssignableFrom(c))
          .forEach(c -> strangers.add(family.getSimpleName() + " -> " + c.getSimpleName()));
    }
    assertThat(unregistered).as("implementations a renderer could never dispatch on").isEmpty();
    assertThat(strangers).as("registered types that are not of the family").isEmpty();
    assertThat(duplicated).as("names two DTOs share").isEmpty();
  }

  @TestFactory
  Stream<DynamicTest> everyRegisteredDtoTravelsWithItsNameAndReadsBack() {
    return FAMILIES.stream()
        .flatMap(
            family ->
                registered(family).entrySet().stream()
                    .filter(e -> family.isAssignableFrom(e.getKey()))
                    .map(
                        e ->
                            DynamicTest.dynamicTest(
                                family.getSimpleName() + " " + e.getValue(),
                                () -> roundTrip(family, e.getKey(), e.getValue()))));
  }

  private static void roundTrip(Class<?> family, Class<?> type, String name) throws Exception {
    Object dto = empty(type);
    String json = JSON.writerFor(family).writeValueAsString(dto);
    assertThat(JSON.readTree(json).get("type").asText()).isEqualTo(name);

    Object back = JSON.readerFor(family).readValue(json);
    assertThat(back).isInstanceOf(type);
    assertThat(JSON.writerFor(family).writeValueAsString(back)).isEqualTo(json);
  }

  /** Deprecated for removal: nothing produces or reads it any more. */
  private static boolean leftover(Class<?> c) {
    var deprecated = c.getAnnotation(Deprecated.class);
    return deprecated != null && deprecated.forRemoval();
  }

  /** The DTO with every component at its zero value (what a sparse producer sends). */
  private static Object empty(Class<?> type) throws Exception {
    if (type.isRecord()) {
      RecordComponent[] components = type.getRecordComponents();
      var argTypes =
          Arrays.stream(components).map(RecordComponent::getType).toArray(Class<?>[]::new);
      var args = Arrays.stream(argTypes).map(WireDiscriminatorsTest::zero).toArray();
      return type.getDeclaredConstructor(argTypes).newInstance(args);
    }
    return type.getDeclaredConstructor().newInstance();
  }

  private static Object zero(Class<?> type) {
    if (type == boolean.class) return false;
    if (type == int.class) return 0;
    if (type == long.class) return 0L;
    if (type == double.class) return 0d;
    if (type == float.class) return 0f;
    if (type == short.class) return (short) 0;
    if (type == byte.class) return (byte) 0;
    if (type == char.class) return ' ';
    return null;
  }

  private static List<Class<?>> dtoClasses() throws IOException, URISyntaxException {
    var location = ComponentDto.class.getProtectionDomain().getCodeSource().getLocation().toURI();
    var root = Path.of(location);
    var classes = new ArrayList<Class<?>>();
    if (Files.isDirectory(root)) {
      collect(root, root.resolve("io/mateu/dtos"), classes);
    } else {
      try (var jar = FileSystems.newFileSystem(root)) {
        var jarRoot = jar.getPath("/");
        collect(jarRoot, jarRoot.resolve("io/mateu/dtos"), classes);
      }
    }
    assertThat(classes).as("the dto classes are found").hasSizeGreaterThan(100);
    return classes;
  }

  private static void collect(Path root, Path dir, List<Class<?>> classes) throws IOException {
    try (Stream<Path> walk = Files.walk(dir)) {
      for (var p : walk.filter(f -> f.toString().endsWith(".class")).toList()) {
        var name = root.relativize(p).toString().replace('/', '.').replace('\\', '.');
        name = name.substring(0, name.length() - ".class".length());
        try {
          classes.add(Class.forName(name, false, WireDiscriminatorsTest.class.getClassLoader()));
        } catch (ClassNotFoundException e) {
          throw new IllegalStateException(e);
        }
      }
    }
  }
}
