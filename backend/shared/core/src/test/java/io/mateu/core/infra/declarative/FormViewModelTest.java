package io.mateu.core.infra.declarative;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import java.util.Map;
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
    var form = new PlainForm();
    assertThat(form.actions()).isNotNull();
  }

  @Test
  void rulesAreReturned() {
    var form = new PlainForm();
    assertThat(form.rules()).isNotNull();
  }

  @Test
  void validationDtosAreReturned() {
    var form = new PlainForm();
    assertThat(form.validationDtos()).isNotNull();
  }

  @Test
  void titleFromAnnotation() {
    var form = new AnnotatedForm();
    assertThat(form.title()).isEqualTo("My Form");
  }

  @Test
  void titleFromClassName() {
    var form = new PlainForm();
    // Falls back to class name humanized
    assertThat(form.title()).isNotNull();
  }

  @Test
  void entityClassReturnsFormClass() {
    var form = new PlainForm();
    assertThat(form.entityClass()).isEqualTo(PlainForm.class);
  }

  @Test
  void componentReturnsNonNull() {
    var form = new PlainForm();
    var http = new FakeHttpRequest();
    var component = form.component(http);
    assertThat(component).isNotNull();
  }

  @Test
  void triggersReturnsNonNull() {
    var form = new PlainForm();
    var http = new FakeHttpRequest();
    assertThat(form.triggers(http)).isNotNull();
  }

  @Test
  void createKpisForObject() {
    var form = new PlainForm();
    var kpis = FormViewModel.createKpis(form);
    assertThat(kpis).isNotNull();
  }

  @Test
  void createBadgesForObject() {
    var form = new PlainForm();
    var badges = FormViewModel.createBadges(form);
    assertThat(badges).isNotNull();
  }

  @Test
  void mapStatusToBadge() {
    var status = new Status("Active", StatusType.success);
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
