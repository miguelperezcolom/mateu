package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.in.populator.dtos.TipoHabitacionDto;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.*;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.*;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory.InventoryCalendarLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.release.ReleaseCalendarLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesCalendarLine;
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
import com.example.demo.ddd.infra.out.persistence.hotel.users.User;
import com.example.demo.ddd.infra.out.persistence.hotel.users.UserRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Destination;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationRepository;
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
            InventoryRepository inventoryRepository,
            FileRepository fileRepository,
            BookingRepository bookingRepository,
            LocatorValueGenerator locatorValueGenerator,
            TariffGenerator tariffGenerator,
            UserRepository userRepository,
            OfferRepository offerRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository,
            AccountRepository accountRepository,
            int hotels, int agencies, int years, int tariffsPerContract) {
        writeUsers(userRepository);
        writeAgencies(dataSet, agencyRepository, agencies);
        writeHotels(dataSet, hotelRepository, hotels);
        writeCountries(dataSet, countryRepository);
        writeDestinations(dataSet, destinationRepository);
        writeSeasons(seasonRepository, years);
        writeRooms(dataSet, roomTypeCodeRepository);
        writeBoards(dataSet, boardTypeCodeRepository);
        writeContracts(hotelRepository, agencyRepository, contractRepository, seasonRepository);
        writeTariffs(dataSet, tariffRepository, seasonRepository, tariffGenerator, contractRepository, tariffsPerContract);
        writeInventories(dataSet, inventoryRepository);
        writeOffers(hotelRepository, agencyRepository, offerRepository);
        writeBookings(dataSet, agencyRepository, hotelRepository, fileRepository, bookingRepository, locatorValueGenerator);
        writeInvoices(fileRepository, bookingRepository, invoiceRepository);
        writeAccounts(agencyRepository, accountRepository);
        writePayments(invoiceRepository, paymentRepository);
    }

    private static void writeAccounts(AgencyRepository agencyRepository, AccountRepository accountRepository) {
        List<Account> accounts = new ArrayList<>();
        for (Agency agency : agencyRepository.findAll()) {
            accounts.add(new Account(
                    UUID.randomUUID().toString(),
                    agency.id(),
                    agency.name(),
                    new Amount("EUR", 50.24),
                    "Generated"
            ));
        }
        accountRepository.saveAll(accounts);
    }

    private static void writePayments(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository) {
        List<Payment> payments = new ArrayList<>();
        for (Invoice invoice : invoiceRepository.findAll()) {
            payments.add(new Payment(
                    UUID.randomUUID().toString(),
                    invoice.agencyId(),
                    LocalDate.now(),
                    new Amount("EUR", 200.12),
                    "Invoice " + invoice.id()
            ));
        }
        paymentRepository.saveAll(payments);
    }

    private static void writeInvoices(FileRepository fileRepository, BookingRepository bookingRepository, InvoiceRepository invoiceRepository) {
        List<Invoice> invoices = new ArrayList<>();
        for (Booking booking : bookingRepository.findAll()) {
            invoices.add(new Invoice(
                    UUID.randomUUID().toString(),
                    fileRepository.findById(booking.fileId()).get().agencyId(),
                    LocalDate.now(),
                    new Amount("EUR", 200.12),
                    new Status(StatusType.SUCCESS, "Paid"),
                    List.of(new InvoiceLine("Booking " + booking.id() + " - " + booking.name(), 200.12))
            ));
        }
        invoiceRepository.saveAll(invoices);
    }

    private static void writeOffers(HotelRepository hotelRepository, AgencyRepository agencyRepository, OfferRepository offerRepository) {
        List<Offer> offers = new ArrayList<>();
        for (Hotel hotel : hotelRepository.findAll()) {
            offers.add(new Offer(
                    UUID.randomUUID().toString(),
                    hotel.name() + " - " + "15%",
                    hotel.id(),
                    null,
                    true,
                    LocalDate.now(),
                    LocalDate.now().plusDays(60),
                    null,
                    null,
                    null,
                    null,
                    List.of(new Benefit(BenefitType.DES, "15% discount", 15))
            ));
        }
        offerRepository.saveAll(offers);
    }

    private static void writeUsers(UserRepository userRepository) {
        userRepository.saveAll(List.of(
                new User("miguel", "Miguel Pérez", "/images/users/miguel.jpg", new Status(StatusType.SUCCESS, "Active"), true, false, false, false),
                new User("ivan", "Ivan Orpí", "/images/users/ivan.jpg", new Status(StatusType.SUCCESS, "Active"), true, false, false, false),
                new User("ivanl", "Ivan López", "/images/users/ivanl.jpg", new Status(StatusType.SUCCESS, "Active"), false, false, false, true),
                new User("marc", "Marc Bennassar", "/images/users/marc.jpg", new Status(StatusType.SUCCESS, "Active"), false, true, false, false),
                new User("fernando", "Fernando Becerra", "/images/users/fernando.jpg", new Status(StatusType.SUCCESS, "Active"), false, false, true, false)
        ));
    }

    private static void writeBookings(DataSet dataSet, AgencyRepository agencyRepository, HotelRepository hotelRepository, FileRepository fileRepository, BookingRepository bookingRepository, LocatorValueGenerator locatorValueGenerator) {
        agencyRepository.findAll().forEach(agencia -> {
            String fileLocator = locatorValueGenerator.generate().toString();
            String bookingLocator = locatorValueGenerator.generate().toString();
            fileRepository.saveAll(List.of(new File(
                    fileLocator,
                    agencia.id(),
                    names.get(fileRepository.findAll().size() % names.size()),
                    LocalDate.now(),
                    new Amount("EUR", 10.2),
                    new Status(StatusType.SUCCESS, "Confirmed"),
                    List.of(bookingLocator)
            )));
            var hotel = hotelRepository.findAll().get(fileRepository.findAll().size() % hotelRepository.findAll().size());
            bookingRepository.saveAll(List.of(new Booking(
                    bookingLocator,
                    fileLocator,
                    hotel.id(),
                    LocalDate.now().plusDays(10),
                    LocalDate.now().plusDays(10 + 7),
                    hotel.name(),
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

    private static void writeContracts(HotelRepository hotelRepository, AgencyRepository agencyRepository, ContractRepository contractRepository, SeasonRepository seasonRepository) {
        List<Contract> contracts = new ArrayList<>();
        for (Hotel hotel : hotelRepository.findAll()) {
            for (Agency agencia : agencyRepository.findAll()) {
                for (Season season : seasonRepository.findAll()) {
                    contracts.add(new Contract(
                            UUID.randomUUID().toString(),
                            hotel.name() + " - " + agencia.name() + " - " + season.name(),
                            hotel.id(),
                            agencia.id(),
                            season.id()
                    ));
                }
            }
        }
        contractRepository.saveAll(contracts);
    }

    private static void writeTariffs(DataSet dataSet, TariffRepository tariffRepository, SeasonRepository seasonRepository, TariffGenerator tariffGenerator, ContractRepository contractRepository, int tariffsPerContract) {
        List<Tariff> tariffs = new ArrayList<>();
        contractRepository.findAll().forEach(contract -> {
            for (int i = 0; i < tariffsPerContract; i++) {
                tariffs.addAll(tariffGenerator.generate(dataSet,
                        dataSet.hoteles().stream().filter(hotel -> hotel.codigo().equals(contract.hotelId())).findFirst().get(),
                        seasonRepository.findById(contract.seasonId()).get(),
                        contract));
            }
        });
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

    private static void writeSeasons(SeasonRepository seasonRepository, int years) {
        List<Season> seasons = new ArrayList<>();
        for (int year = 2026; year <= 2026 + years - 1; year++) {
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
                        destino.codigoPais()
//                        dataSet.hoteles().stream()
//                                .filter(hotel -> destino.codigo().equals(hotel.idDestino()))
//                                .map(HotelDto::codigo).toList()
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

    private static void writeHotels(DataSet dataSet, HotelRepository hotelRepository, int hotels) {
        hotelRepository.saveAll(dataSet.hoteles().stream()
                        .limit(hotels)
                .map(hotel -> new Hotel(
                        hotel.codigo(),
                        hotel.nombre(),
                        hotel.idDestino(),
                        new Address("Arxiduc Lluís Salvador, 38", "Palma de Mallorca", "07004", "Baleares", "ES"),
                        null,
                        List.of(),
                        List.of(),
                        createStopSalesCalendar(),
                        createInventoryCalendar(dataSet),
                        createReleaseCalendar(dataSet)
                )).toList());
    }

    private static List<ReleaseCalendarLine> createReleaseCalendar(DataSet dataSet) {
        List<ReleaseCalendarLine> calendar = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            for (TipoHabitacionDto habitacion : dataSet.tiposHabitacion()) {
                calendar.add(new ReleaseCalendarLine("2026", "0" + i, habitacion.codigo(), 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7));
            }
        }
        return calendar;
    }

    private static List<InventoryCalendarLine> createInventoryCalendar(DataSet dataSet) {
        List<InventoryCalendarLine> calendar = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            for (TipoHabitacionDto habitacion : dataSet.tiposHabitacion()) {
                calendar.add(new InventoryCalendarLine("2026", "0" + i, habitacion.codigo(), 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1));
            }
        }
        return calendar;
    }

    private static List<StopSalesCalendarLine> createStopSalesCalendar() {
        List<StopSalesCalendarLine> calendar = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            calendar.add(new StopSalesCalendarLine("2026", "0" + i, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true));
        }
        return calendar;
    }

    private static void writeAgencies(DataSet dataSet, AgencyRepository agencyRepository, int agencies) {
        agencyRepository.saveAll(dataSet.agencias().stream()
                        .limit(agencies)
                .map(agencia -> new Agency(
                        agencia.codigo(),
                        agencia.nombre(),
                        true
                )).toList());

    }
}
