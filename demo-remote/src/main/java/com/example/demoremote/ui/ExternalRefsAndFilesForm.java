package com.example.demoremote.ui;

import com.example.demoremote.providers.PlayersProvider;
import com.example.demoremote.providers.TeamsProvider;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import lombok.Data;

import java.io.File;
import java.util.List;

@Data
@Caption("External refs and files")
public class ExternalRefsAndFilesForm {

    @Section("External refs")
    @ItemsProvider(PlayersProvider.class)
    private ExternalReference yourFavouritePlayer;

    @ItemsProvider(TeamsProvider.class)
    private ExternalReference teamAtSanFrancisco = new ExternalReference("25", "San Francisco 49ers");

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
        assessment = "" + yourFavouritePlayer
                + ", " + teamAtSanFrancisco
                + ", " + singleFile
                + ", " + files
                + ", " + singleFileAsString
                + ", " + filesAsStrings
        ;
    }

}