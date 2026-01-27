package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.release.ReleaseCalendarLine;
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
public class ReleaseCalendar extends GenericForm {

    final HotelRepository hotelRepository;

    @Colspan(2)
    @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
    @Style("width: 100%;")
            @Label("Hotel")
    String hotelId;

    @Colspan(2)
    @ForeignKey(search = RoomTypeCodeOptionsSupplier.class, label = RoomTypeCodeLabelSupplier.class)
    @Style("width: 100%;")
    @Label("Room")
    String roomId;

    @Label("_")
    Button search = Button.builder().label("Search").build();

    @Colspan(8)
    @ReadOnly
    List<ReleaseCalendarLine> lines;

    LocalDate from;
    LocalDate to;

   int release;

    @Label("_")
    Button set = Button.builder().label("Set").build();

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("search".equals(actionId)) {
            if (hotelId == null || hotelId.isEmpty()) {
                throw new RuntimeException("Please select a hotel");
            }
            if (roomId == null || roomId.isEmpty()) {
                throw new RuntimeException("Please select a room type");
            }
            lines = hotelRepository.findById(hotelId).get().releaseCalendarLines().stream().filter(line -> line.roomTypeCode().equals(roomId)).toList();
        }
        if ("set".equals(actionId)) {
            if (hotelId == null || hotelId.isEmpty()) {
                throw new RuntimeException("Please select a hotel");
            }
            if (roomId == null || roomId.isEmpty()) {
                throw new RuntimeException("Please select a room type");
            }
            if (from == null || to == null) throw new RuntimeException("Please select a date range");
            if (from.isAfter(to)) {
                throw new RuntimeException("From must be before to");
            }
            if (from.getYear() != 2026 || to.getYear() != 2026) {
                throw new RuntimeException("2026 only");
            }
            var hotel = hotelRepository.findById(hotelId).get();
            lines = hotel.releaseCalendarLines();
            if (from.getMonthValue() > lines.size()) {
                throw new RuntimeException("Unsupported month");
            }
            if (to.getMonthValue() > lines.size()) {
                throw new RuntimeException("Unsupported month");
            }
            lines = openOrClose(lines, from, to, release);
            hotelRepository.saveAll(List.of(hotel.withReleaseCalendarLines(lines)));
            lines = lines.stream().filter(line -> line.roomTypeCode().equals(roomId)).toList();
        }
        return super.handleAction(actionId, httpRequest);
    }

    private List<ReleaseCalendarLine> openOrClose(List<ReleaseCalendarLine> lines, LocalDate from, LocalDate to, int inventory) {
        var result = new ArrayList<ReleaseCalendarLine>();
        int fromMonth = from.getMonthValue();
        int toMonth = to.getMonthValue();
        int fromCol = from.getDayOfMonth() - 1;
        int toCol = to.getDayOfMonth() - 1;
        for (int row = 0; row < lines.size(); row++) {
            var line = lines.get(row);
            int month = Integer.parseInt(line.month());
            if (line.roomTypeCode().equals(roomId) && month >= fromMonth && month <= toMonth) {
                for (int col = fromCol; col <= ((month == toMonth)?toCol:30); col++) {
                    if (col == 0) {
                        line = line.withD01(inventory);
                    }
                    if (col == 1) {
                        line = line.withD02(inventory);
                    }
                    if (col == 2) {
                        line = line.withD03(inventory);
                    }
                    if (col == 3) {
                        line = line.withD04(inventory);
                    }
                    if (col == 4) {
                        line = line.withD05(inventory);
                    }
                    if (col == 5) {
                        line = line.withD06(inventory);
                    }
                    if (col == 6) {
                        line = line.withD07(inventory);
                    }
                    if (col == 7) {
                        line = line.withD08(inventory);
                    }
                    if (col == 8) {
                        line = line.withD09(inventory);
                    }
                    if (col == 9) {
                        line = line.withD10(inventory);
                    }
                    if (col == 10) {
                        line = line.withD11(inventory);
                    }
                    if (col == 11) {
                        line = line.withD12(inventory);
                    }
                    if (col == 12) {
                        line = line.withD13(inventory);
                    }
                    if (col == 13) {
                        line = line.withD14(inventory);
                    }
                    if (col == 14) {
                        line = line.withD15(inventory);
                    }
                    if (col == 15) {
                        line = line.withD16(inventory);
                    }
                    if (col == 16) {
                        line = line.withD17(inventory);
                    }
                    if (col == 17) {
                        line = line.withD18(inventory);
                    }
                    if (col == 18) {
                        line = line.withD19(inventory);
                    }
                    if (col == 19) {
                        line = line.withD20(inventory);
                    }
                    if (col == 20) {
                        line = line.withD21(inventory);
                    }
                    if (col == 21) {
                        line = line.withD22(inventory);
                    }
                    if (col == 22) {
                        line = line.withD23(inventory);
                    }
                    if (col == 23) {
                        line = line.withD24(inventory);
                    }
                    if (col == 24) {
                        line = line.withD25(inventory);
                    }
                    if (col == 25) {
                        line = line.withD26(inventory);
                    }
                    if (col == 26) {
                        line = line.withD27(inventory);
                    }
                    if (col == 27) {
                        line = line.withD28(inventory);
                    }
                    if (col == 28) {
                        line = line.withD29(inventory);
                    }
                    if (col == 29) {
                        line = line.withD30(inventory);
                    }
                    if (col == 30) {
                        line = line.withD31(inventory);
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
