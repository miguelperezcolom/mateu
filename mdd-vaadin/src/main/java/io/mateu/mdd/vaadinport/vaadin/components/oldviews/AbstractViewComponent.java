package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.Callback;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.flow.AbstractMDDExecutionContext;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout implements ViewComponent {

    private String title = "View title";

    List<ViewListener> viewListeners = new ArrayList<>();

    @Override
    public void addViewListener(ViewListener listener) {
        viewListeners.add(listener);
    }

    public A build() throws InstantiationException, IllegalAccessException {

        addStyleName("viewcomponent");

        HorizontalLayout actionsBar = new HorizontalLayout();
        actionsBar.addStyleName("actionsbar");

        actionsBar.addComponent(new ApplicationActionsComponent(this));

        addComponent(actionsBar);

        return (A) this;
    }

    public void setViewTitle(String title) {
        this.title = title;

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

                        if (AbstractViewComponent.this instanceof EditorViewComponent) {

                            EditorViewComponent evc = (EditorViewComponent) AbstractViewComponent.this;

                            evc.setModel(evc.getModel());

                        }

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
