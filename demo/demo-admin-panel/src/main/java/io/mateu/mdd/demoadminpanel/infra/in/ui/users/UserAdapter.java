package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class UserAdapter extends AutoCrudAdapter<User> {

    final UserRepository userRepository;

    public UserAdapter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public CrudRepository<User> repository() {
        return userRepository;
    }
}