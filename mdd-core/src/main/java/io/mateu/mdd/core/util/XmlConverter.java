package io.mateu.mdd.core.util;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.xml.XMLSerializable;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.io.StringReader;

@Converter
public class XmlConverter implements AttributeConverter<Object, String> {


    @Override
    public String convertToDatabaseColumn(Object xmlSerializable) {
        if (xmlSerializable == null) return null;
        else {
            Element xml = (xmlSerializable instanceof XMLSerializable)?((XMLSerializable)xmlSerializable).toXml():ReflectionHelper.toXml(xmlSerializable);
            if (xml == null) return null;
            else {
                if (xml.getAttribute("className") == null) xml.setAttribute("className", xmlSerializable.getClass().getName());
                return new XMLOutputter(Format.getPrettyFormat()).outputString(xml);
            }
        }
    }

    @Override
    public Object convertToEntityAttribute(String s) {
        if (s == null || "".equals(s)) return null;
        try {
            Document doc = new SAXBuilder().build(new StringReader(s));
            String className = doc.getRootElement().getAttributeValue("className");
            Object i = Class.forName(className).newInstance();
            if (i instanceof XMLSerializable) {
                ((XMLSerializable) i).fromXml(doc.getRootElement());
            } else {
                i = ReflectionHelper.fromXml(s);
            }
            return i;
        } catch (JDOMException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }
}
