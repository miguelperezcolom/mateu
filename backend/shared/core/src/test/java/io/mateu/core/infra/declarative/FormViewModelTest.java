package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FormViewModelTest {

  @Title("My Form")
  static class AnnotatedForm extends FormViewModel {
    public String name = "test";
    public int count = 5;
  }

  static class PlainForm extends FormViewModel {
    public String field = "value";
  }

  FakeHttpRequest http;

  @BeforeEach
  void setUp() {
    http = new FakeHttpRequest();
    http.storeRunActionRqDto(RunActionRqDto.builder().componentState(Map.of()).build());
  }

  @Test
  void actionsAreReturned() {
    assertThat(new PlainForm().actions()).isNotNull();
  }

  @Test
  void rulesAreReturned() {
    assertThat(new PlainForm().rules()).isNotNull();
  }

  @Test
  void validationDtosAreReturned() {
    assertThat(new PlainForm().validationDtos()).isNotNull();
  }

  @Test
  void titleFromAnnotation() {
    assertThat(new AnnotatedForm().title()).isEqualTo("My Form");
  }

  @Test
  void titleFromClassName() {
    assertThat(new PlainForm().title()).isNotNull();
  }

  @Test
  void entityClassReturnsFormClass() {
    assertThat(new PlainForm().entityClass()).isEqualTo(PlainForm.class);
  }

  @Test
  void componentReturnsNonNull() {
    assertThat(new PlainForm().component(http)).isNotNull();
  }

  @Test
  void triggersReturnsNonNull() {
    assertThat(new PlainForm().triggers(http)).isNotNull();
  }

  @Test
  void createKpisForObject() {
    assertThat(FormViewModel.createKpis(new PlainForm())).isNotNull();
  }

  @Test
  void createBadgesForObject() {
    assertThat(FormViewModel.createBadges(new PlainForm())).isNotNull();
  }

  @Test
  void mapStatusToBadge() {
    Badge badge = FormViewModel.mapStatusToBadge(new Status(StatusType.SUCCESS, "Active"));
    assertThat(badge).isNotNull();
    assertThat(badge.text()).isEqualTo("Active");
  }

  @Test
  void toMapConvertsObject() {
    var map = FormViewModel.toMap(new AnnotatedForm());
    assertThat(map).isNotNull().containsKey("name");
    assertThat(map.get("name")).isEqualTo("test");
  }
}
