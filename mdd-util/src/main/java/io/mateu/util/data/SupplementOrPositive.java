package io.mateu.util.data;

import com.google.common.base.Strings;

import java.io.IOException;

/**
 * Created by miguel on 23/10/16.
 */
public class SupplementOrPositive extends Data {

    public SupplementOrPositive(SupplementOrPositiveType type, double value) {
        setType(type);
        setValue(value);
    }

    public SupplementOrPositive(SupplementOrPositive value) {
        clear();
        if (value != null) {
            setValue(value.getValue());
            setType(value.getType());
        }
    }

    public SupplementOrPositive(String json) throws IOException {
        super(json);
    }

    public SupplementOrPositive() {

    }

    public SupplementOrPositiveType getType() {
        return get("type");
    }

    public void setType(SupplementOrPositiveType value) {
        set("type", value);
    }

    public double getValue() {
        return get("value");
    }

    public void setValue(double value) {
        set("value", value);
    }

    public String toStringValue() {
        double v = getValue();

        String s = null;
        switch (getType()) {
            case SUPPLEMENT: s = ((v >= 0)?"+":"-") + v; break;
            case SUPPLEMENT_PERCENT: s = ((v >= 0)?"+":"-") + v + "%"; break;
            case VALUE: s = "" + v; break;
            default: s = "";
        }
        return s;
    }

    public static SupplementOrPositive fromStringValue(String s) {
        if (!Strings.isNullOrEmpty(s)) {
            SupplementOrPositiveType t;
            if (s.endsWith("%")) t = SupplementOrPositiveType.SUPPLEMENT_PERCENT;
            else if (s.startsWith("+") || s.startsWith("-")) t = SupplementOrPositiveType.SUPPLEMENT;
            else t = SupplementOrPositiveType.VALUE;
            s = s.replaceAll("%", "").replaceAll("\\+", "");
            if (s.endsWith(".")) s = s.replaceAll("\\.", "");
            double v = Double.parseDouble(s);
            return new SupplementOrPositive(t, v);
        } else {
            return null;
        }
    }

}
