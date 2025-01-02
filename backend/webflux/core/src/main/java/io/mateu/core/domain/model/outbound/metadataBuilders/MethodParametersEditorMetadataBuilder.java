package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.UseCrud;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
  final ReflectionService reflectionService;
  final Humanizer humanizer;

  public FormDto build(MethodParametersEditor uiInstance) {
    return new FormDto(
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
        List.of(),
        Map.of());
  }

  private String getSubtitle(Object uiInstance) {
    return null;
  }

  private List<ActionDto> getMainActions(Object uiInstance) {
    List<ActionDto> actions = new ArrayList<>();
    ActionDto action =
        new ActionDto(
            "run",
            null,
            "Run",
            ActionTypeDto.Primary,
            new ActionThemeVariantDto[0],
            true,
            true,
            false,
            false,
            null,
            ActionTargetDto.View,
            null,
            null,
            null,
            null,
            true,
            ActionPositionDto.Right,
            0,
            Integer.MAX_VALUE);
    actions.add(action);
    return actions;
  }

  private List<SectionDto> getSections(MethodParametersEditor methodParametersEditor) {
    Method m =
        reflectionService.getMethod(
            methodParametersEditor.getType(), methodParametersEditor.getMethodId());

    List<Field> allEditableFields =
        reflectionService.getAllFields(m).stream()
            .filter(f -> !f.isAnnotationPresent(UseCrud.class))
            .filter(f -> !ServerHttpRequest.class.isAssignableFrom(f.getType()))
            .collect(Collectors.toList());

    List<SectionDto> sections =
        formMetadataBuilder.createSections(methodParametersEditor, allEditableFields, false);

    sections = fillSectionIds(sections);

    return sections;
  }

  private List<SectionDto> fillSectionIds(List<SectionDto> sections) {
    AtomicInteger i = new AtomicInteger();
    AtomicInteger fieldPos = new AtomicInteger();
    return sections.stream()
        .map(
            s ->
                new SectionDto(
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
                                new FieldGroupDto(
                                    "fieldgroup_" + i + "_" + j,
                                    s.fieldGroups().get(j).caption(),
                                    s.fieldGroups().get(j).lines().stream()
                                        .map(
                                            l ->
                                                new FieldGroupLineDto(
                                                    l.fields().stream()
                                                        .map(
                                                            f ->
                                                                new FieldDto(
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
                                                                    f.colspan(),
                                                                    f.rightAligned(),
                                                                    f.bold()))
                                                        .toList()))
                                        .toList(),
                                    s.fieldGroups().get(j).columns()))
                        .toList(),
                    s.columns(),
                    s.sidePositionedLabel(),
                    s.itemLabelWidth()))
        .toList();
  }

  private String getCaption(MethodParametersEditor methodParametersEditor) {
    return humanizer.capitalize(methodParametersEditor.getMethodId());
  }
}
