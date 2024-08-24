package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.SameLine;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.dtos.*;
import io.mateu.dtos.Card;
import io.mateu.dtos.CardLayout;
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
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;

  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Card build(String stepId, io.mateu.core.domain.uidefinition.core.interfaces.Card card, List<Field> slotFields) {
    Card metadata =
        new Card(
                CardLayout.Layout1,
            card.thumbnail(),
            List.of(), //todo: create actions
                List.of() //todo: create actions
        );
    return metadata;
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
    return new Status(
        mapStatusType(hasStatus.getStatus().getType()), hasStatus.getStatus().getMessage());
  }

  private StatusType mapStatusType(io.mateu.core.domain.uidefinition.shared.data.StatusType type) {
    return StatusType.valueOf(type.toString());
  }

  private List<FieldGroup> getFieldGroups(
      String stepId, Object uiInstance, List<Field> slotFields) {
    List<io.mateu.dtos.Field> fields = new ArrayList<>();
    List<FieldGroup> fieldGroups = new ArrayList<>();
    List<FieldGroupLine> fieldGroupLines = new ArrayList<>();
    String currentFieldGroupCaption = "";

    List<Field> allEditableFields =
        reflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(
                f ->
                    (!f.isAnnotationPresent(OneToMany.class)
                            && !f.isAnnotationPresent(ManyToMany.class))
                        || !f.isAnnotationPresent(UseCrud.class))
            .filter(f -> slotFields.contains(f))
            .filter(f -> !(uiInstance instanceof HasTotal) || !f.getName().equals("total"))
            .collect(Collectors.toList());

    for (Field field : allEditableFields) {
      if (field.isAnnotationPresent(
          io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)) {
        String caption =
            field
                .getAnnotation(
                    io.mateu.core.domain.uidefinition.shared.annotations.FieldGroup.class)
                .value();
        if (fieldGroupLines.size() > 0) {
          fieldGroups.add(
              new FieldGroup(
                  UUID.randomUUID().toString(), currentFieldGroupCaption, fieldGroupLines));
        }
        currentFieldGroupCaption = caption;
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
          new FieldGroup(UUID.randomUUID().toString(), currentFieldGroupCaption, fieldGroupLines));
    }

    fillGroupIds(fieldGroups);

    return fieldGroups;
  }

  private void fillGroupIds(List<FieldGroup> fieldGroups) {
    AtomicInteger j = new AtomicInteger();
    fieldGroups.stream()
        .map(g -> new FieldGroup("fieldgroup_" + j.getAndIncrement(), g.caption(), g.lines()))
        .toList();
  }
}
