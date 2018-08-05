package io.mateu.mdd.core;

public class CSS {


    public static final String GREENBGD = "mdd-green-bgd";
    public static final String ORANGEBGD = "mdd-orange-bgd";
    public static final String REDBGD = "mdd-red-bgd";
    public static final String YELLOWBGD = "mdd-yellow-bgd";
    public static final String BROWNBGD = "mdd-brown-bgd";
    public static final String GREYBGD = "mdd-grey-bgd";
    public static final String WHITEBGD = "mdd-white-bgd";
    public static final String BLUEBGD = "mdd-blue-bgd";

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
