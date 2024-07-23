package com.example.demo.domain.cms.site.links;

import com.example.demo.domain.cms.site.Language;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FooterLink {

  @Id String id;

  String name;

  String label;

  Language language;

  @Column(name = "_value")
  String value;

  @Override
  public String toString() {
    return name;
  }

}
