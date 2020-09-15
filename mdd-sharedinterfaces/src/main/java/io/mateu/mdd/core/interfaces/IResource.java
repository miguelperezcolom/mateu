package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.data.FileLocator;

public interface IResource {
    FileType getType();

    String getName();

    byte[] getBytes();

    String getPath();

    void setType(FileType type);


    void setName(String name);

    void setBytes(byte[] bytes);

    void setPath(String path);

    FileLocator toFileLocator() throws Exception;

    void set(String name, String absolutePath) throws Exception;

    void setUrl(String o);

    void set(String value) throws Exception;

    String getUrl();
}
