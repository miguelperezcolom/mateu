package io.mateu.util.data;


import io.mateu.mdd.shared.interfaces.IFileLocator;

import java.io.IOException;

/**
 * Created by miguel on 4/1/17.
 */
public class FileLocator extends Data implements IFileLocator {

    public FileLocator(long id, String fileName, String url) {
        setId(id);
        setFileName(fileName);
        setUrl(url);
    }

    public FileLocator(FileLocator value) {
        clear();
        if (value != null) {
            setId(value.getId());
            setFileName(value.getFileName());
            setUrl(value.getUrl());
        }
    }

    public FileLocator(long id, String fileName, String url, String tmpPath) {
        setId(id);
        setFileName(fileName);
        setUrl(url);
        setModified(true);
        setTmpPath(tmpPath);
    }

    public FileLocator(String id, String name, String url, String json) throws IOException {
        super(json);
    }

    public String getUrl() {
        return get("_url");
    }

    public long getId() {
        return get("_id");
    }

    public void setId(long id) {
        set("_id", id);
    }

    public void setUrl(String url) {
        set("_url", url);
    }

    public String getFileName() {
        return get("_filename");
    }

    public void setFileName(String fileName) {
        set("_filename", fileName);
    }

    public boolean isModified() { return getBoolean("_modified"); }

    public void setModified(boolean modified) { set("_modified", modified); }

    public String getTmpPath() {
        return get("_tmppath");
    }

    public void setTmpPath(String tmpPath) {
        set("_tmppath", tmpPath);
    }

}
