---
title: "API"
weight: 17
---
<!-- Generator: Widdershins v4.0.1 -->

<h1 id="demo-vaadin-micronaut">demo-vaadin-micronaut v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

<h1 id="demo-vaadin-micronaut-default">Default</h1>

## getUI

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

```javascript
const inputBody = '{
  "config": {},
  "path": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/your-context-path/mateu/v3/ui',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/your-context-path/mateu/v3/ui',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/your-context-path/mateu/v3/ui', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/your-context-path/mateu/v3/ui', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/your-context-path/mateu/v3/ui");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/your-context-path/mateu/v3/ui", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

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

## runStep

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

```javascript
const inputBody = '{
  "data": {},
  "appState": {},
  "componentType": "string",
  "initiatorComponentId": "string",
  "consumedRoute": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/your-context-path/mateu/v3/{route}/{actionId}',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/your-context-path/mateu/v3/{route}/{actionId}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/your-context-path/mateu/v3/{route}/{actionId}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/your-context-path/mateu/v3/{route}/{actionId}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/your-context-path/mateu/v3/{route}/{actionId}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/your-context-path/mateu/v3/{route}/{actionId}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

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

<h2 id="tocS_ComponentDto">ComponentDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|children|[[ComponentDto](#schemacomponentdto)]|true|none|none|
|metadata|[ComponentMetadataDto](#schemacomponentmetadatadto)|true|none|none|
|id|string|true|none|none|
|serverSideType|string|true|none|none|

<h2 id="tocS_ComponentMetadataDto">ComponentMetadataDto</h2>
<!-- backwards compatibility -->
<a id="schemacomponentmetadatadto"></a>
<a id="schema_ComponentMetadataDto"></a>
<a id="tocScomponentmetadatadto"></a>
<a id="tocscomponentmetadatadto"></a>

```json
{}

```

### Properties

*None*

<h2 id="tocS_GetUIRqDto">GetUIRqDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|config|object|true|none|none|
|path|string|true|none|none|

<h2 id="tocS_MessageDto">MessageDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|[ResultTypeDto](#schemaresulttypedto)|true|none|none|
|title|string|true|none|none|
|text|string|true|none|none|
|duration|integer(int32)|true|none|none|

<h2 id="tocS_ResultTypeDto">ResultTypeDto</h2>
<!-- backwards compatibility -->
<a id="schemaresulttypedto"></a>
<a id="schema_ResultTypeDto"></a>
<a id="tocSresulttypedto"></a>
<a id="tocsresulttypedto"></a>

```json
"Success"

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|*anonymous*|Success|
|*anonymous*|Info|
|*anonymous*|Warning|
|*anonymous*|Error|
|*anonymous*|Ignored|

<h2 id="tocS_RunActionRqDto">RunActionRqDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|data|object|true|none|none|
|appState|object|true|none|none|
|componentType|string|true|none|none|
|initiatorComponentId|string|true|none|none|
|consumedRoute|string|true|none|none|

<h2 id="tocS_UICommandDto">UICommandDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|[UICommandTypeDto](#schemauicommandtypedto)|true|none|none|
|data|any|true|none|none|

<h2 id="tocS_UICommandTypeDto">UICommandTypeDto</h2>
<!-- backwards compatibility -->
<a id="schemauicommandtypedto"></a>
<a id="schema_UICommandTypeDto"></a>
<a id="tocSuicommandtypedto"></a>
<a id="tocsuicommandtypedto"></a>

```json
"CloseModal"

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|string|false|none|none|

#### Enumerated Values

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

<h2 id="tocS_UIDto">UIDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|favIcon|string|true|none|none|
|title|string|true|none|none|
|homeRoute|string|true|none|none|
|home|[UIIncrementDto](#schemauiincrementdto)|true|none|none|

<h2 id="tocS_UIFragmentDto">UIFragmentDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|targetComponentId|string|true|none|none|
|component|[ComponentDto](#schemacomponentdto)|true|none|none|
|data|any|true|none|none|

<h2 id="tocS_UIIncrementDto">UIIncrementDto</h2>
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

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|messages|[[MessageDto](#schemamessagedto)]|true|none|none|
|commands|[[UICommandDto](#schemauicommanddto)]|true|none|none|
|fragments|[[UIFragmentDto](#schemauifragmentdto)]|true|none|none|
|sharedData|any|true|none|none|
|appState|any|true|none|none|

