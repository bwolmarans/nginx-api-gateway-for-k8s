So we have used NAP for some basic functionality, like OWASP, and Browser checking, and basic HTTP enforcement.
So far, we have been able to make API requests without any authentication.

But because this an API GW lab, let's use pivot away from NAP, and use NGINX Plus within NIC to enforce a JWT for the API.

First, we need a JWK and a JWT.  This is from Liam's blog https://www.f5.com/company/blog/nginx/authenticating-api-clients-jwt-nginx-plus

chmod +x create_jwt_and_jwk.sh
./create_jwt_and_jwk.sh
kubectl create secret generic jwk-secret --from-file=jwk=api-secret.jwk --type=nginx.org/jwk
kubectl get secret jwk-secret -o yaml

echo eyJrZXlzIjoKICAgIFt7CiAgICAgICAgImsiOiJabUZ1ZEdGemRHbGphbmQwIiwKICAgICAgICAia3R5Ijoib2N0IiwKICAgICAgICAia2lkIjoiMDAwMSIKICAgIH1dCn0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCgo= | base64 -d

echo ZmFudGFzdGljand0 | base64 -d

We will create a jwt policy:

kubectl apply -f jwt-policy.yaml

And we will add next to the NAP policy in our VirtualServer

kubectl apply -f VirtualServer.yaml

and test:

curl -H @headers.txt -X POST -k https://jobs.local/add-job --data '["jet pilot"]'
curl -H @headers_with_auth.txt -X POST -k https://jobs.local/add-job --data '["jet pilot"]' 


