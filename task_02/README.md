In task_01 we just curl'd directly to the pods, bypassing NIC. Now we are going to use NIC for the first time!

We will use the VirtualServer NIC custom resource for this. 

We have now used metallab and loadbalencer.yaml, so we need to as root edit /etc/hosts and change jobs.local to use 192.168.0.105 instead of 10.1.1.4

GET /get-job will return a random job title in json format from an ecclectic list of job titles

POST /add-job will accept an array of job titles to add to the ecclectic list of possible job titles

```bash
curl http://jobs.local/get-job
```

This will return a web page, so something is listening, but gives a 404.  So it sort of worked, but also failed to serve the app, because the app isn't actually listening on port 80, nor on /get-job.  
But something is listening on port 80.  What is that? That something is NGINX Ingress Controller.

Remmeber, the NGINX Ingress controller pod consists of a Controller executable progam that is running, and also NGINX Plus.

Let's examing the NGINX Plus configuration file to see this:

First, let's find the name of our NIC:

```bash
k get pods -n nginx-ingress

NAMESPACE            NAME                                         READY   STATUS    RESTARTS         AGE
nginx-ingress        nginx-ingress-gnqml                          1/1     Running   4 (5h27m ago)    172d
```

Then, let's cat the NGINX configuration file:

```bash
kubectl exec -it -n nginx-ingress nginx-ingress-gnqml -- cat /etc/nginx/nginx.conf
```

Within this file, you can see the server block listening on 80, but you will see no upstreams.  Hence the curl succeeded on returning a web page, but it was a 404.

```bash
   server {
        # required to support the Websocket protocol in VirtualServer/VirtualServerRoutes
        set $default_connection_header "";
        set $resource_type "";
        set $resource_name "";
        set $resource_namespace "";
        set $service "";

        listen 80 default_server;
        listen [::]:80 default_server;
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;
        ssl_reject_handshake on;
        server_name _;
        server_tokens "on";
        location / {
            return 404;
        }
    }
```

In fact, you will see nothing in the /etc/nginx/conf.d directory:

```bash
kubectl exec -it -n nginx-ingress nginx-ingress-gnqml -- ls /etc/nginx/conf.d
```

To create the missing upstream, we must configure our VirtualServer to look for /get-job and route the request to the correct microservice.
Let's take a look at that config, expressed in NIC terms:


```bash
bat VirtualServer_cleartext.yaml
```

and then apply it:

```bash
k apply -f VirtualServer_cleartext.yaml
```

We now see the upstream in the NGINX Plus config expressed in NGINX terms if we want:

```bash
kubectl exec -it -n nginx-ingress nginx-ingress-gnqml -- ls /etc/nginx/conf.d
```
```bash
vs_default_my-virtualserver.conf
```
```bash
kubectl exec -it -n nginx-ingress nginx-ingress-gnqml -- cat /etc/nginx/conf.d/vs_default_my-virtualserver.conf
```
```bash
upstream vs_default_my-virtualserver_eclectic-jobs-upstream {
    zone vs_default_my-virtualserver_eclectic-jobs-upstream 512k;
    random two least_conn;
    server 10.1.35.166:3000 max_fails=1 fail_timeout=10s max_conns=0;
}
```

and also some server blocks that over-ride the default server in the /etc/nginx/nginx.conf that listens on port 80 by using the  specific server name which matches the host header:

```bash
server {
    listen 80;
    listen [::]:80;
    server_name jobs.local;

( entire server block config is not shown here, but if you look through it all you will see the location blocks and that they point to the upstream)
```

```bash
curl http://jobs.local/get-job
```

Here is what happened here, the flow:

- The client requests https://jobs.local/get-job
- The request resolves to GET http://10.1.1.4:80/get-job
- The request is received by the NGINX Plus server block we saw earlier listening on port 80
- The NGINX Plus ingress rewrites URL path ‘/get-job’ to ‘/’ before sending to the upstream which has the eclectic-jobs service on port 3000
- The https://jobs.local web application styles and renders the JSON response from https://jobs.local/get-job
- The response is returned through NGINX Plus ingress back to the client


```bash
curl -k https://jobs.local/get-job
```

This won't work because we're not listening on 443, yet.  We get an interesting error:

```bash
curl: (35) error:0A000458:SSL routines::tlsv1 unrecognized name
```

To get SSL to work, we are going to use NIC to encrypt the front end data in flight, a nice use case.
We will Create a VirtualServer Custom Resource Definition (CRD) to add TLS and proxy the API endpoints:

```bash
bat VirtualServer.yaml
```

and then apply it:

```bash
k apply -f VirtualServer.yaml
```

```bash
curl -k https://jobs.local/get-job
```
```bash
curl: (35) error:0A000458:SSL routines::tlsv1 unrecognized name
```

This still failed because we need to create that key resource the virtual server is referencing.
It's unfortunate the error message says a name is not recognized when the problem is a missing key.
You can actually prove this another way by viewing the VirtualServer via the K8s api:

```bash
kubectl describe virtualserver -A
```

At the bottom you will see this event:
```bash
Events:
  Type     Reason                     Age                  From                      Message
  ----     ------                     ----                 ----                      -------
  Warning  AddedOrUpdatedWithWarning  3m54s                nginx-ingress-controller  Configuration for default/my-virtualserver was added or updated ; with warning(s): TLS secret jobs-local-tls is invalid: secret doesn't exist or of an unsupported type
```
  
So, lets create that secret now:

# Create a TLS cert and key for 'jobs.local' host.
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout jobs.local.key -out jobs.local.crt -config openssl.cnf -extensions req_ext
```

# Create a K8s TLS secret based on 'jobs.local' TLS cert and key.
```bash
kubectl create secret tls jobs-local-tls --key jobs.local.key --cert jobs.local.crt
```

and try again:

```bash
curl -k https://jobs.local/get-job
```

success!


NGINX Plus Dashboard
--------------------
This NIC is running NGINX Plus.

You can monitor the NGINX Plus API by port forwarding in the background like this and curl, and also in the UDF there is a Access method on 8081 to see it in your local web browser using a NGINX OSS proxy on this box which while strictly speaking is not required, makes it easy to handle the difficulties in port forwarding.  
By the way, keep the dashboard tab opena, and keep checking this for task_03, task_04, etc you will see more things in the dashboard. 

kubectl port-forward `kubectl get pods -o=jsonpath='{.items..metadata.name}' -n nginx-ingress` -n nginx-ingress 8080:8080 --address 0.0.0.0 > /dev/null &

You can just leave this running in the background for the rest of this entire lab.


curl http://127.0.0.1:8081/ <-- you can hit this /dashboard.html in your browser using the UDF access method "NGINX Plus Dashboard" which listens on https 8081

And here is the server block in that NGINX proxy I mentioned, this should already be configured if you're using the right UDF

        server {
          listen 8081 default_server;  
          location / {
            proxy_bind 127.0.0.1;
            proxy_pass http://127.0.0.1:8080;
          }  
        }
