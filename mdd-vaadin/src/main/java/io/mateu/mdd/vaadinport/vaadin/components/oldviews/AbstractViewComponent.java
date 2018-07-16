package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
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

            bar.addItem(a.getName(), a.getIcon(), new MenuBar.Command() {
                @Override
                public void menuSelected(MenuBar.MenuItem menuItem) {
                    try {

                        Runnable r = new Runnable() {
                            @Override
                            public void run() {

                                a.run(new AbstractMDDExecutionContext());

                                if (AbstractViewComponent.this instanceof EditorViewComponent) {

                                    EditorViewComponent evc = (EditorViewComponent) AbstractViewComponent.this;

                                    evc.setModel(evc.getModel());

                                }


                            }
                        };

                        if (!Strings.isNullOrEmpty(a.getConfirmationMessage())) {
                            MDD.confirm(a.getConfirmationMessage(), new Runnable() {
                                @Override
                                public void run() {

                                    r.run();

                                    //todo: actualizar vista con los cambios en el modelo

                                }
                            });
                        } else r.run();

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
