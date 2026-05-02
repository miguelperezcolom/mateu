package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NestedCrudAdapter extends AutoCrudAdapter<Level1View> {

    final Level1ViewRepository repo;

    @Override
    public CrudRepository<Level1View> repository() {
        return repo;
    }
}
