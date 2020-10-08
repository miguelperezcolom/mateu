package io.mateu.mdd.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.FormLayoutBuilderParameters;
import io.mateu.mdd.shared.annotations.MainSearchFilter;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.util.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class FiltersComponent extends Composite {

    private final ListViewComponent listViewComponent;
    private final Class modelType;

    private MDDBinder binder;

    private Component allFiltersComponent;

    public MDDBinder getBinder() {
        return binder;
    }

    public FiltersComponent(ListViewComponent listViewComponent) throws IllegalAccessException, InstantiationException {

        this.listViewComponent = listViewComponent;

        this.modelType = listViewComponent.getFiltersType();

        build();
    }

    private void build() {

        long t0 = System.currentTimeMillis();

        Layout l = new CssLayout(); //MDDUIAccessor.isMobile())?new VerticalLayout():new HorizontalLayout();
        Layout pl = MDDUIAccessor.isMobile()?l:new CssLayout(l);
        setCompositionRoot(pl);
        l.addStyleName(CSS.NOPADDING);
        pl.addStyleName(CSS.NOPADDING);

        addStyleName("filterscomponent");


        binder = new MDDBinder(modelType);
        try {
            binder.setBean(listViewComponent.getModelForSearchFilters());
        } catch (Exception e) {
            Notifier.alert(e);
        }
        binder.addValueChangeListener(e -> listViewComponent.setModelForSearchFilters(binder.getBean()));

        Map<HasValue, List<Validator>> validators = new HashMap<>();


        List<FieldInterfaced> allFilterFields = getAllFilterFields();

        HorizontalLayout botones = new HorizontalLayout();

        if (!MDDUIAccessor.isMobile() && allFilterFields.size() > 0) {
            botones.addStyleName("botonerafiltros");
            botones.setSpacing(false);
        }


        if (allFilterFields.size() > 0) {

            List<FieldInterfaced> mainFilterFields = allFilterFields.stream().filter(f -> f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList());
            if (mainFilterFields.size() == 0) {
                if (allFilterFields.size() > 1) mainFilterFields = allFilterFields.subList(0, (allFilterFields.size() > 2)?2:allFilterFields.size());
                else mainFilterFields = allFilterFields;
            }

            Pair<Component, AbstractStylist> r = FormLayoutBuilder.get().build(l, binder, modelType, binder.getBean(), new ArrayList<>(), FormLayoutBuilderParameters.builder().validators(validators).allFields(mainFilterFields).forSearchFilters(true).createSections(false).createTabs(false).build(), null);


            VerticalLayout vl = new VerticalLayout();
            vl.addStyleName(CSS.NOPADDING);
            vl.setSpacing(false);
            botones.addComponent(vl);

            Button b;
            vl.addComponent(b = new Button(VaadinIcons.CLOSE));
            //b.setDescription("Reset all filters");
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addStyleName("boton");
            b.addStyleName("buttonlink");
            b.addClickListener(new Button.ClickListener() {
                @Override
                public void buttonClick(Button.ClickEvent clickEvent) {
                    try {
                        Object filters = modelType.newInstance();
                        listViewComponent.setModelForSearchFilters(filters);
                        listViewComponent.search(listViewComponent.getModelForSearchFilters());
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                }
            });



            if (mainFilterFields.size() < allFilterFields.size()) { // hay filtros que no son los principales

                r = FormLayoutBuilder.get().build(binder, modelType, binder.getBean(), new ArrayList<>(), FormLayoutBuilderParameters.builder().validators(validators).allFields(allFilterFields).forSearchFilters(true).forSearchFiltersExtended(true).build(), null);

                allFiltersComponent = r.getKey();


                vl.addComponent(b = new Button(VaadinIcons.FILTER));
                //b.setDescription("All filters. Click Ctrl + F to fire");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName("boton");
                b.addStyleName("buttonlink");
                b.addClickListener(new Button.ClickListener() {
                    @Override
                    public void buttonClick(Button.ClickEvent clickEvent) {
                        listViewComponent.setModelForSearchFilters(binder.getBean());
                        MDDUIAccessor.go(listViewComponent.getPathForFilters());
                    }
                });
                b.setClickShortcut(ShortcutAction.KeyCode.F, ShortcutAction.ModifierKey.CTRL);
            }

        } else {

            // por defecto creamos un filtro para buscar en cualquier columna de texto

            List<String> stringFieldNames = new ArrayList<>();

            ReflectionHelper.getAllFields(modelType).forEach(f -> {
                if (String.class.equals(f.getType())) stringFieldNames.add(f.getName());
            });

            if (stringFieldNames.size() > 0) {
                TextField f;
                botones.addComponent(f = new TextField("Text"));
                String ph = "";
                for (String s : stringFieldNames) {
                    if (!"".equals(ph)) ph += "/";
                    ph += s;
                }
                f.setPlaceholder(ph);
                binder.bind(f, "anytext");
            }

        }

        Button b;
        botones.addComponent(b = new Button(VaadinIcons.SEARCH));
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("buttonlink");
        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                try {
                    listViewComponent.search(binder.getBean());
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        });
        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        b.addStyleName("principal");
        b.addStyleName("botonsearch");
        //b.setStyleName(ValoTheme.BUTTON_PRIMARY);

        pl.addComponent(botones);


        log.debug("filters component built in " + (System.currentTimeMillis() - t0) + " ms.");
    }

    private List<FieldInterfaced> getAllFilterFields() {
        List<FieldInterfaced> allFields = listViewComponent.getFilterFields();
        return allFields;
    }


    public Component getFiltersViewComponent() {
        return allFiltersComponent;
    }
}
