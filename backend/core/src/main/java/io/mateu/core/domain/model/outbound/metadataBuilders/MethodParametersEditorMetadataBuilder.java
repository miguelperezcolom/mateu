package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.dtos.*;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class MethodParametersEditorMetadataBuilder {

  final FormMetadataBuilder formMetadataBuilder;
  final FieldMetadataBuilder fieldMetadataBuilder;
  final ReflectionHelper reflectionHelper;
  final Humanizer humanizer;

  public Form build(MethodParametersEditor uiInstance) {
    return new Form(
        null,
        getCaption(uiInstance),
        false,
        getSubtitle(uiInstance),
        null,
        List.of(),
        List.of(),
        List.of(),
        getSections(uiInstance),
        List.of(),
        getMainActions(uiInstance),
        List.of(),
        List.of());
  }

  private String getSubtitle(Object uiInstance) {
    return null;
  }

  private List<Action> getMainActions(Object uiInstance) {
    List<Action> actions = new ArrayList<>();
    Action action =
        new Action(
            "run",
            null,
            "Run",
            ActionType.Primary,
            true,
            true,
            false,
            false,
            null,
            ActionTarget.View,
            null,
            null,
            null,
            true,
                ActionPosition.Right);
    actions.add(action);
    return actions;
  }

  private List<Section> getSections(MethodParametersEditor methodParametersEditor) {
    Method m =
        reflectionHelper.getMethod(
            methodParametersEditor.getType(), methodParametersEditor.getMethodId());

    List<Field> allEditableFields =
        reflectionHelper.getAllFields(m).stream()
            .filter(f -> !f.isAnnotationPresent(UseCrud.class))
            .filter(f -> !ServerHttpRequest.class.isAssignableFrom(f.getType()))
            .collect(Collectors.toList());

    List<Section> sections = formMetadataBuilder.createSections(null, allEditableFields);

    sections = fillSectionIds(sections);

    return sections;
  }

  private List<Section> fillSectionIds(List<Section> sections) {
    AtomicInteger i = new AtomicInteger();
    AtomicInteger fieldPos = new AtomicInteger();
    return sections.stream()
        .map(
            s ->
                new Section(
                    "section_" + i.getAndIncrement(),
                    s.tabId(),
                    s.caption(),
                    s.description(),
                    s.readOnly(),
                    s.type(),
                    s.leftSideImageUrl(),
                    s.topImageUrl(),
                    IntStream.range(0, s.fieldGroups().size())
                        .mapToObj(
                            j ->
                                new FieldGroup(
                                    "fieldgroup_" + i + "_" + j,
                                    s.fieldGroups().get(j).caption(),
                                    s.fieldGroups().get(j).lines().stream()
                                        .map(
                                            l ->
                                                new FieldGroupLine(
                                                    l.fields().stream()
                                                        .map(
                                                            f ->
                                                                new io.mateu.dtos.Field(
                                                                    "param_"
                                                                        + fieldPos
                                                                            .getAndIncrement(),
                                                                    f.type(),
                                                                    f.stereotype(),
                                                                    f.observed(),
                                                                    f.wantsFocus(),
                                                                    f.caption(),
                                                                    f.placeholder(),
                                                                    f.cssClasses(),
                                                                    f.description(),
                                                                    f.badges(),
                                                                    f.validations(),
                                                                    f.attributes(),
                                                                        f.colspan()))
                                                        .toList()))
                                        .toList()))
                        .toList(),
                        s.columns()))
        .toList();
  }

  private String getCaption(MethodParametersEditor methodParametersEditor) {
    return humanizer.capitalize(methodParametersEditor.getMethodId());
  }
}
