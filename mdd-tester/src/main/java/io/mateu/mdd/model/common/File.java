package io.mateu.mdd.model.common;

import io.mateu.ui.core.server.Utils;
import io.mateu.ui.core.shared.FileLocator;
import io.mateu.ui.mdd.server.annotations.Required;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.net.URL;

/**
 * Created by miguel on 27/3/17.
 */
@Entity@Getter@Setter
public class File implements io.mateu.ui.mdd.server.interfaces.File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Required
    private String name;

    private String path;

    private byte[] bytes;

    public FileLocator toFileLocator() throws Exception {
        String extension = ".tmp";
        String fileName = getName();

        if (getName() == null || "".equals(getName().trim())) fileName = "" + getId();
        if (fileName.lastIndexOf(".") < fileName.length() - 1) {
            extension = fileName.substring(fileName.lastIndexOf("."));
            fileName = fileName.substring(0, fileName.lastIndexOf(".")).replaceAll(" ", "_");
        }

        java.io.File temp = (System.getProperty("tmpdir") == null)? java.io.File.createTempFile(fileName, extension):new java.io.File(new java.io.File(System.getProperty("tmpdir")), fileName + extension);

        System.out.println("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        System.out.println("Temp file : " + temp.getAbsolutePath());

        if (System.getProperty("tmpdir") == null || !temp.exists()) {
            System.out.println("writing temp file to " + temp.getAbsolutePath());
            Utils.write(temp, bytes);
        } else {
            System.out.println("temp file already exists");
        }

        String baseUrl = System.getProperty("tmpurl");
        URL url = null;
        if (baseUrl == null) {
            url = temp.toURI().toURL();
        } else url = new URL(baseUrl + "/" + temp.getName());


        return new FileLocator(id, temp.getName(), url.toString());
    }

    @Override
    public void set(String fileName, String tmpPath) throws Exception {
        setName(fileName);
        setBytes(Utils.readBytes(tmpPath));
    }

}
