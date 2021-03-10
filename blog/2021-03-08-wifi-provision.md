---
slug: wifi-provision
title: Wifi Provision
author: Hacker 6009
author_title: Blog Admin
author_url:
author_image_url: /img/falundafa_avatar.jpg
tags: [sysadmin]
---

<!--truncate-->

# Wifi Provision

Đây là tài liệu document chính hướng dẫn manual setup toàn bộ technical architect giữa các Access Point và Server Prometheus dược dàn dựng bởi `sudosys.com`.

:::info

1. Tài liệu không phù hợp với người chưa có định nghĩa về các dịch vụ (services).
2. Phía dưới là quá trình setup kỹ thuật. Định nghĩa của service cho biết mục tiêu của tác giả đang thực hiện.

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

### Setup Prometheus 

```
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
alerting:
  alertmanagers:
    - scheme: http
      timeout: 10s
      api_version: v1
      static_configs:
        - targets:
            - localhost:9093
rule_files:
  - server_rules.yml
  - aps_rules.yml
scrape_configs:
  - job_name: prometheus
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - localhost:9090
  - job_name: Wifi Export - Nha Hoc
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - undefined:9100
        labels:
          group: demo
          locationId: 5d67aad0c757097414ff3dc0
          city: thanh-pho-ho-chi-minh
          district: Quận Tân Bình
          type: devices
  - job_name: Wifi Export - Thai Hoang
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - undefined:9100
          - 127.1.23.128:9100
        labels:
          group: demo
          locationId: 5d6f6963439a91549c125bae
          city: thanh-pho-ho-chi-minh
          district: Quận 10
          type: devices
  - job_name: Wifi Export - MegaNet Office
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - 127.1.8.103:9100
          - 127.1.6.134:9100
          - 127.1.4.153:9100
          - 127.1.9.124:9100
          - 127.1.8.242:9100
          - 127.1.4.193:9100
          - 127.1.23.117:9100
          - 127.1.2.172:9100
          - 127.1.4.194:9100
          - 127.1.4.198:9100
          - 127.1.5.137:9100
          - 127.1.5.122:9100
          - 127.1.23.121:9100
          - 127.1.23.122:9100
          - 127.1.7.40:9100
          - 127.1.23.125:9100
        labels:
          group: demo
          locationId: 5ff5402d2cc39f45cf013780
          city: thanh-pho-ho-chi-minh
          district: Quận 10
          type: devices
  - job_name: Wifi Export - Go Dau
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - 127.1.9.3:9100
          - 127.1.23.119:9100
          - 127.1.23.120:9100
          - 127.1.23.123:9100
          - 127.1.23.124:9100
        labels:
          group: demo
          locationId: 5fffc4141c6aca3a34078928
          city: thanh-pho-ho-chi-minh
          district: Quận Tân Phú
          type: devices
  - job_name: Wifi Export - CF Viva Hoang Hoa Tham
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - 127.1.23.118:9100
        labels:
          group: demo
          locationId: 5ff5921cfe51dd2f2088d13f
          city: thanh-pho-ho-chi-minh
          district: Quận Tân Bình
          type: devices
  - job_name: Wifi Export - CF Kim
    honor_timestamps: true
    scrape_interval: 15s
    scrape_timeout: 10s
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - 127.1.23.126:9100
          - 127.1.23.127:9100
        labels:
          group: demo
          locationId: 60113cc61d43d20f04895bc2
          city: thanh-pho-ho-chi-minh
          district: Quận 7
          type: devices
```

- Theo quy tắc IP `127.1.0.1` tương ứng với Access Point có ID là `1` và tăng dần lên.
- Port 9100 là port mặc định của `Node Exporter Prometheus Lua`.

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

### Setup Authorized Key

Dynamic keys. Cập nhật sau...

### Cài Đặt Các Gói

```
opkg update
opkg install ttyd prometheus-node-exporter-lua-bmx6 prometheus-node-exporter-lua-bmx7 prometheus-node-exporter-lua-nat_traffic prometheus-node-exporter-lua-netstat prometheus-node-exporter-lua-openwrt prometheus-node-exporter-lua-textfile prometheus-node-exporter-lua-wifi prometheus-node-exporter-lua-wifi_stations autossh
```

### Config TTYD

**Nội dung config:**

```
config ttyd
	option interface '@loopback'
	option command '/bin/sh -l
```

**Restart và enable service**

```
/etc/init.d/ttyd restart
/etc/init.d/ttyd enable
```

### Config AutoSSH

**Nội dung config:**

```

config autossh
option ssh '-N -T
-o StrictHostKeyChecking=no
-o ServerAliveInterval=60
-o ServerAliveCountMax=10
-R $LOCAL_NAT_IP:2222:localhost:22
-R $LOCAL_NAT_IP:9100:localhost:9100
-R $LOCAL_NAT_IP:7681:localhost:7681
noaccess@ssh.aps.meganet.com.vn -p 10422'
option gatetime '0'
option monitorport '0'
option poll '600'
option enabled '1'

```

**Restart và enable service**

```
/etc/init.d/autossh restart
/etc/init.d/autossh enable
```

### Prometheus Lua

Không có gì cần config, tuy nhiên cần hiểu cấu trúc thư mục để `develop`.


## ACCESS POINT SETTINGS

### Setting Sóng Wifi

**Wifi không đặt mật khẩu:**

```
config wifi-device 'radio0'
	option type 'mac80211'
	option channel '36'
	option hwmode '11a'
	option path 'pci0000:00/0000:00:00.0'
	option htmode 'VHT80'

config wifi-iface 'default_radio0'
	option device 'radio0'
	option network 'lan'
	option mode 'ap'
	option encryption 'none'
	option ssid 'CuongPV'

config wifi-device 'radio1'
	option type 'mac80211'
	option channel '11'
	option hwmode '11g'
	option path 'platform/ahb/18100000.wmac'
	option htmode 'HT20'

config wifi-iface 'default_radio1'
	option device 'radio1'
	option network 'lan'
	option mode 'ap'
	option encryption 'none'
	option ssid 'CuongPV'
```

**Wifi đặt mật khẩu:** 

```
config wifi-device 'radio0'
	option type 'mac80211'
	option channel '36'
	option hwmode '11a'
	option path 'pci0000:00/0000:00:00.0'
	option htmode 'VHT80'

config wifi-iface 'default_radio0'
	option device 'radio0'
	option network 'lan'
	option mode 'ap'
	option ssid 'CuongPV'
	option key '123456789'
	option encryption 'psk2'

config wifi-device 'radio1'
	option type 'mac80211'
	option channel '11'
	option hwmode '11g'
	option path 'platform/ahb/18100000.wmac'
	option htmode 'HT20'

config wifi-iface 'default_radio1'
	option device 'radio1'
	option network 'lan'
	option mode 'ap'
	option key '123456789'
	option ssid 'CuongPV 5GHz'
	option encryption 'psk2'

```

**Roaming nhiều thiết bị:**

```
config wifi-device 'radio0'
        option type 'mac80211'
        option channel '36'
        option hwmode '11a'
        option path 'pci0000:00/0000:00:00.0'
        option htmode 'VHT80'

config wifi-iface 'default_radio0'
        option device 'radio0'
        option network 'lan'  # Client kết nối sẽ được đẩy vào internet lan
        option mode 'ap'
        option ssid 'CuongPV'
        option key '123456789'
        option encryption 'psk2'
        option ft_over_ds '1'
        option ft_psk_generate_local '1'
        option ieee80211r '1'
        ### Start Roaming Option ###
        # Nên khác nhau trong một khu vực Roaming, tương lai sẽ xử lý vụ khác nhau sau.
        # Tạm thời cần roaming thì thêm option này vào
        option mobility_domain 'ff00'
        ### End Roaming Option ###

config wifi-device 'radio1'
        option type 'mac80211'
        option channel '11'
        option hwmode '11g'
        option path 'platform/ahb/18100000.wmac'
        option htmode 'HT20'

config wifi-iface 'default_radio1'
        option device 'radio1'
        option network 'lan' # Client kết nối sẽ được đẩy vào internet lan
        option mode 'ap'
        option key '123456789'
        option ssid 'CuongPV 5GHz'
        option encryption 'psk2'
        option ft_over_ds '1'
        ### Start Roaming Option ###
        # Nên khác nhau trong một khu vực Roaming, tương lai sẽ xử lý vụ khác nhau sau.
        # Tạm thời cần roaming thì thêm option này vào
        option mobility_domain 'ff00' 
        ### End Roaming Option ###
        option ft_psk_generate_local '1'
        option ieee80211r '1'
```

### Setting Captive Portal

Có 2 option để có thể cho người dùng acces vào access point

**Can thiệp từ Server**

Document

```
root@OpenWrt:/etc/config# ndsctl
Usage: ndsctl [options] command [arguments]

options:
  -s <path>           Path to the socket
  -h                  Print usage

commands:
  status
	View the status of opennds

  clients
	Display machine-readable client list

  json	mac|ip|token(optional)
	Display client list in json format
	mac|ip|token is optional, if not specified, all clients are listed

  stop
	Stop the running opennds

  auth mac|ip|token sessiontimeout(minutes) uploadrate(kb/s) downloadrate(kb/s) uploadquota(kB) downloadquota(kB) customstring
	Authenticate client with specified mac, ip or token

	sessiontimeout sets the session duration. Unlimited if 0, defaults to global setting if null (double quotes).
	The client will be deauthenticated once the sessiontimout period has passed.

	uploadrate and downloadrate are the maximum allowed data rates. Unlimited if 0, global setting if null ("").

	uploadquota and downloadquota are the maximum volumes of data allowed. Unlimited if 0, global setting if null ("").

	customstring is a custom string that will be passed to BinAuth.

	Example: ndsctl auth 1400 300 1500 500000 1000000 "This is a Custom String"

  deauth mac|ip|token
	Deauthenticate user with specified mac, ip or token

  block mac
	Block the given MAC address

  unblock mac
	Unblock the given MAC address

  allow mac
	Allow the given MAC address

  unallow mac
	Unallow the given MAC address

  trust mac
	Trust the given MAC address

  untrust mac
	Untrust the given MAC address

  debuglevel n
	Set debug level to n (0=silent, 1=Normal, 2=Info, 3=debug)

```

**Bình thường đến Access Point**

```

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" href="/images/splash.jpg" type="image/x-icon">
<link rel="stylesheet" type="text/css" href="/splash.css">

<title>MegaNet Gateway - Testing by CuongPV</title>

<!--
Content:
	openNDS (NDS), by default, serves this splash page (splash.html)
	when a client device Captive Portal Detection (CPD) process
	attempts to send a port 80 request to the Internet.

	You may either embed css in this file or use a separate .css file
	in the same directory as this file, as demonstrated here.

	It should be noted when designing a custom splash page
	that for security reasons many CPD implementations:
		Immediately close the browser when the client has authenticated.
		Prohibit the use of href links.
		Prohibit downloading of external files
			(including .css and .js).
		Prohibit the execution of javascript.

Authentication:
	A client is authenticated on submitting an HTTP form, method=get,
	passing http://192.168.1.1:2050/opennds_auth/, c9907c12, http://nmcheck.gnome.org/ and optionally username and password

	It is also possible to authenticate using an href link to
	http://192.168.1.1:2050/opennds_auth/?tok=c9907c12&amp;redir=http://nmcheck.gnome.org/ but be aware that many device Captive Portal Detection
	processes prohibit href links, so this method may not work with
	all client devices.

Available variables:
	http://192.168.1.1:2050/opennds_auth/
	http://192.168.1.1:2050/opennds_deny/
	http://192.168.1.1:2050/opennds_auth/?tok=c9907c12&amp;redir=http://nmcheck.gnome.org/
	192.168.1.127
	9c:30:5b:e3:28:5d
	0
	0
	44:d1:fa:59:22:6a
	MegaNet Gateway - Testing by CuongPV
	250
	1
	http://nmcheck.gnome.org/
	c9907c12
	c9907c12
	5d 20h 5m 25s
	5.2.0
	username
	password
-->

</head>

<body>
<div class="offset">
<med-blue>MegaNet Gateway - Testing by CuongPV</med-blue>
<div class="insert">
<big-red>Welcome!</big-red>
<hr>
<br>
<italic-black>For abc access to the Internet, please tap or click Continue.</italic-black>
<br><br>
<hr>

<form method="get" action="http://192.168.1.1:2050/opennds_auth/">
<input type="hidden" name="tok" value="c9907c12">
<input type="hidden" name="redir" value="http://nmcheck.gnome.org/">
<input type="submit" value="Continue">
</form>
	
<hr>

<copy-right>
	<img style="float:left; max-height:5em; height:auto; width:auto" src="/images/splash.jpg" alt="Splash Page: For access to the Internet.">
	<br><br><br>
	Copyright &copy; The openNDS Contributors 2004-2020.<br>
	This software is released under the GNU GPL license.<br>
	openNDS version 5.2.0
</copy-right>


</div></div>
</body>
</html>

```

**File Backend - Biến Nguyên Mẫu**

```
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" href="/images/splash.jpg" type="image/x-icon">
<link rel="stylesheet" type="text/css" href="/splash.css">

<title>$gatewayname</title>

<!--
Content:
	openNDS (NDS), by default, serves this splash page (splash.html)
	when a client device Captive Portal Detection (CPD) process
	attempts to send a port 80 request to the Internet.

	You may either embed css in this file or use a separate .css file
	in the same directory as this file, as demonstrated here.

	It should be noted when designing a custom splash page
	that for security reasons many CPD implementations:
		Immediately close the browser when the client has authenticated.
		Prohibit the use of href links.
		Prohibit downloading of external files
			(including .css and .js).
		Prohibit the execution of javascript.

Authentication:
	A client is authenticated on submitting an HTTP form, method=get,
	passing $authaction, $tok, $redir and optionally $username and $password

	It is also possible to authenticate using an href link to
	$authtarget but be aware that many device Captive Portal Detection
	processes prohibit href links, so this method may not work with
	all client devices.

Available variables:
	$authaction
	$denyaction
	$authtarget
	$clientip
	$clientmac
	$clientupload
	$clientdownload
	$gatewaymac
	$gatewayname
	$maxclients
	$nclients
	$redir
	$tok
	$token
	$uptime
	$version
	$username
	$password
-->

</head>

<body>
<div class="offset">
<med-blue>$gatewayname</med-blue>
<div class="insert">
<big-red>Welcome!</big-red>
<hr>
<br>
<italic-black>For abc access to the Internet, please tap or click Continue.</italic-black>
<br><br>
<hr>

<form method="get" action="$authaction">
<input type="hidden" name="tok" value="$tok">
<input type="hidden" name="redir" value="$redir">
<input type="submit" value="Continue">
</form>
	
<hr>

<copy-right>
	<img style="float:left; max-height:5em; height:auto; width:auto" src="/images/splash.jpg" alt="Splash Page: For access to the Internet.">
	<br><br><br>
	Copyright &copy; The openNDS Contributors 2004-2020.<br>
	This software is released under the GNU GPL license.<br>
	openNDS version $version
</copy-right>


</div></div>
</body>
</html>

```

Yêu cầu phải có `token` để có thể access internet, ví dụ :

```
Link: http://192.168.1.1:2050/opennds_auth/?tok=c9907c12&amp;redir=http://nmcheck.gnome.org/
```

:::note

Mỗi thiết bị sẽ có riêng một `redir` variable không cố định. Tuy nhiên, phải có biến này, nếu không thiết bị sẽ không thể nhận biết Access Point đã cho phép kết nối internet hay chưa.
:::

## Access Point Advanced Setting
    
### Network Config 

**Cấu hình network:**

```
config interface 'loopback'
	option ifname 'lo'
	option proto 'static'
	option ipaddr '127.0.0.1'
	option netmask '255.0.0.0'

config globals 'globals'
	option ula_prefix 'fdab:fdc1:a5c7::/48'

config interface 'lan'
	option type 'bridge'
	option ifname 'eth0.1'
	option proto 'static'
	option ipaddr '192.168.1.1'
	option netmask '255.255.255.0'
	option ip6assign '60'

config interface 'wan'
	option ifname 'eth0.2'
	option proto 'dhcp'

config interface 'wan6'
	option ifname 'eth0.2'
	option proto 'dhcpv6'

config switch
	option name 'switch0'
	option reset '1'
	option enable_vlan '1'

config switch_vlan
	option device 'switch0'
	option vlan '1'
	option ports '2 0t'

config switch_vlan
	option device 'switch0'
	option vlan '2'
	option ports '3 0t'
```

- `eth0.1` bridge với interface ảo tên là `lan` có static IP là `192.168.1.1`.

- `eth0.2` được cắm trực tiếp bằng cáp ethernet và được cấu hình IP DHCP.

Có thể tạo thêm interfaces.


## ACCESS POINT MANAGEMENT

### Điều Khiển

Truy cập domain:

> https://ssh.aps.meganet.com.vn/$username/$password/$NAT_IP

### Giám Sát 

**API:**

> https://prometheus.meganet.com.vn

**Grafana UI:**

> https://grafana.meganet.com.vn

**Tắt Cảnh Báo**

> https://alertmanager.meganet.com.vn/

### Đếm Session

Server Prometheus Pull tất cả  system log của tất cả AP về một nơi và bắt đầu đếm chúng.

> cat /tmp/ndslog/ndslog.log


**Ví dụ tính theo lượt nhập thông tin:**

```
Thu Mar  4 10:06:03 UTC 2021, username=new demo, emailAddress=demo@deme.com, macaddress=9c:30:5b:e3:28:5d, clientzone=LocalZone:wlan1, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36
Thu Mar  4 10:06:04 UTC 2021, username=new demo, emailAddress=demo@deme.com, macaddress=9c:30:5b:e3:28:5d, clientzone=LocalZone:wlan1, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36
Thu Mar  4 10:06:05 UTC 2021, username=new demo, emailAddress=demo@deme.com, macaddress=9c:30:5b:e3:28:5d, clientzone=LocalZone:wlan1, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36
Thu Mar  4 10:12:11 UTC 2021, username=cuongpv, emailAddress=cuongpv@sudosys.com, macaddress=, clientzone=MeshZone:get_client_interface.sh[local_interface]isisisisis, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36
Thu Mar  4 10:13:03 UTC 2021, username=sysadmin, emailAddress=cuongpv@sudosys.com, macaddress=9c:30:5b:e3:28:5d, clientzone=LocalZone:wlan1, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36
Thu Mar  4 10:13:16 UTC 2021, username=sysadmin, emailAddress=cuongpv@sudosys.com, macaddress=9c:30:5b:e3:28:5d, clientzone=LocalZone:wlan1, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36
Thu Mar  4 10:13:27 UTC 2021, username=sysadmin, emailAddress=cuongpv@sudosys.com, macaddress=9c:30:5b:e3:28:5d, clientzone=LocalZone:wlan1, useragent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/93.0.148 Chrome/87.0.4280.148 Safari/537.36

```

**Ví dụ tính theo lượt click continue:**

```
Wed Mar 10 17:24:34 2021 daemon.info opennds[4935]: Client @ 192.168.1.127 9c:30:5b:e3:28:5d, quotas:
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: Read outgoing traffic for 192.168.1.127: Bytes=1729793
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: 192.168.1.127 - Updated counter.outgoing to 1729793 bytes.  Updated last_updated to 1615397134
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: Read incoming traffic for 192.168.1.127: Bytes=5630151
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: 192.168.1.127 - Updated counter.incoming to 5630151 bytes
Wed Mar 10 17:25:34 2021 daemon.info opennds[4935]: Client @ 192.168.1.127 9c:30:5b:e3:28:5d, quotas:
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: Read outgoing traffic for 192.168.1.127: Bytes=1734448
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: 192.168.1.127 - Updated counter.outgoing to 1734448 bytes.  Updated last_updated to 1615397134
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: Read incoming traffic for 192.168.1.127: Bytes=5631556
Wed Mar 10 17:25:34 2021 daemon.debug opennds[4935]: 192.168.1.127 - Updated counter.incoming to 5631556 bytes
Wed Mar 10 17:26:34 2021 daemon.debug opennds[4935]: Read outgoing traffic for 192.168.1.127: Bytes=1834935
Wed Mar 10 17:26:34 2021 daemon.debug opennds[4935]: 192.168.1.127 - Updated counter.outgoing to 1834935 bytes.  Updated last_updated to 1615397194
Wed Mar 10 17:26:34 2021 daemon.debug opennds[4935]: Read incoming traffic for 192.168.1.127: Bytes=5942562
Wed Mar 10 17:26:34 2021 daemon.debug opennds[4935]: 192.168.1.127 - Updated counter.incoming to 5942562 bytes
Wed Mar 10 17:26:34 2021 daemon.info opennds[4935]: Client @ 192.168.1.127 9c:30:5b:e3:28:5d, quotas:
```


### Xem Thông Tin Thiết Bị

Vì hostname sẽ được thay đỗi, cho nên chúng ta cần xem thông tin Access Point trên file.

> cat /tmp/board.json

> /tmp/sysinfo/board_name

> /tmp/sysinfo/model

## PROVISION SCRIPT

### Setup Command

Lệnh cài đặt phía dưới được áp dụng cho tất cả các Access Point của YunCore, bao gồm `501`, `701`, `702`, v.v...

```
wget --no-check-certificate  https://raw.githubusercontent.com/khoahoc/openwrt/main/ap_provision.sh -O - -q | sh
```

### Github Repository

Link: https://github.com/khoahoc/openwrt

_Script Automation được viết bởi tác giả theo cấu trúc document trên. Nếu Script trên được viết không đúng theo cấu trúc trên thì Script này được xem là lỗi thời_
