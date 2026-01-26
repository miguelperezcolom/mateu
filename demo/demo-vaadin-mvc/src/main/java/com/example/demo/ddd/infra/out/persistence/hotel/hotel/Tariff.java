package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffChildAgeRange;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffGeneralInfo;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffRoomOccupationType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffRoomPaxSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.HotelRoomType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffBoard;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.TariffRoomType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.applicationterms.ApplicationTerm;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.charges.ChargePrice;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.BoardSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.PaxSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.Period;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.Price;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods.RoomSupplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplements.Supplement;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplementsperday.SupplementPerDayPrice;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.*;

import java.time.LocalDate;
import java.util.List;

@FormLayout(columns = 4)
public record Tariff(
        @GeneratedValue(UUIDValueGenerator.class)
        @Hidden
        String id,
        @ForeignKey(search = ContractIdOptionsSupplier.class, label = ContractLabelSupplier.class)
        String contractId,
        String name,
        int version,
        @HiddenInList
        boolean computesPMC,
        LocalDate stayFrom,
        LocalDate stayTo,
        LocalDate bookingWindowFrom,
        LocalDate bookingWindowTo,
        @Tab("General Info")
                @Colspan(2)
        TariffGeneralInfo generalInfo,
        @Tab("Rooms")
        @Colspan(2)
        List<TariffRoomType> roomTypes,
        @Tab("Occupations")
        @Colspan(2)
        List<TariffRoomOccupationType> occupationTypes,
        @Tab("Room/Pax supplements")
        @Colspan(2)
        List<TariffRoomPaxSupplement> roomPaxSupplements,
        @Tab("Default child age")
        @Colspan(2)
        TariffChildAgeRange defaultChildAges,
        @Tab("Boards")
        @Colspan(2)
        List<TariffBoard> boards,
        @Tab("Periods")
        @Colspan(2)
        List<Period> periods,
        @Tab("Prices")
        @Colspan(2)
        List<Price> prices,
        @Tab("Pax supplements")
        @Colspan(2)
        List<PaxSupplement> paxSupplements,
        @Tab("Room supplements")
        @Colspan(2)
        List<RoomSupplement> roomSupplements,
        @Tab("Bard supplements")
        @Colspan(2)
        List<BoardSupplement> boardSupplements,

        @Tab("Supplements")
        @Colspan(2)
        List<Supplement> supplements,
        @Tab("Charges")
        @Colspan(2)
        List<ChargePrice> charges,
        @Tab("Application terms")
        @Colspan(2)
        List<ApplicationTerm> applicationTerms,
        @Tab("Supplements per day")
        @Colspan(2)
        List<SupplementPerDayPrice> supplementPerDayPrices

        ) implements GenericEntity {
}
