package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.DetailFormCustomisation;
import io.mateu.uidl.annotations.Details;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.Text;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.List;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.TextComponentToDtoMapper.mapTextToDto;

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
        List<BoardSupplement> boardSupplements,
        @Details
        ComponentDto details
        ) {

        public ComponentDto details() {
                return mapTextToDto(Text.builder()
                        .text(getDetailHtml())
                        .build());
        }

        private String getDetailHtml() {
                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);

                pw.println("<h3>Prices</h3>");
                pw.println("<table>");
                pw.println("<tr><td>Room</td><td>Price</td></tr>");
                prices.forEach(p -> pw.println("<tr><td>" + p.roomCode() + "</td><td>" + p.price() + "</td></tr>"));
                pw.println("</table>");

                return sw.toString();
        }
}
