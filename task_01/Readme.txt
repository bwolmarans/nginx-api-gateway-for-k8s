The get-job REST api is running as a nodeport service:
http://jobs.local:30020/

The main HTML site is running as a nodeport service:
http://jobs.local:30010/

curl http://jobs.local:30020/
curl http://jobs.local:30010


those curls will fail becaus there are no microservices, yet.
let's create those now.

The main HTML site has embedded JavaScript to fetch a random job from the get-job REST api endpoint.
The endpoint has not been published yet and so this part will fail with "Error fetching job title"

bat jobs.yaml

k apply -f jobs.yaml

bat main.yaml

k apply -f main.yaml

curl http://jobs.local:30020/
curl http://jobs.local:30010
