package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.RuleSupplier;
import java.util.ArrayList;
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
    if ("edit".equals(_state) || "create".equals(_state)) {
      List<Rule> rules = new ArrayList<>();
      getAllFields(viewClass()).stream()
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
      return rules;
    }
    return List.of();
  }
}
