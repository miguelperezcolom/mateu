package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@UI("/nested-crud")
@RequiredArgsConstructor
public class NestedCrud extends AutoCrud<Level1View> {

    final Level1ViewRepository repo;


    @Override
    public CrudRepository<Level1View> repository() {
        return repo;
    }
}
