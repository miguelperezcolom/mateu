package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.domain.hotel.agency.AgencyRepository;
import com.example.demo.ddd.domain.hotel.hotel.HotelRepository;
import com.example.demo.ddd.domain.hotel.world.CountryRepository;
import com.example.demo.ddd.domain.hotel.world.DestinationRepository;
import com.example.demo.ddd.infra.in.populator.dtos.AgenciaDto;
import com.example.demo.ddd.infra.in.populator.dtos.DestinoDto;
import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;
import com.example.demo.ddd.infra.in.populator.dtos.RegimenDto;
import com.example.demo.ddd.infra.in.populator.dtos.TipoHabitacionDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.example.demo.ddd.infra.in.populator.Reader.*;
import static com.example.demo.ddd.infra.in.populator.Writer.write;


@Service
@RequiredArgsConstructor
public class Populator {

    final AgencyRepository agencyRepository;
    final HotelRepository hotelRepository;
    final CountryRepository countryRepository;
    final DestinationRepository destinationRepository;

    public DataSet create() {
        List<TipoHabitacionDto> tiposHabitacion = leerTiposHabitacion();
        List<RegimenDto> regimenes = leerRegimenes();
        List<AgenciaDto> agencias = leerAgencias();
        List<DestinoDto> destinos = leerDestinos();
        List<HotelDto> hoteles = leerHoteles();
        return new DataSet(tiposHabitacion, regimenes, agencias, destinos, hoteles);
    }

    @PostConstruct
    public void populate() {
        var dataSet = create();
        write(dataSet,
                agencyRepository,
                hotelRepository,
                countryRepository,
                destinationRepository);
    }

}
