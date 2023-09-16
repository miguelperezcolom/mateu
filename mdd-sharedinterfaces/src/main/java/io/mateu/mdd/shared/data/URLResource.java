package io.mateu.mdd.shared.data;

import io.mateu.mdd.shared.interfaces.FileType;
import io.mateu.mdd.shared.interfaces.IFileLocator;
import io.mateu.mdd.shared.interfaces.IResource;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class URLResource implements IResource {

  private URL url;

  public URLResource(URL url) {
    this.url = url;
  }

  @Override
  public FileType getType() {
    return FileType.URL;
  }

  @Override
  public String getName() {
    return url.getFile();
  }

  @Override
  public byte[] getBytes() {
    byte[] r = null;
    if (url != null) {
      try {
        r = DataHelper.readBytes(url);
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
    return r;
  }

  @Override
  public String getPath() {
    return url.toString();
  }

  @Override
  public void setType(FileType type) {}

  @Override
  public void setName(String name) {}

  @Override
  public void setBytes(byte[] bytes) {}

  @Override
  public void setPath(String path) {}

  @Override
  public IFileLocator toFileLocator() throws Exception {
    return url != null
        ? new IFileLocator() {

          @Override
          public String getUrl() {
            return url.toString();
          }

          @Override
          public long getId() {
            return 0;
          }

          @Override
          public void setId(long id) {}

          @Override
          public void setUrl(String url) {}

          @Override
          public String getFileName() {
            return url.getFile();
          }

          @Override
          public void setFileName(String fileName) {}

          @Override
          public boolean isModified() {
            return false;
          }

          @Override
          public void setModified(boolean modified) {}

          @Override
          public String getTmpPath() {
            return null;
          }

          @Override
          public void setTmpPath(String tmpPath) {}
        }
        : null;
  }

  @Override
  public void set(String name, String absolutePath) throws Exception {}

  @Override
  public void setUrl(String url) {
    try {
      this.url = new URL(url);
    } catch (MalformedURLException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void set(String value) throws Exception {
    setUrl(value);
  }

  @Override
  public String getUrl() {
    return url.toString();
  }
}
