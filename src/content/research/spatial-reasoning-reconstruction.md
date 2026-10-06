---
title: Spatial reasoning and image reconstruction
shortTitle: Spatial reasoning and reconstruction
description: "Learning how two-dimensional observations relate to three-dimensional anatomy, motion and acquisition geometry."
field: Image reconstruction
year: 2026
# Displayed range; year remains the content-format fallback.
period: "2017–present"
order: 3
selected: true
illustration: geometry
links:
  - label: PyDRR code
    href: https://github.com/farrell236/PyDRR
  - label: PyDRR musing
    href: /writing/pydrr/
leadPublications:
  - "DBLP:journals/tmi/HouKAMDRHRGK18"
  - "DBLP:conf/miccai/HouMKLAMHRGK18"
  - "DBLP:conf/miccai/HouAMDRHRGK17"
relatedPublications:
  - "DBLP:journals/mia/AlansaryOLFHVKV19"
  - "DBLP:conf/miccai/AlansaryFVOLBPG18"
  - "DBLP:conf/miccai/LiKHACSMGKKR18"
---

## Research question

How can a model infer three-dimensional position and anatomy from incomplete or arbitrarily oriented two-dimensional observations? This question appears in motion correction, slice-to-volume registration, image-guided acquisition and projection imaging, where conventional optimisation can fail when its initial spatial estimate is poor.

## Learning a canonical frame

My doctoral work approached registration by learning to map an image slice directly into a canonical anatomical coordinate system. Predicting rotation and translation from image content provides an initialisation for reconstruction pipelines even when subject motion is large. The method was evaluated on simulated brain MRI and motion-corrupted fetal imaging, including integration into a full reconstruction workflow.

This led to a broader investigation of pose as a geometric quantity. Instead of treating rotation and translation as unrelated vectors, the Riemannian formulation calculates loss and gradients on the rigid-transformation manifold. That makes the geometry of the prediction part of the learning objective rather than an after-the-fact correction.

## Continuing through acquisition geometry

The underlying concern—making spatial assumptions explicit—continues in work with projection images and digitally reconstructed radiographs. PyDRR exposes source, detector, isocentre and volume transformations in a compact ray-tracing renderer, providing an inspectable environment for studying how a three-dimensional volume becomes a two-dimensional projection.

Related collaborations extend spatial reasoning to landmark localisation, automatic scan-plane planning and standard-plane detection in three-dimensional ultrasound.
