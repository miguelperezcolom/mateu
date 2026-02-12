package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.DetailFormCustomisation;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Tab;

import java.time.LocalDate;
import java.util.List;

public record Period(
        @Hidden
        int number,
        LocalDate from,
        LocalDate to,
        String comments,
        @Tab("Prices")
        @Colspan(2)
        @DetailFormCustomisation(columns = 4)
        List<PricePerRoom> prices,
        @Tab("Pax supplements")
        @Colspan(2)
        @DetailFormCustomisation(columns = 4)
        List<PaxSupplement> paxSupplements,
        @Tab("Room supplements")
        @Colspan(2)
        @DetailFormCustomisation(columns = 4)
        List<RoomSupplement> roomSupplements,
        @Tab("Bard supplements")
        @Colspan(2)
        @DetailFormCustomisation(columns = 4)
        List<BoardSupplement> boardSupplements
        ) {
}
