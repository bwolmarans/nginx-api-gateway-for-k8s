We are now going to apply NGINX App Protect WAF. Starting with a logging profile so we can see waf event logs on stderr.

The first use case for NAP is to block non-browser clients.

export SUPPORT_ID=$(curl -k https://jobs.local/get-jobs | jq .supportID)
echo $SUPPORT_ID
kubectl logs -n nginx-ingress nginx-ingress-jccr9 | grep $SUPPORT_ID | sed 's/,/\n/g'

You'll see at  the top of the event log, it's a non-browser client attack.

attack_type="Non-browser Client

So repeat the curl with a more "Browser Like" set of headers, and you can take a look at headers.txt to see these headers that make curl look more like firefox.

curl -H @headers.txt -k https://jobs.local/get-jobs


is to enforce the API Spec, so API abuse is prevented.  See the OWASP API Top 10 for more information.

curl -k https://jobs.local/add-job -X POST --data '[99, false]'  -H "content-type: application/json"

We just abused the business log of this API, by adding a number and a boolean, but our API should only be accepting text strings at the /add-job API endpoint, according to this line in the API spec file which you can find at https://raw.githubusercontent.com/bwolmarans/nginx-api-gateway-for-k8s/main/task_04/jobs-openapi-spec.yaml

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



We're going to use NAP to fix this abuse. 

Please take a look at each of these yaml files to understand what they are doing.

k apply -f logging.yaml
kubectl apply -f jobs-openapi-spec-appolicy.yaml
kubectl apply -f app-protect-policy.yaml
kubectl apply -f VirtualServer.yaml

Now lets try the abuse again:

curl -k https://jobs.local/add-job -X POST --data '[99, false]'  -H "content-type: application/json"

NAP blocks it, and gives a support ID in the response body, but we'd like to see the waf event log itself.
We can do that like this:

export SUPPORT_ID=$(curl -k https://jobs.local/add-job -H @headers.txt --data '[99, false]'  -H "content-type: application/json" | jq .supportID)
echo $SUPPORT_ID
kubectl logs -n nginx-ingress nginx-ingress-jccr9 | grep $SUPPORT_ID | sed 's/,/\n/g'

curl -k https://jobs.local/add-job -X POST --data '["jet pilot"]'

this will give a supportID, but how to see the waf event log?

export SUPPORT_ID=$(curl -k https://jobs.local/add-job -X POST --data '["jet pilot"]' | jq .supportID)
echo $SUPPORT_ID

kubectl logs -n nginx-ingress nginx-ingress-jccr9 | grep $SUPPORT_ID | sed 's/,/\n/g'

you can see the nap logs by checking stderr, because that logging profile sends nap logs to stderr.
I could probably spin up a NIM with SM and a box with agent and somehow send the logs to SM with more time.

you will see the security event is because curl is a non-browser client, so repeat the curl with a more "Browser Like" set of headers, and you can take a look at headers.txt to see these headers that make curl look more like firefox.

curl -H @headers.txt -k https://jobs.local/add-job --data '["jet pilot"]'

However, because there is no waf, we can still do OWASP top 10 attacks like this XSS example:

curl -H @headers.txt -k 'https://jobs.local/add-job?x=<script>cat%20/etc/passwd</script>' --data '["jet pilot"]'





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
