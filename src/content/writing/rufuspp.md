---
title: "Rufus++: rebuilding a familiar utility across platforms"
description: "Notes on separating a portable boot-media core from native device access—and treating destructive operations as a safety problem."
published: 2026-09-28
category: Project notes
externalUrl: https://farrell236.github.io/rufuspp/
archived: false
---

## Portability is the easy-sounding requirement

Creating bootable media appears to be a straightforward sequence: choose an image, choose a drive and write one to the other. The difficult work begins when the same application must behave coherently on Windows, Linux and macOS, where device discovery, permissions, unmounting, partitioning and installer formats all differ.

[Rufus++](https://github.com/farrell236/rufuspp) explores that problem as a cross-platform C++17 and Qt 6 application. It combines a portable core with native device backends rather than forcing each operating system through one abstraction. The intended workflow covers analysing, creating, formatting, verifying and capturing bootable media, including Windows installation and Windows To Go media, persistent Linux live media, raw or compressed disk images, and native macOS installer applications.

## Safety is part of the architecture

A boot-media utility is unusual desktop software because selecting the wrong target can destroy data. That makes safety more than a confirmation dialog.

The application keeps device-specific work behind platform backends and revalidates the selected target at physical-device entry points. Privilege state is surfaced in the interface, diagnostics and logs rather than implied. On macOS, the production design uses a signed privileged helper for physical writes; an alternate whole-process root mode exists only for local development and hardware testing.

These choices do not make destructive operations automatically safe. They make the trust boundary explicit and create places where device identity, authorisation and state can be checked repeatedly.

## Keep the portable core testable

The split between core logic and the Qt interface also makes it possible to build and test the portable layer without installing the full desktop stack. That matters for code concerned with image inspection, verification and media layout: its behaviour should be testable independently of a windowing toolkit or a particular machine's removable devices.

The same separation supports automated development builds for Windows and Linux on x86-64 and macOS on both Intel and Apple silicon. Packaging is only one part of portability, but repeatable builds make platform differences visible earlier.

## Be clear about provenance and maturity

Rufus++ is an unofficial development prototype, not a released replacement for Rufus. Its destructive operations have not completed platform-specific hardware qualification and it should not be used with media containing important data.

The project is a GPL-licensed reimplementation inspired by [Pete Batard's Rufus](https://github.com/pbatard/rufus). Rufus and its original source remain the work of Pete Batard and its contributors; this branch is neither published nor supported by them. Keeping that attribution next to the technical work is essential, especially when a familiar name and workflow provide the starting point.

The [Rufus++ repository](https://github.com/farrell236/rufuspp) contains the current prototype, its architecture notes and its safety documentation.
