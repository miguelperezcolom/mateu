package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.server.Page;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.FlowViewComponent;

public class MenuFlowComponent extends AbstractFlowComponent {

    private final AbstractMenu menu;
    private final String state;

    @Override
    public String getViewTile() {
        return menu.getName();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public MenuFlowComponent(String state, AbstractMenu menu) {
        this.state = state;
        this.menu = menu;

        addStyleName("menuflowcomponent");

        menu.getEntries().forEach(e -> addComponent(new Button(e.getName(), x ->{
            if (e instanceof AbstractMenu) MDD.open(e);
            else if (e instanceof AbstractAction) {
                String path = MDD.getApp().getMenuId(e);
                Page.getCurrent().open(((path.startsWith("/"))?"":"/") + path, Page.getCurrent().getWindowName());
            };
        })));

    }

}
