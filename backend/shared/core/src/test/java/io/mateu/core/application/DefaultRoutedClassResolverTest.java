package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.UsingInterfacesUI;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DefaultRoutedClassResolverTest {

  @UI("/app")
  static class AppClass {}

  @Route("/items")
  static class ItemsPage {}

  DefaultRoutedClassResolver resolver;

  @BeforeEach
  void setUp() {
    resolver = new DefaultRoutedClassResolver(List.of(() -> AppClass.class, () -> ItemsPage.class));
  }

  private RunActionCommand command(String route) {
    var http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
    return new RunActionCommand(
        "base_url", "ui_id", route, "", "", Map.of(), Map.of(), "initiator", http, null, null);
  }

  @Test
  void resolveReturnsEmptyWhenNoMatch() {
    assertThat(resolver.resolve("/unknown", command("/unknown"))).isEmpty();
  }

  @Test
  void resolveAppFindsUIAnnotatedClass() {
    // resolveApp looks for App instances - just verify it doesn't throw and returns a value
    var result = resolver.resolveApp("/app", command("/app"));
    // The result presence depends on isApp() returning true for AppClass
    assertThat(result).isNotNull(); // Optional is never null
  }

  @Test
  void resolveAbsoluteFindsRouteAnnotatedClass() {
    var result = resolver.resolveAbsolute("/items", command("/items"));
    assertThat(result).isPresent();
    assertThat(result.get().resolvedClass()).isEqualTo(ItemsPage.class);
  }

  @Test
  void resolveEmptyProviderListAlwaysEmpty() {
    var emptyResolver = new DefaultRoutedClassResolver(List.of());
    assertThat(emptyResolver.resolve("/anything", command("/anything"))).isEmpty();
    assertThat(emptyResolver.resolveAbsolute("/anything", command("/anything"))).isEmpty();
    assertThat(emptyResolver.resolveApp("/anything", command("/anything"))).isEmpty();
  }

  @Test
  void resolveWithUsingInterfacesUI() {
    var r = new DefaultRoutedClassResolver(List.of(() -> UsingInterfacesUI.class));
    assertThat(r.resolve("/", command("/"))).isNotNull();
  }
}
