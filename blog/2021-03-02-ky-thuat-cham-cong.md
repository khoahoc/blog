---
slug: ky-thuat-cham-cong
title: Kỹ Thuật Chấm Công
author: Hacker 6009
author_title: Blog Admin
author_url:
author_image_url: /img/falundafa_avatar.jpg
tags: [project]
---

:::note

Nội dung được dịch bởi tác giả tại [trang chủ OpenNDS](https://openwrt.org/docs/guide-user/services/captive-portal/opennds) kèm với kiến thức hạn hẹp của bản thân
:::

## GIỚI THIỆU

![img](../static/img/finger-print-technical.jpg)

Máy chấm công là một thiết bị dùng để ghi nhận thời gian ra vào của các nhân viên trong một công ty.

## Kỹ Thuật

Kỹ thuật chấm công tự động không cần dùng máy chấm công truyền thống.

Gồm các bước như sau:

### Khởi tạo thông tin người dùng

### Ghi nhận thời gian ra vào

#### Ghi nhận bằng log DHCP Release

_Still not public the method_

_Kỹ thuật chưa được công khai_

#### Ghi nhận bằng cách check mỗi 20 giây

_Still not public the method_

_Kỹ thuật chưa được công khai_

### Ưu Điểm & Nhược Điểm So Với Máy Truyền Thống

#### Ưu Điểm

- Thiết kiệm chi phí hơn do không cần phải mua máy chấm công
- Tự động báo qua các kênh như Slack, Email, Telegram, SMS v.v... Nếu có người đi trễ vừa vào hoặc rời khỏi chỗ làm việc quá lâu.
- Bộ nhớ dung lượng cao có khả năng lưu lại lịch sử chấm công, thời gian ra vào nơi làm việc dài lâu theo năm tháng.

#### Nhược Điểm

- Có thể có những chính sách đi kèm

### Giao Diện

#### Màn Hình Đăng Nhập Quản Lý

#### Bảng chấm công tổng quát

#### Bảng chấm công chi tiết của một cá nhân kèm ghi chú

#### Bảng chấm công chi tiết của một nhóm

#### Bảng lưu tất cả các ghi chú

#### Bảng lương

#### Bảng quản lý nhân sự

_Đang cập nhật_
