package com.example.demoremote.ui.demoApp.menus.refs;

import com.example.demoremote.domains.nfl.providers.PlayersProvider;
import com.example.demoremote.domains.nfl.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.io.File;
import java.util.List;

@Data
@Caption("External refs and files")
public class FilesForm {

    @Section("Files")
    private File singleFile;

    private File[] files;

    @Section("Files using strings")
    @io.mateu.mdd.shared.annotations.File
    private String singleFileAsString;

    @io.mateu.mdd.shared.annotations.File
    private List<String> filesAsStrings;

    @Section("Assessment")
    @ReadOnly
    private String assessment;


    @Action
    public void assess() {
        assessment = singleFile
                + ", " + files
                + ", " + singleFileAsString
                + ", " + filesAsStrings
        ;
    }

}
