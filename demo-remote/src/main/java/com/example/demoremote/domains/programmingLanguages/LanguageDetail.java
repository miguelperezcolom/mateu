package com.example.demoremote.domains.programmingLanguages;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.reflection.ReflectionHelper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import jakarta.persistence.Id;

@Service@Data@Scope("prototype")
public class LanguageDetail implements ReadOnlyPojo {

    @Autowired
    LanguagesRepository repo;

    @Autowired
    LanguageForm form;

    @Id
    @Ignored
    private String id;

    private String name;

    private LanguageRow.LanguageTarget target;

    @Override
    public void load(Object id) throws Throwable {
        ReflectionHelper.copy(repo.findById((String) id), this);
    }

    @Override
    public Object getEditor() throws Throwable {
        form.load(id);
        return form;
    }

    @Override
    public Object getId() {
        return id;
    }

    @Override
    public String toString() {
        return name != null?name:"New Language";
    }
}