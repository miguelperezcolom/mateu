package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Strings;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasSubtitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Placeholder;
import io.mateu.core.domain.uidefinition.shared.data.DatesRange;
import io.mateu.core.domain.uidefinition.shared.interfaces.SortCriteria;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Caption("Some programming languages")
@Getter
@Setter
@Service
@Scope("prototype")
public class ProgrammingLanguages
    implements Crud<ProgrammingLanguages, LanguageRow>, HasTitle, HasSubtitle {

  @JsonIgnore
  @Autowired private LanguagesRepository repo;

  @Autowired private LanguageForm form;

  @Autowired private LanguageDetail detail;

  @JsonIgnore
  @Autowired ApplicationContext context;

  @Placeholder("here the language name")
  private String name;

  private LanguageRow.LanguageTarget target;

  private boolean jvm;

  private DatesRange born;

  @Override
  public Flux<LanguageRow> fetchRows(
      ProgrammingLanguages filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable {
    Thread.sleep(500);
    RowComparator comparator = new RowComparator(sortOrders);
    return repo.findAll()
        .filter(
            p ->
                Strings.isNullOrEmpty(filters.getName())
                    || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
        .filter(p -> filters.getTarget() == null || filters.getTarget().equals(p.getTarget()))
        .sort(comparator)
        .skip(offset)
        .take(limit);
  }

  @Override
  public Mono<Long> fetchCount(ProgrammingLanguages filters) throws Throwable {
    return repo.findAll()
        .filter(
            p ->
                Strings.isNullOrEmpty(filters.getName())
                    || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
        .filter(p -> filters.getTarget() == null || filters.getTarget().equals(p.getTarget()))
        .count();
  }

  @Override
  public void delete(List<LanguageRow> selection) throws Throwable {
    repo.removeAll(selection);
  }

  @Override
  public String getSubtitle() {
    return "This is the subtitle";
  }

  @Override
  public String getTitle() {
    return "Programming languages";
  }

  @Override
  public LanguageForm getNewRecordForm() throws Throwable {
    return context.getBean(LanguageForm.class);
  }

  @Override
  public LanguageDetail getDetail(LanguageRow row) throws Throwable {
    detail.load(row.getId());
    return detail;
  }

  @Action("Do something great, please")
  public void doSomething() {
    System.out.println("Hola!!!!" + getSelection().size() + "...." + getSelection());
  }

  @Action()
  @Caption("Do something again, please")
  public void doSomethingAgain() {
    System.out.println("Hola!!!!" + getSelection().size() + "...." + getSelection());
  }

  public void unblockRow(LanguageRow row) {
    System.out.println("unblocking " + row);
  }

  public void blockRow(LanguageRow row) {
    System.out.println("blocking " + row);
  }

  public void deleteRow(LanguageRow row) {
    System.out.println("deleting " + row);
  }

  @Override
  public String getCaptionForNew() {
    return "Add new language";
  }

  @Override
  public String getCaptionForDelete() {
    return "Remove selected";
  }

  @Override
  public String getCaptionForEdit() {
    return "View details";
  }
}
