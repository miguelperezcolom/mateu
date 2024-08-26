package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
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

  @Id private String id = UUID.randomUUID().toString();

  private String name;

  private LanguageRow.LanguageTarget target;

  @Action("Save")
  public void save() throws Throwable {
    repo.save(this);
  }

  public void load(Object id) throws Throwable {
    reflectionHelper.copy(repo.findById((String) id), this);
  }

  @Override
  public String toString() {
    return name != null ? name : "New Language";
  }

}
