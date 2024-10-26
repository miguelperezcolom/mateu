package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.HasIcon;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.HasTotal;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;

@ReadOnly
@Getter
@Setter
public class PriceSelectionSummary extends InsuredInformationSummary
    implements HasIcon, HasTitle, HasTotal {

  private String carrier = "AXA";

  private String total = "1.624,05 €";
}
