package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.base.Strings;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.vaadinport.vaadin.components.app.AbstractMDDExecutionContext;
import io.mateu.mdd.vaadinport.vaadin.navigation.View;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout {


    private View view;
    protected CssLayout bar;
    protected Map<Method, AbstractAction> actionsByMethod = new HashMap<>();
    protected Map<String, Component> menuItemsById = new HashMap<>();
    protected List<String> menuItemIdsUnseen = new ArrayList<>();
    private String title;
    private HorizontalLayout hiddens;

    public HorizontalLayout getHiddens() {
        return hiddens;
    }

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

    public A build() throws Exception {

        addStyleName("viewcomponent");

        if (!MDD.isMobile()) setSizeFull();

        hiddens = new HorizontalLayout();
        hiddens.addStyleName("hidden");

        addComponent(hiddens);

        bar = new CssLayout();
        bar.addStyleName("actionsbar");
        menuItemsById = new HashMap<>();
        addViewActionsMenuItems(bar);
        if (bar.getComponentCount() > 0) addComponent(bar);

        return (A) this;
    }

    public void addViewActionsMenuItems(CssLayout bar) {

        for (AbstractAction a : getActions()) {
            Component i = null;
            if (!isActionPresent(a.getId())) {
                Button b;
                bar.addComponent(i = b = new Button(a.getName(), a.getIcon()));
                b.addClickListener(e -> {
                    try {

                        Runnable r = new Runnable() {
                            @Override
                            public void run() {

                                a.run(new AbstractMDDExecutionContext());

                                if (AbstractViewComponent.this instanceof EditorViewComponent) {

                                    EditorViewComponent evc = (EditorViewComponent) AbstractViewComponent.this;

                                    evc.getBinder().update(evc.getModel());

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
                });

                addMenuItem(a.getId(), i);

                if (!Strings.isNullOrEmpty(a.getStyle())) i.setStyleName(a.getStyle());

            } else {
                i = getMenuItemById(a.getId());
            }
            if (i != null && !Strings.isNullOrEmpty(a.getStyle())) i.setStyleName(a.getStyle());
            i.setVisible(true);
        }

    }

    public void markAllAsUnseen() {
        menuItemIdsUnseen = new ArrayList<>(menuItemsById.keySet());
    }

    public List<String> getUnseenActions() {
        return menuItemIdsUnseen;
    }

    public void removeUnseen() {
        for (String id : menuItemIdsUnseen) menuItemsById.get(id).setVisible(false);
    }

    public boolean isActionPresent(String id) {
        boolean found = menuItemsById.containsKey(id);
        if (found) menuItemIdsUnseen.remove(id);
        return found;
    }

    public Component getMenuItemById(String id) {
        return menuItemsById.get(id);
    }

    public void addMenuItem(String id, Component i) {
        menuItemsById.put(id, i);
    }


    public List<AbstractAction> getActions() {
        return new ArrayList<>();
    }


    public AbstractAction getActionByMethod(Method m) {
        return actionsByMethod.get(m);
    }

    public void setAction(Method m, AbstractAction action) {
        actionsByMethod.put(m, action);
    }


}
