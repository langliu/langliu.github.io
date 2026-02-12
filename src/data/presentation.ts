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
    '我是一名来自中国的*前端开发工程师*，拥有超过 *6 年* 的 Web 经验。 我目前正在使用 *ReactJS 和 Typescript*。 工作之余，我会去野外钓鱼并学习 Svelte。',
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
