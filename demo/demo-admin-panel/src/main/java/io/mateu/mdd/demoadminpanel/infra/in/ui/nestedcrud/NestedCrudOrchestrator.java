package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.AutoCrudOrchestrator;
import io.mateu.uidl.annotations.UI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@UI("/nested-crud")
@RequiredArgsConstructor
public class NestedCrudOrchestrator extends AutoCrudOrchestrator<Level1View> {

    final NestedCrudAdapter adapter;

    @Override
    public AutoCrudAdapter<Level1View> simpleAdapter() {
        return adapter;
    }
}
