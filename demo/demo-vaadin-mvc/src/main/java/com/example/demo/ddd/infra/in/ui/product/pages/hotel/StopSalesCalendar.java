package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesCalendarLine;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.declarative.GenericForm;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@FormLayout(columns = 8)
@Style("width: 100%;")
@RequiredArgsConstructor
public class StopSalesCalendar extends GenericForm {

    final HotelRepository hotelRepository;

    @Colspan(2)
    @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
    @Style("width: 100%;")
            @Label("Hotel")
    String hotelId;

    @Label("_")
    Button search = Button.builder().label("Search").build();

    @Colspan(8)
    @ReadOnly
    List<StopSalesCalendarLine> lines;

    LocalDate from;
    LocalDate to;

    @Label("_")
    Button open = Button.builder().label("Open").build();
    @Label("_")
    Button close = Button.builder().label("Close").build();

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("search".equals(actionId)) {
            if (hotelId == null || hotelId.isEmpty()) {
                throw new RuntimeException("Please select a hotel");
            }
            lines = hotelRepository.findById(hotelId).get().stopSalesCalendarLines();
        }
        if ("open".equals(actionId) || "close".equals(actionId)) {
            if (hotelId == null || hotelId.isEmpty()) {
                throw new RuntimeException("Please select a hotel");
            }
            if (from == null || to == null) throw new RuntimeException("Please select a date range");
            if (from.isAfter(to)) {
                throw new RuntimeException("From must be before to");
            }
            if (from.getYear() != 2026 || to.getYear() != 2026) {
                throw new RuntimeException("2026 only");
            }
            var hotel = hotelRepository.findById(hotelId).get();
            lines = hotel.stopSalesCalendarLines();
            if (from.getMonthValue() > lines.size()) {
                throw new RuntimeException("Unsupported month");
            }
            if (to.getMonthValue() > lines.size()) {
                throw new RuntimeException("Unsupported month");
            }
            lines = openOrClose(lines, from, to, "open".equals(actionId));
            hotelRepository.saveAll(List.of(hotel.withStopSalesCalendarLines(lines)));
        }
        return super.handleAction(actionId, httpRequest);
    }

    private List<StopSalesCalendarLine> openOrClose(List<StopSalesCalendarLine> lines, LocalDate from, LocalDate to, boolean opened) {
        var result = new ArrayList<StopSalesCalendarLine>();
        int fromRow = from.getMonthValue() - 1;
        int toRow = to.getMonthValue() - 1;
        int fromCol = from.getDayOfMonth() - 1;
        int toCol = to.getDayOfMonth() - 1;
        for (int row = 0; row < lines.size(); row++) {
            if (row >= fromRow && row <= toRow) {
                var line = lines.get(row);
                for (int col = fromCol; col <= ((row == toRow)?toCol:30); col++) {
                    if (col == 0) {
                        line = line.withD01(opened);
                    }
                    if (col == 1) {
                        line = line.withD02(opened);
                    }
                    if (col == 2) {
                        line = line.withD03(opened);
                    }
                    if (col == 3) {
                        line = line.withD04(opened);
                    }
                    if (col == 4) {
                        line = line.withD05(opened);
                    }
                    if (col == 5) {
                        line = line.withD06(opened);
                    }
                    if (col == 6) {
                        line = line.withD07(opened);
                    }
                    if (col == 7) {
                        line = line.withD08(opened);
                    }
                    if (col == 8) {
                        line = line.withD09(opened);
                    }
                    if (col == 9) {
                        line = line.withD10(opened);
                    }
                    if (col == 10) {
                        line = line.withD11(opened);
                    }
                    if (col == 11) {
                        line = line.withD12(opened);
                    }
                    if (col == 12) {
                        line = line.withD13(opened);
                    }
                    if (col == 13) {
                        line = line.withD14(opened);
                    }
                    if (col == 14) {
                        line = line.withD15(opened);
                    }
                    if (col == 15) {
                        line = line.withD16(opened);
                    }
                    if (col == 16) {
                        line = line.withD17(opened);
                    }
                    if (col == 17) {
                        line = line.withD18(opened);
                    }
                    if (col == 18) {
                        line = line.withD19(opened);
                    }
                    if (col == 19) {
                        line = line.withD20(opened);
                    }
                    if (col == 20) {
                        line = line.withD21(opened);
                    }
                    if (col == 21) {
                        line = line.withD22(opened);
                    }
                    if (col == 22) {
                        line = line.withD23(opened);
                    }
                    if (col == 23) {
                        line = line.withD24(opened);
                    }
                    if (col == 24) {
                        line = line.withD25(opened);
                    }
                    if (col == 25) {
                        line = line.withD26(opened);
                    }
                    if (col == 26) {
                        line = line.withD27(opened);
                    }
                    if (col == 27) {
                        line = line.withD28(opened);
                    }
                    if (col == 28) {
                        line = line.withD29(opened);
                    }
                    if (col == 29) {
                        line = line.withD30(opened);
                    }
                    if (col == 30) {
                        line = line.withD31(opened);
                    }
                }
                fromCol = 0;
                result.add(line);
            } else {
                result.add(lines.get(row));
            }
        }
        return result;
    }
}
