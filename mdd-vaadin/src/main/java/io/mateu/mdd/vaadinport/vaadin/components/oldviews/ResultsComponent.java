package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.provider.GridSortOrder;
import com.vaadin.event.SortEvent;
import com.vaadin.event.selection.SelectionEvent;
import com.vaadin.event.selection.SelectionListener;
import com.vaadin.ui.Grid;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.components.grid.ItemClickListener;
import io.mateu.mdd.core.MDD;

import java.util.Set;

public class ResultsComponent extends VerticalLayout {

    private final ListViewComponent listViewComponent;
    private Grid grid;
    private Object filters;

    public ResultsComponent(ListViewComponent listViewComponent) {

        this.listViewComponent = listViewComponent;

        build();

    }

    private void build() {

        addStyleName("resultscomponent");

        grid = new Grid<>();

        listViewComponent.buildColumns(grid);

        // añadimos columna para que no haga feo
        grid.addColumn((d) -> null).setWidthUndefined().setCaption("");

        grid.addSortListener(new SortEvent.SortListener<GridSortOrder<Object>>() {
            @Override
            public void sort(SortEvent<GridSortOrder<Object>> sortEvent) {
                System.out.println("sort listener received " + sortEvent);
            }
        });

        listViewComponent.decorateGridMain(grid);


        grid.setSizeFull();




        DataProvider p = DataProvider.fromFilteringCallbacks(query -> {
            try {
                return listViewComponent.findAll(listViewComponent.getModelForSearchFilters(), query.getSortOrders(), query.getOffset(), query.getLimit()).stream();
            } catch (Exception e) {
                MDD.alert(e);
                return null;
            }
        }, query -> {
            try {
                return listViewComponent.count(listViewComponent.getModelForSearchFilters());
            } catch (Exception e) {
                MDD.alert(e);
                return 0;
            }
        });

        grid.setDataProvider(p);
        grid.setColumnReorderingAllowed(true);

        grid.setSelectionMode(Grid.SelectionMode.MULTI);

        /*

        FastNavigation nav = new FastNavigation(grid, false, true);
        nav.setChangeColumnAfterLastRow(true);
        nav.setOpenEditorWithSingleClick(false);
        nav.setRowValidation(true);


        nav.addRowFocusListener(event -> {
            if (event.getRow() >= 0) {
                grid.select(event.getItem());
            }
            else grid.deselectAll();
            System.out.println("Focus moved to row " + event.getRow());
        });

*/



        /*
        nav.addEditorOpenListener(new FastNavigation.EditorOpenListener() {
            @Override
            public void onEvent(EditorOpenEvent<?> editorOpenEvent) {
                Object i = editorOpenEvent.getItem();
                if (i != null && i instanceof Object[]) edit(((Object[])i)[0]);
            }
        });
        */


        grid.addSelectionListener(new SelectionListener() {
            @Override
            public void selectionChange(SelectionEvent selectionEvent) {
                System.out.println("selected " + selectionEvent.getFirstSelectedItem());
                select(listViewComponent.toId(selectionEvent.getFirstSelectedItem()));
            }
        });

        grid.addItemClickListener(new ItemClickListener<Object>() {
            @Override
            public void itemClick(Grid.ItemClick<Object> itemClick) {
                if (itemClick.getMouseEventDetails().isDoubleClick()) {
                    Object i = itemClick.getItem();
                    if (i != null) {
                        edit(listViewComponent.toId(i));
                    }
                }
            }
        });



        addComponentsAndExpand(grid);

    }

    private void edit(Object id) {
        try {
            listViewComponent.edit(id);
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    private void select(Object id) {
        try {
            listViewComponent.select(id);
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    public void search(Object filters) throws Throwable {
        this.filters = filters;
        grid.deselectAll();
        grid.getDataProvider().refreshAll();
    }

    public Set getSelection() {
        return grid.getSelectedItems();
    }

    public void refresh() throws Throwable {
        search(listViewComponent.getModelForSearchFilters());
    }
}
