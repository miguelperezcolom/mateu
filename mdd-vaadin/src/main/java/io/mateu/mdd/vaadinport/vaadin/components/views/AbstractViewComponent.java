package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.server.Page;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout implements ViewComponent {

    private AbstractAction originatingAction;
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

    }


    public AbstractAction getOriginatingAction() {
        return originatingAction;
    }

    public void setOriginatingAction(AbstractAction originatingAction) {
        this.originatingAction = originatingAction;
    }

}
