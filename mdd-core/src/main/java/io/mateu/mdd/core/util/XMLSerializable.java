package io.mateu.mdd.core.util;

import org.jdom2.Element;

public interface XMLSerializable {

    Element toXml();

    void fromXml(Element xml);
}
