package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.PaxType;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SaleScope;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.Season;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.*;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.applicationterms.ApplicationTerm;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.charges.ChargePrice;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.*;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplements.Supplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplementsperday.SupplementPerDayPrice;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TariffGenerator {

    List<Tariff> generate(DataSet dataSet, HotelDto hotel, Season season) {

        var periods = generatePeriods(season);

        List<Tariff> tariffs = new ArrayList<>();
        var tariff = new Tariff(
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
                generateRoomTypes(dataSet),
                generateOccupationTypes(dataSet),
                generateRoomPaxSupplements(dataSet),
                new TariffChildAgeRange(1, 2, 12),
                generateBoards(dataSet),
                periods,
                generatePrices(dataSet, periods),
                generatePaxSupplements(dataSet, periods),
                generateRoomSupplements(dataSet, periods),
                generateBoardSupplements(),
                generateSupplements(),
                generateCharges(),
                generateApplicationTerms(),
                generateSupplementsPerDay()
        );
        tariffs.add(tariff);
        return tariffs;

    }

    private List<SupplementPerDayPrice> generateSupplementsPerDay() {
        return List.of();
    }

    private List<ApplicationTerm> generateApplicationTerms() {
        return List.of();
    }

    private List<ChargePrice> generateCharges() {
        return List.of();
    }

    private List<Supplement> generateSupplements() {
        return List.of();
    }

    private List<BoardSupplement> generateBoardSupplements() {
        return List.of();
    }

    private List<RoomSupplement> generateRoomSupplements(DataSet dataSet, List<Period> periods) {
        return periods.stream().map(p -> dataSet.tiposHabitacion().stream()
                        .map(t -> new RoomSupplement(
                                t.codigo(),
                                p.number(),
                                null,
                                1.23,
                                15d,
                                "Generated"
                        )).toList())
                .flatMap(Collection::stream).toList();
    }

    private List<PaxSupplement> generatePaxSupplements(DataSet dataSet, List<Period> periods) {
        return periods.stream().map(p -> dataSet.tiposHabitacion().stream()
                .map(t -> new PaxSupplement(
                        t.codigo(),
                        p.number(),
                        UseType.AD,
                        PaxType.AD,
                        0,
                        1.21,
                        10d,
                        "Generated"
                        )).toList())
                .flatMap(Collection::stream).toList();
    }

    private List<Price> generatePrices(DataSet dataSet, List<Period> periods) {
        AtomicInteger pos = new AtomicInteger();
        var precios = new HashMap<String, Double>();
        dataSet.tiposHabitacion().forEach(t -> precios.put(t.codigo(), 10.31));
        return periods.stream()
                .map(p -> new Price(pos.getAndIncrement(), p.number(), precios, "Generated"))
                .toList();
    }

    private List<Period> generatePeriods(Season season) {
        var from = season.from();
        var to = season.to();
        var periods = new ArrayList<Period>();
        int pos = 0;
        while (from.isBefore(to)) {
            var periodEnding = from.plusDays(7);
            if (periodEnding.isAfter(to)) {
                periodEnding = to;
            }
            periods.add(new Period(pos++, from, periodEnding, "Generated"));
            from = periodEnding.plusDays(1);
        }
        if (!from.isAfter(to)) {
            periods.add(new Period(pos++, from, to, "Generated"));
        }
        return periods;
    }

    private List<TariffBoard> generateBoards(DataSet dataSet) {
        return dataSet.regimenes().stream()
                .map(t -> new TariffBoard(
                        true,
                        t.codigo()))
                .toList();
    }

    private List<TariffRoomPaxSupplement> generateRoomPaxSupplements(DataSet dataSet) {
        return dataSet.tiposHabitacion().stream()
                .map(t -> new TariffRoomPaxSupplement(
                        t.codigo(),
                        PaxType.AD,
                        UseType.AD,
                        1,
                        30,
                        2,
                        true,
                        "Generated"))
                .toList();
    }

    private List<TariffRoomOccupationType> generateOccupationTypes(DataSet dataSet) {
        return dataSet.tiposHabitacion().stream()
                .map(t -> new TariffRoomOccupationType(
                        t.codigo(),
                        true,
                        true,
                        OccupationType.AD1,
                        UseType.AD))
                .toList();
    }

    private List<TariffRoomType> generateRoomTypes(DataSet dataSet) {
        return dataSet.tiposHabitacion().stream()
                .map(t -> new TariffRoomType(
                        true,
                        t.codigo(),
                        t.nombre(),
                        true,
                        t.capacidad(),
                        t.capacidadMaxima()))
                .toList();
    }

}
