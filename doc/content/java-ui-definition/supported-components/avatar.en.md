---
title: "Avatar"
weight: 100
---


An avatar shows one or more users avatars.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
                        "type": "ClientSide",
                        "children": [
                            {
                                "type": "ClientSide",
                                "metadata": {
                                    "type": "Avatar",
                                    "name": "Mateu Pérez"
                                },
                                "id": "fieldId"
                            },
                            {
                                "type": "ClientSide",
                                "metadata": {
                                    "type": "Avatar",
                                    "name": "Mateu Pérez",
                                    "image": "/images/mateu.png"
                                },
                                "id": "fieldId"
                            },
                            {
                                "type": "ClientSide",
                                "metadata": {
                                    "type": "AvatarGroup",
                                    "avatars": [
                                        {
                                            "type": "Avatar",
                                            "name": "Mateu Pérez"
                                        },
                                        {
                                            "type": "Avatar",
                                            "name": "Antònia Galmés"
                                        },
                                        {
                                            "type": "Avatar",
                                            "name": "Miguel Pérez"
                                        }
                                    ],
                                    "maxItemsVisible": 2
                                },
                                "id": "fieldId"
                            }
                        ],
                        "metadata": {
                            "type": "VerticalLayout"
                        }
                    };

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

            VerticalLayout.builder()
                .content(List.of(
                  
                        Avatar.builder().name("Mateu Pérez")
                                        .build(),
                        
                        Avatar.builder().name("Mateu Pérez")
                                        .image("/images/mateu.png")
                                        .build(),
                        
                        new AvatarGroup(List.of(
                                Avatar.builder().name("Mateu Pérez").build(),
                                Avatar.builder().name("Antònia Galmés").build(),
                                Avatar.builder().name("Miguel Pérez").build()
                            ), 2)
                              
                      ))
                 .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for an avatar:

| Property         | Description            | Notes                                            |
|------------------|------------------------|--------------------------------------------------|
| **id**           | id for this component  |                                                  |
| **cssClasses**   | list of css classes    | content of the css attribute                     |
| **style**        | inline style attributes | content of the style attribute                   |
| **name**         | name of the avatar     | automatically shows the initials                 |
| **image**        | image for the avatar   |                                                  |
| **abbreviation** | abbreviation           | automatically shows the initials, if not present |


And this is the list of available properties for an avatar group:

| Property            | Description | Notes                             |
|---------------------|-------------|-----------------------------------|
| **maxItemsVisible** | a number    | a +x will be showed if more items |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/avatar



