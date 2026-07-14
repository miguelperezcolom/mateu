package io.mateu.mdd.demoadminpanel.infra.in.ui.pricing;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PricingPlan;
import io.mateu.uidl.data.PricingTable;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link PricingTable} component: three plans with a featured one. */
@UI("/pricing-demo")
@Title("Pricing")
public class Plans {

  @Section("Choose a plan")
  Component pricing =
      PricingTable.builder()
          .plans(
              List.of(
                  PricingPlan.builder()
                      .name("Starter")
                      .price("0€")
                      .period("/mo")
                      .features(List.of("1 project", "1 GB storage", "Community support"))
                      .ctaLabel("Start free")
                      .actionId("choosePlan")
                      .build(),
                  PricingPlan.builder()
                      .name("Pro")
                      .price("29€")
                      .period("/mo")
                      .featured(true)
                      .features(
                          List.of(
                              "Unlimited projects",
                              "100 GB storage",
                              "Priority support",
                              "Advanced analytics"))
                      .ctaLabel("Go Pro")
                      .actionId("choosePlan")
                      .build(),
                  PricingPlan.builder()
                      .name("Enterprise")
                      .price("Custom")
                      .features(
                          List.of(
                              "SSO & SAML",
                              "Dedicated support",
                              "99.9% SLA",
                              "On-premise option"))
                      .ctaLabel("Contact sales")
                      .actionId("contactSales")
                      .build()))
          .build();
}
