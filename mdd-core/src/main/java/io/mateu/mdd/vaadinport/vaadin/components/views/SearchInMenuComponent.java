package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.Searcher;
import io.mateu.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public abstract class SearchInMenuComponent extends AbstractViewComponent {

    private final VerticalLayout resultsLayout = new VerticalLayout();
    private final Searcher searcher;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.SEARCH;
    }

    @Override
    public String toString() {
        return "Search in " + MDD.getApp().getName();
    }

    public SearchInMenuComponent(Searcher searcher) {
        this.searcher = searcher;
        try {
            build();
        } catch (Exception e) {
            MDD.alert(e);
        }
    }

    @Override
    public SearchInMenuComponent build() throws Exception {

        super.build();

        setSizeFull();

        if (getIcon() == null) hideHeader();
        else addStyleName("searchinmenucomponent");

        Layout marco = MDD.isMobile()?new CssLayout():new HorizontalLayout();
        if (!MDD.isMobile()) marco.setSizeFull();
        addComponentsAndExpand(marco);

        VerticalLayout form;
        marco.addComponent(form = new VerticalLayout());
        form.addStyleName(CSS.NOPADDING);
        form.setWidth("300px");

        boolean primero = true;
        for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(searcher.getClass())) {
            TextField t;
            form.addComponent(t = new TextField(Helper.capitalize(f.getName())));
            //t.setIcon(VaadinIcons.SEARCH);
            t.setPlaceholder("Type to search");
            t.setValueChangeTimeout(100);
            if (primero) {
                t.focus();
                primero = false;
            }

            t.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
                @Override
                public void valueChange(HasValue.ValueChangeEvent<String> e) {
                    search(f, e.getValue());
                }
            });
        }

        Panel contentContainer = new Panel();
        contentContainer.addStyleName(ValoTheme.PANEL_BORDERLESS);
        contentContainer.addStyleName("contentcontainer");
        contentContainer.addStyleName(CSS.NOPADDING);

        contentContainer.setContent(resultsLayout);
        resultsLayout.addStyleName(CSS.NOPADDING);

        marco.addComponent(contentContainer);
        if (!MDD.isMobile()) {
            contentContainer.setSizeFull();
            ((HorizontalLayout)marco).setExpandRatio(contentContainer, 1);
        }

        addComponentsAndExpand(marco);

        search(ReflectionHelper.getFieldByName(searcher.getClass(), "menu"), null);

        return this;
    }


    private void search(FieldInterfaced field, String text) {

        if (text == null) text = "";
        text = text.toLowerCase();

        resultsLayout.removeAllComponents();


        List<Found> found = new ArrayList<>();

        try {
            Method m = ReflectionHelper.getMethod(searcher.getClass(), ReflectionHelper.getGetter(field).replaceFirst("get", "findBy"));
            if (m != null) found = (List<Found>) m.invoke(searcher, text);
        } catch (Exception e) {
            MDD.alert(e);
        }


        VerticalLayout contenedor;
        resultsLayout.addComponent(contenedor = new VerticalLayout());
        contenedor.addStyleName("contenedor");
        contenedor.addStyleName(CSS.NOPADDING);

        if (found.size() == 0) {

            Label l;
            contenedor.addComponent(l = new Label("No match"));

            l.addStyleName(ValoTheme.LABEL_H3);

        } else {

            for (Found f : found) {

                HorizontalLayout hl;
                contenedor.addComponent(hl = new HorizontalLayout());
                hl.setDefaultComponentAlignment(Alignment.MIDDLE_LEFT);
                hl.addStyleName(CSS.NOPADDING);
                Button b;
                hl.addComponent(b = new Button(f.getName()));
                b.addClickListener(ev -> {
                    close();
                    MDDUI.get().getNavegador().goTo(f.getPath());
                });
                b.addStyleName(ValoTheme.BUTTON_LINK);

                Label l;
                hl.addComponent(l = new Label(f.getDescription()));
                //l.addStyleName(ValoTheme.la);

                b.addStyleName("submenuoption");
                //b.setIcon(testIcon.get());  // sin iconos en el menú

            }

        }
    }

    public abstract void close();

}
