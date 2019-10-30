package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

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
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.NakedObjectStylist;
import io.mateu.mdd.core.interfaces.ReadOnly;
import io.mateu.mdd.core.layout.MiFormLayout;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.app.AbstractMDDExecutionContext;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.FieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.JPAOutputFieldBuilder;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.GeneratedValue;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class FormLayoutBuilder implements io.mateu.mdd.core.data.FormLayoutBuilder {

    public Pair<Component, AbstractStylist> build(MDDBinder binder, Class<?> modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params) {
        return build(null, binder, modelType, model, componentsToLookForErrors, params);
    }
    public Pair<Component, AbstractStylist> build(EditorViewComponent editor, MDDBinder binder, Class<?> modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params) {
        Layout contentContainer = null;
        if (params.isForSearchFilters() && !params.isForSearchFiltersExtended()) {
            contentContainer = new CssLayout();
        } else {
            contentContainer = new VerticalLayout();
        }
        contentContainer.addStyleName("contentcontainer");
        contentContainer.addStyleName(CSS.NOPADDING);
        return build(contentContainer, binder, modelType, model, componentsToLookForErrors, params);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params) {
        return build(null, contentContainer, binder, modelType, model, componentsToLookForErrors, params);
    }

    public Pair<Component, AbstractStylist> build(EditorViewComponent editor, Layout contentContainer, MDDBinder binder, Class modelType, Object model, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params) {

        long t0 = System.currentTimeMillis();


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

        stylist.setViewTitle(Helper.capitalize(modelType.getSimpleName()));


        stylist.setUp(params.getAllFields());

        log.debug("editor component E.1 in " + (System.currentTimeMillis() - t0) + " ms.");

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();

        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        if (!params.isForSearchFilters() && params.isCreateSections()) {
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
                if (!MDD.isMobile() && editor != null) editor.setSizeFull();
                TabSheet tabSheet = new TabSheet();
                //tabSheet.setSizeFull();
                if (contentContainer instanceof VerticalLayout) ((VerticalLayout) contentContainer).addComponentsAndExpand(tabSheet);
                else contentContainer.addComponent(tabSheet);
                //contentContainer.setSizeFull();
                realContainer = tabSheet;
            }

            AbstractStylist finalStylist1 = stylist;
            Component finalRealContainer = realContainer;
            sections.forEach(s -> {
                Layout form = (MDD.isMobile())?new VerticalLayout():new MiFormLayout();
                if (false) {
                    form.setSizeUndefined();
                    form.addStyleName("section");
                }
                if (s.isCard()) form.addStyleName("sectioncard");

                if (s.getKpis().size() > 0) {
                    CssLayout kpisContainer;
                    form.addComponent(kpisContainer = new CssLayout());
                    kpisContainer.addStyleName(CSS.NOPADDING);
                    for (FieldInterfaced kpi : s.getKpis()) {
                        Component c;
                        kpisContainer.addComponent(c = createKpi(binder, kpi));
                    }
                }

                addActions(form, params.getActionsPerSection().get(s.getCaption()));
                buildAndAddFields(ofb, model, form, binder, params.getValidators(), finalStylist1, allFieldContainers, s.getFields(), params.isForSearchFilters(), params.isForSearchFiltersExtended(), componentsToLookForErrors);
                Panel p;
                addSectionToContainer(finalRealContainer, p = new Panel(form), s.getCaption());
                p.addStyleName(ValoTheme.PANEL_BORDERLESS);
                if (form.getWidth() == 100 && Sizeable.Unit.PERCENTAGE.equals(form.getWidthUnits())) contentContainer.setWidth("100%");
            });
        } else {
            buildAndAddFields(ofb, model, contentContainer, binder, params.getValidators(), stylist, allFieldContainers, params.getAllFields(), params.isForSearchFilters(), params.isForSearchFiltersExtended(), componentsToLookForErrors);
        }

        log.debug("editor component E.2 in " + (System.currentTimeMillis() - t0) + " ms.");

        binder.setBean(model);

        AbstractStylist finalStylist = stylist;
        binder.addValueChangeListener(new HasValue.ValueChangeListener<Object>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<Object> valueChangeEvent) {
                AbstractFieldBuilder.applyStyles(finalStylist, binder.getBean(), allFieldContainers, finalStylist.process(binder.getBean()));
            }
        });

        AbstractFieldBuilder.applyStyles(stylist, model, allFieldContainers, stylist.process(binder.getBean()));

        log.debug("editor component E.3 in " + (System.currentTimeMillis() - t0) + " ms.");

        return new Pair(contentContainer, stylist);
    }

    private void addActions(Layout form, List<AbstractAction> l) {
        if (l != null && l.size() > 0) {
            HorizontalLayout actionsContainer;
            form.addComponent(actionsContainer = new HorizontalLayout());
            actionsContainer.addStyleName(CSS.NOPADDING);

            List<String> secuencia = new ArrayList<>();
            Map<String, AbstractAction> mapa = new HashMap<>();

            int pos = 0;
            for (AbstractAction a : l) {

            }

            for (AbstractAction a : l) {
                Button b;
                actionsContainer.addComponent(b = new Button(a.getName(), a.getIcon()));
                b.addStyleName(ValoTheme.BUTTON_TINY);
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName(a.getStyle());
                b.addClickListener(e -> a.run(new AbstractMDDExecutionContext()));
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
            ((TabSheet) finalRealContainer).addTab(form, caption);
        } else if (finalRealContainer instanceof Layout) {
            ((Layout)finalRealContainer).addComponent(form);
        }
    }

    private void buildAndAddFields(JPAOutputFieldBuilder ofb, Object model, Layout contentContainer, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean forSearchFiltersExtended, List<Component> componentsToLookForErrors) {
        buildAndAddFields(ofb, model, contentContainer, binder, validators, stylist, allFieldContainers, fields, forSearchFilters, forSearchFiltersExtended, true, componentsToLookForErrors);
    }

    public void buildAndAddFields(JPAOutputFieldBuilder ofb, Object model, Layout contentContainer, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean forSearchFiltersExtended, boolean createTabs, List<Component> componentsToLookForErrors) {

        if (forSearchFilters) {
            _buildAndAddFields(ofb, model, contentContainer, binder, validators, stylist, allFieldContainers, fields, forSearchFilters, forSearchFiltersExtended, createTabs, componentsToLookForErrors);
        } else {

            contentContainer.setSizeFull();

            List<FormLayoutGroup> groups = new ArrayList<>();
            Map<String, FormLayoutGroup> groupsByCaption = new HashMap<>();
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
                    group = groupsByCaption.get("");
                    if (group == null) {
                        groups.add(group = new FormLayoutGroup(""));
                        groupsByCaption.put(group.getCaption(), group);
                    }
                }
                group.getFields().add(f);
            }

            CssLayout css;
            contentContainer.addComponent(css = new CssLayout());

            groups.forEach(g -> {
                VerticalLayout l;
                css.addComponent(l = new VerticalLayout());
                l.setSizeUndefined();
                l.addStyleName("fieldgroup");
                if (!Strings.isNullOrEmpty(g.getCaption())) {
                    Label c;
                    l.addComponent(c = new Label(g.getCaption()));
                    c.addStyleName(ValoTheme.LABEL_H4);
                    c.addStyleName("fieldgroupheader");
                }

                _buildAndAddFields(ofb, model, l, binder, validators, stylist, allFieldContainers, g.getFields(), forSearchFilters, forSearchFiltersExtended, createTabs, componentsToLookForErrors);
            });
        }
    }

    public void _buildAndAddFields(JPAOutputFieldBuilder ofb, Object model, Layout contentContainer, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean forSearchFiltersExtended, boolean createTabs, List<Component> componentsToLookForErrors) {
        TabSheet tabs = null;
        TabSheet.Tab tab = null;

        Layout currentContentContainer = contentContainer;
        Layout currentFieldContainer = null;

        List<TabSheet> tabSheetsStack = new ArrayList<>();
        List<TabSheet.Tab> tabsStack = new ArrayList<>();
        List<Layout> containersStack = new ArrayList<>();

        boolean readOnly = model != null && model instanceof ReadOnly && ((ReadOnly) model).isReadOnly();

        for (FieldInterfaced f : fields) {

            long t0 = System.currentTimeMillis();

            Layout wrapper = null;

            if (forSearchFilters && !forSearchFiltersExtended) {

                wrapper = contentContainer;

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
                }

            }


            Component c = null;
            if (!forSearchFilters && (readOnly || (!f.forceInput() && (f.isAnnotationPresent(GeneratedValue.class) || (MDDUI.get().getNavegador().getViewProvider().getCurrentEditor() != null && (f.isAnnotationPresent(Output.class) || (!MDDUI.get().getNavegador().getViewProvider().getCurrentEditor().isNewRecord() && f.getDeclaringClass().isAnnotationPresent(Unmodifiable.class))))
                    || (!Component.class.isAssignableFrom(f.getType()) && ReflectionHelper.getMethod(model.getClass(), ReflectionHelper.getSetter(f)) == null))))) {
                c = ofb.build(f, model, wrapper, binder, validators, stylist, allFieldContainers, forSearchFilters);
            } else if (f.isAnnotationPresent(FieldBuilder.class)) {
                try {
                    c = (f.getAnnotation(FieldBuilder.class).value().newInstance()).build(f, model, wrapper, binder, validators, stylist, allFieldContainers, forSearchFilters);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            } else {
                AbstractFieldBuilder b = MDD.getApp().getFieldBuilder(f);
                if (b != null) c = b.build(f, model, wrapper, binder, validators, stylist, allFieldContainers, forSearchFilters);
            }

            if (c != null) componentsToLookForErrors.add(c);

            if (!forSearchFilters || forSearchFiltersExtended) if (wrapper != null && wrapper.getComponentCount() > 0) currentContentContainer.addComponent(currentFieldContainer);


            log.debug("editor component field " + f + " in " + (System.currentTimeMillis() - t0) + " ms.");

        }

    }

    private static FormLayoutBuilder instance = new FormLayoutBuilder();

    public static FormLayoutBuilder get() {
        return instance;
    }

}
