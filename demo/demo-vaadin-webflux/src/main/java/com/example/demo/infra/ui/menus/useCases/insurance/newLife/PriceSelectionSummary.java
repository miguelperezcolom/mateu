package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.core.interfaces.HasIcon;
import io.mateu.uidl.core.interfaces.HasTitle;
import io.mateu.uidl.core.interfaces.HasTotal;
import io.mateu.uidl.core.annotations.ReadOnly;
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
