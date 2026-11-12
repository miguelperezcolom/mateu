package io.mateu.test;

import io.mateu.core.application.MateuService;
import io.mateu.core.domain.ports.BeanProvider;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.jar.JarFile;
import java.util.stream.Stream;

/**
 * The smallest container that builds Mateu core's bean graph: every concrete {@code @Named} class
 * of the {@code mateu-core} jar, built through its {@code @Inject} (or only) constructor, a {@code
 * List}/{@code Collection} parameter receiving every bean of its element type. This is all the core
 * asks of a container (it is written against {@code jakarta.inject} only), so the harness needs no
 * Spring, CDI or Micronaut — the test runs on any stack.
 *
 * <p>The beans the application contributes (its stores, a {@code Translator}, a {@code
 * ListingExporter}…) win over a core default implementing the same type, like a primary bean.
 */
final class Container implements BeanProvider {

  private static final String CORE_PACKAGE = "io/mateu/core/";

  /** The beans the test registered, in registration order — they win over the core's. */
  private final List<Object> contributed;

  /** The core's beans, in creation order. */
  private final List<Object> core = new ArrayList<>();

  private final Map<Class<?>, Object> built = new LinkedHashMap<>();
  private final Set<Class<?>> creating =
      java.util.Collections.newSetFromMap(new IdentityHashMap<>());
  private final List<Class<?>> candidates;

  Container(List<Object> contributed) {
    this.contributed = new ArrayList<>(contributed);
    this.contributed.add(this);
    this.candidates = scanCore();
    for (Class<?> type : candidates) {
      instance(type);
    }
  }

  MateuService service() {
    return getBean(MateuService.class);
  }

  @Override
  public <T> T getBean(Class<T> clazz) {
    for (Object bean : contributed) {
      if (clazz.isInstance(bean)) {
        return clazz.cast(bean);
      }
    }
    T found = null;
    for (Object bean : core) {
      if (clazz.isInstance(bean)) {
        if (found != null) {
          // ambiguous, as a container would say: nobody gets a bean picked at random
          return null;
        }
        found = clazz.cast(bean);
      }
    }
    return found;
  }

  @Override
  public <T> Collection<T> getBeans(Class<T> clazz) {
    var out = new ArrayList<T>();
    Stream.concat(contributed.stream(), core.stream())
        .filter(clazz::isInstance)
        .map(clazz::cast)
        .forEach(out::add);
    return out;
  }

  private Object instance(Class<?> type) {
    var existing = built.get(type);
    if (existing != null) {
      return existing;
    }
    if (!creating.add(type)) {
      throw new IllegalStateException("Circular dependency while building " + type.getName());
    }
    try {
      var constructor = constructorOf(type);
      var params = new Object[constructor.getParameterCount()];
      var types = constructor.getGenericParameterTypes();
      for (int i = 0; i < params.length; i++) {
        params[i] = resolve(types[i], type);
      }
      constructor.setAccessible(true);
      var bean = constructor.newInstance(params);
      built.put(type, bean);
      core.add(bean);
      return bean;
    } catch (InvocationTargetException e) {
      throw new IllegalStateException("Could not build " + type.getName(), e.getCause());
    } catch (ReflectiveOperationException e) {
      throw new IllegalStateException("Could not build " + type.getName(), e);
    } finally {
      creating.remove(type);
    }
  }

  private Object resolve(Type type, Class<?> owner) {
    if (type instanceof ParameterizedType parameterized
        && parameterized.getRawType() instanceof Class<?> raw
        && (raw == List.class || raw == Collection.class || raw == Iterable.class)) {
      var element = rawOf(parameterized.getActualTypeArguments()[0]);
      // the core beans of that type are built first, so a list sees all of them
      candidates.stream()
          .filter(element::isAssignableFrom)
          .filter(c -> c != owner)
          .forEach(this::instance);
      return List.copyOf(getBeans(element));
    }
    var wanted = rawOf(type);
    for (Object bean : contributed) {
      if (wanted.isInstance(bean)) {
        return bean;
      }
    }
    var matching = candidates.stream().filter(wanted::isAssignableFrom).toList();
    if (matching.size() == 1) {
      return instance(matching.get(0));
    }
    if (matching.isEmpty()) {
      throw new IllegalStateException(
          owner.getName()
              + " needs a "
              + wanted.getName()
              + " and nothing provides one: register it with MateuTest.builder().bean(…)");
    }
    throw new IllegalStateException(
        owner.getName() + " needs one " + wanted.getName() + " and there are " + matching);
  }

  private static Class<?> rawOf(Type type) {
    if (type instanceof Class<?> c) {
      return c;
    }
    if (type instanceof ParameterizedType p && p.getRawType() instanceof Class<?> c) {
      return c;
    }
    return Object.class;
  }

  private static Constructor<?> constructorOf(Class<?> type) throws NoSuchMethodException {
    var constructors = type.getDeclaredConstructors();
    for (var constructor : constructors) {
      if (constructor.isAnnotationPresent(Inject.class)) {
        return constructor;
      }
    }
    if (constructors.length == 1) {
      return constructors[0];
    }
    return type.getDeclaredConstructor();
  }

  /** Every concrete {@code @Named} class of the jar (or directory) the core is loaded from. */
  private static List<Class<?>> scanCore() {
    var loader = MateuService.class.getClassLoader();
    var names = new ArrayList<String>();
    try {
      var location =
          Path.of(MateuService.class.getProtectionDomain().getCodeSource().getLocation().toURI());
      if (Files.isDirectory(location)) {
        try (Stream<Path> walk = Files.walk(location.resolve(CORE_PACKAGE))) {
          walk.filter(p -> p.toString().endsWith(".class"))
              .map(p -> location.relativize(p).toString().replace(File.separatorChar, '/'))
              .forEach(names::add);
        }
      } else {
        try (var jar = new JarFile(location.toFile())) {
          jar.stream()
              .map(java.util.zip.ZipEntry::getName)
              .filter(n -> n.startsWith(CORE_PACKAGE) && n.endsWith(".class"))
              .forEach(names::add);
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } catch (URISyntaxException e) {
      throw new IllegalStateException(e);
    }
    var out = new ArrayList<Class<?>>();
    names.stream()
        .sorted()
        .filter(n -> !n.contains("$"))
        .map(n -> n.substring(0, n.length() - ".class".length()).replace('/', '.'))
        .forEach(
            name -> {
              try {
                var type = Class.forName(name, false, loader);
                if (type.isAnnotationPresent(Named.class)
                    && !type.isInterface()
                    && !Modifier.isAbstract(type.getModifiers())) {
                  out.add(type);
                }
              } catch (ClassNotFoundException | LinkageError ignored) {
                // a class whose optional dependency is absent is not a bean of this test
              }
            });
    return out;
  }
}
