import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'server', 'data', 'db.json');

export interface DBState {
  organizations: any[];
  subsidiaries: any[];
  business_units: any[];
  projects: any[];
  users: any[];
  roles: any[];
  reporting_periods: any[];
  environmental_data: any[];
  social_data: any[];
  governance_data: any[];
  brsr_sections: any[];
  brsr_principles: any[];
  brsr_indicators: any[];
  brsr_responses: any[];
  validation_rules: any[];
  validation_results: any[];
  approval_workflows: any[];
  approval_steps: any[];
  approval_actions: any[];
  documents: any[];
  sdg_goals: any[];
  esg_sdg_mapping: any[];
  reports: any[];
  audit_logs: any[];
  review_requests: any[];
  review_responses: any[];
  notifications: any[];
}

export function getInitialSeedData(): DBState {
  return {
    organizations: [
      {
        id: 'org-1',
        name: 'Apex Infrastructure Group Limited',
        cin: 'L99999MH2002PLC138924',
        incorporationYear: 2002,
        registeredOffice: 'Apex Tower, Bandra-Kurla Complex, Mumbai, Maharashtra - 400051',
        corporateAddress: 'Apex Global Centre, Outer Ring Road, Bengaluru, Karnataka - 560103',
        email: 'esg.compliance@apexinfratech.com',
        telephone: '+91 22 6988 5000',
        website: 'www.apexinfratech.com',
        financialYear: '2025-26',
        stockExchanges: 'NSE & BSE',
        paidUpCapital: '₹ 1,412.50 Cr',
        reportingBoundary: 'Consolidated (Top 1000 Listed Entities)',
        assuranceProvider: 'DNV Business Assurance India Pvt Ltd',
        assuranceType: 'Reasonable Assurance for BRSR Core'
      }
    ],
    subsidiaries: [
      {
        id: 'sub-1',
        orgId: 'org-1',
        name: 'Apex Heavy Engineering & Construction',
        code: 'AHEC',
        leadAdmin: 'Vikramaditya Patel',
        location: 'Mumbai & Vadodara',
        esgCompletion: 92,
        brsrCompletion: 88
      },
      {
        id: 'sub-2',
        orgId: 'org-1',
        name: 'Apex Smart Infrastructure & Urban Mobility',
        code: 'ASIUM',
        leadAdmin: 'Meera Krishnan',
        location: 'Bengaluru & Hyderabad',
        esgCompletion: 84,
        brsrCompletion: 79
      },
      {
        id: 'sub-3',
        orgId: 'org-1',
        name: 'Apex Green Energy & Utility Services',
        code: 'AGEUS',
        leadAdmin: 'Tariq Al-Mansoor',
        location: 'Jaipur & Ahmedabad',
        esgCompletion: 96,
        brsrCompletion: 94
      }
    ],
    business_units: [
      {
        id: 'bu-1',
        subsidiaryId: 'sub-1',
        name: 'Renewables & Power Transmission',
        headOfUnit: 'Sunita Rao',
        projectsCount: 4,
        esgCompletion: 94,
        brsrCompletion: 91
      },
      {
        id: 'bu-2',
        subsidiaryId: 'sub-1',
        name: 'Hydrocarbon & Heavy EPC',
        headOfUnit: 'Devendra Joshi',
        projectsCount: 3,
        esgCompletion: 86,
        brsrCompletion: 82
      },
      {
        id: 'bu-3',
        subsidiaryId: 'sub-2',
        name: 'Metro Rail & Transit Systems',
        headOfUnit: 'Karan Singhal',
        projectsCount: 3,
        esgCompletion: 88,
        brsrCompletion: 84
      },
      {
        id: 'bu-4',
        subsidiaryId: 'sub-2',
        name: 'Water & Industrial Effluent Treatment',
        headOfUnit: 'Nandini Das',
        projectsCount: 2,
        esgCompletion: 81,
        brsrCompletion: 76
      }
    ],
    projects: [
      {
        id: 'proj-1',
        code: 'SMP-500',
        name: 'Solar Mega-Park 500MW Facility',
        subsidiaryId: 'sub-1',
        subsidiaryName: 'Apex Heavy Engineering & Construction',
        businessUnitId: 'bu-1',
        businessUnitName: 'Renewables & Power Transmission',
        location: 'Bhadla Solar Complex, Rajasthan',
        state: 'Rajasthan',
        esgCompletion: 75,
        brsrCompletion: 70,
        validationStatus: 'clean',
        approvalStatus: 'draft',
        lastUpdated: '2026-03-28',
        leadPerson: 'Rajesh Verma',
        reportingYear: 'FY 2025-26',
        description: '500 MW utility scale solar photovoltaic power generation with captive battery energy storage system (BESS).'
      },
      {
        id: 'proj-2',
        code: 'HVDC-SOUTH',
        name: 'High Voltage Direct Current Transmission Corridor',
        subsidiaryId: 'sub-1',
        subsidiaryName: 'Apex Heavy Engineering & Construction',
        businessUnitId: 'bu-1',
        businessUnitName: 'Renewables & Power Transmission',
        location: 'Raigarh to Pugalur',
        state: 'Tamil Nadu',
        esgCompletion: 88,
        brsrCompletion: 84,
        validationStatus: 'has_warnings',
        approvalStatus: 'under_review',
        lastUpdated: '2026-03-26',
        leadPerson: 'Amitabh Sanyal',
        reportingYear: 'FY 2025-26',
        description: '±800 kV, 6,000 MW bi-pole HVDC link transporting clean power across inter-regional corridors.'
      },
      {
        id: 'proj-3',
        code: 'GH2-01',
        name: 'Green Hydrogen Electrolyzer Pilot Plant',
        subsidiaryId: 'sub-1',
        subsidiaryName: 'Apex Heavy Engineering & Construction',
        businessUnitId: 'bu-2',
        businessUnitName: 'Hydrocarbon & Heavy EPC',
        location: 'Hazira Industrial Zone',
        state: 'Gujarat',
        esgCompletion: 78,
        brsrCompletion: 74,
        validationStatus: 'has_warnings',
        approvalStatus: 'correction_required',
        lastUpdated: '2026-03-25',
        leadPerson: 'Manish Chawla',
        reportingYear: 'FY 2025-26',
        description: 'Alkaline & PEM multi-stack electrolyzer manufacturing and captive clean ammonia blending pilot.'
      },
      {
        id: 'proj-4',
        code: 'METRO-L3',
        name: 'Urban Elevated Metro Corridor Phase 3',
        subsidiaryId: 'sub-2',
        subsidiaryName: 'Apex Smart Infrastructure & Urban Mobility',
        businessUnitId: 'bu-3',
        businessUnitName: 'Metro Rail & Transit Systems',
        location: 'Bengaluru Metro Sector',
        state: 'Karnataka',
        esgCompletion: 91,
        brsrCompletion: 89,
        validationStatus: 'clean',
        approvalStatus: 'validated',
        lastUpdated: '2026-03-27',
        leadPerson: 'Pooja Hegde',
        reportingYear: 'FY 2025-26',
        description: 'Elevated mass rapid transit viaduct and 18 stations using low-carbon geopolymer precast concrete.'
      },
      {
        id: 'proj-5',
        code: 'WWRP-02',
        name: 'Municipal Wastewater Reclamation Plant',
        subsidiaryId: 'sub-2',
        subsidiaryName: 'Apex Smart Infrastructure & Urban Mobility',
        businessUnitId: 'bu-4',
        businessUnitName: 'Water & Industrial Effluent Treatment',
        location: 'Varanasi Clean Ganga Basin',
        state: 'Uttar Pradesh',
        esgCompletion: 83,
        brsrCompletion: 78,
        validationStatus: 'has_errors',
        approvalStatus: 'submitted',
        lastUpdated: '2026-03-24',
        leadPerson: 'Gautam Trivedi',
        reportingYear: 'FY 2025-26',
        description: '140 MLD secondary biological nutrient removal wastewater treatment with tertiary ultra-filtration reuse.'
      }
    ],
    users: [
      {
        id: 'u-1',
        name: 'Rajesh Verma',
        email: 'rajesh.verma@meil.in',
        corporateId: 'EMP-PU-1042',
        password: 'Password@123',
        role: 'project_user',
        roleTitle: 'Project Sustainability Lead',
        organization: 'MEIL Group',
        subsidiary: 'Clean Energy & Infrastructure Ltd',
        businessUnit: 'Solar Energy BU',
        project: 'Solar Mega-Park 500MW (SMP-500)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-2',
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@meil.in',
        corporateId: 'EMP-PM-2089',
        password: 'Password@123',
        role: 'bu_manager',
        roleTitle: 'Project & Business Unit Manager',
        organization: 'MEIL Group',
        subsidiary: 'Clean Energy & Infrastructure Ltd',
        businessUnit: 'Solar Energy BU',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-3',
        name: 'Sunita Rao',
        email: 'sunita.rao@meil.in',
        corporateId: 'EMP-SA-3150',
        password: 'Password@123',
        role: 'subsidiary_admin',
        roleTitle: 'Subsidiary Director of ESG & EHS',
        organization: 'MEIL Group',
        subsidiary: 'Clean Energy & Infrastructure Ltd',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-4',
        name: 'Dr. Ananya Sen',
        email: 'ananya.sen@meil.in',
        corporateId: 'EMP-ESG-4021',
        password: 'Password@123',
        role: 'esg_team',
        roleTitle: 'Group Chief Sustainability Officer',
        organization: 'MEIL Group',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-demo-gam',
        name: 'Group Admin & Management Officer',
        email: 'group.admin@ecometrics.demo',
        corporateId: 'EMP-GAM-001',
        password: 'Password@123',
        role: 'group_admin_management',
        roleTitle: 'Group Admin & Executive Director',
        organization: 'Apex Infrastructure Group Limited',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-5',
        name: 'Rekha Nair',
        email: 'rekha.nair@meil.in',
        corporateId: 'EMP-GA-9001',
        password: 'Password@123',
        role: 'group_admin_management',
        roleTitle: 'Group Executive VP & Compliance Officer',
        organization: 'Apex Infrastructure Group Limited',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-6',
        name: 'Deepak Khaitan',
        email: 'deepak.khaitan@meil.in',
        corporateId: 'EMP-EXEC-001',
        password: 'Password@123',
        role: 'group_admin_management',
        roleTitle: 'Managing Director & Board ESG Chair',
        organization: 'Apex Infrastructure Group Limited',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-1-alias',
        name: 'Rajesh Verma (Apex)',
        email: 'rajesh.v@apexinfratech.com',
        corporateId: 'APX-1042',
        password: 'Password@123',
        role: 'project_user',
        roleTitle: 'Project Sustainability Lead',
        organization: 'Apex Infrastructure Group Limited'
      },
      {
        id: 'u-2-alias',
        name: 'Sunita Rao (Apex)',
        email: 'sunita.rao@apexinfratech.com',
        corporateId: 'APX-2089',
        password: 'Password@123',
        role: 'bu_manager',
        roleTitle: 'Business Unit General Manager',
        organization: 'Apex Infrastructure Group Limited'
      },
      {
        id: 'u-4-alias',
        name: 'Dr. Ananya Sen (Apex)',
        email: 'ananya.sen@apexinfratech.com',
        corporateId: 'APX-4021',
        password: 'Password@123',
        role: 'esg_team',
        roleTitle: 'Chief Sustainability Officer',
        organization: 'Apex Infrastructure Group Limited'
      },
      {
        id: 'u-5-alias',
        name: 'Arvind Mehra (Apex)',
        email: 'arvind.mehra@apexinfratech.com',
        corporateId: 'APX-9001',
        password: 'Password@123',
        role: 'group_admin_management',
        roleTitle: 'Group Executive VP & Compliance Officer',
        organization: 'Apex Infrastructure Group Limited'
      },
      {
        id: 'u-6-alias',
        name: 'Priya Nair (Apex)',
        email: 'priya.nair@apexinfratech.com',
        corporateId: 'APX-001',
        password: 'Password@123',
        role: 'group_admin_management',
        roleTitle: 'Board Member & ESG Committee Chair',
        organization: 'Apex Infrastructure Group Limited'
      }
    ],
    roles: [
      { id: 'project_user', name: 'Project Manager', description: 'Collect and submit project-level ESG data' },
      { id: 'bu_manager', name: 'Business Unit Manager', description: 'Review and approve project ESG submissions' },
      { id: 'subsidiary_admin', name: 'Subsidiary Admin', description: 'Monitor and consolidate subsidiary-level information' },
      { id: 'esg_team', name: 'ESG / Sustainability Team', description: 'Validate ESG data, manage BRSR, SDG mapping, analytics and reporting' },
      { id: 'group_admin_management', name: 'Group Admin & Management', description: 'Organization-wide administration, executive ESG oversight, and final authorization' }
    ],
    reporting_periods: [
      { id: 'fy-2025-26', code: 'FY 2025-26', startDate: '2025-04-01', endDate: '2026-03-31', isActive: true },
      { id: 'fy-2024-25', code: 'FY 2024-25', startDate: '2024-04-01', endDate: '2025-03-31', isActive: false },
      { id: 'fy-2023-24', code: 'FY 2023-24', startDate: '2023-04-01', endDate: '2024-03-31', isActive: false }
    ],
    environmental_data: [
      {
        id: 'env-1',
        projectId: 'proj-1',
        reportingPeriod: 'FY 2025-26',
        electricityKwh: 34500000,
        fuelLitres: 48000,
        renewableEnergyPct: 46.8,
        totalEnergyGj: 124500,
        waterWithdrawalKl: 384000,
        waterConsumptionKl: 160000,
        waterRecycledKl: 224000,
        waterRecycledPct: 58.4,
        hazardousWasteMt: 84.5,
        nonHazardousWasteMt: 1420.0,
        wasteRecycledPct: 92.4,
        scope1GhgTco2e: 14850,
        scope2GhgTco2e: 28400,
        scope3GhgTco2e: 68200,
        status: 'validated',
        evidenceAttached: 'Energy_Audit_Cert_ISO50001.pdf',
        remarks: 'Rooftop solar and heavy fleet electrification lowered Scope 1 by 8.3%.',
        lastUpdated: '2026-03-28'
      },
      {
        id: 'env-2',
        projectId: 'proj-2',
        reportingPeriod: 'FY 2025-26',
        electricityKwh: 18200000,
        fuelLitres: 62000,
        renewableEnergyPct: 32.5,
        totalEnergyGj: 68400,
        waterWithdrawalKl: 142000,
        waterConsumptionKl: 72000,
        waterRecycledKl: 70000,
        waterRecycledPct: 49.3,
        hazardousWasteMt: 32.0,
        nonHazardousWasteMt: 890.0,
        wasteRecycledPct: 88.0,
        scope1GhgTco2e: 8200,
        scope2GhgTco2e: 14500,
        scope3GhgTco2e: 36000,
        status: 'under_review',
        evidenceAttached: 'Transmission_Substation_Energy_Manifest.pdf',
        remarks: 'Tower foundation works utilized low-carbon cement blends.',
        lastUpdated: '2026-03-26'
      },
      {
        id: 'env-3',
        projectId: 'proj-3',
        reportingPeriod: 'FY 2025-26',
        electricityKwh: 12400000,
        fuelLitres: 28000,
        renewableEnergyPct: 55.0,
        totalEnergyGj: 48900,
        waterWithdrawalKl: 98000,
        waterConsumptionKl: 86000,
        waterRecycledKl: 12000,
        waterRecycledPct: 12.2,
        hazardousWasteMt: 14.5,
        nonHazardousWasteMt: 340.0,
        wasteRecycledPct: 82.0,
        scope1GhgTco2e: 4100,
        scope2GhgTco2e: 7800,
        scope3GhgTco2e: 19500,
        status: 'draft',
        evidenceAttached: 'Electrolyzer_Testing_Water_Balance.pdf',
        remarks: 'Demineralized water purification plant commissioned.',
        lastUpdated: '2026-03-25'
      }
    ],
    social_data: [
      {
        id: 'soc-1',
        projectId: 'proj-1',
        reportingPeriod: 'FY 2025-26',
        permanentEmployees: 1420,
        femaleEmployees: 344,
        femaleEmployeesPct: 24.2,
        differentlyAbled: 18,
        contractWorkers: 4200,
        avgTrainingHoursPerPerson: 36.4,
        ltifr: 0.12,
        recordableInjuries: 4,
        fatalities: 0,
        turnoverPct: 7.4,
        csrSpentCr: 18.5,
        grievancesReceived: 8,
        grievancesResolved: 8,
        status: 'approved',
        evidenceAttached: 'EHS_Safety_ManHours_Log_FY26.pdf',
        remarks: 'Zero fatalities across 18.4 million safe man-hours.',
        lastUpdated: '2026-03-28'
      }
    ],
    governance_data: [
      {
        id: 'gov-1',
        projectId: 'proj-1',
        reportingPeriod: 'FY 2025-26',
        antiCorruptionPolicyActive: true,
        operationsCoveredPct: 100,
        whistleblowerCasesReceived: 3,
        whistleblowerCasesResolved: 3,
        boardOversightScore: 98.5,
        cybersecurityBreaches: 0,
        iso27001Active: true,
        status: 'approved',
        evidenceAttached: 'Ombudsman_Quarterly_Board_Report.pdf',
        remarks: '100% staff completed mandatory annual anti-bribery refresher.',
        lastUpdated: '2026-03-27'
      }
    ],
    brsr_sections: [
      { id: 'sec-a', code: 'Section A', name: 'General Disclosures', completionPct: 96, status: 'validated' },
      { id: 'sec-b', code: 'Section B', name: 'Management and Process Disclosures', completionPct: 90, status: 'validated' },
      { id: 'sec-c', code: 'Section C', name: 'Principle-wise Performance Disclosures', completionPct: 87, status: 'under_review' }
    ],
    brsr_principles: [
      { id: 'p1', number: 1, name: 'Ethics, Transparency and Accountability', shortName: 'Ethics & Integrity', essentialCount: 8, leadershipCount: 4, essentialCompleted: 8, leadershipCompleted: 3, totalCompletion: 92 },
      { id: 'p2', number: 2, name: 'Sustainable and Safe Goods and Services', shortName: 'Product Stewardship', essentialCount: 6, leadershipCount: 4, essentialCompleted: 5, leadershipCompleted: 3, totalCompletion: 80 },
      { id: 'p3', number: 3, name: 'Employee Well-being and Human Development', shortName: 'Workforce Well-being', essentialCount: 11, leadershipCount: 6, essentialCompleted: 11, leadershipCompleted: 5, totalCompletion: 94 },
      { id: 'p4', number: 4, name: 'Responsiveness to All Stakeholders', shortName: 'Stakeholder Engagement', essentialCount: 4, leadershipCount: 3, essentialCompleted: 4, leadershipCompleted: 2, totalCompletion: 86 },
      { id: 'p5', number: 5, name: 'Human Rights in Operations and Value Chain', shortName: 'Human Rights', essentialCount: 7, leadershipCount: 4, essentialCompleted: 7, leadershipCompleted: 3, totalCompletion: 91 },
      { id: 'p6', number: 6, name: 'Protection and Restoration of the Environment', shortName: 'Environment & Climate', essentialCount: 12, leadershipCount: 8, essentialCompleted: 11, leadershipCompleted: 7, totalCompletion: 90 },
      { id: 'p7', number: 7, name: 'Responsible Public Policy Engagement', shortName: 'Policy Advocacy', essentialCount: 3, leadershipCount: 2, essentialCompleted: 3, leadershipCompleted: 2, totalCompletion: 100 },
      { id: 'p8', number: 8, name: 'Inclusive Growth and Equitable Development', shortName: 'Inclusive Growth & CSR', essentialCount: 5, leadershipCount: 4, essentialCompleted: 5, leadershipCompleted: 3, totalCompletion: 89 },
      { id: 'p9', number: 9, name: 'Consumer Value and Responsible Relations', shortName: 'Consumer Value', essentialCount: 4, leadershipCount: 3, essentialCompleted: 4, leadershipCompleted: 2, totalCompletion: 86 }
    ],
    brsr_indicators: [
      {
        id: 'ind-p6-e1',
        code: 'P6-E1',
        principleNumber: 6,
        type: 'essential',
        question: 'Details of total energy consumption (in Joules or multiples) and energy intensity per rupee of turnover.',
        unit: 'GJ / ₹ Cr',
        esgDataSource: 'environmental_data.totalEnergyGj'
      },
      {
        id: 'ind-p6-e3',
        code: 'P6-E3',
        principleNumber: 6,
        type: 'essential',
        question: 'Details of total water withdrawal by source (Groundwater, Surface, Municipal, Seawater) and water consumption intensity.',
        unit: 'kL / ₹ Cr',
        esgDataSource: 'environmental_data.waterWithdrawalKl'
      },
      {
        id: 'ind-p6-e5',
        code: 'P6-E5',
        principleNumber: 6,
        type: 'essential',
        question: 'Details of greenhouse gas emissions (Scope 1 and Scope 2: metric tonnes of CO2 equivalent) and GHG intensity.',
        unit: 'tCO2e / ₹ Cr',
        esgDataSource: 'environmental_data.scope1GhgTco2e + scope2GhgTco2e'
      },
      {
        id: 'ind-p3-e1',
        code: 'P3-E1',
        principleNumber: 3,
        type: 'essential',
        question: 'Details of measures for well-being of employees & workers (Health insurance, Accident insurance, Maternity, Day care).',
        unit: '% Covered',
        esgDataSource: 'social_data.permanentEmployees'
      },
      {
        id: 'ind-p3-e4',
        code: 'P3-E4',
        principleNumber: 3,
        type: 'essential',
        question: 'Details of safety incidents: Lost Time Injury Frequency Rate (LTIFR), Total recordable injuries, Fatalities.',
        unit: 'per mn hrs worked',
        esgDataSource: 'social_data.ltifr'
      }
    ],
    brsr_responses: [
      {
        id: 'resp-1',
        indicatorCode: 'P6-E1',
        reportingPeriod: 'FY 2025-26',
        calculatedValue: '124,500 GJ (Intensity: 2.58 GJ/₹ Cr)',
        status: 'validated',
        evidenceFile: 'Energy_Audit_Cert_ISO50001.pdf',
        auditorNotes: 'Verified against ISO 50001 energy certification.'
      },
      {
        id: 'resp-2',
        indicatorCode: 'P6-E3',
        reportingPeriod: 'FY 2025-26',
        calculatedValue: '384,000 kL (Intensity: 7.96 kL/₹ Cr)',
        status: 'validated',
        evidenceFile: 'Groundwater_Flow_Meter_Telemetry.pdf',
        auditorNotes: 'State water telemetry meter verified.'
      },
      {
        id: 'resp-3',
        indicatorCode: 'P6-E5',
        reportingPeriod: 'FY 2025-26',
        calculatedValue: 'Scope 1: 14,850 tCO2e | Scope 2: 28,400 tCO2e | Intensity: 0.89 tCO2e/₹ Cr',
        status: 'validated',
        evidenceFile: 'GHG_Protocol_Assurance_Statement_DNV.pdf',
        auditorNotes: 'DNV reasonable assurance statement issued for BRSR Core.'
      }
    ],
    validation_rules: [
      { id: 'vrule-1', code: 'VAL-NON-NEGATIVE', description: 'All energy, fuel, water, and emission values must be non-negative.', severity: 'error' },
      { id: 'vrule-2', code: 'VAL-YOY-OUTLIER', description: 'Year-over-Year variance exceeding ±25% must flag warning for justification.', severity: 'warning' },
      { id: 'vrule-3', code: 'VAL-WATER-BALANCE', description: 'Recycled water cannot exceed total freshwater withdrawal.', severity: 'error' },
      { id: 'vrule-4', code: 'VAL-EVIDENCE-MANDATORY', description: 'Scope 1 & 2 emissions must contain verified third-party audit evidence.', severity: 'error' }
    ],
    validation_results: [
      {
        id: 'val-101',
        recordId: 'env-3',
        metric: 'Scope 3 Supply Chain Logistics',
        project: 'Solar Mega-Park 500MW (SMP-500)',
        businessUnit: 'Renewables & Power Transmission',
        subsidiary: 'Apex Heavy Engineering & Construction',
        category: 'Environmental',
        currentValue: '68,200 tCO2e',
        previousValue: '71,500 tCO2e',
        rule: 'VAL-YOY-OUTLIER',
        severity: 'warning',
        status: 'open',
        detectedAt: '2026-03-27 14:32',
        details: 'Subcontractor trucking logs submitted using DEFRA factor instead of Indian CEA factor.',
        justification: ''
      },
      {
        id: 'val-102',
        recordId: 'env-wwrp',
        metric: 'Effluent BOD Concentration',
        project: 'Wastewater Reclamation Plant (WWRP-02)',
        businessUnit: 'Water & Industrial Effluent Treatment',
        subsidiary: 'Apex Smart Infrastructure & Urban Mobility',
        category: 'Environmental',
        currentValue: '38.4 mg/L',
        previousValue: '18.2 mg/L',
        rule: 'VAL-YOY-OUTLIER',
        severity: 'error',
        status: 'open',
        detectedAt: '2026-03-28 09:15',
        details: 'Reported BOD exceeds site consent-to-operate limit of 30 mg/L.',
        justification: ''
      }
    ],
    approval_workflows: [
      {
        id: 'wf-smp-500-env',
        projectId: 'proj-1',
        projectCode: 'SMP-500',
        projectName: 'Solar Mega-Park 500MW Facility',
        category: 'Environmental',
        reportingPeriod: 'FY 2025-26',
        currentStepIndex: 3,
        overallStatus: 'under_review',
        submittedBy: 'Rajesh Verma (Project Lead)',
        submittedAt: '2026-03-25 10:30',
        steps: [
          { level: 'project', label: '1. Project Data Entry', role: 'project_user', status: 'approved', actionBy: 'Rajesh Verma', actionAt: '2026-03-25 10:30', comments: 'All meters and bills verified.' },
          { level: 'bu', label: '2. BU Manager Review', role: 'bu_manager', status: 'approved', actionBy: 'Sunita Rao', actionAt: '2026-03-26 14:15', comments: 'Verified against BU generation logs.' },
          { level: 'subsidiary', label: '3. Subsidiary Admin Signoff', role: 'subsidiary_admin', status: 'approved', actionBy: 'Vikramaditya Patel', actionAt: '2026-03-27 16:45', comments: 'Subsidiary aggregation confirmed.' },
          { level: 'esg_team', label: '4. ESG Team Validation', role: 'esg_team', status: 'in_progress', comments: 'Reviewing CEA grid factor updates.' },
          { level: 'final_approver', label: '5. Group Admin & Management Signoff', role: 'group_admin_management', status: 'pending' }
        ],
        evidenceCount: 8,
        summaryHighlights: 'Scope 1 direct emissions down 8.3%; Renewable energy captive share reached 46.8%.'
      },
      {
        id: 'wf-gh2-soc',
        projectId: 'proj-3',
        projectCode: 'GH2-01',
        projectName: 'Green Hydrogen Electrolyzer Pilot Plant',
        category: 'Social',
        reportingPeriod: 'FY 2025-26',
        currentStepIndex: 1,
        overallStatus: 'correction_required',
        submittedBy: 'Manish Chawla (Project Lead)',
        submittedAt: '2026-03-24 12:10',
        steps: [
          { level: 'project', label: '1. Project Data Entry', role: 'project_user', status: 'approved', actionBy: 'Manish Chawla', actionAt: '2026-03-24 12:10' },
          { level: 'bu', label: '2. BU Manager Review', role: 'bu_manager', status: 'rejected', actionBy: 'Devendra Joshi', actionAt: '2026-03-25 09:30', comments: 'Correction required: Clarify contractor labor turnover increase.' },
          { level: 'subsidiary', label: '3. Subsidiary Admin Signoff', role: 'subsidiary_admin', status: 'pending' },
          { level: 'esg_team', label: '4. ESG Team Validation', role: 'esg_team', status: 'pending' },
          { level: 'final_approver', label: '5. Group Admin & Management Signoff', role: 'group_admin_management', status: 'pending' }
        ],
        evidenceCount: 4,
        summaryHighlights: 'Training hours logged at 34 hrs/worker, but contractor workforce turnover clarification needed.'
      }
    ],
    approval_steps: [],
    approval_actions: [],
    documents: [
      { id: 'doc-1', name: 'Energy_Audit_Cert_ISO50001.pdf', projectId: 'proj-1', uploadedBy: 'Rajesh Verma', uploadedAt: '2026-03-25', size: '2.4 MB', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      { id: 'doc-2', name: 'GHG_Protocol_Assurance_Statement_DNV.pdf', projectId: 'proj-1', uploadedBy: 'Dr. Ananya Sen', uploadedAt: '2026-03-27', size: '1.8 MB', hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945' }
    ],
    sdg_goals: [
      { number: 1, title: 'No Poverty', color: '#E5243B', progressScore: 84 },
      { number: 2, title: 'Zero Hunger', color: '#DDA63A', progressScore: 78 },
      { number: 3, title: 'Good Health & Well-being', color: '#4C9F38', progressScore: 94 },
      { number: 4, title: 'Quality Education', color: '#C5192D', progressScore: 88 },
      { number: 5, title: 'Gender Equality', color: '#FF3A21', progressScore: 82 },
      { number: 6, title: 'Clean Water & Sanitation', color: '#26BDE2', progressScore: 92 },
      { number: 7, title: 'Affordable & Clean Energy', color: '#FCC30B', progressScore: 96 },
      { number: 8, title: 'Decent Work & Economic Growth', color: '#A21942', progressScore: 95 },
      { number: 9, title: 'Industry, Innovation & Infrastructure', color: '#FD6925', progressScore: 91 },
      { number: 10, title: 'Reduced Inequalities', color: '#DD1367', progressScore: 80 },
      { number: 11, title: 'Sustainable Cities & Communities', color: '#FD9D24', progressScore: 89 },
      { number: 12, title: 'Responsible Consumption & Production', color: '#BF8B2E', progressScore: 87 },
      { number: 13, title: 'Climate Action', color: '#3F7E44', progressScore: 93 },
      { number: 14, title: 'Life Below Water', color: '#0A97D9', progressScore: 85 },
      { number: 15, title: 'Life on Land', color: '#56C02B', progressScore: 86 },
      { number: 16, title: 'Peace, Justice & Strong Institutions', color: '#00689D', progressScore: 98 },
      { number: 17, title: 'Partnerships for the Goals', color: '#19486A', progressScore: 90 }
    ],
    esg_sdg_mapping: [
      { id: 'map-1', esgActivity: 'Renewable Captive Solar Power Generation', sdgNumber: 7, reason: 'Generates 500MW clean electricity reducing grid reliance.', reportingPeriod: 'FY 2025-26' },
      { id: 'map-2', esgActivity: 'Zero Liquid Discharge & Wastewater Reuse', sdgNumber: 6, reason: 'Recirculates 58.4% of process water and preserves aquifers.', reportingPeriod: 'FY 2025-26' },
      { id: 'map-3', esgActivity: 'Zero Harm EHS & Behavior Based Safety', sdgNumber: 3, reason: 'Achieved 0.12 LTIFR across 18.4 million work-hours.', reportingPeriod: 'FY 2025-26' },
      { id: 'map-4', esgActivity: 'Science-Based Targets Net-Zero Decarbonization', sdgNumber: 13, reason: 'Decreased Scope 1 & 2 emissions by 11.8% YoY.', reportingPeriod: 'FY 2025-26' }
    ],
    reports: [
      {
        id: 'rep-01',
        title: 'SEBI BRSR Comprehensive Annual Report FY 2025-26',
        type: 'SEBI Mandatory Regulatory Filing',
        format: 'PDF / XBRL Ready',
        generatedAt: '2026-03-28 11:30',
        fileSize: '4.8 MB',
        status: 'Final Approved',
        reportingBoundary: 'Consolidated (All Subsidiaries + JVs)'
      },
      {
        id: 'rep-02',
        title: 'BRSR Core Key Attributes & Assurance Pack (Annexure 2)',
        type: 'Audited BRSR Core Disclosures',
        format: 'PDF + Excel Data Book',
        generatedAt: '2026-03-27 17:15',
        fileSize: '2.9 MB',
        status: 'Ready for Board',
        reportingBoundary: 'Top 1000 Listed Entities Scope'
      },
      {
        id: 'rep-03',
        title: 'Executive ESG Performance & Climate Risk Summary',
        type: 'Board & Management Briefing',
        format: 'Presentation PDF',
        generatedAt: '2026-03-26 14:00',
        fileSize: '3.4 MB',
        status: 'Reviewed',
        reportingBoundary: 'Apex Infrastructure Group Executive Level'
      }
    ],
    audit_logs: [
      {
        id: 'aud-901',
        timestamp: '2026-03-28 11:20:14',
        userName: 'Dr. Ananya Sen',
        userRole: 'ESG / Sustainability Team',
        action: 'Validated',
        entity: 'BRSR Indicator',
        entityId: 'P6-E5 (GHG Emissions)',
        previousValue: 'Draft',
        newValue: 'Validated with DNV Reasonable Assurance Statement',
        ipAddress: '10.240.12.84'
      },
      {
        id: 'aud-902',
        timestamp: '2026-03-28 09:45:00',
        userName: 'Gautam Trivedi',
        userRole: 'Project User',
        action: 'Submitted',
        entity: 'Project ESG Record',
        entityId: 'WWRP-02 (Water Treatment)',
        previousValue: 'Draft',
        newValue: 'Submitted to BU Reviewer',
        ipAddress: '172.16.4.19'
      },
      {
        id: 'aud-903',
        timestamp: '2026-03-27 16:48:22',
        userName: 'Vikramaditya Patel',
        userRole: 'Subsidiary Admin',
        action: 'Approved',
        entity: 'Approval Request',
        entityId: 'wf-smp-500-env',
        previousValue: 'Under BU Review',
        newValue: 'Approved & Forwarded to Group ESG',
        ipAddress: '10.240.10.15'
      }
    ],
    review_requests: [
      {
        id: 'rev-smp500-elec-01',
        submissionId: 'subm-smp500-fy26',
        projectId: 'proj-1',
        projectCode: 'SMP-500',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        reportingPeriod: 'FY 2025-26',
        reviewerId: 'usr-3',
        reviewerName: 'Vikram Malhotra',
        reviewerRole: 'Business Unit Manager',
        assigneeId: 'usr-1',
        assigneeName: 'Rajesh Verma',
        assigneeRole: 'Project Manager',
        section: 'Environmental',
        category: 'Energy',
        metric: 'Grid Electricity',
        fieldPath: 'environmental/energy/grid-electricity',
        currentValue: '100,000 kWh',
        previousValue: '84,000 kWh',
        variancePct: 19.0,
        aiAnomalySeverity: 'medium',
        issueType: 'Verification Required',
        priority: 'Medium',
        comment: 'Please verify the reported electricity consumption and supporting evidence. The value increased by 19% compared with the previous reporting period.',
        requiredAction: 'Verify value and upload supporting evidence.',
        status: 'CORRECTION_REQUESTED',
        isDraft: false,
        thread: [
          {
            id: 'th-1',
            author: 'Vikram Malhotra',
            role: 'Business Unit Manager',
            message: 'Please verify the reported electricity consumption and supporting evidence. The value increased by 19% compared with the previous reporting period.',
            timestamp: '2026-10-05 09:20',
            type: 'comment'
          }
        ],
        createdAt: '2026-10-05 09:20',
        updatedAt: '2026-10-05 09:20'
      },
      {
        id: 'rev-smp500-fuel-02',
        submissionId: 'subm-smp500-fy26',
        projectId: 'proj-1',
        projectCode: 'SMP-500',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        reportingPeriod: 'FY 2025-26',
        reviewerId: 'usr-3',
        reviewerName: 'Vikram Malhotra',
        reviewerRole: 'Business Unit Manager',
        assigneeId: 'usr-1',
        assigneeName: 'Rajesh Verma',
        assigneeRole: 'Project Manager',
        section: 'Environmental',
        category: 'Energy',
        metric: 'Stationary Diesel / Fuel',
        fieldPath: 'environmental/energy/fuel',
        currentValue: '25,000 Litres',
        previousValue: '24,000 Litres',
        variancePct: 4.2,
        issueType: 'Evidence Missing',
        priority: 'High',
        comment: 'Please upload the supporting diesel consumption invoice.',
        requiredAction: 'Upload verified fuel delivery slips and DG meter logs.',
        status: 'CORRECTION_REQUESTED',
        isDraft: false,
        thread: [
          {
            id: 'th-2',
            author: 'Vikram Malhotra',
            role: 'Business Unit Manager',
            message: 'Please upload the supporting diesel consumption invoice.',
            timestamp: '2026-10-05 09:22',
            type: 'comment'
          }
        ],
        createdAt: '2026-10-05 09:22',
        updatedAt: '2026-10-05 09:22'
      },
      {
        id: 'rev-smp500-water-03',
        submissionId: 'subm-smp500-fy26',
        projectId: 'proj-1',
        projectCode: 'SMP-500',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        reportingPeriod: 'FY 2025-26',
        reviewerId: 'usr-3',
        reviewerName: 'Vikram Malhotra',
        reviewerRole: 'Business Unit Manager',
        assigneeId: 'usr-1',
        assigneeName: 'Rajesh Verma',
        assigneeRole: 'Project Manager',
        section: 'Environmental',
        category: 'Water',
        metric: 'Recycled / Reused Water',
        fieldPath: 'environmental/water/recycled',
        currentValue: '18,500 KL (37.0%)',
        previousValue: '15,000 KL',
        variancePct: 23.3,
        issueType: 'Calculation Variance',
        priority: 'Low',
        comment: 'Water recycling ratio meets SEBI BRSR P6 guidance. Flowmeter verification attached.',
        requiredAction: 'None. Approved by reviewer.',
        status: 'APPROVED',
        isDraft: false,
        thread: [
          {
            id: 'th-3',
            author: 'Vikram Malhotra',
            role: 'Business Unit Manager',
            message: 'Water recycling ratio verified against STP flowmeter log. Approved.',
            timestamp: '2026-10-05 09:25',
            type: 'resolution'
          }
        ],
        createdAt: '2026-10-05 09:25',
        updatedAt: '2026-10-05 09:25'
      },
      {
        id: 'rev-smp500-gov-04',
        submissionId: 'subm-smp500-fy26',
        projectId: 'proj-1',
        projectCode: 'SMP-500',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        reportingPeriod: 'FY 2025-26',
        reviewerId: 'usr-3',
        reviewerName: 'Vikram Malhotra',
        reviewerRole: 'Business Unit Manager',
        assigneeId: 'usr-1',
        assigneeName: 'Rajesh Verma',
        assigneeRole: 'Project Manager',
        section: 'Governance',
        category: 'Ethics & Compliance',
        metric: 'Anti-Corruption Policy Affirmation',
        fieldPath: 'governance/ethics/anti-corruption',
        currentValue: 'Affirmed (Yes)',
        issueType: 'Compliance Document Missing',
        priority: 'Medium',
        comment: 'Please provide the required signed vendor code of conduct and anti-bribery training attendance sheet.',
        requiredAction: 'Upload signed compliance certificate.',
        status: 'CORRECTION_SUBMITTED',
        isDraft: false,
        thread: [
          {
            id: 'th-4a',
            author: 'Vikram Malhotra',
            role: 'Business Unit Manager',
            message: 'Please provide the required signed vendor code of conduct and anti-bribery training attendance sheet.',
            timestamp: '2026-10-05 08:30',
            type: 'comment'
          },
          {
            id: 'th-4b',
            author: 'Rajesh Verma',
            role: 'Project Manager',
            message: 'Uploaded signed compliance affirmation pack and training register batch #21.',
            timestamp: '2026-10-05 09:10',
            type: 'response',
            attachment: 'Signed_Anti_Bribery_Affirmation_FY26.pdf'
          }
        ],
        createdAt: '2026-10-05 08:30',
        updatedAt: '2026-10-05 09:10'
      },
      {
        id: 'rev-smp500-doc-05',
        submissionId: 'subm-smp500-fy26',
        projectId: 'proj-1',
        projectCode: 'SMP-500',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        reportingPeriod: 'FY 2025-26',
        reviewerId: 'usr-3',
        reviewerName: 'Vikram Malhotra',
        reviewerRole: 'Business Unit Manager',
        assigneeId: 'usr-1',
        assigneeName: 'Rajesh Verma',
        assigneeRole: 'Project Manager',
        section: 'Evidence',
        category: 'Invoices',
        metric: 'Electricity Invoice Verification',
        fieldPath: 'documents/invoices/electricity',
        currentValue: 'DISCOM_Power_Invoices_FY26.pdf',
        issueType: 'Verification Required',
        priority: 'Low',
        comment: 'Please upload evidence clearly identifying the billing cycles for Q3 and Q4.',
        requiredAction: 'Upload complete consolidated invoice.',
        status: 'RESOLVED',
        isDraft: false,
        thread: [
          {
            id: 'th-5a',
            author: 'Vikram Malhotra',
            role: 'Business Unit Manager',
            message: 'Please upload evidence clearly identifying the billing cycles for Q3 and Q4.',
            timestamp: '2026-10-05 08:00',
            type: 'comment'
          },
          {
            id: 'th-5b',
            author: 'Rajesh Verma',
            role: 'Project Manager',
            message: 'Attached consolidated quarterly billing statements from state DISCOM.',
            timestamp: '2026-10-05 08:45',
            type: 'response'
          },
          {
            id: 'th-5c',
            author: 'Vikram Malhotra',
            role: 'Business Unit Manager',
            message: 'Correction reviewed and accepted. Billing cycle verified.',
            timestamp: '2026-10-05 09:00',
            type: 'resolution'
          }
        ],
        createdAt: '2026-10-05 08:00',
        updatedAt: '2026-10-05 09:00',
        resolvedAt: '2026-10-05 09:00'
      }
    ],
    review_responses: [],
    notifications: [
      {
        id: 'notif-1',
        userId: 'usr-1',
        type: 'CORRECTION_REQUESTED',
        title: 'Correction Requested',
        message: 'Please verify the reported electricity consumption and supporting evidence.',
        projectId: 'proj-1',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        submissionId: 'subm-smp500-fy26',
        reviewRequestId: 'rev-smp500-elec-01',
        section: 'Environmental',
        category: 'Energy',
        metric: 'Grid Electricity',
        fieldPath: 'environmental/energy/grid-electricity',
        priority: 'Medium',
        isRead: false,
        createdAt: '5 minutes ago'
      },
      {
        id: 'notif-2',
        userId: 'usr-1',
        type: 'CORRECTION_REQUESTED',
        title: 'Evidence Correction Requested',
        message: 'Please upload the supporting diesel consumption invoice.',
        projectId: 'proj-1',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        submissionId: 'subm-smp500-fy26',
        reviewRequestId: 'rev-smp500-fuel-02',
        section: 'Environmental',
        category: 'Energy',
        metric: 'Stationary Diesel / Fuel',
        fieldPath: 'environmental/energy/fuel',
        priority: 'High',
        isRead: false,
        createdAt: '10 minutes ago'
      },
      {
        id: 'notif-3',
        userId: 'usr-3',
        type: 'CORRECTION_SUBMITTED',
        title: 'Correction Submitted',
        message: 'Project Manager Rajesh Verma has submitted corrected documents for Anti-Corruption Policy Affirmation.',
        projectId: 'proj-1',
        projectName: 'Solar Mega-Park 500MW (SMP-500)',
        submissionId: 'subm-smp500-fy26',
        reviewRequestId: 'rev-smp500-gov-04',
        section: 'Governance',
        category: 'Ethics & Compliance',
        metric: 'Anti-Corruption Policy Affirmation',
        fieldPath: 'governance/ethics/anti-corruption',
        priority: 'Medium',
        isRead: false,
        createdAt: '25 minutes ago'
      }
    ]
  };
}

class DatabaseManager {
  private state: DBState;

  constructor() {
    this.ensureDataDir();
    this.state = this.load();
  }

  private ensureDataDir() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): DBState {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        const seed = getInitialSeedData();
        // Synchronize users and roles from code definition to guarantee latest schema and credentials
        parsed.users = seed.users;
        parsed.roles = seed.roles;

        if (!parsed.review_requests || !Array.isArray(parsed.review_requests) || parsed.review_requests.length === 0) {
          parsed.review_requests = seed.review_requests;
        }
        if (!parsed.review_responses || !Array.isArray(parsed.review_responses)) {
          parsed.review_responses = seed.review_responses;
        }
        if (!parsed.notifications || !Array.isArray(parsed.notifications) || parsed.notifications.length === 0) {
          parsed.notifications = seed.notifications;
        }

        // Auto-migration: migrate any existing users or steps having role 'group_admin' or 'management'
        if (Array.isArray(parsed.users)) {
          parsed.users.forEach((u: any) => {
            if (u.role === 'group_admin' || u.role === 'management') {
              u.role = 'group_admin_management';
              u.roleTitle = 'Group Admin & Executive Director';
            }
          });
        }
        if (Array.isArray(parsed.approval_workflows)) {
          parsed.approval_workflows.forEach((wf: any) => {
            if (Array.isArray(wf.steps)) {
              wf.steps.forEach((s: any) => {
                if (s.role === 'group_admin' || s.role === 'management' || s.role === 'group_admin_management') {
                  s.role = 'group_admin_management';
                  s.label = '5. Group Admin & Management Signoff';
                }
              });
            }
          });
        }
        this.save(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading db.json, resetting to seed:', e);
    }
    const initial = getInitialSeedData();
    this.save(initial);
    return initial;
  }

  private save(data?: DBState) {
    if (data) this.state = data;
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing db.json:', e);
    }
  }

  public getState(): DBState {
    return this.state;
  }

  public getTable<K extends keyof DBState>(tableName: K): DBState[K] {
    return this.state[tableName];
  }

  public setTable<K extends keyof DBState>(tableName: K, data: DBState[K]) {
    this.state[tableName] = data;
    this.save();
  }

  public insert<K extends keyof DBState>(tableName: K, item: any) {
    const table = this.state[tableName] as any[];
    table.unshift(item);
    this.save();
    return item;
  }

  public update<K extends keyof DBState>(tableName: K, id: string, updates: any) {
    const table = this.state[tableName] as any[];
    const idx = table.findIndex(item => item.id === id || item.code === id);
    if (idx !== -1) {
      table[idx] = { ...table[idx], ...updates };
      this.save();
      return table[idx];
    }
    return null;
  }

  public logAudit(userName: string, userRole: string, action: string, entity: string, entityId: string, newValue: string, ip = '127.0.0.1') {
    const auditRecord = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName,
      userRole,
      action,
      entity,
      entityId,
      newValue,
      ipAddress: ip
    };
    this.insert('audit_logs', auditRecord);
    return auditRecord;
  }
}

export const db = new DatabaseManager();
