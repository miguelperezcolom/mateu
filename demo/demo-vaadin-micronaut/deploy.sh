docker login
docker buildx build --platform=linux/amd64 -t miguelperezcolom/mateu-demo .
#docker build -t miguelperezcolom/mateu-demo .
export VERSION=3.0-alpha.75
docker image tag miguelperezcolom/mateu-demo miguelperezcolom/mateu-demo:latest
docker image tag miguelperezcolom/mateu-demo miguelperezcolom/mateu-demo:$VERSION
echo "pushing latest"
docker push miguelperezcolom/mateu-demo:latest
echo "pushing $VERSION"
docker push miguelperezcolom/mateu-demo:$VERSION