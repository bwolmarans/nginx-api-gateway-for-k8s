chmod +x create_jwt_and_jwk.sh
./create_jwt_and_jwk.sh
kubectl create secret generic jwk-secret --from-file=api-secret.jwk --type=nginx.org/jwk
kubectl get secret jwk-secret -o yaml
kubectl apply -f jwt-policy.yaml
kubectl apply -f VirtualServer.yaml

export SUPPORT_ID=$(curl -k https://jobs.local/add-job --data '["jet pilot"]' | jq .supportID)
kubectl logs -n nginx-ingress nginx-ingress-jccr9 | grep $SUPPORT_ID | sed 's/,/\n/g'

curl -H @headers.txt -k https://jobs.local/add-job --data '["jet pilot"]'

curl -H @headers_without_authorization.txt -k https://jobs.local/add-job --data '["jet pilot"]'


