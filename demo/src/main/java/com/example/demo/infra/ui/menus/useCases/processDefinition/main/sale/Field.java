package com.example.demo.infra.ui.menus.useCases.processDefinition.main.sale;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Field {

  @Id String id;

  @Column(name = "_key")
  String key;

  String label;

  FieldType type;

  @ManyToOne FieldGroup fieldGroup;

  boolean hidden;

  String defaultValue;

  boolean required;

  String pattern;

  double min;

  double max;

  double steps;

  @ElementCollection List<String> possibleValues;

  String requiredIf;

  @Override
  public String toString() {
    return label;
  }
}
