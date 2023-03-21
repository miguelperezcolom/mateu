package com.example.demoremote.rpcCruds;

import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class LanguagesRepository {

    private final List<ProgrammingLanguages.Row> all = new ArrayList<>(List.of(
            new ProgrammingLanguages.Row("java", "Java", "Backend", new Status(StatusType.SUCCESS, "Success")),
            new ProgrammingLanguages.Row("js", "Javascript", "Frontend", new Status(StatusType.DANGER, "Error")),
            new ProgrammingLanguages.Row("c#", "C#", "Backend", new Status(StatusType.SUCCESS, "Success")),
            new ProgrammingLanguages.Row("c", "C", "Backend", new Status(StatusType.WARNING, "Warning")),
            new ProgrammingLanguages.Row("c++", "C++", "Backend", new Status(StatusType.INFO, "Info"))
    ));


    public Collection<ProgrammingLanguages.Row> findAll() {
        return all;
    }

    public void save(LanguageForm form) throws IOException {
        ProgrammingLanguages.Row language = Helper.fromJson(Helper.toJson(form), ProgrammingLanguages.Row.class);
        if (all.contains(language)) {
            all.set(all.indexOf(language), language);
        } else {
            all.add(language);
        }
    }

    public ProgrammingLanguages.Row findById(String id) {
        return all.stream().filter(r -> r.getId().equals(id)).findFirst().get();
    }
}
