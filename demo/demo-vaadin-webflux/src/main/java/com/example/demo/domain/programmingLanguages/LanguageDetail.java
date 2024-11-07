package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ReadOnly;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@ReadOnly
public class LanguageDetail extends LanguageDetailDefinition {

  @Autowired LanguagesRepository repo;
  @Autowired @JsonIgnore
  ReflectionService reflectionService;
  @Autowired LanguageForm form;

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

  @Override
  public String toString() {
    return getName() != null ? getName() : "New Language";
  }
}
