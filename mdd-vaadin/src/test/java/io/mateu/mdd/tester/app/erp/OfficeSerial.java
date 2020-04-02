package io.mateu.mdd.tester.app.erp;

import com.google.common.base.Strings;
import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;
import java.text.DecimalFormat;
import java.time.LocalDate;

@MateuMDDEntity
public class OfficeSerial {

    @NotEmpty
    private String name;

    private boolean yearIncluded;

    private boolean officeIncluded;

    private String pattern;

    private long next;

    public String getNextId(String officeId) {
        String s = "";
        if (yearIncluded) s += LocalDate.now().getYear() % 1000;
        if (officeIncluded) s += officeId;
        if (!Strings.isNullOrEmpty(pattern)) {
            s += new DecimalFormat(pattern).format(next);
        } else s += next;
        next++;
        return s;
    }

    public OfficeSerial(String name, boolean yearIncluded, boolean officeIncluded, String pattern, long next) {
        this.name = name;
        this.yearIncluded = yearIncluded;
        this.officeIncluded = officeIncluded;
        this.pattern = pattern;
        this.next = next;
    }
}
