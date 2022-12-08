package io.mateu.mdd.vaadin.components.views;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Sizeable;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.NakedObjectStylist;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnly;
import io.mateu.mdd.core.layout.MiFormLayout;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.FormLayoutBuilderParameters;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import io.mateu.mdd.vaadin.components.fieldBuilders.FieldBuilder;
import io.mateu.mdd.vaadin.components.fieldBuilders.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.data.Pair;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.lang.reflect.InvocationTargetException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class FormLayoutBuilder {

    public Pair<Component, AbstractStylist> build(MDDBinder binder, Class<?> modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params, Map<String, List<AbstractAction>> attachedActions) {
        return build(null, binder, modelType, model, componentsToLookForErrors, params, attachedActions);
    }
    public Pair<Component, AbstractStylist> build(EditorViewComponent editor, MDDBinder binder, Class<?> modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params, Map<String, List<AbstractAction>> attachedActions) {
        Layout contentContainer = null;
        if (false && params.isForSearchFilters() && !params.isForSearchFiltersExtended()) {
            contentContainer = new CssLayout();
        } else {
            contentContainer = new VerticalLayout();
        }
        contentContainer.addStyleName("contentcontainer");
        contentContainer.addStyleName(CSS.NOPADDING);
        return build(editor, contentContainer, binder, modelType, model, componentsToLookForErrors, params, attachedActions);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params, Map<String, List<AbstractAction>> attachedActions) {
        return build(null, contentContainer, binder, modelType, model, componentsToLookForErrors, params, attachedActions);
    }

    public Pair<Component, AbstractStylist> build(EditorViewComponent editor, Layout contentContainer, MDDBinder binder, Class modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params, Map<String, List<AbstractAction>> attachedActions) {
        long t0 = System.currentTimeMillis();

        Map<FieldInterfaced, MDDBinder> binders = new HashMap<>();
        Map<FieldInterfaced, Class> modelTypes = new HashMap<>();
        Map<FieldInterfaced, Object> models = new HashMap<>();

        AbstractStylist stylist = new NakedObjectStylist(modelType);

        if (modelType.isAnnotationPresent(Stylist.class)) {
            try {
                stylist = (AbstractStylist) ((Stylist)modelType.getAnnotation(Stylist.class)).value().newInstance();
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (ClassCastException e) {
                e.printStackTrace();
            }
        }

        String viewTitle = Helper.capitalize(modelType.getSimpleName());
        if (modelType.isAnnotationPresent(Caption.class)) {
            viewTitle = ((Caption)modelType.getAnnotation(Caption.class)).value();
        }
        if (model != null && model instanceof PersistentPojo) viewTitle = ((PersistentPojo) model).getEntityName();
        stylist.setViewTitle(viewTitle);

        if (modelType.isAnnotationPresent(Subtitle.class)) {
            String viewSubtitle = ((Subtitle)modelType.getAnnotation(Subtitle.class)).value();
            stylist.setViewSubtitle(viewSubtitle);
        }



        List<FieldInterfaced> allFields = new ArrayList<>();
        for (FieldInterfaced field : params.getAllFields()) {
            add(field, binder, modelType, model, allFields, binders, modelTypes, models);
        }
        params.setAllFields(allFields);

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();
        VerticalLayout[] sectionTabSheet = new VerticalLayout[1];

        Pair<Component, AbstractStylist> r = build(t0, sectionTabSheet, allFieldContainers, editor, contentContainer, binders, modelTypes, models, componentsToLookForErrors, params, attachedActions, stylist);

        log.debug("editor component E.2 in " + (System.currentTimeMillis() - t0) + " ms.");

        //binder.setBean(model);

        AbstractStylist finalStylist = stylist;
        binder.addValueChangeListener(new HasValue.ValueChangeListener<Object>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<Object> valueChangeEvent) {
                AbstractFieldBuilder.applyStyles(finalStylist, binder.getBean(), allFieldContainers, finalStylist.process(binder.getBean()));
            }
        });

        AbstractFieldBuilder.applyStyles(stylist, model, allFieldContainers, stylist.process(binder.getBean()));

        if (sectionTabSheet[0] != null) {
            String sid = MateuUI.get().getPendingFocusedSectionId();
            if (!Strings.isNullOrEmpty(sid)) {
                //sectionTabSheet[0].setSelectedTab(Integer.parseInt(sid));
            } else if (editor != null && !Strings.isNullOrEmpty(editor.getFocusedSectionId())) {
                //sectionTabSheet[0].setSelectedTab(Integer.parseInt(editor.getFocusedSectionId()));
            }
        }

        log.debug("editor component E.3 in " + (System.currentTimeMillis() - t0) + " ms.");

        return r;
    }

    private void add(FieldInterfaced field, MDDBinder binder, Class modelType, Object model, List<FieldInterfaced> allFields, Map<FieldInterfaced, MDDBinder> binders, Map<FieldInterfaced, Class> modelTypes, Map<FieldInterfaced, Object> models) {
        if (field.isAnnotationPresent(Embed.class)) {
            Object o = null;
            try {
                if (model != null) {
                    o = ReflectionHelper.getValue(field, model);
                }
                if (o == null) {
                    o = ReflectionHelper.newInstance(field.getType());
                    if (model != null) ReflectionHelper.setValue(field, model, o);
                }
                binder.bind(new HasValue() {
                    private boolean _requiredIndicatorVisible;
                    private boolean _readOnly;
                    private List<ValueChangeListener> listeners = new ArrayList<>();

                    @Override
                    public void setValue(Object o) {
                        try {
                            Object old = ReflectionHelper.getValue(field, model);
                            ReflectionHelper.setValue(field, model, o);
                            ValueChangeEvent event = new ValueChangeEvent(null, this, old, false);
                            for (ValueChangeListener listener : listeners) {
                                listener.valueChange(event);
                            }
                        } catch (Throwable e) {
                            Notifier.alert(e);
                        }
                    }

                    @Override
                    public Object getValue() {
                        try {
                            return ReflectionHelper.getValue(field, model);
                        } catch (Throwable e) {
                            Notifier.alert(e);
                            return null;
                        }
                    }

                    @Override
                    public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                        listeners.add(valueChangeListener);
                        return new Registration() {
                            @Override
                            public void remove() {
                                listeners.remove(valueChangeListener);
                            }
                        };
                    }

                    @Override
                    public void setRequiredIndicatorVisible(boolean b) {
                        _requiredIndicatorVisible = b;
                    }

                    @Override
                    public boolean isRequiredIndicatorVisible() {
                        return _requiredIndicatorVisible;
                    }

                    @Override
                    public void setReadOnly(boolean b) {
                        _readOnly = b;
                    }

                    @Override
                    public boolean isReadOnly() {
                        return _readOnly;
                    }
                }, field.getName());
                MDDBinder b = new MDDBinder(field.getType());
                b.setBean(o);
                for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(field.getType())) {
                    add(f, b, field.getType(), o, allFields, binders, modelTypes, models);
                }
            } catch (Throwable e) {
                Notifier.alert(e);
            }
        } else {
            allFields.add(field);
            binders.put(field, binder);
            modelTypes.put(field, modelType);
            models.put(field, model);
        }
    }

    public Pair<Component, AbstractStylist> build(long t0, VerticalLayout[] sectionTabSheets, Map<FieldInterfaced, Component> allFieldContainers, EditorViewComponent editor, Layout contentContainer, Map<FieldInterfaced, MDDBinder> binders, Map<FieldInterfaced, Class> modelTypes, Map<FieldInterfaced, Object> models, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params, Map<String, List<AbstractAction>> attachedActions, AbstractStylist stylist) {

        stylist.setUp(params.getAllFields());

        log.debug("editor component E.1 in " + (System.currentTimeMillis() - t0) + " ms.");

        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        VerticalLayout sectionTabSheet = null;

        if (params.isCreateSections()) {
            List<FormLayoutSection> sections = new ArrayList<>();
            Map<String, FormLayoutSection> sectionsByCaption = new HashMap<>();
            FormLayoutSection section = null;
            for (FieldInterfaced f : params.getAllFields()) {
                if (f.isAnnotationPresent(Section.class)) {
                    section = sectionsByCaption.get(f.getAnnotation(Section.class).value());
                    if (section == null) {
                        sections.add(section = new FormLayoutSection(f.getAnnotation(Section.class).value(), f.getAnnotation(Section.class).card()));
                        sectionsByCaption.put(section.getCaption(), section);
                    }
                }
                if (section == null) {
                    section = sectionsByCaption.get("General");
                    if (section == null) {
                        sections.add(section = new FormLayoutSection("General", false));
                        sectionsByCaption.put(section.getCaption(), section);
                    }
                }
                if (f.isAnnotationPresent(SectionKPI.class)) section.getKpis().add(f);
                else section.getFields().add(f);
            }

            Component realContainer = contentContainer;

            if (sections.size() == 1) {
                FormLayoutSection s = sections.get(0);
                if ("general".equalsIgnoreCase(s.getCaption())) s.setCaption(null);
            } else if (sections.size() > 1) {
                if (false && !MDDUIAccessor.isMobile() && editor != null) editor.setSizeFull();
                sectionTabSheet = new VerticalLayout();

                if (editor != null) {
                    VerticalLayout finalSectionTabSheet = sectionTabSheet;
                    //sectionTabSheet.addSelectedTabChangeListener(e -> editor.setFocusedSection(finalSectionTabSheet, e.getTabSheet().getSelectedTab()));
                }
                //tabSheet.setSizeFull();
                if (contentContainer instanceof VerticalLayout) ((VerticalLayout) contentContainer).addComponent(sectionTabSheet);
                else contentContainer.addComponent(sectionTabSheet);
                sectionTabSheet.addStyleName(CSS.NOPADDING);
                //contentContainer.setSizeFull();
                realContainer = sectionTabSheet;
            }

            AbstractStylist finalStylist1 = stylist;
            Component finalRealContainer = realContainer;
            sections.forEach(s -> {
                Layout form = (MDDUIAccessor.isMobile())?new VerticalLayout():new MiFormLayout();
                form.addStyleName("section");
                if (false) {
                    form.setSizeUndefined();
                    form.addStyleName("section");
                }
                if (s.isCard()) form.addStyleName("sectioncard");

                if (s.getKpis().size() > 0) {
                    CssLayout kpisContainer;
                    form.addComponent(kpisContainer = new CssLayout());
                    kpisContainer.addStyleName(CSS.NOPADDING);
                    kpisContainer.addStyleName("sectionkpiscontainer");
                    for (FieldInterfaced kpi : s.getKpis()) {
                        Component c;
                        kpisContainer.addComponent(c = createKpi(binders.get(kpi), kpi));
                    }
                }

                buildAndAddFields(form, editor, ofb, models, form, binders, params.getValidators(), finalStylist1, allFieldContainers, s.getFields(), params.isForSearchFilters(), params.isForSearchFiltersExtended(), componentsToLookForErrors, attachedActions);
                if (!"".equals(s.getCaption())) addActions(form, params.getActionsPerSection().get(s.getCaption()));

                Panel p;
                addSectionToContainer(finalRealContainer, p = new Panel(form), s.getCaption());
                p.addStyleName(ValoTheme.PANEL_BORDERLESS);
                if (form.getWidth() == 100 && Sizeable.Unit.PERCENTAGE.equals(form.getWidthUnits())) contentContainer.setWidth("100%");
            });
        } else {
            buildAndAddFields(sectionTabSheet, editor, ofb, models, contentContainer, binders, params.getValidators(), stylist, allFieldContainers, params.getAllFields(), params.isForSearchFilters(), params.isForSearchFiltersExtended(), componentsToLookForErrors, attachedActions);
        }

        sectionTabSheets[0] = sectionTabSheet;

        return new Pair(contentContainer, stylist);
    }

    private void addActions(Layout form, List<AbstractAction> l) {
        if (l != null && l.size() > 0) {
            HorizontalLayout actionsContainer;
            form.addComponent(actionsContainer = new HorizontalLayout());
            actionsContainer.addStyleName(CSS.NOPADDING);
            actionsContainer.addStyleName("sectionactionbar");

            List<String> secuencia = new ArrayList<>();
            Map<String, AbstractAction> mapa = new HashMap<>();

            int pos = 0;
            for (AbstractAction a : l) {

            }

            for (AbstractAction a : l) {
                Button b;
                actionsContainer.addComponent(b = new Button(a.getCaption(), a.getIcon()));
                b.addStyleName(ValoTheme.BUTTON_TINY);
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName(a.getStyle());
                b.addClickListener(e -> {
                    try {
                        new AcctionRunner().run(a);
                    } catch (Throwable ex) {
                        Notifier.alert(ex);
                    }
                });
            }

        }
    }

    private Component createKpi(MDDBinder binder, FieldInterfaced kpi) {

        VerticalLayout vl = new VerticalLayout();
        vl.addStyleName("kpi");
        vl.addStyleName("sectionkpi");
        vl.setWidthUndefined();

        vl.addComponent(new Label(ReflectionHelper.getCaption(kpi)));

        Label l;
        vl.addComponent(l = new Label());
        l.addStyleName("valor");
        l.setContentMode(ContentMode.HTML);
        Binder.Binding binding = binder.forField(new HasValue() {

            Object v = null;

            @Override
            public void setValue(Object o) {
                v = o;

                String s = "";

                if (double.class.equals(kpi.getType()) && (kpi.isAnnotationPresent(Money.class) || kpi.isAnnotationPresent(Balance.class))) {
                    DecimalFormat df = new DecimalFormat("##,###,###,###,##0.00");
                    s = df.format(v != null?v:0);
                    if (kpi.isAnnotationPresent(Balance.class)) {
                        if (v != null && ((double)v) < 0) {
                            l.addStyleName("negativo");
                            l.removeStyleName("positivo");
                        } else {
                            l.addStyleName("positivo");
                            l.removeStyleName("negativo");
                        }
                    }
                } else {
                    if (v == null) s = "";
                    else {
                        if (v instanceof Boolean) {
                            if ((Boolean) v && !kpi.getAnnotation(KPI.class).reversed()) {
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
            }

            @Override
            public Object getValue() {
                return v;
            }

            @Override
            public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                return null;
            }

            @Override
            public void setRequiredIndicatorVisible(boolean b) {

            }

            @Override
            public boolean isRequiredIndicatorVisible() {
                return false;
            }

            @Override
            public void setReadOnly(boolean b) {

            }

            @Override
            public boolean isReadOnly() {
                return false;
            }
        }).bind(kpi.getName());

        return vl;

    }

    private void addSectionToContainer(Component finalRealContainer, Panel form, String caption) {
        if (finalRealContainer instanceof TabSheet) {
            TabSheet ts = (TabSheet) finalRealContainer;
            form.setId("" + ts.getComponentCount());
            TabSheet.Tab t = ts.addTab(form, caption);
        } else if (finalRealContainer instanceof Layout) {
            ((Layout)finalRealContainer).addComponent(form);
        }
    }

    private void buildAndAddFields(Layout section, EditorViewComponent editor, JPAOutputFieldBuilder ofb, Map<FieldInterfaced, Object> models, Layout contentContainer, Map<FieldInterfaced, MDDBinder> binders, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean forSearchFiltersExtended, List<Component> componentsToLookForErrors, Map<String, List<AbstractAction>> attachedActions) {
        buildAndAddFields(section, editor, ofb, models, contentContainer, binders, validators, stylist, allFieldContainers, fields, forSearchFilters, forSearchFiltersExtended, true, componentsToLookForErrors, attachedActions);
    }

    public void buildAndAddFields(Layout section, EditorViewComponent editor, JPAOutputFieldBuilder ofb, Map<FieldInterfaced, Object> models, Layout contentContainer, Map<FieldInterfaced, MDDBinder> binders, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean forSearchFiltersExtended, boolean createTabs, List<Component> componentsToLookForErrors, Map<String, List<AbstractAction>> attachedActions) {

        if (forSearchFilters) {
            if (forSearchFiltersExtended) {
                contentContainer.addComponent(contentContainer = new VerticalLayout());
                contentContainer.setSizeUndefined();
            }
            _buildAndAddFields(null, null, editor, ofb, models, contentContainer, binders, validators, stylist, allFieldContainers, fields, forSearchFilters, forSearchFiltersExtended, createTabs, componentsToLookForErrors, attachedActions);
        } else {

            if (false) contentContainer.setSizeFull();

            List<FormLayoutGroup> groups = new ArrayList<>();
            Map<String, FormLayoutGroup> groupsByCaption = new HashMap<>();
            int posGroup = 1;
            FormLayoutGroup group = null;
            for (FieldInterfaced f : fields) {
                if (f.isAnnotationPresent(FieldGroup.class)) {
                    group = groupsByCaption.get(f.getAnnotation(FieldGroup.class).value());
                    if (group == null) {
                        groups.add(group = new FormLayoutGroup(f.getAnnotation(FieldGroup.class).value()));
                        groupsByCaption.put(group.getCaption(), group);
                    }
                }
                if (group == null) {
                    group = groupsByCaption.get("Field Group " + posGroup);
                }
                if (group == null
                //        || (group.getCaption().startsWith("Field Group ") && group.getFields().size() >= 3)
                ) {
                    groups.add(group = new FormLayoutGroup("Field Group " + (group == null?posGroup:++posGroup)));
                    groupsByCaption.put(group.getCaption(), group);
                }
                group.getFields().add(f);
            }

            CssLayout css;
            contentContainer.addComponent(css = new CssLayout());
            css.setWidthFull();

            groups.forEach(g -> {
                VerticalLayout fieldGroup;
                css.addComponent(fieldGroup = new VerticalLayout());
                fieldGroup.setWidthFull();
                fieldGroup.addStyleName(CSS.NOPADDING);

                HorizontalLayout fieldGroupHeader = null;


                if ((editor != null
                //        && !editor.esForm()
                ) || !g.getCaption().startsWith("Field Group ")) {
                    fieldGroup.addStyleName("fieldgroup");
                    if (!Strings.isNullOrEmpty(g.getCaption())) {
                        fieldGroup.addComponent(fieldGroupHeader = new HorizontalLayout());
                        fieldGroup.setWidthFull();
                        fieldGroupHeader.setWidthFull();
                        fieldGroupHeader.addStyleName("fieldgroupheader");

                        Label c;
                        fieldGroupHeader.addComponent(c = new Label(g.getCaption()));
                        c.addStyleName(ValoTheme.LABEL_H4);
                    }
                } else {
                    fieldGroup.addStyleName("nofieldgroup");
                }

                _buildAndAddFields(fieldGroup, fieldGroupHeader, editor, ofb, models, fieldGroup, binders, validators, stylist, allFieldContainers, g.getFields(), forSearchFilters, forSearchFiltersExtended, createTabs, componentsToLookForErrors, attachedActions);
            });
        }
    }

    public void _buildAndAddFields(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, EditorViewComponent editor, JPAOutputFieldBuilder ofb, Map<FieldInterfaced, Object> models, Layout contentContainer, Map<FieldInterfaced, MDDBinder> binders, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean forSearchFiltersExtended, boolean createTabs, List<Component> componentsToLookForErrors, Map<String, List<AbstractAction>> attachedActions) {
        TabSheet tabs = null;
        TabSheet.Tab tab = null;

        Layout currentContentContainer = contentContainer;
        Layout currentFieldContainer = null;

        List<TabSheet> tabSheetsStack = new ArrayList<>();
        List<TabSheet.Tab> tabsStack = new ArrayList<>();
        List<Layout> containersStack = new ArrayList<>();

        Object model = fields.size() > 0?models.get(fields.get(0)):null;
        boolean readOnly = model != null && model instanceof ReadOnly && ((ReadOnly) model).isReadOnly();

        for (FieldInterfaced f : fields) {

            long t0 = System.currentTimeMillis();

            Layout wrapper = null;

            if (forSearchFilters && !forSearchFiltersExtended) {

                //wrapper = contentContainer;
                HorizontalLayout hl;
                contentContainer.addComponent(wrapper = hl = new HorizontalLayout());
                hl.addStyleName(CSS.NOPADDING);

            } else {

                if (f.isAnnotationPresent(FullWidth.class) || (f.isAnnotationPresent(Tab.class) && f.getAnnotation(Tab.class).fullWith()) || (f.isAnnotationPresent(StartTabs.class) && f.getAnnotation(StartTabs.class).fullWith())) {
                    contentContainer.setWidth("100%");
                    contentContainer.addStyleName("section-fullwidth");
                    if (!currentContentContainer.equals(contentContainer)) {
                        currentContentContainer.setWidth("100%");
                        currentContentContainer.addStyleName("section-fullwidth");
                    }
                }

                if (createTabs) {

                    if (f.isAnnotationPresent(StartTabs.class)) { //todo: comprobar que también existe una etiqueta @Tab en este campo
                        if (tabs != null) {
                            tabSheetsStack.add(0, tabs);
                            tabsStack.add(0, tab);
                            containersStack.add(0, currentContentContainer);
                        }
                        tabs = new TabSheet();
                        tabs.setSizeUndefined();
                        currentContentContainer.addComponent(tabs);
                    }
                    if (f.isAnnotationPresent(EndTabs.class)) {
                        if (tabSheetsStack.size() > 0) {
                            tab = tabsStack.remove(0);
                            tabs = tabSheetsStack.remove(0);
                            currentContentContainer = containersStack.remove(0);
                        } else {
                            tab = null;
                            tabs = null;
                            currentContentContainer = contentContainer;
                        }
                    }

                    if (f.isAnnotationPresent(Tab.class)) {
                        Tab ta = f.getAnnotation(Tab.class);
                        if (tabs == null) {
                            tabs = new TabSheet();
                            tabs.setSizeUndefined();
                            currentContentContainer.addComponent(tabs);
                            //tabs.setCaption(ta.value());
                        }
                        tab = tabs.addTab(currentContentContainer = new MiFormLayout());
                        tab.setCaption(ta.value());
                    }

                }

                if (currentFieldContainer == null || !f.isAnnotationPresent(SameLine.class)) {
                    HorizontalLayout wrap;
                    currentFieldContainer = wrap = new HorizontalLayout();
                    wrap.setSpacing(true);
                    wrap.setDefaultComponentAlignment(Alignment.TOP_LEFT);
                    if (f.isAnnotationPresent(FullWidth.class)) wrap.setWidth("100%");
                    //currentFieldContainer.setCaption(ReflectionHelper.getCaption(f));
                }

                wrapper = currentFieldContainer;

                if (f.isAnnotationPresent(FullWidth.class) || f.isAnnotationPresent(Width.class)) {
                    currentFieldContainer.addComponent(wrapper = new VerticalLayout());
                    ((VerticalLayout) wrapper).setSpacing(false);
                    wrapper.setWidth(f.isAnnotationPresent(Width.class)?f.getAnnotation(Width.class).value():"100%");
                    wrapper.addStyleName(CSS.NOPADDING);
                    wrapper.addStyleName("widthwrapper");
                } else {
                    wrapper.setWidthFull();
                }

            }

            readOnly |= MDD.isReadOnly(f);
            readOnly |= editor instanceof ReadOnlyViewComponent;

            Component c = null;
            if (
                    !forSearchFilters
                    && (
                        readOnly
                        || (
                                !f.forceInput()
                                && (
                                        f.isAnnotationPresent(GeneratedValue.class)
                                        || (
                                                editor != null
                                                && (
                                                        f.isAnnotationPresent(Output.class) || f.isAnnotationPresent(io.mateu.mdd.shared.annotations.ReadOnly.class)
                                                        || (
                                                            !editor.isNewRecord()
                                                            && (models.get(f).getClass().isAnnotationPresent(Unmodifiable.class) || models.get(f).getClass().isAnnotationPresent(io.mateu.mdd.shared.annotations.ReadOnly.class) || f.isAnnotationPresent(Id.class))
                                                        )
                                                )
                                        )
                                        || (
                                                !Component.class.isAssignableFrom(f.getType())
                                                && ReflectionHelper.getMethod(models.get(f).getClass(), ReflectionHelper.getSetter(f)) == null
                                        )
                                )
                        )
                    )
            ) {
                c = ofb.build(fieldGroup, fieldGroupHeader, f, models.get(f), wrapper, binders.get(f), validators, stylist, allFieldContainers, forSearchFilters, attachedActions);
            } else if (f.isAnnotationPresent(FieldBuilder.class)) {
                try {
                    c = (f.getAnnotation(FieldBuilder.class).value().newInstance()).build(fieldGroup, fieldGroupHeader, f, models.get(f), wrapper, binders.get(f), validators, stylist, allFieldContainers, forSearchFilters, attachedActions);
                } catch (Exception e) {
                    Notifier.alert(e);
                }
            } else {
                AbstractFieldBuilder b = (AbstractFieldBuilder) MDDUIAccessor.getApp().getFieldBuilder(f);
                if (b != null) c = b.build(fieldGroup, fieldGroupHeader, f, models.get(f), wrapper, binders.get(f), validators, stylist, allFieldContainers, forSearchFilters, attachedActions);
            }

            if (c != null) componentsToLookForErrors.add(c);

            if (c != null && RpcView.class.isAssignableFrom(f.getType()) && c instanceof ListViewComponent) {
                editor.getEmbeddedListViewComponents().put(f, (ListViewComponent) c);
            }

            if (!forSearchFilters || forSearchFiltersExtended) if (wrapper != null && wrapper.getComponentCount() > 0) currentContentContainer.addComponent(currentFieldContainer);


            log.debug("editor component field " + f + " in " + (System.currentTimeMillis() - t0) + " ms.");

        }

    }

    private static FormLayoutBuilder instance = new FormLayoutBuilder();

    public static FormLayoutBuilder get() {
        return instance;
    }

}
