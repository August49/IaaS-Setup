# Infrastructure as a Service (IaaS) Setup

Prerequisites:

- A basic understanding of the Linux command line
- A basic understanding of web servers and web applications
- A basic understanding of cloud computing concepts
- A basic understanding of Cryptography and Network Security

# Introduction

This repository contains a step-by-step setup your own of a Virtual Private Server (VPS) instance that will be running Ubuntu 20.04.6 LTS for hosting web applications. It covers the following topics:

#### [Setting up and securing a virtual private server](./2.securing-the-vps-instance.md)

#### [ Installing and configuring a web server (Nginx) and ssl certificate](./3.web-server.md)

#### [Installing node and setting up version control](./4.setup-application.md)

#### [Create a sample web application](./5.Create-a-sample-web-application.md)

#### [Setting up a reverse proxy server](./6.Setting-up-a-reverse-proxy-server.md)

#### [Setting up a CI/CD pipeline with GitHub Actions: Webhooks and WebSockets](./7.ci-cd.md)

- Continuous integration and deployment (CI/CD with GitHub Actions)
- Installing and configuring a database server (PostgreSQL)
- Monitoring and logging
- Load balancing and caching
- Containerization and Kubernetes
- Resources and references
- Glossary of terms

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

next page: [Setting up and securing a virtual private server](./2.securing-the-vps-instance.md)

visit [SSH Config](https://www.ssh.com/academy/ssh) for more information

visit [Linux Bible](https://www.amazon.com/Linux-Bible-Christopher-Negus/dp/111821854X) for more information


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

next page: [Installing and configuring a web server (Nginx) and ssl certificate](3.web-server.md)
previous page: [introduction](1.intro.md)

visit [Ubuntu Security](https://ubuntu.com/security) for more information on securing your Ubuntu server.
visit [OWASP](https://owasp.org/www-community/) to learn more about web security.
visit [cloudflare](https://www.cloudflare.com/) for more information
visit [NIST](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-123.pdf) for more information on cybersecurity.
visit [failBan](https://www.fail2ban.org/wiki/index.php/Main_Page) for more information on fail2ban.
visit [Linux Bible](https://www.amazon.com/Linux-Bible-Christopher-Negus/dp/111821854X) for more information
