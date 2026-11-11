package io.mateu.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Tests a Mateu UI with no browser and no server: boots the Mateu core in the test's JVM with the
 * application's {@code @UI} classes, its beans and its {@code specs/ui} YAML, and opens routes as a
 * renderer would. What a test reads ({@link Screen}) is what the renderers receive — the same
 * {@code /mateu/v3/sync} answers, as JSON — so a passing test means the screen really looks and
 * behaves that way, on every renderer.
 *
 * <pre>{@code
 * try (var mateu = MateuTest.builder().ui(Shell.class).bean(new ProductStore()).start()) {
 *   var products = mateu.open("/products");
 *   assertEquals(4, products.listing().rows().size());
 *   var form = products.button("New").press();
 *   form.field("name").set("Kettle");
 *   form.button("Save").press();
 *   assertEquals("Product saved successfully", form.lastMessage().text());
 * }
 * }</pre>
 *
 * <p>No container is involved: the core's own beans are built by the harness, and the application
 * contributes the beans its screens inject ({@code @Autowired}/{@code @Inject} fields of a view
 * model are filled from them). One harness at a time per JVM: the core keeps its bean provider in a
 * static holder, so do not run two harnesses in parallel threads.
 */
@Experimental("test harness (3.0)")
public final class MateuTest implements AutoCloseable {

  private static final ObjectMapper JSON = WireMapper.create();

  private final Container container;
  private final MateuService service;
  private final ClassLoader specsLoader;

  private MateuTest(Builder builder) {
    var beans = new ArrayList<>(builder.beans);
    beans.add(new ObjectMapper().findAndRegisterModules());
    for (Class<?> ui : builder.uis) {
      beans.add((RoutedClassProvider) () -> ui);
    }
    this.specsLoader =
        builder.specs == null
            ? null
            : new SpecsOverlay(builder.specs, Thread.currentThread().getContextClassLoader());
    this.container = withSpecs(() -> new Container(beans));
    // Framework internals reach the beans through this static holder, as on every adapter.
    MateuBeanProvider.setBeanProvider(container);
    this.service = container.service();
  }

  /**
   * A harness serving these {@code @UI} classes, with no beans of the application.
   *
   * @param uis the {@code @UI} classes (the app shell, the screens with their own route)
   * @return the started harness
   */
  public static MateuTest of(Class<?>... uis) {
    return builder().ui(uis).start();
  }

  /**
   * Starts describing a harness.
   *
   * @return a builder
   */
  public static Builder builder() {
    return new Builder();
  }

  /**
   * Opens a route as an anonymous visitor, the way a browser landing on it does.
   *
   * @param route the route, e.g. {@code /products} ({@code ""} or {@code /} is the root)
   * @return the screen showing it
   */
  public Screen open(String route) {
    return open(route, Identity.anonymous());
  }

  /**
   * Opens a route as the given caller.
   *
   * @param route the route
   * @param identity who is visiting
   * @return the screen showing it
   */
  public Screen open(String route, Identity identity) {
    var screen = new Screen(this, identity);
    screen.navigate(route);
    return screen;
  }

  /**
   * The raw exchange, for what the {@link Screen} does not cover: sends one request and returns the
   * answer as the wire JSON (maps, lists, strings, numbers, booleans).
   *
   * @param request the request a renderer would send
   * @param identity who sends it
   * @return the answer, as JSON
   */
  public Map<String, Object> exchange(RunActionRqDto request, Identity identity) {
    var answers = exchangeAll(request, identity);
    if (answers.isEmpty()) {
      throw new AssertionError("Mateu answered nothing to " + describe(request));
    }
    return answers.get(0);
  }

  @SuppressWarnings("unchecked")
  List<Map<String, Object>> exchangeAll(RunActionRqDto request, Identity identity) {
    return withSpecs(
        () -> {
          var http =
              new HarnessRequest(request, "", "/mateu/v3/sync", identity.principal(), Map.of());
          List<UIIncrementDto> increments;
          try {
            increments = service.runAction("", request, "", http).collectList().block();
          } catch (RuntimeException | Error e) {
            throw e;
          } catch (Throwable t) {
            throw new AssertionError("Mateu failed on " + describe(request), t);
          }
          var out = new ArrayList<Map<String, Object>>();
          if (increments != null) {
            for (var increment : increments) {
              out.add(JSON.convertValue(increment, LinkedHashMap.class));
            }
          }
          return out;
        });
  }

  private <T> T withSpecs(Supplier<T> body) {
    if (specsLoader == null) {
      return body.get();
    }
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(specsLoader);
    try {
      return body.get();
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  static String describe(RunActionRqDto rq) {
    var action = rq.actionId() == null || rq.actionId().isEmpty() ? "load" : rq.actionId();
    return action + " on " + rq.route();
  }

  /** Releases the harness. Nothing is kept running; provided for try-with-resources. */
  @Override
  public void close() {
    if (MateuBeanProvider.isInitialized()) {
      // leave nothing of this harness behind for the next one
      MateuBeanProvider.setBeanProvider(null);
    }
  }

  /** Describes a harness: the UIs it serves, the beans they need, where the YAML is. */
  @Experimental("test harness (3.0)")
  public static final class Builder {

    private final List<Class<?>> uis = new ArrayList<>();
    private final List<Object> beans = new ArrayList<>();
    private Path specs;

    private Builder() {}

    /**
     * Serves these {@code @UI} classes, exactly like the annotation processor registers them in an
     * app. Screens reached through a {@code @Menu} of a shell need only the shell.
     *
     * @param uis the classes
     * @return this builder
     */
    public Builder ui(Class<?>... uis) {
      this.uis.addAll(List.of(uis));
      return this;
    }

    /**
     * Contributes a bean the screens use: a {@code CrudStore}, a service injected into a view
     * model, a {@code Translator}, a {@code ListingExporter}, a {@code PrincipalResolver}… A bean
     * of a type the core also provides replaces the core's.
     *
     * @param bean the bean
     * @return this builder
     */
    public Builder bean(Object bean) {
      this.beans.add(bean);
      return this;
    }

    /**
     * Reads {@code specs/ui/**} from this directory instead of the class path — for a test that
     * writes its own YAML. By default the class path's {@code specs/ui} (your {@code
     * src/main/resources/specs/ui}) is served, as in the app.
     *
     * @param directory a directory holding {@code specs/ui}
     * @return this builder
     */
    public Builder specs(Path directory) {
      this.specs = directory;
      return this;
    }

    /**
     * Boots the core.
     *
     * @return the harness
     */
    public MateuTest start() {
      return new MateuTest(this);
    }
  }
}
