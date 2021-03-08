---
slug: wifi-provision
title: Wifi Provision
author: Hacker 6009
author_title: Blog Admin
author_url:
author_image_url: /img/falundafa_avatar.jpg
tags: [sysadmin]
---

# Wifi Provision

Đây là tài liệu document chính hướng dẫn manual setup toàn bộ technical architect giữa các Access Point và Server Prometheus dược dàn dựng bởi `sudosys.com`.
:::info
Phía dưới là quá trình setup kỹ thuật, không bao gồm định nghĩa và hướng dẫn chi tiết.
:::
:::note

Do trình độ kỹ thuật hạn hẹp, mong các bạn đọc giả có thể góp ý hoặc đặt câu hỏi thông qua phần `Liên Hệ` ở trên.
:::

## PHẦN SETUP SERVER

### Setup SSH Tunnel

#### Thêm tài khoản truy cập server

Thêm user `noaccess` để các Access Point có thể SSH vào nhưng `không có quyền` gõ lệnh terminal:

```
sudo adduser --disabled-password --shell /sbin/nologin noaccess
sudo  -u noaccess whoami
sudo  -u noaccess ssh-keygen #Tạo folder và chmod cho lẹ
sudo touch /home/noaccess/.ssh/authorized_keys
sudo chmod 600 /home/noaccess/.ssh/authorized_keys
```

### Setup Nginx

Nginx gồm 2 chức năng:

1. Phân giải tên miền vào hàng loạt IP khác nhau có cùng 1 TCP port TTYD của Access Point
2. Xác thực người dùng qua URL token hoặc username và password.

```
server {
        server_name ssh.aps.ip1.meganet.com.vn;

        location ^~ / {
            resolver 8.8.8.8;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Port $server_port;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            location ~ "^/(.*)/(.*)/(.*)/(.*)" {
                auth_request /auth;
                auth_request_set $auth_status $upstream_status;
                proxy_pass http://$3:7681/$4;
            }
        }

        location = /auth {
                internal;
                #proxy_pass http://127.0.0.1:8080/tms/aps/authorized;
                proxy_pass https://demo.meganet.com.vn/api/Prometheus/authorized;
                proxy_pass_request_body off;
                proxy_set_header Content-Length "";
                proxy_set_header X-Original-URI $request_uri;
        }

    listen 443 ssl http2; # managed by Certbot

    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot



    ssl_certificate /etc/letsencrypt/live/ssh.aps.ip1.meganet.com.vn/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/ssh.aps.ip1.meganet.com.vn/privkey.pem; # managed by Certbot
}

server {
    if ($host = ssh.aps.ip1.meganet.com.vn) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

        listen 80;
        listen [::]:80;

        server_name ssh.aps.ip1.meganet.com.vn;
    return 404; # managed by Certbot


}
```

### OpenSSH Config

Lưu ý các trường sau trong file `/etc/ssh/sshd_config`:

```
IgnoreUserKnownHosts yes
AllowAgentForwarding yes
AllowTcpForwarding yes
X11Forwarding yes
PermitTunnel yes
TCPKeepAlive yes
PermitTTY yes
GatewayPorts clientspecified
```

Cấu hình xong nhớ restart service:

```
sudo systemctl restart ssh
```

## PHẦN SETUP ACCESS POINT

Có rất nhiều thứ cần phải setup như: cặp SSH `public_key` và `private key`; Các packages của OpenWRT để điều khiển như: `Prometheus`, `Node Exporter`, `Wifi Station`; `AutoSSH`; `TTYD`, `OpenNDS` v.v... OK, bắt đầu thôi.

### Setup Private Key

_Kết quả bên dưới sẽ áp dụng cho production, nên lưu ý dữ liệu của cặp key bên dưới_

Public_key:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC8x4yIvN1KHioqqi9JahUgZN9Cb3sXpCmpv8BiZXt6GPuJE0wwvFo8j+c8lxm8Yv/unhLy8PyQiSMPwchSCAg2b02D1IVh8WUbXIkOqdNDF5aQx02dPfaE9XRJqc3H85L7h5jNHie/Ax6uthPcI+F8dD8kZRJOj3snev36S97Q3G9qawWqhvGyv2COcbmYKA+dAM1MSa1GHidMCPIkuZmjcA6i4wuH1Rc13ke/jmyTFFEm4Xf2S4bHL9gpFOkHCN0u6XTwn6VGZus2tKsB5l4Cx0xr5MCGGSnSKSDFUHagWgJ+5GUWFMJ9y77qK1Ig7kbAuDFeH+4m49ODZCrfmWzB wifi_devices
```

Private_key:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAvMeMiLzdSh4qKqovSWoVIGTfQm97F6Qpqb/AYmV7ehj7iRNM
MLxaPI/nPJcZvGL/7p4S8vD8kIkjD8HIUggINm9Ng9SFYfFlG1yJDqnTQxeWkMdN
nT32hPV0SanNx/OS+4eYzR4nvwMerrYT3CPhfHQ/JGUSTo97J3r9+kve0NxvamsF
qobxsr9gjnG5mCgPnQDNTEmtRh4nTAjyJLmZo3AOouMLh9UXNd5Hv45skxRRJuF3
9kuGxy/YKRTpBwjdLul08J+lRmbrNrSrAeZeAsdMa+TAhhkp0ikgxVB2oFoCfuRl
FhTCfcu+6itSIO5GwLgxXh/uJuPTg2Qq35lswQIDAQABAoIBAAJdaZhI7WjBSfvw
19jOmGcofFeDuAIKz27N9SYGaW6VI4mLEVhG88ZwcxAiQHNItjYSCuC6Ph+9aBAJ
eG32pcuwx0LQhb89W+vk0964J+peQEeeB43hudXekU9e7jIEDiJSh4qCRzMwYdEE
fOk0Fd4OQsA89+a+C2fqNYZOLwNkygp0lxGuaM8ZKuDHgkRKZJYGd8V8GltMiVID
+LT5I4+0PYtT77a1G1GZ6itSb60mcPtFWU/X4I/U1MSvc+jJCzJFP8qEe3caBG1p
+J1aZAplSAN5IUE2l7/PEyCvxDL9FCbvHmdTrTQ9a8JyHGQJwTWcfk30HHJ71Zi8
ng94DOUCgYEA3VDS9cZRxZsmr7jm+A4mrIoevu/p/2vYbhE9fyxuQG0rC1gK5iRY
b/Mdtzn5+3oFXZT/e07FfFtERPGkp/yC6FgfNUpjzTDnWW4Hv9JO9UYSQKcn+x8v
/vlkLbxBRXmkUwnf7WOGeBsjjMznlHdkpctcBBF9O1CmwTWbp762/YMCgYEA2l1f
dcUwV5aDLtLtRm9Loy1e2G5/iJ8PliJh1JXPFFmRBKyatJ9pUAstJc6q5Jktd958
dyNBUKu4QBzdhAHOnW7RFt/Vkv2mYaFDNFx9t7Fhqe9pSiDMzcz5qnT69avEm88M
KFuI0vx/qPUUtTJhBABdwySX+M9KdFjxHIOx/WsCgYBUyeZIqtYhMrO7lsdGOYWv
jKsC079+T773TDuXQVpr7GcVTYG/ciU/npC/5cJUCgeMNs06XI9keULKdxlyElfE
1B4AuKNLtXSs2m61mskNRu8vPdsfZm9o6/rpWrpW96dw+NOFix+1XBBenRIL20IA
Es0J8flchCWe1/7uYS6SKQKBgGq9B6OGvwmhbgBeZFNwpbVewSTkZny+25yUs+N5
Ux7sZSG2yWyPG6hfvjLj4c8aPQqB+6800YGAXvEf6vvS8k8sUxJuWXSffkvsyu/2
YhF/qHCrsXjlrZbPoh67Tcz2qIVM4PF9RNV1TWWmXvfvZ1LQZwSzh4G8ufVDYKCC
k2d/AoGAQtgUlN8l5psZfrgFoAOkwphvp50sE61Sxww1HO+qVaWlEp3119C6iLwD
KiKe84SGAFj/UwumtFYz4bzAqBYVcbQZvzZ2MK2nEjaDSI59Br7aQlthEMg2BEXM
AVN26KwjzDRbQZAPf497+/gH8YuikvJKdzu01rO4riQNYSQALVw=
-----END RSA PRIVATE KEY-----
```

**Đem file `public_key` ở trên và gắn vào file `authorized_keys` của Server.**
