package io.mateu.showcase.tester.model.entities.converter;


import io.mateu.mdd.core.annotations.Section;
import io.mateu.mdd.core.util.JsonConverter;
import io.mateu.mdd.core.util.XmlConverter;
import io.mateu.mdd.core.util.YamlConverter;

import javax.persistence.Convert;
import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class WithConverterDemoEntity {

    @Id
    @GeneratedValue
    private long id;


    private String name;

    @Section("XMLSerializable")
    @Convert(converter = XmlConverter.class)
    private XmlSerializableContent xmlSerializableContent;

    @Section("As xml")
    @Convert(converter = XmlConverter.class)
    private SerializableContent asXml;


    @Section("As json")
    @Convert(converter = JsonConverter.class)
    private SerializableContent asJson;


    @Section("As yaml")
    @Convert(converter = YamlConverter.class)
    private SerializableContent asYaml;

}
