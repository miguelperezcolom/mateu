package com.example.demo.domain.programmingLanguages;

import io.mateu.core.domain.uidefinition.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.core.domain.model.util.Serializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Service
public class LanguagesRepository {

  @Autowired@Ignored
  Serializer serializer;

  private final List<LanguageRow> all =
      new ArrayList<>(
          List.of(
              new LanguageRow(
                  "java",
                  "Java",
                  LanguageRow.LanguageTarget.Backend,
                  new Status(StatusType.SUCCESS, "Success")),
              new LanguageRow(
                  "js",
                  "Javascript",
                  LanguageRow.LanguageTarget.Frontend,
                  new Status(StatusType.DANGER, "Error")),
              new LanguageRow(
                  "c#",
                  "C#",
                  LanguageRow.LanguageTarget.Backend,
                  new Status(StatusType.SUCCESS, "Success")),
              new LanguageRow(
                  "c",
                  "C",
                  LanguageRow.LanguageTarget.Backend,
                  new Status(StatusType.WARNING, "Warning")),
              new LanguageRow(
                  "c++",
                  "C++",
                  LanguageRow.LanguageTarget.Backend,
                  new Status(StatusType.INFO, "Info"))));

  public Flux<LanguageRow> findAll() {
    return Flux.fromStream(all.stream());
  }

  public void save(LanguageForm form) throws Exception {
    LanguageRow language = serializer.fromJson(serializer.toJson(form), LanguageRow.class);
    if (all.contains(language)) {
      all.set(all.indexOf(language), language);
    } else {
      all.add(language);
    }
  }

  public LanguageRow findById(String id) {
    return all.stream().filter(r -> r.getId().equals(id)).findFirst().get();
  }

  public void removeAll(List<LanguageRow> selection) {
    all.removeAll(selection);
  }
}
