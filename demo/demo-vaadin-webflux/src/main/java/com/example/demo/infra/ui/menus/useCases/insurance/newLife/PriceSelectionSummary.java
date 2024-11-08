package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.interfaces.HasIcon;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HasTotal;
import io.mateu.uidl.annotations.ReadOnly;
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
