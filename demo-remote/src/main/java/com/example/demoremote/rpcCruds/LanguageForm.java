package com.example.demoremote.rpcCruds;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.reflection.ReflectionHelper;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import javax.persistence.Id;
import java.util.UUID;

@Service@Data@Scope("prototype")
public class LanguageForm implements PersistentPojo {

    @Autowired
    LanguagesRepository repo;

    @Id
    private String id = UUID.randomUUID().toString();

    private String name;

    private ProgrammingLanguages.Row.LanguageTarget target;

    @Override
    public void save() throws Throwable {
        repo.save(this);
    }

    @Override
    public void load(Object id) throws Throwable {
        ReflectionHelper.copy(repo.findById((String) id), this);
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
