package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Ignored;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class SaleAgentDetail extends SaleAgentDetailDefinition implements ReadOnlyPojo<String> {

    @Ignored@JsonIgnore@Autowired
    SaleAgentForm form;


    @Override
    public void load(String id) throws Throwable {
        setId(id);
        setName("Michael Jordan");
        this.getPasswordResets().setSalesAgentId(id);
    }

    @Override
    public Object retrieveId() {
        return getId();
    }

    @Override
    public Object retrieveEditor() throws Throwable {
        form.load(getId());
        return form;
    }
}
