package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.ContractRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
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
    final SeasonRepository seasonRepository;
    final RoomTypeCodeRepository roomTypeCodeRepository;
    final BoardTypeCodeRepository boardTypeCodeRepository;
    final ContractRepository contractRepository;
    final TariffRepository tariffRepository;
    final InventoryRepository inventoryRepository;

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
                destinationRepository,
                seasonRepository,
                roomTypeCodeRepository,
                boardTypeCodeRepository,
                contractRepository,
                tariffRepository,
                inventoryRepository
);
    }

}
