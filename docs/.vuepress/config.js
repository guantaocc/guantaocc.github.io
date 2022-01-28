module.exports = {
  base: "/",
  head: [
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  markdown: {
    lineNumbers: true,
    // markdown-it-anchor 的选项
    lineNumbers: true,
    anchor: { permalink: false },
    // markdown-it-toc 的选项
    toc: { includeLevel: [1, 2] },
    // extendMarkdown: md => {
    //   // 使用更多的 markdown-it 插件!
    //   md.use(require('markdown-it-xxx'))
    // }
  },
  theme: "reco",
  plugins: {
    // 自动生成侧边栏
    "vuepress-plugin-auto-sidebar": {
      titleMap: {},
    },
    // 修复中文命名
    "permalink-pinyin": {
      lowercase: true, // Converted into lowercase, default: true
      separator: "-", // Separator of the slug, default: '-'
    },
  },
  themeConfig: {
    type: "blog",
    authorAvatar: "/avatar.png",
    codeTheme: "tomorrow",
    subSidebar: "auto",
    nav: [
      { text: "首页", link: "/", icon: "reco-home" },
      {
        text: "前端笔记",
        link: "/前端笔记/01-HTML-超文本标记语言",
      },
      {
        text: "前端工程化",
        link: "/前端工程化/配置eslint+prettier格式化代码",
        icon: "reco-home",
      },
      {
        text: "数据可视化",
        link: "/数据可视化/01-canvas的使用和相关库",
        icon: "reco-home",
      },
      {
        text: "技术博客",
        link: "/技术博客/",
        icon: "reco-home",
      },
      {
        text: "算法",
        icon: "reco-document",
        items: [
          { text: "经典排序算法", link: "/算法/经典排序算法/" },
          { text: "栈和队列", link: "/算法/栈和队列/" },
          { text: "递归", link: "/算法/递归/" },
          { text: "深度优先dfs", link: "/算法/深度优先dfs/" },
          { text: "广度优先bfs", link: "/算法/广度优先bfs/" }
        ],
      },
      { text: "TimeLine", link: "/timeline/", icon: "reco-date" },
    ],
    // 博客配置
    blogConfig: {
      category: {
        location: 2, // 在导航栏菜单中所占的位置，默认2
        text: "Category", // 默认文案 “分类”
      },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: "Tag", // 默认文案 “标签”
      },
      socialLinks: [
        // 信息栏展示社交信息
        { icon: "reco-github", link: "https://github.com/recoluan" },
        { icon: "reco-npm", link: "https://www.npmjs.com/~reco_luan" },
      ],
      friendLink: [
        {
          title: "vuepress-theme-reco",
          desc: "A simple and beautiful vuepress Blog & Doc theme.",
          logo: "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
          link: "https://vuepress-theme-reco.recoluan.com",
        },
        {
          title: "午后南杂",
          desc: "Enjoy when you can, and endure when you must.",
          email: "recoluan@qq.com",
          link: "https://www.recoluan.com",
        },
        // ...
      ],
    },
  },
};
