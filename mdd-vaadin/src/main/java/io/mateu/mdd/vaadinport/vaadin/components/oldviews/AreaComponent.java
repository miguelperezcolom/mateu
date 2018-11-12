package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.app.AbstractArea;

public class AreaComponent extends AbstractViewComponent {

    private final AbstractArea area;

    public AreaComponent(AbstractArea area) {

        this.area = area;

    }

    @Override
    public AreaComponent build() throws IllegalAccessException, InstantiationException {

        super.build();


        addStyleName("areacomponent");


        return this;
    }

}
