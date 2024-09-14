package io.mateu.core.domain.uidefinition.shared.interfaces;

public interface IResource {
  FileType getType();

  String getName();

  byte[] getBytes();

  String getPath();

  void setType(FileType type);

  void setName(String name);

  void setBytes(byte[] bytes);

  void setPath(String path);

  IFileLocator toFileLocator();

  void set(String name, String absolutePath);

  void setUrl(String o);

  void set(String value);

  String getUrl();
}
