---
slug: system-architect
title: System Architect
author: Hacker 6009
author_title: Blog Admin
author_url:
author_image_url: /img/falundafa_avatar.jpg
tags: [sysadmin]
---

<!--truncate-->

:::note

Do trình độ kỹ thuật hạn hẹp, mong các bạn đọc giả có thể góp ý hoặc đặt câu hỏi thông qua phần `Liên Hệ` ở trên.
:::

## Virtual Enviroment

`Proxmox - Virtual Environment` một nền tảng quản lý ảo hóa máy chủ mã nguồn mở. Đây là bản phân phối Linux dựa trên Debian với nhân Ubuntu LTS đã được sửa đổi và cho phép triển khai và quản lý các máy ảo và vùng chứa.

_Xem thông tin chi tiết & document [tại đây](https://www.proxmox.com/en/)_

**Tình trạng hiện tại của VZ01**

1. Chỉ sử dụng ảo hóa Virtual Machine cho tất cả các máy chủ
2. 1 dây Ethernet số 1 được bridge với internet vmbr0 và vmbr1 là IP `10.10.10.1` được bridge qua vmbr0.
3. Ổ cứng (3,2TB 10K RPM)
4. 48 x Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz (2 Sockets)
5. 190GB RAM
6. Kernel Version: Linux 5.4.73-1-pve #1 SMP PVE 5.4.73-1 (Mon, 16 Nov 2020 10:52:16 +0100)
7. PVE Manager Version: pve-manager/6.3-2/22f57405

### LXC Containers

Mặc dù `Proxmox` cung cấp cho chúng ta 2 cơ chế ảo hóa, gồm `LXC Container` và `Virtual Machine`. Tuy nhiên, chúng tôi chỉ sử dụng `Virtual Machine` để đảm bảo hệ thống hoạt động ổn định.

:::caution
Không có kế hoạch sử dụng `LXC Container`
:::

### Virtual Machine

**ID được đặt theo cấu trúc:**

```
IP: 10.10.10.[ID]
Subnet: 255.255.255.0
Gateway: 10.10.10.1
```

ví dụ Virtual Machine có ID là 100 thì ta sẽ có IP là `10.10.10.100`

## Firewall

Để thuận tiện cho việc automation trong tương lai, đơn giản hóa trong việc cấu hình và tài nguyên. Chúng tôi đã sử dụng `Shorewall`. Xem chi tiết tại [trang chủ](https://shorewall.org/)

### Interface

Chúng tôi có 3 interfaces:

```
#ZONE   INTERFACE       OPTIONS
net     NET_IF          dhcp,tcpflags,nosmurfs,routefilter,logmartians,sourceroute=0,physical=vmbr0
loc     LOC_IF          tcpflags,nosmurfs,routefilter,logmartians,physical=vmbr1
vpn     VPN_IF          tcpflags,nosmurfs,routefilter,logmartians,physical=tun0
```

### NAT Port

Chúng tôi có quy định NAT port như sau:

#### Đối với các Protocol HTTP

Đối với HTTP/HTTPS, mô hình không sử dụng NAT. Mà sử dụng Domain Resolved, vui lòng xem phần `Domain Resolved`.

#### Đối với Protocal != HTTP/HTTPS

**Port > 100**

Luôn ưu tiên NAT Port mặc định của protocol nếu chỉ có một máy chủ trong hệ thống sử dụng port này.

Ví dụ email server, có POP3 và SMTP. Vui lòng NAT Port mặc định vào Protocol đó của Virtual Machine.

```
DNAT            net             loc:10.10.10.100:465     tcp     465
```

Trường hợp không phải port mặc định của máy chủ, vui lòng ghi chú thêm vào bản ghi của Shorewall

```
DNAT            net             loc:10.10.10.100:41010     tcp     1338 # MQTT protocol
```

**Port < 100**
Có quy tắc sau:

Đa số port < 100 thường là các port được tất cả hầu hết Virtual Machine sử dụng, nên ta có quy tắc sau:

```
[ID][PORT]
```

ví dụ VM có ID là `100` thì ta sẽ NAT Port `10022` cho port 22 (SSH Protocol) như ví dụ phía dưới.

```
# VM100
DNAT            net             loc:10.10.10.100:22     tcp     10022
```

### Anti DDoS

1. Mail Server được sử dụng `CSF` của Direct Admin.
2. Proxmox Server sử dụng `fail2ban` bảo vệ.

## Domain Resolved

### Cách Hoạt Động

Tất cả các Request HTTP/HTTPS đều được đưa qua Nginx xử lý trước khi đưa vào máy chủ Virtual Machine bên trong. Ví dụ:

```
server {
        server_name devops.sudosys.com;

        location / {
                proxy_pass             http://10.10.10.199:5678$request_uri;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_buffering off;
                client_max_body_size 0;
                proxy_connect_timeout  3600s;
                proxy_read_timeout  3600s;
                proxy_send_timeout  3600s;
                send_timeout  3600s;
        }

    listen 443 ssl; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}


server {
    if ($host = devops.sudosys.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

        listen 80;
        listen [::]:80;

        server_name devops.sudosys.com;
    return 404; # managed by Certbot
}
```

### SSL Renewal

Chúng tôi sử dụng `certbot` để kích hoạt SSL tự động. Xem document chính [tại đây](https://certbot.eff.org/)

Để thao tác với SSL của Nginx, bạn có thể sử dụng lệnh:

```
certbot --nginx -d devops.sudosys.com
```

## Monitoring

### Prometheus

### Các Exporters

### Grafana

### Alert Manager

## Operation Executed

1. Các yêu cầu thực hiện thay đỗi hệ thống đều được lập trình và thể hiện qua UI của Cloud Portal có phân quyền.

2. Yêu cầu của cấp dưới có thể được thực thi ngay hoặc phải được duyệt qua Slack

### Công Nghệ Sử Dụng

#### Slack

#### Front-end

- Bootstrap
- Codeingiter

#### Back-end

- Strapi

## Data Backup

- Backup duy nhất tầng Application

## High Available

### Nginx

### Các Backend Quan Trọng

### Database

Cân bằng tải và Failover
