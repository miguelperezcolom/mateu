package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

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
import io.mateu.uidl.interfaces.DisabledSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RuleMapper {

  public static List<RuleDto> mapRules(Object serverSideObject, HttpRequest httpRequest) {
    return createRules(serverSideObject, httpRequest).stream().map(RuleMapper::mapToRule).toList();
  }

  public static List<io.mateu.uidl.data.Rule> createRules(
      Object serverSideObject, HttpRequest httpRequest) {
    var viewClass = serverSideObject.getClass();
    List<io.mateu.uidl.data.Rule> rules = new ArrayList<>();
    rules.addAll(
        Arrays.stream(viewClass.getAnnotationsByType(Rule.class))
            .map(RuleMapper::mapToRule)
            .toList());
    getAllFields(viewClass).stream()
        .filter(field -> field.isAnnotationPresent(Disabled.class))
        .forEach(
            field ->
                rules.add(
                    io.mateu.uidl.data.Rule.builder()
                        .filter("true")
                        .action(RuleAction.SetDataValue)
                        .fieldName(field.getName())
                        .fieldAttribute(RuleFieldAttribute.disabled)
                        .expression("true")
                        .result(RuleResult.Continue)
                        .build()));
    if (serverSideObject instanceof DisabledSupplier disabledSupplier) {
      getAllFields(viewClass).stream()
          .filter(field -> disabledSupplier.isDisabled(field.getName(), httpRequest))
          .forEach(
              field ->
                  rules.add(
                      io.mateu.uidl.data.Rule.builder()
                          .filter("true")
                          .action(RuleAction.SetDataValue)
                          .fieldName(field.getName())
                          .fieldAttribute(RuleFieldAttribute.disabled)
                          .expression("true")
                          .result(RuleResult.Continue)
                          .build()));
    }
    getAllFields(viewClass).stream()
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
                        .fieldName(field.getName())
                        .fieldAttribute(RuleFieldAttribute.hidden)
                        .expression(field.getAnnotation(Hidden.class).value())
                        .result(RuleResult.Continue)
                        .build()));
    ListFieldRuleCollector.addListFieldRules(viewClass, rules);
    if (serverSideObject instanceof RuleSupplier ruleSupplier) {
      rules.addAll(
          ruleSupplier.rules().stream()
              .map(
                  rule ->
                      io.mateu.uidl.data.Rule.builder()
                          .filter(rule.filter())
                          .action(RuleAction.valueOf(rule.action().name()))
                          .fieldAttribute(rule.fieldAttribute())
                          .fieldName(rule.fieldName())
                          .value(rule.value())
                          .expression(rule.expression())
                          .result(rule.result())
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

  public static io.mateu.uidl.data.Rule mapToRule(Rule annotation) {
    return io.mateu.uidl.data.Rule.builder()
        .filter(annotation.filter())
        .action(annotation.action())
        .fieldName(annotation.fieldName())
        .fieldAttribute(annotation.fieldAttribute())
        .value(annotation.value())
        .expression(annotation.expression())
        .result(annotation.result())
        .actionId(annotation.actionId())
        .build();
  }

  public static RuleDto mapToRule(io.mateu.uidl.data.Rule rule) {
    return RuleDto.builder()
        .filter(rule.filter())
        .action(
            rule.action() != null
                ? RuleActionDto.valueOf(rule.action().name())
                : RuleActionDto.RunAction)
        .fieldName(rule.fieldName())
        .fieldAttribute(
            rule.fieldAttribute() != null
                ? RuleFieldAttributeDto.valueOf(rule.fieldAttribute().name())
                : null)
        .value(rule.value())
        .expression(rule.expression())
        .result(rule.result() != null ? RuleResultDto.valueOf(rule.result().name()) : null)
        .actionId(rule.actionId())
        .build();
  }
}
