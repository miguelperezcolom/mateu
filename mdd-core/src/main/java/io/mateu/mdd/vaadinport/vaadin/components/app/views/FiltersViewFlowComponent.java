package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.Panel;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class FiltersViewFlowComponent extends EditorViewComponent {

    private final ListViewComponent listViewComponent;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.FILTER;
    }

    @Override
    public String toString() {
        return "All filters for " + listViewComponent;
    }

    public FiltersViewFlowComponent(ListViewComponent listViewComponent) throws InvocationTargetException, NoSuchMethodException, InstantiationException, IllegalAccessException {
        super(listViewComponent.getModelForSearchFilters());
        this.listViewComponent = listViewComponent;
    }

    @Override
    public void onGoBack() {
        listViewComponent.setModelForSearchFilters(getModel());
    }
}
