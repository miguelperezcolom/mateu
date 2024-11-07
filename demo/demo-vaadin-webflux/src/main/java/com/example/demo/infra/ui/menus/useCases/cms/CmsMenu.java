package com.example.demo.infra.ui.menus.useCases.cms;

import com.example.demo.domain.cms.site.Route;
import com.example.demo.domain.cms.site.Site;
import com.example.demo.domain.cms.site.links.FooterLink;
import com.example.demo.domain.cms.site.links.HeaderLink;
import com.example.demo.domain.cms.site.links.SidebarLink;
import io.mateu.uidl.core.annotations.MenuOption;
import io.mateu.uidl.core.interfaces.JpaCrud;

import java.util.List;

public class CmsMenu {

    @MenuOption
    JpaCrud<Site> sites =
            new JpaCrud<Site>() {
                @Override
                public List<String> getColumnFields() {
                    return List.of("id", "name", "host");
                }
            };

    @MenuOption JpaCrud<Route> routes =
            new JpaCrud<Route>() {
        @Override
        public List<String> getColumnFields() {
            return List.of("id", "value");
        }
    };

    @MenuOption JpaCrud<HeaderLink> headerLinks;

    @MenuOption JpaCrud<SidebarLink> sidebarLinks;

    @MenuOption JpaCrud<FooterLink> footerLinks;


}
