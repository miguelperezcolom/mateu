package io.mateu.mdd.core.model.population;

import io.mateu.mdd.util.Helper;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class YamlPopulator {
    public void populate(InputStream dataStream) throws IOException {

        Map<String, Object> data = Helper.fromYaml(Helper.leerFichero(dataStream));

        System.out.println(Helper.toJson(data));

    }
}
