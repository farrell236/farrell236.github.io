---
title: "Interactive Radiology: learning imaging by changing it"
description: "Why an imaging lesson should respond to the learner: a browser-based laboratory for radiography, image data and CT windowing."
published: 2026-10-05
category: Project notes
externalUrl: https://farrell236.github.io/interactive-rad/
archived: false
---

## Make the diagram answer back

Medical imaging is often taught with static figures: a source, a patient, a detector and a handful of arrows. The diagram can show where everything is, but it cannot show how the image changes when the geometry or acquisition settings change.

[Interactive Radiology](https://github.com/farrell236/interactive-rad) is an experiment in making those relationships tangible. Instead of treating an illustration as the conclusion, it turns the illustration into a small laboratory. A learner can change a parameter, observe the result and build an intuition for cause and effect.

## A laboratory, not a slideshow

The working radiography module places a procedural X-ray room in the browser. AP, PA and lateral positioning presets provide recognisable starting points, while controls for source-to-image distance, patient rotation and collimation expose the acquisition geometry. Changes to kVp, mAs, patient thickness and projection are reflected in a stylised detector image, and an animated exposure sequence connects the controls to the act of making an image.

The simulation is intentionally qualitative. Its purpose is not to reproduce a particular scanner, but to make important relationships visible: increasing kVp changes penetration and subject contrast; increasing mAs reduces displayed quantum noise; geometry changes magnification and overlap; and collimation changes the exposed field.

The application now extends beyond acquisition. A CT windowing laboratory moves from stored values and Hounsfield units to clipping, quantisation and task-specific display presets. Linear, sigmoid and custom transfer curves make windowing feel less like a pair of numbers and more like a mapping that can be inspected. A separate image-data curriculum covers formats, headers, voxels, spacing, origin, direction, anatomical planes and LPS/RAS conventions—the details that quietly determine whether an imaging pipeline is correct.

## Keep the boundary visible

An educational simulation becomes misleading if polish is mistaken for clinical fidelity. The detector view uses a simplified attenuation model and procedural anatomy. It is not a diagnostic image, a dose calculator, a technique chart or an acquisition-planning tool. It does not attempt to model a full X-ray spectrum, scatter, grids, automatic exposure control or vendor-specific processing.

Those limits are part of the lesson. They distinguish a model that explains a relationship from a system that claims to predict clinical reality.

## Build for the next experiment

The modality physics is separated from the interface so that better models can replace the current simulation without rebuilding the application shell. That leaves room for reviewed anatomical meshes, CT or CBCT volume rendering, sinogram and reconstruction views, and MRI sequence or k-space demonstrations.

The larger idea is simple: some imaging concepts become clearer when they can be manipulated. A browser is a useful place to make that possible because the experiment is immediate, inspectable and easy to share.

Source code and current scope are available in the [Interactive Radiology repository](https://github.com/farrell236/interactive-rad).
