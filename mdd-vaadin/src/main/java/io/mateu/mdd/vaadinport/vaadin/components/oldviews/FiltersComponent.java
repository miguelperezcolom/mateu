package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.core.data.MDDBinder;
import javafx.util.Pair;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FiltersComponent extends CssLayout {

    private final ListViewComponent listViewComponent;
    private final Class modelType;
    private final Object model;

    private MDDBinder binder;

    private Component allFiltersComponent;

    public MDDBinder getBinder() {
        return binder;
    }

    public FiltersComponent(ListViewComponent listViewComponent) throws IllegalAccessException, InstantiationException {

        this.listViewComponent = listViewComponent;

        this.modelType = listViewComponent.getModelTypeForSearchFilters();

        this.model= listViewComponent.getModelForSearchFilters();

        build();
    }

    private void build() {


        addStyleName("filterscomponent");


        binder = new MDDBinder(modelType);
        //binder = new Binder(modelType, true);
        //binder.setBean(entities);

        Map<HasValue, List<Validator>> validators = new HashMap<>();


        List<FieldInterfaced> allFilterFields = getAllFilterFields();


        if (allFilterFields.size() > 0) {

            List<FieldInterfaced> mainFilterFields = allFilterFields.stream().filter(f -> f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList());
            if (mainFilterFields.size() == 0) {
                if (allFilterFields.size() > 2) mainFilterFields = allFilterFields.subList(0, (allFilterFields.size() > 1)?2:allFilterFields.size());
                else mainFilterFields = allFilterFields;
            }

            Pair<Component, AbstractStylist> r = FormLayoutBuilder.build(this, binder, modelType, model, validators, mainFilterFields, false);

            if (mainFilterFields.size() < allFilterFields.size()) { // hay filtros que no son los

                r = FormLayoutBuilder.build(binder, modelType, model, validators, allFilterFields);

                allFiltersComponent = r.getKey();


                Button b;
                addComponent(b = new Button(VaadinIcons.FILTER));
                b.setDescription("All filters. Click Ctrl + F to fire");
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addStyleName("buttonlink");
                b.addClickListener(new Button.ClickListener() {
                    @Override
                    public void buttonClick(Button.ClickEvent clickEvent) {
                        MyUI.get().getNavegador().go(listViewComponent.getPathForFilters());
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
                addComponent(f = new TextField("Text"));
                String ph = "";
                for (String s : stringFieldNames) {
                    if (!"".equals(ph)) ph += "/";
                    ph += s;
                }
                f.setPlaceholder(ph);
                binder.bindString(f, "anytext");
            }

        }

        Button b;
        addComponent(b = new Button(VaadinIcons.SEARCH));
        b.setDescription("Search. Click ENTER to fire");
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("buttonlink");
        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                try {
                    listViewComponent.search(model);
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        });
        b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
        b.setStyleName(ValoTheme.BUTTON_PRIMARY);

    }

    private List<FieldInterfaced> getAllFilterFields() {
        List<FieldInterfaced> allFields = JPAListViewComponent.getSelectFields(modelType);

        /*
        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).filter(f -> RpcView.class.isAssignableFrom(modelType) || f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList());


        if (allFields.size() == 0) {
            //todo: considerar crear al menos un filtro para todos los campos de tipo string
        }
        */

        return allFields;
    }


    public Component getFiltersViewComponent() {
        return allFiltersComponent;
    }
}
