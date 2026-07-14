package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PricingPlanDto;
import io.mateu.dtos.PricingTableDto;
import io.mateu.uidl.data.PricingTable;
import java.util.List;

public class PricingTableMapper {

  public static ClientSideComponentDto mapPricingTableToDto(PricingTable table) {
    return new ClientSideComponentDto(
        PricingTableDto.builder()
            .plans(
                table.plans() != null
                    ? table.plans().stream()
                        .map(
                            plan ->
                                PricingPlanDto.builder()
                                    .id(plan.id())
                                    .name(plan.name())
                                    .price(plan.price())
                                    .period(plan.period())
                                    .featured(plan.featured())
                                    .features(plan.features() != null ? plan.features() : List.of())
                                    .ctaLabel(plan.ctaLabel())
                                    .actionId(plan.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        table.id(),
        List.of(),
        table.style(),
        table.cssClasses(),
        null);
  }
}
