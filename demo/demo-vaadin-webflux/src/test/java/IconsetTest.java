import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.util.SerializerService;
import jakarta.inject.Inject;
import org.apache.commons.io.FileUtils;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;

//@SpringBootTest
public class IconsetTest {

    @Inject
    SerializerService s;
    @Inject
    Humanizer h;

    //@Test
    void test() throws IOException, JDOMException {

        File file = new File("/Users/mguel/IdeaProjects/mateu/.dev/vaadin-icons.xml");
        String raw = FileUtils.readFileToString(file, "UTF-8");

        Document doc = new SAXBuilder().build(new StringReader(raw));

        Element root = doc.getRootElement();

        root.getChild("svg").getChild("defs").getChildren("g").stream()
                .forEach(g -> {
                    String id = g.getAttributeValue("id");
                    String name = id.substring(id.indexOf(":") + 1);
                    String name2 = name.replaceAll("-", " ");
                    String camelCase = h.camelcasize(name2);
                    String CamelCase = camelCase.substring(0, 1).toUpperCase() + camelCase.substring(1);
                    System.out.println(CamelCase + "(\"" + id + "\"),");

                });

    }
}
