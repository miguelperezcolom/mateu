package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
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
    assertThat(new PlainForm().component(new FakeHttpRequest())).isNotNull();
  }

  @Test
  void triggersReturnsNonNull() {
    assertThat(new PlainForm().triggers(new FakeHttpRequest())).isNotNull();
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
    var status = new Status(StatusType.SUCCESS, "Active");
    Badge badge = FormViewModel.mapStatusToBadge(status);
    assertThat(badge).isNotNull();
    assertThat(badge.text()).isEqualTo("Active");
  }

  @Test
  void toMapConvertsObject() {
    var form = new AnnotatedForm();
    var map = FormViewModel.toMap(form);
    assertThat(map).isNotNull();
    assertThat(map).containsKey("name");
    assertThat(map.get("name")).isEqualTo("test");
  }
}
