package com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Label;
import lombok.With;

@With
public record StopSalesCalendarLine(
        String year,
        String month,
        @ColumnWidth("2rem")
        @Label("01")
        boolean d01,
        @ColumnWidth("2rem")
        @Label("02")
        boolean d02,
        @ColumnWidth("2rem")
        @Label("03")
        boolean d03,
        @ColumnWidth("2rem")
        @Label("04")
        boolean d04,
        @ColumnWidth("2rem")
        @Label("05")
        boolean d05,
        @ColumnWidth("2rem")
        @Label("06")
        boolean d06,
        @ColumnWidth("2rem")
        @Label("07")
        boolean d07,
        @ColumnWidth("2rem")
        @Label("08")
        boolean d08,
        @ColumnWidth("2rem")
        @Label("09")
        boolean d09,
        @ColumnWidth("2rem")
        @Label("10")
        boolean d10,
        @ColumnWidth("2rem")
        @Label("11")
        boolean d11,
        @ColumnWidth("2rem")
        @Label("12")
        boolean d12,
        @ColumnWidth("2rem")
        @Label("13")
        boolean d13,
        @ColumnWidth("2rem")
        @Label("14")
        boolean d14,
        @ColumnWidth("2rem")
        @Label("15")
        boolean d15,
        @ColumnWidth("2rem")
        @Label("16")
        boolean d16,
        @ColumnWidth("2rem")
        @Label("17")
        boolean d17,
        @ColumnWidth("2rem")
        @Label("18")
        boolean d18,
        @ColumnWidth("2rem")
        @Label("19")
        boolean d19,
        @ColumnWidth("2rem")
        @Label("20")
        boolean d20,
        @ColumnWidth("2rem")
        @Label("21")
        boolean d21,
        @ColumnWidth("2rem")
        @Label("22")
        boolean d22,
        @ColumnWidth("2rem")
        @Label("23")
        boolean d23,
        @ColumnWidth("2rem")
        @Label("24")
        boolean d24,
        @ColumnWidth("2rem")
        @Label("25")
        boolean d25,
        @ColumnWidth("2rem")
        @Label("26")
        boolean d26,
        @ColumnWidth("2rem")
        @Label("27")
        boolean d27,
        @ColumnWidth("2rem")
        @Label("28")
        boolean d28,
        @ColumnWidth("2rem")
        @Label("29")
        boolean d29,
        @ColumnWidth("2rem")
        @Label("30")
        boolean d30,
        @ColumnWidth("2rem")
        @Label("31")
        boolean d31
) {
}
