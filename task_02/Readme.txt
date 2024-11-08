In task_01 we just curl'd directly to the pods, bypassing NIC. Now we are going to use NIC for the first time!

We will use the VirtualServer NIC custom resource for this. 

# /get-job # GET /get-job will return a random job title in json format from an ecclectic list of job titles
# /add-job # POST /add-job will accept an array of job titles to add to the ecclectic list of possible job titles

curl http://jobs.local/get-job <--this will fail, because the app isn't actually listening on port 80, nor on /get-job.  
We must configure our VirtualServer to look for /get-job and route the request to the correct microservice.

bat VirtualServer_cleartext.yaml

k apply -f VirtualServer_cleartext.yaml

curl http://jobs.local/get-job

Here is what happened here, the flow:

-The client requests https://jobs.local/get-job
-The request resolves to GET http://10.1.1.4:80/get-job
-The request is received by the NGINX Plus ingress listening on port 80
-The NGINX Plus ingress rewrites URL path ‘/get-job’ to ‘/’ before sending to the eclectic-jobs service on port 3000
-The https://jobs.local web application styles and renders the JSON response from https://jobs.local/get-job
-The response is returned through NGINX Plus ingress back to the client

curl -k https://jobs.local/get-job <-- this won't work because we're not listening on 443, yet.

To get SSL to happen, we are going to use NIC to encrypt the front end data in flight, a nice use case.
We will Create a VirutalServer Custom Resource Definition (CRD) to add TLS and proxy the API endpoints:

bat VirtualServer.yaml

k apply -f VirtualServer.yaml

curl -k https://jobs.local/get-job

still failed because we need to create that key resource the virtual server is referencing, lets do that now:

# Create a TLS cert and key for 'jobs.local' host.
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout jobs.local.key -out jobs.local.crt -config openssl.cnf -extensions req_ext

# Create a K8s TLS secret based on 'jobs.local' TLS cert and key.
kubectl create secret tls jobs-local-tls --key jobs.local.key --cert jobs.local.crt

and try again:

curl -k https://jobs.local/get-job

success!


NGINX Plus Dashboard
--------------------
This NIC is running NGINX Plus.

You can monitor the NGINX Plus API by port forwarding in the background like this and curl, and also in the UDF there is a Access method on 8081 to see it in your local web browser using a NGINX OSS proxy on this box which while strictly speaking is not required, makes it easy to handle the difficulties in port forwarding.  
By the way, keep the dashboard tab opena, and keep checking this for task_03, task_04, etc you will see more things in the dashboard. 

kubectl port-forward nginx-ingress-jccr9 8080:8080 --address 0.0.0.0 --namespace=nginx-ingress > /dev/null &

curl http://127.0.0.1:8081/ <-- you can hit this /dashboard.html in your browser using the UDF access method "NGINX Plus Dashboard" which listens on https 8081

And here is the server block in that NGINX proxy I mentioned, this should already be configured if you're using the right UDF

        server {
          listen 8081 default_server;  
          location / {
            proxy_bind 127.0.0.1;
            proxy_pass http://127.0.0.1:8080;
          }  
        }

