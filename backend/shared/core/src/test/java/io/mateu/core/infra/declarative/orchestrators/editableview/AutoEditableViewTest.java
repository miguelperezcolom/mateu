package io.mateu.core.infra.declarative.orchestrators.editableview;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link AutoEditableView#save} must persist the entity the editor form bubbled up (so an embedded
 * editor's edits actually reach the mediator that handles save), falling back to the component
 * state when the action was not bubbled.
 */
class AutoEditableViewTest {

  static class Person {
    String name;
  }

  static class PersonView extends AutoEditableView<Person> {
    Person stored = new Person();

    @Override
    public Person load(HttpRequest httpRequest) {
      return stored;
    }

    @Override
    public void persist(Person entity, HttpRequest httpRequest) {
      stored = entity;
    }
  }

  @BeforeEach
  void setUp() {
    MateuInstanceFactory.setInstanceFactory(
        new InstanceFactory() {
          @Override
          public <T> T newInstance(Class<T> type, HttpRequest httpRequest) {
            return null;
          }

          @Override
          public <T> T newInstance(
              Class<T> type, Map<String, Object> data, HttpRequest httpRequest) {
            var person = new Person();
            person.name = (String) data.get("name");
            return type.cast(person);
          }
        });
  }

  @AfterEach
  void tearDown() {
    MateuInstanceFactory.setInstanceFactory(null);
  }

  @Test
  void savesEntityBubbledByTheEditorForm() {
    var view = new PersonView();

    view.save(
        new FakeHttpRequest(
            RunActionRqDto.builder()
                .parameters(Map.of("initiatorState", Map.of("name", "edited")))
                .componentState(Map.of("name", "stale"))
                .build()));

    assertThat(view.stored.name).isEqualTo("edited");
  }

  @Test
  void fallsBackToComponentStateWhenNotBubbled() {
    var view = new PersonView();

    view.save(
        new FakeHttpRequest(
            RunActionRqDto.builder().componentState(Map.of("name", "fromComponentState")).build()));

    assertThat(view.stored.name).isEqualTo("fromComponentState");
  }
}
