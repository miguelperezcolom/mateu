package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.mdd.core.interfaces.Card;
import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;

@ReadOnly
@Getter
@Setter
public class InsuredInformationSummary implements Card, HasIcon, HasTitle {

  private String birthDate = "27 Nov 1975";

  private String smoke = "No";

  private String occupation = "Mechanic";

  private String sumInsured = "32.000,00 €";

  private String paymentFrequency = "Monthly";

  @Override
  public String getIcon() {
    return "bad-life";
  }

  @Override
  public String getTitle() {
    return "Bad-life calculation";
  }
}
