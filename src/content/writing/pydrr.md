---
title: "PyDRR: a transparent route from CT volumes to projection images"
description: "A practical Siddon–Jacobs ray-tracing renderer for studying projection geometry with CPU and CUDA execution paths."
published: 2026-05-10
category: Project notes
externalUrl: https://farrell236.github.io/python-drr/
archived: false
---

## From a volume to a projection

A digitally reconstructed radiograph is a two-dimensional projection calculated from a three-dimensional CT or CBCT volume. It provides a useful bridge between volumetric anatomy and projection imaging, whether the aim is to inspect acquisition geometry, test alignment or generate controlled synthetic views.

[PyDRR](https://github.com/farrell236/PyDRR) is a compact Python renderer built to keep that bridge visible. It uses a Siddon–Jacobs-style ray-tracing projector: for each detector pixel, a ray passes from the source through the voxel grid and accumulates contributions along the intersected path. The method is explicit enough to study, modify and validate without hiding the geometry behind a large framework.

## Geometry should be a first-class input

The command-line interface exposes the quantities that define a projection. Detector size and spacing set the image plane; source-to-isocentre distance sets the cone-beam geometry; and the central-axis detector position controls where the beam meets the detector. The volume can be translated or rotated around each axis, while a projection angle provides a direct way to generate views around the subject.

These controls make it possible to render a single lateral-like image, explore an orbit or construct a reproducible set of projections. Thresholding, negative-value handling and percentile-based display normalisation are separate options, which helps distinguish the underlying calculation from the appearance of an exported PNG.

## Accelerate the same model

The reference execution path runs on the CPU and can distribute detector rows across multiple processes. A CUDA backend implements the projector with a CuPy raw kernel for machines with a compatible NVIDIA GPU and CUDA runtime.

Keeping both routes behind the same geometry and output options is useful for more than speed. The CPU path remains accessible and readable, while the GPU path provides a practical route to larger detectors or repeated projections. Agreement between the two also gives the implementation a natural cross-check.

## State the assumptions

The present renderer assumes an axis-aligned input volume and does not yet apply the SimpleITK direction matrix. Detector spacing is defined at the isocentre plane, transformations are applied to the volume, and rendering cost grows with detector dimensions and finer pixel spacing. These are important constraints rather than footnotes: overlooking image orientation or geometry conventions can produce a plausible-looking but incorrect projection.

PyDRR is therefore best understood as focused research software with a legible model and explicit boundaries. Its value is not only the final image, but the ability to trace how that image was produced.

The implementation, examples and current usage notes are in the [PyDRR repository](https://github.com/farrell236/PyDRR).
