package io.mateu.mdd.shared.interfaces;


public interface IResource {
    FileType getType();

    String getName();

    byte[] getBytes();

    String getPath();

    void setType(FileType type);


    void setName(String name);

    void setBytes(byte[] bytes);

    void setPath(String path);

    IFileLocator toFileLocator() throws Exception;

    void set(String name, String absolutePath) throws Exception;

    void setUrl(String o);

    void set(String value) throws Exception;

    String getUrl();
}
