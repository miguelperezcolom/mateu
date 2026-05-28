package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudOrchestrator;
import io.mateu.uidl.annotations.UI;
import org.springframework.stereotype.Service;

@Service
@UI("/users")
public class UsersPage extends AutoCrudOrchestrator<User> {

    final UserAdapter userAdapter;

    public UsersPage(UserAdapter userAdapter) {
        this.userAdapter = userAdapter;
    }

    @Override
    public AutoCrudAdapter<User> simpleAdapter() {
        return userAdapter;
    }
}