package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.dtos.RuleActionDto;
import io.mateu.dtos.RuleDto;
import io.mateu.dtos.RuleFieldAttributeDto;
import io.mateu.dtos.RuleResultDto;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Rule;
import java.util.Arrays;
import java.util.List;

final class ListFieldRuleCollector {

  static void addListFieldRules(Class<?> viewClass, List<RuleDto> rules) {
    getAllFields(viewClass).stream()
        .filter(field -> List.class.isAssignableFrom(field.getType()))
        .forEach(
            collectionField -> {
              var rowClass = getGenericClass(collectionField, List.class, "E");
              rules.addAll(
                  Arrays.stream(viewClass.getAnnotationsByType(Rule.class))
                      .map(RuleMapper::mapToRule)
                      .toList());
              getAllFields(rowClass).stream()
                  .filter(field -> field.isAnnotationPresent(Disabled.class))
                  .forEach(
                      field ->
                          rules.add(
                              RuleDto.builder()
                                  .filter("true")
                                  .action(RuleActionDto.SetDataValue)
                                  .fieldName(collectionField.getName() + "-" + field.getName())
                                  .fieldAttribute(RuleFieldAttributeDto.disabled)
                                  .expression("true")
                                  .result(RuleResultDto.Continue)
                                  .build()));
              getAllFields(rowClass).stream()
                  .filter(
                      field ->
                          field.isAnnotationPresent(Hidden.class)
                              && !field.getAnnotation(Hidden.class).value().isEmpty())
                  .forEach(
                      field ->
                          rules.add(
                              RuleDto.builder()
                                  .filter("true")
                                  .action(RuleActionDto.SetDataValue)
                                  .fieldName(collectionField.getName() + "-" + field.getName())
                                  .fieldAttribute(RuleFieldAttributeDto.hidden)
                                  .expression(field.getAnnotation(Hidden.class).value())
                                  .result(RuleResultDto.Continue)
                                  .build()));
            });
  }

  private ListFieldRuleCollector() {}
}
