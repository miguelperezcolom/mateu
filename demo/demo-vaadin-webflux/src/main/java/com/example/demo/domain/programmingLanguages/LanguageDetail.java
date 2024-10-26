package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@ReadOnly
public class LanguageDetail extends LanguageDetailDefinition {

  @Autowired LanguagesRepository repo;
  @Autowired @JsonIgnore ReflectionHelper reflectionHelper;
  @Autowired LanguageForm form;

  public void load(Object id) {
    reflectionHelper.copy(repo.findById((String) id), this);
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
