# Copa Airlines Panama Stopover  
Repo for the site [panama-stopover.com](https://panama-stopover.com)

## Technologies
- [Sveltekit](https://svelte.dev/docs/kit/introduction) with static site generation as the framework that builds the site.
- [Directus SDK](https://docs.directus.io/reference/query.html) to integrate the CMS data.
- [TailwindCSS](https://v3.tailwindcss.com/docs/installation) as the main styling framework.
- [CMDS Tailwind Presets](https://github.com/copa-airlines-digital-marketing/tailwind-presets) as the implementation of Copa Airlines theme setup for TailwindCSS.
- [BitsUI](https://www.bits-ui.com/docs/introduction) as the basic unstiled components library.
- [Tailwind Merge](https://www.npmjs.com/package/tailwind-merge) to prevent conflicting classes on tags.
- [Tailwind Variants](https://www.tailwind-variants.org/) to programaticaly set the styles of the components variants.
- [Zod](https://zod.dev/) for forms and API response validation.
- [RamdaJS](https://ramdajs.com/docs/) for funcional code.

## Project Source Context
- Lib: Where all of the code resides
  - components: Contains all the components that renders the site.
    - directus: Contains all the components that translates directus schema.
    - site: Contains site specific components not related to Copa Airlirnes.
    - testing: Contains testing specific components not to be used on production.
    - ui: Contains basic UI components.
  - cookies: Contains some constants to help with cookies
  - data: Contains the helper methods to query the page data from directus.
  - directus: Contains the helper methods to query each type of schema used on the site.
  - i18n: Contains all the helper methods to identify and store the preferred user language.
  - redis: Contains all the helper methods to use redis
- Routes: consists of one single page that allows unknown path structure to exists, to generate the site as a static site, it downloads all the possible routes from the CMS and builds all the pages bassed on them.
  - API: used for API's requiered for other services

## Developing

### Prerequirements

1. [Git](https://git-scm.com/downloads) on console
2. [Node](https://nodejs.org/en/blog/release/v22.13.1) version 22.13.1
3. [PNPM](https://pnpm.io/installation) version 10.10.0

### Start developing

1. Clone the repository with:

```bash
git clone --recursive https://github.com/copa-airlines-digital-marketing/panama-stopover-sveltekit-site.git
```

2. Download submodules (all submodules repo are public) code with:

```bash
git submodule update --init --recursive
```

3. Install dependencies

```bash
pnpm i
```

4. start a development server:

```bash
pnpm dev
```

## Building

As of version 2.10.1 the app compiles as static HTML.

Environment variables are required to run the application

To create a production version of the app:

```bash

npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
