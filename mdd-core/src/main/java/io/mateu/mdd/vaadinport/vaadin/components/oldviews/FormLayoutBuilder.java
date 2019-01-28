package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.server.Sizeable;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.NakedObjectStylist;
import io.mateu.mdd.core.layout.MiFormLayout;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.AbstractFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.FieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.JPAOutputFieldBuilder;

import javax.persistence.GeneratedValue;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FormLayoutBuilder implements io.mateu.mdd.core.data.FormLayoutBuilder {

    public Pair<Component, AbstractStylist> build(MDDBinder binder, Class<?> modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields, boolean forSearchFields) {
        CssLayout contentContainer = new CssLayout();
        contentContainer.addStyleName("contentcontainer");
        return build(contentContainer, binder, modelType, model, validators, allFields, true, forSearchFields);
    }

    @Override
    public Pair<Component, AbstractStylist> build(MDDBinder binder, Class<?> modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields) {
        return build(binder, modelType, model, validators, allFields, false);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields) {
        return build(contentContainer, binder, modelType, model, validators, allFields, true, false);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields, boolean createSections, boolean forSearchFilters) {
        return build(contentContainer, binder, modelType, model, validators, allFields, createSections, forSearchFilters, true);
    }

    public Pair<Component, AbstractStylist> build(Layout contentContainer, MDDBinder binder, Class modelType, Object model, Map<HasValue, List<Validator>> validators, List<FieldInterfaced> allFields, boolean createSections, boolean forSearchFilters, boolean createTabs) {


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


        stylist.setUp(allFields);

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();

        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        if (createSections) {
            List<FormLayoutSection> sections = new ArrayList<>();
            allFields.forEach(f -> {
                if (f.isAnnotationPresent(Section.class)) {
                    sections.add(new FormLayoutSection(f.getAnnotation(Section.class).value(), f.getAnnotation(Section.class).card()));
                }
                if (sections.size() == 0) sections.add(new FormLayoutSection("General", false));
                sections.get(sections.size() - 1).getFields().add(f);
            });

            if (sections.size() == 1) {
                FormLayoutSection s = sections.get(0);
                if ("general".equalsIgnoreCase(s.getCaption())) s.setCaption(null);
            }

            AbstractStylist finalStylist1 = stylist;
            sections.forEach(s -> {
                Layout form = (MDD.isMobile())?new VerticalLayout():new MiFormLayout();
                form.setSizeUndefined();
                form.addStyleName("section");
                if (s.isCard()) form.addStyleName("sectioncard");
                //form.addStyleName(ValoTheme.FORMLAYOUT_LIGHT);

                if (s.getCaption() != null) {
                    Label section = new Label(s.getCaption());
                    section.addStyleName(ValoTheme.LABEL_H2);
                    section.addStyleName(ValoTheme.LABEL_COLORED);
                    form.addComponent(section);
                }


                buildAndAddFields(ofb, model, form, binder, validators, finalStylist1, allFieldContainers, s.getFields(), forSearchFilters);
                contentContainer.addComponent(form);
                if (form.getWidth() == 100 && Sizeable.Unit.PERCENTAGE.equals(form.getWidthUnits())) contentContainer.setWidth("100%");
            });
        } else {
            buildAndAddFields(ofb, model, contentContainer, binder, validators, stylist, allFieldContainers, allFields, forSearchFilters, createTabs);
        }

        binder.setBean(model);

        AbstractStylist finalStylist = stylist;
        binder.addValueChangeListener(new HasValue.ValueChangeListener<Object>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<Object> valueChangeEvent) {
                AbstractFieldBuilder.applyStyles(finalStylist, binder.getBean(), allFieldContainers, finalStylist.process(binder.getBean()));
            }
        });

        AbstractFieldBuilder.applyStyles(stylist, model, allFieldContainers, stylist.process(binder.getBean()));

        return new Pair(contentContainer, stylist);
    }

    private void buildAndAddFields(JPAOutputFieldBuilder ofb, Object model, Layout contentContainer, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters) {
        buildAndAddFields(ofb, model, contentContainer, binder, validators, stylist, allFieldContainers, fields, forSearchFilters, true);
    }

    public void buildAndAddFields(JPAOutputFieldBuilder ofb, Object model, Layout contentContainer, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, List<FieldInterfaced> fields, boolean forSearchFilters, boolean createTabs) {

        TabSheet tabs = null;
        TabSheet.Tab tab = null;

        Layout currentContentContainer = contentContainer;
        Layout currentFieldContainer = null;

        List<TabSheet> tabSheetsStack = new ArrayList<>();
        List<TabSheet.Tab> tabsStack = new ArrayList<>();
        List<Layout> containersStack = new ArrayList<>();

        for (FieldInterfaced f : fields) {

            Layout wrapper = null;

            if (forSearchFilters) {

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
                        tabs.setWidth("100%");
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
                            tabs.setWidth("100%");
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

                if (f.isAnnotationPresent(Width.class)) {
                    currentFieldContainer.addComponent(wrapper = new VerticalLayout());
                    ((VerticalLayout)wrapper).setSpacing(false);
                    wrapper.setWidth(f.getAnnotation(Width.class).value());
                    wrapper.addStyleName(CSS.NOPADDING);
                    wrapper.addStyleName("widthwrapper");
                }

            }



            if (f.isAnnotationPresent(FieldBuilder.class)) {
                try {
                    (f.getAnnotation(FieldBuilder.class).value().newInstance()).build(f, model, wrapper, binder, validators, stylist, allFieldContainers, forSearchFilters);
                } catch (Exception e) {
                    MDD.alert(e);
                }
            } else if (f.isAnnotationPresent(GeneratedValue.class) || (MDDUI.get().getNavegador().getViewProvider().getCurrentEditor() != null && f.isAnnotationPresent(Output.class))
                    || (!Component.class.isAssignableFrom(f.getType()) && ReflectionHelper.getMethod(model.getClass(), ReflectionHelper.getSetter(f)) == null)) {
                ofb.build(f, model, wrapper, binder, validators, stylist, allFieldContainers, forSearchFilters);
            } else {
                AbstractFieldBuilder b = MDD.getApp().getFieldBuilder(f);
                if (b != null) b.build(f, model, wrapper, binder, validators, stylist, allFieldContainers, forSearchFilters);
            }

            if (!forSearchFilters) if (wrapper != null && wrapper.getComponentCount() > 0) currentContentContainer.addComponent(currentFieldContainer);

        }

    }

    private static FormLayoutBuilder instance = new FormLayoutBuilder();

    public static FormLayoutBuilder get() {
        return instance;
    }

}
