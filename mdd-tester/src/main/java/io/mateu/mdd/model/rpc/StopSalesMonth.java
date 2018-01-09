package io.mateu.mdd.model.rpc;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.server.annotations.ListColumn;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class StopSalesMonth {

    @ListColumn
    private int year;
    @ListColumn
    private int month;

    @ListColumn("01")
    private Data day_1;
    @ListColumn("02")
    private Data day_2;
    @ListColumn("03")
    private Data day_3;
    @ListColumn("04")
    private Data day_4;
    @ListColumn("05")
    private Data day_5;
    @ListColumn("06")
    private Data day_6;
    @ListColumn("07")
    private Data day_7;
    @ListColumn("08")
    private Data day_8;
    @ListColumn("09")
    private Data day_9;
    @ListColumn("10")
    private Data day_10;
    @ListColumn("11")
    private Data day_11;
    @ListColumn("12")
    private Data day_12;
    @ListColumn("13")
    private Data day_13;
    @ListColumn("14")
    private Data day_14;
    @ListColumn("15")
    private Data day_15;
    @ListColumn("16")
    private Data day_16;
    @ListColumn("17")
    private Data day_17;
    @ListColumn("18")
    private Data day_18;
    @ListColumn("19")
    private Data day_19;
    @ListColumn("20")
    private Data day_20;
    @ListColumn("21")
    private Data day_21;
    @ListColumn("22")
    private Data day_22;
    @ListColumn("23")
    private Data day_23;
    @ListColumn("24")
    private Data day_24;
    @ListColumn("25")
    private Data day_25;
    @ListColumn("26")
    private Data day_26;
    @ListColumn("27")
    private Data day_27;
    @ListColumn("28")
    private Data day_28;
    @ListColumn("29")
    private Data day_29;
    @ListColumn("30")
    private Data day_30;
    @ListColumn("31")
    private Data day_31;

}
