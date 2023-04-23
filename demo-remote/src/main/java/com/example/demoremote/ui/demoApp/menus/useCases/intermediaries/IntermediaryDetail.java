package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class IntermediaryDetail extends IntermediaryDetailDefinition implements ReadOnlyPojo<String> {


    @Override
    public void load(String id) throws Throwable {
        setId(id);
        setName("North Sails");
        this.getSalesAgents().setIntermediaryId(id);
    }

}
