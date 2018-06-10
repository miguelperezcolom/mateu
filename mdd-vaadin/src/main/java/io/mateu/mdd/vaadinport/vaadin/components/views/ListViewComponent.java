package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Label;

import java.util.ArrayList;
import java.util.List;

public abstract class ListViewComponent extends AbstractViewComponent<ListViewComponent> {

    private ResultsComponent resultsComponent;

    private List<ListViewComponentListener> listeners = new ArrayList<>();

    private int count;
    private Label countLabel;

    @Override
    public ListViewComponent build() throws InstantiationException, IllegalAccessException {

        super.build();

        addStyleName("listviewcomponent");
        
        
        addComponent(new FiltersComponent(this));

        addComponent(countLabel = new Label());


        addComponentsAndExpand(resultsComponent = buildResultsComponent());

        return this;
    }


    private ResultsComponent buildResultsComponent() {
        return new ResultsComponent(this);
    }

    public abstract void buildColumns(Grid grid);

    public void search(Object filters) throws Throwable {
        resultsComponent.search(filters);
    }

    public void addListener(ListViewComponentListener listener) {
        listeners.add(listener);
    }


    public void edit(Object id) {
        for (ListViewComponentListener l : listeners) l.onEdit(id);
    };

    public abstract List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit);

    public int count(Object filters) {
        count = gatherCount(filters);
        countLabel.setValue("" + count + " matches.");
        return count;
    }

    protected abstract int gatherCount(Object filters);

    public abstract Object deserializeId(String id);

    public abstract String getPathForEditor(Object id);

    public Class getModelTypeForSearchFilters() {
        return this.getClass();
    }

    public Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException {
        return this;
    }
}
