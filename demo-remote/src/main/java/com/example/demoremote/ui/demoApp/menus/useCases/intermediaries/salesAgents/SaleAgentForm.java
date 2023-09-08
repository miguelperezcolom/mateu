package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class SaleAgentForm extends SaleAgentFormDefinition implements PersistentPojo<String> {


    @Override
    public void load(String id) throws Throwable {
        setId(id);
        setName("Michael Jordan");
    }

    @Override
    public Object retrieveId() {
        return getId();
    }


    @Override
    public void save() throws Throwable {

    }

    @Override
    public String toString() {
        return name;
    }
}
