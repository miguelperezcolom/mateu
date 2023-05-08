package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;

@Service
@Scope("prototype")
public class LeadsDetail extends LeadDetailDefinition implements ReadOnlyPojo<String> {

    @Autowired@JsonIgnore
    LeadEditor editor;


    public LeadsDetail() throws MalformedURLException {
        super();
    }

    @Override
    public void load(String id) throws Throwable {
        setId(id);
        setName("North Sails");
    }

    @Override
    public LeadEditor getEditor() throws Throwable {
        editor.load(getId());
        return editor;
    }
}
