package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Message;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MateuUI;
import io.mateu.dtos.ResultType;
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
