package org.example.application.ui;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Area;
import io.mateu.mdd.shared.annotations.PrivateHome;
import io.mateu.mdd.shared.annotations.PublicHome;
import org.example.application.ui.complexUI.AcademicArea;
import org.example.application.ui.complexUI.FinancialArea;
import org.example.application.ui.complexUI.MaintenanceArea;

@MateuUI(path = "/complex")
public class ComplexUI {

    @Area
    AcademicArea academics;

    @Area
    FinancialArea financials;

    @Area
    MaintenanceArea maintenance;

    @PrivateHome
    String eyesOnlyMsg = "<h1>Hello, Mateu!</h1>";

    @PublicHome
    String msg = "<h1>Hello, World!</h1>";

}
