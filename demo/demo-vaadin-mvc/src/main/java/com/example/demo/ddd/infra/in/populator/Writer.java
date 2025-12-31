package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.Agency;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardType;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.PaxType;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SaleScope;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.Season;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Contract;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.ContractRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Hotel;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.OccupationType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffChildAgeRange;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffGeneralInfo;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffStatus;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffType;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Writer {

    static void write(
            DataSet dataSet,
            AgencyRepository agencyRepository,
            HotelRepository hotelRepository,
            CountryRepository countryRepository,
            DestinationRepository destinationRepository,
            SeasonRepository seasonRepository,
            RoomTypeCodeRepository roomTypeCodeRepository,
            BoardTypeCodeRepository boardTypeCodeRepository,
            ContractRepository contractRepository,
            TariffRepository tariffRepository,
            InventoryRepository inventoryRepository) {
        writeAgencies(dataSet, agencyRepository);
        writeHotels(dataSet, hotelRepository);
        writeCountries(dataSet, countryRepository);
        writeDestinations(dataSet, destinationRepository);
        writeSeasons(seasonRepository);
        writeRooms(dataSet, roomTypeCodeRepository);
        writeBoards(dataSet, boardTypeCodeRepository);
        writeTariffs(dataSet, tariffRepository, seasonRepository);
        writeContracts(dataSet, contractRepository);
        writeInventories(dataSet, inventoryRepository);
    }

    private static void writeInventories(DataSet dataSet, InventoryRepository inventoryRepository) {
        inventoryRepository.saveAll(dataSet.hoteles().stream()
                .map(hotel -> new Inventory(
                        hotel.codigo(),
                        hotel.codigo() + "_inventory",
                        hotel.nombre() + " inventory"
                ))
                .toList());
    }

    private static void writeContracts(DataSet dataSet, ContractRepository contractRepository) {
        List<Contract> contracts = new ArrayList<>();
        for (int year = 2023; year <= 2026; year++) {
            contracts.add(new Contract(
                    UUID.randomUUID().toString(),
                    "contract_name",
                    "hotel_id",
                    "agency_id",
                    "season_id",
                    List.of()
            ));
        }
        contractRepository.saveAll(contracts);
    }

    private static void writeTariffs(DataSet dataSet, TariffRepository tariffRepository, SeasonRepository seasonRepository) {
        List<Tariff> tariffs = new ArrayList<>();
        for (HotelDto hotel : dataSet.hoteles()) {
            for (Season season : seasonRepository.findAll()) {
                tariffs.add(new Tariff(
                        UUID.randomUUID().toString(),
                        "name",
                        0,
                        false,
                        season.from(),
                        season.to(),
                        null,
                        null,
                        new TariffGeneralInfo(
                                TariffStatus.G,
                                hotel.codigo(),
                                "EUR",
                                "season_id",
                                false,
                                "name_in_channel_manager",
                                TariffType.GEN,
                                false,
                                0,
                                true,
                                "base_room_id",
                                OccupationType.AD1,
                                PaxType.AD,
                                0,
                                "base_board_type",
                                true,
                                0,
                                true,
                                "ref_code",
                                true,
                                true,
                                2,
                                12,
                                SaleScope.RPC
                        ),
                        List.of(),
                        List.of(),
                        List.of(),
                        new TariffChildAgeRange(1, 2, 12),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ));
            }
        }
        tariffRepository.saveAll(tariffs);
    }

    private static void writeBoards(DataSet dataSet, BoardTypeCodeRepository boardTypeCodeRepository) {
        boardTypeCodeRepository.saveAll(dataSet.regimenes().stream()
                .map(regimen -> new BoardTypeCode(
                        regimen.codigo(),
                        regimen.nombre(),
                        BoardType.valueOf(regimen.tipo())
                )).toList());
    }

    private static void writeRooms(DataSet dataSet, RoomTypeCodeRepository roomTypeCodeRepository) {
        roomTypeCodeRepository.saveAll(dataSet.tiposHabitacion().stream()
                .map(tipoHabitacion -> new RoomTypeCode(
                        tipoHabitacion.codigo(),
                        tipoHabitacion.nombre()
                )).toList());
    }

    private static void writeSeasons(SeasonRepository seasonRepository) {
        List<Season> seasons = new ArrayList<>();
        for (int year = 2023; year <= 2026; year++) {
            seasons.add(new Season("W" + (year % 100) + "-" + (year + 1) % 100, "WINTER " + year + "-" + (year + 1) % 100, LocalDate.of(year - 1, 11, 1), LocalDate.of(year, 4, 1).minusDays(1)));
            seasons.add(new Season("S" + (year % 100), "SUMMER " + year, LocalDate.of(year, 4, 1), LocalDate.of(year, 11, 1).minusDays(1)));
        }
        seasonRepository.saveAll(seasons);
    }

    private static void writeDestinations(DataSet dataSet, DestinationRepository destinationRepository) {
        destinationRepository.saveAll(dataSet.destinos().stream()
                .map(destino -> new Destination(
                        destino.codigo(),
                        destino.nombre(),
                        destino.codigoPais(),
                        dataSet.hoteles().stream()
                                .filter(hotel -> destino.codigo().equals(hotel.idDestino()))
                                .map(HotelDto::codigo).toList()
        )).toList());
    }

    private static void writeCountries(DataSet dataSet, CountryRepository countryRepository) {
        countryRepository.saveAll(dataSet.destinos().stream()
                        .map(destino -> Map.of(
                                "codigo", destino.codigoPais(),
                                "nombre", destino.nombrePais()
                        ))
                        .distinct()
                .map(mapa -> new Country(
                        mapa.get("codigo"),
                        mapa.get("nombre")
                )).toList());
    }

    private static void writeHotels(DataSet dataSet, HotelRepository hotelRepository) {
        hotelRepository.saveAll(dataSet.hoteles().stream()
                .map(hotel -> new Hotel(
                        hotel.codigo(),
                        hotel.nombre(),
                        "image",
                        hotel.idDestino(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                )).toList());
    }

    private static void writeAgencies(DataSet dataSet, AgencyRepository agencyRepository) {
        agencyRepository.saveAll(dataSet.agencias().stream()
                .map(agencia -> new Agency(
                        agencia.codigo(),
                        agencia.nombre()
                )).toList());

    }
}
