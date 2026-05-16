docker login
docker buildx build --platform=linux/amd64 -t miguelperezcolom/demo-admin-panel .
export VERSION=0.0.2
docker image tag miguelperezcolom/demo-admin-panel miguelperezcolom/demo-admin-panel:latest
docker image tag miguelperezcolom/demo-admin-panel miguelperezcolom/demo-admin-panel:$VERSION
echo "pushing latest"
docker push miguelperezcolom/demo-admin-panel:latest
echo "pushing $VERSION"
docker push miguelperezcolom/demo-admin-panel:$VERSION
