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
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;

import java.util.Arrays;
import java.util.List;

final class ListFieldRuleCollector {

  static void addListFieldRules(Class<?> viewClass, List<io.mateu.uidl.data.Rule> rules) {
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
                              io.mateu.uidl.data.Rule.builder()
                                  .filter("true")
                                  .action(RuleAction.SetDataValue)
                                  .fieldName(collectionField.getName() + "-" + field.getName())
                                  .fieldAttribute(RuleFieldAttribute.disabled)
                                  .expression("true")
                                  .result(RuleResult.Continue)
                                  .build()));
              getAllFields(rowClass).stream()
                  .filter(
                      field ->
                          field.isAnnotationPresent(Hidden.class)
                              && !field.getAnnotation(Hidden.class).value().isEmpty())
                  .forEach(
                      field ->
                          rules.add(
                              io.mateu.uidl.data.Rule.builder()
                                  .filter("true")
                                  .action(RuleAction.SetDataValue)
                                  .fieldName(collectionField.getName() + "-" + field.getName())
                                  .fieldAttribute(RuleFieldAttribute.hidden)
                                  .expression(field.getAnnotation(Hidden.class).value())
                                  .result(RuleResult.Continue)
                                  .build()));
            });
  }

  private ListFieldRuleCollector() {}
}
