# R&R Grandeur Properties — website

The v5 design, built as a static site with an editor (CMS). There is no server:

- **GitHub** stores the site and its content (free).
- **Cloudflare Pages** builds and hosts it on your domain (free).
- **Pages CMS** is the editor at <https://app.pagescms.org> (free). Saving an edit commits to GitHub, and Cloudflare republishes the site about a minute later.
- **Formspree** delivers form submissions to your inbox (free plan: 50 submissions a month).

```
src/_data/home.json      All home-page text, in section order
src/_data/projects.json  Portfolio project cards
src/_data/settings.json  Contact details, form endpoints, SEO, look and feel
src/images/              Photos (CMS uploads land here)
src/index.njk            Page template, the v5 markup
src/assets/site.css      Styles
src/assets/site.js       Animations and form handling
.pages.yml               Defines the CMS screens and fields
```

## Run it locally

```
npm install
npm start          # http://localhost:8080, reloads on save
```

## One-time setup

### 1. Put the site on GitHub
1. Create a free account at <https://github.com> if you don't have one.
2. Create a **private** repository, for example `rrgp-site`.
3. Upload the contents of this folder (everything except `node_modules` and `_site`). From a terminal:
   ```
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<you>/rrgp-site.git
   git push -u origin main
   ```

### 2. Host it on Cloudflare Pages
1. Sign up at <https://dash.cloudflare.com>, then go to **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `rrgp-site` repository and use these settings:
   - Framework preset: **Eleventy**, or None
   - Build command: `npm run build`
   - Build output directory: `_site`
3. Click **Save and Deploy**. The site goes live at `rrgp-site.pages.dev`.
4. To use your domain, open **Custom domains → Set up a custom domain** and enter `rrgp.io`, then add `www.rrgp.io` too.
   - If the domain's DNS is already on Cloudflare, this is automatic.
   - If it isn't, either move the domain's nameservers to Cloudflare (recommended; Cloudflare shows you the two nameservers to set at your registrar), or add the CNAME record Cloudflare shows you at your current registrar.
   - HTTPS is set up automatically.

### 3. Turn on the editor (Pages CMS)
1. Go to <https://app.pagescms.org> and **Sign in with GitHub**.
2. Install the Pages CMS GitHub app when prompted, and give it access to the `rrgp-site` repository.
3. Open the repository. You will see **Home page**, **Projects** and **Site settings** in the sidebar.

### 4. Add other editors
Editors do **not** need a GitHub account.

1. In Pages CMS, open the repository, then **Collaborators** in the sidebar.
2. Enter each person's email and send the invite. They sign in at app.pagescms.org with a one-time code emailed to them.
3. Every save is recorded in GitHub with the editor's name, so you can see who changed what and roll any change back.

To give someone full technical access, add them as a collaborator on the GitHub repository instead.

### 5. Connect the forms
1. Create a free account at <https://formspree.io> and click **New form**. Use the inbox that should receive deals, such as `deals@rrgp.io`.
2. Copy the form's endpoint, which looks like `https://formspree.io/f/abcd1234`.
3. In Pages CMS, paste it into **Site settings → Opportunity form endpoint** and save.
4. Optional: create a second Formspree form for marketplace sign-ups and paste its endpoint into **Marketplace sign-up endpoint**. If you leave that field empty, sign-ups go to the same inbox as deals.

Until an endpoint is set, both forms say "not connected yet" and point visitors to the direct email address. They never silently drop a submission. Submissions are also listed in the Formspree dashboard.

## Everyday editing
- **Text:** Home page → open a section → edit → **Save**.
- **Photos:** click an image field and upload. Landscape photos about 2000px wide work best for the hero; square photos about 1000px for the platform tiles.
- **Projects:** Projects → **Add an entry**, drag to reorder, untick *Show on site* to hide one without deleting it.
- **Hide a section:** Marketplace and Capital partners each have a *Show this section* switch.
- **Look and feel:** Site settings → Look and feel uses the same Feel options as the design file (page tone, hero size, accent use, section style).

The site updates about 1 minute after you save. Watch progress in Cloudflare under **Deployments**.

## Before launch
Search the content for `[` to find the placeholders still in square brackets: project names and cities, the operations team, founder background lines, phone number, and the JR Capital link. Also:

- The hero photo is a 547px image taken from the design file. Upload a high-resolution photo in **Home page → Hero → Background photo** before launch.
- Have securities counsel review the footer disclaimer and the Capital partners section.
