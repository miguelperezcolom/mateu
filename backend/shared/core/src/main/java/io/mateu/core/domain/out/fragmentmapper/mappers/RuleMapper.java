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
import io.mateu.uidl.interfaces.RuleSupplier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RuleMapper {

  public static List<RuleDto> mapRules(Object serverSideObject) {
    var viewClass = serverSideObject.getClass();
    List<RuleDto> rules = new ArrayList<>();
    rules.addAll(
        Arrays.stream(viewClass.getAnnotationsByType(Rule.class))
            .map(RuleMapper::mapToRule)
            .toList());
    getAllFields(viewClass).stream()
        .filter(field -> field.isAnnotationPresent(Disabled.class))
        .forEach(
            field ->
                rules.add(
                    RuleDto.builder()
                        .filter("true")
                        .action(RuleActionDto.SetDataValue)
                        .fieldName(field.getName())
                        .fieldAttribute(RuleFieldAttributeDto.disabled)
                        .expression("true")
                        .result(RuleResultDto.Continue)
                        .build()));
    getAllFields(viewClass).stream()
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
                        .fieldName(field.getName())
                        .fieldAttribute(RuleFieldAttributeDto.hidden)
                        .expression(field.getAnnotation(Hidden.class).value())
                        .result(RuleResultDto.Continue)
                        .build()));
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
    if (serverSideObject instanceof RuleSupplier ruleSupplier) {
      rules.addAll(
          ruleSupplier.rules().stream()
              .map(
                  rule ->
                      RuleDto.builder()
                          .filter(rule.filter())
                          .action(RuleActionDto.valueOf(rule.action().name()))
                          .fieldAttribute(
                              rule.fieldAttribute() != null
                                  ? RuleFieldAttributeDto.valueOf(rule.fieldAttribute().name())
                                  : null)
                          .fieldName(rule.fieldName())
                          .value(rule.value())
                          .expression(rule.expression())
                          .result(RuleResultDto.valueOf(rule.result().name()))
                          .actionId(rule.actionId())
                          .build())
              .toList());
    }
    rules.addAll(
        Arrays.stream(serverSideObject.getClass().getAnnotationsByType(Rule.class))
            .map(RuleMapper::mapToRule)
            .toList());
    return rules;
  }

  public static RuleDto mapToRule(Rule annotation) {
    return RuleDto.builder()
        .filter(annotation.filter())
        .action(
            annotation.action() != null
                ? RuleActionDto.valueOf(annotation.action().name())
                : RuleActionDto.RunAction)
        .fieldName(annotation.fieldName())
        .fieldAttribute(
            annotation.fieldAttribute() != null
                ? RuleFieldAttributeDto.valueOf(annotation.fieldAttribute().name())
                : null)
        .value(annotation.value())
        .expression(annotation.expression())
        .result(
            annotation.result() != null ? RuleResultDto.valueOf(annotation.result().name()) : null)
        .actionId(annotation.actionId())
        .build();
  }
}
