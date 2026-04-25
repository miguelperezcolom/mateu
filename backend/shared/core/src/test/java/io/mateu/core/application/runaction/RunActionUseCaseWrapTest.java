package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.Page;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RunActionUseCaseWrapTest extends RunActionUseCaseTest {

  FakeHttpRequest http;

  static class SimplePage implements Page {}

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
  }

  @Test
  void wrapSingleComponentReturnsServerSideDto() {
    var text = new Text("hello");
    var model = new SimpleForm();
    var result = wrap(text, model, "base", "route", "consumed", "init", http);
    assertThat(result).isNotNull();
    assertThat(result).isInstanceOf(ServerSideComponentDto.class);
  }

  @Test
  void wrapListOfComponentsReturnsServerSideDto() {
    List<io.mateu.uidl.fluent.Component> components = List.of(new Text("a"), new Text("b"));
    var model = new SimpleForm();
    var result = wrap(components, model, "base", "route", "consumed", "init", http);
    assertThat(result).isNotNull();
    assertThat(result).isInstanceOf(ServerSideComponentDto.class);
    var dto = (ServerSideComponentDto) result;
    assertThat(dto.children()).hasSize(2);
  }

  @Test
  void wrapPreservesModelClassName() {
    var model = new SimpleForm();
    var result =
        (ServerSideComponentDto)
            wrap(new Text("x"), model, "base", "route", "consumed", "init", http);
    assertThat(result.serverSideType()).isEqualTo(SimpleForm.class.getName());
  }

  @Test
  void handleWithEmptyActionReturnsResult() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base",
                    "ui",
                    "route",
                    "consumed",
                    "",
                    Map.of(),
                    Map.of(),
                    "init",
                    new FakeHttpRequest()
                        .storeRunActionRqDto(
                            RunActionRqDto.builder().componentState(Map.of()).build()),
                    SimpleForm.class.getName(),
                    null))
            .blockLast();
    assertThat(increment).isNotNull();
  }

  @Test
  void handlePageRouteReturnsResult() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base",
                    "ui",
                    "route_page",
                    "consumed",
                    "",
                    Map.of(),
                    Map.of(),
                    "init",
                    new FakeHttpRequest()
                        .storeRunActionRqDto(
                            RunActionRqDto.builder().componentState(Map.of()).build()),
                    SimpleForm.class.getName(),
                    null))
            .blockLast();
    assertThat(increment).isNotNull();
  }
}
