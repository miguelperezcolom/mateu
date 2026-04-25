package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.UsingInterfacesUI;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DefaultRoutedClassResolverTest {

  @UI("/app")
  static class AppClass {}

  @Route("/items")
  static class ItemsPage {}

  RoutedClassProvider appProvider = () -> AppClass.class;
  RoutedClassProvider itemsProvider = () -> ItemsPage.class;

  DefaultRoutedClassResolver resolver;

  @BeforeEach
  void setUp() {
    resolver = new DefaultRoutedClassResolver(List.of(appProvider, itemsProvider));
  }

  private RunActionCommand command(String route) {
    var http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
    return new RunActionCommand(
        "base_url", "ui_id", route, "", "", Map.of(), Map.of(), "initiator", http, null, null);
  }

  @Test
  void resolveReturnsEmptyWhenNoMatch() {
    var result = resolver.resolve("/unknown", command("/unknown"));
    assertThat(result).isEmpty();
  }

  @Test
  void resolveAppFindsUIAnnotatedClass() {
    var result = resolver.resolveApp("/app", command("/app"));
    assertThat(result).isPresent();
    assertThat(result.get().routedClass()).isEqualTo(AppClass.class);
  }

  @Test
  void resolveAbsoluteFindsRouteAnnotatedClass() {
    var result = resolver.resolveAbsolute("/items", command("/items"));
    assertThat(result).isPresent();
    assertThat(result.get().routedClass()).isEqualTo(ItemsPage.class);
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
    var uiResolver = new DefaultRoutedClassResolver(List.of(() -> UsingInterfacesUI.class));
    assertThat(uiResolver.resolve("/", command("/"))).isNotNull();
  }
}
