const fs = require("fs");
const puppeteer = require("puppeteer");
const cliProgress = require("cli-progress");

const universitiesArray = [];

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
  },
  cliProgress.Presets.shades_grey
);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.mytcas.com/universities", {
    waitUntil: "networkidle0",
  });

  const universitiesName = await page.evaluate(() =>
    Array.from(document.querySelectorAll("td.name > a")).map((a) => [
      a.href,
      a.innerHTML,
    ])
  );

  amountOfUniversity = universitiesName.length;
  universitiesProgress = multibar.create(amountOfUniversity, 0);
  universitiesProgress.update(0, { filename: "university" });
  facultiesProgress = multibar.create(100, 0);
  facultiesProgress.update(0, { filename: "faculties" });

  for (university of universitiesName) {
    await page.goto(university[0], {
      waitUntil: "networkidle0",
    });

    const faculties = await page.evaluate(() =>
      Array.from(document.querySelectorAll("tr > a")).map((a) => [
        a.href,
        a.innerHTML.match(/(?<=<td>\d+. )(.*?)(?=<\/td>)/)[0],
      ])
    );

    amountOfFaculties = faculties.length;
    facultiesProgress.start(amountOfFaculties, 0);

    const facultiesArray = [];

    for (faculty of faculties) {
      facultiesArray.push(faculty[1]);
      facultiesProgress.increment();
    }

    universitiesArray.push({
      university: university[1],
      faculty: facultiesArray,
    });

    universitiesProgress.increment();
  }

  await browser.close();

  const jsonUniversitiesArray = JSON.stringify(universitiesArray, null, 2);
  fs.writeFile(
    "./university.json",
    jsonUniversitiesArray,
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    }
  );
})();
