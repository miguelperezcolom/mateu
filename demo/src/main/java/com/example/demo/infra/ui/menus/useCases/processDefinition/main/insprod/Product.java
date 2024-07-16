package com.example.demo.infra.ui.menus.useCases.processDefinition.main.insprod;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product {

  @Id
  @Column(name = "_key")
  String key;

  String name;
  String description;
  String status;
  String processId;

  @Override
  public String toString() {
    return name;
  }
}
