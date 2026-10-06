---
title: "Vision–language and multimodal clinical AI"
shortTitle: "Vision–language clinical AI"
description: "Developing and evaluating systems that connect medical images with language, diagnostic reasoning and structured clinical information."
field: Multimodal clinical AI
year: 2026
# Displayed range; year remains the content-format fallback.
period: "2021–present"
order: 1
selected: true
illustration: language
links:
  - label: RATCHET code
    href: https://github.com/farrell236/RATCHET
leadPublications:
  - "hou2025one"
  - "DBLP:conf/miccai/HouKSK21"
relatedPublications:
  - "Hamamci2026"
  - "zhu2025well"
  - "mukherjee2024evaluation"
  - "doi:10.1148/radiol.231147"
---

## Research question

How can an artificial-intelligence system connect what is visible in a medical image with the language used to describe, interpret and act on it? The central challenge is not simply generating fluent text. A clinically useful system must preserve image evidence, express uncertainty and be evaluated against the reasoning tasks it is expected to support.

## From reporting to comparative evaluation

My early work in this direction developed RATCHET, an end-to-end model for generating reports from chest radiographs. The project treated report generation as both a language problem and a medical-content problem, combining conventional natural-language metrics with an evaluation based on information recoverable from the generated report.

More recent work examines multimodal large language models as diagnostic systems. The RSNA Case of the Day studies provide a repeatable setting for comparing models on cases that combine images, clinical context and expert-level questions. Repeating the evaluation a year later made it possible to measure progress rather than describe the performance of a single model snapshot.

## Towards accountable clinical use

The broader programme includes privacy-preserving report labelling, automated evaluation of CT interpretations and generalist representations learned from large multimodal CT datasets. These collaborations widen the technical scope, but they share the same concern: performance must be tied to a defined clinical task and tested with appropriate expert or external references.

Current interests include structured reporting, diagnostic reasoning and evaluation methods that expose where a multimodal model succeeds, fails or relies on incomplete visual evidence.
