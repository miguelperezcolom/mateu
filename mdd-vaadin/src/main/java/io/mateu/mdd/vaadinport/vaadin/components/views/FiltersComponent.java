package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.Stylist;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.VoidStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.data.ChangeNotificationListener;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FiltersComponent extends CssLayout {

    private final ListViewComponent listViewComponent;
    private final Class modelType;
    private final Object model;

    private MDDBinder binder;

    private AbstractStylist stylist;


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

        CssLayout contentContainer = new CssLayout();
        contentContainer.addStyleName("contentcontainer");

        Map<HasValue, List<Validator>> validators = new HashMap<>();

        stylist = new VoidStylist();

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

        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        stylist.setUp(allFields);

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();

        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        //todo: contemplar caso varias anttaciones @SearchFilter para un mismo campo

        for (FieldInterfaced f : allFields) if (f.isAnnotationPresent(SearchFilter.class)) {

            if (f.isAnnotationPresent(GeneratedValue.class) || f.isAnnotationPresent(Output.class)) {
                ofb.build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
            } else {
                for (JPAFieldBuilder fieldBuilder : JPAFieldBuilder.builders) if (fieldBuilder.isSupported(f)) fieldBuilder.build(f, model, contentContainer, binder, validators, stylist, allFieldContainers);
            }

        }

        binder.setBean(model);

        AbstractStylist finalStylist = stylist;
        binder.addChangeNotificationListener(new ChangeNotificationListener() {
            @Override
            public void somethingChanged() {
                JPAFieldBuilder.applyStyles(allFieldContainers, finalStylist.process(binder.getBean()));
            }
        });

        JPAFieldBuilder.applyStyles(allFieldContainers, stylist.process(binder.getBean()));


        addComponent(contentContainer);









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
}
