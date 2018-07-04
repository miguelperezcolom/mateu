package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.google.common.collect.Lists;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.AbstractMDDExecutionContext;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout implements ViewComponent {

    private Label titleLabel;
    private String title = "View title";

    public A build() throws InstantiationException, IllegalAccessException {

        addStyleName("viewcomponent");

        addComponent(titleLabel = new Label(title));
        titleLabel.addStyleName("title");

        UI.getCurrent().getPage().setTitle((title != null)?title:"No title");


        HorizontalLayout actionsBar = new HorizontalLayout();
        actionsBar.addStyleName("actionsbar");

        actionsBar.addComponent(new ApplicationActionsComponent(this));
        actionsBar.addComponent(new ViewActionsComponent(this));

        addComponent(actionsBar);

        return (A) this;
    }

    public void setViewTitle(String title) {
        this.title = title;
        if (titleLabel != null) {
            titleLabel.setValue(title);
            UI.getCurrent().getPage().setTitle((title != null)?title:"No title");
        }
    }

    public String getViewTitle() {
        return title;
    }


    public void addViewActionsMenuItems(MenuBar bar) {

        for (AbstractAction a : getActions()) {

            bar.addItem(a.getName(), VaadinIcons.BOLT, new MenuBar.Command() {
                @Override
                public void menuSelected(MenuBar.MenuItem menuItem) {
                    try {
                        a.run(new AbstractMDDExecutionContext());
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            });

        }

    }

    public List<AbstractAction> getActions() {
        return new ArrayList<>();
    }

}
