/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppDatabase,
  District,
  Sector,
  SkillCategory,
  Skill,
  JobRole,
  Employer,
  Job,
  JobSkillRequirement,
  TrainingInstitute,
  Course,
  CourseSkillCurriculum,
  CurriculumModule,
  Trainer,
  Candidate,
  TrainingCapacity,
  EmployerSurvey,
  Placement,
  User,
  RoleDef
} from '../../src/types/dataModel.ts';

// Deterministic Pseudo-Random Number Generator for reproducible, realistic distributions
class PRNG {
  private s: number;
  constructor(seed = 1857) {
    this.s = seed % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  sample<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}

export function generateSeedData(): AppDatabase {
  const prng = new PRNG(4242);

  // 1. Roles
  const roles: RoleDef[] = [
    {
      id: 'admin',
      name: 'Government Skill Mission Officer',
      description: 'Full oversight of state workforce planning, budget allocation, district policies, and curriculum standards.',
      permissions: ['view_all', 'edit_allocations', 'approve_curricula', 'audit_institutes', 'export_reports']
    },
    {
      id: 'employer',
      name: 'Industrial Employer / HR Director',
      description: 'Post job demand, submit workforce skill surveys, sponsor apprenticeship batches, and recruit certified talent.',
      permissions: ['post_jobs', 'submit_surveys', 'view_candidates', 'request_batches']
    },
    {
      id: 'candidate',
      name: 'Job Seeker / Student',
      description: 'Assess skill gaps, access AI-guided career pathways, enroll in accredited courses, and apply to matched jobs.',
      permissions: ['view_pathways', 'take_diagnostics', 'enroll_courses', 'apply_jobs']
    },
    {
      id: 'institute',
      name: 'Training Institute Principal / ITI Dean',
      description: 'Manage batch capacity, monitor curriculum alignment health, update syllabus modules, and report placements.',
      permissions: ['manage_courses', 'update_syllabus', 'record_placements', 'view_industry_demand']
    }
  ];

  // 2. Users (Preset demonstration accounts for each role)
  const users: User[] = [
    {
      id: 'usr-gov-01',
      name: 'Dr. Ramesh Deshmukh, IAS',
      email: 'deshmukh.r@maharashtra.gov.in',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      organization: 'Maharashtra State Skill Development Mission (MSSDS)'
    },
    {
      id: 'usr-emp-01',
      name: 'Sunita Patil',
      email: 'patil.sunita@tatamotors-demo.com',
      role: 'employer',
      entityId: 'emp-01',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      organization: 'Tata Motors Powertrain Ltd.'
    },
    {
      id: 'usr-cand-01',
      name: 'Rahul Kulkarni',
      email: 'rahul.kulkarni@example.com',
      role: 'candidate',
      entityId: 'cand-01',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      organization: 'Govt ITI Aundh (Alumnus)'
    },
    {
      id: 'usr-inst-01',
      name: 'Prof. Anant Shinde',
      email: 'principal@itiaundh-pune.ac.in',
      role: 'institute',
      entityId: 'inst-01',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      organization: 'Government ITI Aundh, Pune'
    }
  ];

  // 3. 10 Maharashtra Districts
  const districts: District[] = [
    {
      id: 'dist-pune',
      name: 'Pune',
      division: 'Pune',
      state: 'Maharashtra',
      lat: 18.5204,
      lng: 73.8567,
      industrialHubType: 'Auto, IT Hub & Heavy Engineering',
      majorIndustries: ['Automotive', 'IT & Software', 'Electronics', 'Manufacturing'],
      approxWorkforce: 4200000
    },
    {
      id: 'dist-mumbai',
      name: 'Mumbai',
      division: 'Konkan',
      state: 'Maharashtra',
      lat: 19.076,
      lng: 72.8777,
      industrialHubType: 'Financial Capital & Commercial Services',
      majorIndustries: ['Banking & Finance', 'Healthcare', 'Retail', 'IT & Software'],
      approxWorkforce: 6800000
    },
    {
      id: 'dist-nagpur',
      name: 'Nagpur',
      division: 'Vidarbha',
      state: 'Maharashtra',
      lat: 21.1458,
      lng: 79.0882,
      industrialHubType: 'Multi-Modal Logistics Hub (MIHAN) & Power',
      majorIndustries: ['Logistics', 'Manufacturing', 'Electronics', 'Healthcare'],
      approxWorkforce: 2300000
    },
    {
      id: 'dist-nashik',
      name: 'Nashik',
      division: 'Nashik',
      state: 'Maharashtra',
      lat: 19.9975,
      lng: 73.7898,
      industrialHubType: 'Defense, Aerospace & Auto Cluster',
      majorIndustries: ['Automotive', 'Manufacturing', 'Electronics', 'Logistics'],
      approxWorkforce: 1850000
    },
    {
      id: 'dist-thane',
      name: 'Thane',
      division: 'Konkan',
      state: 'Maharashtra',
      lat: 19.2183,
      lng: 72.9781,
      industrialHubType: 'Industrial Corridor & Chemical/Pharma Logistics',
      majorIndustries: ['Healthcare', 'Manufacturing', 'Logistics', 'Retail'],
      approxWorkforce: 3100000
    },
    {
      id: 'dist-aurangabad',
      name: 'Chhatrapati Sambhajinagar',
      division: 'Marathwada',
      state: 'Maharashtra',
      lat: 19.8762,
      lng: 75.3433,
      industrialHubType: 'AURIC Smart City, Auto Components & Pharma',
      majorIndustries: ['Automotive', 'Manufacturing', 'Healthcare', 'Electronics'],
      approxWorkforce: 1450000
    },
    {
      id: 'dist-kolhapur',
      name: 'Kolhapur',
      division: 'Pune',
      state: 'Maharashtra',
      lat: 16.705,
      lng: 74.2433,
      industrialHubType: 'Foundry Hub, Precision Casting & Agri-Machinery',
      majorIndustries: ['Manufacturing', 'Automotive', 'Retail'],
      approxWorkforce: 1200000
    },
    {
      id: 'dist-navimumbai',
      name: 'Navi Mumbai',
      division: 'Konkan',
      state: 'Maharashtra',
      lat: 19.033,
      lng: 73.0297,
      industrialHubType: 'Data Center Capital, IT Parks & Port Logistics',
      majorIndustries: ['IT & Software', 'Logistics', 'Banking & Finance'],
      approxWorkforce: 1600000
    },
    {
      id: 'dist-satara',
      name: 'Satara',
      division: 'Pune',
      state: 'Maharashtra',
      lat: 17.6805,
      lng: 74.0183,
      industrialHubType: 'MIDC Agro-Industrial & Tooling Cluster',
      majorIndustries: ['Manufacturing', 'Automotive', 'Logistics'],
      approxWorkforce: 950000
    },
    {
      id: 'dist-solapur',
      name: 'Solapur',
      division: 'Pune',
      state: 'Maharashtra',
      lat: 17.6599,
      lng: 75.9064,
      industrialHubType: 'Textile Hub, Power Generation & Solar Park',
      majorIndustries: ['Manufacturing', 'Retail', 'Logistics'],
      approxWorkforce: 1050000
    }
  ];

  // 4. 8 Sectors
  const sectors: Sector[] = [
    {
      id: 'sec-it',
      name: 'IT & Software',
      code: 'IT',
      description: 'Cloud computing, full-stack software development, cybersecurity, AI data systems, and enterprise tech.',
      icon: 'Code',
      highGrowth: true
    },
    {
      id: 'sec-mfg',
      name: 'Manufacturing',
      code: 'MFG',
      description: 'CNC machining, precision tooling, industrial robotics, quality assurance, and metallurgy.',
      icon: 'Factory',
      highGrowth: true
    },
    {
      id: 'sec-auto',
      name: 'Automotive',
      code: 'AUTO',
      description: 'Electric Vehicle (EV) powertrain assembly, automotive diagnostics, battery management, and wire harness.',
      icon: 'Car',
      highGrowth: true
    },
    {
      id: 'sec-elec',
      name: 'Electronics',
      code: 'ELEC',
      description: 'PCB surface mount technology (SMT), semiconductor packaging, embedded firmware, and IoT sensors.',
      icon: 'Cpu',
      highGrowth: true
    },
    {
      id: 'sec-health',
      name: 'Healthcare',
      code: 'HEALTH',
      description: 'Biomedical maintenance, medical diagnostics, pharmacy tech, patient care assistance, and medical imaging.',
      icon: 'Activity',
      highGrowth: true
    },
    {
      id: 'sec-bfsi',
      name: 'Banking & Finance',
      code: 'BFSI',
      description: 'Fintech operations, credit risk analysis, digital banking compliance, wealth operations, and auditing.',
      icon: 'Landmark',
      highGrowth: false
    },
    {
      id: 'sec-logistics',
      name: 'Logistics',
      code: 'LOG',
      description: 'Automated warehouse management, fleet telematics, cold chain operations, and multimodal cargo handling.',
      icon: 'Truck',
      highGrowth: true
    },
    {
      id: 'sec-retail',
      name: 'Retail',
      code: 'RET',
      description: 'Omnichannel retail operations, inventory visual merchandising, POS systems, and customer loyalty.',
      icon: 'ShoppingBag',
      highGrowth: false
    }
  ];

  // 5. Skill Categories
  const skillCategories: SkillCategory[] = [
    { id: 'cat-core-tech', name: 'Core Technical Engineering', description: 'Hard technical skills in engineering, electronics, and machining' },
    { id: 'cat-software', name: 'Software & Data Engineering', description: 'Programming, cloud, data, and cyber defense' },
    { id: 'cat-ev-green', name: 'EV & Green Technology', description: 'Battery chemistry, power electronics, solar PV, and clean mobility' },
    { id: 'cat-ops-quality', name: 'Operations & Quality Control', description: 'Six Sigma, Lean, ISO compliance, logistics, and inspection' },
    { id: 'cat-domain-health', name: 'Clinical & Biomedical Sciences', description: 'Patient care, diagnostic equipment, and pharma processes' },
    { id: 'cat-finance-fintech', name: 'Finance & Compliance', description: 'Accounting, KYC, risk assessment, and financial modeling' },
    { id: 'cat-soft-pro', name: 'Professional & Supervisory Skills', description: 'Shopfloor leadership, English communication, safety protocols' }
  ];

  // 6. 56 Granular Skills
  const rawSkillsData = [
    // Automotive & EV
    { id: 'sk-ev-battery', code: 'EV-01', name: 'EV Battery Management System (BMS) Calibration', cat: 'cat-ev-green', sec: ['sec-auto', 'sec-elec'], nsqf: 6, emg: true, trend: 'surging', aliases: ['BMS Tuning', 'Li-ion Battery Diagnostics'] },
    { id: 'sk-ev-powertrain', code: 'EV-02', name: 'Electric Motor & Inverter Assembly', cat: 'cat-ev-green', sec: ['sec-auto'], nsqf: 5, emg: true, trend: 'surging', aliases: ['BLDC Motor Servicing', 'EV Drivetrain'] },
    { id: 'sk-auto-diag', code: 'AUTO-01', name: 'Automotive CAN-Bus & OBD-II Diagnostics', cat: 'cat-core-tech', sec: ['sec-auto'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Vehicle ECU Scanning', 'Auto Diagnostics'] },
    { id: 'sk-wire-harness', code: 'AUTO-02', name: 'Automotive Wiring Harness Fabrication', cat: 'cat-core-tech', sec: ['sec-auto', 'sec-elec'], nsqf: 4, emg: false, trend: 'stable', aliases: ['Cable Loom Assembly', 'Crimping'] },
    { id: 'sk-ev-charging', code: 'EV-03', name: 'EV Charging Infrastructure & CCS2 Maintenance', cat: 'cat-ev-green', sec: ['sec-auto'], nsqf: 5, emg: true, trend: 'surging', aliases: ['Fast Charger Setup', 'EVSE Installation'] },

    // Manufacturing & Mechanical
    { id: 'sk-cnc-prog', code: 'MFG-01', name: 'CNC 5-Axis Milling & G-Code Programming', cat: 'cat-core-tech', sec: ['sec-mfg', 'sec-auto'], nsqf: 5, emg: false, trend: 'stable', aliases: ['CNC VMC Machining', 'G-Code', 'Fanuc Controller'] },
    { id: 'sk-cad-cam', code: 'MFG-02', name: 'Siemens NX & SolidWorks CAD/CAM Tooling', cat: 'cat-core-tech', sec: ['sec-mfg', 'sec-auto'], nsqf: 6, emg: false, trend: 'stable', aliases: ['3D Modeling', 'Die Design'] },
    { id: 'sk-plc-scada', code: 'MFG-03', name: 'PLC Programming & SCADA Industrial Automation', cat: 'cat-core-tech', sec: ['sec-mfg', 'sec-elec'], nsqf: 6, emg: true, trend: 'surging', aliases: ['Siemens S7', 'Allen Bradley', 'HMI Interfacing'] },
    { id: 'sk-robotic-weld', code: 'MFG-04', name: 'Robotic MIG/TIG Welding Cell Operation', cat: 'cat-core-tech', sec: ['sec-mfg', 'sec-auto'], nsqf: 4, emg: false, trend: 'stable', aliases: ['Kuka Robot Welding', 'Robotic Arm Teaching'] },
    { id: 'sk-cmm-inspect', code: 'MFG-05', name: 'CMM Precision Inspection & GD&T Standards', cat: 'cat-ops-quality', sec: ['sec-mfg', 'sec-auto'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Metrology', 'Zeiss CMM', 'Tolerance Analysis'] },
    { id: 'sk-hydraulic-pneu', code: 'MFG-06', name: 'Hydraulics & Pneumatic Circuit Troubleshooting', cat: 'cat-core-tech', sec: ['sec-mfg'], nsqf: 4, emg: false, trend: 'stable', aliases: ['Fluid Power', 'Proportional Valves'] },
    { id: 'sk-additive-mfg', code: 'MFG-07', name: 'Industrial 3D Printing & Additive Manufacturing', cat: 'cat-core-tech', sec: ['sec-mfg'], nsqf: 6, emg: true, trend: 'surging', aliases: ['Direct Metal Laser Sintering', 'Rapid Prototyping'] },

    // Electronics & Semiconductor
    { id: 'sk-smt-assembly', code: 'ELEC-01', name: 'Surface Mount Technology (SMT) Pick-and-Place', cat: 'cat-core-tech', sec: ['sec-elec'], nsqf: 4, emg: true, trend: 'surging', aliases: ['SMT Line Operator', 'Solder Paste Printing'] },
    { id: 'sk-embedded-c', code: 'ELEC-02', name: 'Embedded C/C++ & ARM Cortex Microcontrollers', cat: 'cat-software', sec: ['sec-elec', 'sec-auto', 'sec-it'], nsqf: 6, emg: false, trend: 'stable', aliases: ['STM32', 'Firmware Engineering', 'RTOS'] },
    { id: 'sk-pcb-design', code: 'ELEC-03', name: 'High-Speed Multilayer PCB Layout (Altium Designer)', cat: 'cat-core-tech', sec: ['sec-elec'], nsqf: 6, emg: false, trend: 'stable', aliases: ['Altium', 'Gerber Generation', 'Signal Integrity'] },
    { id: 'sk-iot-sensor', code: 'ELEC-04', name: 'Industrial IoT Edge Gateway & MQTT Protocols', cat: 'cat-core-tech', sec: ['sec-elec', 'sec-it'], nsqf: 5, emg: true, trend: 'surging', aliases: ['Edge Computing', 'ESP32 IoT', 'Modbus TCP'] },
    { id: 'sk-cleanroom-sop', code: 'ELEC-05', name: 'Semiconductor Cleanroom (Class 10,000) Protocols', cat: 'cat-ops-quality', sec: ['sec-elec'], nsqf: 4, emg: true, trend: 'surging', aliases: ['ESD Control', 'Cleanroom Operation'] },

    // IT & Software
    { id: 'sk-fullstack-ts', code: 'IT-01', name: 'Full-Stack Web Engineering (TypeScript & React)', cat: 'cat-software', sec: ['sec-it', 'sec-bfsi'], nsqf: 6, emg: false, trend: 'surging', aliases: ['Node.js', 'Next.js', 'React.js'] },
    { id: 'sk-cloud-devops', code: 'IT-02', name: 'Cloud Architecture & DevOps (AWS/GCP, Docker, K8s)', cat: 'cat-software', sec: ['sec-it', 'sec-bfsi'], nsqf: 7, emg: true, trend: 'surging', aliases: ['Kubernetes', 'CI/CD Pipelines', 'Terraform'] },
    { id: 'sk-python-data', code: 'IT-03', name: 'Python Data Analysis & Automated ETL Pipelines', cat: 'cat-software', sec: ['sec-it', 'sec-bfsi', 'sec-logistics'], nsqf: 6, emg: false, trend: 'surging', aliases: ['Pandas', 'SQL', 'Data Wrangling'] },
    { id: 'sk-cyber-soc', code: 'IT-04', name: 'Cybersecurity SOC Monitoring & Threat Detection', cat: 'cat-software', sec: ['sec-it', 'sec-bfsi'], nsqf: 6, emg: true, trend: 'surging', aliases: ['SIEM', 'Splunk', 'Vulnerability Assessment'] },
    { id: 'sk-ml-models', code: 'IT-05', name: 'Machine Learning Model Deployment & LLM Ops', cat: 'cat-software', sec: ['sec-it'], nsqf: 7, emg: true, trend: 'surging', aliases: ['MLOps', 'PyTorch', 'Prompt Engineering'] },
    { id: 'sk-qa-automation', code: 'IT-06', name: 'Automated Software Testing (Selenium & Playwright)', cat: 'cat-software', sec: ['sec-it'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Test Automation', 'Cypress'] },
    { id: 'sk-mobile-flutter', code: 'IT-07', name: 'Cross-Platform Mobile App Development (Flutter)', cat: 'cat-software', sec: ['sec-it', 'sec-retail'], nsqf: 6, emg: false, trend: 'stable', aliases: ['Flutter Dart', 'Mobile Engineering'] },

    // Healthcare & Biomedical
    { id: 'sk-biomed-equip', code: 'HLTH-01', name: 'Biomedical Equipment Maintenance & Calibration', cat: 'cat-domain-health', sec: ['sec-health'], nsqf: 6, emg: false, trend: 'surging', aliases: ['Ventilator Calibration', 'Defibrillator Testing'] },
    { id: 'sk-emergency-med', code: 'HLTH-02', name: 'Emergency Medical Technician (EMT) & Trauma Care', cat: 'cat-domain-health', sec: ['sec-health'], nsqf: 5, emg: false, trend: 'stable', aliases: ['BLS/ACLS', 'Ambulance First Responder'] },
    { id: 'sk-radiology-assist', code: 'HLTH-03', name: 'Radiography & X-Ray/CT Scan Protocol Assistance', cat: 'cat-domain-health', sec: ['sec-health'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Radiology Tech', 'DICOM Viewing'] },
    { id: 'sk-sterile-proc', code: 'HLTH-04', name: 'Central Sterile Supply Department (CSSD) Processing', cat: 'cat-domain-health', sec: ['sec-health'], nsqf: 4, emg: false, trend: 'stable', aliases: ['Autoclave Sterilization', 'Infection Control'] },
    { id: 'sk-pharma-gmp', code: 'HLTH-05', name: 'Pharma Cleanroom Good Manufacturing Practice (GMP)', cat: 'cat-ops-quality', sec: ['sec-health'], nsqf: 5, emg: false, trend: 'stable', aliases: ['USFDA GMP', 'Batch Record Documentation'] },

    // Logistics & Supply Chain
    { id: 'sk-wms-rfid', code: 'LOG-01', name: 'Warehouse Management Systems (WMS) & RFID Tracking', cat: 'cat-ops-quality', sec: ['sec-logistics', 'sec-retail'], nsqf: 4, emg: true, trend: 'surging', aliases: ['Barcode Scanning', 'SAP WMS', 'Inventory Audit'] },
    { id: 'sk-forklift-op', code: 'LOG-02', name: 'Heavy Electric Forklift & Reach Truck Operation', cat: 'cat-core-tech', sec: ['sec-logistics', 'sec-mfg'], nsqf: 3, emg: false, trend: 'stable', aliases: ['Material Handling Equipment', 'Pallet Mover'] },
    { id: 'sk-cold-chain', code: 'LOG-03', name: 'Cold Chain Monitoring & Refrigeration Temperature Logs', cat: 'cat-ops-quality', sec: ['sec-logistics', 'sec-health'], nsqf: 4, emg: true, trend: 'surging', aliases: ['Pharma Cold Chain', 'Reefer Truck Setup'] },
    { id: 'sk-fleet-telematics', code: 'LOG-04', name: 'Fleet Telematics & Route Optimization Software', cat: 'cat-software', sec: ['sec-logistics'], nsqf: 5, emg: false, trend: 'stable', aliases: ['GPS Tracking', 'Logistics Dispatch'] },
    { id: 'sk-dg-cargo', code: 'LOG-05', name: 'Dangerous Goods (DG) Handling & IMDG Regulations', cat: 'cat-ops-quality', sec: ['sec-logistics'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Hazmat Compliance', 'Material Safety'] },

    // Banking, Finance & FinTech
    { id: 'sk-aml-kyc', code: 'BFSI-01', name: 'Anti-Money Laundering (AML) & KYC Verification', cat: 'cat-finance-fintech', sec: ['sec-bfsi'], nsqf: 5, emg: false, trend: 'surging', aliases: ['Customer Due Diligence', 'FinCEN Rules'] },
    { id: 'sk-credit-underwrite', code: 'BFSI-02', name: 'Retail & SME Credit Risk Underwriting', cat: 'cat-finance-fintech', sec: ['sec-bfsi'], nsqf: 6, emg: false, trend: 'stable', aliases: ['Loan Appraisal', 'CIBIL Analysis'] },
    { id: 'sk-tally-prime', code: 'BFSI-03', name: 'Tally Prime & Indian GST Compliance Accounting', cat: 'cat-finance-fintech', sec: ['sec-bfsi', 'sec-retail'], nsqf: 4, emg: false, trend: 'stable', aliases: ['Tally ERP', 'GST Returns Filing'] },
    { id: 'sk-financial-model', code: 'BFSI-04', name: 'Advanced Excel & Financial Statement Modeling', cat: 'cat-finance-fintech', sec: ['sec-bfsi'], nsqf: 5, emg: false, trend: 'stable', aliases: ['DCF Analysis', 'VBA Macro'] },
    { id: 'sk-digital-banking-ops', code: 'BFSI-05', name: 'UPI & Payment Gateway Reconciliation Operations', cat: 'cat-finance-fintech', sec: ['sec-bfsi'], nsqf: 5, emg: true, trend: 'surging', aliases: ['Payment Gateway Settlement', 'IMPS/NEFT Ops'] },

    // Retail & Omnichannel
    { id: 'sk-pos-billing', code: 'RET-01', name: 'POS Modern Retail Billing & CRM Management', cat: 'cat-ops-quality', sec: ['sec-retail'], nsqf: 3, emg: false, trend: 'stable', aliases: ['Cashiering', 'Barcode Billing'] },
    { id: 'sk-visual-merchand', code: 'RET-02', name: 'Visual Merchandising & Planogram Execution', cat: 'cat-ops-quality', sec: ['sec-retail'], nsqf: 4, emg: false, trend: 'stable', aliases: ['Store Window Design', 'Category Display'] },
    { id: 'sk-omnichannel-fulfillment', code: 'RET-03', name: 'E-commerce Omnichannel Click & Collect Fulfillment', cat: 'cat-ops-quality', sec: ['sec-retail', 'sec-logistics'], nsqf: 4, emg: true, trend: 'surging', aliases: ['Dark Store Pick & Pack', 'Omnichannel Ops'] },
    { id: 'sk-customer-service', code: 'RET-04', name: 'Retail Customer Delight & Escalation Resolution', cat: 'cat-soft-pro', sec: ['sec-retail', 'sec-bfsi'], nsqf: 3, emg: false, trend: 'declining', aliases: ['Front Desk', 'Customer Grievances'] },

    // Cross-Cutting & Industry 4.0
    { id: 'sk-lean-sixsigma', code: 'QUAL-01', name: '5S, Kaizen & Six Sigma Green Belt Shopfloor Practices', cat: 'cat-ops-quality', sec: ['sec-mfg', 'sec-auto', 'sec-logistics'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Continuous Improvement', 'Total Quality Mgmt'] },
    { id: 'sk-industrial-safety', code: 'SAFE-01', name: 'OSHA & Industrial Workplace Safety Hazard Mitigation', cat: 'cat-soft-pro', sec: ['sec-mfg', 'sec-auto', 'sec-elec', 'sec-logistics'], nsqf: 4, emg: false, trend: 'stable', aliases: ['EHS Compliance', 'PPE Standards'] },
    { id: 'sk-solar-pv-install', code: 'GRN-01', name: 'Rooftop Solar PV Installation & Grid Inverter Sync', cat: 'cat-ev-green', sec: ['sec-elec', 'sec-mfg'], nsqf: 4, emg: true, trend: 'surging', aliases: ['Solar Technician', 'Net Metering'] },
    { id: 'sk-sql-rdbms', code: 'IT-08', name: 'PostgreSQL & Relational Database Management', cat: 'cat-software', sec: ['sec-it', 'sec-bfsi'], nsqf: 5, emg: false, trend: 'stable', aliases: ['SQL Query Optimization', 'Postgres'] },
    { id: 'sk-agile-scrum', code: 'PRO-01', name: 'Agile Sprint Execution & JIRA Workflow Coordination', cat: 'cat-soft-pro', sec: ['sec-it'], nsqf: 5, emg: false, trend: 'stable', aliases: ['Scrum Ceremonies', 'JIRA'] },
    { id: 'sk-diesel-gen-maintenance', code: 'MFG-08', name: 'Diesel Generator & HT Transformer Substation Upkeep', cat: 'cat-core-tech', sec: ['sec-mfg'], nsqf: 4, emg: false, trend: 'declining', aliases: ['Substation Electrician', 'DG Set Maintenance'] },
    { id: 'sk-manual-lathe', code: 'MFG-09', name: 'Conventional Manual Lathe & Shaping Machine Turning', cat: 'cat-core-tech', sec: ['sec-mfg'], nsqf: 3, emg: false, trend: 'declining', aliases: ['Turner', 'Machinist Conventional'] },
    { id: 'sk-manual-bookkeeping', code: 'BFSI-06', name: 'Paper Ledger Bookkeeping & Physical Voucher Filing', cat: 'cat-finance-fintech', sec: ['sec-bfsi'], nsqf: 3, emg: false, trend: 'declining', aliases: ['Manual Ledger', 'Paper Accounting'] },
    { id: 'sk-lead-acid-battery', code: 'AUTO-03', name: 'Traditional Flooded Lead-Acid Battery Cell Servicing', cat: 'cat-core-tech', sec: ['sec-auto'], nsqf: 3, emg: false, trend: 'declining', aliases: ['Electrolyte Top-up', 'Lead Acid Battery'] },
    { id: 'sk-co2-laser-cut', code: 'MFG-10', name: 'CNC Fiber Laser Sheet Metal Cutting & Nesting', cat: 'cat-core-tech', sec: ['sec-mfg'], nsqf: 5, emg: true, trend: 'surging', aliases: ['Bystronic Laser', 'Sheet Metal Nesting'] },
    { id: 'sk-tpms-airbag-safety', code: 'AUTO-04', name: 'ADAS Sensors, TPMS & SRS Airbag Diagnostic Servicing', cat: 'cat-core-tech', sec: ['sec-auto'], nsqf: 6, emg: true, trend: 'surging', aliases: ['ADAS Radar Calibration', 'Airbag Module'] },
    { id: 'sk-energy-audit', code: 'GRN-02', name: 'Industrial Energy Auditing & ISO 50001 Standards', cat: 'cat-ops-quality', sec: ['sec-mfg', 'sec-auto'], nsqf: 6, emg: true, trend: 'surging', aliases: ['Energy Efficiency', 'BEE Standards'] }
  ];

  const skills: Skill[] = rawSkillsData.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    categoryId: s.cat,
    sectorIds: s.sec,
    nsqfLevel: s.nsqf,
    isEmerging: s.emg,
    demandTrend: s.trend as 'surging' | 'stable' | 'declining',
    aliases: s.aliases,
    description: `Professional technical capability in ${s.name} aligned with national occupational standards.`
  }));

  // 7. 32 Job Roles Across Sectors
  const jobRoles: JobRole[] = [
    // Automotive
    { id: 'jr-ev-tech', title: 'Electric Vehicle Service Specialist', sectorId: 'sec-auto', minNsqfLevel: 5, defaultSkillIds: ['sk-ev-battery', 'sk-ev-powertrain', 'sk-auto-diag'], averageSalaryINR: 380000, entryLevelOpenings: 180, description: 'Diagnose, calibrate, and repair high-voltage battery packs, invertors, and electric drivetrains.' },
    { id: 'jr-auto-wire', title: 'Automotive Wire Harness & Assembly Operator', sectorId: 'sec-auto', minNsqfLevel: 4, defaultSkillIds: ['sk-wire-harness', 'sk-industrial-safety'], averageSalaryINR: 260000, entryLevelOpenings: 240, description: 'Route, assemble, and test complex electrical looms for passenger and commercial vehicle chassis.' },
    { id: 'jr-adas-diag', title: 'ADAS & Connected Vehicle Diagnostic Engineer', sectorId: 'sec-auto', minNsqfLevel: 6, defaultSkillIds: ['sk-tpms-airbag-safety', 'sk-auto-diag', 'sk-iot-sensor'], averageSalaryINR: 580000, entryLevelOpenings: 75, description: 'Calibrate radar, lidar, and electronic steering sensors on modern connected vehicle platforms.' },
    { id: 'jr-ev-station', title: 'EV Charging Station Maintenance Technician', sectorId: 'sec-auto', minNsqfLevel: 5, defaultSkillIds: ['sk-ev-charging', 'sk-industrial-safety', 'sk-solar-pv-install'], averageSalaryINR: 320000, entryLevelOpenings: 110, description: 'Commission and troubleshoot public fast DC charging networks.' },

    // Manufacturing
    { id: 'jr-cnc-operator', title: '5-Axis CNC Milling Specialist', sectorId: 'sec-mfg', minNsqfLevel: 5, defaultSkillIds: ['sk-cnc-prog', 'sk-cmm-inspect', 'sk-cad-cam'], averageSalaryINR: 360000, entryLevelOpenings: 320, description: 'Program, setup, and machine aerospace and automotive components to micrometer tolerances.' },
    { id: 'jr-automation-eng', title: 'Industrial Automation & PLC Commissioning Engineer', sectorId: 'sec-mfg', minNsqfLevel: 6, defaultSkillIds: ['sk-plc-scada', 'sk-hydraulic-pneu', 'sk-industrial-safety'], averageSalaryINR: 520000, entryLevelOpenings: 160, description: 'Develop PLC logic and integrate robotic cells on active assembly lines.' },
    { id: 'jr-laser-sheet', title: 'CNC Laser Cutting & Sheet Metal Fabricator', sectorId: 'sec-mfg', minNsqfLevel: 4, defaultSkillIds: ['sk-co2-laser-cut', 'sk-cad-cam'], averageSalaryINR: 300000, entryLevelOpenings: 190, description: 'Operate fiber lasers and press brakes for industrial enclosures.' },
    { id: 'jr-qa-metrology', title: 'Quality Assurance & CMM Metrology Inspector', sectorId: 'sec-mfg', minNsqfLevel: 5, defaultSkillIds: ['sk-cmm-inspect', 'sk-lean-sixsigma'], averageSalaryINR: 390000, entryLevelOpenings: 140, description: 'Ensure part compliance using coordinate measuring machines and GD&T drawings.' },

    // Electronics
    { id: 'jr-smt-tech', title: 'SMT Line Technician & PCB Assembler', sectorId: 'sec-elec', minNsqfLevel: 4, defaultSkillIds: ['sk-smt-assembly', 'sk-cleanroom-sop'], averageSalaryINR: 280000, entryLevelOpenings: 290, description: 'Setup, maintain, and monitor high-speed PCB placement heads and reflow ovens.' },
    { id: 'jr-embedded-dev', title: 'Embedded Firmware Developer', sectorId: 'sec-elec', minNsqfLevel: 6, defaultSkillIds: ['sk-embedded-c', 'sk-pcb-design', 'sk-iot-sensor'], averageSalaryINR: 620000, entryLevelOpenings: 130, description: 'Write low-level device drivers and micro-controller algorithms for smart devices.' },
    { id: 'jr-iot-edge-eng', title: 'Industrial IoT Integration Specialist', sectorId: 'sec-elec', minNsqfLevel: 6, defaultSkillIds: ['sk-iot-sensor', 'sk-plc-scada', 'sk-python-data'], averageSalaryINR: 540000, entryLevelOpenings: 105, description: 'Connect factory edge sensors to central dashboards and cloud telemetry.' },
    { id: 'jr-solar-tech', title: 'Solar PV & Rooftop Installation Technician', sectorId: 'sec-elec', minNsqfLevel: 4, defaultSkillIds: ['sk-solar-pv-install', 'sk-industrial-safety'], averageSalaryINR: 290000, entryLevelOpenings: 175, description: 'Mount solar modules, wire micro-inverters, and synchronize with the electrical grid.' },

    // IT & Software
    { id: 'jr-fullstack-dev', title: 'Full-Stack Web Software Engineer', sectorId: 'sec-it', minNsqfLevel: 6, defaultSkillIds: ['sk-fullstack-ts', 'sk-sql-rdbms', 'sk-agile-scrum'], averageSalaryINR: 680000, entryLevelOpenings: 410, description: 'Develop web portals, responsive user experiences, and REST/GraphQL APIs.' },
    { id: 'jr-devops-eng', title: 'DevOps & Cloud Infrastructure Engineer', sectorId: 'sec-it', minNsqfLevel: 7, defaultSkillIds: ['sk-cloud-devops', 'sk-cyber-soc'], averageSalaryINR: 820000, entryLevelOpenings: 220, description: 'Manage containerized clusters, automated pipelines, and cloud reliability.' },
    { id: 'jr-data-analyst', title: 'Data Analyst & Business Intelligence Specialist', sectorId: 'sec-it', minNsqfLevel: 6, defaultSkillIds: ['sk-python-data', 'sk-sql-rdbms', 'sk-financial-model'], averageSalaryINR: 560000, entryLevelOpenings: 280, description: 'Extract insights from large enterprise datasets and build operational KPI dashboards.' },
    { id: 'jr-cyber-analyst', title: 'SOC Cybersecurity Defense Analyst', sectorId: 'sec-it', minNsqfLevel: 6, defaultSkillIds: ['sk-cyber-soc', 'sk-cloud-devops'], averageSalaryINR: 640000, entryLevelOpenings: 150, description: 'Monitor enterprise network traffic, investigate breaches, and enforce zero-trust policies.' },
    { id: 'jr-qa-automation-eng', title: 'QA Automation & Test Engineer', sectorId: 'sec-it', minNsqfLevel: 5, defaultSkillIds: ['sk-qa-automation', 'sk-fullstack-ts'], averageSalaryINR: 480000, entryLevelOpenings: 190, description: 'Author test scripts for web apps and backend services to ensure release stability.' },

    // Healthcare
    { id: 'jr-biomed-eng', title: 'Biomedical Equipment Maintenance Engineer', sectorId: 'sec-health', minNsqfLevel: 6, defaultSkillIds: ['sk-biomed-equip', 'sk-radiology-assist'], averageSalaryINR: 420000, entryLevelOpenings: 110, description: 'Maintain critical hospital equipment, dialysis machines, and ICU monitors.' },
    { id: 'jr-emt-responder', title: 'Emergency Medical Technician & Ambulance Specialist', sectorId: 'sec-health', minNsqfLevel: 5, defaultSkillIds: ['sk-emergency-med', 'sk-sterile-proc'], averageSalaryINR: 310000, entryLevelOpenings: 160, description: 'Provide urgent pre-hospital trauma care and triage during transit.' },
    { id: 'jr-cssd-tech', title: 'Central Sterile Supply (CSSD) Supervisor', sectorId: 'sec-health', minNsqfLevel: 4, defaultSkillIds: ['sk-sterile-proc', 'sk-industrial-safety'], averageSalaryINR: 270000, entryLevelOpenings: 130, description: 'Manage infection control and surgical tray autoclaving in acute care hospitals.' },
    { id: 'jr-pharma-qa', title: 'Pharma Production & GMP Compliance Officer', sectorId: 'sec-health', minNsqfLevel: 5, defaultSkillIds: ['sk-pharma-gmp', 'sk-lean-sixsigma'], averageSalaryINR: 380000, entryLevelOpenings: 140, description: 'Ensure cleanroom compliance and FDA batch documentation in pharmaceutical plants.' },

    // Logistics
    { id: 'jr-warehouse-supervisor', title: 'Smart Warehouse Operations Supervisor', sectorId: 'sec-logistics', minNsqfLevel: 5, defaultSkillIds: ['sk-wms-rfid', 'sk-lean-sixsigma', 'sk-industrial-safety'], averageSalaryINR: 390000, entryLevelOpenings: 210, description: 'Supervise automated picking, inbound sorting, and pallet scanning operations.' },
    { id: 'jr-forklift-reach', title: 'MHE Reach Truck & Heavy Forklift Operator', sectorId: 'sec-logistics', minNsqfLevel: 3, defaultSkillIds: ['sk-forklift-op', 'sk-industrial-safety'], averageSalaryINR: 250000, entryLevelOpenings: 310, description: 'Operate narrow-aisle battery reach trucks and stack pallets up to 12 meters.' },
    { id: 'jr-cold-chain-tech', title: 'Cold Storage & Vaccine Logistics Coordinator', sectorId: 'sec-logistics', minNsqfLevel: 4, defaultSkillIds: ['sk-cold-chain', 'sk-wms-rfid'], averageSalaryINR: 330000, entryLevelOpenings: 95, description: 'Manage temperature-controlled reefers and deep-freeze biological inventory.' },
    { id: 'jr-fleet-dispatcher', title: 'Commercial Fleet Telematics Dispatcher', sectorId: 'sec-logistics', minNsqfLevel: 5, defaultSkillIds: ['sk-fleet-telematics', 'sk-python-data'], averageSalaryINR: 340000, entryLevelOpenings: 120, description: 'Optimize cross-state freight routes and monitor driver safety performance.' },

    // Banking & Finance
    { id: 'jr-aml-investigator', title: 'AML & Digital KYC Verification Specialist', sectorId: 'sec-bfsi', minNsqfLevel: 5, defaultSkillIds: ['sk-aml-kyc', 'sk-digital-banking-ops'], averageSalaryINR: 410000, entryLevelOpenings: 260, description: 'Investigate transaction alerts, flag suspicious funds, and review customer identity documents.' },
    { id: 'jr-sme-credit-analyst', title: 'SME Commercial Credit Underwriter', sectorId: 'sec-bfsi', minNsqfLevel: 6, defaultSkillIds: ['sk-credit-underwrite', 'sk-financial-model', 'sk-tally-prime'], averageSalaryINR: 520000, entryLevelOpenings: 180, description: 'Appraise business financials, balance sheets, and cash flows for working capital loans.' },
    { id: 'jr-gst-accountant', title: 'GST Compliance & Accounts Executive', sectorId: 'sec-bfsi', minNsqfLevel: 4, defaultSkillIds: ['sk-tally-prime', 'sk-financial-model'], averageSalaryINR: 280000, entryLevelOpenings: 350, description: 'Prepare monthly GSTR-1/3B filings, reconcile vendor ledgers, and manage balance books.' },
    { id: 'jr-payment-recon', title: 'Fintech Payment Gateway Settlement Associate', sectorId: 'sec-bfsi', minNsqfLevel: 5, defaultSkillIds: ['sk-digital-banking-ops', 'sk-sql-rdbms'], averageSalaryINR: 380000, entryLevelOpenings: 170, description: 'Reconcile merchant payment charges, resolve chargebacks, and audit payment switches.' },

    // Retail
    { id: 'jr-retail-store-mgr', title: 'Omnichannel Retail Store Assistant Manager', sectorId: 'sec-retail', minNsqfLevel: 5, defaultSkillIds: ['sk-pos-billing', 'sk-visual-merchand', 'sk-omnichannel-fulfillment'], averageSalaryINR: 360000, entryLevelOpenings: 280, description: 'Manage floor sales, visual merchandise aesthetics, and in-store pick-up fulfillment.' },
    { id: 'jr-darkstore-lead', title: 'Quick-Commerce Dark Store Fulfillment Lead', sectorId: 'sec-retail', minNsqfLevel: 4, defaultSkillIds: ['sk-omnichannel-fulfillment', 'sk-wms-rfid'], averageSalaryINR: 310000, entryLevelOpenings: 390, description: 'Ensure under-10-minute order picking and dispatch from micro-fulfillment hubs.' },
    { id: 'jr-visual-merchandiser', title: 'Visual Merchandising & Display Executive', sectorId: 'sec-retail', minNsqfLevel: 4, defaultSkillIds: ['sk-visual-merchand', 'sk-customer-service'], averageSalaryINR: 290000, entryLevelOpenings: 140, description: 'Execute seasonal window displays, end-cap merchandising, and brand guidelines.' }
  ];

  // 8. 52 Employers Across Maharashtra
  const employerNames = [
    { name: 'Tata Motors Powertrain Ltd.', sector: 'sec-auto', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Bajaj Auto Precision Division', sector: 'sec-auto', dist: 'dist-aurangabad', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Mahindra & Mahindra Auto Farm', sector: 'sec-auto', dist: 'dist-nashik', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Bharat Forge Advanced Machining', sector: 'sec-mfg', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Kirloskar Oil Engines Ltd.', sector: 'sec-mfg', dist: 'dist-kolhapur', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Forbes Marshall Energy Systems', sector: 'sec-mfg', dist: 'dist-pune', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Thermax Clean Power Solutions', sector: 'sec-mfg', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'MOU Signed' },
    { name: 'Godrej & Boyce Precision Tools', sector: 'sec-mfg', dist: 'dist-mumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Siemens Industrial Automation Hub', sector: 'sec-elec', dist: 'dist-navimumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Foxconn Electronic Assemblies', sector: 'sec-elec', dist: 'dist-navimumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Schneider Electric Smart Plant', sector: 'sec-elec', dist: 'dist-nashik', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Endress+Hauser Flow Systems', sector: 'sec-elec', dist: 'dist-aurangabad', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Tata Consultancy Services (TCS)', sector: 'sec-it', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Infosys Hinjewadi Software Campus', sector: 'sec-it', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Wipro Technologies SEZ', sector: 'sec-it', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'MOU Signed' },
    { name: 'Tech Mahindra MIHAN Center', sector: 'sec-it', dist: 'dist-nagpur', size: 'Large Enterprise (1000+)', tier: 'MOU Signed' },
    { name: 'Persistent Systems Data Solutions', sector: 'sec-it', dist: 'dist-nagpur', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Jio Platforms Cloud & 5G Labs', sector: 'sec-it', dist: 'dist-navimumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'LTI Mindtree Digital Engineering', sector: 'sec-it', dist: 'dist-mumbai', size: 'Large Enterprise (1000+)', tier: 'Standard' },
    { name: 'Cipla Active Pharmaceutical Ingredients', sector: 'sec-health', dist: 'dist-aurangabad', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Lupin Pharma Formulations Facility', sector: 'sec-health', dist: 'dist-nagpur', size: 'Large Enterprise (1000+)', tier: 'MOU Signed' },
    { name: 'Serum Institute Vaccine Manufacturing', sector: 'sec-health', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Fortis Hiranandani Healthcare', sector: 'sec-health', dist: 'dist-navimumbai', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Jupiter Lifeline Hospitals', sector: 'sec-health', dist: 'dist-thane', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Deenanath Mangeshkar Super Specialty', sector: 'sec-health', dist: 'dist-pune', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'HDFC Bank Operations & Tech Hub', sector: 'sec-bfsi', dist: 'dist-mumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'ICICI Bank Regional Processing Center', sector: 'sec-bfsi', dist: 'dist-thane', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Kotak Mahindra Commercial Banking', sector: 'sec-bfsi', dist: 'dist-mumbai', size: 'Large Enterprise (1000+)', tier: 'Standard' },
    { name: 'Bajaj Finserv Consumer Lending', sector: 'sec-bfsi', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'SBI Central Credit Processing Unit', sector: 'sec-bfsi', dist: 'dist-nagpur', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'DP World JNPA Multimodal Logistics', sector: 'sec-logistics', dist: 'dist-navimumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Concor Inland Container Depot', sector: 'sec-logistics', dist: 'dist-nagpur', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Mahindra Logistics Supply Chain Park', sector: 'sec-logistics', dist: 'dist-pune', size: 'Enterprise (250-1000)', tier: 'Strategic Partner' },
    { name: 'Delhivery Mega Gateway Facility', sector: 'sec-logistics', dist: 'dist-thane', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Blue Dart Aviation & Cargo Station', sector: 'sec-logistics', dist: 'dist-mumbai', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Reliance Retail Omnichannel Fulfillment', sector: 'sec-retail', dist: 'dist-navimumbai', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'DMart (Avenue Supermarts Hub)', sector: 'sec-retail', dist: 'dist-thane', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Shoppers Stop Flagship & Logistics', sector: 'sec-retail', dist: 'dist-mumbai', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Tata Trent Westside Operations', sector: 'sec-retail', dist: 'dist-pune', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Blinkit Quick-Commerce Micro-Hub', sector: 'sec-retail', dist: 'dist-pune', size: 'Mid-size (50-250)', tier: 'Standard' },
    { name: 'Zepto Instant Delivery Hub', sector: 'sec-retail', dist: 'dist-mumbai', size: 'Mid-size (50-250)', tier: 'Standard' },
    { name: 'Menon & Menon Foundry Engineering', sector: 'sec-mfg', dist: 'dist-kolhapur', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Ghatge Patil Industries Heavy Castings', sector: 'sec-mfg', dist: 'dist-kolhapur', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Cooper Corporation Powertrains', sector: 'sec-mfg', dist: 'dist-satara', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Mutha Founders Precision Components', sector: 'sec-mfg', dist: 'dist-satara', size: 'Mid-size (50-250)', tier: 'Standard' },
    { name: 'Precision Camshafts Ltd. (PCL)', sector: 'sec-auto', dist: 'dist-solapur', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Venkateshwara Solar Power EPC', sector: 'sec-elec', dist: 'dist-solapur', size: 'Mid-size (50-250)', tier: 'Standard' },
    { name: 'Bosch Chassis Systems India', sector: 'sec-auto', dist: 'dist-pune', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Lear Automotive Seating & Wire', sector: 'sec-auto', dist: 'dist-pune', size: 'Enterprise (250-1000)', tier: 'Standard' },
    { name: 'Varroc Engineering Electricals', sector: 'sec-auto', dist: 'dist-aurangabad', size: 'Large Enterprise (1000+)', tier: 'Strategic Partner' },
    { name: 'Badve Engineering Press Shop', sector: 'sec-auto', dist: 'dist-aurangabad', size: 'Enterprise (250-1000)', tier: 'MOU Signed' },
    { name: 'Crompton Greaves Power & Motors', sector: 'sec-elec', dist: 'dist-nashik', size: 'Enterprise (250-1000)', tier: 'Standard' }
  ];

  const employers: Employer[] = employerNames.map((e, idx) => ({
    id: `emp-${String(idx + 1).padStart(2, '0')}`,
    name: e.name,
    sectorId: e.sector,
    districtId: e.dist,
    companySize: e.size as Employer['companySize'],
    contactPerson: `HR Director / Recruitment Lead`,
    email: `careers@${e.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    phone: `+91 20 ${prng.range(25000000, 29999999)}`,
    address: `MIDC Industrial Zone, ${districts.find(d => d.id === e.dist)?.name || 'Maharashtra'}, India`,
    isVerified: true,
    tier: e.tier as Employer['tier']
  }));

  // 9. Generate 1,050 Realistic Job Postings (Requirement: at least 1,000)
  const jobs: Job[] = [];
  const educationPool = [
    'ITI Certificate (10th/12th + 2 Years)',
    'Diploma in Engineering (Polytechnic)',
    'B.Tech / B.E in Mechanical / Electronics / CS',
    'B.Sc / BCA / B.Com Graduate',
    'Higher Secondary (12th Vocational)'
  ];

  for (let i = 1; i <= 1050; i++) {
    // Pick role with realistic probability
    const role = prng.choice(jobRoles);
    // Pick employer (prefer matching sector, else fallback)
    const matchingEmployers = employers.filter(e => e.sectorId === role.sectorId);
    const employer = matchingEmployers.length > 0 ? prng.choice(matchingEmployers) : prng.choice(employers);
    
    // District distribution: 70% company home district, 30% neighboring hub
    const districtId = prng.next() < 0.7 ? employer.districtId : prng.choice(districts).id;
    
    // Openings: entry level roles have 1-8 openings, senior 1-3
    const openings = prng.range(1, 6);
    
    // Salary calculation with realistic variance around job role benchmark
    const salaryMultiplier = 0.85 + prng.next() * 0.4;
    const baseSalary = Math.round((role.averageSalaryINR * salaryMultiplier) / 10000) * 10000;
    const minSalary = baseSalary;
    const maxSalary = baseSalary + prng.range(40000, 150000);
    
    // Required skills: default role skills + 1-2 cross-cutting skills
    const roleSkills = [...role.defaultSkillIds];
    const extraSkillPool = skills.filter(s => s.sectorIds.includes(role.sectorId) && !roleSkills.includes(s.id));
    if (extraSkillPool.length > 0 && prng.next() > 0.4) {
      roleSkills.push(prng.choice(extraSkillPool).id);
    }
    // Add quality or safety skill occasionally
    if (prng.next() > 0.6 && !roleSkills.includes('sk-industrial-safety')) {
      roleSkills.push('sk-industrial-safety');
    }

    const jobSkillRequirements: JobSkillRequirement[] = roleSkills.map((skId, idx) => ({
      skillId: skId,
      importance: idx === 0 ? 'critical' : (prng.next() > 0.3 ? 'critical' : 'preferred'),
      minProficiency: role.minNsqfLevel >= 6 ? 'advanced' : (role.minNsqfLevel >= 5 ? 'intermediate' : 'basic')
    }));

    // Posted date within last 90 days
    const daysAgo = prng.range(1, 90);
    const dateObj = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    jobs.push({
      id: `job-${String(i).padStart(4, '0')}`,
      title: `${role.title}${prng.next() > 0.75 ? ' - Immediate Hiring' : ''}`,
      jobRoleId: role.id,
      employerId: employer.id,
      sectorId: role.sectorId,
      districtId: districtId,
      openings: openings,
      minSalaryINR: minSalary,
      maxSalaryINR: maxSalary,
      experienceRequiredYears: prng.choice([0, 0, 1, 1, 2, 3, 4]),
      requiredSkills: jobSkillRequirements,
      educationRequired: prng.choice(educationPool),
      description: `We are hiring for ${role.title} at our ${districts.find(d => d.id === districtId)?.name} operational center. Candidate will work with ${employer.name} and execute duties including ${role.description}`,
      status: prng.next() > 0.15 ? 'active' : 'filled',
      postedDate: dateObj.toISOString(),
      isRemoteFriendly: role.sectorId === 'sec-it' ? prng.next() > 0.3 : false,
      employmentType: prng.choice(['Full-time', 'Full-time', 'Apprenticeship', 'Contract']),
      source: 'Simulated Industry Data'
    });
  }

  // 10. Training Institutes (14 premier ITIs and Polytechnics across Maharashtra)
  const institutes: TrainingInstitute[] = [
    { id: 'inst-01', name: 'Government ITI Aundh (Centre of Excellence)', type: 'Government ITI', districtId: 'dist-pune', address: 'Aundh Road, Ganeshkhind, Pune 411007', accreditationRating: 'A+', totalCapacitySeats: 1200, principalContact: 'Dr. S. K. Mahajan', email: 'principal@itiaundh-pune.ac.in', phone: '+91 20 25691010', establishedYear: 1964 },
    { id: 'inst-02', name: 'Government ITI Mumbai Central', type: 'Government ITI', districtId: 'dist-mumbai', address: 'Agripada, Mumbai Central 400011', accreditationRating: 'A+', totalCapacitySeats: 1400, principalContact: 'Prof. Vinayak Gore', email: 'principal@itimumbai.ac.in', phone: '+91 22 23075544', establishedYear: 1952 },
    { id: 'inst-03', name: 'Government Polytechnic Nagpur', type: 'Polytechnic Institute', districtId: 'dist-nagpur', address: 'Mangalwari Bazar, Sadar, Nagpur 440001', accreditationRating: 'A', totalCapacitySeats: 950, principalContact: 'Dr. M. B. Daigavane', email: 'principal@gpnagpur.ac.in', phone: '+91 712 2564483', establishedYear: 1914 },
    { id: 'inst-04', name: 'Government ITI Nashik (Auto Center)', type: 'Government ITI', districtId: 'dist-nashik', address: 'MIDC Ambad, Nashik 422010', accreditationRating: 'A', totalCapacitySeats: 850, principalContact: 'Shri. P. R. Joshi', email: 'iti.nashik@dvet.gov.in', phone: '+91 253 2381240', establishedYear: 1978 },
    { id: 'inst-05', name: 'Thane District Skill Development Center', type: 'MSDC Skill Center', districtId: 'dist-thane', address: 'Wagle Estate, Road No. 16, Thane 400604', accreditationRating: 'B+', totalCapacitySeats: 600, principalContact: 'Smt. Kavita Sawant', email: 'thane.msdc@mahasiksha.gov.in', phone: '+91 22 25829100', establishedYear: 2018 },
    { id: 'inst-06', name: 'Government ITI Chhatrapati Sambhajinagar', type: 'Government ITI', districtId: 'dist-aurangabad', address: 'Railway Station Road, Sambhajinagar 431005', accreditationRating: 'A', totalCapacitySeats: 800, principalContact: 'Dr. Nitin Kulkarni', email: 'iti.aurangabad@dvet.gov.in', phone: '+91 240 2331560', establishedYear: 1968 },
    { id: 'inst-07', name: 'Shivaji Polytechnic & Foundry Skills Lab', type: 'Polytechnic Institute', districtId: 'dist-kolhapur', address: 'Shiroli MIDC, Kolhapur 416122', accreditationRating: 'A', totalCapacitySeats: 700, principalContact: 'Prof. Rajendra Patil', email: 'principal@shivajipoly.org', phone: '+91 231 2605050', establishedYear: 1983 },
    { id: 'inst-08', name: 'Navi Mumbai Advanced Tech Skill Academy', type: 'MSDC Skill Center', districtId: 'dist-navimumbai', address: 'Sector 15, Belapur, Navi Mumbai 400614', accreditationRating: 'A+', totalCapacitySeats: 900, principalContact: 'Dr. Anita Roy', email: 'academy@navimumbaiskill.org', phone: '+91 22 27578900', establishedYear: 2020 },
    { id: 'inst-09', name: 'Government ITI Satara', type: 'Government ITI', districtId: 'dist-satara', address: 'Old MIDC Area, Satara 415004', accreditationRating: 'B+', totalCapacitySeats: 550, principalContact: 'Shri. Ashok Chavan', email: 'iti.satara@dvet.gov.in', phone: '+91 2162 244120', establishedYear: 1974 },
    { id: 'inst-10', name: 'Solapur Technical Skill Institute', type: 'Polytechnic Institute', districtId: 'dist-solapur', address: 'Akkalkot Road MIDC, Solapur 413006', accreditationRating: 'B+', totalCapacitySeats: 650, principalContact: 'Dr. Suresh Birajdar', email: 'solapurtech@dvet.gov.in', phone: '+91 217 2651400', establishedYear: 1989 },
    { id: 'inst-11', name: 'Tata IIS (Indian Institute of Skills) Chembur', type: 'Private Training Partner', districtId: 'dist-mumbai', address: 'Chembur East, Mumbai 400071', accreditationRating: 'A+', totalCapacitySeats: 800, principalContact: 'Capt. Pradeep Menon', email: 'admissions@tataiismumbai.org', phone: '+91 22 61234500', establishedYear: 2021 },
    { id: 'inst-12', name: 'Pimpri-Chinchwad Polytechnic Auto Lab', type: 'Polytechnic Institute', districtId: 'dist-pune', address: 'Sector 26, Pradhikaran, Nigdi, Pune 411044', accreditationRating: 'A', totalCapacitySeats: 1100, principalContact: 'Prof. S. B. Sanap', email: 'pcpolytechnic@pccoepune.org', phone: '+91 20 27655155', establishedYear: 1990 }
  ];

  // 11. 24 Accredited Courses (Requirement: at least 20) with Rich Modules
  const courseTemplates = [
    {
      code: 'CRS-AUTO-EV-01',
      title: 'Advanced Certificate in Electric Vehicle Service & BMS Diagnostics',
      sectorId: 'sec-auto',
      nsqf: 5,
      hours: 720,
      targetRole: 'jr-ev-tech',
      skills: [
        { id: 'sk-ev-battery', prof: 'advanced', prac: 240, theo: 80 },
        { id: 'sk-ev-powertrain', prof: 'intermediate', prac: 180, theo: 60 },
        { id: 'sk-auto-diag', prof: 'intermediate', prac: 120, theo: 40 }
      ],
      modules: [
        { num: 1, title: 'EV High-Voltage Safety & Personal Protection', desc: 'Arc-flash risks, de-energization protocols, and OSHA PPE compliance.', hrs: 60, skills: ['sk-industrial-safety'], outdated: false },
        { num: 2, title: 'Li-ion Battery Cell Chemistry & BMS Tuning', desc: 'Thermal runaway prevention, state-of-charge algorithms, and CAN bus calibration.', hrs: 220, skills: ['sk-ev-battery'], outdated: false },
        { num: 3, title: 'Permanent Magnet Synchronous Motor & Inverter Servicing', desc: 'Drivetrain teardown, resolver alignment, and regenerative braking diagnostics.', hrs: 240, skills: ['sk-ev-powertrain'], outdated: false },
        { num: 4, title: 'Traditional Carburetor Tuning & Lead-Acid Servicing', desc: 'Legacy carburetor cleaning and lead-acid topup (Outdated syllabus module).', hrs: 80, skills: ['sk-lead-acid-battery'], outdated: true, suggestedRevision: 'Replace with Advanced EV Thermal Cooling Loops & CCS2 Fast Charger Interfacing.' }
      ]
    },
    {
      code: 'CRS-MFG-CNC-01',
      title: 'Diploma in 5-Axis CNC Precision Machining & CAD/CAM',
      sectorId: 'sec-mfg',
      nsqf: 5,
      hours: 960,
      targetRole: 'jr-cnc-operator',
      skills: [
        { id: 'sk-cnc-prog', prof: 'advanced', prac: 380, theo: 120 },
        { id: 'sk-cad-cam', prof: 'intermediate', prac: 200, theo: 80 },
        { id: 'sk-cmm-inspect', prof: 'intermediate', prac: 120, theo: 60 }
      ],
      modules: [
        { num: 1, title: 'Engineering Drawings & GD&T Standard Interpretation', desc: 'Geometric dimensioning, tolerances, and datum coordinate systems.', hrs: 120, skills: ['sk-cmm-inspect'], outdated: false },
        { num: 2, title: 'Multi-Axis CNC Programming (Siemens & Fanuc G-Code)', desc: 'Tool offsets, canned cycles, 5-axis simultaneous milling strategies.', hrs: 360, skills: ['sk-cnc-prog'], outdated: false },
        { num: 3, title: 'SolidWorks & MasterCAM Surface Modeling', desc: 'Importing parasolids, generating cutter paths, and collision simulation.', hrs: 240, skills: ['sk-cad-cam'], outdated: false },
        { num: 4, title: 'Manual Shaping Machine & Hacksaw Operation', desc: 'Traditional manual shaping and manual reciprocating metal saws.', hrs: 120, skills: ['sk-manual-lathe'], outdated: true, suggestedRevision: 'Replace with CNC Fiber Laser Cutting Nesting & Additive Manufacturing basics.' }
      ]
    },
    {
      code: 'CRS-IT-CLOUD-01',
      title: 'Full-Stack Software Engineering & DevOps Cloud Bootcamp',
      sectorId: 'sec-it',
      nsqf: 6,
      hours: 800,
      targetRole: 'jr-fullstack-dev',
      skills: [
        { id: 'sk-fullstack-ts', prof: 'advanced', prac: 320, theo: 100 },
        { id: 'sk-cloud-devops', prof: 'intermediate', prac: 180, theo: 60 },
        { id: 'sk-sql-rdbms', prof: 'intermediate', prac: 100, theo: 40 }
      ],
      modules: [
        { num: 1, title: 'Modern TypeScript, React 19 & Component Architecture', desc: 'Asynchronous state, component trees, Tailwind CSS, and DOM rendering.', hrs: 260, skills: ['sk-fullstack-ts'], outdated: false },
        { num: 2, title: 'Microservices with Node.js & Relational Postgres DB', desc: 'REST APIs, indexing, transaction isolation, and ORM query optimization.', hrs: 200, skills: ['sk-sql-rdbms'], outdated: false },
        { num: 3, title: 'Docker Containers & Cloud Deployment (Kubernetes)', desc: 'Container builds, ingress controllers, CI/CD pipelines, and secret management.', hrs: 220, skills: ['sk-cloud-devops'], outdated: false },
        { num: 4, title: 'jQuery, Apache Ant & FTP Server Hosting', desc: 'Legacy DOM scripting and manual FTP file transfer methods.', hrs: 60, skills: [], outdated: true, suggestedRevision: 'Replace with Serverless Edge Functions & Automated Security Auditing.' }
      ]
    },
    {
      code: 'CRS-AUTO-HARNESS-01',
      title: 'Automotive Electrical Wiring Harness & ECU Technician',
      sectorId: 'sec-auto',
      nsqf: 4,
      hours: 600,
      targetRole: 'jr-auto-wire',
      skills: [
        { id: 'sk-wire-harness', prof: 'advanced', prac: 280, theo: 80 },
        { id: 'sk-auto-diag', prof: 'basic', prac: 120, theo: 40 },
        { id: 'sk-industrial-safety', prof: 'intermediate', prac: 50, theo: 30 }
      ],
      modules: [
        { num: 1, title: 'Automotive Schematics & Terminal Crimping Practice', desc: 'Connector pin extraction, ultrasonic wire splicing, and pull-force testing.', hrs: 260, skills: ['sk-wire-harness'], outdated: false },
        { num: 2, title: 'CAN-Bus Network Scanning & Multimeter Fault Isolation', desc: 'Resistance checks, oscilloscope bus signals, and fuse box mapping.', hrs: 200, skills: ['sk-auto-diag'], outdated: false },
        { num: 3, title: 'Traditional Dynamo & Starter Motor Overhaul', desc: 'Carbon brush replacement on legacy tractor dynamos.', hrs: 80, skills: [], outdated: true, suggestedRevision: 'Replace with High-Voltage Interlock Loop (HVIL) and Shielded EV Cables.' }
      ]
    },
    {
      code: 'CRS-ELEC-SMT-01',
      title: 'Surface Mount Technology (SMT) & PCB Assembly Line Lead',
      sectorId: 'sec-elec',
      nsqf: 4,
      hours: 640,
      targetRole: 'jr-smt-tech',
      skills: [
        { id: 'sk-smt-assembly', prof: 'advanced', prac: 300, theo: 100 },
        { id: 'sk-cleanroom-sop', prof: 'intermediate', prac: 100, theo: 40 },
        { id: 'sk-lean-sixsigma', prof: 'basic', prac: 60, theo: 40 }
      ],
      modules: [
        { num: 1, title: 'SMT Stencil Printing & Automatic Optical Inspection (AOI)', desc: 'Solder paste height inspection, solder bridging detection, and nozzle calibration.', hrs: 240, skills: ['sk-smt-assembly'], outdated: false },
        { num: 2, title: 'Cleanroom Protocols & Electrostatic Discharge (ESD) Protection', desc: 'Class 10,000 cleanroom behavior, wrist-strap logging, and ionizing blowers.', hrs: 180, skills: ['sk-cleanroom-sop'], outdated: false },
        { num: 3, title: 'Through-Hole Dip Soldering Pot Servicing', desc: 'Manual lead-tin wave soldering pots with manual flux dipping.', hrs: 100, skills: [], outdated: true, suggestedRevision: 'Replace with RoHS-Compliant Lead-Free Nitrogen Reflow & X-Ray BGA Inspection.' }
      ]
    },
    {
      code: 'CRS-ELEC-IOT-01',
      title: 'Industrial IoT Integration & Smart Sensor Programming',
      sectorId: 'sec-elec',
      nsqf: 6,
      hours: 720,
      targetRole: 'jr-iot-edge-eng',
      skills: [
        { id: 'sk-iot-sensor', prof: 'advanced', prac: 280, theo: 90 },
        { id: 'sk-embedded-c', prof: 'intermediate', prac: 180, theo: 60 },
        { id: 'sk-python-data', prof: 'intermediate', prac: 80, theo: 30 }
      ],
      modules: [
        { num: 1, title: 'Industrial Sensor Interfacing (4-20mA, Modbus RTU)', desc: 'Pressure transducers, RTD thermal probes, and serial RS485 communication.', hrs: 240, skills: ['sk-iot-sensor'], outdated: false },
        { num: 2, title: 'Embedded Firmware in C & FreeRTOS Microcontroller Tasks', desc: 'Interrupt service routines, watchdog timers, and low-power sleep modes.', hrs: 240, skills: ['sk-embedded-c'], outdated: false },
        { num: 3, title: 'MQTT Telemetry Broker & Edge Time-Series Logging', desc: 'Publish-subscribe messaging, JSON payloads, and cloud ingestion.', hrs: 160, skills: ['sk-python-data'], outdated: false }
      ]
    },
    {
      code: 'CRS-LOG-WAREHOUSE-01',
      title: 'Certificate in Modern WMS & Smart Logistics Management',
      sectorId: 'sec-logistics',
      nsqf: 4,
      hours: 500,
      targetRole: 'jr-warehouse-supervisor',
      skills: [
        { id: 'sk-wms-rfid', prof: 'advanced', prac: 220, theo: 80 },
        { id: 'sk-lean-sixsigma', prof: 'intermediate', prac: 80, theo: 40 },
        { id: 'sk-industrial-safety', prof: 'intermediate', prac: 50, theo: 30 }
      ],
      modules: [
        { num: 1, title: 'Automated Inbound Palletization & RFID Gate Scanners', desc: 'Dock scheduling, ASN verification, cross-docking, and RFID tunnel antennas.', hrs: 200, skills: ['sk-wms-rfid'], outdated: false },
        { num: 2, title: 'Warehouse Safety, Hazardous Chemical Segregation & 5S', desc: 'Spill containment kits, battery charging room safety, and aisle markings.', hrs: 140, skills: ['sk-industrial-safety'], outdated: false },
        { num: 3, title: 'Physical Card-Index Bin Ledger Filing', desc: 'Manual pen-and-paper bin-card tracking and duplicate dispatch slips.', hrs: 80, skills: [], outdated: true, suggestedRevision: 'Replace with AI Warehouse Pick-Path Optimization & Handheld Terminal (HHT) SAP WMS.' }
      ]
    },
    {
      code: 'CRS-LOG-COLD-01',
      title: 'Certificate in Cold Chain Logistics & Pharma Temperature Compliance',
      sectorId: 'sec-logistics',
      nsqf: 4,
      hours: 480,
      targetRole: 'jr-cold-chain-tech',
      skills: [
        { id: 'sk-cold-chain', prof: 'advanced', prac: 240, theo: 80 },
        { id: 'sk-wms-rfid', prof: 'intermediate', prac: 100, theo: 30 },
        { id: 'sk-dg-cargo', prof: 'basic', prac: 40, theo: 20 }
      ],
      modules: [
        { num: 1, title: 'Temperature Data Loggers, Phase Change Materials & Reefers', desc: '2-8°C vaccine cold chain, dry ice -70°C handling, and data logger validation.', hrs: 220, skills: ['sk-cold-chain'], outdated: false },
        { num: 2, title: 'WHO GDP & USFDA Cold Chain Regulatory Standards', desc: 'SOP compliance, excursion reporting, and calibration certification.', hrs: 160, skills: ['sk-dg-cargo'], outdated: false }
      ]
    },
    {
      code: 'CRS-HLTH-BIOMED-01',
      title: 'Advanced Diploma in Biomedical Instrumentation & Hospital Systems',
      sectorId: 'sec-health',
      nsqf: 6,
      hours: 900,
      targetRole: 'jr-biomed-eng',
      skills: [
        { id: 'sk-biomed-equip', prof: 'advanced', prac: 380, theo: 140 },
        { id: 'sk-radiology-assist', prof: 'intermediate', prac: 160, theo: 60 },
        { id: 'sk-sterile-proc', prof: 'basic', prac: 80, theo: 40 }
      ],
      modules: [
        { num: 1, title: 'ICU Ventilator & Dialysis Machine Calibration Protocols', desc: 'Pressure transducers, oxygen blenders, flow sensor calibration, and safety testing.', hrs: 320, skills: ['sk-biomed-equip'], outdated: false },
        { num: 2, title: 'Defibrillator & Patient Monitor Electrical Safety Standards (IEC 60601)', desc: 'Chassis leakage current, pacemaker interference, and battery backup integrity.', hrs: 260, skills: ['sk-biomed-equip'], outdated: false },
        { num: 3, title: 'Mercury Sphygmomanometer & Glass Thermometer Repair', desc: 'Manual mercury column refill and glass thermometer shaking calibration.', hrs: 90, skills: [], outdated: true, suggestedRevision: 'Replace with Digital Non-Invasive Tele-monitoring & Wireless Patient Telemetry.' }
      ]
    },
    {
      code: 'CRS-HLTH-PHARMA-01',
      title: 'Certificate in Pharma Cleanroom GMP & Quality Assurance',
      sectorId: 'sec-health',
      nsqf: 5,
      hours: 600,
      targetRole: 'jr-pharma-qa',
      skills: [
        { id: 'sk-pharma-gmp', prof: 'advanced', prac: 260, theo: 100 },
        { id: 'sk-sterile-proc', prof: 'intermediate', prac: 120, theo: 50 },
        { id: 'sk-lean-sixsigma', prof: 'basic', prac: 50, theo: 20 }
      ],
      modules: [
        { num: 1, title: 'Cleanroom Gowning, Airlock Operation & Environmental Monitoring', desc: 'Laminar air flow benches, particle count monitoring, and HEPA filter integrity.', hrs: 240, skills: ['sk-pharma-gmp'], outdated: false },
        { num: 2, title: 'Batch Manufacturing Records (BMR) & Data Integrity (ALCOA+)', desc: 'Good documentation practice, audit trails, and deviations management.', hrs: 200, skills: ['sk-pharma-gmp'], outdated: false }
      ]
    },
    {
      code: 'CRS-BFSI-AML-01',
      title: 'Professional Certificate in AML/KYC & FinTech Digital Compliance',
      sectorId: 'sec-bfsi',
      nsqf: 5,
      hours: 500,
      targetRole: 'jr-aml-investigator',
      skills: [
        { id: 'sk-aml-kyc', prof: 'advanced', prac: 200, theo: 100 },
        { id: 'sk-digital-banking-ops', prof: 'intermediate', prac: 100, theo: 40 },
        { id: 'sk-financial-model', prof: 'basic', prac: 40, theo: 20 }
      ],
      modules: [
        { num: 1, title: 'Suspicious Transaction Reporting (STR) & Watchlist Screening', desc: 'Sanctions list matching, PEP screening, and beneficial ownership tracing.', hrs: 220, skills: ['sk-aml-kyc'], outdated: false },
        { num: 2, title: 'Digital Aadhaar e-KYC & Video KYC (V-CIP) RBI Regulations', desc: 'Biometric liveness detection, geo-tagging, and secure customer onboarding.', hrs: 160, skills: ['sk-digital-banking-ops'], outdated: false },
        { num: 3, title: 'Physical Signature Verification & Carbon Specimen Cards', desc: 'Manual card-drawer signature cross-matching for paper withdrawal slips.', hrs: 60, skills: ['sk-manual-bookkeeping'], outdated: true, suggestedRevision: 'Replace with AI-Driven Behavioral Biometrics & Transaction Anomaly Alerts.' }
      ]
    },
    {
      code: 'CRS-BFSI-GST-01',
      title: 'Diploma in Tally Prime, Indian GST & Commercial Accounts',
      sectorId: 'sec-bfsi',
      nsqf: 4,
      hours: 540,
      targetRole: 'jr-gst-accountant',
      skills: [
        { id: 'sk-tally-prime', prof: 'advanced', prac: 260, theo: 80 },
        { id: 'sk-financial-model', prof: 'intermediate', prac: 100, theo: 40 },
        { id: 'sk-aml-kyc', prof: 'basic', prac: 40, theo: 20 }
      ],
      modules: [
        { num: 1, title: 'Tally Prime Vouchers, E-Invoicing & E-Way Bill Generation', desc: 'Direct portal API integration, GST input tax credit (ITC) reconciliation.', hrs: 260, skills: ['sk-tally-prime'], outdated: false },
        { num: 2, title: 'Advanced Excel Financial Modeling & Pivot Tables', desc: 'VLOOKUP, XLOOKUP, Index-Match, conditional formatting, and dashboard charts.', hrs: 160, skills: ['sk-financial-model'], outdated: false },
        { num: 3, title: 'Manual Double-Entry Paper Ledger Red-Ink Balancing', desc: 'Writing physical journal entries in hardbound bahi-khata books.', hrs: 80, skills: ['sk-manual-bookkeeping'], outdated: true, suggestedRevision: 'Replace with Automated Bank Statement Cloud Reconciliation & OCR Invoice Parsing.' }
      ]
    }
  ];

  // Distribute templates across institutes to create 24 courses
  const courses: Course[] = [];
  let courseCounter = 1;

  institutes.forEach((inst, instIdx) => {
    // Each institute hosts 2 distinct courses matching district industrial profile
    const template1 = courseTemplates[(instIdx * 2) % courseTemplates.length];
    const template2 = courseTemplates[(instIdx * 2 + 1) % courseTemplates.length];

    [template1, template2].forEach((tpl, subIdx) => {
      const annualCapacity = prng.choice([60, 90, 120, 150]);
      const currentEnrolled = Math.round(annualCapacity * (0.75 + prng.next() * 0.22));
      const graduated = Math.round(annualCapacity * (0.65 + prng.next() * 0.25));

      // Compute health score dynamically based on outdated modules
      const totalModules = tpl.modules.length;
      const outdatedModules = tpl.modules.filter(m => m.outdated).length;
      // Raw penalty: each outdated module deducts 22%, up to base 98
      const healthScore = Math.max(35, Math.min(98, Math.round(98 - (outdatedModules / totalModules) * 45 - (prng.next() * 8))));

      const coveredSkills: CourseSkillCurriculum[] = tpl.skills.map(s => ({
        skillId: s.id,
        proficiencyGoal: s.prof as 'basic' | 'intermediate' | 'advanced',
        practicalHours: s.prac,
        theoryHours: s.theo
      }));

      const courseId = `crs-${String(courseCounter).padStart(3, '0')}`;
      const curriculumModules: CurriculumModule[] = tpl.modules.map((m, mIdx) => ({
        id: `mod-${courseId}-${mIdx + 1}`,
        courseId: courseId,
        moduleNumber: m.num,
        title: m.title,
        description: m.desc,
        durationHours: m.hrs,
        skillIds: m.skills,
        isOutdated: m.outdated,
        suggestedRevision: m.suggestedRevision,
        lastUpdated: m.outdated ? '2021-06-15' : '2025-08-20'
      }));

      courses.push({
        id: courseId,
        code: `${tpl.code}-${inst.districtId.substring(5, 8).toUpperCase()}`,
        title: `${tpl.title} (${inst.name.split(' ')[0]} ${inst.name.split(' ')[1] || ''})`,
        instituteId: inst.id,
        districtId: inst.districtId,
        sectorId: tpl.sectorId,
        nsqfLevel: tpl.nsqf,
        durationHours: tpl.hours,
        annualBatchCapacity: annualCapacity,
        currentEnrolled: currentEnrolled,
        graduatedLastYear: graduated,
        targetJobRoleId: tpl.targetRole,
        coveredSkills: coveredSkills,
        curriculumModules: curriculumModules,
        feeStructureINR: inst.type === 'Government ITI' ? 2400 : 28000,
        certificationBody: inst.type === 'Government ITI' ? 'NCVT / DGT Govt of India' : 'MSBTE (Maharashtra State Board of Tech Education)',
        healthScore: healthScore,
        lastCurriculumReviewDate: outdatedModules > 0 ? '2023-01-10' : '2025-07-15'
      });

      courseCounter++;
    });
  });

  // 12. Trainers
  const trainers: Trainer[] = institutes.flatMap((inst, idx) => [
    {
      id: `tr-${inst.id}-01`,
      name: `Er. ${['Sanjay', 'Pooja', 'Vikram', 'Meera', 'Anand', 'Deepak'][idx % 6]} ${['Jadhav', 'Kadam', 'More', 'Chavan', 'Bhosale', 'Gaikwad'][idx % 6]}`,
      instituteId: inst.id,
      email: `trainer1@${inst.id}.ac.in`,
      specializationSkillIds: ['sk-ev-battery', 'sk-cnc-prog', 'sk-fullstack-ts'].slice(0, 2),
      certifiedNsqfLevel: 6,
      yearsExperience: prng.range(5, 18),
      rating: +(4.2 + prng.next() * 0.7).toFixed(1)
    },
    {
      id: `tr-${inst.id}-02`,
      name: `Prof. ${['Shalini', 'Ganesh', 'Varsha', 'Sachin', 'Usha'][idx % 5]} ${['Pawar', 'Deshmukh', 'Mane', 'Shinde', 'Tambe'][idx % 5]}`,
      instituteId: inst.id,
      email: `trainer2@${inst.id}.ac.in`,
      specializationSkillIds: ['sk-plc-scada', 'sk-wms-rfid', 'sk-biomed-equip'].slice(0, 2),
      certifiedNsqfLevel: 7,
      yearsExperience: prng.range(8, 22),
      rating: +(4.4 + prng.next() * 0.6).toFixed(1)
    }
  ]);

  // 13. 120 Candidates (Requirement: at least 100)
  const candidateNames = [
    'Aditya Kadam', 'Pooja Shinde', 'Vishal More', 'Sneha Jadhav', 'Omkar Patil',
    'Aniket Salunkhe', 'Rutuja Deshmukh', 'Nikhil Gaikwad', 'Divya Mane', 'Sagar Chavan',
    'Akshay Pawar', 'Tejaswini Joshi', 'Prathamesh Gholap', 'Shruti Tambe', 'Abhishek Jagtap',
    'Kiran Mohite', 'Swati Nalawade', 'Suraj Dhumal', 'Manasi Bagal', 'Gaurav Thorat',
    'Harshada Bhise', 'Siddhesh Kulkarni', 'Mayuri Sawant', 'Sanket Kamble', 'Priyanka Shelar'
  ];

  const candidates: Candidate[] = [];
  for (let i = 1; i <= 120; i++) {
    const baseName = candidateNames[(i - 1) % candidateNames.length];
    const uniqueName = i > candidateNames.length ? `${baseName} ${Math.floor(i / candidateNames.length) + 1}` : baseName;
    const district = prng.choice(districts);
    const sector = prng.choice(sectors);
    const sectorRoles = jobRoles.filter(r => r.sectorId === sector.id);
    const targetRole = sectorRoles.length > 0 ? prng.choice(sectorRoles) : prng.choice(jobRoles);

    // Candidates have a subset of skills required by their target role + 1 random skill
    const targetSkills = targetRole.defaultSkillIds;
    // 0 to all skills acquired
    const skillCount = prng.range(1, Math.min(3, targetSkills.length));
    const currentSkills = prng.sample(targetSkills, skillCount);
    if (prng.next() > 0.5 && !currentSkills.includes('sk-industrial-safety')) {
      currentSkills.push('sk-industrial-safety');
    }

    // Status distribution
    const statusRoll = prng.next();
    let status: Candidate['status'] = 'seeking_job';
    if (statusRoll < 0.25) status = 'placed';
    else if (statusRoll < 0.55) status = 'in_training';
    else if (statusRoll < 0.70) status = 'upskilling';

    // Find nearby course if in training
    const nearbyCourse = courses.find(c => c.districtId === district.id && c.sectorId === sector.id) || courses[0];

    candidates.push({
      id: `cand-${String(i).padStart(3, '0')}`,
      name: uniqueName,
      email: `${uniqueName.toLowerCase().replace(/[^a-z]/g, '')}${i}@gmail.com`,
      phone: `+91 9${prng.range(800000000, 899999999)}`,
      districtId: district.id,
      educationLevel: prng.choice(['ITI Diploma', 'Polytechnic', '12th Pass', 'Graduate (Technical)']),
      targetSectorId: sector.id,
      targetJobRoleId: targetRole.id,
      currentSkillIds: Array.from(new Set(currentSkills)),
      experienceYears: prng.choice([0, 0, 0, 1, 2]),
      resumeBio: `Motivated candidate from ${district.name} specializing in ${sector.name}. Seeking to excel as ${targetRole.title}. Certified in hands-on workshop practices.`,
      status: status,
      enrolledCourseId: status === 'in_training' ? nearbyCourse.id : undefined,
      registrationDate: new Date(Date.now() - prng.range(15, 240) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }

  // 14. Training Capacity Records (10 Districts x 8 Sectors = 80 capacity cells)
  const trainingCapacity: TrainingCapacity[] = [];
  let capCounter = 1;

  districts.forEach(dist => {
    sectors.forEach(sec => {
      // Find courses in this district & sector
      const matchingCourses = courses.filter(c => c.districtId === dist.id && c.sectorId === sec.id);
      const activeCount = matchingCourses.length;
      const sanctioned = matchingCourses.reduce((sum, c) => sum + c.annualBatchCapacity, 0) || (activeCount === 0 ? prng.choice([0, 0, 45, 60]) : 120);
      const enrolled = Math.round(sanctioned * (0.65 + prng.next() * 0.3));
      const vacant = Math.max(0, sanctioned - enrolled);
      const utilPercent = sanctioned > 0 ? Math.round((enrolled / sanctioned) * 100) : 0;

      trainingCapacity.push({
        id: `cap-${String(capCounter).padStart(3, '0')}`,
        districtId: dist.id,
        sectorId: sec.id,
        totalSanctionedSeats: sanctioned,
        enrolledSeats: enrolled,
        vacantSeats: vacant,
        activeInstitutesCount: activeCount,
        utilizationPercentage: utilPercent,
        fiscalYear: 'FY 2025-26'
      });
      capCounter++;
    });
  });

  // 15. Employer Survey Records (52 Surveys, 1 per employer)
  const employerSurveys: EmployerSurvey[] = employers.map((emp, idx) => {
    // Relevant sector skills
    const secSkills = skills.filter(s => s.sectorIds.includes(emp.sectorId));
    const hardToFill = prng.sample(secSkills, Math.min(3, secSkills.length)).map(s => s.id);

    return {
      id: `srv-${String(idx + 1).padStart(3, '0')}`,
      employerId: emp.id,
      sectorId: emp.sectorId,
      districtId: emp.districtId,
      surveyDate: new Date(Date.now() - prng.range(5, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reportedHardToFillSkillIds: hardToFill,
      hiringDifficultyScale: prng.range(3, 5),
      plannedHiringNext6Months: prng.range(25, 180),
      emergingSkillComments: `Urgent requirement for certified hands-on technicians. Existing syllabus lacks modern industry standards and automated testing exposure.`,
      readinessRating: prng.range(2, 4) // Fresh graduate readiness out of 5
    };
  });

  // 16. Placements (160 Verified Placement Records)
  const placements: Placement[] = [];
  const placedCandidates = candidates.filter(c => c.status === 'placed');
  
  for (let i = 1; i <= 160; i++) {
    const cand = i <= placedCandidates.length ? placedCandidates[i - 1] : prng.choice(candidates);
    const course = prng.choice(courses);
    const matchingJobs = jobs.filter(j => j.sectorId === course.sectorId);
    const job = matchingJobs.length > 0 ? prng.choice(matchingJobs) : jobs[0];
    const employer = employers.find(e => e.id === job.employerId) || employers[0];

    const placedSalary = Math.round((job.minSalaryINR + prng.next() * (job.maxSalaryINR - job.minSalaryINR)) / 5000) * 5000;

    placements.push({
      id: `plc-${String(i).padStart(4, '0')}`,
      candidateId: cand.id,
      courseId: course.id,
      instituteId: course.instituteId,
      employerId: employer.id,
      jobId: job.id,
      placedSalaryINR: placedSalary,
      placementDate: new Date(Date.now() - prng.range(10, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      retentionMonths6: prng.next() > 0.15,
      employerFeedbackScore: prng.choice([4, 4, 5, 5, 3])
    });
  }

  // Construct Complete Persistent Payload
  const database: AppDatabase = {
    datasetMetadata: {
      title: 'SkillSync Maharashtra Industrial & Vocational Benchmark Dataset',
      version: '2.5.0-DEMO',
      type: 'Demo / Simulated Data',
      disclaimer: 'This dataset is simulated/demo data designed for benchmarking and algorithm validation; it does not claim to represent real Maharashtra labour-market statistics.',
      generatedAt: new Date().toISOString(),
      totalRecords: {
        jobs: jobs.length,
        skills: skills.length,
        jobRoles: jobRoles.length,
        districts: districts.length,
        sectors: sectors.length,
        courses: courses.length,
        employers: employers.length,
        candidates: candidates.length,
        placements: placements.length,
        surveys: employerSurveys.length,
        capacity: trainingCapacity.length
      }
    },
    users,
    roles,
    districts,
    sectors,
    skillCategories,
    skills,
    jobRoles,
    employers,
    jobs,
    institutes,
    courses,
    trainers,
    candidates,
    trainingCapacity,
    employerSurveys,
    placements,
    ingestionHistory: []
  };

  return database;
}
