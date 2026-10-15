// Legal pages: shared layout, served at /privacy/ and /terms/.
export default {
  layout: "legal.njk",
  eleventyComputed: {
    permalink: (data) => `/${data.page.fileSlug}/`,
  },
};
