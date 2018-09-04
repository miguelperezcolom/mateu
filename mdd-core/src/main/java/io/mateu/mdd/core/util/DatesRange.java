package io.mateu.mdd.core.util;

import org.jdom2.Element;

import java.io.Serializable;
import java.time.LocalDate;

public class DatesRange implements Serializable, io.mateu.mdd.core.util.XMLSerializable {

    private LocalDate start;
    private LocalDate end;

    public DatesRange() {
    }

    public DatesRange(LocalDate start, LocalDate end) {
        this.start = start;
        this.end = end;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end) {
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

}
