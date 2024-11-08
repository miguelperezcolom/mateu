package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;

@MateuUI("/crudwithactiononrows")
@Component@Scope("prototype")
public class SimpleCrudWithActionOnSelectedRows extends SimpleCrud {

    public SimpleCrudWithActionOnSelectedRows(SimpleCrudService service) {
        super(service);
    }

    @Action(target = ActionTarget.Message)
    public String actionOnRows(List<Row> selection) {
        if (selection == null) {
            return "selection is null";
        }
        return "" + selection.size() + " rows selected";
    }

}
