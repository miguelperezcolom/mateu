package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.in.populator.dtos.AgenciaDto;
import com.example.demo.ddd.infra.in.populator.dtos.DestinoDto;
import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;
import com.example.demo.ddd.infra.in.populator.dtos.RegimenDto;
import com.example.demo.ddd.infra.in.populator.dtos.TipoHabitacionDto;

import java.util.List;

public record DataSet(
        List<TipoHabitacionDto> tiposHabitacion,
        List<RegimenDto> regimenes,
        List<AgenciaDto> agencias,
        List<DestinoDto> destinos,
        List<HotelDto> hoteles
) {
}
