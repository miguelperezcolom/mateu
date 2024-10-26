package com.example.demo.domain.cms.site;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Route {

  @Id String id;

  @Column(name = "_value")
  String value;

  @Status
  @Enumerated(EnumType.STRING)
  RouteStatus active;

  @Override
  public String toString() {
    return value;
  }

}
