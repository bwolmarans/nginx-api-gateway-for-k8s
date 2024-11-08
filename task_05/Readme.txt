./create_jwt_and_jwk.sh
kubectl create secret generic jwk-secret --from-file=api-secret.jwk --type=nginx.org/jwk
kubectl get secret jwk-secret -o yaml
kubectl apply -f jwt-policy.yaml
kubectl apply -f VirtualServer.yaml
