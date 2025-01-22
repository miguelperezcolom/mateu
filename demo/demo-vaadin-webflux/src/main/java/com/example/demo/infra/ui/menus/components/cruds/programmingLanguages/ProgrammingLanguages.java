package com.example.demo.infra.ui.menus.components.cruds.programmingLanguages;

import com.google.common.base.Strings;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.ConsumesHash;
import io.mateu.uidl.interfaces.Crud;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Placeholder;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Title("Some programming languages")
@Getter
@Setter
@Service
@Scope("prototype")
@RequiredArgsConstructor
public class ProgrammingLanguages
    implements Crud<ProgrammingLanguages, LanguageRow>, HasTitle, HasSubtitle, ConsumesHash {

  private final LanguagesRepository repo;

  private final LanguageForm form;

  private final LanguageDetail detail;

  private final ApplicationContext context;

  @Placeholder("here the language name")
  private String name;

  private LanguageRow.LanguageTarget target;

  private boolean jvm;

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
  @Label("Do something again, please")
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

  @Override
  public Object consume(String hash, ServerHttpRequest serverHttpRequest) {
    detail.load(hash);
    return detail;
  }
}
