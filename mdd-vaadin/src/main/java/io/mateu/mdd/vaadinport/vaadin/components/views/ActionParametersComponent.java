package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.CssLayout;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;
import javafx.util.Pair;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ActionParametersComponent extends CssLayout {

    private final ListViewComponent listViewComponent;
    private final Class modelType;
    private final Object model;

    private MDDBinder binder;

    private Component allFiltersComponent;


    public ActionParametersComponent(ListViewComponent listViewComponent) throws IllegalAccessException, InstantiationException {

        this.listViewComponent = listViewComponent;

        this.modelType = listViewComponent.getModelTypeForSearchFilters();

        this.model= listViewComponent.getModelForSearchFilters();

        build();
    }

    private void build() {


        addStyleName("filterscomponent");


        binder = new MDDBinder(modelType);
        //binder = new Binder(modelType, true);

        Map<HasValue, List<Validator>> validators = new HashMap<>();


        List<FieldInterfaced> allFilterFields = getAllFilterFields();


        if (allFilterFields.size() > 0) {

            Pair<Component, AbstractStylist> r = FormLayoutBuilder.build(binder, modelType, model, validators, allFilterFields.stream().filter(f -> f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList()));

            addComponent(r.getKey());

            r = FormLayoutBuilder.build(binder, modelType, model, validators, allFilterFields);

            allFiltersComponent = r.getKey();

            Button b;
            addComponent(b = new Button("All filters", VaadinIcons.FILTER));
            b.addClickListener(new Button.ClickListener() {
                @Override
                public void buttonClick(Button.ClickEvent clickEvent) {
                    MyUI.get().getNavegador().go(listViewComponent.getPathForFilters());
                }
            });

        }

        Button b;
        addComponent(b = new Button("Search", VaadinIcons.SEARCH));
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


    }

    private List<FieldInterfaced> getAllFilterFields() {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).filter(f -> f.isAnnotationPresent(SearchFilter.class) || f.isAnnotationPresent(MainSearchFilter.class)).collect(Collectors.toList());


        if (allFields.size() == 0) {
            //todo: considerar crear al menos un filtro para todos los campos de tipo string
        }

        return allFields;
    }

    public Component getAllFiltersComponent() {
        return allFiltersComponent;
    }

    public Component getFiltersViewComponent() {
        return allFiltersComponent;
    }
}
