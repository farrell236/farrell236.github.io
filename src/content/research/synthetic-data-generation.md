---
title: Synthetic data and controllable image generation
shortTitle: Synthetic data and generation
description: "Generating missing or under-represented medical images while keeping conditioning, evaluation and downstream use explicit."
field: Generative modelling
year: 2023
# Displayed range; year remains the content-format fallback.
period: "2019–2023"
order: 4
selected: false
illustration: retina
links: []
leadPublications:
  - "Hou:23"
  - "DBLP:conf/miccai/HouVARK19"
relatedPublications:
  - "DBLP:conf/eccv/SchluterTHK22"
  - "melba:2022:013:tan"
  - "DBLP:conf/miccai/ZhuangHMMKS23"
  - "zhao2023high"
---

## Research question

Medical datasets are frequently sparse, imbalanced or missing the precise combinations of anatomy and pathology needed for an experiment. Synthetic data can help, but only when the conditioning signal is clear and the generated images are evaluated for the task they are intended to support.

## Reconstructing what was not acquired

My work on learned mental maps investigated whether a model could infer a full volumetric representation from no more than a small set of tomographic slices. The project combined conditional generation with uncertainty-aware modelling across abdominal CT, brain MRI and motion-corrupted fetal MRI. It framed missing-data generation as an inference problem: the output should reflect both available observations and learned anatomical structure.

## Controlling anatomy and pathology

Later work on diabetic-retinopathy imaging used semantic lesion maps as an explicit interface for generation. A two-stage pipeline first produced lesion layouts conditioned on disease severity and then converted those layouts into high-resolution fundus images. Freehand lesion maps provided an additional way to control the location and composition of the generated pathology.

The evaluation combined measures of image realism with downstream grading and lesion-segmentation experiments. This is important because a visually plausible image is not necessarily useful—or safe—for a scientific task.

## Related directions

Collaborative work explored synthetic anomalies for self-supervised detection, foreign-patch interpolation and conditional diffusion models for pulmonary and abdominal CT. Together, these projects examine generation from three complementary perspectives: filling in missing observations, deliberately controlling pathology and creating surrogate anomalies for learning without exhaustive labels.
