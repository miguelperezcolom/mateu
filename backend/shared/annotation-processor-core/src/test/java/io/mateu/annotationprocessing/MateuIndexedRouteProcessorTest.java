package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.lang.model.util.Elements;
import org.junit.Before;
import org.junit.Test;

public class MateuIndexedRouteProcessorTest {

  private final List<Set<String>> indexedRuns = new ArrayList<>();

  private MateuIndexedRouteProcessor processor;
  private TypeElement routeAnnotationType;

  @Before
  public void setUp() {
    processor =
        new MateuIndexedRouteProcessor() {
          @Override
          protected void processIndexedRoutes(Set<String> compiledClassNames) {
            indexedRuns.add(compiledClassNames);
          }
        };

    routeAnnotationType = mock(TypeElement.class);
    Elements elements = mock(Elements.class);
    when(elements.getTypeElement(anyString())).thenReturn(routeAnnotationType);
    ProcessingEnvironment processingEnv = mock(ProcessingEnvironment.class);
    when(processingEnv.getElementUtils()).thenReturn(elements);
    processor.init(processingEnv);
  }

  private RoundEnvironment round(boolean over, TypeElement... annotatedClasses) {
    RoundEnvironment roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.processingOver()).thenReturn(over);
    doReturn(Set.of(annotatedClasses)).when(roundEnv).getElementsAnnotatedWith(routeAnnotationType);
    return roundEnv;
  }

  private TypeElement routedClass(String qualifiedName) {
    TypeElement element = mock(TypeElement.class);
    Name name = mock(Name.class);
    when(name.toString()).thenReturn(qualifiedName);
    when(element.getQualifiedName()).thenReturn(name);
    return element;
  }

  @Test
  public void runsIndexedProcessingOnFinalRoundWhenNoSourceRoutes() {
    assertThat(processor.process(Set.of(), round(false))).isFalse();
    assertThat(processor.process(Set.of(), round(true))).isFalse();

    assertThat(indexedRuns).containsExactly(Set.of());
  }

  @Test
  public void skipsIndexedProcessingWhenSourceRoutesArePresent() {
    // RouteAnnotationProcessor already handles the index in this case.
    processor.process(Set.of(), round(false, routedClass("com.example.HomePage")));
    processor.process(Set.of(), round(true));

    assertThat(indexedRuns).isEmpty();
  }

  @Test
  public void runsIndexedProcessingOnlyOnceEvenWithSeveralFinalRounds() {
    processor.process(Set.of(), round(true));
    processor.process(Set.of(), round(true));

    assertThat(indexedRuns).hasSize(1);
  }
}
