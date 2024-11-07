package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.core.data.ResultType;
import io.mateu.uidl.core.interfaces.Message;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@MateuUI("/crudwithactiononselectedrow")
@Component@Scope("prototype")
public class SimpleCrudWithActionOnSelectedRow extends SimpleCrud {

    public SimpleCrudWithActionOnSelectedRow(SimpleCrudService service) {
        super(service);
    }

    @Action(rowsSelectedRequired = true)
    public Object actionOnSelectedRow(Row row) throws Throwable {
        return new Message(ResultType.Success, "row received", "" + row, 5000);
    }

    @Action
    public Object selectionNotRequired(Row row) throws Throwable {
        return new Message(ResultType.Success, "row received", "" + row, 5000);
    }

}
