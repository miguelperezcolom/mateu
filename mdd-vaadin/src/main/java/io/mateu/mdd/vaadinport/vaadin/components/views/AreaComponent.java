package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.server.VaadinSession;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

import java.util.ArrayList;
import java.util.List;

public class AreaComponent extends AbstractViewComponent {

    private final AbstractArea area;

    public AreaComponent(AbstractArea area) {

        this.area = area;

    }

    @Override
    public AreaComponent build() {

        super.build();


        addStyleName("areacomponent");


        return this;
    }

}
