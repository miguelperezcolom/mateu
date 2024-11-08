package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.data.ResultType;
import io.mateu.uidl.interfaces.Message;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@MateuUI("/cardscrudwithactiononselectedrow")
@Component@Scope("prototype")
public class SimpleCardsCrudWithActionOnSelectedRow extends SimpleCardsCrud {

    public SimpleCardsCrudWithActionOnSelectedRow(SimpleCrudService service) {
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
