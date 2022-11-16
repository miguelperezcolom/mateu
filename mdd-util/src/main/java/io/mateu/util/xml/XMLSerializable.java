package io.mateu.util.xml;

import org.jdom2.Element;

import java.io.Serializable;

public interface XMLSerializable extends Serializable {

    Element toXml();

    void fromXml(Element xml);

}
