package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MeterDto;
import io.mateu.uidl.data.Meter;
import java.util.List;

public class MeterMapper {

  public static ClientSideComponentDto mapMeterToDto(Meter meter) {
    return new ClientSideComponentDto(
        MeterDto.builder()
            .label(meter.label())
            .value(meter.value())
            .max(meter.max())
            .unit(meter.unit())
            .caption(meter.caption())
            .warnAt(meter.warnAt())
            .dangerAt(meter.dangerAt())
            .build(),
        meter.id(),
        List.of(),
        meter.style(),
        meter.cssClasses(),
        null);
  }
}
