package io.mateu.mdd.tester.model.entities.converter;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.xml.XMLSerializable;
import lombok.Getter;
import lombok.Setter;
import org.jdom2.Element;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class XmlSerializableContent implements XMLSerializable {


    private String name;

    private int age;

    private List<XmlSerializableSubContent> subContents = new ArrayList<>();


    @Override
    public Element toXml() {
        Element xml = new Element("element").setAttribute("className", getClass().getName()).setAttribute("name", getName()).setAttribute("age", "" + getAge());

        for (XmlSerializableSubContent s : subContents) {
            xml.addContent(s.toXml());
        }

        return xml;

    }

    @Override
    public void fromXml(Element xml) {
        if (xml != null) {
            name = xml.getAttributeValue("name");
            age = Integer.parseInt(xml.getAttributeValue("age"));
            for (Element s : xml.getChildren("sub")) {
                subContents.add(new XmlSerializableSubContent(s));
            }
        }
    }


    @Override
    public String toString() {
        return getName();
    }

    @Override
    public boolean equals(Object obj) {
        return Helper.areXmlSerializableEqual(this, (XMLSerializable) obj);
    }
}
