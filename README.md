# [F5 NGINX Plus Ingress Controller as an API Gateway for Kubernetes](https://clouddocs.f5.com/training/community/nginx/html/class11/class11.html)

This is updated from the original work by Tony Marfil.

## Changes and Notes and Instructions

- if you're reading the lab guide, you can do that, but you might not even need to because in each task sub-directory, I updated the README with almost all the steps you will need and you can just follow that
- where it says to use RDP and Firefox, instead if you want, you can use a single webshell on the k8s box for everything and use curl
- in addition, you can also use the firefox access method on the jumphost it works well and has a little copy and paste widget to your local system on the left that works well
- I couldn't get the existing jwt creation script to work, so I made another one based off Liam's JWT blog and it's in task_05 and works well
  
- on the k8s box, do these things before you start the tasks:

```bash  
sudo snap install k6
sudo apt-get install nginx ( just to make the k8s port fwding to the NIC N+ dashboard easier )
snap install kubectl --classic
unalias kubectl
unalias k
alias k=kubectl
alias h='history | grep'
cd /home/ubuntu/.kube
microk8s config > confi
``` 

- There are several utilities in the bin subdirectory.
- to start fresh do bin/list-all-k8s-lab-resources.sh --start-over
- add this server block to /etc/nginx/nginx.conf right before the virtual hosts section
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
  
