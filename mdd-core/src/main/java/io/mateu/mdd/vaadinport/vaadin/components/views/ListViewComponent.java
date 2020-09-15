package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.byteowls.vaadin.chartjs.ChartJs;
import com.byteowls.vaadin.chartjs.config.DonutChartConfig;
import com.byteowls.vaadin.chartjs.data.Dataset;
import com.byteowls.vaadin.chartjs.data.PieDataset;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.HasDataProvider;
import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.SerializablePredicate;
import com.vaadin.server.Setter;
import com.vaadin.server.UserError;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.shared.ui.BorderStyle;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.*;
import com.vaadin.ui.components.grid.EditorOpenEvent;
import com.vaadin.ui.components.grid.EditorOpenListener;
import com.vaadin.ui.components.grid.SortOrderProvider;
import com.vaadin.ui.renderers.ComponentRenderer;
import com.vaadin.ui.renderers.HtmlRenderer;
import com.vaadin.ui.renderers.TextRenderer;
import com.vaadin.ui.themes.ValoTheme;
import elemental.json.JsonValue;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.*;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.FieldInterfacedForCheckboxColumn;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.components.WeekDaysComponent;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;
import lombok.extern.slf4j.Slf4j;
import org.javamoney.moneta.FastMoney;
import org.vaadin.grid.cellrenderers.editable.DateFieldRenderer;
import org.vaadin.grid.cellrenderers.editable.SimpleSelectRenderer;
import org.vaadin.grid.cellrenderers.editable.TextFieldRenderer;
import org.vaadin.grid.cellrenderers.editoraware.CheckboxRenderer;

import javax.money.MonetaryAmount;
import javax.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public abstract class ListViewComponent extends AbstractViewComponent<ListViewComponent> {

    public ResultsComponent resultsComponent;

    private List<ListViewComponentListener> listeners = new ArrayList<>();

    private int count;
    private Label countLabel;
    public FiltersComponent filtersComponent;
    private Button excelButton;
    private Button pdfButton;
    private HorizontalLayout matchesComponent;


    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.LINES;
    }

    public String getFieldsFilter() {
        return null;
    }

    public ListViewComponent() {
        if (!MDD.isMobile()) setSizeFull();
    }

    @Override
    public ListViewComponent build() throws Exception {

        addStyleName("listviewcomponent");

        if (!(this instanceof JPACollectionFieldListViewComponent)) addComponent(filtersComponent = new FiltersComponent(this));

        super.build();

        setSizeFull();

        if (!(this instanceof JPACollectionFieldListViewComponent)) {
            addComponent(matchesComponent = new HorizontalLayout(excelButton = new Button("<i class=\"fas fa-file-excel\"></i>", e -> excel()), pdfButton = new Button("<i class=\"fas fa-file-pdf\"></i>", e -> pdf()), countLabel = new Label()));
            matchesComponent.addStyleName(CSS.NOPADDING);
            countLabel.addStyleName("resultsmessage");

            excelButton.addStyleName(ValoTheme.BUTTON_LINK);
            excelButton.addStyleName("botondeicono");
            excelButton.setCaptionAsHtml(true);

            pdfButton.addStyleName(ValoTheme.BUTTON_LINK);
            pdfButton.addStyleName("botondeicono");
            pdfButton.setCaptionAsHtml(true);
        }


        addComponentsAndExpand(resultsComponent = buildResultsComponent());
        return this;
    }


    private void pdf() {
        try {
            getUI().getPage().open(VaadinHelper.listViewComponentToPdf(this, getModelForSearchFilters()).toString(), "_blank");
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }
    }

    private void excel() {
        try {
            getUI().getPage().open(VaadinHelper.listViewComponentToExcel(this, getModelForSearchFilters()).toString(), "_blank");
        } catch (Throwable throwable) {
            MDD.alert(throwable);
        }    }

    private ResultsComponent buildResultsComponent() {
        return new ResultsComponent(this, matchesComponent);
    }

    public List<FieldInterfaced> getColumnFields() {
        return getColumnFields(getColumnType(), false, getFieldsFilter(), new ArrayList<>(), new HashMap<>());
    }

    public void buildColumns(Grid grid) {

        List<FieldInterfaced> colFields = getColumnFields();

        buildColumns(grid, colFields, this instanceof JPAListViewComponent, false, null, null, getFieldsFilter());
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent, boolean editable) {
        buildColumns(grid, colFields, isJPAListViewComponent, editable, null);
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent, boolean editable, MDDBinder binder) {
        buildColumns(grid, colFields, isJPAListViewComponent, editable, binder, null);
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent, boolean editable, MDDBinder binder, FieldInterfaced collectionField) {
        buildColumns(grid, colFields, isJPAListViewComponent, editable, binder, null, null);
    }

    public static void buildColumns(Grid grid, List<FieldInterfaced> colFields, boolean isJPAListViewComponent, boolean editable, MDDBinder binder, FieldInterfaced collectionField, String fieldsFilter) {
        List<String> columnIds = new ArrayList<>();
        Map<String, FieldInterfaced> fieldByColumnId = new HashMap<>();
        if (!Strings.isNullOrEmpty(fieldsFilter)) {
            List<String> fns = new ArrayList<>();
            for (String s : fieldsFilter.split(",")) {
                String n = s.trim();
                if (n.contains("(")) n = n.substring(0, n.indexOf("("));
                if (n.contains(" ")) n = n.substring(0, n.indexOf(" "));
                fns.add(n);
            }
            for (int i = 0; i < colFields.size(); i++) {
                fieldByColumnId.put(fns.get(i), colFields.get(i));
                columnIds.add(fns.get(i));
            }
        } else {
            colFields.forEach(f -> {
                fieldByColumnId.put(f.getId(), f);
                columnIds.add(f.getId());
            });
        }

        buildColumns(grid, columnIds, fieldByColumnId, isJPAListViewComponent, editable, binder, collectionField, fieldsFilter);
    }


    public static void buildColumns(Grid grid, List<String> columnIds, Map<String, FieldInterfaced> fieldByColumnId, boolean isJPAListViewComponent, boolean editable, MDDBinder binder, FieldInterfaced collectionField, String fieldsFilter) {

        Object bean = binder != null?binder.getBean():null;

        // ancho columnas en la definición del filtro. ej:  nombre(200),apellidos(300), ...
        Map<String, String> nombresColumnas = new HashMap<>();
        Map<String, String> extras = new HashMap<>();
        if (!Strings.isNullOrEmpty(fieldsFilter)) {
            Pattern patternNombre = Pattern.compile("'(.*?)'");
            Pattern patternParentesis = Pattern.compile("\\((.*?)\\)");
            for (String t : fieldsFilter.split(",")) {
                String n = t;
                if (n.contains("(")) n = n.substring(0, n.indexOf("("));
                if (n.contains(" ")) n = n.substring(0, n.indexOf(" "));
                if (t.contains("'")) {
                    String v = "";
                    Matcher matcher = patternNombre.matcher(t);
                    if (matcher.find())
                    {
                        v = matcher.group(1);
                    }
                    nombresColumnas.putIfAbsent(n, v);
                }
                if (t.contains("(")) {
                    String v = "";
                    Matcher matcher = patternParentesis.matcher(t);
                    if (matcher.find())
                    {
                        v = matcher.group(1);
                    }
                    extras.putIfAbsent(n, v);
                }
            }
        }

        List<Grid.Column> colBindings = new ArrayList<>();
        Map<Grid.Column, FieldInterfaced> fieldByCol = new HashMap<>();

        // descomponemos los campos que tienen usecheckbox
        for (String columnId : columnIds) {
            FieldInterfaced f = fieldByColumnId.get(columnId);
            if (f != null) {
                if (f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()) {

                    Collection possibleValues = null;

                    String vmn = ReflectionHelper.getGetter(collectionField.getName() + ReflectionHelper.getFirstUpper(f.getName())) + "Values";

                    Method mdp = ReflectionHelper.getMethod(collectionField.getDeclaringClass(), vmn);

                    if (mdp != null) {
                        try {
                            possibleValues = (Collection) mdp.invoke(bean);
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    } else {
                        MDD.alert("Missing " + vmn + " method at " + collectionField.getDeclaringClass().getName());
                    }


                    int pos = 0;
                    if (possibleValues != null) for (Object v : possibleValues) if (v != null) {
                        fieldByColumnId.put(columnId + "_" + pos, new FieldInterfacedForCheckboxColumn(f.getName() + "" + pos, f, v, binder));
                        pos++;
                    }

                } else fieldByColumnId.put(columnId, f);
            }

        }

        int pos = 0;
        for (String columnId : columnIds) {
            FieldInterfaced f = fieldByColumnId.get(columnId);
            if (f != null) {

                final int finalPos = (isJPAListViewComponent?1:0) + pos++;

                Grid.Column col;

                ICellStyleGenerator csg = null;

                if (f.isAnnotationPresent(CellStyleGenerator.class)) {
                    try {
                        csg = (ICellStyleGenerator) f.getAnnotation(CellStyleGenerator.class).value().newInstance();
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }

                if (boolean.class.equals(f.getType()) || Boolean.class.equals(f.getType())) {
                    csg = new ICellStyleGenerator() {
                        @Override
                        public String getStyles(Object row, Object value) {
                            return ""; //(value != null && ((Boolean)value))?"rowyes":"rowno";
                        }

                        @Override
                        public boolean isContentShown() {
                            return true;
                        }
                    };
                }

                DecimalFormat df = new DecimalFormat("##,###,###,###,##0.00");

                ICellStyleGenerator finalCsg = csg;
                col = grid.addColumn(new ValueProvider() {
                    @Override
                    public Object apply(Object o) {

                        //if (finalCsg != null && !finalCsg.isContentShown()) return null;

                        Object v = null;

                        if (o instanceof Object[]) {
                            v = ((Object[]) o)[finalPos];
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

                        if (double.class.equals(f.getType()) && f.isAnnotationPresent(Money.class)) {
                            return (v != null)?df.format(v):df.format(0);
                        } else if (boolean[].class.equals(f.getType()) && f.isAnnotationPresent(WeekDays.class)) {
                            if (o == null) return null;
                            boolean[] wds = (boolean[]) v;

                            String s = "";

                            if (wds != null) for (int i = 0; i < wds.length; i++) {
                                if (!"".equals(s)) s += ",";
                                s += wds[i]?WeekDaysComponent.days.get(i):"-";
                            }

                            return s;

                        } else if (LocalDate.class.equals(f.getType())) {
                            return v != null?((LocalDate)v).format(DateTimeFormatter.ISO_LOCAL_DATE):null;
                        } else if (LocalDateTime.class.equals(f.getType())) {
                            return v != null?((LocalDateTime)v).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")):null;
                        } else if (LocalTime.class.equals(f.getType())) {
                            return v != null?((LocalTime)v).format(DateTimeFormatter.ofPattern("HH:mm")):null;
                        } else if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) {
                            return "<i class='fas fa-" + ((v != null && (Boolean)v)?"check":"times") + "'></i>";
                        } else if (IIcon.class.isAssignableFrom(f.getType())) {
                            return (v != null)?"" + v:null;
                        } else if (IResource.class.equals(f.getType())) {
                            IResource r = (IResource) v;
                            if (r != null) {
                                try {
                                    return new Link(r.getName(), new ExternalResource(r.toFileLocator().getUrl()), "_blank", 400, 400, BorderStyle.MINIMAL);
                                } catch (Exception e) {
                                    return null;
                                }
                            } else {
                                return null;
                            }
                        } else {
                            return (v != null)?"" + v:null;
                        }
                    }
                });

                if (IResource.class.equals(f.getType())) col.setRenderer(new ComponentRenderer());
                if (IIcon.class.isAssignableFrom(f.getType())) col.setRenderer(new HtmlRenderer(""));
                if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) col.setRenderer(new HtmlRenderer(""));

                if (csg != null) col.setStyleGenerator(new StyleGenerator() {
                    @Override
                    public String apply(Object o) {
                        try {

                            Object v = null;

                            if (o instanceof Object[]) {
                                v = ((Object[]) o)[finalPos];
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

                            String s = finalCsg.getStyles(o, v);

                            if (o instanceof Activable) {
                                if (!((Activable) o).isActive()) s = (Strings.isNullOrEmpty(s)?"":s + " ") + "cancelled";
                            } else if (o instanceof Cancellable) {
                                if (((Cancellable)o).isCancelled()) s = (Strings.isNullOrEmpty(s)?"":s + " ") + "cancelled";
                            }

                            return s;
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                        return null;
                    }
                });
                else if (collectionField != null && collectionField.getGenericClass() != null && (Activable.class.isAssignableFrom(collectionField.getGenericClass()) || Cancellable.class.isAssignableFrom(collectionField.getGenericClass()))) {
                    col.setStyleGenerator(new StyleGenerator() {
                        @Override
                        public String apply(Object o) {
                            try {
                                if (o instanceof Activable) {
                                    if (!((Activable) o).isActive()) return "cancelled";
                                } else if (o instanceof Cancellable) {
                                    if (((Cancellable)o).isCancelled()) return "cancelled";
                                }
                            } catch (Exception e) {
                                MDD.alert(e);
                            }
                            return null;
                        }
                    });
                }


                if (finalCsg != null && !finalCsg.isContentShown()) col.setRenderer(new TextRenderer() {
                    @Override
                    public JsonValue encode(Object value) {
                        return super.encode(null);
                    }
                });


                if (f.isAnnotationPresent(HtmlCol.class)) col.setRenderer(new HtmlRenderer(""));


                if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())
                        || Long.class.equals(f.getType()) || long.class.equals(f.getType())
                        || Double.class.equals(f.getType()) || double.class.equals(f.getType())
                        || BigInteger.class.equals(f.getType()) || BigDecimal.class.equals(f.getType()) || Number.class.equals(f.getType())
                        || FastMoney.class.equals(f.getType()) || MonetaryAmount.class.equals(f.getType())
                        || f.isAnnotationPresent(RightAlignedCol.class)
                ) {
                    if (f.isAnnotationPresent(Balance.class)) {

                        col.setStyleGenerator(new StyleGenerator() {
                            @Override
                            public String apply(Object o) {
                                try {

                                    Object v = null;

                                    if (o instanceof Object[]) {
                                        v = ((Object[]) o)[finalPos];
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

                                    String s = "v-align-right";
                                    if (v != null && ((double)v) < 0) {
                                        s += " negativo";
                                    } else {
                                        s += " positivo";
                                    }

                                    return s;
                                } catch (Exception e) {
                                    MDD.alert(e);
                                }
                                return null;
                            }
                        });
                    } else col.setStyleGenerator(c -> "v-align-right");
                }

                if (editable) {

                    boolean eager = false;

                    if (f.isAnnotationPresent(Output.class)) {
                    } else {

                        if (collectionField != null && collectionField.isAnnotationPresent(UseComponentsToEditValues.class)) {

                            setEditorAsRenderer(col, f, eager, grid, binder, collectionField);

                        } else {

                            Method mdp = ReflectionHelper.getMethod(f.getDeclaringClass(), ReflectionHelper.getGetter(f.getName()) + "DataProvider");

                            if (f.getType().isAnnotationPresent(UseIdToSelect.class)) {
                                TextField nf = new TextField();
                                if (eager) nf.setValueChangeMode(ValueChangeMode.EAGER);
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> {
                                    Object id = null;
                                    if (o != null) {
                                        id = ReflectionHelper.getId(o);
                                    } // else stf.setValue("");
                                    return (id != null)?"" + id:"";
                                }, (o, v) -> {

                                    Object[] w = {null};

                                    try {
                                        Helper.notransact(em -> {

                                            FieldInterfaced fid = ReflectionHelper.getIdField(f.getType());

                                            String sql = "select x from " + f.getType().getName() + " x where x." + fid.getName() + " = :i";

                                            Object id = null;
                                            if (int.class.equals(fid.getType()) || Integer.class.equals(fid.getType())) {
                                                id = Integer.parseInt((String) v);
                                            } else if (long.class.equals(fid.getType()) || Long.class.equals(fid.getType())) {
                                                id = Long.parseLong((String) v);
                                            } else if (String.class.equals(fid.getType())) {
                                                id = v;
                                            } else id = v;

                                            Query q = em.createQuery(sql).setParameter("i", id);

                                            List r = q.getResultList();


                                            if (r.size() == 1) {
                                                w[0] = r.get(0);
                                                nf.setComponentError(null);
                                            } else {
                                                nf.setComponentError(new UserError("Not found"));
                                            }

                                        });
                                    } catch (Throwable throwable) {
                                        if (throwable instanceof InvocationTargetException) {
                                            throwable = throwable.getCause();
                                        }

                                        String msg = (throwable.getMessage() != null)?throwable.getMessage():throwable.getClass().getName();

                                        nf.setComponentError(new UserError(msg));
                                        MDD.alert(throwable);
                                    }

                                    try {
                                        ReflectionHelper.setValue(f, o, w[0]);
                                        //refrescar(col, binder, f, o, w[0], colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }

                                }));
                                col.setEditable(true);

                            } else if (f.isAnnotationPresent(ValueClass.class) || f.isAnnotationPresent(DataProvider.class) || mdp != null || f.isAnnotationPresent(ManyToOne.class)) {

                                ComboBox cb = new ComboBox();

                                //AbstractBackendDataProvider
                                //FetchItemsCallback
                                //newItemProvider

                                boolean necesitaCaptionGenerator = false;

                                if (mdp != null) {
                                    // en este punto no hacemos nada
                                } else if (f.isAnnotationPresent(ValueClass.class)) {

                                    ValueClass a = f.getAnnotation(ValueClass.class);

                                    cb.setDataProvider(new JPQLListDataProvider(a.value()));

                                } else if (f.isAnnotationPresent(DataProvider.class)) {

                                    necesitaCaptionGenerator = true;

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

                                    necesitaCaptionGenerator = true;

                                    try {
                                        Helper.notransact((em) -> cb.setDataProvider(new JPQLListDataProvider(em, f)));
                                    } catch (Throwable throwable) {
                                        throwable.printStackTrace();
                                    }
                                }

                                if (necesitaCaptionGenerator) {
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


                                if (mdp != null) {
                                    grid.getEditor().addOpenListener(new EditorOpenListener() {
                                        @Override
                                        public void onEditorOpen(EditorOpenEvent editorOpenEvent) {
                                            try {
                                                Object object = editorOpenEvent.getBean();
                                                cb.setDataProvider((com.vaadin.data.provider.DataProvider) mdp.invoke(object), fx -> new SerializablePredicate() {
                                                    @Override
                                                    public boolean test(Object o) {
                                                        String s = (String) fx;
                                                        return  o != null && (Strings.isNullOrEmpty(s) || cb.getItemCaptionGenerator().apply(o).toLowerCase().contains(((String) s).toLowerCase()));
                                                    }
                                                });
                                            } catch (Exception e) {
                                                MDD.alert(e);
                                            }

                                        }
                                    });
                                }

                                col.setEditorComponent(cb, (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                });

                                col.setEditable(true);

                            } else if (FareValue.class.equals(f.getType())) {
                                TextField nf = new TextField();
                                nf.setValueChangeMode(ValueChangeMode.EAGER);
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> ReflectionHelper.getValue(f, o, ""), (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, (v != null)?new FareValue((String) v):null);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);

                            } else if (f.isAnnotationPresent(WeekDays.class)) {

                                List<String> days = Lists.newArrayList("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su");

                                col.setEditorComponent(new WeekDaysGridEditor(), (o, v) -> {
                                    try {
                                        boolean[] array = {false, false, false, false, false, false, false};
                                        if (v != null) {
                                            for (int i = 0; i < days.size(); i++) if (i < array.length) array[i] = ((String)v).contains(days.get(i));
                                        }
                                        ReflectionHelper.setValue(f, o, v != null?array:null);
                                        if (binder != null) binder.refresh();
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                });
                                col.setEditable(true);
                            } else if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) {
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
                                TextField nf = new TextField();
                                if (eager) nf.setValueChangeMode(ValueChangeMode.EAGER);
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> ReflectionHelper.getValue(f, o, ""), (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);
                            } else if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())
                                    || Long.class.equals(f.getType()) || long.class.equals(f.getType())) {

                                TextField nf = new TextField();
                                if (eager) nf.setValueChangeMode(ValueChangeMode.EAGER);
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> "" + ReflectionHelper.getValue(f, o, ""), (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);
                            } else if (Double.class.equals(f.getType()) || double.class.equals(f.getType())) {

                                TextField nf = new TextField();
                                if (eager) nf.setValueChangeMode(ValueChangeMode.EAGER);
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> "" + ReflectionHelper.getValue(f, o, ""), (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);
                            } else if (LocalDate.class.equals(f.getType())) {

                                DateField nf = new DateField();
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> ReflectionHelper.getValue(f, o, null), (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);
                            } else if (LocalDateTime.class.equals(f.getType())) {

                                DateTimeField nf = new DateTimeField();
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> ReflectionHelper.getValue(f, o, null), (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);
                            } else if (LocalTime.class.equals(f.getType())) {

                                TextField nf = new TextField();
                                col.setEditorBinding(grid.getEditor().getBinder().forField(nf).bind(o -> "" + ReflectionHelper.getValue(f, o, ""), (o, v) -> {
                                    try {
                                        LocalTime t = null;
                                        if (v != null && v instanceof String) {
                                            String s = (String) v;
                                            if (!"".equals(s)) {
                                                try {
                                                    t = LocalTime.parse(s, DateTimeFormatter.ofPattern("HHmm"));
                                                } catch (Exception e1) {
                                                    try {
                                                        t = LocalTime.parse(s, DateTimeFormatter.ofPattern("HH:mm"));
                                                    } catch (Exception e2) {
                                                        try {
                                                            t = LocalTime.parse(s, DateTimeFormatter.ofPattern("HH.mm"));
                                                        } catch (Exception e3) {

                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        ReflectionHelper.setValue(f, o, t);
                                        //refrescar(col, binder, f, o, t, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                }));
                                col.setEditable(true);
                            } else if (f.getType().isEnum()) {

                                ComboBox tf = new ComboBox();

                                tf.setDataProvider(new ListDataProvider(Arrays.asList(f.getType().getEnumConstants())));

                                col.setEditorComponent(tf, (o, v) -> {
                                    try {
                                        ReflectionHelper.setValue(f, o, v);
                                        //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                                    } catch (Exception e) {
                                        MDD.alert(e);
                                    }
                                });
                                col.setEditable(true);

                            }

                        }


                        //todo: acabar


                        }


                }

                colBindings.add(col);
                fieldByCol.put(col, f);

                col.setCaption(nombresColumnas.getOrDefault(columnId, Helper.capitalize(f.getName())));
                if (f instanceof FieldInterfacedForCheckboxColumn) col.setCaption(((FieldInterfacedForCheckboxColumn)f).getCaption());
                if (f.isAnnotationPresent(Caption.class)) col.setCaption(f.getAnnotation(Caption.class).value());

                if (columnIds.size() == 1) col.setExpandRatio(1);
                else col.setWidth(getColumnWidth(f, extras.get(columnId)));

                col.setSortOrderProvider(new SortOrderProvider() {
                    @Override
                    public Stream<QuerySortOrder> apply(SortDirection sortDirection) {
                        return Stream.of(new QuerySortOrder(columnId, sortDirection));
                    }
                }).setId(columnId);

            }
        }


    }

    private static void setEditorAsRenderer(Grid.Column col, FieldInterfaced f, boolean eager, Grid grid, MDDBinder binder, FieldInterfaced collectionField) {
        Method mdp = ReflectionHelper.getMethod(f.getDeclaringClass(), ReflectionHelper.getGetter(f.getName()) + "DataProvider");

        Setter setter = (o, v) -> {
            try {
                ReflectionHelper.setValue(f, o, v);
                //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                ReflectionHelper.setValue(collectionField, binder.getBean(), ReflectionHelper.getValue(collectionField, binder.getBean()));
                binder.refresh();
            } catch (Exception e) {
                MDD.alert(e);
            }
        };

        if (f.getType().isAnnotationPresent(UseIdToSelect.class)) {
           col.setRenderer(o -> {
               Object id = null;
               if (o != null) {
                   id = ReflectionHelper.getId(o);
               } // else stf.setValue("");
               return (id != null)?"" + id:"";
           }, new TextFieldRenderer((o, v) -> {

               Object[] w = {null};

               try {
                   Helper.notransact(em -> {

                       FieldInterfaced fid = ReflectionHelper.getIdField(f.getType());

                       String sql = "select x from " + f.getType().getName() + " x where x." + fid.getName() + " = :i";

                       Object id = null;
                       if (int.class.equals(fid.getType()) || Integer.class.equals(fid.getType())) {
                           id = Integer.parseInt((String) v);
                       } else if (long.class.equals(fid.getType()) || Long.class.equals(fid.getType())) {
                           id = Long.parseLong((String) v);
                       } else if (String.class.equals(fid.getType())) {
                           id = v;
                       } else id = v;

                       Query q = em.createQuery(sql).setParameter("i", id);

                       List r = q.getResultList();


                       if (r.size() == 1) {
                           w[0] = r.get(0);
                           //setComponentError(null);
                       } else {
                           //setComponentError(new UserError("Not found"));
                           MDD.alert("Not found");
                       }

                   });
               } catch (Throwable throwable) {
                   if (throwable instanceof InvocationTargetException) {
                       throwable = throwable.getCause();
                   }

                   String msg = (throwable.getMessage() != null)?throwable.getMessage():throwable.getClass().getName();

                   //nf.setComponentError(new UserError(msg));
                   MDD.alert(throwable);
               }

               try {
                   ReflectionHelper.setValue(f, o, w[0]);
                   //refrescar(col, binder, f, o, w[0], colBindings, fieldByCol);
               } catch (Exception e) {
                   MDD.alert(e);
               }

           }));

        } else if (f.isAnnotationPresent(ValueClass.class) || f.isAnnotationPresent(DataProvider.class) || mdp != null || f.isAnnotationPresent(ManyToOne.class)) {

            /*
            ComboBox cb = new ComboBox();

            //AbstractBackendDataProvider
            //FetchItemsCallback
            //newItemProvider

            boolean necesitaCaptionGenerator = false;

            if (mdp != null) {
                // en este punto no hacemos nada
            } else if (f.isAnnotationPresent(ValueClass.class)) {

                ValueClass a = f.getAnnotation(ValueClass.class);

                cb.setDataProvider(new JPQLListDataProvider(a.value()));

            } else if (f.isAnnotationPresent(DataProvider.class)) {

                necesitaCaptionGenerator = true;

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

                necesitaCaptionGenerator = true;

                try {
                    Helper.notransact((em) -> cb.setDataProvider(new JPQLListDataProvider(em, f)));
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }

            if (necesitaCaptionGenerator) {
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


            if (mdp != null) {
                grid.getEditor().addOpenListener(new EditorOpenListener() {
                    @Override
                    public void onEditorOpen(EditorOpenEvent editorOpenEvent) {
                        try {
                            Object object = editorOpenEvent.getBean();
                            cb.setDataProvider((com.vaadin.data.provider.DataProvider) mdp.invoke(object), fx -> new SerializablePredicate() {
                                @Override
                                public boolean test(Object o) {
                                    String s = (String) fx;
                                    return  o != null && (Strings.isNullOrEmpty(s) || cb.getItemCaptionGenerator().apply(o).toLowerCase().contains(((String) s).toLowerCase()));
                                }
                            });
                        } catch (Exception e) {
                            MDD.alert(e);
                        }

                    }
                });
            }


             */

            col.setRenderer(new SimpleSelectRenderer((o, v) -> {
                try {
                    ReflectionHelper.setValue(f, o, v);
                    //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }, new ArrayList()));

        } else if (FareValue.class.equals(f.getType())) {

            col.setRenderer(o -> ReflectionHelper.getValue(f, o, ""), new TextFieldRenderer((o, v) -> {
                try {
                    ReflectionHelper.setValue(f, o, (v != null)?new FareValue((String) v):null);
                    //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }));

        } else if (f.isAnnotationPresent(WeekDays.class)) {

            List<String> days = Lists.newArrayList("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su");

            /*

            col.setEditorComponent(new WeekDaysGridEditor(), (o, v) -> {
                try {
                    boolean array[] = {false, false, false, false, false, false, false};
                    if (v != null) {
                        for (int i = 0; i < days.size(); i++) if (i < array.length) array[i] = ((String)v).contains(days.get(i));
                    }
                    ReflectionHelper.setValue(f, o, v != null?array:null);
                    if (binder != null) binder.refresh();
                } catch (Exception e) {
                    MDD.alert(e);
                }
            });
            col.setEditable(true);

             */
        } else if (Boolean.class.equals(f.getType()) || boolean.class.equals(f.getType())) {
            col.setRenderer(new CheckboxRenderer(setter));
        } else if (String.class.equals(f.getType())) {
            TextFieldRenderer r;
            col.setRenderer(r = new TextFieldRenderer(setter));
            r.setConverter(new DummyConverter());
        } else if (Integer.class.equals(f.getType()) || int.class.equals(f.getType())
                || Long.class.equals(f.getType()) || long.class.equals(f.getType())) {
            TextFieldRenderer r;
            col.setRenderer(r = new TextFieldRenderer(setter));
            r.setConverter(new DummyConverter());
        } else if (Double.class.equals(f.getType()) || double.class.equals(f.getType())) {
            TextFieldRenderer r;
            col.setRenderer(r = new TextFieldRenderer(setter));
            r.setConverter(new DummyConverter());
        } else if (LocalDate.class.equals(f.getType())) {
            TextFieldRenderer r;
            col.setRenderer(r = new TextFieldRenderer(setter));
            r.setConverter(new DummyConverter(null));
        } else if (LocalDateTime.class.equals(f.getType())) {
            TextFieldRenderer r;
            col.setRenderer(r = new TextFieldRenderer(setter));
            r.setConverter(new DummyConverter(null));
        } else if (LocalTime.class.equals(f.getType())) {
            col.setRenderer(o -> "" + ReflectionHelper.getValue(f, o, ""), new DateFieldRenderer((o, v) -> {
                try {
                    LocalTime t = null;
                    if (v != null && v instanceof String) {
                        String s = (String) v;
                        if (!"".equals(s)) {
                            try {
                                t = LocalTime.parse(s, DateTimeFormatter.ofPattern("HHmm"));
                            } catch (Exception e1) {
                                try {
                                    t = LocalTime.parse(s, DateTimeFormatter.ofPattern("HH:mm"));
                                } catch (Exception e2) {
                                    try {
                                        t = LocalTime.parse(s, DateTimeFormatter.ofPattern("HH.mm"));
                                    } catch (Exception e3) {

                                    }
                                }
                            }
                        }
                    }
                    ReflectionHelper.setValue(f, o, t);
                    //refrescar(col, binder, f, o, t, colBindings, fieldByCol);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }));
        } else if (f.getType().isEnum()) {
            col.setRenderer(new SimpleSelectRenderer((o, v) -> {
                try {
                    ReflectionHelper.setValue(f, o, v);
                    //refrescar(col, binder, f, o, v, colBindings, fieldByCol);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            }, Arrays.asList(f.getType().getEnumConstants())));
        }
    }

    private static void refrescar(Grid.Column col, MDDBinder binder, FieldInterfaced f, Object o, Object v, List<Grid.Column> colBindings, Map<Grid.Column, FieldInterfaced> fieldByCol) {
        if (binder != null) binder.refresh();
        if (false) colBindings.stream().filter(e -> !e.equals(col)).forEach(b -> {
            try {
                Object w = ReflectionHelper.getValue(fieldByCol.get(b), o);
                if (b.getEditorBinding() != null && b.getEditorBinding().getField() != null) {
                    if (b.getEditorBinding().getField() instanceof TextField) b.getEditorBinding().getField().setValue(w != null?"" + w:"");
                    else b.getEditorBinding().getField().setValue(w);
                } else {
                    log.debug("columna " + b.getId() + " no es editable");
                    b.getValueProvider().apply(o);
                }
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        });
    }

    public static double getColumnWidth(FieldInterfaced f) {
        return getColumnWidth(f, null);
    }

    public static double getColumnWidth(FieldInterfaced f, String overriden) {

        if (!Strings.isNullOrEmpty(overriden)) return Double.parseDouble(overriden);
        else if (f.isAnnotationPresent(ColumnWidth.class)) return f.getAnnotation(ColumnWidth.class).value();
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
            else if (LocalDate.class.equals(t)) return 125;
            else if (LocalDateTime.class.equals(t)) return 225;
            else if (LocalTime.class.equals(t)) return 225;
            else if (FareValue.class.equals(t)) return 125;
            else if (f.isAnnotationPresent(WeekDays.class)) return 200;
            else return 250;

        }

    }

    public void search(Object filters) throws Throwable {
        setModelForSearchFilters(filters);
        resultsComponent.search(filters);
    }

    public ListViewComponent addListener(ListViewComponentListener listener) {
        listeners.add(listener);
        return this;
    }


    public void edit(Object id) {
        for (ListViewComponentListener l : listeners) l.onEdit(id);
    };

    public void select(Object id) {
        for (ListViewComponentListener l : listeners) l.onSelect(id);
    };


    public Object getPrevious(Object current) {
        Object x = resultsComponent.getPrevious();
        if (getView().getViewComponent() instanceof RpcListViewComponent && ((RpcListViewComponent) getView().getViewComponent()).getRpcListView() instanceof AbstractJPQLListView) {
            try {
                return ReflectionHelper.getId(((RpcListViewComponent) getView().getViewComponent()).getRpcListView().onEdit(x));
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        }
        return toId(x);
    }

    public Object getNext(Object current) {
        Object x = resultsComponent.getNext();
        if (getView().getViewComponent() instanceof RpcListViewComponent && ((RpcListViewComponent) getView().getViewComponent()).getRpcListView() instanceof AbstractJPQLListView) {
            try {
                return ReflectionHelper.getId(((RpcListViewComponent) getView().getViewComponent()).getRpcListView().onEdit(x));
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        }
        return toId(x);
    }


    public abstract Collection findAll(Object filters, List<QuerySortOrder> sortOrders, int offset, int limit);

    public int count(Object filters) throws Throwable {
        count = gatherCount(filters);

        String s = (count == 1)?"" + count + " match.":"" + count + " matches";

        s += toCountLabel(filters);

        s += ".";

        countLabel.setValue(s);

        List<SumData> sums = getSums(filters);

        getKpisContainer().removeAllComponents();

        if (sums != null && sums.size() > 0) {

            for (SumData d : sums) {
                getKpisContainer().addComponent(buildSum(d));
            }

        }


        if (MDD.getApp().isChartsEnabled()) {
            List<ChartData> charts = getCharts(filters);

            if (charts != null && charts.size() > 0) {

                for (ChartData d : charts) {
                    getKpisContainer().addComponent(buildChart(d));
                }

            }
        }


        return count;
    }

    private String toCountLabel(Object filters) {

        String s = "";

        if (filters != null) for (FieldInterfaced f : getFilterFields()) if (!f.isAnnotationPresent(Version.class) && !f.isAnnotationPresent(Ignored.class)) {
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

    @Override
    public String getPageTitle() {
        try {
            return super.getPageTitle() + toCountLabel(getModelForSearchFilters());
        } catch (Exception e) {
        }
        return super.getTitle();
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
            VerticalLayout vl = new VerticalLayout();
            vl.addStyleName("kpi");
            vl.setWidthUndefined();

            vl.addComponent(new Label(d.getTitle()));

            Object v = d.getValue();

            Label l;
            vl.addComponent(l = new Label());
            l.addStyleName("valor");
            l.setContentMode(ContentMode.HTML);


                    String s = "";

                    if (double.class.equals(v.getClass())) {
                        DecimalFormat df = new DecimalFormat("##,###,###,###,##0.00");
                        s = df.format(v != null?v:0);
                        if (v != null && ((double)v) < 0) {
                            l.addStyleName("negativo");
                            l.removeStyleName("positivo");
                        } else {
                            l.addStyleName("positivo");
                            l.removeStyleName("negativo");
                        }
                    } else {
                        if (v == null) s = "";
                        else {
                            if (v instanceof Boolean) {
                                if ((Boolean) v) {
                                    s = VaadinIcons.CHECK.getHtml();
                                    l.addStyleName(ValoTheme.BUTTON_FRIENDLY);
                                } else {
                                    s = VaadinIcons.CLOSE.getHtml();
                                    l.addStyleName(ValoTheme.BUTTON_DANGER);
                                }
                                l.addStyleName("centered");
                            } else {
                                s = "" + v;
                            }
                        }
                    }
                    l.setValue(s);

            return vl;

            /*
        Label l = new Label(d.getTitle() + ": " + d.getValue());
        l.addStyleName("sum");
        if (!Strings.isNullOrEmpty(d.getStyle())) l.addStyleName(d.getStyle());
        return l;
        */

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

    public abstract Object getModelForSearchFilters() throws InstantiationException, IllegalAccessException, NoSuchMethodException, InvocationTargetException;

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
            if ((RpcView.class.isAssignableFrom(getModelType()) || Modifier.isStatic(m.getModifiers())) && m.getName().equals(methodName)) {
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
        return getColumnFields(objectType, false);
    }

    public static List<FieldInterfaced> getColumnFields(Class objectType, boolean forGrid) {
        return getColumnFields(objectType, forGrid, null, null, null);
    }

    public static List<FieldInterfaced> getColumnFields(Class objectType, boolean forGrid, String fieldsFilter, List<String> columNames, Map<String, FieldInterfaced> fieldsByColumnName) {

        List<FieldInterfaced> explicitColumns = null;

            if (Strings.isNullOrEmpty(fieldsFilter)) {

                explicitColumns = ReflectionHelper.getAllFields(objectType).stream().filter(
                        f -> f.isAnnotationPresent(ListColumn.class)
                ).peek(f -> {
                    if (columNames != null && fieldsByColumnName != null) {
                        String n = f.getName();
                        columNames.add(n);
                        fieldsByColumnName.put(n, f);
                    }
                }).filter(f -> f != null).collect(Collectors.toList());

            } else {

                List<String> fns = Lists.newArrayList(fieldsFilter.split(","));
                fns = fns.stream().map(n -> {
                    n = n.trim();
                    n = n.replaceAll("\\(.*\\)", "");
                    if (n.contains(" ")) n = n.substring(0, n.indexOf(" "));
                    n = n.replaceAll(" ", "");
                    return n;
                }).collect(Collectors.toList());

                explicitColumns = fns.stream().map(n -> {
                    FieldInterfaced f = ReflectionHelper.getFieldByName(objectType, n);
                    if (columNames != null && fieldsByColumnName != null) {
                        columNames.add(n);
                        fieldsByColumnName.put(n, f);
                    }
                    return f;
                }).filter(f -> f != null).collect(Collectors.toList());

            }

        if (explicitColumns.size() > 0) {
                return explicitColumns;
            } else {

            List<FieldInterfaced> cols = ReflectionHelper.getAllFields(objectType).stream().filter(
                    (f) -> !"_proxied".equalsIgnoreCase(f.getName()) && !"_possibleValues".equalsIgnoreCase(f.getName()) && !"_binder".equalsIgnoreCase(f.getName()) && !"_field".equalsIgnoreCase(f.getName())
                            && !Modifier.isTransient(f.getModifiers())
                            && !f.isAnnotationPresent(Transient.class)
                            && !f.isAnnotationPresent(NotInList.class)
                            && !f.isAnnotationPresent(Version.class)
                            && !f.isAnnotationPresent(Ignored.class)
                            && !f.isAnnotationPresent(Password.class)
                            //&& !Modifier.isTransient(f.getModifiers())
                            && (!Collection.class.isAssignableFrom(f.getType()) || (forGrid && f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline()))
                            && !Map.class.isAssignableFrom(f.getType())
                            && !f.isAnnotationPresent(GeneratedValue.class)
                            && (ReflectionHelper.isBasico(f.getType()) || BigDecimal.class.equals(f.getType()) || f.getType().isEnum() || f.getType().isAnnotationPresent(Entity.class) || java.sql.Date.class.equals(f.getType())
                            || FareValue.class.equals(f.getType())
                            || f.isAnnotationPresent(WeekDays.class)
                            || (forGrid && f.isAnnotationPresent(UseCheckboxes.class) && f.getAnnotation(UseCheckboxes.class).editableInline())
                    )
            ).filter(f -> f != null).collect(Collectors.toList());

            if (columNames != null && fieldsByColumnName != null) cols.forEach(f -> {
                columNames.add(f.getName());
                fieldsByColumnName.put(f.getName(), f);
            });

            return cols;
        }

    }

    public abstract Class getColumnType();

    public List<FieldInterfaced> getFilterFields() {
        return getFilterFields(getFiltersType());
    }

    public List<FieldInterfaced> getFilterFields(Class filtersType) {
        List<FieldInterfaced> explicitFilters = ReflectionHelper.getAllFields(filtersType).stream().filter(
                (f) -> !f.isAnnotationPresent(Password.class) && !f.isAnnotationPresent(Version.class) && !f.isAnnotationPresent(Ignored.class) && f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)
        ).collect(Collectors.toList());
        if (explicitFilters.size() > 0) {
            return explicitFilters;
        } else {
            return ReflectionHelper.getAllFields(filtersType).stream().filter(
                    (f) ->  !f.isAnnotationPresent(Password.class) && !f.isAnnotationPresent(Version.class) && !f.isAnnotationPresent(Ignored.class) && !f.isAnnotationPresent(Output.class) &&  !IResource.class.equals(f.getType()) && (String.class.equals(f.getType()) || LocalDate.class.equals(f.getType()) || LocalDateTime.class.equals(f.getType()) || LocalTime.class.equals(f.getType()) || Date.class.equals(f.getType()) || boolean.class.equals(f.getType()) || Boolean.class.equals(f.getType()) || f.getType().isEnum() || f.isAnnotationPresent(ManyToOne.class) || f.getType().isAnnotationPresent(Entity.class))
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
    public void addViewActionsMenuItems(CssLayout bar) {

        if (isAddEnabled()) {

            Button i;
            bar.addComponent(i = new Button("New", VaadinIcons.PLUS));
            i.addStyleName(ValoTheme.BUTTON_QUIET);
            i.addClickListener(e -> {
                try {
                    MDDUI.get().getNavegador().go("new");
                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            });
            i.setClickShortcut(ShortcutAction.KeyCode.N, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
        }

        if (isDeleteEnabled()) {
            Button i;
            bar.addComponent(i = new Button("Delete", VaadinIcons.MINUS));
            i.addStyleName(ValoTheme.BUTTON_QUIET);
            i.addClickListener(e -> {
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
            });
            i.setClickShortcut(ShortcutAction.KeyCode.DELETE, ShortcutAction.ModifierKey.CTRL);

        }

        super.addViewActionsMenuItems(bar);
    }

    protected void delete(Set selection) {

    }

    public Object toId(Object row) {
        if (row != null && row.getClass().isAnnotationPresent(NativeJPQLResult.class)) return row;
        else return ReflectionHelper.getId(row);
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

    public int getFrozenColumnCount() {
        return 0;
    }

    public void searched() {
        MDDUI.get().getNavegador().goTo(getUrl());
    }

    public String getUrl() {
        String u = MDDUI.get().getNavegador().getStack().getState(getView());
        if (u.contains("/")) {
            String s = u.substring(u.lastIndexOf("/"));
            if (s.contains("&")) u = u.substring(0, u.length() - (s.length() - s.indexOf("&") - 1));
        }
        u += getModelForSearchFiltersSerialized();
        return u;
    }

    private String getModelForSearchFiltersSerialized() {
        Base64.Encoder b64 = Base64.getEncoder();
        String s = "";
        try {
            Object m = getModelForSearchFilters();

            for (FieldInterfaced f : ReflectionHelper.getAllFields(m.getClass())) {
                Object v = ReflectionHelper.getValue(f, m);
                if (v != null) {
                    if (v.getClass().isAnnotationPresent(Entity.class)) {
                        v = ReflectionHelper.getValue(ReflectionHelper.getIdField(v.getClass()), v);
                    } else if (v.getClass().isEnum()) {
                        v = ((Enum)v).name();
                    }
                    s += "&";
                    s += "" + f.getName() + "_" + b64.encodeToString(("" + v).getBytes("utf-8"));
                }
            }

        } catch (Exception e) {
            MDD.alert(e);
        }
        return s;
    }
}
