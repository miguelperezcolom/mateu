package com.example.demo.domain.programmingLanguages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Strings;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasSubtitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Placeholder;
import io.mateu.core.domain.uidefinition.shared.data.DatesRange;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.dtos.SortCriteria;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
  public Mono<Page<LanguageRow>> fetchRows(
          String searchText, ProgrammingLanguages filters, Pageable pageable) {
    RowComparator comparator = new RowComparator(pageable.getSort());
    return repo.findAll()
            .filter(
                    p ->
                            Strings.isNullOrEmpty(filters.getName())
                                    || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
            .filter(p -> filters.getTarget() == null || filters.getTarget().equals(p.getTarget()))
            .sort(comparator)
            .skip(pageable.getOffset())
            .take(pageable.toLimit().max())
            .collectList().map(filtered -> new PageImpl<>(filtered, pageable, filtered.size()));
  }

  @Override
  public void delete(List<LanguageRow> selection) {
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
  public LanguageForm getNewRecordForm() {
    return context.getBean(LanguageForm.class);
  }

  @Override
  public LanguageDetail getDetail(LanguageRow row) throws Throwable {
    detail.load(row.getId());
    return detail;
  }

  @Action("Do something great, please")
  public void doSomething(List<LanguageRow> selection) {
    System.out.println("Hola!!!!" + selection.size() + "...." + selection);
  }

  @Action()
  @Caption("Do something again, please")
  public void doSomethingAgain(List<LanguageRow> selection) {
    System.out.println("Hola!!!!" + selection.size() + "...." + selection);
  }

  @Action()
  public void resetList() {
    repo.reset();
  }

  public void unblockRow(LanguageRow row) {
    repo.findById((String) row.getId()).setStatus(new Status(StatusType.SUCCESS, "Unblocked"));
  }

  public void blockRow(LanguageRow row) {
    repo.findById((String) row.getId()).setStatus(new Status(StatusType.DANGER, "Blocked"));
  }

  public void deleteRow(LanguageRow row) {
    repo.removeAll(List.of(row));
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
