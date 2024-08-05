#docker login
docker build -t miguelperezcolom/mateu-demo .
docker image tag miguelperezcolom/mateu-demo miguelperezcolom/mateu-demo:latest
docker image tag miguelperezcolom/mateu-demo miguelperezcolom/mateu-demo:3.0-alpha.12.3
docker push --all-tags miguelperezcolom/mateu-demo