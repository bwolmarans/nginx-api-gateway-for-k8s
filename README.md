# [F5 NGINX Plus Ingress Controller as an API Gateway for Kubernetes](https://clouddocs.f5.com/training/community/nginx/html/class11/class11.html)

This is updated from the original work by Tony Marfil.

## Changes and Notes 

- if you're reading the lab guide, you can do that, but I didn't update it, so it won't work properly, but is good information all the same
- instead of the lab guide, in each task, I updated the README with almost all the steps you will need and you can just follow that README, maybe refer to the lab guide for that task for additional clarity if some detail is missing
- where it says to use RDP and Firefox, instead if you want, you can use a single webshell on the k8s box for everything and use curl
- in addition, you can also use the firefox access method on the jumphost it works well and has a little copy and paste widget to your local system on the left that works well
- I couldn't get the existing jwt creation script to work, so I made another one based off Liam's JWT blog and it's in task_05 and works well
- I added a logging profile to the NAP config so you can now see the security event logs to stderr using normal kubectl logs commands
  
- on the k8s box,hopefully all of these have been done for you in the UDF you are using, but just in case, you might need to do these things before you start the tasks
- (but don't copy and paste this entire block of commands, do it one at a time)

```bash
su ubuntu
cd ~ubuntu
git clone https://github.com/bwolmarans/nginx-api-gateway-for-k8s
chmod +x /home/ubuntu/nginx-api-gateway-for-k8s/bin/cleanup.sh
/home/ubuntu/nginx-api-gateway-for-k8s/bin/cleanup.sh
sudo snap install k6
sudo snap install kubectl --classic
unalias kubectl
unalias k
alias k=kubectl
alias h='history | grep'
cd /home/ubuntu/.kube
microk8s config > config
cd /home/ubuntu/nginx-api-gateway-for-k8s
``` 

## START HERE

- cleanup any old config so the lab starts fresh

```bash
su ubuntu
cd ~ubuntu
/home/ubuntu/nginx-api-gateway-for-k8s/bin/cleanup.sh
```

- install nginx oss for port-forwarding from k8s the N+ dashboard

```bash
sudo systemctl status nginx
```

if NGINX is not installed, you should because seeing the N+ dashboard is very useful. So install the oss NGINX:

```bash
sudo apt-get install nginx ( just to make the k8s port fwding to the NIC N+ dashboard easier )
```

- check /etc/nginx/nginx.conf if this server block does not exist, using root or sudo add this server block to /etc/nginx/nginx.conf right before the virtual hosts section and restart nginx
  
  ```bash
        server {
          listen 8081 default_server;  
          location / {
            proxy_bind 127.0.0.1;
            proxy_pass http://127.0.0.1:8080;
          }  
        }
  ```
  ```bash
  sudo nginx -s reload
  ```
now skip task_00, just cd to task_01 do that, then cd to task_02, do that, then to task_03, etc





