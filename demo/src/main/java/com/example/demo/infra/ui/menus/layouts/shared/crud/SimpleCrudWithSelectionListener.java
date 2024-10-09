package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import io.mateu.dtos.ResultType;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;

@MateuUI("/crudwithselectionlistener")
@Component@Scope("prototype")
public class SimpleCrudWithSelectionListener extends SimpleCrud {

    public SimpleCrudWithSelectionListener(SimpleCrudService service) {
        super(service);
    }

    @Action(rowsSelectedRequired = true)
    public Object actionOnRow(Row row) throws Throwable {
        return new Message(ResultType.Success, "row received", "" + row, 5000);
    }


    @Override
    public Object onRowSelected(Row row) throws Throwable {
        return new Message(ResultType.Success, "row selected", "" + row, 5000);
    }
}
