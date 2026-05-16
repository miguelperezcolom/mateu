package io.mateu.annotationprocessing.indexer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.Route;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Optional;
import java.util.Set;
import javax.annotation.processing.Filer;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.tools.FileObject;
import org.junit.Test;

public class RouteIndexerProcessorTest {

  // ---------------------------------------------------------------------------
  // Helper
  // ---------------------------------------------------------------------------

  private TestContext buildContext(String className, String simpleName, String path, String parent)
      throws IOException {
    var processor = new RouteIndexerProcessor();

    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var fileObject = mock(FileObject.class);
    when(fileObject.openWriter()).thenReturn(writer);
    when(filer.createResource(any(), anyString(), anyString())).thenReturn(fileObject);

    var routeAnnotation = mock(Route.class);
    when(routeAnnotation.value()).thenReturn(path);
    when(routeAnnotation.parentRoute())
        .thenReturn(Optional.ofNullable(parent).orElse(RouteConstants.NO_PARENT_ROUTE));
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
        .thenAnswer(inv -> Set.of(element));

    return new TestContext(processor, filer, writer, annotations, roundEnv);
  }

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  @Test
  public void processReturnsFalseSoFrameworkAPCanAlsoSeeAnnotation() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products", "_empty");
    when(ctx.roundEnv.processingOver()).thenReturn(false);

    boolean result = ctx.processor.process(ctx.annotations, ctx.roundEnv);

    assertThat(result).isFalse();
  }

  @Test
  public void noIndexFileWrittenUntilProcessingOver() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products", "_empty");
    when(ctx.roundEnv.processingOver()).thenReturn(false);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    verify(ctx.filer, never()).createResource(any(), anyString(), anyString());
  }

  @Test
  public void indexFileWrittenOnProcessingOver() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products", "_empty");
    // First round: accumulate entries
    when(ctx.roundEnv.processingOver()).thenReturn(false);
    ctx.processor.process(ctx.annotations, ctx.roundEnv);
    // Final round
    when(ctx.roundEnv.processingOver()).thenReturn(true);
    when(ctx.roundEnv.getElementsAnnotatedWith(any(TypeElement.class))).thenAnswer(inv -> Set.of());
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    verify(ctx.filer).createResource(any(), eq(""), eq("META-INF/mateu/route-registrations"));
  }

  @Test
  public void writtenIndexContainsClassName() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products", "_empty");
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.writer.toString();
    assertThat(content).contains("class=com.example.ProductsPage");
    assertThat(content).contains("simpleClassName=ProductsPage");
  }

  @Test
  public void writtenIndexContainsRoutesInPipeSeparatedFormat() throws IOException {
    var ctx = buildContext("com.example.ProductsPage", "ProductsPage", "/products", "_empty");
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.writer.toString();
    // Format: value|parentRoute|uis
    assertThat(content).contains("routes=/products|_empty|");
  }

  @Test
  public void multipleRouteAnnotationsAreSemicolonSeparated() throws IOException {
    var processor = new RouteIndexerProcessor();
    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var fileObject = mock(FileObject.class);
    when(fileObject.openWriter()).thenReturn(writer);
    when(filer.createResource(any(), anyString(), anyString())).thenReturn(fileObject);

    var routeA = mock(Route.class);
    when(routeA.value()).thenReturn("/orders/:id");
    when(routeA.parentRoute()).thenReturn("/orders");
    when(routeA.uis()).thenReturn(new String[0]);

    var routeB = mock(Route.class);
    when(routeB.value()).thenReturn("/orders/:id/edit");
    when(routeB.parentRoute()).thenReturn("/orders/:id");
    when(routeB.uis()).thenReturn(new String[0]);

    var element = mock(TypeElement.class);
    var qualifiedName = mock(Name.class);
    when(qualifiedName.toString()).thenReturn("com.example.OrderDetailPage");
    when(element.getQualifiedName()).thenReturn(qualifiedName);
    var simpleName = mock(Name.class);
    when(simpleName.toString()).thenReturn("OrderDetailPage");
    when(element.getSimpleName()).thenReturn(simpleName);
    when(element.getAnnotation(any())).thenReturn(null);
    when(element.getAnnotationsByType(Route.class)).thenReturn(new Route[] {routeA, routeB});

    var annotation = mock(TypeElement.class);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .thenAnswer(inv -> Set.of(element));
    when(roundEnv.processingOver()).thenReturn(true);

    processor.process(Set.of(annotation), roundEnv);

    String content = writer.toString();
    // Both routes must appear, separated by ;
    assertThat(content).contains("/orders/:id|/orders|");
    assertThat(content).contains("/orders/:id/edit|/orders/:id|");
    assertThat(content).contains(";");
  }

  @Test
  public void multipleRouteClassesAreSeparatedByDashes() throws IOException {
    var processor = new RouteIndexerProcessor();
    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var fileObject = mock(FileObject.class);
    when(fileObject.openWriter()).thenReturn(writer);
    when(filer.createResource(any(), anyString(), anyString())).thenReturn(fileObject);

    var elemA = mockElement("com.example.ProductsPage", "ProductsPage", "/products", "_empty");
    var elemB = mockElement("com.example.OrdersPage", "OrdersPage", "/orders", "_empty");

    var annotation = mock(TypeElement.class);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .thenAnswer(inv -> Set.of(elemA, elemB));
    when(roundEnv.processingOver()).thenReturn(true);

    processor.process(Set.of(annotation), roundEnv);

    String content = writer.toString();
    assertThat(content).contains("---");
    assertThat(content).contains("com.example.ProductsPage");
    assertThat(content).contains("com.example.OrdersPage");
  }

  @Test
  public void noIndexFileWrittenWhenNoRouteClassesPresent() throws IOException {
    var processor = new RouteIndexerProcessor();
    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var annotation = mock(TypeElement.class);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class))).thenAnswer(inv -> Set.of());
    when(roundEnv.processingOver()).thenReturn(true);

    processor.process(Set.of(annotation), roundEnv);

    verify(filer, never()).createResource(any(), anyString(), anyString());
  }

  // ---------------------------------------------------------------------------
  // Helper
  // ---------------------------------------------------------------------------

  private TypeElement mockElement(String className, String simpleName, String path, String parent) {
    var routeAnnotation = mock(Route.class);
    when(routeAnnotation.value()).thenReturn(path);
    when(routeAnnotation.parentRoute()).thenReturn(parent);
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
    return element;
  }

  private record TestContext(
      RouteIndexerProcessor processor,
      Filer filer,
      StringWriter writer,
      Set<TypeElement> annotations,
      RoundEnvironment roundEnv) {}
}
