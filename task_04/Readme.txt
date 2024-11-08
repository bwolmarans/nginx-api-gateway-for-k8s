We are now going to apply NGINX App Protect WAF. 

We're going to do some bad things, which all succeed.

bad thing 1: just curl
----------------------
curl is bad, it's a bot. 

curl -k https://jobs.local/get-job


bad thing 2: OWASP Top 10 XSS
------------------------------
Let's do a basic XSS attack or recon or probe, see what we get:

curl -k 'https://jobs.local/add-job?x=<script>cat%20/etc/passwd</script>' --data '["jet pilot"]' -H "content-type: application/json"


bad thing 3: API abuse
----------------------------------
Let's do some API abuse, see the OWASP API Top 10 for more information.

curl -k https://jobs.local/add-job -X POST --data '[99, false]' -H "content-type: application/json"

We just abused the business logic of this API, by adding a number and a boolean, but our API should only be accepting text strings at the /add-job API endpoint, according to this line in the API spec file which you can find at https://raw.githubusercontent.com/bwolmarans/nginx-api-gateway-for-k8s/main/task_04/jobs-openapi-spec.yaml

  /add-job:
    post:
      summary: Add New Job(s)
      description: Adds new job(s) to the eclectic jobs list. Expects an array of job titles.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                type: string
                example: Software Developer


OK now let's configure NAP to take care of all three of these bot/abuse/hack/attack problems.

Please take a look at each of these yaml files to understand what they are doing, and then apply them.

k apply -f logging.yaml
kubectl apply -f jobs-openapi-spec-appolicy.yaml
kubectl apply -f app-protect-policy.yaml
kubectl apply -f VirtualServer.yaml

Now lets try the bad things again:


bad thing 1: just curl
----------------------
curl is bad, it's a bot. 

curl -k https://jobs.local/get-job

NAP blocks it, and gives a support ID in the response body, but we'd like to see the waf event log itself.
You can see the nap logs by checking stderr, because that logging profile sends nap logs to stderr.
I could probably spin up a NIM with SM and a box with agent and somehow send the logs to SM with more time.
We can do that like this:


export SUPPORT_ID=$(curl -k 'https://jobs.local/get-job' | jq .supportID)
echo $SUPPORT_ID
kubectl logs -n nginx-ingress `kubectl get pods -o=jsonpath='{.items..metadata.name}' -n nginx-ingress` | grep $SUPPORT_ID | sed 's/,/\n/g' | grep ^violations=



bad thing 2: OWASP Top 10 XSS
------------------------------
curl -k 'https://jobs.local/add-job?x=<script>cat%20/etc/passwd</script>' --data '["jet pilot"]' -H "content-type: application/json"

export SUPPORT_ID=$(curl -k 'https://jobs.local/add-job?x=<script>cat%20/etc/passwd</script>' --data '["jet pilot"]' -H "content-type: application/json" | jq .supportID)
echo $SUPPORT_ID
kubectl logs -n nginx-ingress `kubectl get pods -o=jsonpath='{.items..metadata.name}' -n nginx-ingress` | grep $SUPPORT_ID | sed 's/,/\n/g' | grep ^violations=


bad thing 3: API abuse
----------------------------------
curl -k https://jobs.local/add-job -X POST --data '[99, false]'  -H "content-type: application/json"

export SUPPORT_ID=$(curl -X POST -k https://jobs.local/add-job --data '[99, false]'  -H "content-type: application/json" | jq .supportID)
echo $SUPPORT_ID
kubectl logs -n nginx-ingress `kubectl get pods -o=jsonpath='{.items..metadata.name}' -n nginx-ingress` | grep $SUPPORT_ID | sed 's/,/\n/g' | grep ^violations=


Waf Evasion
-----------
Let's make curl more "Browser Like" using a set of headers, and you can take a look at headers.txt to see these headers that make curl look more like firefox.

curl -H @headers.txt -k https://jobs.local/add-job 

Now we have evaded the WAF policy.  A more complex bot defense policy, based on multiple factors beyond simple headers, would be used to combat this.
That is outside the scope of this lab, so we will stop here.









# Small Note, can ignore if things are working:
# This task failed ocassionally during testing because the nginx ingress pod (and all other pods on the microk8s cluster) were not able to resolve DNS.
#
# To test if this is the issue run the 'test-dns.sh' script.
# test-dns.sh --help for usage info.
# 
# Also check the kube-system logs:
# microk8s kubectl logs -n kube-system -l k8s-app=kube-dns
# [INFO] 127.0.0.1:58129 - 21340 "HINFO IN 8060823575723639096.697009577592649424. udp 56 false 512" - - 0 2.001173139s
# [ERROR] plugin/errors: 2 8060823575723639096.697009577592649424. HINFO: read udp 10.1.35.156:56417->8.8.8.8:53: i/o timeout

test-dns.sh
