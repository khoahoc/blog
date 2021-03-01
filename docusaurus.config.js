module.exports = {
  title: "SudoSys.com",
  tagline:
    "Xây Dựng Hệ Thống 👩‍💻 | Nghiên Cứu Vũ Trụ 🌟 | Tìm Hiểu Con Người🧬.",
  url: "https://sudosys.com",
  baseUrl: "/",
  cname: "sudosys.com",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "khoahoc", // Usually your GitHub org/user name.
  projectName: "khoahoc.github.io", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "SudoSys.com",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Tài Liệu Hướng Dẫn",
          position: "left",
        },
        { to: "blog", label: "Blog Cá Nhân", position: "left" },
        { to: "#", label: "Danh Sách Ủng Hộ", position: "left" },
        { to: "#", label: "Sử Dụng Quỹ", position: "left" },
        {
          href: "https://github.com/khoahoc",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Trang",
          items: [
            {
              label: "Tài Liệu Hướng Dẫn",
              to: "docs/",
            },
            {
              label: "Blog Cá Nhân",
              to: "blog/",
            },
            {
              label: "Ủng Hộ Tôi",
              to: "#",
            },
            {
              label: "Trang Chủ",
              to: "/",
            },
          ],
        },
        {
          title: "Kênh Youtube",
          items: [
            {
              label: "Lắng Động Đêm Về",
              href:
                "https://www.youtube.com/watch?v=PuS1WhH6qyQ&list=PL9of5PiY1lkfIcEnt2RZ4Fiq0K_JLu3k_",
            },
            {
              label: "Nhạc Đại Pháp",
              href:
                "https://www.youtube.com/watch?v=JKBXNUKkSRs&list=PUsSrvUHWzNt7yXWxzOkyjhw",
            },
            {
              label: "Kênh Của Tôi",
              href: "#",
            },
          ],
        },
        {
          title: "Liên Kết",
          items: [
            {
              label: "Pháp Luân Công",
              to: "https://vi.falundafa.org/",
            },
            {
              label: "Minh Huệ Net",
              href: "https://vn.minghui.org/news/",
            },
            {
              label: "Tinh Hoa TV",
              href: "https://tinhhoa.tv/",
            },
            {
              label: "The Epoch Times",
              href: "https://etviet.com/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SudoSys, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/khoahoc/blog/edit/main/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: "https://github.com/khoahoc/blog/edit/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
