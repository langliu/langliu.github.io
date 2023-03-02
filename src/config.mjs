import defaultImage from './assets/images/default.png'

const CONFIG = {
  name: '研之有物',

  origin: 'https://langliu.github.io',
  basePathname: '/',
  trailingSlash: false,

  title: '研之有物',
  description:
    '🚀 Suitable for Startups, Small Business, Sass Websites, Professional Portfolios, Marketing Websites, Landing Pages & Blogs.',
  defaultImage: defaultImage,

  defaultTheme: 'system', // Values: "system" | "light" | "dark" | "light:only" | "dark:only"

  language: 'zh-CN',
  textDirection: 'ltr',

  dateFormatter: new Intl.DateTimeFormat('zh-Hans-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }),

  googleAnalyticsId: false, // or "G-XXXXXXXXXX",
  googleSiteVerificationId: 'orcPxI47GSa-cRvY11tUe6iGg2IO_RPvnA1q95iEM3M',

  blog: {
    disabled: false,
    postsPerPage: 5,

    post: {
      permalink: '/%slug%', // Variables: %slug%, %year%, %month%, %day%, %hour%, %minute%, %second%, %category%
      noindex: false,
      disabled: false,
    },

    list: {
      pathname: 'blog', // Blog main path, you can change this to "articles" (/articles)
      noindex: false,
      disabled: false,
    },

    category: {
      pathname: 'category', // Category main path /category/some-category
      noindex: true,
      disabled: false,
    },

    tag: {
      pathname: 'tag', // Tag main path /tag/some-tag
      noindex: true,
      disabled: false,
    },
  },
}

export const SITE = { ...CONFIG, blog: undefined }
export const BLOG = CONFIG.blog
export const DATE_FORMATTER = CONFIG.dateFormatter
