package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class AreaComponent extends VerticalLayout {

    private final AbstractArea area;

    @Override
    public String toString() {
        return "" + area.getName();
    }

    public AreaComponent(AbstractArea area) {

        this.area = area;

        addStyleName("methodresultflowcomponent");

        if (MDD.isMobile()) {

            area.getModules().stream().forEach(a -> {

                Button b;
                addComponent(b = new Button(a.getName()));
                b.addClickListener(e -> MDDUI.get().getNavegador().goTo(a));
                b.addStyleName(ValoTheme.BUTTON_QUIET);

            });

        }

        if (!MDD.isMobile()) addComponentsAndExpand(new Label(""));
    }

}
