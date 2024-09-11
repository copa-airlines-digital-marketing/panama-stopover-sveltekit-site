export async function load({data}) {
  console.log('+layout.ts')
  return {
    siteSettings: data.siteSettings
  }
}