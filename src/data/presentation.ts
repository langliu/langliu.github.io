type Social = {
  label: string
  link: string
}

type Presentation = {
  mail: string
  title: string
  description: string
  socials: Social[]
  profile?: string
}

const presentation: Presentation = {
  mail: 'langliu1216@gmail.com',
  title: '你好，我是刘浪',
  // profile: "/profile.webp",
  description:
    '我是一名来自中国的*前端开发工程师*，专注 *React / TypeScript* 与工程化实践，也在探索 *AI 辅助开发* 与现代 Web 技术。工作之余喜欢钓鱼，偶尔折腾开源项目。',
  socials: [
    {
      label: 'Github',
      link: 'https://github.com/langliu',
    },
    {
      label: 'X',
      link: 'https://twitter.com/langliu1216',
    },
    {
      label: 'JueJin',
      link: 'https://juejin.cn/user/149189311334951',
    },
  ],
}

export default presentation
