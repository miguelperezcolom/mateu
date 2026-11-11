package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.FormEditor;
import io.mateu.uidl.data.Workflow;
import org.junit.jupiter.api.Test;

/**
 * A {@code Workflow} / {@code FormEditor} with an id travels under it: every renderer writes the
 * edited definition into the state under the component's id, so the id is the view-model field
 * that receives it.
 */
class DefinitionEditorIdTest {

  @Test
  void aDeclaredIdIsTheComponentIdOnTheWire() {
    assertThat(WorkflowMapper.mapWorkflowToDto(Workflow.builder().id("definition").value("{}").build()).id())
        .isEqualTo("definition");
    assertThat(FormEditorMapper.mapFormEditorToDto(new FormEditor("form", "{}", null, null)).id())
        .isEqualTo("form");
  }

  @Test
  void withoutAnIdTheFillerStays() {
    assertThat(WorkflowMapper.mapWorkflowToDto(new Workflow("{}", null, null)).id()).isEqualTo("fieldId");
    assertThat(FormEditorMapper.mapFormEditorToDto(new FormEditor("{}", null, null)).id()).isEqualTo("fieldId");
  }
}
