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
public class LanguageDetail extends LanguageDetailDefinition implements ReadOnlyPojo {

    @Autowired
    LanguagesRepository repo;

    @Autowired
    LanguageForm form;

    @Override
    public void load(Object id) throws Throwable {
        ReflectionHelper.copy(repo.findById((String) id), this);
    }

    @Override
    public Object getEditor() throws Throwable {
        form.load(getId());
        return form;
    }

    @Override
    public String toString() {
        return getName() != null?getName():"New Language";
    }
}
