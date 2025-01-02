package io.mateu.jpa.domain.ui.cruds;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.dtos.ValueDto;
import io.mateu.uidl.annotations.*;
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
@Title("What do you want to create?")
@Service
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class ChooseEntityClassForm {

  @Ignored private Map<String, String> subclasses;
  @Ignored @Autowired ReflectionService reflectionService;
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

  public List<ValueDto> getChoices() {
    return subclasses.entrySet().stream()
        .map(e -> new ValueDto(e.getValue(), e.getKey()))
        .collect(Collectors.toList());
  }

  @MainAction
  public Object create() throws Exception {
    return reflectionService.newInstance(Class.forName(type));
  }
}
