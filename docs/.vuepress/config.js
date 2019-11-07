module.exports = {
  title: "研之有物",
  description: "研之有物",
  base: "/",
  theme: "reco",
  themeConfig: {
    type: "blog",
    sidebar: "auto",
    // 博客配置
    blogConfig: {
      category: {
        location: 2 // 在导航栏菜单中所占的位置，默认2
        // text: "Category" // 默认文案 “分类”
      },
      tag: {
        location: 3 // 在导航栏菜单中所占的位置，默认3
        // text: "Tag" // 默认文案 “标签”
      }
    },
    nav: [
      {
        text: "时间线",
        link: "/timeLine/",
        icon: "reco-date"
      }
    ],
    author: "刘浪",
    // huawei: true,
    logo: "/favicon.png"
  },
  head: [
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no"
      }
    ],
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.png"
      }
    ]
  ],
  locales: {
    // 键名是该语言所属的子路径
    // 作为特例，默认语言可以使用 '/' 作为其路径。
    "/": {
      lang: "zh-cmn-Hans"
    }
  },
  evergreen: true,
  plugins: ["@vuepress/back-to-top"]
};
