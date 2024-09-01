package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionPosition;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Data
@Scope("prototype")
public class LanguageForm {

  @Autowired @JsonIgnore ReflectionHelper reflectionHelper;
  @Autowired LanguagesRepository repo;
  @Autowired
  @JsonIgnore ApplicationContext applicationContext;

  @Id private String id = UUID.randomUUID().toString();

  private String name;

  private LanguageRow.LanguageTarget target;

  @MainAction
  public ProgrammingLanguages save() throws Throwable {
    repo.save(this);
    return applicationContext.getBean(ProgrammingLanguages.class);
  }

  @MainAction(type = ActionType.Tertiary, position = ActionPosition.Left)
  public ProgrammingLanguages back() throws Throwable {
    return applicationContext.getBean(ProgrammingLanguages.class);
  }

  public void load(Object id) throws Throwable {
    reflectionHelper.copy(repo.findById((String) id), this);
  }

  @Override
  public String toString() {
    return name != null ? name : "New Language";
  }

}
