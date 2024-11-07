package io.mateu.uidl.core.interfaces;

public interface IFileLocator {

  String getUrl();

  long getId();

  void setId(long id);

  void setUrl(String url);

  String getFileName();

  void setFileName(String fileName);

  boolean isModified();

  void setModified(boolean modified);

  String getTmpPath();

  void setTmpPath(String tmpPath);
}
