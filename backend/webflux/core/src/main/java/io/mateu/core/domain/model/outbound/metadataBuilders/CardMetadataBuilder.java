package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.dtos.Card;
import io.mateu.dtos.CardLayout;
import io.mateu.uidl.annotations.SameLine;
import io.mateu.uidl.annotations.UseCrud;
import io.mateu.uidl.interfaces.*;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CardMetadataBuilder {

  final FieldMetadataBuilder fieldMetadataBuilder;
  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;
  private final ServerSideObjectMapper serverSideObjectMapper;

  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Card build(io.mateu.uidl.interfaces.Card card, List<Field> slotFields) {
    Card metadata =
        new Card(
            CardLayout.Layout1,
            card.thumbnail(),
            createActionsForButtons(card.buttons()),
            createActionsForIcons(card.icons()),
            serverSideObjectMapper.toDto(card.actionHandler()));
    return metadata;
  }

  private List<Action> createActionsForIcons(List<CallableIcon> icons) {
    return icons.stream()
        .map(
            i ->
                new Action(
                    i.id(),
                    i.icon().iconName,
                    i.description(),
                    ActionType.Primary,
                    true,
                    false,
                    false,
                    false,
                    null,
                    ActionTarget.Self,
                    null,
                    null,
                    null,
                    false,
                    ActionPosition.Left,
                    0,
                    Integer.MAX_VALUE))
        .toList();
  }

  private List<Action> createActionsForButtons(List<Button> buttons) {
    return buttons.stream()
        .map(
            i ->
                new Action(
                    i.id(),
                    Icon.None.iconName,
                    i.caption(),
                    ActionType.Primary,
                    true,
                    false,
                    false,
                    false,
                    null,
                    ActionTarget.Self,
                    null,
                    null,
                    null,
                    false,
                    ActionPosition.Right,
                    0,
                    Integer.MAX_VALUE))
        .toList();
  }

  private String getIcon(Object uiInstance) {
    if (uiInstance instanceof HasIcon) {
      return ((HasIcon) uiInstance).getIcon();
    }
    return null;
  }

  private String getInfo(Object uiInstance) {
    if (uiInstance instanceof HasInfo) {
      return ((HasInfo) uiInstance).getInfo();
    }
    return null;
  }

  private String getTotal(Object uiInstance) {
    if (uiInstance instanceof HasTotal) {
      return ((HasTotal) uiInstance).getTotal();
    }
    return null;
  }

  private String getSubtitle(Object uiInstance) {
    if (uiInstance instanceof HasSubtitle) {
      return ((HasSubtitle) uiInstance).getSubtitle();
    }
    return null;
  }

  private Status getStatus(Object uiInstance) {
    if (!(uiInstance instanceof HasStatus)) {
      return null;
    }
    HasStatus hasStatus = (HasStatus) uiInstance;
    if (hasStatus.getStatus() == null) return null;
    return new Status(mapStatusType(hasStatus.getStatus().type()), hasStatus.getStatus().message());
  }

  private StatusType mapStatusType(io.mateu.uidl.data.StatusType type) {
    return StatusType.valueOf(type.toString());
  }

  private List<FieldGroup> getFieldGroups(
      String stepId, Object uiInstance, List<Field> slotFields) {
    List<io.mateu.dtos.Field> fields = new ArrayList<>();
    List<FieldGroup> fieldGroups = new ArrayList<>();
    List<FieldGroupLine> fieldGroupLines = new ArrayList<>();
    String currentFieldGroupCaption = "";
    int currentFieldGroupColumns = 0;

    List<Field> allEditableFields =
        reflectionService.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(
                f ->
                    (!f.isAnnotationPresent(OneToMany.class)
                            && !f.isAnnotationPresent(ManyToMany.class))
                        || !f.isAnnotationPresent(UseCrud.class))
            .filter(f -> slotFields.contains(f))
            .filter(f -> !(uiInstance instanceof HasTotal) || !f.getName().equals("total"))
            .collect(Collectors.toList());

    for (Field field : allEditableFields) {
      if (field.isAnnotationPresent(io.mateu.uidl.annotations.FieldGroup.class)) {
        String caption = field.getAnnotation(io.mateu.uidl.annotations.FieldGroup.class).value();
        int columns = field.getAnnotation(io.mateu.uidl.annotations.FieldGroup.class).columns();
        if (fieldGroupLines.size() > 0) {
          fieldGroups.add(
              new FieldGroup(
                  UUID.randomUUID().toString(),
                  currentFieldGroupCaption,
                  fieldGroupLines,
                  field.getAnnotation(io.mateu.uidl.annotations.FieldGroup.class).columns()));
        }
        currentFieldGroupCaption = caption;
        currentFieldGroupColumns = columns;
      }
      fields.add(fieldMetadataBuilder.getField(uiInstance, field));
      if (!field.isAnnotationPresent(SameLine.class)) {
        if (fields.size() > 0) {
          fieldGroupLines.add(new FieldGroupLine(fields));
        }
      }
    }
    if (fieldGroupLines.size() > 0) {
      fieldGroups.add(
          new FieldGroup(
              UUID.randomUUID().toString(),
              currentFieldGroupCaption,
              fieldGroupLines,
              currentFieldGroupColumns));
    }

    fillGroupIds(fieldGroups);

    return fieldGroups;
  }

  private void fillGroupIds(List<FieldGroup> fieldGroups) {
    AtomicInteger j = new AtomicInteger();
    fieldGroups.stream()
        .map(
            g ->
                new FieldGroup(
                    "fieldgroup_" + j.getAndIncrement(), g.caption(), g.lines(), g.columns()))
        .toList();
  }
}
