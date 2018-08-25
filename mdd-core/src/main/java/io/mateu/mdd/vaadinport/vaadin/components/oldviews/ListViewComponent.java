package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.byteowls.vaadin.chartjs.ChartJs;
import com.byteowls.vaadin.chartjs.config.DonutChartConfig;
import com.byteowls.vaadin.chartjs.data.Dataset;
import com.byteowls.vaadin.chartjs.data.PieDataset;
import com.google.common.base.Strings;
import com.kbdunn.vaadin.addons.fontawesome.FontAwesome;
import com.kbdunn.vaadin.addons.fontawesome.FontAwesomeLabel;
import com.vaadin.data.HasDataProvider;
import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.*;
import com.vaadin.ui.components.grid.SortOrderProvider;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.ChartData;
import io.mateu.mdd.core.data.ChartValue;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.SumData;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.interfaces.ICellStyleGenerator;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.StyledEnum;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.components.WeekDaysComponent;
import org.javamoney.moneta.FastMoney;

import javax.money.MonetaryAmount;
import javax.persistence.GeneratedValue;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public abstract class ListViewComponent extends AbstractViewComponent<ListViewComponent> {

    private ResultsComponent resultsComponent;

    private List<ListViewComponentListener> listeners = new ArrayList<>();

    private int count;
    private Label countLabel;
    public FiltersComponent filtersComponent;
    private HorizontalLayout sumsComponent;
    private HorizontalLayout chartsComponent;
    private Button excelButton;
    private Button pdfButton;

    @Override
    public ListViewComponent build() throws InstantiationException, IllegalAccessException {

        addStyleName("listviewcomponent");

        addComponent(filtersComponent = new FiltersComponent(this));

        super.build();

        setSizeFull();

        addComponent(sumsComponent = new HorizontalLayout());
        sumsComponent.setVisible(false);

        addComponent(chartsComponent = new HorizontalLayout());
        chartsComponent.setVisible(false);

        HorizontalLayout hcl;
        addComponent(hcl = new HorizontalLayout(excelButton = new Button(FontAwesome.FILE_EXCEL_O, e -> excel()), pdfButton = new Button(FontAwesome.FILE_PDF_O, e -> pdf()), countLabel = new Label()));
        countLabel.addStyleName("resultsmessage");

        excelButton.addStyleName(ValoTheme.BUTTON_LINK);
        excelButton.addStyleName("botondeicono");

        pdfButton.addStyleName(ValoTheme.BUTTON_LINK);
        pdfButton.addStyleName("botondeicono");


        addComponentsAndExpand(resultsComponent = buildResultsComponent());
        return this;
    }

    private void pdf() {
        try {
            getUI().getPage().open(Helper.listViewComponentToPdf(this, getModelForSearchFilters()).toString(), "_blank");
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    private void excel() {
        try {
            getUI().getPage().open(Helper.listViewComponentToExcel(this, getModelForSearchFilters()).toString(), "_blank");
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }    }

    private ResultsComponent buildResultsComponent() {
        return new ResultsComponent(this);
    }

    public void buildColumns(Grid grid) {

        List<FieldInterfaced> colFields = getColumnFields(getColumnType());

        buildColumns(grid, colFields, this instanceof JPAListViewComponent);
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent) {
        buildColumns(grid, colFields, isJPAListViewComponent, false);
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent, boolean editable) {
        buildColumns(grid, colFields, isJPAListViewComponent, editable, null);
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent, boolean editable, MDDBinder binder) {

        int pos = 0;
        for (FieldInterfaced f : colFields) {
            int finalPos = 1 + pos++;

            Grid.Column col;

            ICellStyleGenerator csg = null;

            if (f.isAnnotationPresent(CellStyleGenerator.class)) {
                try {
                    csg = (ICellStyleGenerator) f.getAnnotation(CellStyleGenerator.class).value().newInstance();
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }


            ICellStyleGenerator finalCsg = csg;
            col = grid.addColumn(new ValueProvider() {
                @Override
                public Object apply(Object o) {

                    if (finalCsg != null && !finalCsg.isContentShown()) return null;

                    Object v = null;

                    if (isJPAListViewComponent) {
                        v = ((Object[]) o)[finalPos + 1];
                    } else {
                        try {
                            v = ReflectionHelper.getValue(f, o);
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }
                    }

                    if (boolean[].class.equals(f.getType()) && f.isAnnotationPresent(WeekDays.class)) {
                        if (o == null) return null;
                        boolean[] wds = (boolean[]) v;

                        String s = "";

                        for (int i = 0; i < wds.length; i++) if (wds[i]) {
                            if (!"".equals(s)) s += ",";
                            s += WeekDaysComponent.days.get(i);
                        }

                        return s;

                    } else {
                        return (v != null)?"" + v:null;
                    }
                }
            });

            if (csg != null) col.setStyleGenerator(new StyleGenerator() {
                @Override
                public String apply(Object o) {
                    try {
                        return finalCsg.getStyles(o, ReflectionHelper.getValue(f, o));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                    return null;
                }
            });



            if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())
                || Long.class.equals(f.getType()) || long.class.equals(f.getType())
                || Double.class.equals(f.getType()) || double.class.equals(f.getType())
                    || BigInteger.class.equals(f.getType()) || BigDecimal.class.equals(f.getType()) || Number.class.equals(f.getType())
                    || FastMoney.class.equals(f.getType()) || MonetaryAmount.class.equals(f.getType())
                ) {
                col.setStyleGenerator(c -> "v-align-right");
        }

            if (editable) {
                if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) {
                    col.setEditorComponent(new CheckBox(), (o, v) -> {
                        try {
                            ReflectionHelper.setValue(f, o, v);
                            if (binder != null) binder.refresh();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    });
                    col.setEditable(true);
                } else if (String.class.equals(f.getType())) {
                    col.setEditorComponent(new TextField(), (o, v) -> {
                        try {
                            ReflectionHelper.setValue(f, o, v);
                            if (binder != null) binder.refresh();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    });
                    col.setEditable(true);
                } else if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())
                    || Long.class.equals(f.getType()) || long.class.equals(f.getType())) {

                    TextField nf = new TextField();
                    col.setEditorComponent(nf, (o, v) -> {
                        try {
                            //todo: validar entero
                            ReflectionHelper.setValue(f, o, v);
                            if (binder != null) binder.refresh();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    });
                    col.setEditable(true);
                } else if (Double.class.equals(f.getType()) || double.class.equals(f.getType())) {

                    TextField nf = new TextField();
                    col.setEditorComponent(nf, (o, v) -> {
                        try {
                            //todo: validar doble
                            //todo: falta float y long
                            ReflectionHelper.setValue(f, o, v);
                            if (binder != null) binder.refresh();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    });
                    col.setEditable(true);
                } else if (f.getType().isEnum()) {

                    ComboBox tf = new ComboBox();

                    tf.setDataProvider(new ListDataProvider(Arrays.asList(f.getType().getEnumConstants())));

                    col.setEditorComponent(tf, (o, v) -> {
                        try {
                            ReflectionHelper.setValue(f, o, v);
                            if (binder != null) binder.refresh();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    });
                    col.setEditable(true);

                } else if (f.isAnnotationPresent(ManyToOne.class)) {

                    ComboBox cb = new ComboBox();

                    //AbstractBackendDataProvider
                    //FetchItemsCallback
                    //newItemProvider

                    if (f.isAnnotationPresent(DataProvider.class)) {

                        try {

                            DataProvider a = f.getAnnotation(DataProvider.class);

                            cb.setDataProvider(a.dataProvider().newInstance());

                            cb.setItemCaptionGenerator(a.itemCaptionGenerator().newInstance());

                        } catch (InstantiationException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        }

                    } else {

                        if (f.isAnnotationPresent(DataProvider.class)) {

                            try {

                                DataProvider a = f.getAnnotation(DataProvider.class);

                                ((HasDataProvider)cb).setDataProvider(a.dataProvider().newInstance());

                                cb.setItemCaptionGenerator(a.itemCaptionGenerator().newInstance());

                            } catch (InstantiationException e) {
                                e.printStackTrace();
                            } catch (IllegalAccessException e) {
                                e.printStackTrace();
                            }

                        } else {
                            try {
                                Helper.notransact((em) -> cb.setDataProvider(new JPQLListDataProvider(em, f)));
                            } catch (Throwable throwable) {
                                throwable.printStackTrace();
                            }
                        }

                        FieldInterfaced fName = ReflectionHelper.getNameField(f.getType());
                        if (fName != null) cb.setItemCaptionGenerator((i) -> {
                            try {
                                return "" + ReflectionHelper.getValue(fName, i);
                            } catch (NoSuchMethodException e) {
                                e.printStackTrace();
                            } catch (IllegalAccessException e) {
                                e.printStackTrace();
                            } catch (InvocationTargetException e) {
                                e.printStackTrace();
                            }
                            return "Error";
                        });

                    }

                    col.setEditorComponent(cb, (o, v) -> {
                        try {
                                ReflectionHelper.setValue(f, o, v);
                            if (binder != null) binder.refresh();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    });
                    col.setEditable(true);

                }

                //todo: acabar
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

    private static double getColumnWidth(FieldInterfaced f) {

        if (f.isAnnotationPresent(ColumnWidth.class)) return f.getAnnotation(ColumnWidth.class).value();
        else {

            Class t = f.getType();
            if (
                    int.class.equals(t)
                            || Integer.class.equals(t)
                            || long.class.equals(t)
                            || Long.class.equals(t)
                            || float.class.equals(t)
                            || Float.class.equals(t)
                            || double.class.equals(t)
                            || Double.class.equals(t)
                            || boolean.class.equals(t)
                            || Boolean.class.equals(t)
                            || BigInteger.class.equals(t)
                            || BigDecimal.class.equals(t)
                            || Number.class.equals(t)
                    ) return 120;
            else if (LocalDate.class.equals(t)) return 120;
            else if (LocalDateTime.class.equals(t)) return 220;
            else return 250;

        }

    }

    public void search(Object filters) throws Throwable {
        setModelForSearchFilters(filters);
        resultsComponent.search(filters);
    }

    public void addListener(ListViewComponentListener listener) {
        listeners.add(listener);
    }


    public void edit(Object id) {
        for (ListViewComponentListener l : listeners) l.onEdit(id);
    };

    public void select(Object id) {
        for (ListViewComponentListener l : listeners) l.onSelect(id);
    };

    public abstract List findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit);

    public int count(Object filters) throws Throwable {
        count = gatherCount(filters);

        String s = (count == 1)?"" + count + " match.":"" + count + " matches";

        s += toCountLabel(filters);

        s += ".";

        countLabel.setValue(s);

        List<SumData> sums = getSums(filters);

        if (sums != null && sums.size() > 0) {

            sumsComponent.removeAllComponents();

            for (SumData d : sums) {
                sumsComponent.addComponent(buildSum(d));
            }

            sumsComponent.setVisible(true);
        } else {
            sumsComponent.setVisible(false);
        }

        List<ChartData> charts = getCharts(filters);

        if (charts != null && charts.size() > 0) {

            chartsComponent.removeAllComponents();

            for (ChartData d : charts) {
                chartsComponent.addComponent(buildChart(d));
            }

            chartsComponent.setVisible(true);
        } else {
            chartsComponent.setVisible(false);
        }

        return count;
    }

    private String toCountLabel(Object filters) {

        String s = "";

        if (filters != null) for (FieldInterfaced f : getFilterFields()) if (!f.isAnnotationPresent(Ignored.class)) {
            try {
                Object v = f.getValue(filters);

                if (v != null) {
                    if (!(v instanceof  String) || !Strings.isNullOrEmpty((String) v)) {
                        if (!"".equals(s)) s += ", ";
                        s += ReflectionHelper.getCaption(f) + " = " + v;
                        s += "";
                    }
                }

            } catch (Exception e) {
                MDD.alert(e);
            }
        }

        if (!"".equals(s)) s = " where " + s;
        return s;
    }

    private Component buildChart(ChartData d) {
        DonutChartConfig config = new DonutChartConfig();
        config
                .data()
                .labelsAsList(d.getValues().stream().map(v -> v.getTitle()).collect(Collectors.toList()))
                .addDataset(new PieDataset().label(d.getTitle()))
                .and();

        config.
                options()
                .rotation(Math.PI)
                .circumference(Math.PI)
                .responsive(true)
                .title()
                .display(true)
                .text(d.getTitle())
                .and()
                .animation()
                .animateScale(false)
                .animateRotate(true)
                .and()
                .done();


        double total = 0;
        for (ChartValue v : d.getValues()) {
            total += v.getValue();
        }

        List<String> labels = config.data().getLabels();
        for (Dataset<?, ?> ds : config.data().getDatasets()) {
            PieDataset lds = (PieDataset) ds;

            String[] colors = d.getValues().stream().map(v -> v.getStyle().toLowerCase().replaceAll("mdd-", "").replaceAll("-bgd", "")).collect(Collectors.toList()).toArray(new String[0]);

            if (colors.length > 0 && !Strings.isNullOrEmpty(colors[0])) lds.backgroundColor(colors);
            else lds.randomBackgroundColors(true);

            List<Double> data = new ArrayList<>();
            for (int i = 0; i < d.getValues().size(); i++) {
                //data.add(100d * d.getValues().get(i).getValue() / total);
                data.add(d.getValues().get(i).getValue());
            }
            lds.dataAsList(data);
        }

        ChartJs chart = new ChartJs(config);
        chart.setJsLoggingEnabled(true);
        if (d.getField() != null) {
            chart.addClickListener((a,b) -> {
                Object bean = filtersComponent.getBinder().getBean();
                try {
                    ReflectionHelper.setValue(d.getField(), bean, d.getValues().get(b).getKey());
                    filtersComponent.getBinder().setBean(bean);
                    search(bean);
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
                //DemoUtils.notification(a, b, config.data().getDatasets().get(a));
            });
        }

        return chart;
    }

    private Component buildSum(SumData d) {
        Label l = new Label(d.getTitle() + ": " + d.getValue());
        l.addStyleName("sum");
        if (!Strings.isNullOrEmpty(d.getStyle())) l.addStyleName(d.getStyle());
        return l;
    }

    protected abstract int gatherCount(Object filters) throws Throwable;

    protected abstract List<SumData> getSums(Object filters);

    protected abstract List<ChartData> getCharts(Object filters);

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

    public abstract void setModelForSearchFilters(Object filters);

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


    

    public static List<FieldInterfaced> getColumnFields(Class objectType) {

            List<FieldInterfaced> explicitColumns = ReflectionHelper.getAllFields(objectType).stream().filter(
                    (f) -> f.isAnnotationPresent(ListColumn.class)
            ).collect(Collectors.toList());

            if (explicitColumns.size() > 0) {
                return explicitColumns;
            } else
                return ReflectionHelper.getAllFields(objectType).stream().filter(
                        (f) -> !f.isAnnotationPresent(Transient.class)
                                && !f.isAnnotationPresent(Ignored.class)
                                && !Modifier.isTransient(f.getModifiers())
                                && !Collection.class.isAssignableFrom(f.getType())
                                && !Map.class.isAssignableFrom(f.getType())
                                && !f.isAnnotationPresent(GeneratedValue.class)
                ).collect(Collectors.toList());

    }

    public abstract Class getColumnType();

    public List<FieldInterfaced> getFilterFields() {
        List<FieldInterfaced> explicitFilters = ReflectionHelper.getAllFields(getFiltersType()).stream().filter(
                (f) -> f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)
        ).collect(Collectors.toList());
        if (explicitFilters.size() > 0) {
            return explicitFilters;
        } else {
            return ReflectionHelper.getAllFields(getFiltersType()).stream().filter(
                    (f) ->  !f.isAnnotationPresent(Ignored.class) && ((String.class.equals(f.getType()) && !f.isAnnotationPresent(Output.class)) || f.getType().isEnum())
            ).collect(Collectors.toList());
        }
    }

    public abstract Class getFiltersType();



    public boolean isAddEnabled() {
        return false;
    }

    public boolean isDeleteEnabled() {
        return false;
    }

    @Override
    public void addViewActionsMenuItems(MenuBar bar) {

        if (isAddEnabled()) {
            MenuBar.Command cmd;
            MenuBar.MenuItem i = bar.addItem("New", VaadinIcons.PLUS, cmd = new MenuBar.Command() {
                @Override
                public void menuSelected(MenuBar.MenuItem menuItem) {
                    try {
                        MDDUI.get().getNavegador().go("new");
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            });


            i.setDescription("Click Ctrl + ALt + N to fire");
            Button b;
            addComponent(b = new Button());
            b.addStyleName("hidden");
            b.addClickListener(e -> cmd.menuSelected(i));
            b.setClickShortcut(ShortcutAction.KeyCode.N, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
        }

        if (isDeleteEnabled()) {
            MenuBar.Command cmd;
            MenuBar.MenuItem i = bar.addItem("Delete", VaadinIcons.MINUS, cmd = new MenuBar.Command() {
                @Override
                public void menuSelected(MenuBar.MenuItem menuItem) {

                    MDD.confirm("Are you sure you want to delete the selected items?", new Runnable() {
                        @Override
                        public void run() {

                            try {
                                delete(getSelection());

                                resultsComponent.refresh();
                            } catch (Throwable throwable) {
                                MDD.alert(throwable);
                            }

                        }
                    });

                }

            });

            i.setDescription("Click Ctrl + DELETE to fire");
            Button b;
            addComponent(b = new Button());
            b.addStyleName("hidden");
            b.addClickListener(e -> cmd.menuSelected(i));
            b.setClickShortcut(ShortcutAction.KeyCode.DELETE, ShortcutAction.ModifierKey.CTRL);

        }

        super.addViewActionsMenuItems(bar);
    }

    protected void delete(Set selection) {

    }

    public Object toId(Object row) {
        return ReflectionHelper.getId(row);
    }

    public Grid getGrid() {
        return resultsComponent.getGrid();
    }

    public void decorateGridMain(Grid grid) {

        int pos = 2;
        for (FieldInterfaced f : getColumnFields(getColumnType())) {
            if (StyledEnum.class.isAssignableFrom(f.getType())) {
                Grid.Column col = grid.getColumn(f.getName());
                int finalPos = pos;
                col.setStyleGenerator(o -> {
                    if (o instanceof Object[]) {
                        return ((StyledEnum)((Object[])o)[finalPos]).getStyle();
                    } else {
                        try {
                            return ((StyledEnum)ReflectionHelper.getValue(f, o)).getStyle();
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                        return null;
                    }
                });
            }
            pos++;
        }


        decorateGrid(grid);
    }


    public abstract void decorateGrid(Grid grid);
}
