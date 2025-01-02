package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFromReflectionField;
import io.mateu.core.domain.model.reflection.usecases.ManagedTypeChecker;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Action;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RulesBuilder {

  final ReflectionService reflectionService;
  private final ManagedTypeChecker managedTypeChecker;

  public List<RuleDto> buildRules(Object form) {
    List<RuleDto> rules = new ArrayList<>();
    addRulesForFields(form, rules);
    addRulesForActions(form, rules);
    return rules;
  }

  private void addRulesForActions(Object actualUiInstance, List<RuleDto> rules) {
    List<Method> allActions =
        reflectionService.getAllMethods(actualUiInstance.getClass()).stream()
            .filter(
                m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
            .collect(Collectors.toList());
    allActions.stream()
        .filter(f -> f.isAnnotationPresent(VisibleIf.class))
        .forEach(
            f ->
                rules.add(
                    RuleDto.builder()
                        .filter("!(" + f.getAnnotation(VisibleIf.class).value() + ")")
                        .data(new String[] {f.getName()})
                        .action(RuleActionDto.HideAction)
                        .result(RuleResultDto.Continue)
                        .build()));
    allActions.stream()
        .filter(f -> f.isAnnotationPresent(EnabledIf.class))
        .forEach(
            f ->
                rules.add(
                    RuleDto.builder()
                        .filter("!(" + f.getAnnotation(EnabledIf.class).value() + ")")
                        .data(new String[] {f.getName()})
                        .action(RuleActionDto.DisableAction)
                        .result(RuleResultDto.Continue)
                        .build()));
  }

  private void addRulesForFields(Object actualUiInstance, List<RuleDto> rules) {
    List<Field> allEditableFields = getAllEditableFields(actualUiInstance, List.of());
    allEditableFields.stream()
        .filter(f -> f.isAnnotationPresent(VisibleIf.class))
        .forEach(
            f ->
                rules.add(
                    RuleDto.builder()
                        .filter("!(" + f.getAnnotation(VisibleIf.class).value() + ")")
                        .data(new String[] {f.getId()})
                        .action(RuleActionDto.Hide)
                        .result(RuleResultDto.Continue)
                        .build()));
    allEditableFields.stream()
        .filter(f -> f.isAnnotationPresent(EnabledIf.class))
        .forEach(
            f ->
                rules.add(
                    RuleDto.builder()
                        .filter("!(" + f.getAnnotation(EnabledIf.class).value() + ")")
                        .data(new String[] {f.getId()})
                        .action(RuleActionDto.Disable)
                        .result(RuleResultDto.Continue)
                        .build()));
    allEditableFields.stream()
        .filter(f -> f.isAnnotationPresent(CallActionOnChange.class))
        .forEach(
            f ->
                rules.add(
                    RuleDto.builder()
                        .filter("hasChanged('" + f.getId() + "')")
                        .data(f.getAnnotation(CallActionOnChange.class).value())
                        .action(RuleActionDto.RunAction)
                        .result(RuleResultDto.Stop)
                        .build()));
  }

  private List<Field> getAllEditableFields(Object uiInstance, List<Field> slotFields) {
    var allFields =
        reflectionService.getAllEditableFields(uiInstance.getClass()).stream()
            .filter(f -> !isOwner(f))
            .filter(f -> slotFields.size() == 0 || slotFields.contains(f))
            .flatMap(f -> plain(f))
            .toList();
    return allFields;
  }

  private Stream<Field> plain(Field field) {
    if (!managedTypeChecker.isManaged(field)) {
      return reflectionService.getAllFields(field.getType()).stream()
          .map(f -> (Field) new FieldFromReflectionField(f))
          .peek(f -> f.setId(field.getId() + "." + f.getId()));
    }
    return Stream.of(field);
  }

  public boolean isOwner(Field f) {
    return (f.isAnnotationPresent(OneToMany.class)
            && Arrays.stream(f.getAnnotation(OneToMany.class).cascade())
                    .filter(c -> CascadeType.ALL.equals(c) || CascadeType.PERSIST.equals(c))
                    .count()
                > 0)
        || (f.isAnnotationPresent(ManyToMany.class)
                && Arrays.stream(f.getAnnotation(ManyToMany.class).cascade())
                        .filter(c -> CascadeType.ALL.equals(c) || CascadeType.PERSIST.equals(c))
                        .count()
                    > 0)
            && f.isAnnotationPresent(UseCrud.class);
  }
}
