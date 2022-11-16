package io.mateu.util.common;

import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.util.xml.XMLSerializable;
import lombok.Getter;
import lombok.Setter;
import org.jdom2.Element;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Getter@Setter
public class DatesRange implements Serializable, XMLSerializable {

    @Ignored
    private static final long serialVersionUID = 1L;

    private LocalDate start;
    private LocalDate end;

    public DatesRange() {
    }

    public DatesRange(LocalDate start, LocalDate end) {
        this.start = start;
        this.end = end;
    }

    public DatesRange(Element e) {
        fromXml(e);
    }

    @Override
    public Element toXml() {

        Element e = new Element("range");

        if (getStart() != null) e.setAttribute("start", getStart().toString());
        if (getEnd() != null) e.setAttribute("end", getEnd().toString());

        return e;
    }

    @Override
    public void fromXml(Element e) {
        if (e != null) {
            if (e.getAttribute("start") != null) setStart(LocalDate.parse(e.getAttributeValue("start")));
            if (e.getAttribute("end") != null) setEnd(LocalDate.parse(e.getAttributeValue("end")));
        }
    }


    @Override
    public String toString() {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter fm = DateTimeFormatter.ofPattern("MM-dd");
        DateTimeFormatter fd = DateTimeFormatter.ofPattern("dd");
        String s = "[";
        if (start != null) s += "from " + start.format(f);
        if (end != null) {
            if (!"".equals(s)) s += " ";
            DateTimeFormatter fx = f;
            if (start != null && start.getYear() == end.getYear() && start.getMonthValue() == end.getMonthValue()) fx = fd;
            else if (start != null && start.getYear() == end.getYear()) fx = fm;
            s += "to " + end.format(fx);
        }
        s += "]";

        return s;
    }


    @Override
    public int hashCode() {
        return getClass().getName().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj;
    }
}
