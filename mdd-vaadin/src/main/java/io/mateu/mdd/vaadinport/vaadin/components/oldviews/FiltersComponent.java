package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Pair;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        Layout l = (MDD.isMobile())?new VerticalLayout():new CssLayout();
        setCompositionRoot(l);
        l.addStyleName(CSS.NOPADDING);

        addStyleName("filterscomponent");


        binder = new MDDBinder(modelType);
        try {
            binder.setBean(listViewComponent.getModelForSearchFilters());
        } catch (Exception e) {
            MDD.alert(e);
        }
        binder.addValueChangeListener(e -> listViewComponent.setModelForSearchFilters(binder.getBean()));

        Map<HasValue, List<Validator>> validators = new HashMap<>();


        List<FieldInterfaced> allFilterFields = getAllFilterFields();

        HorizontalLayout botones = new HorizontalLayout();

        if (!MDD.isMobile() && allFilterFields.size() > 0) {
            botones.addStyleName("botonerafiltros");
            botones.setSpacing(false);
        }


        if (allFilterFields.size() > 0) {

            List<FieldInterfaced> mainFilterFields = allFilterFields.stream().filter(f -> f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList());
            if (mainFilterFields.size() == 0) {
                if (allFilterFields.size() > 1) mainFilterFields = allFilterFields.subList(0, (allFilterFields.size() > 2)?2:allFilterFields.size());
                else mainFilterFields = allFilterFields;
            }

            Pair<Component, AbstractStylist> r = FormLayoutBuilder.get().build(l, binder, modelType, binder.getBean(), validators, mainFilterFields, false, true, false);


            Button b;
            botones.addComponent(b = new Button(VaadinIcons.CLOSE));
            //b.setDescription("Reset all filters");
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addStyleName("buttonlink");
            b.addClickListener(new Button.ClickListener() {
                @Override
                public void buttonClick(Button.ClickEvent clickEvent) {
                    try {
                        Object filters = modelType.newInstance();
                        listViewComponent.setModelForSearchFilters(filters);
                        listViewComponent.search(listViewComponent.getModelForSearchFilters());
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            });



            if (mainFilterFields.size() < allFilterFields.size()) { // hay filtros que no son los

                r = FormLayoutBuilder.get().build(binder, modelType, binder.getBean(), validators, allFilterFields, true);

                allFiltersComponent = r.getKey();


                botones.addComponent(b = new Button(VaadinIcons.FILTER));
                //b.setDescription("All filters. Click Ctrl + F to fire");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName("buttonlink");
                b.addClickListener(new Button.ClickListener() {
                    @Override
                    public void buttonClick(Button.ClickEvent clickEvent) {
                        listViewComponent.setModelForSearchFilters(binder.getBean());
                        MDDUI.get().getNavegador().go(listViewComponent.getPathForFilters());
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
        //b.setDescription("Search. Click ENTER to fire");
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("buttonlink");
        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                try {
                    listViewComponent.setModelForSearchFilters(binder.getBean());
                    listViewComponent.search(binder.getBean());
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        });
        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        b.addStyleName("principal");
        //b.setStyleName(ValoTheme.BUTTON_PRIMARY);

        l.addComponent(botones);


        System.out.println("filters component built in " + (System.currentTimeMillis() - t0) + " ms.");
    }

    private List<FieldInterfaced> getAllFilterFields() {
        List<FieldInterfaced> allFields = listViewComponent.getFilterFields();

        /*
        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).filter(f -> RpcView.class.isAssignableFrom(modelType) || f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList());


        if (allFields.size() == 0) {
            //todo: considerar crear al menos un filtro para todos los campos de tipo string
        }
        */

        //todo: acabar el tema de los filtros
        return allFields;
    }


    public Component getFiltersViewComponent() {
        return allFiltersComponent;
    }
}
