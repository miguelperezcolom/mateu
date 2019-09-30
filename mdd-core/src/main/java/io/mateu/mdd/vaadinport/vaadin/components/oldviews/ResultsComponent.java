package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.provider.CallbackDataProvider;
import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.provider.GridSortOrder;
import com.vaadin.data.provider.Query;
import com.vaadin.event.SortEvent;
import com.vaadin.event.selection.SelectionEvent;
import com.vaadin.event.selection.SelectionListener;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.components.grid.ItemClickListener;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import lombok.extern.slf4j.Slf4j;

import java.text.DecimalFormat;
import java.util.*;

@Slf4j
public class ResultsComponent extends VerticalLayout {

    private final ListViewComponent listViewComponent;
    private Grid grid;
    private Object filters;
    private CallbackDataProvider<Object,Object> dataProvider;
    private int lastClickedRowIndex = -1;
    private Query<Object,Object> lastQuery;
    private Label labelSelection;

    public int getLastClickedRowIndex() {
        return lastClickedRowIndex;
    }

    public void setLastClickedRowIndex(int lastClickedRowIndex) {
        this.lastClickedRowIndex = lastClickedRowIndex;
    }

    private void setLastQuery(Query<Object,Object> query) {
        this.lastQuery = query;
    }

    public Query<Object, Object> getLastQuery() {
        return lastQuery;
    }

    public Object getNext() {
        Optional o;
        if (listViewComponent instanceof JPACollectionFieldListViewComponent) {
            o = listViewComponent.findAll(null, null, 0, 0).stream().skip(getLastClickedRowIndex() + 1).findFirst();
        } else {
            Query q = new Query(getLastClickedRowIndex() + 1, 1, getLastQuery() != null?getLastQuery().getSortOrders():null, getLastQuery() != null?getLastQuery().getInMemorySorting():null, getLastQuery() != null?getLastQuery().getFilter():null);
            o = grid.getDataProvider().fetch(q).findFirst();
        }
        if (o.isPresent()) {
            setLastClickedRowIndex(getLastClickedRowIndex() + 1);
            return o.get();
        } else throw new Error("This is the last item of the list");
    }

    public Object getPrevious() {
        Optional o = Optional.empty();
        if (getLastClickedRowIndex() > 0) {
            if (listViewComponent instanceof JPACollectionFieldListViewComponent) {
                o = listViewComponent.findAll(null, null, 0, 0).stream().skip(getLastClickedRowIndex() - 1).findFirst();
            } else {
                Query q = new Query(getLastClickedRowIndex() - 1, 1, getLastQuery().getSortOrders(), getLastQuery().getInMemorySorting(), getLastQuery().getFilter());
                o = grid.getDataProvider().fetch(q).findFirst();
            }
        }
        if (o.isPresent()) {
            setLastClickedRowIndex(getLastClickedRowIndex() - 1);
            return o.get();
        } else throw new Error("This is already the first item of the list");
    }

    public CallbackDataProvider<Object, Object> getDataProvider() {
        return dataProvider;
    }

    public ResultsComponent(ListViewComponent listViewComponent) {

        this.listViewComponent = listViewComponent;

        build();

    }

    private void build() {

        addStyleName("resultscomponent");

        if (!MDD.isMobile()) setSizeFull();


        grid = new Grid<>();

        listViewComponent.buildColumns(grid);

        // añadimos columna para que no haga feo
        grid.addColumn((d) -> null).setWidthUndefined().setCaption("");


        grid.addSortListener(new SortEvent.SortListener<GridSortOrder<Object>>() {
            @Override
            public void sort(SortEvent<GridSortOrder<Object>> sortEvent) {
                log.debug("sort listener received " + sortEvent);
            }
        });

        listViewComponent.decorateGridMain(grid);


        grid.setSizeFull();




        dataProvider = DataProvider.fromFilteringCallbacks(query -> {
            try {
                setLastQuery(query);
                return listViewComponent.findAll(listViewComponent.getModelForSearchFilters(), query.getSortOrders(), query.getOffset(), query.getLimit()).stream();
            } catch (Throwable e) {
                MDD.alert(e);
                return null;
            }
        }, query -> {
            try {
                return listViewComponent.count(listViewComponent.getModelForSearchFilters());
            } catch (Throwable e) {
                MDD.alert(e);
                return 0;
            }
        });

        grid.setDataProvider(dataProvider);
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
            log.debug("Focus moved to row " + event.getRow());
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
                select(listViewComponent.toId(selectionEvent.getFirstSelectedItem()));
            }
        });

        grid.addItemClickListener(new ItemClickListener<Object>() {
            @Override
            public void itemClick(Grid.ItemClick<Object> itemClick) {
                if (MDD.isMobile() || MDD.isIpad() || itemClick.getMouseEventDetails().isDoubleClick()) {
                    setLastClickedRowIndex(itemClick.getRowIndex());
                    Object i = itemClick.getItem();
                    if (i != null) {
                        edit(listViewComponent.toId(i));
                    }
                }
            }
        });

        labelSelection = new Label("No items selected");

        addComponent(labelSelection);

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
            refreshSelectionLabel();
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    private void refreshSelectionLabel() {
        String s = "No items selected";
        Set sel = getSelection();
        if (sel.size() > 0) {
            s = sel.size() + " items selected";

            Map<Integer, Object> sums = new LinkedHashMap<>();
            Map<Integer, String> labels = new LinkedHashMap<>();

            for (Object i : sel) if (i != null) {
                if (i instanceof Object[]) {
                    Object[] a = (Object[]) i;
                    for (int j = 0; j < a.length; j++) {
                        if (a[j] != null && a[j] instanceof Double) {
                            sums.put(j, (Double) sums.getOrDefault(j, 0.0) + (Double) a[j]);
                            if (!labels.containsKey(j)) labels.put(j, (j > 1 && grid.getColumns().size() > j - 1?((Grid.Column)grid.getColumns().get(j - 1)).getCaption():"" + j));
                        } else if (a[j] != null && a[j] instanceof Integer) {
                            sums.put(j, (Integer) sums.getOrDefault(j, 0) + (Integer) a[j]);
                            if (!labels.containsKey(j)) labels.put(j, (j > 1 && grid.getColumns().size() > j - 1?((Grid.Column)grid.getColumns().get(j - 1)).getCaption():"" + j));
                        }
                    }
                } else {
                    List<FieldInterfaced> fields = listViewComponent.getColumnFields();
                    try {
                        for (int j = 0; j < fields.size(); j++) {
                            FieldInterfaced f = fields.get(j);
                            if (Double.class.equals(f.getType()) || double.class.equals(f.getType())) {
                                sums.put(j, (Double) sums.getOrDefault(j, 0.0) + (Double) ReflectionHelper.getValue(f, i));
                                if (!labels.containsKey(j)) labels.put(j, ReflectionHelper.getCaption(f));
                            } else if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())) {
                                sums.put(j, (Integer) sums.getOrDefault(j, 0) + (Integer) ReflectionHelper.getValue(f, i));
                                if (!labels.containsKey(j)) labels.put(j, ReflectionHelper.getCaption(f));
                            }
                        }
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
            }

            DecimalFormat df = new DecimalFormat("##,###,###,###,###,###.00");
            for (int j : sums.keySet()) {
                Object v = sums.get(j);
                if (v instanceof Double) v = df.format(v);
                s += ", Σ " + labels.get(j) + " = " + v;
            }
        }
        labelSelection.setValue(s);
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

    public Grid getGrid() {
        return grid;
    }
}
