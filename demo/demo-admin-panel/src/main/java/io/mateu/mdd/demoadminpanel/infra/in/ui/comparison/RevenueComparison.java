package io.mateu.mdd.demoadminpanel.infra.in.ui.comparison;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ComparisonCard;
import io.mateu.uidl.fluent.Component;

/** Demo of the {@link ComparisonCard} component: two periods side by side with a delta chip. */
@UI("/comparison-demo")
@Title("This month vs last")
public class RevenueComparison {

  @Section("Revenue")
  Component revenue =
      ComparisonCard.builder()
          .title("Revenue")
          .leftLabel("Last month")
          .leftValue("€38k")
          .rightLabel("This month")
          .rightValue("€48k")
          .delta("+26%")
          .trend("up")
          .build();

  @Section("Churn")
  Component churn =
      ComparisonCard.builder()
          .title("Churn rate")
          .leftLabel("Last month")
          .leftValue("3.1%")
          .rightLabel("This month")
          .rightValue("2.4%")
          .delta("-0.7pp")
          .trend("down")
          .build();
}
