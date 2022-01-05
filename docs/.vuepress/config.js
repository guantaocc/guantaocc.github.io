module.exports = {
  base: '/',
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  markdown: {
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
  theme: 'reco',
  plugins: {
    // 自动生成侧边栏
    "vuepress-plugin-auto-sidebar": {
      titleMap: {

      },
    },
    // 修复中文命名
    'permalink-pinyin': {
      lowercase: true, // Converted into lowercase, default: true
      separator: '-' // Separator of the slug, default: '-'
    },
  },
  themeConfig: {
    type: 'blog',
    authorAvatar: '/avatar.png',
    codeTheme: 'tomorrow',
    subSidebar: 'auto',
    nav: [
      { text: '首页', link: '/', icon: 'reco-home' },

      { text: 'TimeLine', link: '/timeline/', icon: 'reco-date' },
      {
        text: '软件开发', icon: 'reco-document', items: [
          { text: '前端开发', link: '/软件开发/前端笔记/01-HTML-超文本标记语言' },
        ]
      },
      {
        text: '算法', icon: 'reco-document', items: [
          { text: '经典排序算法', link: '/算法/经典排序算法/01-冒泡排序' },
        ]
      },
    ],
    // 博客配置
    blogConfig: {
      category: {
        location: 2,     // 在导航栏菜单中所占的位置，默认2
        text: 'Category' // 默认文案 “分类”
      },
      tag: {
        location: 3,     // 在导航栏菜单中所占的位置，默认3
        text: 'Tag'      // 默认文案 “标签”
      },
      socialLinks: [     // 信息栏展示社交信息
        { icon: 'reco-github', link: 'https://github.com/recoluan' },
        { icon: 'reco-npm', link: 'https://www.npmjs.com/~reco_luan' }
      ],
      friendLink: [
        {
          title: 'vuepress-theme-reco',
          desc: 'A simple and beautiful vuepress Blog & Doc theme.',
          logo: "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
          link: 'https://vuepress-theme-reco.recoluan.com'
        },
        {
          title: '午后南杂',
          desc: 'Enjoy when you can, and endure when you must.',
          email: 'recoluan@qq.com',
          link: 'https://www.recoluan.com'
        },
        // ...
      ]
    }
  }
}