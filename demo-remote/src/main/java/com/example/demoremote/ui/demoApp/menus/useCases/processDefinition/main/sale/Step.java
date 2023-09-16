package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale;

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
public class Step {

  @Id String id;

  String title;

  @ManyToOne Flow flow;

  @Override
  public String toString() {
    return title;
  }
}
