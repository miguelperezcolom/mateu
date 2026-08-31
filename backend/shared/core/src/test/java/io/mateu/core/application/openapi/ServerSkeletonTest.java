package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceProvenance;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.Test;

/**
 * Generating the server the contract implies.
 *
 * <p>The properties worth pinning are not "files came out". They are the ones that decide whether
 * this is a derivation or a one-shot scaffold: that nothing generated is a place a human would
 * write code, that a third party's endpoint never gets a controller, and that the emitted Java
 * actually compiles — a generator that emits plausible-looking source with a syntax error in it
 * wastes more time than writing the code by hand.
 */
class ServerSkeletonTest {

  private static final ServerSkeleton.Options OPTIONS =
      new ServerSkeleton.Options(
          "com.acme", "orders-api", "1.0.0", "com.acme.orders", "3.3.4", "21", "generate");

  private static RestSourceCatalog catalogue() {
    return new RestSourceCatalog(
        List.of(
            new RestSourceEntry(
                "orders",
                RestDataSource.builder()
                    .url("/api/orders?since=${state.since}")
                    .itemsPath("data")
                    .build(),
                RestSourceProvenance.auto,
                Map.of("customerName", "customer.name", "reference", "reference"),
                "meta.total",
                "The orders a screen lists"),
            new RestSourceEntry(
                "approve",
                RestDataSource.builder().url("/api/orders/approve").method("POST").build(),
                RestSourceProvenance.auto,
                Map.of(),
                "",
                "Approve an order"),
            new RestSourceEntry(
                "countries",
                RestDataSource.builder()
                    .url("https://restcountries.com/v3.1/all")
                    .valuePath("cca2")
                    .labelPath("name.common")
                    .build())));
  }

  private static List<ServerSkeleton.GeneratedFile> generated() {
    var document =
        OpenApiEmitter.emit(
            "Orders API",
            OpenApiEmitter.Declarations.ofViews(List.of()).withCatalogue(catalogue()));
    return ServerSkeleton.generate(document, OPTIONS);
  }

  private static String contentOf(String pathSuffix) {
    return generated().stream()
        .filter(file -> file.path().endsWith(pathSuffix))
        .map(ServerSkeleton.GeneratedFile::content)
        .findFirst()
        .orElseThrow(() -> new AssertionError("not generated: " + pathSuffix));
  }

  @Test
  void aRunnableModuleComesOut() {
    var paths = generated().stream().map(ServerSkeleton.GeneratedFile::path).toList();
    assertThat(paths)
        .contains(
            "pom.xml",
            "README.md",
            "src/main/java/com/acme/orders/Application.java",
            "src/main/java/com/acme/orders/api/OrdersApi.java",
            "src/main/java/com/acme/orders/api/OrdersController.java");
  }

  @Test
  void anEndpointSomebodyElseServesGetsNoController() {
    // The whole point of provenance. A controller for restcountries.com would be nonsense.
    var all = generated().stream().map(ServerSkeleton.GeneratedFile::content).toList().toString();
    assertThat(all).doesNotContain("restcountries.com");
    assertThat(all).doesNotContain("v3.1/all");
  }

  @Test
  void nothingGeneratedIsAPlaceAHumanWouldWriteCode() {
    // The invariant the whole design rests on: never mix generated and hand-written code in one
    // file.
    // No adapter, no service, no TODO for somebody to fill in and lose on the next run.
    var all = generated();
    assertThat(all.stream().map(ServerSkeleton.GeneratedFile::path))
        .noneMatch(
            path -> path.contains("Adapter") || path.contains("Service") || path.contains("Impl"));
    assertThat(all.stream().map(ServerSkeleton.GeneratedFile::content).toList().toString())
        .doesNotContain("TODO");
  }

  @Test
  void aNamedSourceNamesTheMethodAndTheReturnType() {
    // Identity earned by the catalogue: the method is `orders`, not something mangled out of a
    // path.
    var port = contentOf("OrdersApi.java");
    assertThat(port).contains("OrdersResponse orders(");
    // The parameter is a String here because only the CATALOGUE declared this call, and an entry
    // has
    // no place to state a parameter's type — the view that references it is where the type lives
    // (see
    // OpenApiDerivationTest.aParameterIsTypedFromTheFieldItNames).
    assertThat(port).contains("String since");
    // An action answers one thing, so it must not be described as an array of them.
    assertThat(port).contains("Map<String, Object> approve()");
  }

  @Test
  void theControllerOnlyDelegates() {
    // It holds no logic on purpose, which is what makes rewriting it on every build harmless.
    var controller = contentOf("OrdersController.java");
    assertThat(controller).contains("@GetMapping(\"/api/orders\")");
    assertThat(controller).contains("return api.orders(since);");
    assertThat(controller).contains("@PostMapping(\"/api/orders/approve\")");
  }

  @Test
  void theResponseRecordsMirrorTheShapeTheScreenReads() {
    var response = contentOf("model/OrdersResponse.java");
    assertThat(response).contains("public record OrdersResponse(");
    // The envelope: the items array under its declared path, and the server-side total beside it.
    assertThat(response).contains("List<OrdersDataItem> data");
    assertThat(response).contains("OrdersMeta meta");
    assertThat(contentOf("model/OrdersMeta.java")).contains("Integer total");
    // Each nested object gets its own record instead of becoming an untyped map, so the shape is
    // navigable in the IDE rather than a map lookup that compiles whatever you type.
    var item = contentOf("model/OrdersDataItem.java");
    assertThat(item).contains("OrdersDataItemCustomer customer");
    assertThat(item).contains("String reference");
    assertThat(contentOf("model/OrdersDataItemCustomer.java")).contains("String name");
  }

  @Test
  void anUnimplementedPortStopsTheApplicationWithSomethingActionable() {
    // Not a stub returning empty: a server that starts without satisfying its contract answers
    // requests wrongly instead of visibly.
    var analyzer = contentOf("MissingApiPortFailureAnalyzer.java");
    assertThat(analyzer).contains("No implementation of");
    assertThat(analyzer).contains("Adapter");
    assertThat(contentOf("META-INF/spring.factories")).contains("FailureAnalyzer=");
  }

  @Test
  void thereIsNothingToGenerateWhenTheProjectOwesNothing() {
    var onlyExternal =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "countries",
                    RestDataSource.builder().url("https://restcountries.com/v3.1/all").build())));
    var document =
        OpenApiEmitter.emit(
            "x", OpenApiEmitter.Declarations.ofViews(List.of()).withCatalogue(onlyExternal));
    assertThat(ServerSkeleton.generate(document, OPTIONS)).isEmpty();
  }

  @Test
  void theGeneratedModelCompiles() {
    // A generator emitting source that does not compile costs more than writing the code by hand.
    // The
    // model records have no framework dependency, so they can be compiled right here; the port and
    // controller need Spring on the classpath and are covered by the demo build instead.
    var compiler = ToolProvider.getSystemJavaCompiler();
    assertThat(compiler).as("a JDK (not just a JRE) is needed to run this test").isNotNull();

    var sources =
        generated().stream()
            .filter(file -> file.path().contains("/api/model/"))
            .map(file -> (JavaFileObject) new InMemorySource(file.path(), file.content()))
            .toList();
    assertThat(sources).isNotEmpty();

    var diagnostics = new javax.tools.DiagnosticCollector<JavaFileObject>();
    var task =
        compiler.getTask(
            null,
            null,
            diagnostics,
            List.of("-d", System.getProperty("java.io.tmpdir") + "/mateu-skeleton-test"),
            null,
            sources);
    var ok = task.call();
    assertThat(ok)
        .as("the generated model did not compile: %s", diagnostics.getDiagnostics())
        .isTrue();
  }

  private static class InMemorySource extends SimpleJavaFileObject {

    private final String content;

    InMemorySource(String path, String content) {
      super(URI.create("string:///" + path), Kind.SOURCE);
      this.content = content;
    }

    @Override
    public CharSequence getCharContent(boolean ignoreEncodingErrors) {
      return new String(content.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }
  }
}
