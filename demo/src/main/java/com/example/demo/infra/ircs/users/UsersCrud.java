package com.example.demo.infra.ircs.users;

import com.example.demo.infra.ircs.services.ServiceRow;
import com.example.demo.infra.ircs.services.ServicesSearchForm;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.dtos.SortCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
    public Mono<Page<UserRow>> fetchRows(
            String searchText, UsersSearchForm filters, Pageable pageable) {
        var items = List.of(
                new UserRow("Jay", "jay@oracle.com", new Status(StatusType.SUCCESS, "Admin")),
                new UserRow("Miguel", "miguel@oracle.com", new Status(StatusType.WARNING, "Operator"))
        );
        return Mono.just(new PageImpl<>(items, pageable, items.size()));
    }

    @Override
    public Object getNewRecordForm() {
        return newUserForm;
    }

    @Override
    public Object getDetail(UserRow userRow) {
        editUserForm.name = userRow.name();
        editUserForm.email = userRow.email();
        return editUserForm;
    }
}
