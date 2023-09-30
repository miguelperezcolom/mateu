package io.mateu.util.xml;

import java.io.Serializable;
import org.jdom2.Element;

public interface XMLSerializable extends Serializable {

  Element toXml();

  void fromXml(Element xml);
}
