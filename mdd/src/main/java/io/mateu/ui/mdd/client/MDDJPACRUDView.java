package io.mateu.ui.mdd.client;

import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.io.BaseEncoding;
import io.mateu.ui.core.client.app.AbstractAction;
import io.mateu.ui.core.client.app.AbstractApplication;
import io.mateu.ui.core.client.app.Callback;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.components.*;
import io.mateu.ui.core.client.components.fields.*;
import io.mateu.ui.core.client.components.fields.CalendarField;
import io.mateu.ui.core.client.components.fields.grids.columns.*;
import io.mateu.ui.core.client.views.*;
import io.mateu.ui.core.shared.*;
import io.mateu.ui.mdd.server.WizardPageVO;
import io.mateu.ui.mdd.server.interfaces.ListView;
import io.mateu.ui.mdd.server.interfaces.View;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;
import io.mateu.ui.mdd.shared.ERPService;
import io.mateu.ui.mdd.shared.MDDLink;
import io.mateu.ui.mdd.shared.MetaData;
import org.apache.batik.util.RunnableQueue;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Created by miguel on 12/1/17.
 */
public class MDDJPACRUDView extends BaseJPACRUDView {

    private Data metadata;
    private String idFieldName;
    private String entityClassName;
    private String viewClassName;
    private String rpcViewClassName;
    private String compositeClassName;
    private String queryFilters;

    public MDDJPACRUDView(Data metadata) {
        init(metadata);
    }

    public MDDJPACRUDView() {

    }

    public void init(Data metadata) {
        this.metadata = metadata;
        this.entityClassName = metadata.getString("_entityClassName");
        this.idFieldName = metadata.getString("_idFieldName");
        this.viewClassName = metadata.getString("_viewClassName");
        this.rpcViewClassName = metadata.getString("_rpcViewClassName");
        this.compositeClassName = metadata.getString("_compositeClassName");
        this.queryFilters = metadata.getString("_queryFilters");
        setSums(metadata.getList("_sums"));
    }


    @Override
    public String getViewIdBase() {
        Data datosIniciales = initializeData();

        return "mdd/" + entityClassName + ".." + ((!Strings.isNullOrEmpty(rpcViewClassName))?rpcViewClassName:viewClassName) + ".." + BaseEncoding.base64().encode(((queryFilters != null)?queryFilters:"").getBytes()) + ".." + BaseEncoding.base64().encode(((datosIniciales != null)?datosIniciales.toJson():"").getBytes());
    }

    @Override
    public boolean useAutoColumnIds() {
        return Strings.isNullOrEmpty(rpcViewClassName);
    }

    @Override
    public boolean isExcelEnabled() {
        return Strings.isNullOrEmpty(rpcViewClassName);
    }

    @Override
    public boolean isPdfEnabled() {
        return Strings.isNullOrEmpty(rpcViewClassName);
    }

    @Override
    public boolean isIdColumnNeeded() {
        return Strings.isNullOrEmpty(rpcViewClassName) && Strings.isNullOrEmpty(compositeClassName);
    }

    @Override
    public AbstractForm createForm() {
        return new ViewForm(this);
    }


    @Override
    public boolean canDelete() {
        return getMetadata().isEmpty("_indelible");
    }

    @Override
    public boolean canCreate() {
        return getMetadata().isEmpty("_newnotallowed");
    }

    @Override
    public AbstractEditorView getNewEditorView() {
        return getNewEditorView(null);
    }

    public AbstractEditorView getNewEditorView(Data datosIniciales) {
           return getNewEditorViewForSubclass(getEntityClassName(), getViewClassName(), getMetadata().getData("_editorform"), datosIniciales);
    }

    public AbstractEditorView getNewEditorViewForSubclass(String entityClassName, String viewClass, Data formMetaData, Data datosIniciales) {

        return new JPAEditorView(this) {

            @Override
            public Data initializeData() {
                return datosIniciales;
            }

            @Override
                public List<AbstractAction> createActions() {
                    List<AbstractAction> as = super.createActions();
                    for (Data da : formMetaData.getList("_actions")) if (da.isEmpty("_addasbutton")) {
                        as.add(createAction(this, da));
                    }
                    return as;
                }

            @Override
            public String getEntityClassName() {
                return entityClassName;
            }

            @Override
            public String getViewClassName() {
                return viewClass;
            }

            @Override
                public String getViewId() {
                    String id = null;
                    if (getInitialId() != null) {
                        Object iid = getInitialId();
                        String s = "" + iid;
                        if (iid instanceof String) s = "s" + s;
                        else if (iid instanceof Long) s = "l" + s;
                        else if (iid instanceof Integer) s = "i" + s;
                        //id += "/" + s;
                        id = s;
                    }

                    Data datosIniciales = initializeData();

                if (!Strings.isNullOrEmpty(getListQl())) {

                    id += "?";

                    id += "q=" + BaseEncoding.base64().encode(getListQl().getBytes());
                    id += "&pos=" + getListPos();
                    id += "&count=" + getListCount();
                    id += "&rpp=" + getListRowsPerPage();
                    id += "&page=" + getListPage();
                    if (!Strings.isNullOrEmpty(getListFragment())) id += "&listfragment=" + BaseEncoding.base64().encode(getListFragment().getBytes());

                }


                    return "mdd/" + getEntityClassName() + ".." + getViewClassName() + ".." + BaseEncoding.base64().encode(((queryFilters != null)?queryFilters:"").getBytes(Charsets.UTF_8)) + ".." + BaseEncoding.base64().encode(((datosIniciales != null)?datosIniciales.toJson():"").getBytes(Charsets.UTF_8)) + ".." + "edit" + ((id != null)?"/" + id:"");
                }

                @Override
                public String getTitle() {
                    return formMetaData.getString("_rawtitle");
                }

            @Override
            public void build() {
                buildFromMetadata(this, formMetaData, false);
            }

            @Override
                public AbstractForm createForm() {
                    ViewForm f = new ViewForm(this) {
                        @Override
                        public void setData(Data data, boolean only_) {
                            if (data != null && data.containsKey("_links")) {
                                for (Data x : data.getList("_links")) if (x != null) {
                                    MDDLink l = (MDDLink) x;
                                    x.set("_action", createAction(l));
                                }
                            }
                            super.setData(data, only_);
                        }
                    };

                    return f;
                }
            };

    }

    @Override
    public void openNew(boolean inNewTab) {
        if (getMetadata().isEmpty("_subclasses")) {

            ((ERPServiceAsync) MateuUI.create(ERPService.class)).getInitialData(MateuUI.getApp().getUserData(), getEntityClassName(), getViewClassName(), getData(), new Callback<Data>() {
                @Override
                public void onSuccess(Data result) {
                    MateuUI.runInUIThread(new Runnable() {
                        @Override
                        public void run() {
                            AbstractEditorView ed = getNewEditorView(result);
                            openEditor(ed, inNewTab);
                        }
                    });
                }
            } );


        } else {
            List<Pair> options = new ArrayList<>();
            for (Data d : getMetadata().getList("_subclasses")) {
                options.add(new Pair(d.get("_type"), d.get("_name")));
            }

            MateuUI.openView(new AbstractDialog() {

                @Override
                public Data initializeData() {
                    Data d = super.initializeData();
                    if (options.size() > 0) d.set("type", options.get(0));
                    return d;
                }

                @Override
                public void onOk(Data data) {
                    if (!getForm().getData().isEmpty("type")) {
                        String type = (String) ((Pair)getForm().getData().get("type")).getValue();
                        for (Data d : getMetadata().getList("_subclasses")) {
                            if (type.equals(d.get("_type"))) {
                                ((ERPServiceAsync) MateuUI.create(ERPService.class)).getInitialData(MateuUI.getApp().getUserData(), type, type, getData(), new Callback<Data>() {
                                    @Override
                                    public void onSuccess(Data result) {

                                        MateuUI.runInUIThread(new Runnable() {
                                            @Override
                                            public void run() {

                                                AbstractEditorView ed = getNewEditorViewForSubclass(d.get("_type"), d.get("_type"), d.get("_editorform"), result);
                                                openEditor(ed, inNewTab);
                                            }
                                        });
                                    }
                                } );
                                break;
                            }
                        }
                    }
                }

                @Override
                public String getTitle() {
                    return "Choose object type to create";
                }

                @Override
                public void build() {
                    add(new RadioButtonField("type", "Type", options).setRequired(true));
                }
            });

        }
    }

    @Override
    public void open(String propertyId, Data data, boolean inNewTab) {
        if (getMetadata().containsKey("_compositeClassName")) {

            try {
                Data d = new Data();
                if (getMetadata().containsKey("_compositeFieldName")) {
                    d.set(getMetadata().get("_compositeFieldName"), new Pair(data.get("_id"), data.get("col1")));
                }
                MDD.openView(Class.forName(getMetadata().get("_compositeClassName")), d, queryFilters, inNewTab);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }

        } else {

            if (getMetadata().isEmpty("_subclasses")) {
                super.open(propertyId, data, inNewTab);
            } else {
                String className = null;
                int maxCol = -1;
                for (String n : data.getPropertyNames()) {
                    if (n.startsWith("col")) {
                        int numCol = Integer.parseInt(n.substring("col".length()));
                        if (maxCol < numCol) {
                            className = "" + data.get(n);
                            maxCol = numCol;
                        }
                    }
                }
                if (className != null) className = className.replaceAll("class ", "");
                for (Data d : getMetadata().getList("_subclasses")) {
                    if (d.get("_type").equals(className)) {
                        openEditor(getNewEditorViewForSubclass(d.get("_type"), d.get("_type"), d.get("_editorform"), null).setInitialId(data.get(propertyId)), inNewTab);
                        break;
                    }
                }
            }

        }

    }

    private void buildFromMetadata(AbstractView view, Data metadata, boolean buildingSearchForm) {
        buildFromMetadata(view.getForm(), metadata.getList("_fields"), buildingSearchForm);
        for (Data da : metadata.getList("_actions")) {
            if (da.getBoolean("_addasbutton")) {
                AbstractAction a = createAction(view, da);
                view.getForm().add(new Button(da.getString("_name")) {

                    @Override
                    public void run() {
                        a.run();
                    }
                });
            }
        }
    }

    private void buildFromMetadata(FieldContainer form, Data metadata, boolean buildingSearchForm) {
        buildFromMetadata(form, "", metadata.getList("_fields"), buildingSearchForm);
    }

    private void buildFromMetadata(FieldContainer form, String prefix, Data metadata, boolean buildingSearchForm) {
        buildFromMetadata(form, prefix, metadata.getList("_fields"), buildingSearchForm);
    }

    private void buildFromMetadata(AbstractView view, List<Data> fieldsMetadata, boolean buildingSearchForm) {
        buildFromMetadata(view.getForm(), fieldsMetadata, buildingSearchForm);
    }

    private void buildFromMetadata(FieldContainer form, List<Data> fieldsMetadata, boolean buildingSearchForm) {
        buildFromMetadata(form, "", fieldsMetadata, buildingSearchForm);
    }

    private void buildFromMetadata(FieldContainer originalContainer, String prefix, List<Data> fieldsMetadata, boolean buildingSearchForm) {

        if (!"".equals(prefix)) prefix += "_";

        FieldContainer container = originalContainer;

        List<Component> stack = new ArrayList<>();

        for (Data d : fieldsMetadata) {

            if (!buildingSearchForm) {

                if (d.containsKey("_starttabs")) {
                    Tabs tabs;
                    container.add(tabs = new Tabs(d.getString("_id")));
                    tabs.setFullWidth(d.containsKey("_fullwidth"));
                    stack.add(tabs);
                }
                

                if (d.containsKey("_starttab")) {

                    Tabs tabs = null;
                    if (stack.size() > 0 && (stack.get(stack.size() - 1) instanceof Tab)) {
                        stack.remove(stack.size() - 1);
                    }
                    if (stack.size() == 0 || !(stack.get(stack.size() - 1) instanceof Tabs)) {
                        container.add(tabs = new Tabs(d.getString("_id")));
                        tabs.setFullWidth(d.containsKey("_fullwidth"));
                        stack.add(tabs);
                    } else {
                        tabs = (Tabs) stack.get(stack.size() - 1);
                    }
                    Tab tab;
                    tabs.add(tab = new Tab(originalContainer.getForm(), d.getString("_starttab")));
                    container = tab;
                    stack.add(tab);
                }

                if (d.containsKey("_endtabs")) {
                    while (stack.size() > 0 && (stack.get(stack.size() - 1) instanceof Tabs)) {
                        stack.remove(stack.size() - 1);
                        container = (stack.size() == 0)?originalContainer: (FieldContainer) stack.get(stack.size() - 1);
                    }

                }

            }

            {

                List<AbstractField> fields = new ArrayList<>();

                if (d.containsKey("_separator")) {
                    fields.add(new Separator(d.getString("_separator")));
                }


                if (MetaData.FIELDTYPE_HTML.equals(d.getString("_type"))) {
                    fields.add(new HtmlField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_DATE.equals(d.getString("_type"))) {
                    if (buildingSearchForm) {
                        fields.add(new DateField(prefix + d.getString("_id") + "_from", d.getString("_label") + " from"));
                        fields.add(new DateField(prefix + d.getString("_id") + "_to", d.getString("_label") + " to"));
                    } else {
                        fields.add(new DateField(prefix + d.getString("_id"), d.getString("_label")));
                    }
                } else if (MetaData.FIELDTYPE_DATETIME.equals(d.getString("_type"))) {
                    if (buildingSearchForm) {
                        fields.add(new DateTimeField(prefix + d.getString("_id") + "_from", d.getString("_label") + " from"));
                        fields.add(new DateTimeField(prefix + d.getString("_id") + "_to", d.getString("_label") + " to"));
                    } else {
                        fields.add(new DateTimeField(prefix + d.getString("_id"), d.getString("_label")));
                    }
                } else if (MetaData.FIELDTYPE_CALENDAR.equals(d.getString("_type"))) {
                    fields.add(new CalendarField(prefix + d.getString("_id"), d.getString("_label"), d.getString("_nameproperty")) {
                        @Override
                        public AbstractForm getDataForm() {
                            AbstractForm f = new AbstractForm() {
                            };
                            buildFromMetadata(f, d.getData("_editorform"), false);
                            return f;
                        }
                    });
                } else if (MetaData.FIELDTYPE_MULTILANGUAGETEXT.equals(d.getString("_type"))) {
                    fields.add(new MultilanguageTextField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_MULTILANGUAGETEXTAREA.equals(d.getString("_type"))) {
                    fields.add(new MultilanguageTextAreaField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_SUPPLEMENTORPOSITIVE.equals(d.getString("_type"))) {
                    fields.add(new SupplementOrPositiveField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_OUTPUT.equals(d.getString("_type"))) {
                    fields.add(new ShowTextField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_OUTPUTENTITY.equals(d.getString("_type"))) {
                    fields.add(new ShowEntityField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_WEEKDAYS.equals(d.getString("_type"))) {
                    fields.add(new WeekDaysField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_TEXTAREA.equals(d.getString("_type"))) {
                    fields.add(new TextAreaField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_STRING.equals(d.getString("_type"))) {
                    fields.add(new TextField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_INTEGER.equals(d.getString("_type"))) {
                    fields.add(new IntegerField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_LONG.equals(d.getString("_type"))) {
                    fields.add(new LongField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_DOUBLE.equals(d.getString("_type"))) {
                    fields.add(new DoubleField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_BOOLEAN.equals(d.getString("_type"))) {
                    fields.add(new CheckBoxField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_ENUM.equals(d.getString("_type"))) {
                    fields.add(new ComboBoxField(prefix + d.getString("_id"), d.getString("_label"), d.getPairList("_values")));
                } else if (MetaData.FIELDTYPE_COMBO.equals(d.getString("_type"))) {
                    fields.add(new JPAAutocompleteField(prefix + d.getString("_id"), d.getString("_label"), d.getString("_ql")));
                } else if (MetaData.FIELDTYPE_FILE.equals(d.getString("_type"))) {
                    fields.add(new FileField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_OBJECT.equals(d.getString("_type"))) {
                    buildFromMetadata(container, prefix + d.getString("_id"), d.getData("_metadata"), buildingSearchForm);
                } else if (MetaData.FIELDTYPE_ENTITY.equals(d.getString("_type"))) {
                    if (d.getBoolean("_owned")) {
                        buildFromMetadata(container, prefix + d.getString("_id"), d.getData("_metadata"), buildingSearchForm);
                    } else if (d.getBoolean("_useidtoselect")) {
                        fields.add(new JPASelectByIdField(prefix + d.getString("_id"), d.getString("_label"), d.getString("_ql")) {

                            Data metadata = null;

                            @Override
                            public AbstractEditorView getEditor() {
                                JPAEditorView editor = new JPAEditorView(null) {

                                    public JPAEditorView get() {
                                        return this;
                                    }

                                    @Override
                                    public String getEntityClassName() {
                                        return d.getString("_entityClassName");
                                    }

                                    @Override
                                    public List<AbstractAction> createActions() {
                                        List<AbstractAction> as = super.createActions();
                                        for (Data da : metadata.getData("_editorform").getList("_actions")) {
                                            as.add(createAction(this, da));
                                        }
                                        return as;
                                    }

                                    @Override
                                    public String getViewId() {
                                        return d.getString("_entityClassName") + "-" + getInitialId();
                                    }

                                    @Override
                                    public String getTitle() {
                                        return d.getString("_entityClassName").substring(getEntityClassName().lastIndexOf(".") + 1);
                                    }

                                    @Override
                                    public void build() {
                                        buildFromMetadata(this, metadata.getData("_editorform").getList("_fields"), false);
                                    }
                                };
                                return editor;
                            }

                            @Override
                            public Pair getPair(Data editorData) {
                                return new Pair(editorData.get("_id"), editorData.get("_tostring"));
                            }

                            @Override
                            public void createNew() {
                                if (metadata == null)
                                    ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), d.getString("_entityClassName"), d.getString("_viewClassName"), null, new Callback<Data>() {
                                        @Override
                                        public void onSuccess(Data result) {
                                            metadata = result;
                                            _createNew();
                                        }
                                    });
                                else _createNew();
                            }

                            public void _createNew() {
                                super.createNew();
                            }

                            @Override
                            public void edit(Object id) {
                                if (metadata == null)
                                    ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), d.getString("_entityClassName"), d.getString("_viewClassName"), null, new Callback<Data>() {
                                        @Override
                                        public void onSuccess(Data result) {
                                            metadata = result;
                                            _edit(id);
                                        }
                                    });
                                else _edit(id);
                            }

                            public void _edit(Object id) {
                                super.edit(id);
                            }
                        });
                    } else if (d.getBoolean("_useautocompletetoselect")) {
                        fields.add(new JPAAutocompleteField(prefix + d.getString("_id"), d.getString("_label"), d.getString("_ql")));
                    } else {
                        fields.add(new JPAComboBoxField(prefix + d.getString("_id"), d.getString("_label"), d.getString("_ql")));
                    }
                } else if (MetaData.FIELDTYPE_PK.equals(d.getString("_type"))) {
                    fields.add(new PKField(prefix + d.getString("_id"), d.getString("_label")));
                } else if (MetaData.FIELDTYPE_LIST.equals(d.getString("_type"))) {
                    String ql = d.getString("_ql");
                    if (ql == null) ql = "select x.id, x.name from " + d.getString("_entityClassName") + " x order by x.name";
                    fields.add(new JPAListSelectionField(prefix + d.getString("_id"), d.getString("_label"), ql));
                } else if (MetaData.FIELDTYPE_GRID.equals(d.getString("_type")) || MetaData.FIELDTYPE_GRID_TABLE.equals(d.getString("_type")) || MetaData.FIELDTYPE_SELECTFROMGRID.equals(d.getString("_type"))) {
                    List<AbstractColumn> cols = new ArrayList<>();
                    for (Data dc : d.getList("_cols")) if (!dc.containsKey("_notinlist")) {
                        OutputColumn c;
                        cols.add(c = new OutputColumn(dc.getString("_id"), dc.getString("_label"), 100));
                        if (!dc.isEmpty("_cellstylegenerator")) {
                            try {
                                c.setStyleGenerator((CellStyleGenerator)Class.forName(dc.getString("_cellstylegenerator")).newInstance());
                            } catch (InstantiationException e) {
                                e.printStackTrace();
                            } catch (IllegalAccessException e) {
                                e.printStackTrace();
                            } catch (ClassNotFoundException e) {
                                e.printStackTrace();
                            }
                        }
                    }

                    fields.add(new GridField(prefix + d.getString("_id"), d.getString("_label"), cols) {
                        @Override
                        public AbstractForm getDataForm(Data initialData) {
                            AbstractForm f = new AbstractForm() {
                                @Override
                                public Data initializeData() {
                                    return (initialData != null)?initialData:super.initializeData();
                                }
                            };
                            buildFromMetadata(f, d.getList("_cols"), false);
                            return f;
                        }
                    }.setFullWidth(d.containsKey("_fullwidth"))
                            .setExpandable(!MetaData.FIELDTYPE_SELECTFROMGRID.equals(d.getString("_type")) && !MetaData.FIELDTYPE_GRID_TABLE.equals(d.getString("_type")))
                    .setUsedToSelect(MetaData.FIELDTYPE_SELECTFROMGRID.equals(d.getString("_type")))
                            .setShowAsTable(MetaData.FIELDTYPE_GRID_TABLE.equals(d.getString("_type")))
                            .setEditInline(MetaData.FIELDTYPE_GRID_INLINE.equals(d.getString("_gridtype")))
                            .setEditAside(MetaData.FIELDTYPE_GRID_ASIDE.equals(d.getString("_gridtype")))
                            .setEditPopup(MetaData.FIELDTYPE_GRID_POPUP.equals(d.getString("_gridtype")))
                    .setUsedToSelectMultipleValues(d.containsKey("_multipleselection")));
                }
                if (d.containsKey("_required")) {
                    for (AbstractField field : fields) field.setRequired(true);
                }
                if (d.containsKey("_startsline")) {
                    for (AbstractField field : fields) field.setBeginingOfLine(true);
                }
                if (d.containsKey("_unmodifiable")) {
                    for (AbstractField field : fields) field.setUnmodifiable(true);
                }
                if (d.containsKey("_help")) {
                    for (AbstractField field : fields) field.setHelp(d.get("_help"));
                }
                for (AbstractField field : fields) container.add(field);

            }

        }
    }

    @Override
    public List<AbstractColumn> createExtraColumns() {
        List<AbstractColumn> cols = new ArrayList<>();
        int poscol = 0;
        for (Data d : getMetadata().getData("_searchform").getList("_columns")) {
            if (poscol > 0 || (!MetaData.FIELDTYPE_ID.equals(d.getString("_type")) && !MetaData.FIELDTYPE_PK.equals(d.getString("_type")))) {
                AbstractColumn col;
                if (MetaData.FIELDTYPE_DATA.equalsIgnoreCase(d.get("_type"))) {
                    col = new DataColumn((useAutoColumnIds()) ? "col" + poscol : d.getString("_id"), d.getString("_label"), d.getInt("_width")) {
                        @Override
                        public void run(Data data) {
                            if (data != null && data.get("_id") != null) open("_id", data, false);
                            else MateuUI.alert("Empty record. Nothing to see.");
                        }
                    };
                } else {
                    col = new OutputColumn((useAutoColumnIds())?"col" + poscol:d.getString("_id"), d.getString("_label"), d.getInt("_width"));
                }
                cols.add(col);
                if ("center".equals(d.getString("_align"))) col.setAlignment(ColumnAlignment.CENTER);
                if ("right".equals(d.getString("_align"))) col.setAlignment(ColumnAlignment.RIGHT);
                if (!d.isEmpty("_colwidth")) col.setWidth(d.get("_colwidth"));
                if (!d.isEmpty("_cellstylegenerator")) try {
                    col.setStyleGenerator((CellStyleGenerator) Class.forName(d.getString("_cellstylegenerator")).newInstance());
                } catch (InstantiationException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (ClassNotFoundException e) {
                    e.printStackTrace();
                } else if (col instanceof DataColumn) {
                    col.setStyleGenerator(new CellStyleGenerator() {
                        @Override
                        public String getStyle(Object o) {
                            return (o == null)?null:((Data)o).get("_css");
                        }

                        @Override
                        public boolean isContentShown() {
                            return true;
                        }
                    });
                }
            }
            poscol++;
        }
        if (!Strings.isNullOrEmpty(compositeClassName)) {
            LinkColumn col;
            cols.add(col = new LinkColumn("_open", "Action", 200) {
                @Override
                public void run(Data data) {
                    open("xxx", data, false);
                }

                @Override
                public String getText() {
                    return metadata.get("_compositeActionName");
                }
            });
            col.setAlignment(ColumnAlignment.CENTER);
        }
        return cols;
    }

    @Override
    public String getSql() {

        Data sfd = getForm().getData();

        if (!Strings.isNullOrEmpty(viewClassName) && !viewClassName.equals(entityClassName)) {
            try {
                io.mateu.ui.mdd.server.interfaces.ListView v = (io.mateu.ui.mdd.server.interfaces.ListView) Class.forName(viewClassName).newInstance();

                String[] jpql = new String[1];

                Helper.transact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {

                        jpql[0] = v.buildQuery(em, MateuUI.getApp().getUserData(), sfd);

                    }
                });

                if (!Strings.isNullOrEmpty(jpql[0])) return jpql[0];

            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }


        // seleccionamos todos los campos y acumulamos los left joins los filtros y los ordenes
        List<Data> selects = new ArrayList<>();
        List<Data> wheres = new ArrayList<>();
        List<Data> orders = new ArrayList<>();

        // construimos la clausula select
        String jpql = "select ";
        int poscol = 0;
        List<Data> orderFields = new ArrayList<>();

        List<String> leftJoins = new ArrayList<>();
        List<String> innerJoins = new ArrayList<>();

        // primero buscamos el id o pk
        for (Data d : getMetadata().getData("_searchform").getList("_columns")){
            if (!d.isEmpty("_leftjoin") && !leftJoins.contains(d.getString("_leftjoin"))) leftJoins.add(d.getString("_leftjoin"));
            if (!d.isEmpty("_innerjoin") && !innerJoins.contains(d.getString("_innerjoin"))) innerJoins.add(d.getString("_innerjoin"));
            if (!d.isEmpty("_order")) orderFields.add(d);
        }
        for (Data d : getMetadata().getData("_searchform").getList("_fields")){
            if (!d.isEmpty("_leftjoin") && !leftJoins.contains(d.getString("_leftjoin"))) leftJoins.add(d.getString("_leftjoin"));
            if (!d.isEmpty("_innerjoin") && !innerJoins.contains(d.getString("_innerjoin"))) innerJoins.add(d.getString("_innerjoin"));
        }

        int i = 1;
        Map<String, Integer> ljs = new HashMap<>();
        for (String lj : leftJoins) {
            ljs.put(lj, i++);
        }

        Map<String, Integer> ijs = new HashMap<>();
        for (String ij : innerJoins) {
            ijs.put(ij, i++);
        }



        for (Data d : getMetadata().getData("_searchform").getList("_columns")){
            String x = "x";
            if (!d.isEmpty("_leftjoin")) x += ljs.get(d.getString("_leftjoin"));
            if (!d.isEmpty("_innerjoin")) x += ijs.get(d.getString("_innerjoin"));

            if (poscol++ > 0) jpql += ",";
            if (!d.isEmpty("_leftjoinql")) {
                if (!d.isEmpty("_leftjoin")) jpql += x + "." + d.getString("_qlname").substring(d.getString("_leftjoin").length() + 1);
                else jpql += x + "." + d.getString("_qlname");
            }
            else if (!d.isEmpty("_colql")) jpql += d.getString("_colql");
            else if (d.isEmpty("_qlname")) jpql += x + "." + d.getString("_id");
            else jpql += x + "." + d.getString("_qlname");
        }

        if (!getMetadata().isEmpty("_subclasses")) jpql += ", type(x) ";

        jpql += " from " + getEntityClassName() + " x";

        for (String lj : leftJoins) {
            jpql += " left outer join x." + lj + " x" + ljs.get(lj) + " ";
        }



        for (String ij : innerJoins) {

            // buscamos entre los filtros si tenemos que utilizar el inner join
            boolean used = false;

            for (Data d : getMetadata().getData("_searchform").getList("_fields")) {
                if (!d.isEmpty("_innerjoin")) if (ij.equals(d.getString("_innerjoin"))) {
                    used = (sfd.get(d.getString("_id"))) != null;

                }
            }

            if (used) jpql += " inner join x." + ij + " x" + ijs.get(ij) + " ";
        }


        int posfilter = 0;
        String filters = "";

        if (!Strings.isNullOrEmpty(viewClassName) && !viewClassName.equals(entityClassName)) {
            try {
                ListView v = (ListView) Class.forName(viewClassName).newInstance();

                String[] f = new String[1];

                Helper.transact(new JPATransaction() {
                    @Override
                    public void run(EntityManager em) throws Throwable {

                        f[0] = v.getAdditionalFilters(em, MateuUI.getApp().getUserData(), sfd);

                    }
                });

                if (!Strings.isNullOrEmpty(f[0])) filters = f[0];

            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }

        if (filters == null) filters = "";

        if (getMetadata().containsKey("_additionalcriteria")) {
            filters += getMetadata().get("_additionalcriteria");
            posfilter += filters.split(" ").length;
        }

        for (Data d : getMetadata().getData("_searchform").getList("_fields")) {

            String x = "x";
            if (!d.isEmpty("_leftjoin")) x += ljs.get(d.getString("_leftjoin"));
            if (!d.isEmpty("_innerjoin")) x += ijs.get(d.getString("_innerjoin"));


            if (!d.isEmpty("_isnull")) {
                Boolean v = sfd.getBoolean(d.getString("_id"));
                if (v) {
                    if (posfilter++ == 0) filters += "";
                    else filters += " and ";
                    filters += " " + ((ljs.containsKey(d.getString("_qlname")))?x + ljs.get(d.getString("_qlname")):x + "." + d.getString("_qlname")) + " is null ";
                }
            } else if (MetaData.FIELDTYPE_DATE.equals(d.getString("_type"))) {
                String fx = "";
                LocalDate del = toLocalDate(sfd.get(d.getString("_id") + "_from"));
                LocalDate al = toLocalDate(sfd.get(d.getString("_id") + "_to"));
                DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                if (del != null) fx += x + "." + d.getString("_qlname") + " >= {d '" + del.format(f) + "'}";
                if (al != null) {
                    if (!"".equals(fx)) fx += " and ";
                    fx += x + "." + d.getString("_qlname") + " <= {d '" + al.format(f) + "'}";
                }
                if (!"".equals(fx)) {
                    if (posfilter++ == 0) filters += "";
                    else filters += " and ";

                    filters += " " + fx + " ";
                }
            } else if (MetaData.FIELDTYPE_DATETIME.equals(d.getString("_type"))) {
                String fx = "";
                LocalDate del = toLocalDate(sfd.get(d.getString("_id") + "_from"));
                LocalDate al = toLocalDate(sfd.get(d.getString("_id") + "_to"));
                DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                if (del != null) fx += x + "." + d.getString("_qlname") + " >= {d '" + del.format(f) + "'}";
                if (al != null) {
                    al = al.plusDays(1);
                    if (!"".equals(fx)) fx += " and ";
                    fx += x + "." + d.getString("_qlname") + " < {d '" + al.format(f) + "'}";
                }
                if (!"".equals(fx)) {
                    if (posfilter++ == 0) filters += "";
                    else filters += " and ";

                    filters += " " + fx + " ";
                }
            } else if (!sfd.isEmpty(d.getString("_id"))) {
                Object v = sfd.get(d.getString("_id"));
                if (d.getBoolean("_useidtoselect")) {
                    if (posfilter++ == 0) filters += "";
                    else filters += " and ";
                    filters += x + "." + d.getString("_id");
                    filters += ".id";
                    if ("string".equalsIgnoreCase(d.getString("_idtype"))) {
                        filters += " = '" + v + "' ";
                    } else {
                        filters += " = " + v + " ";
                    }
                } else {
                    if (v instanceof String) {
                        if (posfilter++ == 0) filters += "";
                        else filters += " and ";
                        if (d.getBoolean("_exactmatch")) filters += x + "." + d.getString("_qlname") + " = '" + ((String) v).toLowerCase().replaceAll("'", "''") + "'";
                        else {
                            filters += "lower(" + x + "." + d.getString("_qlname") + ")";
                            filters += " like '%" + ((String) v).toLowerCase().replaceAll("'", "''") + "%' ";
                        }
                    }
                    else {
                        if (v instanceof Pair) {
                            Object vv = ((Pair)v).getValue();
                            if (vv != null) {
                                if (posfilter++ == 0) filters += "";
                                else filters += " and ";
                                if (!d.isEmpty("_leftjoinql")) filters += x + "." + d.getString("_leftjoinql");
                                else filters += x + "." + d.getString("_qlname");
                                if ("enum".equals(d.getString("_type"))) {
                                    filters += " = " + d.getString("_enumtype") + "." + vv + " ";
                                } else {
                                    if (vv instanceof String) {
                                        filters += " = '" + vv + "' ";
                                    } else {
                                        filters += " = " + vv + " ";
                                    }
                                }
                            }
                        } else {
                            if (posfilter++ == 0) filters += "";
                            else filters += " and ";
                            filters += x + "." + d.getString("_qlname");
                            if (v instanceof String) {
                                filters += " = '" + v + "' ";
                            } else {
                                filters += " = " + v + " ";
                            }
                        }
                    }
                }
            }
        }
        if (!"".equals(filters)) jpql += " where " + filters;


        if (orderFields.size() > 0) {
            jpql += " order by ";
            Collections.sort(orderFields, (a, b) -> a.getInt("_order") - b.getInt("_order"));
            boolean primero = true;
            for (Data of : orderFields) {
                if (primero) primero = false;
                else jpql += " , ";

                String x = "x";
                if (!of.isEmpty("_leftjoin")) x += ljs.get(of.getString("_leftjoin"));
                if (!of.isEmpty("_innerjoin")) x += ijs.get(of.getString("_innerjoin"));


                if (!of.isEmpty("_leftjoinql")) {
                    if (!of.isEmpty("_leftjoin")) jpql += x + "." + of.getString("_qlname").substring(of.getString("_leftjoin").length() + 1);
                    else jpql += x + "." + of.getString("_qlname");
                }
                else if (!of.isEmpty("_colql")) jpql += of.getString("_colql");
                else if (of.isEmpty("_qlname")) jpql += x + "." + of.getString("_id");
                else jpql += x + "." + of.getString("_qlname");
                if (of.getBoolean("_orderdesc")) jpql += " desc ";
            }
        }

        System.out.println("jpql=" + jpql);

        return jpql;
    }

    private LocalDate toLocalDate(Object o) {
        LocalDate d = null;
        if (o != null) {
            if (o instanceof Date) {
                d = Instant.ofEpochMilli(((Date) o).getTime()).atZone(ZoneId.systemDefault()).toLocalDate();
            } else if (o instanceof LocalDate) {
                d = (LocalDate) o;
            }
        }
        return d;
    }

    @Override
    public String getTitle() {
        return getMetadata().getString("_rawtitle");
    }

    @Override
    public void build() {
        buildFromMetadata(this, getMetadata().getData("_searchform").getList("_fields"), true);
    }

    @Override
    public Data getMetadata() {
        return metadata;
    }

    @Override
    public List<AbstractAction> createActions() {
        List<AbstractAction> as = super.createActions();
        for (Data da : getMetadata().getList("_actions")) {
            as.add(createAction(this, da));
        }
        if (AbstractApplication.PORT_JAVAFX.equalsIgnoreCase(MateuUI.getApp().getPort())) as.add(new AbstractAction("Metadata") {
            @Override
            public void run() {

                System.out.println("metadata=" + getMetadata());

                MateuUI.openView(new AbstractDialog() {
                    @Override
                    public void onOk(Data data) {

                    }

                    @Override
                    public String getTitle() {
                        return "Metadata";
                    }

                    @Override
                    public void build() {
                        add(new DataViewerField("_metadata"));
                    }

                    @Override
                    public Data initializeData() {

                        return new Data("_metadata", new Data(getMetadata()));
                    }
                });
            }
        });
        return as;
    }

    private AbstractAction createAction(AbstractView v, Data da, MDDActionHelper h) {
        return new AbstractAction(da.getString("_name"), da.getBoolean("_callonenterkeypressed")) {
            @Override
            public void run() {

                Data parameters = new Data();

                h.complete(parameters);

                boolean needsParameters = false;

                boolean ok = true;

                Data wizard = null;
                String wizardParameterName = null;
                for (Data dp : da.getList("_parameters")) {
                    String n = dp.getString("_id");
                    if (MetaData.FIELDTYPE_LISTDATA.equals(dp.getString("_type"))) {
                        parameters.set(n, getSelection());
                    } else if (MetaData.FIELDTYPE_DATA.equals(dp.getString("_type"))) {
                        List<String> errors = v.getForm().validate();
                        if (errors.size() > 0) {
                            MateuUI.notifyErrors(errors);
                            ok = false;
                        } else {
                            parameters.set(n, v.getForm().getData());
                        }
                    } else if (MetaData.FIELDTYPE_USERDATA.equals(dp.getString("_type"))) {
                        parameters.set(n, MateuUI.getApp().getUserData());
                    } else if (MetaData.FIELDTYPE_WIZARD.equals(dp.getString("_type"))) {
                        wizard = dp;
                        wizardParameterName = n;
                        needsParameters = true;
                    } else needsParameters = true;
                }

                if (ok) {

                    if (needsParameters) {
                        if (wizard != null) {

                            WizardPageVO vo = wizard.get("_pagevo");

                            String finalWizardParameterName = wizardParameterName;

                            AbstractWizard[] w = new AbstractWizard[1];

                            Callback<Data> cb = new Callback<Data>() {
                                @Override
                                public void onSuccess(Data data) {
                                    parameters.set(finalWizardParameterName, data);
                                    ((ERPServiceAsync) MateuUI.create(ERPService.class)).runInServer(MateuUI.getApp().getUserData(), da.getString("_entityClassName"), da.getString("_methodname"), parameters, rpcViewClassName, (!Strings.isNullOrEmpty(rpcViewClassName))?MDDJPACRUDView.this.getForm().getData():null, new Callback<Object>() {
                                        @Override
                                        public void onSuccess(Object result) {
                                            h.onSuccess(result);
                                            if (!da.containsKey("_keeppened")) w[0].close();
                                        }

                                        @Override
                                        public void onFailure(Throwable caught) {
                                            super.onFailure(caught);
                                        }
                                    });
                                }
                            };

                            w[0] = crearWizard(da.getString("_name"), wizard.getData("_initialdata"), vo, cb);

                            MateuUI.open(w[0], false);

                        } else {

                            MateuUI.openView(new AbstractDialog() {

                                @Override
                                public Data initializeData() {
                                    return parameters;
                                }

                                @Override
                                public void onOk(Data data) {
                                    ((ERPServiceAsync) MateuUI.create(ERPService.class)).runInServer(MateuUI.getApp().getUserData(), da.getString("_entityClassName"), da.getString("_methodname"), getForm().getData(), rpcViewClassName, (!Strings.isNullOrEmpty(rpcViewClassName))?MDDJPACRUDView.this.getForm().getData():null, new Callback<Object>() {
                                        @Override
                                        public void onSuccess(Object result) {
                                            h.onSuccess(result);
                                        }
                                    });
                                }

                                @Override
                                public String getTitle() {
                                    return da.getString("_name");
                                }

                                @Override
                                public void build() {
                                    buildFromMetadata(this, da.getData("_form").getList("_fields"), false);
                                }

                                @Override
                                public boolean isCloseOnOk() {
                                    return !da.containsKey("_keepopened");
                                }
                            });

                        }
                    } else if (!Strings.isNullOrEmpty(da.getString("_confirmationmessage"))) {
                        MateuUI.confirm(da.getString("_confirmationmessage"), new RunnableQueue.IdleRunnable() {
                            @Override
                            public long getWaitTime() {
                                return 0;
                            }

                            @Override
                            public void run() {
                                ((ERPServiceAsync)MateuUI.create(ERPService.class)).runInServer(MateuUI.getApp().getUserData(), da.getString("_entityClassName"), da.getString("_methodname"), parameters, rpcViewClassName, (!Strings.isNullOrEmpty(rpcViewClassName))?MDDJPACRUDView.this.getForm().getData():null, new Callback<Object>() {
                                    @Override
                                    public void onSuccess(Object result) {
                                        h.onSuccess(result);
                                    }
                                });
                            }
                        });
                    } else ((ERPServiceAsync)MateuUI.create(ERPService.class)).runInServer(MateuUI.getApp().getUserData(), da.getString("_entityClassName"), da.getString("_methodname"), parameters, rpcViewClassName, (!Strings.isNullOrEmpty(rpcViewClassName))?MDDJPACRUDView.this.getForm().getData():null, new Callback<Object>() {
                        @Override
                        public void onSuccess(Object result) {
                            h.onSuccess(result);
                        }
                    });

                }

            }
        };

    }

    private AbstractWizard crearWizard(String title, Data initialData, WizardPageVO vo, Callback<Data> datacallback) {

        AbstractWizard w = new BaseWizard(title) {

            BaseWizard z = this;

            @Override
            public Data initializeData() {
                return initialData;
            }

            @Override
            public void navigate(Object action, Data data, Callback<AbstractWizardPageView> callback) throws Throwable {
                if (action == null) {
                    set("_gonextaction", vo.getGoNextAction());
                    set("_gobackaction", vo.getGoBackAction());
                    AbstractWizardPageView v = new AbstractWizardPageView(z) {


                        @Override
                        public boolean isFirstPage() {
                            return vo.isFirstPage();
                        }

                        @Override
                        public boolean isLastPage() {
                            return vo.isLastPage();
                        }

                        @Override
                        public String getTitle() {
                            return vo.getTitle();
                        }

                        @Override
                        public void build() {
                            buildFromMetadata(this, vo.getMetaData().getData("_editorform"), false);
                        }
                    };
                    callback.onSuccess(v);
                } else {
                    if (action instanceof Actions) {
                        Actions a = (Actions) action;
                        switch (a) {
                            case GONEXT:
                                ((ERPServiceAsync) MateuUI.create(ERPService.class)).execute(MateuUI.getApp().getUserData(), vo.getWizardClassName(), (String) data.get("_gonextaction"), data, new Callback<WizardPageVO>() {
                                    @Override
                                    public void onSuccess(WizardPageVO result) {
                                        setAll(result.getData());
                                        set("_gonextaction", result.getGoNextAction());
                                        set("_gobackaction", result.getGoBackAction());
                                        callback.onSuccess(new AbstractWizardPageView(z) {

                                            @Override
                                            public boolean isFirstPage() {
                                                return result.isFirstPage();
                                            }

                                            @Override
                                            public boolean isLastPage() {
                                                return result.isLastPage();
                                            }

                                            @Override
                                            public String getTitle() {
                                                return result.getTitle();
                                            }

                                            @Override
                                            public void build() {
                                                buildFromMetadata(this, result.getMetaData().getData("_editorform"), false);
                                            }
                                        });
                                    }
                                });
                                break;
                            case GOBACK:
                                ((ERPServiceAsync) MateuUI.create(ERPService.class)).execute(MateuUI.getApp().getUserData(), vo.getWizardClassName(), (String) data.get("_gobackaction"), data, new Callback<WizardPageVO>() {
                                    @Override
                                    public void onSuccess(WizardPageVO result) {
                                        //setAll(result.getData());
                                        set("_gonextaction", result.getGoNextAction());
                                        set("_gobackaction", result.getGoBackAction());
                                        callback.onSuccess(new AbstractWizardPageView(z) {

                                            @Override
                                            public boolean isFirstPage() {
                                                return result.isFirstPage();
                                            }

                                            @Override
                                            public boolean isLastPage() {
                                                return result.isLastPage();
                                            }

                                            @Override
                                            public String getTitle() {
                                                return result.getTitle();
                                            }

                                            @Override
                                            public void build() {
                                                buildFromMetadata(this, result.getMetaData().getData("_editorform"), false);
                                            }
                                        });
                                    }
                                });
                                break;
                            case END:
                                onOk(data);
                                //close();
                                break;
                            default:
                                throw new Throwable("Unknown action");
                        }
                    }

                }
            }

            @Override
            public String getTitle() {
                return title;
            }

            @Override
            public void onOk(Data data) throws Throwable {
                datacallback.onSuccess(data);
            }

            @Override
            public void build() {

            }

            @Override
            public boolean closeOnOk() {
                return false;
            }
        };


        return w;
    }

    private AbstractAction createAction(MDDJPACRUDView v, Data da) {
        return createAction(v, da, new MDDActionHelper() {
            @Override
            public void onSuccess(Object result) {
                if (result instanceof URL) {
                    MateuUI.open((URL) result);
                } else if (result instanceof MDDLink) {
                    MDDLink l = (MDDLink) result;
                    createAction(l).run();
                } else if (result instanceof Data) {
                    v.getForm().setData((Data) result);
                } else {
                    v.search();
                }
            }

            @Override
            public void complete(Data parameters) {

            }
        });
    }

    private AbstractAction createAction(AbstractView v, Data da) {
        return createAction(v, da, new MDDActionHelper() {
            @Override
            public void onSuccess(Object result) {
                if (result instanceof URL) {
                    MateuUI.open((URL) result);
                } else if (result instanceof MDDLink) {
                    MDDLink l = (MDDLink) result;
                    createAction(l).run();
                } else if (result instanceof Data) {
                    v.getForm().setData((Data) result);
                } else if (result instanceof Void || result == null) {
                    MateuUI.notifyDone("Done!");
                } else {
                    MateuUI.alert("" + result);
                }
            }

            @Override
            public void complete(Data parameters) {
                parameters.set("_id", v.getForm().getData().get("_id"));
            }
        });
    }

    private AbstractAction createAction(MDDLink l) {
        return new AbstractAction(l.getCaption()) {
            @Override
            public void run() {
                switch (l.getActionType()) {
                    case OPENEDITOR:
                        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), l.getEntityClassName(), l.getViewClassName(), null,  new MDDCallback(l.getData()) {
                            @Override
                            public void onSuccess(Data result) {
                                MateuUI.openView(new MDDJPACRUDView(result) {
                                    @Override
                                    public Data initializeData() {
                                        return l.getData();
                                    }
                                }.getNewEditorView().setInitialId(l.getData().get("_id")) );
                            }
                        });
                        break;
                    case OPENLIST:
                        ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), l.getEntityClassName(), l.getViewClassName(), null, new MDDCallback(l.getData()));
                        break;
                    case OPENVIEW:
                    ((ERPServiceAsync) MateuUI.create(ERPService.class)).getMetaData(MateuUI.getApp().getUserData(), l.getEntityClassName(), l.getViewClassName(), null, new MDDCallback(l.getData()));
                    break;
                    default: MateuUI.alert("Unkown operation " + l.getActionType());
                }
            }
        };
    }

    @Override
    public String getEntityClassName() {
        return entityClassName;
    }

    @Override
    public String getViewClassName() {
        return viewClassName;
    }

    @Override
    public String getIdFieldName() {
        return idFieldName;
    }


    @Override
    public void rpc(Data parameters, AsyncCallback<Data> callback) {
        if (!Strings.isNullOrEmpty(rpcViewClassName)) {
            ERPServiceAsync s = MateuUI.create(ERPService.class);
            s.rpc(MateuUI.getApp().getUserData(), rpcViewClassName, parameters, new AsyncCallback<GridData>() {
                @Override
                public void onFailure(Throwable throwable) {
                    callback.onFailure(throwable);
                }

                @Override
                public void onSuccess(GridData gridData) {
                    callback.onSuccess(gridData.asData());
                }
            });
        } else {
            super.rpc(parameters, callback);
        }
    }
}
