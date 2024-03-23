export type Project = {
  title: string
  techs: string[]
  link: string
  isComingSoon?: boolean
}

const projects: Project[] = [
  {
    title: 'svelte-blog-template',
    techs: ['Svelte (SvelteKit)', 'TypeScript'],
    link: 'https://github.com/langliu/svelte-blog-template',
  },
  {
    title: 'svelte-devui',
    techs: ['SvelteJS', 'TypeScript'],
    link: 'https://github.com/langliu/svelte-devui',
  },
  // {
  //   title: 'Portfolio / Template',
  //   techs: ['Astro'],
  //   link: '/',
  //   isComingSoon: true,
  // },
]

export default projects
