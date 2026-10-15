import Image from "@11ty/eleventy-img";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Any CMS image → AVIF/WebP/JPEG at the widths given, so each screen downloads
// only what it shows. Widths above the original are skipped automatically.
// An empty or missing image becomes a quiet placeholder instead of a broken build.
async function picture(src, alt, { widths = [480, 800, 1280], sizes = "100vw", cls = "fill", eager = false } = {}) {
  if (!src) return `<div class="ph" role="img" aria-label="${esc(alt)}"></div>`;
  try {
    const meta = await Image("src" + src, {
      widths,
      formats: ["avif", "webp", "jpeg"],
      outputDir: "_site/images/r/",
      urlPath: "/images/r/",
      sharpAvifOptions: { quality: 55 },
      sharpWebpOptions: { quality: 72 },
      sharpJpegOptions: { quality: 78, mozjpeg: true },
    });
    return Image.generateHTML(meta, {
      alt,
      class: cls,
      sizes,
      loading: eager ? "eager" : "lazy",
      decoding: "async",
      ...(eager ? { fetchpriority: "high" } : {}),
    });
  } catch (err) {
    console.warn(`[images] ${src}: ${err.message}`);
    return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "src/images": "images",
    "src/favicon.svg": "favicon.svg",
    "src/_headers": "_headers",
    "src/robots.txt": "robots.txt",
  });

  eleventyConfig.addAsyncShortcode("heroImage", (src, alt) =>
    picture(src, alt, { widths: [800, 1280, 1920, 2560, 3344], cls: "fill hero-img", eager: true }));
  eleventyConfig.addAsyncShortcode("picture", (src, alt, sizes) =>
    picture(src, alt, { sizes: sizes || "(max-width: 720px) 50vw, 25vw" }));

  // 1 → "01": section and step numerals.
  eleventyConfig.addFilter("pad", (n) => String(n).padStart(2, "0"));
  // "(614) 555-0100" → "+16145550100" for tel: links.
  eleventyConfig.addFilter("tel", (s) => {
    const d = String(s || "").replace(/\D/g, "");
    return d.length === 10 ? "+1" + d : "+" + d;
  });
  // Items unticked "Show on site" in the CMS stay out of the page.
  eleventyConfig.addFilter("visible", (items) => (items || []).filter((p) => p && p.show !== false));

  // Organisation details for search engines; empty fields are left out.
  eleventyConfig.addFilter("jsonld", (s) => {
    const ld = { "@context": "https://schema.org", "@type": "RealEstateAgent", name: s.company, url: s.site_url, email: s.email, address: s.address };
    if (s.phone) ld.telephone = s.phone;
    if (s.linkedin_url) ld.sameAs = [s.linkedin_url];
    return JSON.stringify(ld).replace(/</g, "\\u003c");
  });

  eleventyConfig.addGlobalData("build", () => ({
    year: new Date().getFullYear(),
    version: Date.now().toString(36),
  }));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    // Legal pages are plain prose from the CMS; never run them as templates.
    markdownTemplateEngine: false,
  };
}
