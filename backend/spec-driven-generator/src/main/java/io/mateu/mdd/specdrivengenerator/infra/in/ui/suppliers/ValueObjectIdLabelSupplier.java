package io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers;

import io.mateu.mdd.specdrivengenerator.application.query.ProjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.ValueObjectQueryService;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ValueObjectIdLabelSupplier implements LabelSupplier {

    final ValueObjectQueryService queryService;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return queryService.getLabel((String) id);
    }
}
