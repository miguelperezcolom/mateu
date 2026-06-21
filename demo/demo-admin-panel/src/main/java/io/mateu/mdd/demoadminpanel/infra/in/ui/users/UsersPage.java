package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Service;

@Service
@UI("/users")
public class UsersPage extends AutoCrud<User> {

    final UserRepository userRepository;

    public UsersPage(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public CrudRepository<User> repository() {
        return userRepository;
    }
}
