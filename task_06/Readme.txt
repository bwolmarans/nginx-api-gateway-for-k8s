wget https://raw.githubusercontent.com/bwolmarans/nginx-api-gateway-for-k8s/main/task_06/k6-jobs.js

The rate-limiting key is the Authorization header. Every unique user will be 
rate-limited based on their unique Authorization header (JWT).

the JWT is already in the k6-jobs.js script, based on the defaults in the create_jwt_and_jwk.sh script.

if you have a different JWT you will need to edit the script.

k6 run k6-jobs.js --insecure-skip-tls-verify

check the row http_reqs, it could be 800 to 1000 requests per second

Apply the rate-limiting policy:
k apply -f rate-limit-policy.yaml
k apply -f VirtualServer.yaml

k6 run k6-jobs.js --insecure-skip-tls-verify

When a client receives HTTP Error 429: "Too Many Requests" it should back off 
and retry.

check the row http_reqs, it could be closer to 10 requests per second

