package com.example.demoremote.domains.programmingLanguages;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Placeholder;
import io.mateu.mdd.shared.data.DatesRange;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Caption("Some programming languages")
@Getter@Setter
@Service
public class ProgrammingLanguages implements Crud<ProgrammingLanguages, LanguageRow>,
        HasTitle, HasSubtitle,
        CanDelete<LanguageRow>, CanAdd, CanEdit<LanguageRow> {

    @Autowired
    private LanguagesRepository repo;

    @Autowired
    private LanguageForm form;

    @Autowired
    private LanguageDetail detail;

    @Autowired
    ApplicationContext context;


    @Placeholder("here the language name")
    private String name;

    private LanguageRow.LanguageTarget target;

    private boolean jvm;

    private DatesRange born;

    @Override
    public List<LanguageRow> fetchRows(ProgrammingLanguages filters, List<SortCriteria> sortOrders, int offset, int limit)
            throws Throwable {
        Thread.sleep(500);
        RowComparator comparator = new RowComparator(sortOrders);
        return repo.findAll().stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
                .filter(p -> filters.getTarget() == null
                        || filters.getTarget().equals(p.getTarget()))
                .sorted(comparator)
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public int fetchCount(ProgrammingLanguages filters) throws Throwable {
        return (int) repo.findAll().stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
                .filter(p -> filters.getTarget() == null
                        || filters.getTarget().equals(p.getTarget()))
                .count();
    }

    @Override
    public void delete(Set<LanguageRow> selection) throws Throwable {
        repo.findAll().removeAll(selection);
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

    public void unblockRow(LanguageRow row) {
        System.out.println("unblocking " + row);
    }

    public void blockRow(LanguageRow row) {
        System.out.println("blocking " + row);
    }

    public void deleteRow(LanguageRow row) {
        System.out.println("deleting " + row);
    }
}
