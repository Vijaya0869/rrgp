export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "src/images": "images",
    "src/favicon.svg": "favicon.svg",
    "src/_headers": "_headers",
    "src/robots.txt": "robots.txt",
  });

  // 1 → "01": section and step numerals.
  eleventyConfig.addFilter("pad", (n) => String(n).padStart(2, "0"));
  // "(614) 000-0000" → "+16140000000" for tel: links.
  eleventyConfig.addFilter("tel", (s) => {
    const d = String(s || "").replace(/\D/g, "");
    return d.length === 10 ? "+1" + d : "+" + d;
  });
  // Projects unticked "Show on site" in the CMS stay out of the page.
  eleventyConfig.addFilter("visible", (items) => (items || []).filter((p) => p && p.show !== false));

  eleventyConfig.addGlobalData("build", () => ({
    year: new Date().getFullYear(),
    version: Date.now().toString(36),
  }));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
  };
}
