# fem2obsidian

爬取 [FrontendMasters](https://frontendmasters.com) 课程信息，并生成 obsidian 笔记

## 生成的 obsidian 笔记目录结构

```txt
├── 课程标题1
│   ├── _index.md                       # 索引笔记
│   ├── 01 - Section                    # 章节目录1
│   │   ├── 01 - slug.md                # 视频笔记1
│   │   ├── 02 - slug.md                # 视频笔记2
│   │   └── ...
│   ├── 02 - Section                    # 章节目录2
│   │   ├── 03 - slug.md                # 视频笔记3
│   │   ├── 04 - slug.md                # 视频笔记4
│   │   └── ...
│   └── attachments                     # 附件目录
│       ├── slide.pdf                   # 课程资源
│       ├── 01-introduction.mp4         # 视频
│       ├── 01-introduction.en.vtt      # 字幕
│       ├── 02-xxx.mp4                  # 视频
│       ├── 02-xxx.en.vtt               # 字幕
│       └── ...
|
├── 课程标题2
│   ├── _index.md                       # 索引笔记
│   └── ...
```

## obsidian笔记模板

```txt
---
2160p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_2160p_Q10_20mbps.m3u8
1440p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_1440p_Q10_9mbps.m3u8
1080p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_1080_Q10_7mbps.m3u8
720p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_720_Q8_5mbps.m3u8
360p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_360_Q8_2mbps.m3u8
m3u8: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_1080_Q10_7mbps.m3u8
---

[[description]]

> [[中文翻译]]

![[attachments/01-introduction.mp4]]

```

## 索引笔记模板(_index.md)

```txt
---
title: Test Your JavaScript Knowledge
tags:
  - JavaScript
  - Quiz
author: Lydia Hallie
duration: 2 hours, 11 minutes
published: 2024-02-20
---
## Logo

![200](https://static.frontendmasters.com/assets/courses/2024-02-20-javascript-quiz/thumb.webp)

## Description

[[description]]

## Slides

![[attachments/javascript-quiz-slides.pdf]]

## Table of Contents

### Introduction

[[01 - Introduction/01 - introduction|01 - Introduction]]
[[02 - Event Loop & Task Queue]]
[[03 - Scope & Closure]]
[[04 - this keyword]]
[[05 - Classes & Prototypes]]
[[06 - Generators & Iterators]]
[[07 - Garbage Collection]]
[[08 - Modules]]
[[09 - Numbers]]
[[10 - Miscellaneous]]
[[11 - Wrapping Up]]

```

---

## 爬虫原理

首先调用接口 `https://api.frontendmasters.com/v1/kabuki/courses/${slug}` 获取课程的详情数据：

> 该接口需要使用登录Cookie：
> ```
> fem_auth_mod=xxx;
> ```

<details>
<summary>查看示例数据</summary>

```json
{
  "slug": "web-app-testing",
  "title": "Web App Testing \u0026 Tools",
  "description": "Dive into testing with Miško Hevery, covering unit and end-to-end testing, refactoring for testability, and using tools like Vitest and Playwright. You'll learn to mock dependencies, test UI with Storybook, and learn strategies for testing tricky-to-test asynchronous code. With this testing knowledge, you and your teams will build more reliable and maintainable web apps!",
  "thumbnail": "https://static.frontendmasters.com/assets/courses/2024-04-02-web-app-testing/thumb@2x.jpg",
  "resources": [
    {
      "label": "Course Slides",
      "url": "https://static.frontendmasters.com/assets/courses/2024-04-02-web-app-testing/web-app-testing-slides.pdf"
    },
    {
      "label": "Course Code (GitHub)",
      "url": "https://github.com/mhevery/testing-fundamentals"
    }
  ],
  "instructors": [
    {
      "slug": "hevery",
      "name": "Miško Hevery",
      "tagLine": "Qwik Creator (Previously Angular)",
      "bio": "Miško Hevery is the creator of Qwik and CTO of BuilderIO. Previously he created the Angular framework.",
      "imageURL": "https://static.frontendmasters.com/assets/teachers/hevery/thumb.png",
      "socialSettings": {
        "twitter": "@mhevery"
      }
    }
  ],
  "lessonSlugs": [
    "introduction",
    "common-excuses-for-not-testing",
    "the-role-of-qa-and-ai-in-testing",
    "types-of-tests-tradeoffs",
    "refactoring-code-for-unit-testing",
    "testing-with-vitest",
    "mocking-external-dependencies",
    "anatomy-of-a-test",
    "testing-timeouts",
    "add-test-boilerplate-to-beforeeach",
    "multiple-fetch-requests-in-one-test",
    "unit-testing-a-class",
    "clustering-application",
    "unit-testing-a-dataset-algorithm",
    "testing-a-component-with-storybook",
    "end-to-end-testing-with-playwright",
    "creating-a-page-object",
    "testing-the-form-validation",
    "testing-q-a",
    "testing-pyramid-development-model",
    "structuring-code-for-testability",
    "rules-to-avoid-untestable-code",
    "progression-of-testing",
    "guide-to-testable-code",
    "wrapping-up"
  ],
  "lessonData": {
    "AorhFMQuis": {
      "slug": "introduction",
      "title": "Introduction",
      "description": "Miško Hevery, the creator of the Angular and Qwik frameworks, begins the workshop by sharing some general benefits of including testing as a part of the application development process. Including tests will improve code quality, increase productivity, strengthen team collaboration, and build confidence in the product.\r\n - https://static.frontendmasters.com/assets/courses/2024-04-02-web-app-testing/web-app-testing-slides.pdf\r\n - https://github.com/mhevery/testing-fundamentals",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/1-90.jpg",
      "index": 0,
      "elementIndex": 1,
      "statsId": "AorhFMQuis",
      "hash": "AorhFMQuis",
      "timestamp": "00:00:00 - 00:13:41",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/AorhFMQuis",
      "annotations": [
        {
          "id": "AorhFMQuis-00:06:11-1",
          "lessonHash": "AorhFMQuis",
          "range": [
            371,
            381
          ],
          "message": "Here's a link to [Thinking Fast and Slow](https://www.goodreads.com/book/show/11468377-thinking-fast-and-slow)"
        },
        {
          "id": "AorhFMQuis-00:05:42-2",
          "lessonHash": "AorhFMQuis",
          "range": [
            10,
            20
          ],
          "message": "Here's a link to [the course slides](https://static.frontendmasters.com/assets/courses/2024-04-02-web-app-testing/web-app-testing-slides.pdf)"
        }
      ]
    },
    "BSkernHiGr": {
      "slug": "end-to-end-testing-with-playwright",
      "title": "End to End Testing with Playwright",
      "description": "Miško explains the value of end-to-end testing and introduces Playwright, which is similar to other testing tools like Cypress. Playwright is installed and an initial test is written for verifying the title of the clustering web page.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/16-90.jpg",
      "index": 15,
      "elementIndex": 18,
      "statsId": "BSkernHiGr",
      "hash": "BSkernHiGr",
      "timestamp": "02:21:58 - 02:28:53",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/BSkernHiGr",
      "annotations": [
        {
          "id": "BSkernHiGr-00:00:42-25",
          "lessonHash": "BSkernHiGr",
          "range": [
            42,
            52
          ],
          "message": "Here's a link to [Playwright](https://playwright.dev/)"
        },
        {
          "id": "BSkernHiGr-00:01:57-26",
          "lessonHash": "BSkernHiGr",
          "range": [
            60,
            70
          ],
          "message": "Here's a link to our [Cypress](https://frontendmasters.com/courses/cypress/) and [Enterprise UI Dev](https://frontendmasters.com/courses/enterprise-ui-dev/) courses"
        },
        {
          "id": "BSkernHiGr-00:03:21-27",
          "lessonHash": "BSkernHiGr",
          "range": [
            144,
            154
          ],
          "message": "Misko is looking at the `/src/routes/clustering/index.tsx` file"
        },
        {
          "id": "BSkernHiGr-00:11:06-28",
          "lessonHash": "BSkernHiGr",
          "range": [
            148,
            158
          ],
          "message": "We recommend pinning the version to what was used in this course: `npm init playwright@1.17.132` and accept all the default options"
        },
        {
          "id": "BSkernHiGr-00:15:08-29",
          "lessonHash": "BSkernHiGr",
          "range": [
            311,
            321
          ],
          "message": "`await expect(page).toHaveTitle(\"Clustering\")`"
        },
        {
          "id": "BSkernHiGr-00:15:19-30",
          "lessonHash": "BSkernHiGr",
          "range": [
            330,
            340
          ],
          "message": "`npm run test.e2e`"
        }
      ]
    },
    "BVIalbXWzy": {
      "slug": "mocking-external-dependencies",
      "title": "Mocking External Dependencies",
      "description": "Miško demonstrates how to mock external dependencies with Vitest. Creating a mock allows developers to test APIs without wasting resources or waiting for server responses. For a mock to work, components should be written in a way that allows them to be tested more easily. The final code is located on the lesson-2 branch\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-2",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/7-90.jpg",
      "index": 6,
      "elementIndex": 8,
      "statsId": "BVIalbXWzy",
      "hash": "BVIalbXWzy",
      "timestamp": "01:03:47 - 01:18:04",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/BVIalbXWzy",
      "annotations": [
        {
          "id": "BVIalbXWzy-00:44:48-14",
          "lessonHash": "BVIalbXWzy",
          "range": [
            765,
            775
          ],
          "message": "You can copy the header code from [the solution](https://github.com/mhevery/testing-fundamentals/blob/lesson-2/src/routes/github/%5Buser%5D/%5Brepo%5D/github-api.spec.ts) but you don't need the Bearer Token yet"
        }
      ]
    },
    "FhrKuXPpoi": {
      "slug": "testing-with-vitest",
      "title": "Testing with Vitest",
      "description": "Miško introduces Vitest and begins writing a unit test for the GitHub API to verify repository information is returned. The tests are executed in the command line. Vitest also has a user interface that provides a list of tests and reports. Snapshots are also demonstrated in this lesson. The final code is on the lesson-1 branch\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-2",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/6-90.jpg",
      "index": 5,
      "elementIndex": 7,
      "statsId": "FhrKuXPpoi",
      "hash": "FhrKuXPpoi",
      "timestamp": "00:53:53 - 01:03:46",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/FhrKuXPpoi",
      "annotations": [
        {
          "id": "FhrKuXPpoi-00:00:56-10",
          "lessonHash": "FhrKuXPpoi",
          "range": [
            56,
            66
          ],
          "message": "Here's a link to [Vitest](https://vitest.dev/)"
        },
        {
          "id": "FhrKuXPpoi-00:00:10-11",
          "lessonHash": "FhrKuXPpoi",
          "range": [
            10,
            20
          ],
          "message": "The file should be named `github-api.spec.ts`. This is fixed later in the lesson."
        },
        {
          "id": "FhrKuXPpoi-00:08:32-12",
          "lessonHash": "FhrKuXPpoi",
          "range": [
            286,
            296
          ],
          "message": "Run `npm run test --  --ui` or the script `npm run test.ui`"
        },
        {
          "id": "FhrKuXPpoi-00:10:35-13",
          "lessonHash": "FhrKuXPpoi",
          "range": [
            422,
            432
          ],
          "message": "Make sure you remove the `todo` from the first \"it\" block"
        }
      ]
    },
    "GjzkPAoTqy": {
      "slug": "clustering-application",
      "title": "Clustering Application",
      "description": "Miško spends a few minutes walking through the clustering application included in the course repository. The user interface allows users to change the dataset's size, distance, and minimum cluster amount.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/13-90.jpg",
      "index": 12,
      "elementIndex": 14,
      "statsId": "GjzkPAoTqy",
      "hash": "GjzkPAoTqy",
      "timestamp": "01:48:21 - 01:55:14",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/GjzkPAoTqy",
      "annotations": [
        {
          "id": "GjzkPAoTqy-00:00:30-18",
          "lessonHash": "GjzkPAoTqy",
          "range": [
            30,
            40
          ],
          "message": "Misko is looking at the Clustering application in the repo"
        }
      ]
    },
    "GteIzfHWLm": {
      "slug": "testing-a-component-with-storybook",
      "title": "Testing a Component with Storybook",
      "description": "Miško introduces Storybook, which enables UI testing by allowing developers to isolate individual components. The visual representation can be compared to previous tests, and controls can be exposed to manipulate the component in isolation to test how it responds to different inputs. The final code can be found on the lesson-6 branch.\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-6",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/15.2-90.jpg",
      "index": 14,
      "elementIndex": 17,
      "statsId": "GteIzfHWLm",
      "hash": "GteIzfHWLm",
      "timestamp": "02:06:56 - 02:21:57",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/GteIzfHWLm",
      "annotations": [
        {
          "id": "GteIzfHWLm-00:02:05-19",
          "lessonHash": "GteIzfHWLm",
          "range": [
            125,
            135
          ],
          "message": "Here's a link to [Storybook](https://storybook.js.org/)"
        },
        {
          "id": "GteIzfHWLm-00:02:41-20",
          "lessonHash": "GteIzfHWLm",
          "range": [
            161,
            171
          ],
          "message": "Since the clustering app was built with Qwik, use the [Qwik Storybook docs](https://qwik.dev/docs/integrations/storybook/) for installation instructions"
        },
        {
          "id": "GteIzfHWLm-00:02:51-21",
          "lessonHash": "GteIzfHWLm",
          "range": [
            171,
            181
          ],
          "message": "`npm run qwik add storybook`"
        },
        {
          "id": "GteIzfHWLm-00:04:12-22",
          "lessonHash": "GteIzfHWLm",
          "range": [
            239,
            249
          ],
          "message": "`npm run storybook`"
        },
        {
          "id": "GteIzfHWLm-00:06:31-23",
          "lessonHash": "GteIzfHWLm",
          "range": [
            391,
            401
          ],
          "message": "Create a `clustering.stories.tsx` file in the `/src/clustering/` directory"
        }
      ]
    },
    "JfwPZMOBDx": {
      "slug": "rules-to-avoid-untestable-code",
      "title": "Rules to Avoid Untestable Code",
      "description": "Miško walks through several coding issues that create untestable code. Some of these techniques include mixing instantiation and logic, global state usage, and using too many conditionals.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/22-90.jpg",
      "index": 21,
      "elementIndex": 25,
      "statsId": "JfwPZMOBDx",
      "hash": "JfwPZMOBDx",
      "timestamp": "03:16:34 - 03:26:01",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/JfwPZMOBDx"
    },
    "LhFYCagBCx": {
      "slug": "guide-to-testable-code",
      "title": "Guide to Testable Code",
      "description": "Miško walks through the Guide for Testable Code to share additional pitfalls in code that lead to untestable code.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/24-90.jpg",
      "index": 23,
      "elementIndex": 27,
      "statsId": "LhFYCagBCx",
      "hash": "LhFYCagBCx",
      "timestamp": "03:37:00 - 03:48:27",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/LhFYCagBCx"
    },
    "OvbkQBXtsu": {
      "slug": "testing-q-a",
      "title": "Testing Q\u0026A",
      "description": "Miško spends a few minutes answering questions about testing. Questions include the difference between Playwright and Storybook and writing tests that are too complex.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/19-90.jpg",
      "index": 18,
      "elementIndex": 21,
      "statsId": "OvbkQBXtsu",
      "hash": "OvbkQBXtsu",
      "timestamp": "02:49:59 - 02:54:09",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/OvbkQBXtsu"
    },
    "PjLfphzvJI": {
      "slug": "add-test-boilerplate-to-beforeeach",
      "title": "Add Test Boilerplate to beforeEach",
      "description": "Miško simplifies the tests by moving repeated code to the parent describe block. This allows multiple tests to use the same setup logic.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/10-90.jpg",
      "index": 9,
      "elementIndex": 11,
      "statsId": "PjLfphzvJI",
      "hash": "PjLfphzvJI",
      "timestamp": "01:30:39 - 01:33:56",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/PjLfphzvJI"
    },
    "QVlJECQTDo": {
      "slug": "testing-the-form-validation",
      "title": "Testing the Form Validation",
      "description": "Miško uses Playwright to test the form validation. The additional selectors are added to the page object. When the submit button is clicked, the tests verify the error has the correct text. The final code can be found on the lesson-7 branch\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-7",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/18-90.jpg",
      "index": 17,
      "elementIndex": 20,
      "statsId": "QVlJECQTDo",
      "hash": "QVlJECQTDo",
      "timestamp": "02:39:41 - 02:49:58",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/QVlJECQTDo"
    },
    "TgVDapeEmT": {
      "slug": "testing-pyramid-development-model",
      "title": "Testing Pyramid \u0026 Development Model",
      "description": "Miško compares the different test strategies based on the number of tests they require and the execution time. This comparison is represented in a testing pyramid and illustrates unit tests represent a majority of the tests while end-to-end tests take the longest time to execute",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/20-90.jpg",
      "index": 19,
      "elementIndex": 23,
      "statsId": "TgVDapeEmT",
      "hash": "TgVDapeEmT",
      "timestamp": "02:54:10 - 03:04:03",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/TgVDapeEmT"
    },
    "TzbCZpETrC": {
      "slug": "unit-testing-a-class",
      "title": "Unit Testing a Class",
      "description": "Miško introduces the concept of a \"friendly\" while sharing some advice for unit testing a class. A friendly is similar to a mock because it's a set of code that lives inside the test that can be passed objects from the test drive to help control the scope or create edge cases needed to be tested.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/12-90.jpg",
      "index": 11,
      "elementIndex": 13,
      "statsId": "TzbCZpETrC",
      "hash": "TzbCZpETrC",
      "timestamp": "01:45:14 - 01:48:20",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/TzbCZpETrC"
    },
    "UAMhmnwnBG": {
      "slug": "common-excuses-for-not-testing",
      "title": "Common Excuses for Not Testing",
      "description": "Miško discredits the common excuses for not including tests in a codebase. Often, omitting tests is not because of time or scope of work but a lack of knowledge for writing effective tests and having the tools in place to execute them.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/2.2-90.jpg",
      "index": 1,
      "elementIndex": 2,
      "statsId": "UAMhmnwnBG",
      "hash": "UAMhmnwnBG",
      "timestamp": "00:13:42 - 00:23:15",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/UAMhmnwnBG"
    },
    "UXCLUBlcCt": {
      "slug": "the-role-of-qa-and-ai-in-testing",
      "title": "The Role of QA and AI in Testing",
      "description": "Miško answers audience questions related to the role Quality Assurance has in the testing lifecycle and how AI can facilitate testing. Traditional QA roles were responsible for application testing, whereas modern QA engineers helped define the domain-specific language for testing and the infrastructure for executing the tests.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/3.2-90.jpg",
      "index": 2,
      "elementIndex": 3,
      "statsId": "UXCLUBlcCt",
      "hash": "UXCLUBlcCt",
      "timestamp": "00:23:16 - 00:31:53",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/UXCLUBlcCt"
    },
    "bYrBBeUPbR": {
      "slug": "refactoring-code-for-unit-testing",
      "title": "Refactoring Code for Unit Testing",
      "description": "Miško explains asynchronous calls can be difficult to unit test when they are part of a more complex function. Refactoring the code and putting the asynchronous call into a separate component makes it easy for a unit test to call the code independently and ensure it's functioning properly.\r\n - https://github.com/mhevery/testing-fundamentals",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/5-90.jpg",
      "index": 4,
      "elementIndex": 6,
      "statsId": "bYrBBeUPbR",
      "hash": "bYrBBeUPbR",
      "timestamp": "00:43:53 - 00:53:52",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/bYrBBeUPbR",
      "annotations": [
        {
          "id": "bYrBBeUPbR-00:02:41-3",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            161,
            171
          ],
          "message": "Instructions for running both applications are [in the repo](https://github.com/mhevery/testing-fundamentals?tab=readme-ov-file#installation--setup)"
        },
        {
          "id": "bYrBBeUPbR-00:03:51-4",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            231,
            241
          ],
          "message": "Here's a link to [the course repo](https://github.com/mhevery/testing-fundamentals)"
        },
        {
          "id": "bYrBBeUPbR-00:04:13-5",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            253,
            263
          ],
          "message": "We've also added branches for individual lessons that can be used to catch up. You'll see these referenced throughout the course."
        },
        {
          "id": "bYrBBeUPbR-00:04:24-6",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            264,
            274
          ],
          "message": "To get started, follow the setup instructions [in the repo](https://github.com/mhevery/testing-fundamentals?tab=readme-ov-file#installation--setup)"
        },
        {
          "id": "bYrBBeUPbR-00:06:30-7",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            390,
            400
          ],
          "message": "Misko is editing the `/src/routes/github/[user]/[repo]/index.tsx` file on the `no-tests` branch"
        },
        {
          "id": "bYrBBeUPbR-00:06:54-8",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            417,
            427
          ],
          "message": "If you don't have an access key, follow [these instructions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) and add it to your `.env` file."
        },
        {
          "id": "bYrBBeUPbR-00:10:08-9",
          "lessonHash": "bYrBBeUPbR",
          "range": [
            581,
            591
          ],
          "message": "Use the [lesson-1 branch](https://github.com/mhevery/testing-fundamentals/tree/lesson-1/src/routes/github/%5Buser%5D/%5Brepo%5D) to check your code"
        }
      ]
    },
    "bZsunsnFBu": {
      "slug": "creating-a-page-object",
      "title": "Creating a Page Object",
      "description": "Miško tests the behavior of the clustering form. Since elements on the page need to be selected and given specific values, a page object is created so the test API is more readable. This allows for some self-documentation to happen inside the test and alleviates confusion.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/17-90.jpg",
      "index": 16,
      "elementIndex": 19,
      "statsId": "bZsunsnFBu",
      "hash": "bZsunsnFBu",
      "timestamp": "02:28:54 - 02:39:40",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/bZsunsnFBu"
    },
    "cHGFYASOEb": {
      "slug": "wrapping-up",
      "title": "Wrapping Up",
      "description": "Miško wraps up the course with a few final thoughts about creating a testing mindset within a team and answers some additional questions on testing strategies.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/25-90.jpg",
      "index": 24,
      "elementIndex": 29,
      "statsId": "cHGFYASOEb",
      "hash": "cHGFYASOEb",
      "timestamp": "03:48:28 - 03:55:06",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/cHGFYASOEb"
    },
    "fEJDAKdSKn": {
      "slug": "testing-timeouts",
      "title": "Testing Timeouts",
      "description": "Miško adds a test to verify the asynchronous call times out after a set delay. Testing delays can slow down the test runner, so the test is then refactored so the delay can be resolved immediately. The final code is located on the lesson-3 branch\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-3",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/9-90.jpg",
      "index": 8,
      "elementIndex": 10,
      "statsId": "fEJDAKdSKn",
      "hash": "fEJDAKdSKn",
      "timestamp": "01:23:38 - 01:30:38",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/fEJDAKdSKn"
    },
    "gMmZZqMyci": {
      "slug": "anatomy-of-a-test",
      "title": "Anatomy of a Test",
      "description": "Miško breaks down the anatomy of a test. Tests should contain a setup that initializes anything needed for the test, a stimulus that is the target of the test, and the expectations containing what is tested. A few questions about the differences between unit and end-to-end tests are also answered in this lesson.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/8-90.jpg",
      "index": 7,
      "elementIndex": 9,
      "statsId": "gMmZZqMyci",
      "hash": "gMmZZqMyci",
      "timestamp": "01:18:05 - 01:23:37",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/gMmZZqMyci"
    },
    "gcmBcXYOqn": {
      "slug": "unit-testing-a-dataset-algorithm",
      "title": "Unit Testing a Dataset \u0026 Algorithm",
      "description": "Miško creates a unit test for a data set and for the clustering algorithms output. Creating a sample data set in the test makes the test faster and easier to reason about. Once the data set is run through the clustering algorithm, an expectation is written for the result. The final code can be found on the lesson-5 branch.\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-5",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/14-90.jpg",
      "index": 13,
      "elementIndex": 15,
      "statsId": "gcmBcXYOqn",
      "hash": "gcmBcXYOqn",
      "timestamp": "01:55:15 - 02:06:55",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/gcmBcXYOqn"
    },
    "mUPzlhaqvG": {
      "slug": "types-of-tests-tradeoffs",
      "title": "Types of Tests \u0026 Tradeoffs",
      "description": "Miško discusses different types of tests and compares the scope, speed, and isolation attributes of each. The tests discussed are unit, integration, system tests, and end-to-end tests.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/4-90.jpg",
      "index": 3,
      "elementIndex": 4,
      "statsId": "mUPzlhaqvG",
      "hash": "mUPzlhaqvG",
      "timestamp": "00:31:54 - 00:43:52",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/mUPzlhaqvG"
    },
    "pRePOrzeLJ": {
      "slug": "multiple-fetch-requests-in-one-test",
      "title": "Multiple Fetch Requests in One Test",
      "description": "Miško creates a test that requires two asynchronous calls to be sent. Mocks are used for each request and a test is written to ensure the result has the expected shape. The final code can be found on the lesson-4 branch.\r\n - https://github.com/mhevery/testing-fundamentals/tree/lesson-4",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/11-90.jpg",
      "index": 10,
      "elementIndex": 12,
      "statsId": "pRePOrzeLJ",
      "hash": "pRePOrzeLJ",
      "timestamp": "01:33:57 - 01:45:13",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/pRePOrzeLJ",
      "annotations": [
        {
          "id": "pRePOrzeLJ-00:03:56-15",
          "lessonHash": "pRePOrzeLJ",
          "range": [
            236,
            246
          ],
          "message": "The Array needs to be filled before you can map through it. Misko fixes this later in the lesson"
        },
        {
          "id": "pRePOrzeLJ-00:07:29-16",
          "lessonHash": "pRePOrzeLJ",
          "range": [
            449,
            459
          ],
          "message": "Create the `getRepositories` method in `github-api.ts`"
        },
        {
          "id": "pRePOrzeLJ-00:14:50-17",
          "lessonHash": "pRePOrzeLJ",
          "range": [
            572,
            582
          ],
          "message": "Misko added a few console.log() statements while debugging the issue"
        }
      ]
    },
    "wnJDyOkUCr": {
      "slug": "structuring-code-for-testability",
      "title": "Structuring Code for Testability",
      "description": "Miško emphasizes testing is all about correctly structuring your code. Leveraging patterns similar to dependency injection or a more functional style will simplify the inputs and outputs of a function and make it easy to test.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/21-90.jpg",
      "index": 20,
      "elementIndex": 24,
      "statsId": "wnJDyOkUCr",
      "hash": "wnJDyOkUCr",
      "timestamp": "03:04:04 - 03:16:33",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/wnJDyOkUCr"
    },
    "yVcNYcyZDo": {
      "slug": "progression-of-testing",
      "title": "Progression of Testing",
      "description": "Miško shares some advice for tracking down issues in legacy applications. The progression includes scenario tests, which test the application as a whole. From there, functional tests can be written to test subsystems and, eventually, test individual classes in isolation with unit tests.",
      "thumbnail": "https://static.frontendmasters.com/thumb/savage-a/2024/04/02/23-90.jpg",
      "index": 22,
      "elementIndex": 26,
      "statsId": "yVcNYcyZDo",
      "hash": "yVcNYcyZDo",
      "timestamp": "03:26:02 - 03:36:59",
      "sourceBase": "https://api.frontendmasters.com/v1/kabuki/video/yVcNYcyZDo"
    }
  },
  "lessonElements": [
    "Introduction",
    0,
    1,
    2,
    3,
    "Unit Testing \u0026 Mocking",
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    "UI \u0026 End-to-End Testing",
    14,
    15,
    16,
    17,
    18,
    "Writing Testable Code",
    19,
    20,
    21,
    22,
    23,
    "Wrapping Up",
    24
  ],
  "lessonHashes": [
    "AorhFMQuis",
    "UAMhmnwnBG",
    "UXCLUBlcCt",
    "mUPzlhaqvG",
    "bYrBBeUPbR",
    "FhrKuXPpoi",
    "BVIalbXWzy",
    "gMmZZqMyci",
    "fEJDAKdSKn",
    "PjLfphzvJI",
    "pRePOrzeLJ",
    "TzbCZpETrC",
    "GjzkPAoTqy",
    "gcmBcXYOqn",
    "GteIzfHWLm",
    "BSkernHiGr",
    "bZsunsnFBu",
    "QVlJECQTDo",
    "OvbkQBXtsu",
    "TgVDapeEmT",
    "wnJDyOkUCr",
    "JfwPZMOBDx",
    "yVcNYcyZDo",
    "LhFYCagBCx",
    "cHGFYASOEb"
  ],
  "isTrial": false,
  "hasHLS": true,
  "hasTranscript": true,
  "hasIntroLoop": false,
  "hasWebVTT": true,
  "datePublished": "2024-04-02"
}
```
</details>



### 下载附件资源

下载附件资源时不需要任何cookie信息(公开的)


### 创建索引笔记 _index.md

此过程不涉及接口调用


### 创建视频笔记 video.md

首先调用接口 `https://api.frontendmasters.com/v1/kabuki/video/${hash}/source` 获取 m3u8 索引文件，该接口需要使用登录Cookie：

```
fem_auth_mod=xxx;
```

在响应中会有6个`Set_Cookie`：
```txt
CloudFront-Policy=; Path=/2024/02/20/[course-hash]; Domain=frontendmasters.com; HttpOnly
CloudFront-Signature=; Path=/2024/02/20/[course-hash]; Domain=frontendmasters.com; HttpOnly
CloudFront-Key-Pair-Id=; Path=/2024/02/20/[course-hash]; Domain=frontendmasters.com; HttpOnly

CloudFront-Policy=; Path=/[course-hash]-[lesson-hash]; Domain=frontendmasters.com; HttpOnly
CloudFront-Signature=; Path=/[course-hash]-[lesson-hash]; Domain=frontendmasters.com; HttpOnly
CloudFront-Key-Pair-Id=; Path=/[course-hash]-[lesson-hash]; Domain=frontendmasters.com; HttpOnly
```
这些 Cookie 用于后续下载视频ts片段与密钥时使用。
