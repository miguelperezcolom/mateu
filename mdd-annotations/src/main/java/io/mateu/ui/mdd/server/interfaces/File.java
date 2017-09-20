package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.FileLocator;

import java.io.FileNotFoundException;

/**
 * Created by miguel on 27/3/17.
 */
public interface File {

    public FileLocator toFileLocator() throws Exception;

    void set(String fileName, String tmpPath) throws FileNotFoundException, Exception;
}
