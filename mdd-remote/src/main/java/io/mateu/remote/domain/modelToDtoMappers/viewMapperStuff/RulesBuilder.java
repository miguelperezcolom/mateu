package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.shared.annotations.CallActionOnChange;
import io.mateu.mdd.shared.annotations.EnabledIf;
import io.mateu.mdd.shared.annotations.VisibleIf;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RulesBuilder {

    public List<Rule> buildRules(ViewMetadata metadata, Object actualUiInstance) {
        List<Rule> rules = new ArrayList<>();
        if (metadata instanceof Form) {
            List<FieldInterfaced> allEditableFields = ReflectionHelper.getAllEditableFields(actualUiInstance.getClass());
            allEditableFields
                    .stream().filter(f -> f.isAnnotationPresent(VisibleIf.class))
                    .forEach(f -> rules.add(Rule.builder()
                            .filter("!(" + f.getAnnotation(VisibleIf.class).value() + ")")
                            .data(new String[] {f.getId()})
                            .action(RuleAction.Hide)
                            .result(RuleResult.Continue)
                            .build()));
            allEditableFields
                    .stream().filter(f -> f.isAnnotationPresent(EnabledIf.class))
                    .forEach(f -> rules.add(Rule.builder()
                            .filter("!(" + f.getAnnotation(EnabledIf.class).value() + ")")
                            .data(new String[] {f.getId()})
                            .action(RuleAction.Disable)
                            .result(RuleResult.Continue)
                            .build()));
            allEditableFields
                    .stream().filter(f -> f.isAnnotationPresent(CallActionOnChange.class))
                    .forEach(f -> rules.add(Rule.builder()
                            .filter("hasChanged('" + f.getId() + "')")
                            .data(f.getAnnotation(CallActionOnChange.class).value())
                            .action(RuleAction.RunAction)
                            .result(RuleResult.Stop)
                            .build()));
        }
        return rules;
    }

}
