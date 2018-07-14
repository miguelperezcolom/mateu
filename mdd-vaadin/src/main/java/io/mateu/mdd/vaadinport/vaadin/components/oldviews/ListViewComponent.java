package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Component;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Label;
import com.vaadin.ui.components.grid.SortOrderProvider;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.ListColumn;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;

import javax.persistence.Transient;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public abstract class ListViewComponent extends AbstractViewComponent<ListViewComponent> {

    private ResultsComponent resultsComponent;

    private List<ListViewComponentListener> listeners = new ArrayList<>();

    private int count;
    private Label countLabel;
    private FiltersComponent filtersComponent;

    @Override
    public ListViewComponent build() throws InstantiationException, IllegalAccessException {

        addStyleName("listviewcomponent");

        addComponent(filtersComponent = new FiltersComponent(this));

        super.build();


        addComponent(countLabel = new Label());

        addComponentsAndExpand(resultsComponent = buildResultsComponent());
        return this;
    }

    private ResultsComponent buildResultsComponent() {
        return new ResultsComponent(this);
    }

    public void buildColumns(Grid grid) {

        List<FieldInterfaced> colFields = getColumnFields();

        int pos = 0;
        for (FieldInterfaced f : colFields) {
            int finalPos = 1 + pos++;

            Grid.Column col;

            if (this instanceof JPAListViewComponent) {
                col = grid.addColumn(new ValueProvider() {
                    @Override
                    public Object apply(Object o) {
                        //return ReflectionHelper.getValue(f, o);
                        return ((Object[]) o)[finalPos];
                    }
                });
            } else {
                col = grid.addColumn(new ValueProvider() {
                    @Override
                    public Object apply(Object o) {
                        try {
                            return ReflectionHelper.getValue(f, o);
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }
                        return null;
                    }
                });
            }

            col.setCaption(Helper.capitalize(f.getName()));

            if (colFields.size() == 1) col.setExpandRatio(1);
            else col.setWidth(getColumnWidth(f));

            col.setSortOrderProvider(new SortOrderProvider() {
                @Override
                public Stream<QuerySortOrder> apply(SortDirection sortDirection) {
                    return Stream.of(new QuerySortOrder(f.getName(), sortDirection));
                }
            }).setId(f.getName());
        }


    }

    private double getColumnWidth(FieldInterfaced f) {
        return 150;
    }

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
        countLabel.setValue((count == 1)?"" + count + " match.":"" + count + " matches.");
        return count;
    }

    protected abstract int gatherCount(Object filters);

    public abstract Object deserializeId(String id);

    public String getPathForEditor(Object id) {
        return "" + id;
    }

    public String getPathForFilters() {
        return "filters";
    }

    public Class getModelTypeForSearchFilters() {
        return this.getClass();
    }

    public abstract Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException;

    public Component getFiltersViewComponent() {
        return filtersComponent.getFiltersViewComponent();
    }


    public Class getModelType() {
        return getClass();
    }

    public Method getMethod(String methodName) {

        Method a = null;

        for (Method m : ReflectionHelper.getAllMethods(getModelType())) {
            if (m.getName().equals(methodName)) {
                a = m;
                break;
            }
        }

        return a;
    }

    public Set getSelection() {
        return resultsComponent.getSelection();
    }


    

    public List<FieldInterfaced> getColumnFields() {
        List<FieldInterfaced> explicitColumns = ReflectionHelper.getAllFields(getColumnType()).stream().filter(
                (f) -> f.isAnnotationPresent(ListColumn.class)
        ).collect(Collectors.toList());

        if (explicitColumns.size() > 0) {
            return explicitColumns;
        } else
            return ReflectionHelper.getAllFields(getColumnType()).stream().filter(
                    (f) -> !f.isAnnotationPresent(Transient.class)
                            && !f.isAnnotationPresent(Ignored.class)
                            && !Modifier.isTransient(f.getModifiers())
                            && !f.getType().isAssignableFrom(List.class)
                            && !f.getType().isAssignableFrom(Map.class)
            ).collect(Collectors.toList());
    }

    public abstract Class getColumnType();

    public List<FieldInterfaced> getFilterFields() {
        List<FieldInterfaced> explicitFilters = ReflectionHelper.getAllFields(getFiltersType()).stream().filter(
                (f) -> f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)
        ).collect(Collectors.toList());
        return explicitFilters;
    }

    public abstract Class getFiltersType();
}
