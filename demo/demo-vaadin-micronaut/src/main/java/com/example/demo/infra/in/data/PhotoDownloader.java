package com.example.demo.infra.in.data;

import io.mateu.core.application.runaction.RunActionCommand;
import lombok.SneakyThrows;

import java.io.File;
import java.nio.file.Files;

import static com.example.demo.infra.out.commandline.ShellCommandRunner.runCommand;
import static io.mateu.core.infra.InputStreamReader.readFromClasspath;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.pojoFromJson;

public class PhotoDownloader {

    @SneakyThrows
    public static void main(String[] args) {
        var json = readFromClasspath(PhotoDownloader.class, "/rra/cars.json");
        Cars cars = pojoFromJson(json, Cars.class);
        System.out.println(cars.photos().photosList().size());
        var curDir = new File("./demo/demo-vaadin-micronaut/src/main/resources/static/images/cars");
        System.out.println(curDir.getAbsolutePath());
        System.out.println(curDir.exists());
        cars.photos().photosList().forEach(photo -> {
            System.out.println("downloading " + photo.originalImgPath());
            System.out.println(photo.fileName());
            if (false) {
                runCommand("curl --output-dir " + curDir.getAbsolutePath() + " -O " + photo.originalImgPath());
            }
        });
    }
}
