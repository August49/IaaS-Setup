# Infrastructure as a Service (IaaS) Setup

Prerequisites:

- A basic understanding of the Linux command line
- A basic understanding of web servers and web applications
- A basic understanding of cloud computing concepts
- A basic understanding of Cryptography and Network Security

#### [Setting up and securing a virtual private server](#setting-up-and-securing-a-virtual-private-server)

#### [Setting up a web server](#setting-up-a-web-server)

#### [Installing node and setting up version control](#installing-node-and-setting-up-version-control)

#### [Create a sample web application](#create-a-sample-web-application)

#### [Configuring a reverse proxy server (Nginx)](#configuring-a-reverse-proxy-server-nginx)

#### [Setting up a CI/CD pipeline with GitHub Actions: Webhooks and WebSockets](#setting-up-a-cicd-pipeline-with-github-actions-webhooks-and-websockets)

#### [Setting up a load balancer and caching system](#Introduction)


#### [Setting up a containerization and Kubernetes](#Introduction)

#### [Setting up a monitoring and logging system](#Introduction)

#### [Setting up a database server (PostgreSQL)](#Introduction)

#### [Conclusion](./8.conclusion.md)

#### [Resources and references](#Introduction)

# Introduction

This repository contains a step-by-step setup your own of a Virtual Private Server (VPS) instance that will be running Ubuntu 20.04.6 LTS for hosting web applications. 



Disclaimer: This guide is intended for informational purposes only and may ideal if you are setting up a VPS instance for personal use or for a small-scale web application. If you are setting up a VPS instance for a production environment or for a large-scale web application, you may need to consult with a professional sysadmin or DevOps engineer to ensure that your infrastructure is secure, scalable, and reliable.

## Setting up a Virtual Private Server (VPS) Instance (Ubuntu 20.04.6 LTS)

### step 1: Buy a VPS instance

Visit any cloud provider of your choice and create a virtual private server (VPS) instance. You can use any cloud provider of your choice. Some popular cloud providers include AWS, Google Cloud, Azure, DigitalOcean, etc.

We won't be using the SDKs of the cloud providers to set up the VPS or any automation ( at least not too much of it), Instead will just buy a VPS instance from the cloud provider and use our local machine terminal to SSH into the server, then set up our infrastructure manually. That means most the steps can be done on any VPS instance regardless of the cloud provider. The manual setup can be time-consuming and error-prone, but it gives you more control over your infrastructure and helps you understand how things work under the hood.

However, using the SDKs or command-line and other automation tools provided by these cloud providers can make the process of managing and automating your infrastructure much easier. Moreover, secure wise always use the industry-standard security tools to secure your infrastructure.

Note: You can also use your own hardware if you have a spare machine lying around or can use a virtualization software like VirtualBox, VMware, or Proxmox to create a virtual machine on your own hardware, or containerization software like Docker.

During the creation of the VPS instance, you can open the following ports:

- 22 (SSH) for remote access
- 80 (HTTP) for web traffic ( you can disable this later or redirect it to port 443)
- 443 (HTTPS) for secure web traffic

Lastly, you can choose the operating system you want to use and region closest to you, leave the rest of the settings as default. In this setup, we will be using Ubuntu 20.04.6 LTS.

### step 2: Generate SSH keys and connect to the VPS instance

```bash
#open your terminal: preferable git bash or windows subsystem for linux if on windows
cd ~/.ssh  # if does not exist (mkdir .ssh)
ssh-keygen -t rsa -b 4096 -C "yourMail@example.com"  # Generate a new SSH key
```

You guard the private key but copy the public key across to the remote host (VM) to which you want to do key-based authentication. You can do this by running the following command:

```bash
  cat ~/.ssh/yourPublicKey.pub
```

Before you setup the ssh config, check if you can connect to the remote machine using the following command:

```bash
ssh -i ~/.ssh/yourPrivateKey azureuser@yourRemoteMachineExternalIpAdress
```

exit the remote machine by running the following command:

```bash
exit
```

Back on your local machine add the private key to the ssh-agent to avoid entering the passphrase every time you connect to the remote

```bash
eval "$(ssh-agent -s)" # start the ssh-agent in the background
ssh-add ~/.ssh/yourPrivateKey # add the private key to the ssh-agent
```

create a configuration file for SSH (~/.ssh/config) to specify the key to use for each host. Here's an example:

```bash
nano ~/.ssh/config
```

```bash
Host azure # an alias for the remote machine (you can use any name you want)
  HostName YourdomainName # your domain name or external ip address(copy from the vps instance)
    User azureuser # default user: check your remote machine for the default user
    IdentityFile ~/.ssh/yourPrivateKey
#add more hosts here as github as needed
```

secure and restrict access to it your ~/.ssh/config file by running the following command:

```bash
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/yourPrivateKey
chown $USER:$USER yourPrivateKey
# ssh -Tv git@github.com // run this if you a setting an ssh key for github to test your connection
```

Now you can connect to the remote machine using the alias you specified in the config file:

```bash
ssh azure # or whatever alias you specified in the config file
```

# Setting up and securing a virtual private server

## 1. Keep your system up to date

```bash
sudo apt update # update the package list
sudo apt upgrade # upgrade the packages
sudo apt-get install unattended-upgrades # this will automatically install security updates
sudo dpkg-reconfigure --priority=medium unattended-upgrades # configure the unattended-upgrades package
sudo shutdown -r now # restart your system then ssh back in
```

you can also use a cron job to automatically update your system but this is not recommended for production servers. whatever way you choose to update your system, make sure you do it regularly and run them in a test environment before running them in production.

## 2. Disable root Login and Password Authentication

Create a new user and disable root login and password authentication on virtual private server. this might be disable by default on some cloud providers. You can check if that is the case by running the following command:

```bash
grep PermitRootLogin /etc/ssh/sshd_config
grep PasswordAuthentication /etc/ssh/sshd_config
```

if the output is `PermitRootLogin no` and `PasswordAuthentication no` then you can skip this step.

```bash
sudo adduser newUsername
sudo usermod -aG sudo newUsername # add the user to the sudo group
su - newUsername # switch to the new user
sudo cat /etc/sudoers # check if the user is in the sudo group
```

generate an ssh key pair for the new user by running on your local machine:

```bash
ssh-keygen -t rsa -b 4096 -C "yourMail@gmail.com" # Generate a new SSH key
```

You guard the private key but copy the public key across to the remote host (VM) to which you want to do key-based authentication. your public as a .pub file extension.

Create a authorized_keys file in the new user's home directory and paste the public key

```bash
cd ~/
sudo mkdir .ssh
sudo nano .ssh/authorized_keys # add the public key in the file
sudo chown -R $USER:$USER .ssh # change the owner of the .ssh directory and the authorized_keys file to the new user
sudo chmod 700 .ssh # change the permissions of the .ssh directory to read, write, and execute for the owner and no permissions for others
sudo chmod 600 .ssh/authorized_keys # change the permissions of the authorized_keys file to read and write for the owner and no permissions for others
```

Before disabling root login and password authentication, check if you can connect to the remote machine using the new user in a new terminal window by running the following command:

```bash
ssh -i ~/.ssh/yourPrivateKey yourUsername@yourRemoteMachineExternalIpAdress
```

You can now disable root login and password authentication by running the
following command:

```bash
sudo nano /etc/ssh/sshd_config
```

In the file make the following changes

```bash
PermitRootLogin no
PasswordAuthentication no
#you may also want to change the port, number of login attempts, max number of sessions, etc
```

Next you need to restart the ssh service by running the following command:

```bash
sudo systemctl restart ssh
```

When you make changes to the sshd_config file, you need to restart the ssh service for the changes to take effect and try ssh into the remote machine using the new user, or else you may be locked out of your server.

## 3. Setup your firewall on ubuntu using ufw:

```bash
sudo ufw status
sudo ufw allow 22 # allow ssh traffic
sudo ufw allow 80 # allow http traffic (you can disable this later or redirect it to port 443)
sudo ufw allow 443 # allow https traffic
sudo ufw default deny incoming # deny all incoming traffic that does not match a rule
sudo ufw default deny forward  # deny all forwarding traffic that does not match a rule
sudo ufw default allow outgoing # allow all outgoing traffic
sudo ufw enable
```

Note: UFW is a user-friendly front-end for managing iptables firewall rules. Its main goal is to simplify the process of configuring a firewall on a host. While iptables can be quite complex to manage, UFW provides an easier to use interface. The type of firewall that ufw provides is host-based, which means it is specific to the host it is installed on. So for a network-based firewall, you would need to look at other options like a dedicated firewall appliance or a software solution.

## 4. install fail2ban to protect your server from brute-force attacks by running the following command:

```bash
sudo apt install fail2ban
sudo systemctl start fail2ban
sudo systemctl status fail2ban
```

configure fail2ban by editing the jail.local file by running the following command:

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

In the file, make the following changes:

```bash
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 600
```

## 5. Other security measures you can take include:

- Setting up a VPN
- Use security scanners like Nessus, OpenVAS, etc
- Use a separate server for your database
- Encrypt your data
- Allow only necessary services to run on your server
- Monitor your server logs
- Use a Web Application Firewall (WAF)
- Allow traffic only from specific IP addresses or Country using GeoIP

No “silver bullet” exists for information system security, but a series of measures can be taken to reduce the risk of security breaches.so always keep yourself updated on the latest security threats and best practices.

You need all the security measures you can get, an attacker only needs to find one vulnerability to exploit your system.

visit [OWASP](https://owasp.org/www-community/) to learn more about web security.

visit [cloudflare](https://www.cloudflare.com/) for more information

visit [NIST](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-123.pdf) for more information on cybersecurity.

visit [failBan](https://www.fail2ban.org/wiki/index.php/Main_Page) for more information on fail2ban.

visit [SSH Config](https://www.ssh.com/academy/ssh) for more information

visit [Linux Bible](https://www.amazon.com/Linux-Bible-Christopher-Negus/dp/111821854X) for more information

# Setting up a web server

## Installing and configuring a web server (Nginx) and ssl certificate

Nginx is a popular open-source web server that is known for its high performance, stability, and scalability. It is commonly used to serve static content, reverse proxy to other servers, and load balance incoming traffic.

```bash
sudo apt update
sudo apt install nginx
sudo systemctl status nginx
sudo systemctl start nginx # if not running

```

You can check if Nginx is running by visiting your server's public IP address in a web browser. You should see the default Nginx landing page. confirm that the firewall is working by rejecting all incoming traffic on port 80.

```bash
sudo ufw reject 80
sudo ufw status
sudo ufw reload
sudo systemctl restart nginx
```

refresh the page and you should see a connection error(This site can't be reached). You need to serve
your traffic on port 443 (https) instead of port 80 (http) to secure your traffic. but before that, you need to a domain name and an SSL certificate.

Buy a domain name from any domain registrar of your choice. You can use name.com, GoDaddy, Google Domains, etc. Once you have purchased a domain name, you can configure it to point to your server's IP address.You can also use a free domain name from services like Freenom. You need a domain name to get an SSL certificate.

Create New file in the sites-enabled directory with your domain name as the filename by running the following command:

```bash
sudo nano /etc/nginx/sites-enabled/your_domain_name.com
```

```bash
server {
  listen 80;
  listen [::]:80;
  server_name your_domain_name.com;

  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }
}
```

configure your ssl certificate by running the following command:

```bash
sudo apt-get remove certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx # For this command to work, you need to re-enable port 80 on your firewall
sudo certbot renew --dry-run
```

Before you access your website using using https://your_domain_name.com, you need to point your domain name to your server's IP address. You can do this by adding an A record to your domain registrar's DNS settings.

You can now access your website using https://your_domain_name.com.
Next, disable port 80 on traffic by running the following command:

```bash
sudo ufw reject 80
sudo ufw status
sudo ufw reload
sudo systemctl restart nginx
```

visit [Certbot](https://certbot.eff.org/) to get a free SSL certificate for your domain name.

check the site for the latest instructions on how to install certbot on your server.

# Installing node and setting up version control

## Node.js Setup

As we're setting up a node application we'll have to install node on our vps
by running the following commands:

```bash
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Setting up version control

We'll use git to clone our nodejs application from github. If you don't have git installed on your vps, you can install it by running the following command:

```bash
sudo apt-get install git
```

Configure your git username and email by running the following commands:

```bash
git config --global user.name "yourName"
git config --global user.email "test@gmail.com"
```

Configure your SSH key on your vps that will be used to authenticate with github. If you don't have an SSH key, you can generate one by running the following command:

```bash
cd ~/.ssh
sudo  ssh-keygen -t rsa -b 4096 -C "yourMail@gmail.com" # Generate a new SSH key and copy the public key to github
```

copy the public key to github by running the following command:

```bash
cat ~/.ssh/yourPublicKey.pub
```

Change the permissions of the .ssh directory to read, write, and execute for the owner and no permissions for others by running the following command:

```bash
sudo chmod 700 ~/.ssh
sudo chmod 600 yourGithubPrivateKey # generated on your vps
sudo chown $USER:$USER yourGithubPrivateKey # change the owner of the private key to the current user
ssh -i yourGithubPrivateKey git@github.com # test the connection
```

Add the private key to the ssh-agent to avoid entering the passphrase every time you connect to the remote.
Navigate to the .ssh directory and create a new config file

```bash
nano config
```

Add the following configuration to the file:

```bash
Host github.com # an alias for the remote machine (you can use any name you want)
  HostName github.com
  User git
  IdentityFile ~/.ssh/yourGithubPrivateKey
```

Secure and restrict access to the ~/.ssh/config file by running the following command:

```bash
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/yourGithubPrivateKey
chown $USER:$USER ~/.ssh/yourGithubPrivateKey
```

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/yourGithubPrivateKey
ssh  github.com
```

Create and clone a repository

```bash
sudo chown -R $USER:$USER /var/www # change the owner of the /var/www directory to the current user
cd /var/www
git clone git@github.com:August49/IaaS-Setup.git # clone the repository
sudo chown -R $USER:$USER /var/www/IaaS-Setup # change the owner of the cloned repository to the current user
```

# Create a sample web application

## Setting up a simple web application on your local machine

on your local machine, clone the repository by running the following command:

```bash
git clone  https://github.com/August49/IaaS-Setup.git
cd IaaS-Setup
```

create a new branch and switch to it by running the following command:

```bash
git checkout -b feature/your-feature-name
```

create an index.js file and write a simple hello world web application by running the following command:

```bash
touch index.js
```

Add the following code to the index.js file:

```javascript
const http = require("http");

const hostname = "localhost";
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World\n");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

run the application by running the following command:

```bash
node index.js
```

visit http://localhost:3000/ in your browser to see the hello world message.

commit your changes and push them to the remote repository by running the following command:

```bash
git add .
git commit -m "Add a simple hello world web application"
git push origin feature/your-feature-name
```

Since you are on a new branch, you can create a pull request on by visiting the repository on GitHub and clicking on the "New pull request" button. Once the pull request is approved, you can merge it into the main branch.

## Deploy the application to the VM

on the VM, navigate to the /var/www/IaaS-Setup directory and pull the changes by running the following command:

```bash
cd /var/www/IaaS-Setup
git pull
node index.js
```

# Configuring a reverse proxy server (Nginx)

set up a reverse proxy server using Nginx to forward requests from the client to the Node.js application server running on port 3000. The reverse proxy server will listen on port 80 and forward the requests to the Node.js application server running on port 3000.

In the server block created in the previous step, add the following configuration to set up a reverse proxy server:

```bash
sudo nano /etc/nginx/sites-enabled/your_domain_name.com
```

```bash
#rest of the content

#new content
  location / {
    proxy_pass http://localhost:3000; # your application server
    proxy_http_version 1.1;            #enable http1.1
    proxy_set_header Upgrade $http_upgrade; #enable websocket
    proxy_set_header Connection 'upgrade'; #enable websocket
    proxy_set_header Host $host; #set the host header
    proxy_cache_bypass $http_upgrade; #bypass the cache
    proxy_set_header X-Real-IP $remote_addr; #pass the original client ip
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; #identify the client ip
    proxy_set_header X-Forwarded-Proto $scheme; #identify the protocol
    proxy_set_header X-Forwarded-Host $host; #identify the host
    proxy_set_header X-Forwarded-Port $server_port; #identify the port
    proxy_set_header X-Forwarded-Server $host; #identify the server
  }

#rest of the content

```

The X-forwarded-\* headers are useful for logging and security purposes.

restart the Nginx service to apply the changes by running the following command:

```bash
sudo systemctl restart nginx
node index.js # run the application then visit your_domain_name.com in your browser to see the hello world message.
```

Install pm2 to manage and keep the Node.js application running in the background by running the following command:

```bash
sudo npm install pm2 -g
pm2 start index.js --name my-app
pm2 logs my-app
pm2 save
pm2 startup
```

With pm2 in place, you can manage the application lifecycle, monitor the application, and automatically restart the application if it crashes.

For security reasons, you can disable the default Nginx configuration and enable sites that are actively in use by running the following command:

```bash
sudo unlink /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/nginx.conf
```

Add the following line to the http block:

```bash
# Virtual Host Configs
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/sites-enabled/your_domain_name.com;
```

Check the nginx configuration file for syntax errors by running the following command:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

visit your_domain_name.com in your browser to confirm that the reverse proxy server is working as expected.

# Setting up a CI/CD pipeline with GitHub Actions: Webhooks and WebSockets

## 1. Environment Variables

The best way to keep configuration out of an application’s codebase is to provide such values via environment variables. This way, a compromised code repository shouldn’t lead to sensitive data being stolen.

Note: If you are using a cloud provider like AWS, Google Cloud, Azure, etc., you can use their services to manage your environment variables or use a service like Doppler. In our case, we will be using a .env file to store our environment variables.

Before creating the .env file, you need a .gitignore file to prevent the .env file from being pushed to the remote repository. The best create this is by on vscode: ctrl + shift + p, then type gitignore, then select the template for your project.

```bash
touch .env # you need an .env both locally and on the server(or use a service like Doppler)
```

## 2. Setting up a CI/CD Pipeline

Continuous Integration/Continuous Deployment (CI/CD) is event-driven. It's based on the idea that certain actions or "events" in the development process trigger other actions. For example, when a developer pushes code to a repository, a CI/CD pipeline can automatically run tests, build the application, and deploy it to a server.

we can automate the process of testing, building, and deploying our application by:

- setting up a cron job to run a script at a specific time, though not scalable and recommended.
- we can use pub/sub services like webhooks, Google Cloud Pub/Sub etc. This allows use to trigger a action only when a specific event occurs unlike cron jobs that continuously run even when there is no event.

### CI/CD Pipeline with GitHub Actions

#### 1. Create a GitHub workflow

create a github action workflow by creating a new directory called .github/workflows in the root of your project and add a new file called ci-cd.yml. Add the following configuration to the ci-cd.yml file:

```bash
mkdir -p .github/workflows
touch .github/workflows/ci-cd.yml
```

```bash
name: CI-CD-Workflow # name of the workflow
run-name: ${{ github.actor }} is testing out GitHub Actions 🚀
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm test # will be using vitest as the test runner
      - run: echo "🍏 This job's status is ${{ job.status }}."
```

This workflow will fail if you don't have a test script in your package.json file.

```bash
npm install vitest # install vitest on your local machine
```

then add the test script to your package.json file

```bash
"scripts": {
  "test": "vitest"
}
```

Then create a new directory called test in the root of your project and add a new file called test.js. Add the following basic test to the test.js file:

```bash
import { describe, it, expect } from "vitest";

describe("Basic test", () => {
  it("should return true", () => {
    expect(true).toBe(true);
  });
});
```

Use a tool like act to test your workflow locally before pushing it to the GitHub repository.

```bash
wget  https://github.com/nektos/act/releases/download/v0.2.60/act_Linux_arm64.tar.gz # download the act binary. check the latest version on the act releases page
tar xvf act_Linux_arm64.tar.gz # extract the act binary
sudo mv act /usr/local/bin # move the act binary to the /usr/local/bin directory
act --version # check the version of act
cd - # go back to the previous directory(project directory)
act
```

#### 2. Setting up a webhook to listen to events from the GitHub repository

1. Webhooks vs WebSockets
   Webhooks and WebSockets are two different ways of sending data between a client and a server. Webhooks are HTTP callbacks that are triggered by specific events, while WebSockets are a communication protocol that allows for real-time, bidirectional communication between a client and a server.

To create a webhook to listen to you prod branch, you need

- a webhook url : This url should added to the GitHub repository, it will be used to send events or notifications to your prod environment or whatever environment you want to listen to.
- Listener or handler: This is a server that listens to the events sent by the webhook url, then triggers a series of actions or events based on the event received, such as running tests, building the application, deploying the application, etc.
- protect your main branch by setting up branch protection rules in the GitHub repository settings. This will prevent anyone from pushing directly to the main branch and require that all changes be made through pull requests.

##### webhook url

This should be your domain name and the path to the webhook listener script.

```bash
https://your_domain_name.com/webhook #add this to the GitHub repository webhook settings.
```

You can block all traffic for this endpoint except for the GitHub IP addresses and authorized users by using a tool like Cloudflare Access or a reverse proxy server like Nginx or add a secret key to the webhook url.

```bash
https://your_domain_name.com/webhook?secret=yourSecretKey #add this to the GitHub repository webhook settings.
```

##### Listener or handler

```bash
#add the secret key to the webhook listener script
import express from "express";

const app = express();

const secret = process.env.SECRET_KEY;

app.post("/webhook", (req, res) => {
  if(!req.query.secret || req.query.secret !== secret) {
    return res.status(401).send("Unauthorized");
  } # better block this traffic at the reverse proxy server level or use a tool like Cloudflare Access
  const payload = req.body;

  if(payload.ref === "refs/heads/prod") {
    console.log("🚀 prod branch has been pushed to");
    //TODO: handle the event : send an email, run tests, build the application, deploy the application, etc.

  }
res.status(200).send("OK");
});
```

Note: If your deployment process involves proprietary information or complex processes that you do not want to make public, you might want to consider keeping the deployment scripts in a private repository or using a private CI/CD tool.

you can also use a tool like smee to create a webhook proxy that will forward the events from the GitHub repository to your local machine.

```bash
smee --url https://smee.io/yourSmeeUrl --target http://localhost:portNumber/webhook
```
