package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.UpdatesUrlFragment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@ReadOnly
public class LanguageDetail extends LanguageDetailDefinition implements UpdatesUrlFragment {

  @Autowired LanguagesRepository repo;
  @Autowired @JsonIgnore
  ReflectionService reflectionService;
  @Autowired LanguageForm form;
  @Autowired
  @JsonIgnore
  ApplicationContext applicationContext;

  public void load(Object id) {
    reflectionService.copy(repo.findById((String) id), this);
  }

  public Object retrieveId() {
    return getId();
  }

  @Action("Edit")
  public Object retrieveEditor() throws Throwable {
    form.load(getId());
    return form;
  }

  @MainAction(type = ActionType.Tertiary, position = ActionPosition.Left)
  public ProgrammingLanguages back() {
    return applicationContext.getBean(ProgrammingLanguages.class);
  }

  @Override
  public String toString() {
    return getName() != null ? getName() : "New Language";
  }

  @Override
  public String getUrlFragment() {
    return getId();
  }
}
