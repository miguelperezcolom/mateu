package com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Label;
import lombok.With;

@With
public record InventoryCalendarLine(
        @ColumnWidth("4rem")
        String year,
        @ColumnWidth("3rem")
        String month,
        @ColumnWidth("3rem")
        String roomTypeCode,
        @ColumnWidth("2rem")
        @Label("01")
        int d01,
        @ColumnWidth("2rem")
        @Label("02")
        int d02,
        @ColumnWidth("2rem")
        @Label("03")
        int d03,
        @ColumnWidth("2rem")
        @Label("04")
        int d04,
        @ColumnWidth("2rem")
        @Label("05")
        int d05,
        @ColumnWidth("2rem")
        @Label("06")
        int d06,
        @ColumnWidth("2rem")
        @Label("07")
        int d07,
        @ColumnWidth("2rem")
        @Label("08")
        int d08,
        @ColumnWidth("2rem")
        @Label("09")
        int d09,
        @ColumnWidth("2rem")
        @Label("10")
        int d10,
        @ColumnWidth("2rem")
        @Label("11")
        int d11,
        @ColumnWidth("2rem")
        @Label("12")
        int d12,
        @ColumnWidth("2rem")
        @Label("13")
        int d13,
        @ColumnWidth("2rem")
        @Label("14")
        int d14,
        @ColumnWidth("2rem")
        @Label("15")
        int d15,
        @ColumnWidth("2rem")
        @Label("16")
        int d16,
        @ColumnWidth("2rem")
        @Label("17")
        int d17,
        @ColumnWidth("2rem")
        @Label("18")
        int d18,
        @ColumnWidth("2rem")
        @Label("19")
        int d19,
        @ColumnWidth("2rem")
        @Label("20")
        int d20,
        @ColumnWidth("2rem")
        @Label("21")
        int d21,
        @ColumnWidth("2rem")
        @Label("22")
        int d22,
        @ColumnWidth("2rem")
        @Label("23")
        int d23,
        @ColumnWidth("2rem")
        @Label("24")
        int d24,
        @ColumnWidth("2rem")
        @Label("25")
        int d25,
        @ColumnWidth("2rem")
        @Label("26")
        int d26,
        @ColumnWidth("2rem")
        @Label("27")
        int d27,
        @ColumnWidth("2rem")
        @Label("28")
        int d28,
        @ColumnWidth("2rem")
        @Label("29")
        int d29,
        @ColumnWidth("2rem")
        @Label("30")
        int d30,
        @ColumnWidth("2rem")
        @Label("31")
        int d31
) {
}
