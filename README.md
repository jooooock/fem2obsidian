# fem2obsidian

爬取 [FrontendMasters](https://frontendmasters.com) 课程信息，并生成 obsidian 笔记

## obsidian笔记目录结构

```txt
- course slug
  attachments
  _index.md
  section1
      01-slug.md
      02-slug.md
  section2
      03-slug.md
      04-slug.md
```

## obsidian笔记内容

```txt
---
m3u8: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_1080_Q10_7mbps.m3u8
---

[[description]]

> [[中文翻译]]

![[attachments/01-introduction.mp4]]

## 更多m3u8资源
```txt
2160p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_2160p_Q10_20mbps.m3u8
1440p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_1440p_Q10_9mbps.m3u8
1080p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_1080_Q10_7mbps.m3u8
720p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_720_Q8_5mbps.m3u8
360p: https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_360_Q8_2mbps.m3u8
```

## 索引文件结构(_index.md)

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

[[01 - Introduction]]
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

## 附件目录结构
```txt
01-introduction.mp4
01-introduction.vtt
slides.pdf
```
