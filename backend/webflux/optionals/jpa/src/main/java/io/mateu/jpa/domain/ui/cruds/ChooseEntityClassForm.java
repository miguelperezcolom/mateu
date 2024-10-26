package io.mateu.jpa.domain.ui.cruds;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ValuesProviderMethod;
import io.mateu.dtos.Value;
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
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class ChooseEntityClassForm {

  @Ignored private Map<String, String> subclasses;
  @Ignored @Autowired ReflectionHelper reflectionHelper;
  @Ignored @Autowired Humanizer humanizer;

  public ChooseEntityClassForm(Set<Class> subclasses) {
    this.subclasses =
        subclasses.stream()
            .collect(
                Collectors.toMap(c -> c.getName(), c -> humanizer.capitalize(c.getSimpleName())));
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
