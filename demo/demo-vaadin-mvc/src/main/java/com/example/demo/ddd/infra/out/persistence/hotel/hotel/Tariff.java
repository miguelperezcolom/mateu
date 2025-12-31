package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffChildAgeRange;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffGeneralInfo;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffRoomOccupationType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffRoomPaxSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffRoomType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffBoard;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.applicationterms.ApplicationTerm;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.charges.ChargePrice;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.BoardSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.PaxSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.Period;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.Price;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.RoomSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplements.Supplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplementsperday.SupplementPerDayPrice;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

import java.time.LocalDate;
import java.util.List;

public record Tariff(
        String id,
        String name,
        int version,
        boolean computesPMC,
        LocalDate stayFrom,
        LocalDate stayTo,
        LocalDate bookingWindowFrom,
        LocalDate bookingWindowTo,
        TariffGeneralInfo generalInfo,
        List<TariffRoomType> roomTypes,
        List<TariffRoomOccupationType> occupationTypes,
        List<TariffRoomPaxSupplement> roomPaxSupplements,
        TariffChildAgeRange defaultChildAges,
        List<TariffBoard> boards,
        List<Period> periods,
        List<Price> prices,
        List<PaxSupplement> paxSupplements,
        List<RoomSupplement> roomSupplements,
        List<BoardSupplement> boardSupplements,

        List<Supplement> supplements,
        List<ChargePrice> charges,
        List<ApplicationTerm> applicationTerms,
        List<SupplementPerDayPrice> supplementPerDayPrices

        ) implements GenericEntity {
}
