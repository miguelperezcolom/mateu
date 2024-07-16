package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.HasIcon;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTotal;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;

@ReadOnly
@Getter
@Setter
public class PriceSelectionSummary extends InsuredInformationSummary
    implements Card, HasIcon, HasTitle, HasTotal {

  private String carrier = "AXA";

  private String total = "1.624,05 €";
}
