package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class RulesBuilder {

  public List<Rule> buildRules(ViewMetadata metadata, Object actualUiInstance) {
    List<Rule> rules = new ArrayList<>();
    if (metadata instanceof Form) {
      addRulesForFields(actualUiInstance, rules);
      addRulesForActions(actualUiInstance, rules);
    }
    return rules;
  }

  private void addRulesForActions(Object actualUiInstance, List<Rule> rules) {
    List<Method> allActions =
        ReflectionHelper.getAllMethods(actualUiInstance.getClass()).stream()
            .filter(
                m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
            .collect(Collectors.toList());
    allActions.stream()
        .filter(f -> f.isAnnotationPresent(VisibleIf.class))
        .forEach(
            f ->
                rules.add(
                    Rule.builder()
                        .filter("!(" + f.getAnnotation(VisibleIf.class).value() + ")")
                        .data(new String[] {f.getName()})
                        .action(RuleAction.HideAction)
                        .result(RuleResult.Continue)
                        .build()));
    allActions.stream()
        .filter(f -> f.isAnnotationPresent(EnabledIf.class))
        .forEach(
            f ->
                rules.add(
                    Rule.builder()
                        .filter("!(" + f.getAnnotation(EnabledIf.class).value() + ")")
                        .data(new String[] {f.getName()})
                        .action(RuleAction.DisableAction)
                        .result(RuleResult.Continue)
                        .build()));
  }

  private void addRulesForFields(Object actualUiInstance, List<Rule> rules) {
    List<FieldInterfaced> allEditableFields =
        ReflectionHelper.getAllEditableFields(actualUiInstance.getClass());
    allEditableFields.stream()
        .filter(f -> f.isAnnotationPresent(VisibleIf.class))
        .forEach(
            f ->
                rules.add(
                    Rule.builder()
                        .filter("!(" + f.getAnnotation(VisibleIf.class).value() + ")")
                        .data(new String[] {f.getId()})
                        .action(RuleAction.Hide)
                        .result(RuleResult.Continue)
                        .build()));
    allEditableFields.stream()
        .filter(f -> f.isAnnotationPresent(EnabledIf.class))
        .forEach(
            f ->
                rules.add(
                    Rule.builder()
                        .filter("!(" + f.getAnnotation(EnabledIf.class).value() + ")")
                        .data(new String[] {f.getId()})
                        .action(RuleAction.Disable)
                        .result(RuleResult.Continue)
                        .build()));
    allEditableFields.stream()
        .filter(f -> f.isAnnotationPresent(CallActionOnChange.class))
        .forEach(
            f ->
                rules.add(
                    Rule.builder()
                        .filter("hasChanged('" + f.getId() + "')")
                        .data(f.getAnnotation(CallActionOnChange.class).value())
                        .action(RuleAction.RunAction)
                        .result(RuleResult.Stop)
                        .build()));
  }
}
