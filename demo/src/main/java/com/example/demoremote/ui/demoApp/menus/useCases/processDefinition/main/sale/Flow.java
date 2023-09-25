package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale;

import io.mateu.mdd.shared.annotations.Status;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.*;

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
