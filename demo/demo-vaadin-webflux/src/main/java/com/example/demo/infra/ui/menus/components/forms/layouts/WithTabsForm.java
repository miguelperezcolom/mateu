package com.example.demo.infra.ui.menus.components.forms.layouts;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.InTabsArranged;

;

;

public class WithTabsForm {

    String assessment;

    @InTabsArranged
    TabsContainer tabsContainer;


    @Action
    void assess() {
        assessment = "" + tabsContainer.tab1().name() + ", " +
                tabsContainer.tab2().address();
    }

}
