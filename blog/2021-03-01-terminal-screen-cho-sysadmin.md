---
slug: terminal-screen-cho-sysadmin
title: Terminal Screen Cho Sysadmin
author: Sudoer
author_title: Blog Admin
author_url:
author_image_url: /img/su_badge2.png
tags: [books]
---

## GIỚI THIỆU

Để tránh việc gián đoạn trong quá trình copy dữ liệu lớn như cúp điện, mất mạng v.v... Ảnh hưởng đến quá trình copy hoặc download v.v... Ta có giải phái phía dưới như sau:

Giải pháp là sử dụng Screen, một ứng dụng trên CentOS và Ubuntu đều có. Cho phép bạn chạy ứng dụng ngầm phía bên trong chương trình Screen mà không cần thông qua máy bạn khi bạn thoát khỏi screen. Tất nhiên bạn có thể truy cập lại screen bất cứ lúc nào, ở đâu và trên máy tính nào một cách dễ dàng lại rồi.

Để biết thêm thông tin chi tiết, vui lòng gõ dòng lệnh phía dưới sau khi đã cài đặt screen :

> man screen

## CÀI ĐẶT

### Trên CentOS

> yum update

> update install screen

### Trên Ubuntu

> apt update

> apt install screen

## SỬ DỤNG

### CHẠY NGẦM VỚI SCREEN

Trên màn hình terminal, gõ:

> screen

Bạn sẽ được đưa vào terminal mới. Lúc này, bạn có thể copy dữ liệu, move hoặc làm bất cứ thao tác gì như terminal thông thường. Sau khi bạn đã làm xong các thao tác, đến bước cuối cùng là chờ đợi thì bạn có thể nhấn phím lần lượt là:

> Giữ Ctrl, bấm A rồi bấm D

Có nghĩa là chúng ta chỉ giữ nút Ctrl, không giữ nút "A" và cũng không giữ nút "D", chỉ nhấn vào thôi.

Vậy là cửa sổ lệnh của ban đã bị ẩn đi, và bạn sẽ được đưa về terminal ban đầu của mình.

### BẬT LẠI SCREEN ĐANG CHẠY NGẦM

#### Đối với chỉ có 1 screen

Đối với có một screen, bạn chỉ cần gõ:

> screen -r

Nó sẽ tự động bật lại ngay luôn.

#### Đối với 2 hoặc nhiều hơn 2 screen

Đối với trường hợp này, khi bạn gõ

> screen -r

Bạn sẽ được gợi ý lại các screen mà bạn đã ẩn đi. Bạn cần phải gõ <code>screen -r (mã của screen) </code>lúc bạn ẩn đi. Ví dụ:

> screen -r screen-abc-2021-03-01

Thì bạn sẽ được đưa về screen đó. Tuy nhiên nếu không đúng screen bạn mong muốn thì đừng lo lắng, vì chỉ cần thực hiện giấu đi lại như hướng dẫn trên rồi gõ lại lệnh screen với mã khác thôi.
