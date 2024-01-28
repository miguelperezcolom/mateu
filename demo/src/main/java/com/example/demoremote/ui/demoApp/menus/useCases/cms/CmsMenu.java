package com.example.demoremote.ui.demoApp.menus.useCases.cms;

import com.example.demoremote.domains.cms.site.Route;
import com.example.demoremote.domains.cms.site.Site;
import com.example.demoremote.domains.cms.site.links.FooterLink;
import com.example.demoremote.domains.cms.site.links.HeaderLink;
import com.example.demoremote.domains.cms.site.links.SidebarLink;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

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
