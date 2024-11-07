package com.example.demo.infra.ui.menus.useCases.processDefinition.main.sale;

import io.mateu.uidl.core.annotations.Status;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Flow {

  @Id String id;

  String name;

  @Status boolean active;

  @Status boolean deployable;

  LocalDateTime deployed;

  @Override
  public String toString() {
    return name;
  }
}
