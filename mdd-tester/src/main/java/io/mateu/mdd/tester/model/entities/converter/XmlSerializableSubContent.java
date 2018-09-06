package io.mateu.mdd.tester.model.entities.converter;

import io.mateu.mdd.core.util.XMLSerializable;
import lombok.Getter;
import lombok.Setter;
import org.jdom2.Element;

@Getter@Setter
public class XmlSerializableSubContent implements XMLSerializable {

    private String name = "";

    private int age;

    public XmlSerializableSubContent() {

    }

    public XmlSerializableSubContent(Element xml) {
        fromXml(xml);
    }

    @Override
    public Element toXml() {
        Element xml = new Element("sub").setAttribute("className", getClass().getName()).setAttribute("name", getName()).setAttribute("age", "" + getAge());


        return xml;
    }

    @Override
    public void fromXml(Element xml) {

        if (xml != null) {
            name = xml.getAttributeValue("name");
            age = Integer.parseInt(xml.getAttributeValue("age"));
        }

    }


    @Override
    public String toString() {
        return getName();
    }
}
