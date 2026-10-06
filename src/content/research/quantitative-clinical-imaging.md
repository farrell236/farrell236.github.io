---
title: Quantitative clinical imaging
shortTitle: Quantitative clinical imaging
description: "Turning CT, radiography and other clinical images into reproducible measurements that can support research and patient assessment."
field: Medical image analysis
year: 2026
# Displayed range; year remains the content-format fallback.
period: "2022–present"
order: 2
selected: true
illustration: quantitative
links:
  - label: CephViT model
    href: https://huggingface.co/nlm-dir/CephViT
leadPublications:
  - "hou2026automatic"
  - "hou2024deep"
  - "hou2024enhanced"
  - "hou2022segmentation"
relatedPublications:
  - "bloom2026analysis"
  - "zhuang2025mrisegmenter"
  - "lance2023"
---

## Research question

Clinical images contain measurements that are valuable but expensive to obtain manually. My work asks how segmentation, landmark localisation and derived imaging biomarkers can be made accurate enough for retrospective studies while remaining understandable and testable across patient groups and acquisition settings.

## From regions to measurements

One line of work focuses on ascites in abdominal CT. The initial study established a segmentation approach for a difficult fluid target; subsequent work evaluated automatic volume quantification across cirrhosis and ovarian-cancer cohorts from more than one institution. The purpose is not segmentation for its own sake, but a repeatable measurement that can be compared with expert assessment and used in clinical research.

A related body-composition study evaluated muscle, subcutaneous fat and visceral fat measurements from routine CT. Comparing an internal method with a widely used public segmentation system helped separate agreement in volume from agreement in attenuation and spatial overlap.

## Extending the measurement pipeline

The same principle extends beyond segmentation. Cephalometric analysis requires reliable localisation of anatomical landmarks before skeletal relationships can be assessed. Recent work combines landmark localisation on lateral images with digitally reconstructed radiographs derived from CBCT, then tests whether the automated landmarks preserve downstream malocclusion classification performance.

Across these projects, the recurring priorities are external or comparative evaluation, clinically interpretable outputs and explicit analysis of the errors introduced between an image, an automated structure and the final quantitative result.
