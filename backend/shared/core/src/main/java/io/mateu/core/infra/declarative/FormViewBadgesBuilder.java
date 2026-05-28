package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;

import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.interfaces.ModelSupplier;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Objects;

final class FormViewBadgesBuilder {

  static List<KPI> createKpis(Object instance) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    return getAllEditableFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.KPI.class))
        .map(field -> KPI.builder().title(getLabel(field)).text(getKpiText(field)).build())
        .toList();
  }

  static List<Badge> createBadges(Object instance) {
    if (instance instanceof ModelSupplier modelSupplier) {
      instance = modelSupplier.model();
    }
    return getAllEditableFields(instance.getClass()).stream()
        .filter(field -> Status.class.equals(field.getType()))
        .map(FormViewBadgesBuilder::mapStatusToBadge)
        .filter(Objects::nonNull)
        .toList();
  }

  private static String getKpiText(Field field) {
    if (Amount.class.equals(field.getType())) {
      return "${state." + field.getName() + ".value} ${state." + field.getName() + ".currency}";
    }
    return "${state." + field.getName() + "}";
  }

  private static Badge mapStatusToBadge(Field field) {
    return Badge.builder()
        .text("${state." + field.getName() + ".message}")
        .color("${state." + field.getName() + ".type}")
        .build();
  }
}
