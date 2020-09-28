package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.mdd.shared.annotations.Area;
import io.mateu.mdd.shared.annotations.PrivateHome;
import io.mateu.mdd.shared.annotations.PublicHome;
import io.mateu.showcase.app.complexUI.AcademicArea;
import io.mateu.showcase.app.complexUI.FinancialArea;
import io.mateu.showcase.app.complexUI.MaintenanceArea;

@MateuUI(path = "/complex")
public class ComplexUI extends MateuApp {

    @Area
    AcademicArea academics;

    @Area
    FinancialArea financials;

    @Area
    MaintenanceArea maintenance;

    @PrivateHome
    String eyesOnlyMsg = "Hello Mateu";

    @PublicHome
    String msg = "Hello world";

}
