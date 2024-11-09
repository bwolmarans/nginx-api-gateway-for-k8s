So we have used NAP for some basic functionality, like OWASP, and Browser checking, and basic HTTP enforcement.
So far, we have been able to make API requests without any authentication.

But because this an API GW lab, let's use NAP to enforce a JWT for the API.



chmod +x create_jwt_and_jwk.sh
./create_jwt_and_jwk.sh
kubectl create secret generic jwk-secret --from-file=api-secret.jwk --type=nginx.org/jwk
kubectl get secret jwk-secret -o yaml

echo eyJrZXlzIjoKICAgIFt7CiAgICAgICAgImsiOiJabUZ1ZEdGemRHbGphbmQwIiwKICAgICAgICAia3R5Ijoib2N0IiwKICAgICAgICAia2lkIjoiMDAwMSIKICAgIH1dCn0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCgo= | base64 -d

echo ZmFudGFzdGljand0 | base64 -d

kubectl apply -f jwt-policy.yaml
kubectl apply -f VirtualServer.yaml

export SUPPORT_ID=$(curl -X POST -k https://jobs.local/add-job --data '["jet pilot"]' | jq .supportID)
echo $SUPPORT_ID
kubectl logs -n nginx-ingress `kubectl get pods -o=jsonpath='{.items..metadata.name}' -n nginx-ingress` | grep $SUPPORT_ID | sed 's/,/\n/g' | grep ^violations=

curl -H @headers.txt -X POST -k https://jobs.local/add-job --data '["jet pilot"]' -H "content-type: application/json"

curl -H @headers_without_auth.txt -k https://jobs.local/add-job --data '["jet pilot"]'


