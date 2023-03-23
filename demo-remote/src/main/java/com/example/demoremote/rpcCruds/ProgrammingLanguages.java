package com.example.demoremote.rpcCruds;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.app.ColumnAction;
import io.mateu.mdd.core.app.ColumnActionGroup;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.annotations.Placeholder;
import io.mateu.mdd.shared.annotations.Width;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Caption("Some programming languages")
@Getter@Setter
@Service
public class ProgrammingLanguages implements RpcCrudView<ProgrammingLanguages, ProgrammingLanguages.Row, ProgrammingLanguages.Row>, HasTitle, HasSubtitle {

    @Autowired
    private LanguagesRepository repo;

    @Autowired
    private LanguageForm form;

    @Autowired
    private LanguageDetail detail;


    @Placeholder("here the language name")
    private String name;

    private Row.LanguageTarget target;

    @Override
    public List<Row> rpc(ProgrammingLanguages filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
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
    public int gatherCount(ProgrammingLanguages filters) throws Throwable {
        return (int) repo.findAll().stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
                .filter(p -> filters.getTarget() == null
                        || filters.getTarget().equals(p.getTarget()))
                .count();
    }

    @Override
    public void delete(Set<Row> selection) throws Throwable {
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

    @Getter@Setter@NoArgsConstructor@EqualsAndHashCode(of = "id")
    public static class Row {

        @Ignored
        private String id;

        private String name;

        @Width("80px")
        private LanguageTarget target;

        @Width("90px")
        private Status status = new Status(StatusType.INFO, "New record");

        public enum LanguageTarget {
            Backend, Frontend
        }

        public Row(String id, String name, LanguageTarget target, Status status) {
            this.id = id;
            this.name = name;
            this.target = target;
            this.status = status;
        }

        private ColumnActionGroup actions;

        public ColumnActionGroup getActions() {
            if (status != null && StatusType.INFO.equals(status.getType())) {
                return new ColumnActionGroup(new ColumnAction[]{
                        new ColumnAction("unblockRow", "Unblock", null),
                        new ColumnAction("deleteRow", "Delete", null)
                });
            }
            return new ColumnActionGroup(new ColumnAction[]{
                    new ColumnAction("blockRow", "Block", null)
            });
        }
    }

    @Override
    public Object onNew() throws Throwable {
        return form;
    }

    @Override
    public Object onEdit(Row row) throws Throwable {
        detail.load(row.getId());
        return detail;
    }

    public void unblockRow(Row row) {
        System.out.println("unblocking " + row);
    }

    public void blockRow(Row row) {
        System.out.println("blocking " + row);
    }

    public void deleteRow(Row row) {
        System.out.println("deleting " + row);
    }
}
