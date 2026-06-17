package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.UI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@UI("/nested-crud")
@RequiredArgsConstructor
public class NestedCrud extends AutoCrud<Level1View> {

    final NestedCrudAdapter adapter;

    @Override
    public AutoCrudAdapter<Level1View> simpleAdapter() {
        return adapter;
    }
}
