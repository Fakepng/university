const fs = require("fs");
const puppeteer = require("puppeteer");
const cliProgress = require("cli-progress");

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
  },
  cliProgress.Presets.shades_grey
);

universitiesProgress = multibar.create(100, 0);
facultiesProgress = multibar.create(100, 0);
majorProgress = multibar.create(100, 0);
courseProgress = multibar.create(100, 0);

const date = Date();
const startTime = date.now();
console.log(date.toLocaleString());

let universitiesCounter = 0;
let facultiesCounter = 0;
let MajorCounter = 0;
let courseCounter = 0;

const courseScrape = async ({ page, courseList }) => {
  const coursesArray = [];

  for (course of courseList) {
    await page.goto(course[0], {
      waitUntil: "networkidle2",
    });

    const roundList = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main > div > div > ul > li")).map(
        (a) =>
          a.innerHTML.match(
            /(?<=<span class="receive-quota"> รับ <b>)(.*?)(?=<\/b> คน<\/span>)/
          )
            ? a.innerHTML.match(
                /(?<=<span class="receive-quota"> รับ <b>)(.*?)(?=<\/b> คน<\/span>)/
              )[0]
            : "ไม่เปิดรับสมัครในรอบนี้"
      )
    );

    coursesArray.push({
      [course[1]]: roundList,
    });
    courseProgress.increment();
    courseCounter++;
  }

  return coursesArray;
};

const majorScrape = async ({ page, majorList }) => {
  const majorArray = [];

  for (major of majorList) {
    await page.goto(major[0], {
      waitUntil: "networkidle2",
    });

    const courseList = await page.evaluate(() =>
      Array.from(document.querySelectorAll("tr > a")).map((a) => [
        a.href,
        a.innerHTML,
      ])
    );

    amountOfCourse = courseList.length;
    courseProgress.start(amountOfCourse, 0);

    const coursesArray = await courseScrape({ page, courseList });

    majorArray.push({
      [major[1]]: coursesArray,
    });

    majorProgress.increment();
    MajorCounter++;
  }

  return majorArray;
};

const facultiesScrape = async ({ page, faculties }) => {
  const facultiesArray = [];

  for (faculty of faculties) {
    await page.goto(faculty[0], {
      waitUntil: "networkidle2",
    });

    const majorList = await page.evaluate(() =>
      Array.from(document.querySelectorAll("tr > a")).map((a) => [
        a.href,
        a.innerHTML.match(/(?<=<td>\d+. )(.*?)(?=<\/td>)/)[0],
      ])
    );

    amountOfMajor = majorList.length;
    majorProgress.start(amountOfMajor, 0);

    const majorArray = await majorScrape({ page, majorList });

    facultiesArray.push({
      [faculty[1]]: majorArray,
    });

    facultiesProgress.increment();
    facultiesCounter++;
  }

  return facultiesArray;
};

const uniScrape = async ({ page, universitiesName }) => {
  const universitiesArray = [];

  for (university of universitiesName) {
    await page.goto(university[0], {
      waitUntil: "networkidle2",
    });

    const faculties = await page.evaluate(() =>
      Array.from(document.querySelectorAll("tr > a")).map((a) => [
        a.href,
        a.innerHTML.match(/(?<=<td>\d+. )(.*?)(?=<\/td>)/)[0],
      ])
    );

    amountOfFaculties = faculties.length;
    facultiesProgress.start(amountOfFaculties, 0);

    const facultiesArray = await facultiesScrape({ page, faculties });

    universitiesArray.push({
      [university[1]]: facultiesArray,
    });

    universitiesProgress.increment();
    universitiesCounter++;
  }

  return universitiesArray;
};

const writeJsonFile = (universitiesArray) => {
  const jsonUniversitiesArray = JSON.stringify(universitiesArray, null, 2);
  fs.writeFile(
    "./university.json",
    jsonUniversitiesArray,
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The JSON file was saved!");
    }
  );

  const finishTime = Date.now();

  const stat = JSON.stringify(
    {
      university: universitiesCounter,
      faculties: facultiesCounter,
      major: MajorCounter,
      course: courseCounter,
      startTime: startTime,
      finishTime: finishTime,
      durations: (finishTime - startTime) / 1000,
    },
    null,
    2
  );
  fs.writeFile("./stat.json", stat, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The stat file was saved!");
  });

  console.log(Date().toLocaleString());
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://www.mytcas.com/universities", {
    waitUntil: "networkidle2",
  });

  const universitiesName = await page.evaluate(() =>
    Array.from(document.querySelectorAll("td.name > a")).map((a) => [
      a.href,
      a.innerHTML,
    ])
  );

  amountOfUniversity = universitiesName.length;
  universitiesProgress.start(amountOfUniversity, 0);

  const universitiesArray = await uniScrape({ page, universitiesName });

  await browser.close();

  writeJsonFile(universitiesArray);

  console.log(courseCounter);
})();
