package org.example.application.ui.simpleUI;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.MainSearchFilter;
import io.mateu.util.persistence.JPAHelper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.domain.boundaries.common.entities.Person;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class PersonsRpcView implements RpcCrudView<org.example.application.ui.simpleUI.PersonsRpcView, org.example.application.ui.simpleUI.PersonsRpcView.Row, Person> {

    @MainSearchFilter
    private String name;

    @Override
    public Object deserializeId(String sid) {
        return Long.parseLong(sid);
    }

    @Override
    public boolean isAddEnabled() {
        return true;
    }

    @Override
    public List<Row> rpc(org.example.application.ui.simpleUI.PersonsRpcView filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return JPAHelper.findAll(Person.class).stream().map(p -> new Row("" + p.getId(), p.getName(), "xxx")).collect(Collectors.toList());
    }

    @Override
    public int gatherCount(org.example.application.ui.simpleUI.PersonsRpcView filters) throws Throwable {
        return JPAHelper.findAll(Person.class).size();
    }

    @Override
    public Object onEdit(Row row) throws Throwable {
        return JPAHelper.find(Person.class, Long.parseLong(row.getId()));
    }

    @Getter@Setter@AllArgsConstructor
    public class Row {
        private String id;
        private String name;
        private String email;

        @Override
        public String toString() {
            return id;
        }
    }


}