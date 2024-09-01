package com.example.demo.infra.ircs.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.dtos.SortCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Slf4j
@Caption("Users")
public class UsersCrud implements Crud<UsersSearchForm, UserRow> {

    private final NewUserForm newUserForm;
    private final EditUserForm editUserForm;

    public UsersCrud(NewUserForm newUserForm, EditUserForm editUserForm) {
        this.newUserForm = newUserForm;
        this.editUserForm = editUserForm;
    }

    @Override
    public Flux<UserRow> fetchRows(UsersSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return Flux.just(
                new UserRow("Jay", "jay@oracle.com", new Status(StatusType.SUCCESS, "Admin")),
                new UserRow("Miguel", "miguel@oracle.com", new Status(StatusType.WARNING, "Operator")));
    }

    @Override
    public Mono<Long> fetchCount(UsersSearchForm filters) throws Throwable {
        return Mono.just(2L);
    }

    @Override
    public Object getNewRecordForm() throws Throwable {
        return newUserForm;
    }

    @Override
    public Object getDetail(UserRow userRow) throws Throwable {
        editUserForm.name = userRow.name();
        editUserForm.email = userRow.email();
        return editUserForm;
    }
}
