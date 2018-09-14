package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.vaadinport.vaadin.components.app.AbstractMDDExecutionContext;
import io.mateu.mdd.vaadinport.vaadin.navigation.View;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout {


    private View view;
    protected MenuBar bar;
    protected Map<String, MenuBar.MenuItem> menuItemsById = new HashMap<>();
    private String title;

    public String getTitle() {
        return title != null?title:toString();
    }

    public A setTitle(String title) {
        this.title = title;
        return (A) this;
    }

    public View getView() {
        return view;
    }

    public void setView(View view) {
        this.view = view;
    }

    public A build() throws InstantiationException, IllegalAccessException {

        addStyleName("viewcomponent");

        if (!MDD.isMobile()) setSizeFull();


        bar = new MenuBar();
        bar.addStyleName("actionsbar");
        bar.setWidth("100%");
        addViewActionsMenuItems(bar);
        if (bar.getItems().size() > 0) addComponent(bar);

        return (A) this;
    }

    public void addViewActionsMenuItems(MenuBar bar) {

        menuItemsById = new HashMap<>();

        for (AbstractAction a : getActions()) {

            MenuBar.MenuItem i = bar.addItem(a.getName(), a.getIcon(), new MenuBar.Command() {
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

            menuItemsById.put(a.getId(), i);

            if (!Strings.isNullOrEmpty(a.getStyle())) i.setStyleName(a.getStyle());

        }

    }


    public List<AbstractAction> getActions() {
        return new ArrayList<>();
    }

}
