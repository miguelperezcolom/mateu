package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
@Getter@Setter
public class IntermediaryEditor implements PersistentPojo<String> {

    String id;

    String name;

    public IntermediaryEditor() {
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
