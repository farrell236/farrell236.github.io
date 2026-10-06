/**
 * Editable copy for the homepage and the small, static pages.
 * Keep layout and HTML out of this file: plain text and links are easiest to
 * review, replace and version safely.
 */

export const homePage = {
  title: ['Machine Learning for', 'Bioinformatics'] as const,
  lede: 'I develop machine learning methods for biomedical imaging and multimodal clinical data, with a focus on practical tools for image analysis, structured reporting and scientific discovery.',
  primaryAction: { label: 'Publications', href: '/publications/' },
  secondaryAction: { label: 'About me', href: '/about/' },
  sections: {
    research: { title: 'Selected research', actionLabel: 'All research' },
    publications: { title: 'Selected publications', actionLabel: 'Publication list' },
    writing: { title: 'Beyond the papers', actionLabel: 'All musings' },
  },
  writingLimit: 2,
  publications: [
    {
      year: 2026,
      title: 'Automatic cephalometric landmark localization on CBCT-derived digitally reconstructed radiographs for skeletal malocclusion classification',
      authors: 'B. Hou, K. Almpani, J. S. Lee, and Z. Lu',
      venue: 'Oral and Dental Image Analysis (ODIN 2026) · Accepted',
    },
    {
      year: 2026,
      title: 'Generalist foundation models from a multimodal dataset for 3D computed tomography',
      authors: 'I. E. Hamamci et al.',
      venue: 'Nature Biomedical Engineering · 2026',
      href: 'https://doi.org/10.1038/s41551-025-01599-y',
    },
    {
      year: 2025,
      title: 'One year on: assessing progress of multimodal large language model performance on RSNA 2024 Case of the Day questions',
      authors: 'B. Hou, P. Mukherjee, V. Batheja, K. C. Wang, R. M. Summers, and Z. Lu',
      venue: 'Radiology · 2025',
    },
  ],
};

export const sectionPages = {
  research: {
    title: 'Research',
    description: 'Developing and evaluating systems that connect medical images with language, diagnostic reasoning and structured clinical information.',
    metaDescription: 'Lead-authored research by Benjamin Hou in medical imaging, image reconstruction, generative modelling and multimodal clinical AI.',
  },
  publications: {
    title: 'Publications',
    description: 'Journal articles, conference papers and workshop publications spanning biomedical imaging, multimodal AI and clinical informatics.',
    metaDescription: 'Publications by Benjamin Hou in biomedical imaging, multimodal AI and clinical informatics.',
    profileLinkLabel: 'Google Scholar',
  },
  writing: {
    title: 'Musings',
    description: 'Ideas, reflections and occasional notes beyond formal publications.',
    metaDescription: 'Musings and informal reflections beyond the main academic overview.',
  },
};

export const aboutPage = {
  title: 'About me',
  metaDescription: 'About Benjamin Hou, a Research Fellow in Artificial Intelligence for Bioinformatics at the National Library of Medicine, National Institutes of Health.',
  introduction: 'I develop machine learning methods for biomedical imaging and multimodal clinical data, with an emphasis on tools that can support practical research and clinical workflows.',
  biography: [
    'My research spans medical image segmentation, reconstruction and synthesis, quantitative imaging, and vision-language systems for radiology. I am particularly interested in methods that connect rigorous technical development with clinically meaningful evaluation.',
    'At the National Library of Medicine, I work on artificial intelligence for craniofacial imaging and investigate multimodal large language models for diagnostic reasoning, summarisation and structured reporting. I previously worked at the NIH Clinical Center on automated analysis of CT and MRI, and I continue as an Honorary Research Associate at Imperial College London.',
    'I received my PhD in Machine Learning and Biomedical Image Analysis from Imperial College London. My doctoral research explored machine learning methods for medical image reconstruction and synthesis.',
  ],
  researchAreas: [
    {
      label: 'Medical imaging',
      title: 'Quantitative image analysis',
      description: 'Segmentation, reconstruction and synthesis methods for CT, MRI, radiography and retinal imaging, including scalable tools for quantitative clinical research.',
    },
    {
      label: 'Multimodal AI',
      title: 'Language and vision for medicine',
      description: 'Evaluation and development of multimodal language models for diagnostic reasoning, summarisation and structured reporting in radiology.',
    },
    {
      label: 'Translation',
      title: 'Research systems for clinical use',
      description: 'Robust evaluation, deployment and integration of machine learning tools into collaborative biomedical and clinical imaging workflows.',
    },
  ],
  cvLabel: 'Download CV',
  contactTitle: 'Get in touch',
  contactText: 'For research questions or collaboration opportunities, the best way to reach me is by email.',
};

export const academicPage = {
  title: 'Academic activities',
  description: 'Professional service, invited talks, mentoring and teaching across medical imaging and biomedical artificial intelligence.',
  metaDescription: 'Academic service, invited talks, mentoring and teaching by Benjamin Hou in medical imaging and biomedical artificial intelligence.',
  service: [
    {
      period: '2024–2026',
      title: 'Conference Area Chair',
      organisation: 'Medical Image Computing and Computer Assisted Intervention (MICCAI)',
      description: 'Area Chair for MICCAI 2024, 2025 and 2026.',
    },
    {
      period: '2025',
      title: 'Workshop organiser',
      organisation: 'Learning with Longitudinal Medical Images and Data (LMID)',
      description: 'Organisation of a workshop focused on learning from longitudinal medical imaging and associated clinical data.',
      href: 'https://link.springer.com/book/10.1007/978-3-032-16128-4',
      linkLabel: 'Proceedings',
    },
    {
      period: '2025',
      title: 'Workshop organiser',
      organisation: 'Vision-Language Modelling in 3D Medical Imaging (VLM3D)',
      description: 'Organisation of a workshop focused on vision-language methods for three-dimensional medical imaging.',
      href: 'https://zenodo.org/records/15052708',
      linkLabel: 'Challenge record',
    },
    {
      period: 'Ongoing',
      title: 'Peer reviewer',
      organisation: 'Medical imaging, machine learning and biomedical informatics venues',
      description: 'IEEE TMI, TBME, JBHI and CYBE; Elsevier BBE; ACL; CVPR; ICCV; MICCAI; and MedNeurIPS.',
    },
  ],
  talks: [
    {
      year: '2022',
      title: 'Multi-modal Learning with Chest Radiographs',
      context: 'National Institutes of Health',
    },
    {
      year: '2020',
      title: 'A.I. in Retinopathy Healthcare',
      context: 'UCL / ICL / KCL Bio-imaging Symposia',
    },
    {
      year: '2019',
      title: 'Generative Modelling in Medical Image',
      context: 'UCL / ICL Bio-imaging Symposia',
    },
    {
      year: '2017',
      title: 'Deep Learning in Medical Image Analysis',
      context: 'XinHai Forum, Harbin Engineering University',
    },
  ],
  teaching: [
    {
      label: 'NIH',
      title: 'Summer research supervision',
      projects: [
        {
          student: 'Dylan Wu',
          title: 'A Novel Deep Learning Pipeline for Age-Related Macular Degeneration Risk Prediction with Reticular Pseudodrusen',
        },
        {
          student: 'Tiffany Wei',
          title: 'Evaluating TotalSegmentator for Muscle and Fat Segmentation in Patients with Ascites',
          href: 'https://siim.org/wp-content/uploads/2024/08/Evaluating-TotalSegmentator_Wei.pdf',
        },
      ],
    },
    {
      label: 'Imperial',
      title: 'Undergraduate project supervision',
      supervision: [
        {
          role: 'Supervisor',
          students: [
            'Li, Charlie (2023–24, UG)',
            'Yan, Jerry (2023–24, UG)',
            'Zhao, Xuan (2022–23, UG)',
            'Liu, Zhaojiang (2020–21, MSc)',
            'Xu, Ming (2020–21, MSc)',
            'Zhang, Wanshunyu (2020–21, UG)',
            'Son, Joon-Ho (2020–21, UG)',
          ],
        },
        {
          role: 'Co-supervisor',
          students: [
            'Zhu, Jerry (2023–24, UG)',
            'Chen, Yitang (2023–24, UG)',
            'Sorokin, Mike (2023–24, UG)',
            'Bailey, Jacob (2023–24, UG)',
            'Mihalik, Daniel (2023–24, UG)',
            'Khan, Seyhan (2023–24, UG)',
            'Catea, Bianca (2021–22, UG)',
            'Bouas, Nikolaos (2020–21, MSc)',
            'Lu, Kuan (2020–21, MSc)',
            'Richter, Leo (2020–21, MSc)',
            'Soteriou, George (2020–21, UG)',
            'Xie, Yiming (2020–21, UG)',
            'Roy, Sukant (2020–21, UG)',
          ],
        },
      ],
    },
    {
      label: 'Imperial',
      title: 'Graduate teaching support',
      courses: [
        'EE1-07: Software Engineering 1 - Introduction to Computing (2017)',
        'CO112: Hardware (2018–2020)',
        'CO120.3: Programming III (2017–2019)',
        'CO317 (COMP60005): Graphics (2016–2021)',
      ],
    },
  ],
};

export const notFoundPage = {
  title: "That page isn't here.",
  description: 'The link may have changed. You can return to the overview or browse the research and publications.',
  metaDescription: 'This page could not be found. Return to the research overview.',
  actionLabel: 'Return to overview',
};
