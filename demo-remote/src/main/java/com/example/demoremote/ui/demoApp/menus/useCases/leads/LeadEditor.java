package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@Getter@Setter
public class LeadEditor implements PersistentPojo<String> {

    String id;

    String name;

    public LeadEditor() {
    }

    @Override
    public void load(String id) throws Throwable {
        setId(id);
        setName("North Sails");
    }

    @Override
    public void save() throws Throwable {

    }
}
