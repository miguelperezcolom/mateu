package io.mateu.mdd.vaadin.components.views;

import com.vaadin.data.provider.CallbackDataProvider;
import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.provider.GridSortOrder;
import com.vaadin.data.provider.Query;
import com.vaadin.event.SortEvent;
import com.vaadin.event.selection.SelectionEvent;
import com.vaadin.event.selection.SelectionListener;
import com.vaadin.ui.*;
import com.vaadin.ui.components.grid.ItemClickListener;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.interfaces.ReadOnly;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.text.DecimalFormat;
import java.util.*;

@Slf4j
public class ResultsComponent extends VerticalLayout {

    private final ListViewComponent listViewComponent;
    private final Component matchesComponent;
    private Grid grid;
    private Object filters;
    private CallbackDataProvider<Object,Object> dataProvider;
    private int lastClickedRowIndex = -1;
    private Query<Object,Object> lastQuery;
    private Label labelSelection;
    private Collection found;
    private Map<String, Object> lastSignature;

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
        } else {
            Notifier.info("This is the last item of the list");
            return null;
        }
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
        } else {
            Notifier.info("This is already the first item of the list");
            return null;
        }
    }

    public CallbackDataProvider<Object, Object> getDataProvider() {
        return dataProvider;
    }

    public ResultsComponent(ListViewComponent listViewComponent, Component matchesComponent) {

        this.listViewComponent = listViewComponent;
        this.matchesComponent = matchesComponent;

        build();

    }

    private void build() {

        addStyleName("resultscomponent");

        if (!MDDUIAccessor.isMobile()) setSizeFull();


        grid = new Grid<>();
        grid.addStyleName("gridresultado");

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

        if (listViewComponent.getFrozenColumnCount() > 0) grid.setFrozenColumnCount(listViewComponent.getFrozenColumnCount());


        dataProvider = DataProvider.fromFilteringCallbacks(query -> {
            try {
                setLastQuery(query);
                found = listViewComponent.findAll(listViewComponent.getModelForSearchFilters(), query.getSortOrders(), query.getOffset(), query.getLimit());
                return found.stream();
            } catch (Throwable e) {
                Notifier.alert(e);
                return null;
            }
        }, query -> {
            try {
                return listViewComponent.count(listViewComponent.getModelForSearchFilters());
            } catch (Throwable e) {
                Notifier.alert(e);
                return 0;
            }
        });

        grid.setDataProvider(dataProvider);
        grid.setColumnReorderingAllowed(true);
        grid.setSelectionMode(Grid.SelectionMode.MULTI);


        grid.addSelectionListener(new SelectionListener() {
            @Override
            public void selectionChange(SelectionEvent selectionEvent) {
                select(listViewComponent.toId(selectionEvent.getFirstSelectedItem()));
            }
        });

        if (esEditable(listViewComponent)) grid.addItemClickListener(new ItemClickListener<Object>() {
            @Override
            public void itemClick(Grid.ItemClick<Object> itemClick) {
                //if (MDDUIAccessor.isMobile() || MDD.isIpad() || itemClick.getMouseEventDetails().isDoubleClick()) {
                if (itemClick.getColumn() != null) {
                    setLastClickedRowIndex(itemClick.getRowIndex());
                    Object i = itemClick.getItem();
                    if (i != null) {
                        edit(listViewComponent.toId(i));
                    }
                }
                //}
            }
        });
        else grid.addStyleName("readonly");


        labelSelection = new Label("No items selected");
        HorizontalLayout hl = new HorizontalLayout();
        hl.addStyleName(CSS.NOPADDING);
        hl.addStyleName("listsummaryline");
        if (matchesComponent != null) hl.addComponent(matchesComponent);
        hl.addComponent(labelSelection);
        hl.setDefaultComponentAlignment(Alignment.TOP_LEFT);

        addComponent(hl);

        addComponentsAndExpand(grid);

    }

    private boolean esEditable(ListViewComponent listViewComponent) {
        if (!(listViewComponent instanceof RpcListViewComponent)) return true;
        RpcListViewComponent rpc = (RpcListViewComponent) listViewComponent;
        RpcView v = rpc.getRpcListView();
        boolean ro = v instanceof ReadOnly && ((ReadOnly) v).isReadOnly();
        return !ro && v.isEditHandled();
    }


    private void edit(Object id) {
        try {
            listViewComponent.edit(id);
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
        }
    }

    private void select(Object id) {
        try {
            listViewComponent.select(id);
            refreshSelectionLabel();
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
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
                        Notifier.alert(e);
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
        boolean updateUrl = listViewComponent.getView().getWindowContainer() == null &&  EditorViewComponent.isModificado(lastSignature, EditorViewComponent.buildSignature(filters));
        lastSignature = EditorViewComponent.buildSignature(filters);
        this.filters = filters;
        grid.deselectAll();
        grid.getDataProvider().refreshAll();
        if (updateUrl) listViewComponent.searched();
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

    public Object getRow(String step) {
        if (found != null) {
            return found.stream().filter(o -> step.equals(o.toString())).findAny().orElse(null);
        }
        return null;
    }
}
