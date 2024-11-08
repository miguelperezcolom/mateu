package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.Message;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@MateuUI("/cardscrudwithselectionlistener")
@Component@Scope("prototype")
public class SimpleCardsCrudWithSelectionListener extends SimpleCardsCrud {

    public SimpleCardsCrudWithSelectionListener(SimpleCrudService service) {
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
