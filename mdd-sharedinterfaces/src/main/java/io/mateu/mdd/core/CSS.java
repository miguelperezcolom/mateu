package io.mateu.mdd.core;

public class CSS {


    public static final String SOFTGREENBGD = "mdd-softgreen-bgd";
    public static final String SOFTREDBGD = "mdd-softred-bgd";
    public static final String SOFTYELLOWBGD = "mdd-softyellow-bgd";
    public static final String GREENBGD = "mdd-green-bgd";
    public static final String ORANGEBGD = "mdd-orange-bgd";
    public static final String REDBGD = "mdd-red-bgd";
    public static final String YELLOWBGD = "mdd-yellow-bgd";
    public static final String BROWNBGD = "mdd-brown-bgd";
    public static final String GREYBGD = "mdd-grey-bgd";
    public static final String WHITEBGD = "mdd-white-bgd";
    public static final String BLUEBGD = "mdd-blue-bgd";

    public static final String GREENFGD = "mdd-green-fgd";
    public static final String ORANGEFGD = "mdd-orange-fgd";
    public static final String REDFGD = "mdd-red-fgd";
    public static final String YELLOWFGD = "mdd-yellow-fgd";
    public static final String BROWNFGD = "mdd-brown-fgd";
    public static final String GREYFGD = "mdd-grey-fgd";
    public static final String WHITEFGD = "mdd-white-fgd";
    public static final String BLUEFGD = "mdd-blue-fgd";

    public static final String BOLD = "mdd-bold";
    public static final String BOLDER = "mdd-bolder";

    public static final String CANCELLED = "cancelled";

    public static final String SALE = "sale";
    public static final String PURCHASE = "purchase";

    public static final String TOTAL = "total";


    public static final String NOPADDING = "nopadding";
    public static final String LITTLEPADDING = "littlepadding";

    public static final String RIGHTALIGN = "alinearderecha";
    public static final String ALIGNRIGHT = "alinearderecha";
    public static final String ALIGNCENTER = "alinearcentro";


    public static final String SUPERKPI = "superkpi";
    public static final String CLICKABLE = "clickable";


    static String[] round = {
            GREENBGD,
            ORANGEBGD,
            REDBGD,
            YELLOWBGD,
            BROWNBGD,
            GREYBGD,
            BLUEBGD
    };

    public static String get(int i) {
        return round[i % round.length];
    }

}
