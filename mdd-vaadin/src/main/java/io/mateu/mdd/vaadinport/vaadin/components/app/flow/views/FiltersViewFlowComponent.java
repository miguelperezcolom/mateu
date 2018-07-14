package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;

public class FiltersViewFlowComponent extends AbstractFlowComponent {

    private final ListViewComponent listViewComponent;
    private final String state;

    @Override
    public String getViewTile() {
        return "All filters for " + listViewComponent.getViewTitle();
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public FiltersViewFlowComponent(String state, ListViewComponent listViewComponent) {
        this.state = state;
        this.listViewComponent = listViewComponent;

        addStyleName("filtersflowcomponent");

        addComponent(listViewComponent.getFiltersViewComponent());

        Button b;
        addComponent(b = new Button(VaadinIcons.SEARCH));
        b.setDescription("Search");
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName("buttonlink");

        b.addClickListener(new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                MyUI.get().getNavegador().goBack();
            }
        });


    }

}
