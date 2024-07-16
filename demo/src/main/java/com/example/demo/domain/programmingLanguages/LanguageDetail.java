package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.ReadOnlyPojo;
import io.mateu.core.domain.reflection.ReflectionHelper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Data
@Scope("prototype")
public class LanguageDetail extends LanguageDetailDefinition implements ReadOnlyPojo {

  @Autowired LanguagesRepository repo;
  @Autowired @JsonIgnore ReflectionHelper reflectionHelper;
  @Autowired LanguageForm form;

  @Override
  public void load(Object id) throws Throwable {
    reflectionHelper.copy(repo.findById((String) id), this);
  }

  @Override
  public Object retrieveId() {
    return getId();
  }

  @Override
  public Object retrieveEditor() throws Throwable {
    form.load(getId());
    return form;
  }

  @Override
  public boolean hasEditor() {
    return true;
  }

  @Override
  public String toString() {
    return getName() != null ? getName() : "New Language";
  }
}
