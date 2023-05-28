package io.mateu.mdd.ui.cruds;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.mdd.shared.data.ValuesListProvider;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter@Setter@NoArgsConstructor
@Caption("What do you want to create?")
public class ChooseEntityClassForm {

    @Ignored
    private Map<String, String> subclasses;

    public ChooseEntityClassForm(Set<Class> subclasses) {
        this.subclasses = subclasses.stream().collect(Collectors
                .toMap(c -> c.getName(), c -> Helper.capitalize(c.getSimpleName())));
    }

    @NotNull@ValuesProviderMethod("getChoices")
    private String type;

    public List<Value> getChoices() {
        return subclasses.entrySet().stream()
                .map(e -> new Value(e.getValue(), e.getKey()))
                .collect(Collectors.toList());
    }


    @MainAction
    public Object create() throws Exception {
        return ReflectionHelper.newInstance(Class.forName(type));
    }

}
