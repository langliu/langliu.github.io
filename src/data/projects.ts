export type Project = {
  title: string
  description: string
  techs: string[]
  link: string
  isComingSoon?: boolean
}

const projects: Project[] = [
  {
    title: 'svelte-blog-template',
    description: '基于 SvelteKit 的博客模板，开箱即用的内容结构与基础样式。',
    techs: ['SvelteKit', 'TypeScript'],
    link: 'https://github.com/langliu/svelte-blog-template',
  },
  {
    title: 'svelte-devui',
    description: '面向 Svelte 的组件实践项目，探索可复用 UI 与类型友好 API。',
    techs: ['Svelte', 'TypeScript'],
    link: 'https://github.com/langliu/svelte-devui',
  },
]

export default projects
