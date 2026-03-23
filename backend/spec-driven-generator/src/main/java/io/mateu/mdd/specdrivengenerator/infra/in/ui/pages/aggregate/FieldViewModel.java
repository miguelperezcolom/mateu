package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.aggregate;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.FieldTypeDto;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.EntityIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.EntityIdOptionsSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.ValueObjectIdLabelSupplier;
import io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers.ValueObjectIdOptionsSupplier;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;

@FormLayout(columns = 6)
public record FieldViewModel(String name, String label, FieldTypeDto type, @Colspan(3) String help,
                             @ForeignKey(search = ValueObjectIdOptionsSupplier.class, label = ValueObjectIdLabelSupplier.class)
                             String valueObject,
                             @ForeignKey(search = EntityIdOptionsSupplier.class, label = EntityIdLabelSupplier.class)
                             String entity,
                             boolean mandatory, boolean readonly, boolean visible,
                             boolean editable, boolean searchable, boolean filterable) {
}
