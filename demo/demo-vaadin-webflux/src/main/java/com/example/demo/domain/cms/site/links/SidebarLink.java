package com.example.demo.domain.cms.site.links;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SidebarLink {

  @Id String id;

  String name;

  String icon;

  String label;

  Boolean requiresBrokerId;

  String routerLink;

  Boolean bottomDivider;

  Boolean disabled;

  String testId;

  @Enumerated(EnumType.STRING)
  ClientSideActionType actionType;

  @OneToMany List<SidebarLink> options = new ArrayList<>();

  @Override
  public String toString() {
    return name;
  }

}
