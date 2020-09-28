package io.mateu.mdd.vaadin.components.views;

import io.mateu.mdd.core.app.AbstractArea;

public class AreaComponent extends AbstractViewComponent {

    private final AbstractArea area;

    public AreaComponent(AbstractArea area) {

        this.area = area;

    }

    @Override
    public AreaComponent build() throws Exception {

        super.build();


        addStyleName("areacomponent");


        return this;
    }

}
