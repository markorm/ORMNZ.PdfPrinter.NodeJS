#!/usr/bin/env node

const command = require("commander");
const printer = require("../lib/printer");

try {

    const cli = new command.Command()
        .requiredOption("-c, --content_url <string>", "The url of the page to print", null)
        .requiredOption("-o, --out_dir <string>", "The directory the PDF will be output to")
        .option("-f, --footer <string>", "The html or url of the footer", null)
        .option("-h, --header <string>", "The html or url of the header", null)
        .option("-a, --auth <string>", "The auth object", null)
        .option("-s, --selector <string>", "The css selector that will be awaited before printing commences", null)
        .parse(process.argv)

    const opts = cli.opts();

    printer.printUrl(
        opts.content_url,
        opts.out_dir,
        opts.footer,
        opts.header,
        opts.auth,
        opts.selector)
        .then(() => {
            console.log("PDF print successful");
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });

}
catch (err) {
    throw err;
}