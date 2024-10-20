package com.example.demo.infra.ui.menus.useCases.processDefinition.main.sale;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FieldGroup {

  @Id String id;

  String title;

  @ManyToOne Section section;

  @Override
  public String toString() {
    return title;
  }
}
