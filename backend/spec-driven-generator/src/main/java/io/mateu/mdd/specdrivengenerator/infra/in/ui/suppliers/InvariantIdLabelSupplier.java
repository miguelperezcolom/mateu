package io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers;

import io.mateu.mdd.specdrivengenerator.application.query.InvariantQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.ValueObjectQueryService;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InvariantIdLabelSupplier implements LabelSupplier {

    final InvariantQueryService queryService;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return queryService.getLabel((String) id);
    }
}
