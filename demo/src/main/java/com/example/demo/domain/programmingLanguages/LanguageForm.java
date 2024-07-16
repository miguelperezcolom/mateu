package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Data
@Scope("prototype")
public class LanguageForm implements PersistentPojo {

  @Autowired @JsonIgnore ReflectionHelper reflectionHelper;
  @Autowired LanguagesRepository repo;

  @Id private String id = UUID.randomUUID().toString();

  private String name;

  private LanguageRow.LanguageTarget target;

  @Override
  public void save() throws Throwable {
    repo.save(this);
  }

  @Override
  public void load(Object id) throws Throwable {
    reflectionHelper.copy(repo.findById((String) id), this);
  }

  @Override
  public Object retrieveId() {
    return id;
  }

  @Override
  public String toString() {
    return name != null ? name : "New Language";
  }
}
