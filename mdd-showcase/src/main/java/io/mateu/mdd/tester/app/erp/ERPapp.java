package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.annotations.MateuMDDApp;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.View;

import java.util.List;

@MateuMDDApp(path = "/erp")
public class ERPapp extends SimpleMDDApplication {
    @Override
    public String getName() {
        return "ERP";
    }

    @Override
    public void addPrivateAreas(List<AbstractArea> l) {
        l.add(new AreaReservas());
        l.add(new AreaConfiguracion());
    }

    @Override
    public AbstractAction getDefaultAction() { // incompatible con varias áreas
        return new MDDOpenCustomComponentAction("Home", HomeView.class);
    }

    @Override
    public View getPublicHome() {
        return new PrivateHomeView();
    }
}
