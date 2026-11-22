# Mateu native on Cloud Run (Quarkus + Firestore + Redwood)

The source of Mateu's public native demo: a small product catalogue built with Quarkus and
[`quarkus-mateu`](https://github.com/quarkiverse/quarkus-mateu). It is compiled to a GraalVM native
executable, runs on Google Cloud Run and keeps its data in Firestore. Mateu's Redwood renderer
draws the UI. There is no frontend code: the screens are the Java classes in
`src/main/java/com/example/app`.

You can try it in two ways:

| URL | What serves the page |
| --- | --- |
| https://mateu-native-demo-964968728444.europe-west1.run.app | Quarkus serves both the renderer's assets and the UI calls (`/mateu/v3/…`) |
| https://mateu-native-demo.netlify.app | Netlify serves the static Redwood front end, and the UI calls go to Cloud Run |

The Netlify version is closer to a production setup, where static assets come from a CDN and the
backend only answers the API.

## What is in it

- `Shell`: the app shell (`@UI("")`), with a menu holding `Hello` and `Products`.
- `Products`: an `AutoCrud<Product>`. Listing, search, sort, create, edit and delete are all
  derived from the `Product` record.
- `ProductStore`: the `CrudStore` backed by Firestore (collection `products`). It seeds four sample
  products the first time it finds the collection empty.
- `ResetResource`: `POST /internal/reset` puts the four samples back. It only answers a request
  whose `X-Reset-Token` header matches `DEMO_RESET_TOKEN`; when that variable is unset, it refuses
  every call.

## Run it locally

```bash
mvn quarkus:dev        # Dev Services starts the Firestore emulator (needs Docker)
```

Open http://localhost:8080.

## Build native and deploy to Cloud Run

Cloud Run runs linux/amd64 and native images do not cross-compile, so the native executable is
built in a container. `Dockerfile` builds it with Mandrel and copies it onto
`ubi9-quarkus-micro-image`. `cloudbuild.yaml` runs that build on Cloud Build, using an 8-CPU machine
so `native-image` has enough memory:

```bash
gcloud builds submit --config cloudbuild.yaml       # → europe-west1-docker.pkg.dev/$PROJECT/mateu/native-demo

gcloud run deploy mateu-native-demo \
  --image europe-west1-docker.pkg.dev/$PROJECT/mateu/native-demo:latest \
  --region europe-west1 --execution-environment gen2 --memory 512Mi --cpu 1 \
  --min-instances 0 --max-instances 1 --cpu-boost --allow-unauthenticated \
  --service-account <a service account with roles/datastore.user> \
  --set-env-vars MATEU_CORS_ALLOWED_ORIGINS=https://<your-site>.netlify.app,DEMO_RESET_TOKEN=<a random token>
```

Set `quarkus.google.cloud.project-id` in `application.properties` to your own project. On Cloud Run
the Firestore credentials come from the service's identity, so no key file is needed.

`Dockerfile.jvm` and `cloudbuild-jvm.yaml` build the same app on the JVM, for comparing startup
time and memory with the native image.

## The static front end on Netlify

```bash
mvn package -DskipTests                     # puts the Redwood jar under target/quarkus-app/lib
front/build-site.sh https://<your-service>.run.app
netlify deploy --prod --dir front/site
```

`build-site.sh` prepares the site in four steps:

1. It unpacks the renderer's static assets from the `mateu-redwood` jar.
2. It takes the backend's own index page and removes its `<mateu-ui>` element, so the Redwood app
   runs in hosted mode, with hash routes such as `#/products`.
3. It points the app constant `mateuBaseUrl` at the backend URL, so the page calls Cloud Run
   directly. CORS allows that origin through `MATEU_CORS_ALLOWED_ORIGINS`.
4. It writes a `_redirects` file that proxies `/mateu/*` to the backend. Because of that, the
   site's own address also works in the Mateu phone and desktop apps (a QR code of the page or a
   pasted link): they call `<site>/mateu/v3/…`, and Netlify forwards the calls.

## Nightly data reset

The demo is public and writable, so a Cloud Scheduler job puts the sample data back every night:

```bash
gcloud scheduler jobs create http mateu-demo-daily-reset \
  --location europe-west1 --schedule "0 4 * * *" --time-zone Europe/Madrid \
  --uri https://<your-service>.run.app/internal/reset --http-method POST \
  --headers X-Reset-Token=<the same token as DEMO_RESET_TOKEN>
```

Keep the token out of the repository. This folder's `.gitignore` lists `.reset-token`, for when you
keep it in a local file.

## Versions

The Mateu version is set by `<mateu.version>` in `pom.xml`, and `scripts/bump-example-version.sh`
moves it after each release. The deployed demo may run an earlier version than this file names.
