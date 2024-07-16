package com.example.demo.domain.cms.site.links;

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
public class HeaderLink {

  @Id String id;

  String name;

  String label;

  boolean requiresBrokerId;

  String routerLink;

  @Override
  public String toString() {
    return name;
  }

}
