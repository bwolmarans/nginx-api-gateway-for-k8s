In task_01 we just curl'd directly to the pods, bypassing NIC. Now we are going to use NIC for the first time!

And, we are going to use NIC to encrypt the front end data in flight, a nice use case.

We will use the VirtualServer NIC custom resource for this. 

# Create a TLS cert and key for 'jobs.local' host.

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout jobs.local.key -out jobs.local.crt -config openssl.cnf -extensions req_ext

# Create a K8s TLS secret based on 'jobs.local' TLS cert and key.

kubectl create secret tls jobs-local-tls --key jobs.local.key --cert jobs.local.crt

# Create a VirutalServer Custom Resource Definition (CRD) to add TLS and proxy the API endpoints:
# /get-job # GET /get-job will return a random job title in json format from an ecclectic list of job titles
# /add-job # POST /add-job will accept an array of job titles to add to the ecclectic list of possible job titles

bat VirtualServer.yaml

k apply -f VirtualServer.yaml

curl -k https://jobs.local/get-job
curl -k -X POST https://jobs.local/add-job

This NIC is running NGINX Plus.

You can monitor the NGINX Plus API by port forwarding in the background like this and curl, and also in the UDF there is a Access method on 8081 to see it in your local web browser using a NGINX OSS proxy on this box which while strictly speaking is not required, makes it easy to handle the difficulties in port forwarding.  

kubectl port-forward nginx-ingress-jccr9 8080:8080 --address 0.0.0.0 --namespace=nginx-ingress > /dev/null &

curl http://127.0.0.1:8081/ <-- you can hit this /dashboard.html in your browser using the UDF access method "NGINX Plus Dashboard" which listens on https 8081

And here is the server block in that NGINX proxy I mentioned:

        server {
          listen 8081 default_server;  
          location / {
            proxy_bind 127.0.0.1;
            proxy_pass http://127.0.0.1:8080;
          }  
        }

