package io.mateu;

import static io.mateu.core.domain.Humanizer.toCamelCase;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import org.apache.commons.io.FileUtils;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class IconsetGenerator {

  @Test
  @Disabled
  void test() throws IOException, JDOMException {

    File file = new File("../../../.dev/vaadin-icons.xml");
    System.out.println(file.getAbsolutePath());
    String raw = FileUtils.readFileToString(file, "UTF-8");

    Document doc = new SAXBuilder().build(new StringReader(raw));

    Element root = doc.getRootElement();

    root.getChild("svg").getChild("defs").getChildren("g").stream()
        .forEach(
            g -> {
              String id = g.getAttributeValue("id");
              String name = id.substring(id.indexOf(":") + 1);
              String name2 = name.replaceAll("-", " ");
              String camelCase = toCamelCase(name2);
              String CamelCase = camelCase.substring(0, 1).toUpperCase() + camelCase.substring(1);
              System.out.println(CamelCase + "(\"" + id + "\"),");
            });
  }
}
