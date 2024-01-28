package com.example.demoremote.domains.cms.site;

import com.example.demoremote.domains.cms.site.links.FooterLink;
import com.example.demoremote.domains.cms.site.links.HeaderLink;
import com.example.demoremote.domains.cms.site.links.SidebarLink;
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
public class Site {

  @Id String id;

  String name;

  String host;

  String keycloakUrl;

  String realm;

  String clientId;

  String registrationFlowUrl;

  boolean isPublic;

  @ElementCollection(fetch = FetchType.EAGER)
  @Enumerated(EnumType.STRING)
  List<Language> supportedLanguages = new ArrayList<>();

  @OneToMany List<Route> routes = new ArrayList<>();

  @OneToMany List<HeaderLink> headerLinks = new ArrayList<>();

  @OneToMany List<SidebarLink> sidebarLinks = new ArrayList<>();

  @OneToMany List<FooterLink> footerLinks = new ArrayList<>();

  @Override
  public String toString() {
    return name;
  }
}
