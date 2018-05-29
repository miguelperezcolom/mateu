package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Composite;
import com.vaadin.ui.CssLayout;

public class FiltersComponent extends CssLayout {

    private final ListViewComponent listViewComponent;

    public FiltersComponent(ListViewComponent listViewComponent) {

        this.listViewComponent = listViewComponent;

        Button b;
        addComponent(b = new Button("Search"));
        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                try {
                    listViewComponent.search();
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        });

    }
}
