const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

/**
 * The supported request auth types. 
 */
const UrlAuthType = {
    Cookie: 0,
    Header: 1
}

/**
 * Print a url to a pdf.
 * @param {string} content_url
 * @param {string} out_dir
 * @param {string} footer
 * @param {string} header
 * @param {string} auth
 * @param {string} selector
 */
async function printUrl(content_url, out_dir, footer = null, header = null, auth = null, selector = null) {

    // Create the page instance.
    const page = await getPage();

    // Set the page authorization.
    if (auth != null) {
        auth = JSON.parse(auth);
        if (auth.type == UrlAuthType.Cookie) {
            page.setCookie(auth);
        } else {
            page.setExtraHTTPHeaders({"Authorization": auth });
        }
    }

    // Go to the page and await the selector if specified.
    await page.goto(content_url);
    if (selector !== null) {
        await page.waitForSelector(selector);
    }

    // Print and return result.
    await print(page, footer, header, out_dir);
}

/**
 * Print html to pdf.
 * @param {string} html
 * @param {string} out_dir
 * @param {string} footer
 * @param {string} header
 */
async function printHtml(html, out_dir, footer = null, header = null) {

    // Create the page and navigate to the data url.
    const page = await getPage();
    await page.goto(`data:text/html,${html}`);

    // Print the PDF.
    await print(page, footer, header, out_dir);
}

/**
 * 
 * @param {puppeteer.Page} page
 * @param {string} footer
 * @param {string} header
 * @param {string} out_dir
 */
async function print(page, footer, header, out_dir) {
    // Prepare the output directory.
    createDir(out_dir);

    // Print to pdf.
    await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
        path: out_dir,
        displayHeaderFooter: true,
        headerTemplate: await getHtml(footer),
        footerTemplate: await getHtml(header)
    });
}

/**
 * Get the page instance.
 * @returns {puppeteer.Page}
 */
async function getPage() {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: true,
        ignoreHTTPSErrors: true
    });
    return await browser.newPage();
}

/**
 * Create the output directory.
 * @param {string} dir
 * @returns {void}
 */
function createDir(dir) {
    const _dir = path.dirname(dir);
    if (!fs.existsSync(_dir)) {
        fs.mkdirSync(_dir, { recursive: true });
    }
}

/**
 * Get html content,
 * @param {string} x The url or html.
 * @returns {string}
 */
async function getHtml(x) {
    if (!x) return "<void/>";
    if (!x.startsWith("http")) return x;
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    var resp = await fetch(x, { agent });
    return await resp.text();
}

// Exported members.
module.exports = {
    printUrl,
    printHtml,
    UrlAuthType
}
