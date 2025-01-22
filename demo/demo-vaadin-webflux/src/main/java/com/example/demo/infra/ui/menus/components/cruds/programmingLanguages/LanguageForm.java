package com.example.demo.infra.ui.menus.components.cruds.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.ActionPosition;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.interfaces.ReflectionHelper;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Data
@Scope("prototype")
public class LanguageForm {

  @Autowired @JsonIgnore
  ReflectionHelper reflectionService;
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
  public ProgrammingLanguages back() {
    return applicationContext.getBean(ProgrammingLanguages.class);
  }

  public void load(Object id) {
    reflectionService.copy(repo.findById((String) id), this);
  }

  @Override
  public String toString() {
    return name != null ? name : "New Language";
  }

}
