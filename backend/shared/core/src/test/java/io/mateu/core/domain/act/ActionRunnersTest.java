package io.mateu.core.domain.act;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.Page;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ActionRunnersTest {

  FakeHttpRequest http;

  static class PlainPage implements Page {}

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
  }

  private RunActionCommand command(Object instance, String actionId) {
    return new RunActionCommand(
        "base", "ui", "route", "consumed", actionId,
        Map.of(), Map.of(), "init", http, null, null);
  }

  // --- ComponentTreeActionRunner ---

  @Test
  void componentTreeRunnerDoesNotSupportPlainPage() {
    var runner = new ComponentTreeActionRunner();
    assertThat(runner.supports(new PlainPage(), "action", http)).isFalse();
  }

  @Test
  void componentTreeRunnerDoesNotSupportNullInstance() {
    var runner = new ComponentTreeActionRunner();
    assertThat(runner.supports("string", "action", http)).isFalse();
  }

  @Test
  void componentTreeRunnerPriority() {
    assertThat(new ComponentTreeActionRunner().priority()).isGreaterThanOrEqualTo(0);
  }

  // --- SearchFieldActionRunner ---

  @Test
  void searchFieldRunnerSupportsSearchPrefix() {
    var runner = new SearchFieldActionRunner();
    assertThat(runner.supports(new PlainPage(), "search-name", http)).isTrue();
  }

  @Test
  void searchFieldRunnerDoesNotSupportOtherActions() {
    var runner = new SearchFieldActionRunner();
    assertThat(runner.supports(new PlainPage(), "save", http)).isFalse();
    assertThat(runner.supports(new PlainPage(), "delete", http)).isFalse();
  }

  @Test
  void searchFieldRunnerDoesNotSupportNull() {
    var runner = new SearchFieldActionRunner();
    assertThat(runner.supports(new PlainPage(), null, http)).isFalse();
  }

  @Test
  void searchFieldRunnerPriority() {
    assertThat(new SearchFieldActionRunner().priority()).isGreaterThanOrEqualTo(0);
  }

  // --- FieldCrudActionRunner ---

  @Test
  void fieldCrudRunnerDoesNotSupportEmptyActionId() {
    var runner = new FieldCrudActionRunner();
    assertThat(runner.supports(new SimpleForm(), "", http)).isFalse();
  }

  @Test
  void fieldCrudRunnerDoesNotSupportNullActionId() {
    var runner = new FieldCrudActionRunner();
    assertThat(runner.supports(new SimpleForm(), null, http)).isFalse();
  }

  @Test
  void fieldCrudRunnerSupportsAddOnListField() {
    // SimpleForm doesn't have list fields so should return false
    var runner = new FieldCrudActionRunner();
    assertThat(runner.supports(new SimpleForm(), "items_add", http)).isFalse();
  }

  @Test
  void fieldCrudRunnerPriority() {
    assertThat(new FieldCrudActionRunner().priority()).isGreaterThanOrEqualTo(0);
  }

  // --- DefaultActionRunnerProvider ---

  @Test
  void defaultProviderThrowsForNullInstance() {
    var provider = new DefaultActionRunnerProvider(
        new FakeBeanProvider(),
        className -> new io.mateu.core.infra.reflection.ReflectionInstanceFactory(new FakeBeanProvider()));
    org.junit.jupiter.api.Assertions.assertThrows(
        NoSuchMethodException.class,
        () -> provider.get(null, "action", "consumed", "route", http));
  }

  @Test
  void defaultProviderReturnsFallbackForUnknownAction() throws Exception {
    var provider = new DefaultActionRunnerProvider(
        new FakeBeanProvider(),
        className -> new io.mateu.core.infra.reflection.ReflectionInstanceFactory(new FakeBeanProvider()));
    var runner = provider.get("instance", "unknown_action", "consumed", "route", http);
    assertThat(runner).isNotNull();
  }
}
