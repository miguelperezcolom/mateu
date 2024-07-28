package io.mateu.core.domain.model.metadataBuilders;

import io.mateu.core.domain.model.editors.MethodParametersEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.annotations.SameLine;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.core.domain.model.util.Helper;
import io.mateu.dtos.*;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MethodParametersEditorMetadataBuilder {

  final FieldMetadataBuilder fieldMetadataBuilder;
  final ReflectionHelper reflectionHelper;

  public Form build(String stepId, MethodParametersEditor uiInstance) {
    Form form =
        Form.builder()
            .title(getCaption(uiInstance))
            .subtitle(getSubtitle(uiInstance))
            .status(null)
            .readOnly(false)
            .badges(List.of())
            .tabs(List.of())
            .sections(getSections(stepId, uiInstance))
            .actions(List.of())
            .mainActions(getMainActions(stepId, uiInstance))
            .build();
    return form;
  }

  private String getSubtitle(Object uiInstance) {
    return null;
  }

  private List<Action> getMainActions(String stepId, Object uiInstance) {
    List<Action> actions = new ArrayList<>();
    if (true) {
      Action action =
          Action.builder()
              .id("run")
              .caption("Run")
              .type(ActionType.Primary)
              .validationRequired(true)
              .visible(true)
              .build();
      actions.add(action);
    }
    return actions;
  }

  private List<Section> getSections(String stepId, MethodParametersEditor methodParametersEditor) {
    List<Section> sections = new ArrayList<>();
    Section section = null;
    FieldGroup fieldGroup = null;
    FieldGroupLine fieldGroupLine = null;

    Method m =
        reflectionHelper.getMethod(
            methodParametersEditor.getType(), methodParametersEditor.getMethodId());

    List<FieldInterfaced> allEditableFields =
        reflectionHelper.getAllFields(m).stream()
            .filter(f -> !f.isAnnotationPresent(UseCrud.class))
            .filter(f -> !ServerHttpRequest.class.isAssignableFrom(f.getType()))
            .collect(Collectors.toList());
    int paramPos = 0;
    for (FieldInterfaced fieldInterfaced : allEditableFields) {
      if (section == null
          || fieldInterfaced.isAnnotationPresent(
              io.mateu.core.domain.uidefinition.shared.annotations.Section.class)) {
        String caption = "";
        boolean card = true;
        if (fieldInterfaced.isAnnotationPresent(
            io.mateu.core.domain.uidefinition.shared.annotations.Section.class)) {
          io.mateu.core.domain.uidefinition.shared.annotations.Section annotation =
              fieldInterfaced.getAnnotation(
                  io.mateu.core.domain.uidefinition.shared.annotations.Section.class);
          caption = annotation.value();
          card = annotation.card();
        }
        section =
            Section.builder()
                .caption(caption)
                .readOnly(false)
                .fieldGroups(new ArrayList<>())
                .type(card ? SectionType.Card : SectionType.Transparent)
                .build();
        sections.add(section);
        fieldGroup = null;
      }
      if (fieldGroup == null
          || fieldInterfaced.isAnnotationPresent(
              io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {
        String caption = "";
        if (fieldInterfaced.isAnnotationPresent(
            io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {
          caption =
              fieldInterfaced
                  .getAnnotation(
                      io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)
                  .value();
        }
        fieldGroup = FieldGroup.builder().caption(caption).lines(new ArrayList<>()).build();
        section.getFieldGroups().add(fieldGroup);
      }
      if (fieldGroupLine == null || !fieldInterfaced.isAnnotationPresent(SameLine.class)) {
        fieldGroupLine = FieldGroupLine.builder().fields(new ArrayList<>()).build();
        fieldGroup.getLines().add(fieldGroupLine);
      }
      fieldGroupLine
          .getFields()
          .add(fieldMetadataBuilder.getField(methodParametersEditor, fieldInterfaced));
    }

    fillSectionIds(sections);

    return sections;
  }

  private void fillSectionIds(List<Section> sections) {
    int fieldPos = 0;
    int i = 0;
    for (Section s : sections) {
      s.setId("section_" + i++);
      int j = 0;
      for (FieldGroup g : s.getFieldGroups()) {
        g.setId("fieldgroup_" + i + "_" + j++);
        for (FieldGroupLine l : g.getLines()) {
          for (Field f : l.getFields()) {
            f.setId("param_" + fieldPos++);
          }
        }
      }
    }
  }

  private String getCaption(MethodParametersEditor methodParametersEditor) {
    return Helper.capitalize(methodParametersEditor.getMethodId());
  }
}
