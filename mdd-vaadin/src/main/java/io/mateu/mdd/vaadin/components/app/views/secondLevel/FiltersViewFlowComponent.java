package io.mateu.mdd.vaadin.components.app.views.secondLevel;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.util.notification.Notifier;

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
            Notifier.alert(throwable);
        }
    }

}
