package io.mateu.mdd.ui.cruds;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Value;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Getter
@Setter
@NoArgsConstructor
@Caption("What do you want to create?")
@Service
public class ChooseEntityClassForm {

  @Ignored private Map<String, String> subclasses;
  @Ignored
  @Autowired ReflectionHelper reflectionHelper;

  public ChooseEntityClassForm(Set<Class> subclasses) {
    this.subclasses =
        subclasses.stream()
            .collect(Collectors.toMap(c -> c.getName(), c -> Helper.capitalize(c.getSimpleName())));
  }

  @NotNull
  @ValuesProviderMethod("getChoices")
  private String type;

  public List<Value> getChoices() {
    return subclasses.entrySet().stream()
        .map(e -> new Value(e.getValue(), e.getKey()))
        .collect(Collectors.toList());
  }

  @MainAction
  public Object create() throws Exception {
    return reflectionHelper.newInstance(Class.forName(type));
  }
}
