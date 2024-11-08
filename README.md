# [F5 NGINX Plus Ingress Controller as an API Gateway for Kubernetes](https://clouddocs.f5.com/training/community/nginx/html/class11/class11.html)

This is updated from the original work by Tony Marfil.

## Changes and Notes and Instructions

- if you're reading the lab guide, where it says to use RDP and Firefox, instead if you want, you can use a single webshell on the k8s box for everything and use curl
- in addition, you can also use the firefox access method on the jumphost it works well and has a little copy and paste widget to your local system on the left that works well
- on the k8s box, do these things:
-- sudo snap install k6
-- sudo apt-get install nginx ( just to make the k8s port fwding to the NIC N+ dashboard easier )
-- snap install kubectl --classic
-- unalias kubectl
-- unalias k

  
- 
- tasks - There are several utilities in the bin subdirectory.
- to start fresh do bin/list-all-k8s-lab-resources.sh --start-over
