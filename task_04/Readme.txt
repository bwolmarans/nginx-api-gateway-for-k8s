We are now going to apply NGINX App Protect WAF. Starting with a logging profile so we can see waf event logs on stderr.

I suggest take a look at each of these yaml files to understand what they are doing.


k apply -f logging.yaml
kubectl apply -f jobs-openapi-spec-appolicy.yaml
kubectl apply -f app-protect-policy.yaml
kubectl apply -f VirtualServer.yaml

curl -k https://jobs.local/add-job -X POST --data '["jet pilot"]'

this will give a supportID, but how to see the waf event log?

export SUPPORT_ID=$(curl -k https://jobs.local/add-job -X POST --data '["jet pilot"]' | jq .supportID)
echo $SUPPORT_ID

kubectl logs -n nginx-ingress nginx-ingress-jccr9 | grep $SUPPORT_ID | sed 's/,/\n/g'

you can see the nap logs by checking stderr, because that logging profile sends nap logs to stderr.
I could probably spin up a NIM with SM and a box with agent and somehow send the logs to SM with more time.

you will see the security event is because curl is a non-browser client, so repeat the curl with a more "Browser Like" set of headers:

curl -H @headers.txt -k https://jobs.local/add-job --data '["jet pilot"]'





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
