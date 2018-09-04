package io.mateu.mdd.core.model.common;

import com.google.common.base.Strings;
import io.mateu.mdd.core.data.FileLocator;
import io.mateu.mdd.core.util.Utils;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.net.URL;

/**
 * Created by miguel on 27/3/17.
 */
@Entity@Getter@Setter
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    private FileType type = FileType.BYTES;

    private String name;

    private String path;

    private byte[] bytes;


    private String url;


    public Resource() {

    }

    public Resource(URL url) {
        this.type = FileType.URL;
        this.url = url.toString();
        this.name = url.getFile();
    }


    public byte[] getBytes() {
        if (FileType.BYTES.equals(type)) return bytes;
        else {
            byte[] r = null;
            if (!Strings.isNullOrEmpty(url)) {
                try {
                    r = Utils.readBytes(new URL(url));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return r;
        }
    }


    public FileLocator toFileLocator() throws Exception {

        if (FileType.BYTES.equals(type)) {

            if (bytes != null) {

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


                return new FileLocator(id, name, url.toString());

            } else {
                return new FileLocator(id, null, null);
            }

        } else {
            return new FileLocator(id, name, url);
        }
    }

    public void set(String fileName, String tmpPath) throws Exception {
        setName(fileName);
        setBytes(Utils.readBytes(tmpPath));
        setUrl(null);
        setType(FileType.BYTES);
    }

    public void set(String url) throws Exception {
        setName((!Strings.isNullOrEmpty(url))?new URL(url).getFile().substring(new URL(url).getFile().lastIndexOf("/") + 1):null);
        setBytes(null);
        setUrl(url);
        setType(FileType.URL);
    }

    public void dowload(URL url) throws Exception {
        setName(url.getFile());
        setBytes(Utils.readBytes(url));
        setUrl(null);
        setType(FileType.BYTES);
    }

}
