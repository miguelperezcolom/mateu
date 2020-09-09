package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;

import java.lang.reflect.InvocationTargetException;

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
        try {
            listViewComponent.search(getModel());
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

}
