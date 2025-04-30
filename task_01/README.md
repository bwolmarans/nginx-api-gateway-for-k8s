The get-job REST api is running as a nodeport service:
The main HTML site is running as a nodeport service:

```bash
curl http://10.1.1.4:30020/
curl http://10.1.1.4:30010
```


Those curls will of course fail because there are no microservices, yet. nothing is listening. there is no app.

Let's create those apps and listeners now.

The main HTML site has embedded JavaScript to fetch a random job from the get-job REST api endpoint.
The endpoint has not been published yet and so this part will fail with "Error fetching job title"

```bash
bat jobs.yaml
sleep 5
k apply -f jobs.yaml
sleep 5
bat main.yaml
sleep 5
k apply -f main.yaml
sleep 5
k get svc -A
sleep 20
curl http://10.1.1.4:30020/
sleep 5
curl http://10.1.1.4:30010
```

now go to [Task 2](https://github.com/bwolmarans/nginx-api-gateway-for-k8s/tree/main/task_02)
