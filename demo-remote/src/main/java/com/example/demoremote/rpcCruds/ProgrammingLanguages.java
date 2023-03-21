package com.example.demoremote.rpcCruds;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Caption("Some programming languages")
@Getter@Setter
@Service
public class ProgrammingLanguages implements RpcCrudView<ProgrammingLanguages, ProgrammingLanguages.Row, ProgrammingLanguages.Row> {

    @Autowired
    private LanguagesRepository repo;

    @Autowired
    private LanguageForm form;

    @Autowired
    private LanguageDetail detail;


    private String name;

    @Override
    public List<Row> rpc(ProgrammingLanguages filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return repo.findAll().stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public int gatherCount(ProgrammingLanguages filters) throws Throwable {
        return (int) repo.findAll().stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase())).count();
    }

    @Override
    public void delete(Set<Row> selection) throws Throwable {
        repo.findAll().removeAll(selection);
    }

    @Getter@Setter@NoArgsConstructor@EqualsAndHashCode(of = "id")
    public static class Row {

        @Ignored
        private String id;

        private String name;

        private String target;

        private Status status = new Status(StatusType.INFO, "New record");

        public Row(String id, String name, String target, Status status) {
            this.id = id;
            this.name = name;
            this.target = target;
            this.status = status;
        }

        private ColumnActionGroup actions = new ColumnActionGroup(new ColumnAction[]{
                new ColumnAction("Block"),
                new ColumnAction("Delete")

        });

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
}
