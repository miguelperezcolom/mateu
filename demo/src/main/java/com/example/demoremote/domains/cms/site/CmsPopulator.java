package com.example.demoremote.domains.cms.site;

import com.example.demoremote.domains.cms.site.links.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CmsPopulator {

  final SiteRepository siteRepository;
  final RouteRepository routeRepository;
  final FooterLinkRepository footerLinkRepository;
  final HeaderLinkRepository headerLinkRepository;
  final SidebarLinkRepository sidebarLinkRepository;

  public void populate() {
    populatePublicConfig();
    populatePrivateConfig();
  }


  private void populatePublicConfig() {
    var found = siteRepository.findById("site-public");
    if (found.isEmpty()) {

      HeaderLink headerLink =
          headerLinkRepository.save(
              new HeaderLink(
                  UUID.randomUUID().toString(), "_NAV_login", "_NAV_login", false, "login"));

      FooterLink footerLink =
          footerLinkRepository.save(
              new FooterLink(
                  UUID.randomUUID().toString(),
                  "_GEN_footer_link1_text",
                  "_GEN_footer_link1_text",
                  Language.de,
                  "http://wefox.com/de-de/datenschutz"));

      Route routeLogin =
          routeRepository.save(new Route(UUID.randomUUID().toString(), "login", RouteStatus.Active));

      Route routeLogout =
          routeRepository.save(new Route(UUID.randomUUID().toString(), "logout", RouteStatus.Active));

      Route routePageNotFound =
          routeRepository.save(new Route(UUID.randomUUID().toString(), "page-not-found", RouteStatus.Active));

      siteRepository.save(
          new Site(
              "site-public",
              "home",
              "localhost",
              "https://id-stg.wefox.com/auth",
              "wefox",
              "wefox-prod-wipo",
              "registrationFlowUrl",
              true,
              List.of(Language.de, Language.en),
              List.of(routeLogin, routeLogout, routePageNotFound),
              List.of(headerLink),
              null,
              List.of(footerLink)));
    }
  }

  private void populatePrivateConfig() {
    var found = siteRepository.findById("site-private");
    if (found.isEmpty()) {
      FooterLink footerLink =
          footerLinkRepository.save(
              new FooterLink(
                  UUID.randomUUID().toString(),
                  "_GEN_footer_link1_text",
                  "_GEN_footer_link1_text",
                  Language.de,
                  "http://wefox.com/de-de/datenschutz"));

      SidebarLink sidebarLinkSecondary1 =
          sidebarLinkRepository.save(
              new SidebarLink(
                  UUID.randomUUID().toString(),
                  "document",
                  "document",
                  "_NAV_offers_list",
                  true,
                  "offers/broker/(BROKER_ID)",
                  null,
                  false,
                  "link-offers",
                  ClientSideActionType.Url,
                  null));

      SidebarLink sidebarLinkSecondary2 =
          sidebarLinkRepository.save(
              new SidebarLink(
                  UUID.randomUUID().toString(),
                  "list-grid",
                  "list-grid",
                  "_NAV_products_list",
                  true,
                  "products/broker/(BROKER_ID)",
                  null,
                  true,
                  "link-products",
                  ClientSideActionType.Url,
                  null));

      SidebarLink sidebarLinkMain =
          sidebarLinkRepository.save(
              new SidebarLink(
                  UUID.randomUUID().toString(),
                  "sales",
                  "sales",
                  "_NAV_sales_menu",
                  null,
                  null,
                  null,
                  false,
                  "link-sales",
                  ClientSideActionType.Url,
                  List.of(sidebarLinkSecondary1, sidebarLinkSecondary2)));

      siteRepository.save(
          new Site(
              "site-private",
              "home",
              "localhost",
              "https://id-stg.wefox.com/auth",
              "wefox",
              "wefox-prod-wipo",
              "registrationFlowUrl",
              false,
              List.of(Language.de, Language.en),
              null,
              null,
              List.of(sidebarLinkMain),
              List.of(footerLink)));
    }
  }
}
