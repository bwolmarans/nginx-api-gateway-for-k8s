# Stitching the App together using NIC

This step ties uses NIC to tie together the '/' or '/index.html' HTML main page which then calls the /get-job api endpoint and renders the job title in bold style.

```bash
bat VirtualServer.yaml
sleep 10
kubectl apply -f VirtualServer.yaml
sleep 5
curl -k https://jobs.local/
```

So you can see a lot of Javascript in the raw HTML returned now.

Here is what happened here, the flow:

-The client requests https://jobs.local
-The request resolves to GET https://10.1.1.4:443 /
-The request is received by the NGINX Plus ingress
-The NGINX Plus ingress terminates TLS and then HTTP routes URL path ‘/’ to the myapp service on port 3000
-Embedded Javascript in the response HTML fetches a random job title from the https://jobs.local/get-job API endpoint
-The NGINX Plus ingress rewrites URL path ‘/get-job’ to ‘/’ before sending to the eclectic-jobs service on port 3000
-The https://jobs.local web application styles and renders the JSON response from https://jobs.local/get-job
-The response is returned through NGINX Plus ingress


The app can now accept POSTs to add a job. So let's add a job

```bash
curl -k https://jobs.local/add-job -X POST --data '["jet pilot"]'  -H "content-type: application/json"
```

And here is that POST flow:

-The client requests a POST to https://jobs.local/add-job
-The request resolves to GET https://10.1.1.4:443 /
-The request is received by the NGINX Plus ingress
-The NGINX Plus ingress terminates TLS and then HTTP routes URL path ‘/add-job’ to the eclectic-jobs service on port 3000
-The eclectic-jobs service adds a job.
-The response is returned through NGINX Plus ingress

Go to [Task_04](https://github.com/bwolmarans/nginx-api-gateway-for-k8s/new/main/task_04)
