package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.RuleSupplier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class RuleSupplierLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends TriggersSupplierLayer<View, Editor, CreationForm, Filters, Row, IdType>
    implements RuleSupplier {

  @Override
  public List<Rule> rules() {
    List<Rule> rules = new ArrayList<>();
    List.of(editorClass(), creationFormClass(), entityClass()).stream().distinct().forEach(viewClass -> {
      rules.addAll(Arrays.stream(viewClass.getAnnotationsByType(io.mateu.uidl.annotations.Rule.class))
              .map(annotation -> mapToRule(annotation))
              .toList());
      getAllFields(viewClass).stream()
              .filter(field -> field.isAnnotationPresent(Disabled.class))
              .forEach(
                      field -> {
                        rules.add(
                                Rule.builder()
                                        .filter("true")
                                        .action(RuleAction.SetDataValue)
                                        .fieldName(field.getName())
                                        // .fieldName("aButton,aField")
                                        .fieldAttribute(RuleFieldAttribute.disabled)
                                        .expression("true")
                                        .result(RuleResult.Continue)
                                        .build());
                      });
      getAllFields(viewClass).stream()
              .filter(field -> field.isAnnotationPresent(Hidden.class) && !field.getAnnotation(Hidden.class).value().isEmpty())
              .forEach(
                      field -> {
                        rules.add(
                                Rule.builder()
                                        .filter("true")
                                        .action(RuleAction.SetDataValue)
                                        .fieldName(field.getName())
                                        // .fieldName("aButton,aField")
                                        .fieldAttribute(RuleFieldAttribute.hidden)
                                        .expression(field.getAnnotation(Hidden.class).value())
                                        .result(RuleResult.Continue)
                                        .build());
                      });
        getAllFields(viewClass).stream()
                .filter(field -> List.class.isAssignableFrom(field.getType()))
                .forEach(
                        collectionField -> {

                            var rowClass = getGenericClass(collectionField, List.class, "E");

                            rules.addAll(Arrays.stream(viewClass.getAnnotationsByType(io.mateu.uidl.annotations.Rule.class))
                                    .map(annotation -> mapToRule(annotation))
                                    .toList());
                            getAllFields(rowClass).stream()
                                    .filter(field -> field.isAnnotationPresent(Disabled.class))
                                    .forEach(
                                            field -> {
                                                rules.add(
                                                        Rule.builder()
                                                                .filter("true")
                                                                .action(RuleAction.SetDataValue)
                                                                .fieldName(collectionField.getName() + "-" + field.getName())
                                                                // .fieldName("aButton,aField")
                                                                .fieldAttribute(RuleFieldAttribute.disabled)
                                                                .expression("true")
                                                                .result(RuleResult.Continue)
                                                                .build());
                                            });
                            getAllFields(rowClass).stream()
                                    .filter(field -> field.isAnnotationPresent(Hidden.class) && !field.getAnnotation(Hidden.class).value().isEmpty())
                                    .forEach(
                                            field -> {
                                                rules.add(
                                                        Rule.builder()
                                                                .filter("true")
                                                                .action(RuleAction.SetDataValue)
                                                                .fieldName(collectionField.getName() + "-" + field.getName())
                                                                // .fieldName("aButton,aField")
                                                                .fieldAttribute(RuleFieldAttribute.hidden)
                                                                .expression(field.getAnnotation(Hidden.class).value())
                                                                .result(RuleResult.Continue)
                                                                .build());
                                            });

                        });
    });
    return rules;
  }

  private Rule mapToRule(io.mateu.uidl.annotations.Rule annotation) {
    return Rule.builder()
            .filter(annotation.filter())
            .action(annotation.action())
            .fieldName(annotation.fieldName())
            // .fieldName("aButton,aField")
            .fieldAttribute(annotation.fieldAttribute())
            .expression(annotation.expression())
            .value(annotation.value())
            .result(annotation.result())
            .build();
  }
}
