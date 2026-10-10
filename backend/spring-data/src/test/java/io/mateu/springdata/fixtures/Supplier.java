package io.mateu.springdata.fixtures;

import io.mateu.uidl.interfaces.Identifiable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Supplier implements Identifiable {

  @Id @GeneratedValue public Long id;
  public String name;

  public Supplier() {}

  public Supplier(String name) {
    this.name = name;
  }

  @Override
  public String id() {
    return id == null ? null : id.toString();
  }
}
