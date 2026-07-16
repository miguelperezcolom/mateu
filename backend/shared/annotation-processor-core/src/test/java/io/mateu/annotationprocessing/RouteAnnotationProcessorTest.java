package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import io.mateu.uidl.annotations.Route;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Filer;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.element.Element;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class RouteAnnotationProcessorTest {

  // ---------------------------------------------------------------------------
  // indexed processing — once per compilation
  // ---------------------------------------------------------------------------

  @Test
  public void indexedRoutesAreProcessedOnlyOnceAcrossRounds() {
    var runs = new java.util.ArrayList<Set<String>>();
    var processor =
        new RouteAnnotationProcessor() {
          @Override
          protected void processIndexedRoutes(Set<String> compiledClassNames) {
            runs.add(compiledClassNames);
          }
        };
    RoundEnvironment roundEnv = mock(RoundEnvironment.class);

    processor.process(Set.of(), roundEnv);
    processor.process(Set.of(), roundEnv);

    assertThat(runs).hasSize(1);
  }

  // ---------------------------------------------------------------------------
  // toRegex — static utility
  // ---------------------------------------------------------------------------

  @Test
  public void toRegexHandlesNull() {
    assertThat(RouteAnnotationProcessor.toRegex(null)).isEqualTo("");
  }

  @Test
  public void toRegexConvertsPathParams() {
    assertThat(RouteAnnotationProcessor.toRegex("/users/:id")).isEqualTo("/users/.*");
    assertThat(RouteAnnotationProcessor.toRegex("/users/:id/orders/:orderId"))
        .isEqualTo("/users/.*/orders/.*");
  }

  @Test
  public void toRegexKeepsStaticSegments() {
    assertThat(RouteAnnotationProcessor.toRegex("/users/list")).isEqualTo("/users/list");
    assertThat(RouteAnnotationProcessor.toRegex("")).isEqualTo("");
  }

  // ---------------------------------------------------------------------------
  // parseIndexFile — pure parsing logic
  // ---------------------------------------------------------------------------

  @Test
  public void parseIndexFileReturnsTwoEntries() throws IOException {
    URL url = getClass().getResource("/route-registrations-sample.txt");

    List<Map<String, String>> entries = IndexedUIProcessor.parseIndexFile(url);

    assertThat(entries).hasSize(2);
  }

  @Test
  public void parseIndexFileParsesSingleRoute() throws IOException {
    URL url = getClass().getResource("/route-registrations-sample.txt");

    List<Map<String, String>> entries = IndexedUIProcessor.parseIndexFile(url);

    Map<String, String> first = entries.get(0);
    assertThat(first.get("class")).isEqualTo("com.example.ProductsPage");
    assertThat(first.get("simpleClassName")).isEqualTo("ProductsPage");
    assertThat(first.get("routes")).isEqualTo("/products|_empty|");
  }

  @Test
  public void parseIndexFileParsesMultipleRoutes() throws IOException {
    URL url = getClass().getResource("/route-registrations-sample.txt");

    List<Map<String, String>> entries = IndexedUIProcessor.parseIndexFile(url);

    Map<String, String> second = entries.get(1);
    assertThat(second.get("class")).isEqualTo("com.example.OrderDetailPage");
    // Two routes separated by ; with value|parentRoute|uis format
    assertThat(second.get("routes")).contains("/orders/:id|/orders|").contains(";");
  }

  // ---------------------------------------------------------------------------
  // process() — source file generation
  // ---------------------------------------------------------------------------

  private RouteTestContext buildContext(String className, String simpleName, String path)
      throws IOException {
    var processor = new RouteAnnotationProcessor();

    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var javaFileObject = mock(JavaFileObject.class);
    when(javaFileObject.openWriter())
        .thenAnswer(
            inv ->
                new StringWriter() {
                  @Override
                  public void close() {
                    writer.append(this.toString());
                  }
                });
    when(filer.createSourceFile(anyString())).thenReturn(javaFileObject);

    var routeAnnotation = mock(Route.class);
    when(routeAnnotation.value()).thenReturn(path);
    when(routeAnnotation.parentRoute()).thenReturn("_empty");
    when(routeAnnotation.uis()).thenReturn(new String[0]);

    var element = mock(TypeElement.class);
    var qualifiedName = mock(Name.class);
    when(qualifiedName.toString()).thenReturn(className);
    when(element.getQualifiedName()).thenReturn(qualifiedName);
    var simpleName2 = mock(Name.class);
    when(simpleName2.toString()).thenReturn(simpleName);
    when(element.getSimpleName()).thenReturn(simpleName2);
    when(element.getAnnotation(any())).thenReturn(null);
    when(element.getAnnotationsByType(Route.class)).thenReturn(new Route[] {routeAnnotation});

    var annotation = mock(TypeElement.class);
    Set<TypeElement> annotations = Set.of(annotation);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .thenAnswer(inv -> Set.<Element>of(element));
    when(roundEnv.processingOver()).thenReturn(false);

    return new RouteTestContext(processor, filer, writer, annotations, roundEnv);
  }

  @Test
  public void processReturnsTrueForRouteAnnotation() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products");
    assertThat(ctx.processor.process(ctx.annotations, ctx.roundEnv)).isTrue();
  }

  @Test
  public void processCreatesRouteResolverFile() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    var captor = ArgumentCaptor.forClass(String.class);
    verify(ctx.filer, atLeast(1)).createSourceFile(captor.capture());

    assertThat(captor.getAllValues()).contains("com.example.ProductsPageRouteResolver");
  }

  @Test
  public void processedRouteResolverContentIncludesClassName() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.capturedContent();
    assertThat(content).contains("ProductsPage");
  }

  @Test
  public void processedRouteResolverContentIncludesRoute() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.capturedContent();
    assertThat(content).contains("/products");
  }

  @Test
  public void processIndexedRouteGeneratesResolverForNonCompiledClass() throws IOException {
    // The test classpath has META-INF/mateu/route-registrations with com.example.IndexedRoute.
    // Since ProductsPage is compiled but IndexedRoute is not, processIndexedRoutes() should
    // generate a resolver for IndexedRoute.
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    var captor = ArgumentCaptor.forClass(String.class);
    verify(ctx.filer, atLeast(2)).createSourceFile(captor.capture());

    assertThat(captor.getAllValues()).contains("com.example.IndexedRouteRouteResolver");
  }

  @Test
  public void processIndexedRouteSkipsCompiledClass() throws IOException {
    // When the compiled class IS the indexed class, it should not be duplicated.
    var ctx = buildContext("com.example.IndexedRoute", "IndexedRoute", "/indexed-route");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    var captor = ArgumentCaptor.forClass(String.class);
    verify(ctx.filer, times(1)).createSourceFile(captor.capture());
    long count =
        captor.getAllValues().stream()
            .filter(n -> n.equals("com.example.IndexedRouteRouteResolver"))
            .count();
    assertThat(count).isEqualTo(1);
  }

  // ---------------------------------------------------------------------------
  // Helper record
  // ---------------------------------------------------------------------------

  private record RouteTestContext(
      RouteAnnotationProcessor processor,
      Filer filer,
      StringWriter writer,
      Set<TypeElement> annotations,
      RoundEnvironment roundEnv) {

    String capturedContent() {
      return writer.toString();
    }
  }
}
