package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.Agency;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.Booking;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.BookingRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardType;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.Season;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Address;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Contract;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.ContractRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Hotel;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Inventory;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.InventoryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;
import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Writer {

    static List<String> names = List.of("Mateu", "Antonia", "Miguel");

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
            InventoryRepository inventoryRepository, FileRepository fileRepository, BookingRepository bookingRepository, LocatorValueGenerator locatorValueGenerator, TariffGenerator tariffGenerator) {
        writeAgencies(dataSet, agencyRepository);
        writeHotels(dataSet, hotelRepository);
        writeCountries(dataSet, countryRepository);
        writeDestinations(dataSet, destinationRepository);
        writeSeasons(seasonRepository);
        writeRooms(dataSet, roomTypeCodeRepository);
        writeBoards(dataSet, boardTypeCodeRepository);
        writeTariffs(dataSet, tariffRepository, seasonRepository, tariffGenerator);
        writeContracts(dataSet, contractRepository);
        writeInventories(dataSet, inventoryRepository);
        writeBookings(dataSet, fileRepository, bookingRepository, locatorValueGenerator);
    }

    private static void writeBookings(DataSet dataSet, FileRepository fileRepository, BookingRepository bookingRepository, LocatorValueGenerator locatorValueGenerator) {
        dataSet.agencias().forEach(agencia -> {
            String fileLocator = locatorValueGenerator.generate().toString();
            String bookingLocator = locatorValueGenerator.generate().toString();
            fileRepository.saveAll(List.of(new File(
                    fileLocator,
                    agencia.codigo(),
                    names.get(fileRepository.findAll().size() % names.size()),
                    LocalDate.now(),
                    new Amount("EUR", 10.2),
                    new Status(StatusType.SUCCESS, "Confirmed"),
                    List.of(bookingLocator)
            )));
            var hotel = dataSet.hoteles().get(fileRepository.findAll().size() % dataSet.hoteles().size());
            bookingRepository.saveAll(List.of(new Booking(
                    bookingLocator,
                    fileLocator,
                    hotel.codigo(),
                    LocalDate.now().plusDays(10),
                    LocalDate.now().plusDays(10 + 7),
                    hotel.nombre(),
                    "Populated"
            )));
        });
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

    private static void writeTariffs(DataSet dataSet, TariffRepository tariffRepository, SeasonRepository seasonRepository, TariffGenerator tariffGenerator) {
        List<Tariff> tariffs = new ArrayList<>();
        for (HotelDto hotel : dataSet.hoteles()) {
            for (Season season : seasonRepository.findAll()) {
                tariffs.addAll(tariffGenerator.generate(dataSet, hotel, season));
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
                        hotel.idDestino(),
                        new Address("", "", "", "", ""),
                        null,
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
