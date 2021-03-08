---
slug: opennds-hoat-dong-nhu-the-nao
title: OpenNDS Hoạt Động Như Thế Nào
author: Hacker 6009
author_title: Blog Admin
author_url:
author_image_url: /img/falundafa_avatar.jpg
tags: [sysadmin]
---

<!--truncate-->

## GIỚI THIỆU

:::note

Nội dung được dịch bởi tác giả tại [trang chủ OpenNDS](https://openwrt.org/docs/guide-user/services/captive-portal/opennds) kèm với kiến thức hạn hẹp của bản thân
:::

OpenNDS được tách ra từ phiên bản 4.5.0 của [Nodogsplash](https://github.com/nodogsplash/nodogsplash) thành hai gói để dễ dàng phát triển Forward Authentication Service (FAS) API.

Mặc dù có API FAS , openNDS vẫn được tối ưu hóa để giảm sử dụng tài nguyên trên bộ định tuyến. Nhìn chung, tối thiểu 16MB Flash và 64MB RAM là đủ cho các chế độ hoạt động cơ bản.

Việc sử dụng API FAS nâng cao có thể thêm các gói bổ sung và một chút tài nguyên liên quan đến Flash và RAM.

Lưu ý : Từ phiên bản openNDS v7.0.0 trở đi, trang templated splash cũ không được dùng nữa và bị vô hiệu hóa, được thay thế bằng html động được tạo bởi login script, với rất ít thay đổi về nhu cầu Flash hoặc RAM.

_openNDS is released under the GNU General Public License._

## CÁCH OPENNDS (NDS) HOẠT ĐỘNG

openNDS là một Captive Portal Engine. Bất kỳ Captive Portal nào, bao gồm cả NDS, đều có hai thành phần chính:

- Một công cụ thực hiện việc capturing
- Một công cụ cung cấp một Portal cho người dùng, khách hàng đăng nhập.

openNDS **PHẢI** chạy trên thiết bị đã được cấu hình IPv4.

Một bộ wireless router thường sẽ chạy OpenWrt hoặc một số bản phân phối Linux khác.

Theo định nghĩa, một bộ router sẽ có hai hoặc nhiều interfaces, ít nhất một interface để kết nối với mạng diện rộng (WAN) hoặc nguồn cấp dữ liệu Internet và ít nhất một interface kết nối với mạng cục bộ (LAN).

Mỗi LAN interface cũng phải hoạt động như Default IP Gateway cho mạng LAN của nó, lý tưởng nhất là với interface cung cấp DHCP cho các thiết bị khách sử dụng.

Nhiều interface LAN có thể được kết hợp thành một bridge interface duy nhất. Ví dụ, mạng ethernet, 2.4Ghz và 5Ghz thường được kết hợp thành một bridge interface duy nhất. Các tên interface logic sẽ được gán như eth0, wlan0, wlan1, v.v. với bridge interface kết hợp được đặt tên là br-lan.

NDS sẽ quản lý một hoặc nhiều interface trong số đó. Điều này thường sẽ là br-lan, bridge cho cả mạng LAN không dây và có dây, nhưng có thể là, ví dụ, wlan0 nếu bạn muốn NDS chỉ hoạt động trên interface không dây.

## TÓM TẮT HOẠT ĐỘNG

Theo mặc định, NDS chặn mọi thứ, trừ những request đến port 80.

Request đến port 80 ban đầu sẽ được generate trên thiết bị của khách, thường được tự động bởi thiết bị của khách được tích hợp sẵn chức năng Captive Portal Detection (CPD) hoặc có thể do người dùng duyệt theo cách thủ công đến trang web http.

Request này tất nhiên sẽ được **định tuyến bởi thiết bị đến Default Gateway** của local network. Default Gateway, như chúng ta đã thấy, sẽ là interface định tuyến mà NDS đang quản lý.

## ĐIỀU CẦN NẮM BẮT (NDS)

Ban đầu, ngay sau khi nhận được request đến port 80 này trên default gateway interface, NDS sẽ "Chụp" nó, ghi lại danh tính thiết bị khách, phân bổ token duy nhất cho thiết bị khách, sau đó chuyển hướng trình duyệt khách đến Portal của NDS.

## Điều Cung Cấp Cổng Thông Tin (FAS hoặc PreAuth)

Trình duyệt máy khách được chuyển hướng đến Portal component. Đây là một web service được định cấu hình để biết cách giao tiếp với core engine của NDS.

Trang này thường được gọi là Splash Page.

NDS có máy chủ web riêng được tích hợp sẵn và máy chủ này có thể được sử dụng để cung cấp các trang “Splash” của Portal tới trình duyệt máy khách hoặc có thể sử dụng một máy chủ web riêng biệt.

openNDS đi kèm với hai tùy chọn Splash Page tiêu chuẩn được cài đặt sẵn.

Option một là cung cấp một trang nhấp chuột để tiếp tục và Một option nữa là trang kia cung cấp biểu mẫu, yêu cầu khách hàng nhập Tên và địa chỉ Email.

Cả hai đều có thể được tùy chỉnh hoặc một Cổng thông tin chuyên biệt hoàn chỉnh có thể được viết bởi trình cài đặt (Xem FAS, PreAuth).

FAS, hoặc Forward Authentication Service có thể sử dụng máy chủ web được nhúng trong NDS, một máy chủ web riêng biệt được cài đặt trên router NDS, một máy chủ web nằm trên local network hoặc một máy chủ web được host trên Internet.

Khách dùng thiết bị sẽ luôn phải hoàn thành một số hành động trên trang splash.

Khi người dùng thiết bị đã hoàn thành thành công các hành động trên trang splash, trang đó sau đó sẽ trực tiếp redirect trở lại NDS.

Để bảo mật, NDS chờ đợi nhận được cùng một token hợp lệ được phân phát khi khách hàng đưa request đến port 80. Nếu token nhận được là hợp lệ, NDS sau đó sẽ “xác thực” thiết bị khách, cho phép truy cập Internet.

Các tiện ích mở rộng xử lý xác thực có thể được thêm vào NDS (Xem BinAuth). Khi NDS đã nhận được token hợp lệ, nó sẽ gọi một tập lệnh BinAuth.

Nếu tập lệnh BinAuth trả về đúng (tức là mã trả về 0), thì NDS sẽ “xác thực” thiết bị khách, cho phép truy cập Internet.

Khi FAS được sử dụng, các chế độ bảo mật được cung cấp (cấp độ 1, 2 và 3), trong đó token máy khách và các biến bắt buộc khác được ẩn an toàn khỏi Máy khách, đảm bảo không thể bỏ qua xác minh.

:::note

FAS và Binauth có thể được bật cùng nhau. Điều này có thể mang lại tính linh hoạt cao, với FAS cung cấp xác minh từ xa và Binauth cung cấp xử lý xác thực bài đăng cục bộ được liên kết chặt chẽ với NDS.

:::

## Captive Portal Detection (CPD)

Tất cả các thiết bị di động hiện đại, hầu hết các hệ điều hành máy tính để bàn và hầu hết các trình duyệt hiện nay đều có quy trình CPD tự động đưa ra các rquest đến port 80 khi kết nối với mạng. NDS phát hiện điều này và cung cấp một trang web "splash" đặc biệt tới thiết bị khách đang kết nối.

Yêu cầu html cổng 80 được thực hiện bởi CPD khách hàng có thể là một trong nhiều URL cụ thể của nhà cung cấp.

Ví dụ: các URL CPD điển hình được sử dụng là:

- http://captive.apple.com/hotspot-detect.html
- http://connectivitycheck.gstatic.com/generate_204
- http://connectivitycheck.platform.hicloud.com/generate_204
- http://www.samsung.com/
- http://detectportal.firefox.com/success.txt
- Thêm nữa

Điều quan trọng cần nhớ là CPD được thiết kế chủ yếu cho các thiết bị di động để tự động phát hiện sự hiện diện của portal và kích hoạt trang đăng nhập, mà không cần phải sử dụng đến bảo mật SSL / TLS. Bằng cách yêu cầu cổng chuyển hướng cổng 443 chẳng hạn.

Hầu như tất cả các triển khai CPD hiện tại đều hoạt động rất tốt nhưng một số lại cần điều chỉnh thích hợp với từng loại ứng dụng khác nhau.

Phần lớn các thiết bị gắn với Captive Portal điển hình là thiết bị di động. CPD hoạt động tốt cho trang đăng nhập ban đầu.

Nhưng đối với một khách sử dụng wifi ở một số nơi. Ví dụ như quán cà phê, quán bar, câu lạc bộ, khách sạn, v.v., thiết bị kết nối, truy cập Internet được một lúc thì người dùng đưa thiết bị ra khỏi phạm vi phủ sóng.

Khi ra ngoài phạm vi phủ sóng, một thiết bị di động thông thường bắt đầu thăm dò định kỳ wifi SSID mà nó biết để cố gắng lấy lại kết nối, tùy thuộc vào thời gian chờ để bảo toàn tuổi thọ pin.

Hầu hết các Captive Portal đều có giới hạn thời gian cho một session (bao gồm NDS).

Nếu một thiết bị đã đăng nhập trước đó quay trở lại trong phạm vi phủ sóng của portal, thì SSID đã sử dụng trước đó sẽ được nhận dạng và CPD được kích hoạt và kiểm tra kết nối Internet theo cách bình thường. Trong giới hạn thời gian session của portal, kết nối Internet sẽ được thiết lập, nếu phiên đã hết hạn, trang splash sẽ được hiển thị lại.

Việc triển khai CPD trên thiết bị di động ban đầu được sử dụng để thăm dò, phát hiện URL theo khoảng thời gian đều đặn, thường là khoảng 30 đến 300 giây. Điều này sẽ kích hoạt trang Portal Splash khá nhanh nếu thiết bị vẫn ở trong phạm vi và đã đạt đến giới hạn session.

Tuy nhiên, rất nhanh chóng nhận ra rằng việc này làm thiết bị được bật liên tục có ảnh hưởng rất tiêu cực đến tuổi thọ pin, vì vậy việc kiểm tra session hết hạn này được tăng lên một khoảng thời gian rất dài hoặc bị loại bỏ tất cả cùng nhau (tùy thuộc vào nhà cung cấp) để bảo toàn sạc pin. Khi hầu hết các thiết bị di động đến và đi vào vùng phủ sóng, đây không phải là một vấn đề.

Một vấn đề phổ biến được nêu ra là:

> Thiết bị của tôi hiển thị trang splash khi chúng kết nối lần đầu, nhưng khi hết hạn ủy quyền, chúng chỉ nhận thông báo không có kết nối internet. Tôi phải làm cho họ "quên" mạng WiFi này đi để xem lại trang splash. Đây có phải là cách nó được cho là hoạt động?

Cách giải quyết như được mô tả trong vấn đề, hoặc thậm chí chỉ cần ngắt kết nối hoặc tắt và bật lại WiFi theo cách thủ công thì cũng giống như việc bạn "đi ra ngoài phạm vi", khởi tạo kích hoạt CPD ngay lập tức. Một hoặc bất kỳ sự kết hợp nào của các cách giải quyết này sẽ hoạt động, một lần nữa tùy thuộc vào việc triển khai CPD của nhà cung cấp cụ thể.

Ngược lại, hầu hết các hệ điều hành máy tính xách tay / máy tính để bàn và các phiên bản trình duyệt cho những hệ điều hành này vẫn triển khai tính năng thăm dò CPD trong khi trực tuyến vì việc cân nhắc về pin không quá quan trọng.

Ví dụ: máy tính để bàn Gnome có trình duyệt CPD tích hợp riêng với khoảng thời gian mặc định là 300 giây. Firefox cũng mặc định là 300 giây. Windows 10 cũng tương tự.

Đây là cách nó được cho là hoạt động, nhưng có liên quan đến một số thỏa hiệp.

Giải pháp tốt nhất là đặt thời gian chờ của phiên thành một giá trị lớn hơn khoảng thời gian dự kiến ​​mà thiết bị khách có thể có mặt. Kinh nghiệm cho thấy giới hạn 24 giờ áp dụng cho hầu hết các trường hợp, ví dụ như quán bar, câu lạc bộ, quán cà phê, nhà nghỉ, v.v. Nếu ví dụ, một khách sạn có khách thường xuyên lưu trú trong một vài ngày, thì hãy tăng thời gian chờ của phiên làm việc theo yêu cầu.

Nhân viên tại địa điểm có thể đưa thiết bị của họ vào Danh sách tin cậy nếu thích hợp, nhưng theo kinh nghiệm cho thấy, tốt hơn là không nên làm điều này vì họ sẽ sớm biết được những việc cần làm và có thể giúp những khách gặp sự cố. (Bất cứ điều gì làm giảm cuộc gọi hỗ trợ là tốt!)

## Phát hiện vùng mạng (Máy khách được kết nối ở đâu?)

Các thiết bị khách có thể được kết nối với một trong số các SSID WiFi cục bộ, được kết nối trực tiếp hoặc gián tiếp bằng ethernet hoặc kết nối qua mạng lưới không dây. Mỗi loại kết nối có sẵn được coi là một Vùng mạng.

NDS phát hiện vùng mà mỗi máy khách được kết nối. Thông tin này có thể được sử dụng để tùy chỉnh động đăng nhập cho từng khu vực.

Ví dụ: một cửa hàng cà phê có thể có hai SSID được định cấu hình:

- Nhân viên (SSID bảo mật tức là với mã truy cập)
- Khách hàng (mở SSID bằng biểu mẫu đăng nhập)

Trong ví dụ này, SSID “Nhân viên” được định cấu hình trên giao diện wlan0 và được coi là Vùng “Riêng tư”.

Tuy nhiên, SSID “Khách hàng” được cấu hình trên giao diện ảo wlan0-1 và được coi là Vùng “Công cộng”.

NDS phát hiện khu vực nào đang được khách hàng sử dụng và trang đăng nhập có liên quan có thể được cung cấp.

## Lọc gói tin

openNDS xem xét bốn loại gói đi vào bộ định tuyến qua giao diện được quản lý. Mỗi gói là một trong những loại sau:

1. **Blocked** , nếu MAC bị chặn và địa chỉ MAC nguồn của packet phù hợp với địa chỉ được liệt kê trong BlockedMACList; hoặc nếu MAC được cho phép và địa chỉ MAC nguồn của gói không khớp với địa chỉ được liệt kê trong AllowedMACList hoặc TrustedMACList. Các gói tin này bị loại bỏ.
2. **Trusted** , nếu địa chỉ MAC nguồn của packet phù hợp với địa chỉ được liệt kê trong TrustedMACList. Theo mặc định, các gói này được chấp nhận và chuyển đến tất cả các địa chỉ và cổng đích. Nếu muốn, hành vi này có thể được tùy chỉnh bởi FirewallRuleSet người dùng đáng tin cậy và FirewallRuleSet danh sách người dùng đến bộ định tuyến đáng tin cậy trong tệp cấu hình opennds.conf hoặc bằng chỉ thị người dùng tin cậy EmptyRuleSetPolicy EmptyRuleSetPolicy-user-to-router.

3. **Authenticated** , nếu địa chỉ nguồn IP và MAC của packet đã trải qua quá trình xác thực openNDS và chưa hết hạn. Các gói này được chấp nhận và định tuyến đến một tập hợp địa chỉ và cổng giới hạn (xem FirewallRuleSet người dùng được xác thực và FirewallRuleSet người dùng đến bộ định tuyến trong tệp cấu hình opennds.conf).

4. **Preauthenticated** . Bất kỳ packet nào khác. Các packets này được chấp nhận và định tuyến đến một nhóm địa chỉ và cổng giới hạn (xem FirewallRuleSet preauthenticated-users và FirewallRuleSet user-to-router trong tệp cấu hình opennds.conf). Bất kỳ packet nào khác đều bị loại bỏ, ngoại trừ một packet cho cổng đích 80 tại bất kỳ địa chỉ nào được chuyển hướng đến cổng 2050 trên bộ định tuyến, nơi máy chủ web dựa trên libhttpd của openNDS đang lắng nghe. Điều này bắt đầu quá trình 'xác thực'. Máy chủ sẽ phục vụ một trang splash quay trở lại địa chỉ IP nguồn của packet. Người dùng nhấp vào liên kết thích hợp trên trang splash sẽ hoàn tất quá trình, khiến các packet trong tương lai từ địa chỉ IP / MAC này được đánh dấu là Đã xác thực cho đến khi đạt đến thời gian chờ không hoạt động hoặc bắt buộc và các gói của nó trở lại được Xác thực trước.

openNDS thực hiện các hành động này bằng cách chèn các quy tắc trong chuỗi PREROUTING iptables mangle của bộ định tuyến để đánh dấu các packet và bằng cách chèn các quy tắc trong nat PREROUTING, lọc INPUT và lọc chuỗi FORWARD khớp trên các dấu đó.

Bởi vì nó chèn các quy tắc của nó vào đầu các chuỗi hiện có, openNDS sẽ không nhạy cảm với hầu hết các cấu hình tường lửa hiện có điển hình.

# Data Volume và Rate Quotas

openNDS (NDS) đã tích hợp sẵn hỗ trợ `Data Volume` và `Data Rate` quota.

Data volume and data rate quotas can be set globally in the config file.

Các giá trị chung có thể được ghi đè trên từng máy khách theo yêu cầu.

# Điều hướng Traffic

openNDS (NDS) hỗ trợ Traffic Shaping (Giới hạn Băng thông) bằng cách sử dụng SQM - Smart Management (sqm-scripts) package, có sẵn cho OpenWrt và Linux chung.
