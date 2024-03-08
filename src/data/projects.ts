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
    title: 'Portfolio / Lina BLIDI',
    techs: ['ReactJS (NextJS)', 'TypeScript'],
    link: 'https://www.linablidi.fr/',
  },
  {
    title: 'Portfolio / Template',
    techs: ['Astro'],
    link: '/',
    isComingSoon: true,
  },
]

export default projects
