package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.BaseMDDApp;

import java.util.List;

public class ERPapp extends BaseMDDApp {
    @Override
    public String getName() {
        return "ERP";
    }

    @Override
    public List<AbstractArea> buildAreas() {
        return List.of(new AreaReservas(), new AreaConfiguracion());
    }
}
