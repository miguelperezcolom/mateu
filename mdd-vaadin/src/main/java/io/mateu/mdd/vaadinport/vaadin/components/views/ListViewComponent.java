package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Label;

import java.util.List;

public abstract class ListViewComponent extends ViewComponent {

    private ResultsComponent resultsComponent;

    private int count;
    private Label countLabel;

    protected void build() {
        
        
        addComponent(new FiltersComponent(this));

        addComponent(countLabel = new Label());


        addComponentsAndExpand(resultsComponent = buildResultsComponent());

    }


    private ResultsComponent buildResultsComponent() {
        return new ResultsComponent(this);
    }

    public abstract void buildColumns(Grid grid);

    public void search() throws Throwable {
        resultsComponent.search();
    }


    public abstract void edit(Object id) throws Throwable;

    public abstract List findAll(List<QuerySortOrder> sortOrders, int offset, int limit);
    public int count() {
        count = gatherCount();
        countLabel.setValue("" + count + " matches.");
        return count;
    }

    protected abstract int gatherCount();

}
