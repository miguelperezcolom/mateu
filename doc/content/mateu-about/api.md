---
title: "API"
weight: 17
---

# Mateu API v3.0.0

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menuBar.

## Endpoints

### Get UI

<a id="opIdgetUI"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /your-context-path/mateu/v3/ui \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /your-context-path/mateu/v3/ui HTTP/1.1

Content-Type: application/json
Accept: application/json

```

`POST /your-context-path/mateu/v3/ui`

> Body parameter

```json
{
  "config": {},
  "path": "string"
}
```

<h3 id="getui-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[GetUIRqDto](#schemagetuirqdto)|true|none|

> Example responses

> 200 Response

```json
{
  "favIcon": "string",
  "title": "string",
  "homeRoute": "string",
  "home": {
    "messages": [
      {
        "type": "Success",
        "title": "string",
        "text": "string",
        "duration": 0
      }
    ],
    "commands": [
      {
        "type": "CloseModal",
        "data": null
      }
    ],
    "fragments": [
      {
        "targetComponentId": "string",
        "component": {
          "children": [
            {}
          ],
          "metadata": {},
          "id": "string",
          "serverSideType": "string"
        },
        "data": null
      }
    ],
    "sharedData": null,
    "appState": null
  }
}
```

<h3 id="getui-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|getUI 200 response|[UIDto](#schemauidto)|

<aside class="success">
This operation does not require authentication
</aside>

### Run Action

<a id="opIdrunStep"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /your-context-path/mateu/v3/{route}/{actionId} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /your-context-path/mateu/v3/{route}/{actionId} HTTP/1.1

Content-Type: application/json
Accept: application/json

```

`POST /your-context-path/mateu/v3/{route}/{actionId}`

> Body parameter

```json
{
  "data": {},
  "appState": {},
  "componentType": "string",
  "initiatorComponentId": "string",
  "consumedRoute": "string"
}
```

<h3 id="runstep-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|route|path|string|true|none|
|actionId|path|string|true|none|
|body|body|[RunActionRqDto](#schemarunactionrqdto)|true|none|

> Example responses

> 200 Response

```json
{
  "messages": [
    {
      "type": "Success",
      "title": "string",
      "text": "string",
      "duration": 0
    }
  ],
  "commands": [
    {
      "type": "CloseModal",
      "data": null
    }
  ],
  "fragments": [
    {
      "targetComponentId": "string",
      "component": {
        "children": [
          {}
        ],
        "metadata": {},
        "id": "string",
        "serverSideType": "string"
      },
      "data": null
    }
  ],
  "sharedData": null,
  "appState": null
}
```

<h3 id="runstep-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|runStep 200 response|[UIIncrementDto](#schemauiincrementdto)|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

## ComponentDto
<!-- backwards compatibility -->
<a id="schemacomponentdto"></a>
<a id="schema_ComponentDto"></a>
<a id="tocScomponentdto"></a>
<a id="tocscomponentdto"></a>

```json
{
  "children": [
    {
      "children": [],
      "metadata": {},
      "id": "string",
      "serverSideType": "string"
    }
  ],
  "metadata": {},
  "id": "string",
  "serverSideType": "string"
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|children|[[ComponentDto](#schemacomponentdto)]|true|none|none|
|metadata|[ComponentMetadataDto](#schemacomponentmetadatadto)|true|none|none|
|id|string|true|none|none|
|serverSideType|string|true|none|none|

## ComponentMetadataDto
<!-- backwards compatibility -->
<a id="schemacomponentmetadatadto"></a>
<a id="schema_ComponentMetadataDto"></a>
<a id="tocScomponentmetadatadto"></a>
<a id="tocscomponentmetadatadto"></a>

```json
{}

```

<h3>Properties</h3>

*None*

## GetUIRqDto
<!-- backwards compatibility -->
<a id="schemagetuirqdto"></a>
<a id="schema_GetUIRqDto"></a>
<a id="tocSgetuirqdto"></a>
<a id="tocsgetuirqdto"></a>

```json
{
  "config": {},
  "path": "string"
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|config|object|true|none|none|
|path|string|true|none|none|

## MessageDto
<!-- backwards compatibility -->
<a id="schemamessagedto"></a>
<a id="schema_MessageDto"></a>
<a id="tocSmessagedto"></a>
<a id="tocsmessagedto"></a>

```json
{
  "type": "Success",
  "title": "string",
  "text": "string",
  "duration": 0
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|[ResultTypeDto](#schemaresulttypedto)|true|none|none|
|title|string|true|none|none|
|text|string|true|none|none|
|duration|integer(int32)|true|none|none|

## ResultTypeDto
<!-- backwards compatibility -->
<a id="schemaresulttypedto"></a>
<a id="schema_ResultTypeDto"></a>
<a id="tocSresulttypedto"></a>
<a id="tocsresulttypedto"></a>

```json
"Success"

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|string|false|none|none|

<h3>Enumerated Values</h3>

|Property|Value|
|---|---|
|*anonymous*|Success|
|*anonymous*|Info|
|*anonymous*|Warning|
|*anonymous*|Error|
|*anonymous*|Ignored|

## RunActionRqDto
<!-- backwards compatibility -->
<a id="schemarunactionrqdto"></a>
<a id="schema_RunActionRqDto"></a>
<a id="tocSrunactionrqdto"></a>
<a id="tocsrunactionrqdto"></a>

```json
{
  "data": {},
  "appState": {},
  "componentType": "string",
  "initiatorComponentId": "string",
  "consumedRoute": "string"
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|data|object|true|none|none|
|appState|object|true|none|none|
|componentType|string|true|none|none|
|initiatorComponentId|string|true|none|none|
|consumedRoute|string|true|none|none|

## UICommandDto
<!-- backwards compatibility -->
<a id="schemauicommanddto"></a>
<a id="schema_UICommandDto"></a>
<a id="tocSuicommanddto"></a>
<a id="tocsuicommanddto"></a>

```json
{
  "type": "CloseModal",
  "data": null
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|[UICommandTypeDto](#schemauicommandtypedto)|true|none|none|
|data|any|true|none|none|

## UICommandTypeDto
<!-- backwards compatibility -->
<a id="schemauicommandtypedto"></a>
<a id="schema_UICommandTypeDto"></a>
<a id="tocSuicommandtypedto"></a>
<a id="tocsuicommandtypedto"></a>

```json
"CloseModal"

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|string|false|none|none|

<h3>Enumerated Values</h3>

|Property|Value|
|---|---|
|*anonymous*|CloseModal|
|*anonymous*|UpdateUrl|
|*anonymous*|UpdateHash|
|*anonymous*|ReplaceWithUrl|
|*anonymous*|OpenNewTab|
|*anonymous*|OpenNewWindow|
|*anonymous*|SetLocation|
|*anonymous*|SetWindowTitle|
|*anonymous*|ReplaceJourney|

## UIDto
<!-- backwards compatibility -->
<a id="schemauidto"></a>
<a id="schema_UIDto"></a>
<a id="tocSuidto"></a>
<a id="tocsuidto"></a>

```json
{
  "favIcon": "string",
  "title": "string",
  "homeRoute": "string",
  "home": {
    "messages": [
      {
        "type": "Success",
        "title": "string",
        "text": "string",
        "duration": 0
      }
    ],
    "commands": [
      {
        "type": "CloseModal",
        "data": null
      }
    ],
    "fragments": [
      {
        "targetComponentId": "string",
        "component": {
          "children": [
            {}
          ],
          "metadata": {},
          "id": "string",
          "serverSideType": "string"
        },
        "data": null
      }
    ],
    "sharedData": null,
    "appState": null
  }
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|favIcon|string|true|none|none|
|title|string|true|none|none|
|homeRoute|string|true|none|none|
|home|[UIIncrementDto](#schemauiincrementdto)|true|none|none|

## UIFragmentDto
<!-- backwards compatibility -->
<a id="schemauifragmentdto"></a>
<a id="schema_UIFragmentDto"></a>
<a id="tocSuifragmentdto"></a>
<a id="tocsuifragmentdto"></a>

```json
{
  "targetComponentId": "string",
  "component": {
    "children": [
      {}
    ],
    "metadata": {},
    "id": "string",
    "serverSideType": "string"
  },
  "data": null
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|targetComponentId|string|true|none|none|
|component|[ComponentDto](#schemacomponentdto)|true|none|none|
|data|any|true|none|none|

## UIIncrementDto
<!-- backwards compatibility -->
<a id="schemauiincrementdto"></a>
<a id="schema_UIIncrementDto"></a>
<a id="tocSuiincrementdto"></a>
<a id="tocsuiincrementdto"></a>

```json
{
  "messages": [
    {
      "type": "Success",
      "title": "string",
      "text": "string",
      "duration": 0
    }
  ],
  "commands": [
    {
      "type": "CloseModal",
      "data": null
    }
  ],
  "fragments": [
    {
      "targetComponentId": "string",
      "component": {
        "children": [
          {}
        ],
        "metadata": {},
        "id": "string",
        "serverSideType": "string"
      },
      "data": null
    }
  ],
  "sharedData": null,
  "appState": null
}

```

<h3>Properties</h3>

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|messages|[[MessageDto](#schemamessagedto)]|true|none|none|
|commands|[[UICommandDto](#schemauicommanddto)]|true|none|none|
|fragments|[[UIFragmentDto](#schemauifragmentdto)]|true|none|none|
|sharedData|any|true|none|none|
|appState|any|true|none|none|

