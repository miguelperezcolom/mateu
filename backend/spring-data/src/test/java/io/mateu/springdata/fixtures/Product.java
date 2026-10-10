package io.mateu.springdata.fixtures;

import io.mateu.uidl.interfaces.Identifiable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;
import java.time.LocalDate;

@Entity
public class Product implements Identifiable {

  public enum Category {
    TOOLS,
    GARDEN,
    KITCHEN
  }

  @Id @GeneratedValue public Long id;
  public String name;
  public String description;

  @Enumerated(EnumType.STRING)
  public Category category;

  public double price;
  public int stock;
  public LocalDate released;

  @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
  public Supplier supplier;

  @Version public Long version;

  public Product() {}

  public Product(
      String name,
      String description,
      Category category,
      double price,
      int stock,
      LocalDate released,
      Supplier supplier) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.price = price;
    this.stock = stock;
    this.released = released;
    this.supplier = supplier;
  }

  @Override
  public String id() {
    return id == null ? null : id.toString();
  }

  @Override
  public String toString() {
    return name;
  }
}
