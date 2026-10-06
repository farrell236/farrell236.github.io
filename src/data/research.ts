/**
 * Curated presentation data for the Research overview.
 *
 * Publication metadata remains in public/citations/*.bib. Each citation key
 * below must resolve to a publication whose first author is the site owner.
 */
export const researchThemes = [
  { id: 'quantitative-clinical-imaging', title: 'Quantitative Clinical Imaging' },
  { id: 'multimodal-clinical-ai', title: 'Multimodal Clinical AI' },
  { id: 'generative-medical-imaging', title: 'Generative Medical Imaging' },
  { id: 'spatial-reasoning-reconstruction', title: 'Spatial Reasoning and Reconstruction' },
] as const;

export type ResearchThemeId = (typeof researchThemes)[number]['id'];

export type ResearchImage = {
  src: string;
  alt: string;
  credit: string;
  sourceUrl: string;
  /** Enlarges a single result or panel into the card's full-bleed hero crop. */
  scale: number;
  /** CSS transform origin used to keep the selected result in view. */
  focus: string;
  /** Optional inset that isolates one panel from a multi-panel figure. */
  clip?: string;
  /** Overrides the default full-bleed treatment when the whole image matters. */
  fit?: 'cover' | 'contain';
  /** Anchors an image edge before its focal zoom is applied. */
  position?: string;
};

export type ResearchEntry = {
  citationKey: string;
  summary: string;
  image: ResearchImage;
  theme: ResearchThemeId;
  selected: boolean;
};

export const researchEntries = [
  {
    citationKey: 'hou2026automatic',
    summary: 'Automated cephalometric landmark localisation on CBCT-derived radiographs and downstream skeletal malocclusion classification.',
    image: {
      src: '/images/research/cephalometric-landmarks.webp',
      alt: 'Cephalometric landmark heatmap over a CBCT-derived radiograph.',
      credit: 'Cropped from Figure 1 of the paper.',
      sourceUrl: 'https://arxiv.org/abs/2608.16535',
      scale: 1.48,
      focus: '70% 50%',
    },
    theme: 'quantitative-clinical-imaging',
    selected: true,
  },
  {
    citationKey: 'hou2025one',
    summary: 'A year-on-year evaluation of multimodal model performance on image-based RSNA diagnostic cases.',
    image: {
      src: '/images/research/multimodal-rsna.webp',
      alt: 'Heatmap comparing multimodal model accuracy across radiology subspecialties.',
      credit: 'Cropped from the paper visual abstract.',
      sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12405704/',
      scale: 1.58,
      focus: '0% 50%',
      position: '-7px center',
    },
    theme: 'multimodal-clinical-ai',
    selected: true,
  },
  {
    citationKey: 'hou2024deep',
    summary: 'Automated ascites segmentation and volume quantification across cirrhosis and ovarian-cancer CT cohorts.',
    image: {
      src: '/images/research/ascites-quantification.webp',
      alt: 'Manual and automated ascites segmentations on axial CT images.',
      credit: 'Cropped from Figure 5 of the paper.',
      sourceUrl: 'https://arxiv.org/abs/2406.15979',
      scale: 1.12,
      focus: '50% 50%',
    },
    theme: 'quantitative-clinical-imaging',
    selected: true,
  },
  {
    citationKey: 'hou2024enhanced',
    summary: 'Comparative evaluation of muscle and fat segmentation for CT-based body-composition analysis.',
    image: {
      src: '/images/research/body-composition.webp',
      alt: 'Annotated coronal CT body-composition segmentation.',
      credit: 'Cropped from Figure 5 of the paper.',
      sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10896370/',
      scale: 4.3,
      focus: '26% 64.5%',
      clip: 'inset(49.4% 50.3% 27.1% 13.3%)',
    },
    theme: 'quantitative-clinical-imaging',
    selected: false,
  },
  {
    citationKey: 'Hou:23',
    summary: 'Controllable synthesis of retinal fundus images from generated or freehand diabetic-retinopathy lesion maps.',
    image: {
      src: '/images/research/retina-synthesis.webp',
      alt: 'Synthesized retinal fundus images across diabetic-retinopathy grades.',
      credit: 'Cropped from Figure 12 of the paper.',
      sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9979677/',
      scale: 1.95,
      focus: '50% 50%',
    },
    theme: 'generative-medical-imaging',
    selected: false,
  },
  {
    citationKey: 'hou2022segmentation',
    summary: 'Deep-learning segmentation of ascites on abdominal CT for quantitative assessment in ovarian cancer.',
    image: {
      src: '/images/research/ascites-ovarian-cancer.webp',
      alt: 'Predicted ascites segmentation on a coronal CT image.',
      credit: 'Cropped from Figure 1 of the paper.',
      sourceUrl: 'https://www.cse.cuhk.edu.hk/~qdou/public/medneurips2022/97.pdf',
      scale: 1.75,
      focus: '50% 50%',
    },
    theme: 'quantitative-clinical-imaging',
    selected: false,
  },
  {
    citationKey: 'DBLP:conf/miccai/HouKSK21',
    summary: 'An end-to-end medical transformer for chest-radiograph diagnosis and report generation.',
    image: {
      src: '/images/research/ratchet.webp',
      alt: 'Complete frontal chest radiograph from the RATCHET report example.',
      credit: 'Test chest radiograph extracted from Figure 4 of the paper.',
      sourceUrl: 'https://arxiv.org/abs/2107.02104',
      scale: 1,
      focus: '50% 50%',
    },
    theme: 'multimodal-clinical-ai',
    selected: false,
  },
  {
    citationKey: 'DBLP:conf/miccai/HouVARK19',
    summary: 'Conditional generation of volumetric anatomy from sparse tomographic observations.',
    image: {
      src: '/images/research/conditional-generation.webp',
      alt: 'Ground-truth and generated fetal-brain MRI slices at multiple positions.',
      credit: 'Cropped from Figure 2 of the paper.',
      sourceUrl: 'https://arxiv.org/abs/1908.11312',
      scale: 1.8,
      focus: '50% 50%',
    },
    theme: 'generative-medical-imaging',
    selected: false,
  },
  {
    citationKey: 'DBLP:conf/miccai/HouMKLAMHRGK18',
    summary: 'Pose-estimation losses and gradients formulated directly on the rigid-transformation manifold.',
    image: {
      src: '/images/research/riemannian-pose.webp',
      alt: 'CNN pose-estimation architecture with a Riemannian loss.',
      credit: 'Cropped from Figure 1 of the paper.',
      sourceUrl: 'https://arxiv.org/abs/1805.01026',
      scale: 3.5,
      focus: '98% 50%',
    },
    theme: 'spatial-reasoning-reconstruction',
    selected: false,
  },
  {
    citationKey: 'DBLP:journals/tmi/HouKAMDRHRGK18',
    summary: 'Learning canonical spatial coordinates for reconstructing volumes from arbitrarily oriented 2D images.',
    image: {
      src: '/images/research/canonical-reconstruction.webp',
      alt: 'Fetal-brain reconstructions aligned to canonical atlas space.',
      credit: 'Cropped from Figure 10 of the paper.',
      sourceUrl: 'https://arxiv.org/abs/1709.06341',
      scale: 1.55,
      focus: '50% 50%',
    },
    theme: 'spatial-reasoning-reconstruction',
    selected: false,
  },
  {
    citationKey: 'DBLP:conf/miccai/HouAMDRHRGK17',
    summary: 'Direct prediction of slice-to-volume transformations under substantial subject motion.',
    image: {
      src: '/images/research/slice-to-volume.webp',
      alt: 'Axial fetal-brain reconstruction produced by SVRNet.',
      credit: 'Cropped from Figure 3(e) of the paper.',
      sourceUrl: 'https://arxiv.org/abs/1702.08891',
      scale: 1,
      focus: '50% 50%',
    },
    theme: 'spatial-reasoning-reconstruction',
    selected: false,
  },
] satisfies readonly ResearchEntry[];
