package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.MateuUI;
import io.mateu.showcase.app.complexUI.AcademicArea;
import io.mateu.showcase.app.complexUI.FinancialArea;
import org.example.domain.boundaries.common.entities.Person;

@MateuMDDUI(path = "/complex")
public class ComplexUI extends MateuUI {

    @Private
    @Area
    AcademicArea academics;

    @Private
    @Area
    FinancialArea financials;

    @PrivateHome
    String eyesOnlyMsg = "Hello Mateu";

    @PublicHome
    String msg = "Hello world";

}
