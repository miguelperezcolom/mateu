package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.UI;
import org.springframework.stereotype.Service;

@Service
@UI("/users")
public class UsersPage extends AutoCrud<User> {

    final UserAdapter userAdapter;

    public UsersPage(UserAdapter userAdapter) {
        this.userAdapter = userAdapter;
    }

    @Override
    public io.mateu.uidl.interfaces.CrudRepository<User> repository() {
        return userAdapter.repository();
    }
}