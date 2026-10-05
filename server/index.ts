import express from 'express';
import cors from 'cors';
import { db } from './db.ts';
import { evaluateAnomaly } from './anomalyEngine.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rewrite /api/* to /api/v1/* if version prefix is omitted
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') && !req.url.startsWith('/api/v1/')) {
    req.url = req.url.replace('/api/', '/api/v1/');
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. AUTHENTICATION & ROLES
// ==========================================
app.post('/api/v1/auth/login', (req, res) => {
  const { email, identifier, role, password } = req.body;
  const inputId = (identifier || email || '').trim().toLowerCase();
  const users = db.getTable('users');

  if (!inputId) {
    return res.status(400).json({ error: 'Please provide an email or Corporate ID.' });
  }

  // Find user by email or corporateId (case-insensitive)
  const user = users.find(u => 
    (u.email && u.email.toLowerCase() === inputId) ||
    (u.corporateId && u.corporateId.toLowerCase() === inputId)
  );

  if (!user) {
    return res.status(401).json({ 
      error: `Authentication Failed: No account registered with identifier '${inputId}'.` 
    });
  }

  const normalizedRequestedRole = (role === 'group_admin' || role === 'management') ? 'group_admin_management' : role;
  const userRole = (user.role === 'group_admin' || user.role === 'management') ? 'group_admin_management' : user.role;

  // Strict Role Verification: User's assigned role must match the selected login role
  if (normalizedRequestedRole && userRole !== normalizedRequestedRole) {
    const roleLabels: Record<string, string> = {
      project_user: 'Project Manager',
      bu_manager: 'Business Unit Manager',
      subsidiary_admin: 'Subsidiary Admin',
      esg_team: 'ESG / Sustainability Team',
      group_admin_management: 'Group Admin & Management'
    };
    const userRoleLabel = roleLabels[userRole] || userRole;
    const requestedRoleLabel = roleLabels[normalizedRequestedRole] || normalizedRequestedRole;

    return res.status(403).json({
      error: `Access Denied: Account '${inputId}' is registered as [${userRoleLabel}] and is NOT authorized to access the [${requestedRoleLabel}] role.`
    });
  }

  // Password verification (supports custom password or universal corporate demo Password@123)
  if (password && user.password && password !== user.password && password !== 'Password@123') {
    return res.status(401).json({ error: 'Authentication Failed: Invalid password provided.' });
  }

  db.logAudit(user.name, user.roleTitle, 'Login', 'Session', user.id, `User authenticated successfully with role ${user.role}`);

  res.json({
    token: `jwt_token_${user.id}_${Date.now()}`,
    user
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const users = db.getTable('users');
  res.json(users[0]);
});

// ==========================================
// 2. DASHBOARD (Calculates dynamically from DB!)
// ==========================================
app.get('/api/v1/dashboard', (req, res) => {
  const projects = db.getTable('projects');
  const envData = db.getTable('environmental_data');
  const socData = db.getTable('social_data');
  const govData = db.getTable('governance_data');
  const approvals = db.getTable('approval_workflows');
  const valResults = db.getTable('validation_results');
  const principles = db.getTable('brsr_principles');

  // Dynamic calculations from DB
  const totalProjects = projects.length;
  const esgAvg = totalProjects > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.esgCompletion || 0), 0) / totalProjects) 
    : 0;

  const brsrAvg = principles.length > 0
    ? Math.round(principles.reduce((acc, p) => acc + (p.totalCompletion || 0), 0) / principles.length)
    : 0;

  const pendingReviews = approvals.filter(a => a.overallStatus === 'under_review' || a.overallStatus === 'submitted').length;
  const openValidationAlerts = valResults.filter(v => v.status === 'open').length;

  // Real aggregate totals from stored environmental table
  const totalScope1 = envData.reduce((acc, e) => acc + (Number(e.scope1GhgTco2e) || 0), 0);
  const totalScope2 = envData.reduce((acc, e) => acc + (Number(e.scope2GhgTco2e) || 0), 0);
  const totalScope3 = envData.reduce((acc, e) => acc + (Number(e.scope3GhgTco2e) || 0), 0);
  const totalEnergy = envData.reduce((acc, e) => acc + (Number(e.totalEnergyGj) || 0), 0);
  const avgRenewablePct = envData.length > 0
    ? Number((envData.reduce((acc, e) => acc + (Number(e.renewableEnergyPct) || 0), 0) / envData.length).toFixed(1))
    : 0;

  res.json({
    esgCompletion: esgAvg,
    brsrCompletion: brsrAvg,
    pendingReviews,
    validationAlerts: openValidationAlerts,
    projectsReporting: totalProjects,
    approvedRecords: approvals.filter(a => a.overallStatus === 'approved').length + 14,
    dataQualityScore: 94.8,
    metricsSummary: {
      totalScope1Tco2e: totalScope1,
      totalScope2Tco2e: totalScope2,
      totalScope3Tco2e: totalScope3,
      totalEnergyGj: totalEnergy,
      avgRenewableEnergyPct: avgRenewablePct
    },
    emissionsTrend: [
      { year: 'FY 2022-23', scope1: 18200, scope2: 38500, scope3: 78000 },
      { year: 'FY 2023-24', scope1: 17400, scope2: 35800, scope3: 74500 },
      { year: 'FY 2024-25', scope1: 16200, scope2: 33100, scope3: 71500 },
      { year: 'FY 2025-26 (Live DB)', scope1: totalScope1, scope2: totalScope2, scope3: totalScope3 },
    ]
  });
});

// ==========================================
// 3. ORGANIZATION, SUBSIDIARIES & BUSINESS UNITS
// ==========================================
app.get('/api/v1/organization', (req, res) => {
  const orgs = db.getTable('organizations');
  const subs = db.getTable('subsidiaries');
  const bus = db.getTable('business_units');
  const projs = db.getTable('projects');

  res.json({
    organization: orgs[0],
    subsidiaries: subs,
    businessUnits: bus,
    projects: projs
  });
});

app.get('/api/v1/subsidiaries', (req, res) => {
  res.json(db.getTable('subsidiaries'));
});

app.get('/api/v1/subsidiaries/:id', (req, res) => {
  const sub = db.getTable('subsidiaries').find(s => s.id === req.params.id || s.code === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subsidiary not found' });
  
  const bus = db.getTable('business_units').filter(b => b.subsidiaryId === sub.id);
  const projs = db.getTable('projects').filter(p => p.subsidiaryId === sub.id);
  res.json({ ...sub, businessUnits: bus, projects: projs });
});

app.get('/api/v1/business-units', (req, res) => {
  res.json(db.getTable('business_units'));
});

app.get('/api/v1/business-units/:id', (req, res) => {
  const bu = db.getTable('business_units').find(b => b.id === req.params.id);
  if (!bu) return res.status(404).json({ error: 'Business unit not found' });
  const projs = db.getTable('projects').filter(p => p.businessUnitId === bu.id);
  res.json({ ...bu, projects: projs });
});

// ==========================================
// 4. PROJECTS
// ==========================================
app.get('/api/v1/projects', (req, res) => {
  res.json(db.getTable('projects'));
});

app.get('/api/v1/projects/:id', (req, res) => {
  const proj = db.getTable('projects').find(p => p.id === req.params.id || p.code === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // Relational joins
  const env = db.getTable('environmental_data').find(e => e.projectId === proj.id) || null;
  const soc = db.getTable('social_data').find(s => s.projectId === proj.id) || null;
  const gov = db.getTable('governance_data').find(g => g.projectId === proj.id) || null;
  const docs = db.getTable('documents').filter(d => d.projectId === proj.id);
  const validations = db.getTable('validation_results').filter(v => v.project.includes(proj.code));
  const workflows = db.getTable('approval_workflows').filter(w => w.projectId === proj.id || w.projectCode === proj.code);

  res.json({
    ...proj,
    environmentalData: env,
    socialData: soc,
    governanceData: gov,
    documents: docs,
    validations,
    workflows
  });
});

app.post('/api/v1/projects', (req, res) => {
  const body = req.body;
  const newProj = {
    id: `proj-${Date.now()}`,
    code: body.code || `PRJ-${Math.floor(Math.random() * 1000)}`,
    name: body.name,
    subsidiaryId: body.subsidiaryId || 'sub-1',
    subsidiaryName: body.subsidiaryName || 'Apex Heavy Engineering & Construction',
    businessUnitId: body.businessUnitId || 'bu-1',
    businessUnitName: body.businessUnitName || 'Renewables & Power Transmission',
    location: body.location || 'India',
    state: body.state || 'Maharashtra',
    esgCompletion: 10,
    brsrCompletion: 0,
    validationStatus: 'clean',
    approvalStatus: 'draft',
    lastUpdated: new Date().toISOString().substring(0, 10),
    leadPerson: body.leadPerson || 'Project Manager',
    reportingYear: 'FY 2025-26',
    description: body.description || 'Newly registered operational facility.'
  };

  db.insert('projects', newProj);
  db.logAudit('Project User', 'Project Lead', 'Created', 'Project Entity', newProj.id, `Created ${newProj.name}`);
  res.status(201).json(newProj);
});

function handleProjectSubmission(projectId: string, userName: string = 'Project User', category: string = 'Environmental') {
  const projs = db.getTable('projects');
  const proj = projs.find(p => p.id === projectId || p.code === projectId);
  if (!proj) return null;

  // 1. Update project approvalStatus to 'submitted'
  const updatedProj = db.update('projects', proj.id, {
    approvalStatus: 'submitted',
    esgCompletion: 100,
    lastUpdated: new Date().toISOString().substring(0, 10),
  });

  // 2. Update or create the approval workflow in approval_workflows
  const workflows = db.getTable('approval_workflows');
  let wf = workflows.find(w => w.projectId === proj.id || w.projectCode === proj.code);

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (wf) {
    wf.overallStatus = 'submitted';
    wf.currentStepIndex = 1; // Stage 1: BU Manager Review
    wf.submittedBy = userName;
    wf.submittedAt = timestamp;
    if (wf.steps && wf.steps.length > 0) {
      wf.steps[0].status = 'approved';
      wf.steps[0].actionBy = userName;
      wf.steps[0].actionAt = timestamp;
      wf.steps[0].comments = 'ESG disclosures and verified telemetry submitted.';
      if (wf.steps.length > 1) {
        wf.steps[1].status = 'in_progress';
      }
      for (let i = 2; i < wf.steps.length; i++) {
        wf.steps[i].status = 'pending';
      }
    }
    db.setTable('approval_workflows', workflows);
  } else {
    wf = {
      id: `wf-${proj.code.toLowerCase()}-${category.toLowerCase().substring(0, 3)}`,
      projectId: proj.id,
      projectCode: proj.code,
      projectName: proj.name,
      category,
      reportingPeriod: 'FY 2025-26',
      currentStepIndex: 1,
      overallStatus: 'submitted',
      submittedBy: userName,
      submittedAt: timestamp,
      steps: [
        {
          level: 'project',
          label: '1. Project Data Entry',
          role: 'project_user',
          status: 'approved',
          actionBy: userName,
          actionAt: timestamp,
          comments: 'Operational ESG data entry and telemetry verified by Project Lead.'
        },
        {
          level: 'bu',
          label: '2. BU Manager Review',
          role: 'bu_manager',
          status: 'in_progress',
          actionBy: 'Vikram Malhotra',
          actionAt: '',
          comments: ''
        },
        {
          level: 'subsidiary',
          label: '3. Subsidiary Admin Signoff',
          role: 'subsidiary_admin',
          status: 'pending',
          actionBy: 'Sunita Rao',
          actionAt: '',
          comments: ''
        },
        {
          level: 'esg_team',
          label: '4. ESG Team Technical Validation',
          role: 'esg_team',
          status: 'pending',
          actionBy: 'Dr. Ananya Sen',
          actionAt: '',
          comments: ''
        },
        {
          level: 'management',
          label: '5. Group Admin & Management Signoff',
          role: 'group_admin_management',
          status: 'pending',
          actionBy: 'Deepak Khaitan',
          actionAt: '',
          comments: ''
        }
      ],
      evidenceCount: 6,
      summaryHighlights: `${category} data submitted to BU Manager for verification.`
    };
    db.insert('approval_workflows', wf);
  }

  db.logAudit(userName, 'Project Lead', 'Submitted', 'Approval Workflow', wf.id, `Submitted ${proj.name} for BU Manager review`);
  return { project: updatedProj, workflow: wf };
}

app.put('/api/v1/projects/:id', (req, res) => {
  const updated = db.update('projects', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });

  if (req.body.approvalStatus === 'submitted') {
    handleProjectSubmission(req.params.id, req.body.userName, req.body.category || 'Environmental');
  }

  db.logAudit('Project User', 'Project Lead', 'Updated', 'Project Entity', req.params.id, `Updated fields`);
  res.json(updated);
});

app.post('/api/v1/projects/:id/submit', (req, res) => {
  const result = handleProjectSubmission(req.params.id, req.body.userName, req.body.category || 'Environmental');
  if (!result) return res.status(404).json({ error: 'Project not found' });
  res.json(result);
});

// ==========================================
// 5. ESG DATA (Environmental, Social, Governance)
// ==========================================
app.get('/api/v1/esg', (req, res) => {
  res.json({
    environmental: db.getTable('environmental_data'),
    social: db.getTable('social_data'),
    governance: db.getTable('governance_data')
  });
});

app.get('/api/v1/esg/environmental', (req, res) => {
  res.json(db.getTable('environmental_data'));
});

app.post('/api/v1/esg/environmental', (req, res) => {
  const body = req.body;
  const envTable = db.getTable('environmental_data');
  const existing = envTable.find(e => e.projectId === body.projectId);

  // Real calculations
  const electricityKwh = Number(body.electricityKwh) || 0;
  const fuelLitres = Number(body.fuelLitres) || 0;
  // 1 kWh = 0.0036 GJ; 1 L diesel = 0.038 GJ
  const calculatedEnergyGj = Number(((electricityKwh * 0.0036) + (fuelLitres * 0.038)).toFixed(1));
  
  // Scope 1: fuelLitres * 2.68 kg CO2/L / 1000
  const calculatedScope1 = Number(body.scope1GhgTco2e !== undefined ? body.scope1GhgTco2e : ((fuelLitres * 2.68) / 1000).toFixed(0));
  // Scope 2: electricityKwh * 0.82 kg CO2/kWh / 1000 (adjusted for renewable share)
  const renewablePct = Number(body.renewableEnergyPct) || 0;
  const gridElectricityKwh = electricityKwh * (1 - (renewablePct / 100));
  const calculatedScope2 = Number(body.scope2GhgTco2e !== undefined ? body.scope2GhgTco2e : ((gridElectricityKwh * 0.82) / 1000).toFixed(0));

  const record = {
    id: existing ? existing.id : `env-${Date.now()}`,
    projectId: body.projectId || 'proj-1',
    reportingPeriod: body.reportingPeriod || 'FY 2025-26',
    electricityKwh,
    fuelLitres,
    renewableEnergyPct: renewablePct,
    totalEnergyGj: calculatedEnergyGj,
    waterWithdrawalKl: Number(body.waterWithdrawalKl) || 0,
    waterConsumptionKl: Number(body.waterConsumptionKl) || 0,
    waterRecycledKl: Number(body.waterRecycledKl) || 0,
    waterRecycledPct: Number(body.waterRecycledPct) || 0,
    hazardousWasteMt: Number(body.hazardousWasteMt) || 0,
    nonHazardousWasteMt: Number(body.nonHazardousWasteMt) || 0,
    wasteRecycledPct: Number(body.wasteRecycledPct) || 0,
    scope1GhgTco2e: calculatedScope1,
    scope2GhgTco2e: calculatedScope2,
    scope3GhgTco2e: Number(body.scope3GhgTco2e) || 0,
    status: body.status || 'draft',
    evidenceAttached: body.evidenceAttached || '',
    remarks: body.remarks || '',
    lastUpdated: new Date().toISOString().substring(0, 10)
  };

  if (existing) {
    db.update('environmental_data', existing.id, record);
  } else {
    db.insert('environmental_data', record);
  }

  // Auto-update project ESG completion & approvalStatus
  if (record.status === 'submitted') {
    handleProjectSubmission(record.projectId, body.userName, 'Environmental');
  } else if (record.status === 'draft') {
    db.update('projects', record.projectId, { approvalStatus: 'draft', esgCompletion: 95, lastUpdated: record.lastUpdated });
  } else {
    db.update('projects', record.projectId, { esgCompletion: 96, lastUpdated: record.lastUpdated });
  }

  // Add audit trail
  db.logAudit(body.userName || 'Project User', 'Project Lead', record.status === 'submitted' ? 'Submitted' : 'Updated', 'Environmental Data', record.id, `Electricity: ${electricityKwh} kWh, Fuel: ${fuelLitres} L`);

  res.status(201).json(record);
});

app.post('/api/v1/esg/social', (req, res) => {
  const body = req.body;
  const record = {
    id: `soc-${Date.now()}`,
    projectId: body.projectId || 'proj-1',
    reportingPeriod: body.reportingPeriod || 'FY 2025-26',
    permanentEmployees: Number(body.permanentEmployees) || 1420,
    femaleEmployees: Number(body.femaleEmployees) || 344,
    femaleEmployeesPct: Number(body.femaleEmployeesPct) || 24.2,
    differentlyAbled: Number(body.differentlyAbled) || 18,
    contractWorkers: Number(body.contractWorkers) || 4200,
    avgTrainingHoursPerPerson: Number(body.avgTrainingHoursPerPerson) || 36.4,
    ltifr: Number(body.ltifr) || 0.12,
    recordableInjuries: Number(body.recordableInjuries) || 4,
    fatalities: Number(body.fatalities) || 0,
    turnoverPct: Number(body.turnoverPct) || 7.4,
    csrSpentCr: Number(body.csrSpentCr) || 18.5,
    status: body.status || 'draft',
    lastUpdated: new Date().toISOString().substring(0, 10)
  };

  db.insert('social_data', record);
  if (record.status === 'submitted') {
    handleProjectSubmission(record.projectId, body.userName, 'Social');
  } else if (record.status === 'draft') {
    db.update('projects', record.projectId, { approvalStatus: 'draft', lastUpdated: record.lastUpdated });
  }
  db.logAudit(body.userName || 'Project User', 'Project Lead', record.status === 'submitted' ? 'Submitted' : 'Updated', 'Social Data', record.id, `Saved Workforce & Safety Census`);
  res.status(201).json(record);
});

app.post('/api/v1/esg/governance', (req, res) => {
  const body = req.body;
  const record = {
    id: `gov-${Date.now()}`,
    projectId: body.projectId || 'proj-1',
    reportingPeriod: body.reportingPeriod || 'FY 2025-26',
    antiCorruptionPolicyActive: true,
    operationsCoveredPct: 100,
    whistleblowerCasesReceived: Number(body.whistleblowerCasesReceived) || 3,
    whistleblowerCasesResolved: Number(body.whistleblowerCasesResolved) || 3,
    status: body.status || 'draft',
    lastUpdated: new Date().toISOString().substring(0, 10)
  };

  db.insert('governance_data', record);
  if (record.status === 'submitted') {
    handleProjectSubmission(record.projectId, body.userName, 'Governance');
  } else if (record.status === 'draft') {
    db.update('projects', record.projectId, { approvalStatus: 'draft', lastUpdated: record.lastUpdated });
  }
  db.logAudit(body.userName || 'Project User', 'Project Lead', record.status === 'submitted' ? 'Submitted' : 'Updated', 'Governance Data', record.id, `Updated Policy Disclosures`);
  res.status(201).json(record);
});

// Single-click full ESG submission endpoint ("as once")
const handleEsgSubmitAll = (req: any, res: any) => {
  const { projectId = 'proj-1', userName = 'Project User', category = 'ESG Consolidated' } = req.body;
  const result = handleProjectSubmission(projectId, userName, category);
  if (!result) return res.status(404).json({ error: 'Project not found' });
  res.json({
    success: true,
    message: `All ESG disclosures for ${result.project.name} submitted successfully to Business Unit Manager`,
    ...result
  });
};

app.post('/api/v1/esg/submit-all', handleEsgSubmitAll);
app.post('/api/v1/esg/submit', handleEsgSubmitAll);

app.get('/api/v1/esg/metrics', (req, res) => {
  const { category, projectCode } = req.query;
  let metrics = db.getTable('esg_metrics') || [];
  if (category) {
    metrics = metrics.filter((m: any) => m.category === category);
  }
  if (projectCode) {
    metrics = metrics.filter((m: any) => m.projectCode === projectCode);
  }
  res.json(metrics);
});

app.put('/api/v1/esg/metrics/:id', (req, res) => {
  const updated = db.update('esg_metrics', req.params.id, req.body);
  if (!updated) {
    db.insert('esg_metrics', { id: req.params.id, ...req.body });
    return res.json({ id: req.params.id, ...req.body });
  }
  db.logAudit('Project User', 'Project Lead', 'Updated', 'ESG Metric', req.params.id, `Status updated to ${req.body.status || 'updated'}`);
  res.json(updated);
});

// ==========================================
// 6. AI ANOMALY DETECTION ENGINE
// ==========================================
app.post('/api/v1/validation/anomalies/check', (req, res) => {
  const { metric, value, historical = [], category = 'Environmental', upperLimit, lowerLimit, baseline, ruleCode } = req.body;
  const result = evaluateAnomaly(metric, Number(value), historical, {
    category: category.toLowerCase() as any,
    upperLimit: upperLimit !== undefined ? Number(upperLimit) : undefined,
    lowerLimit: lowerLimit !== undefined ? Number(lowerLimit) : undefined,
    baseline: baseline !== undefined ? Number(baseline) : undefined,
    ruleCode
  });

  if (result.isAnomaly) {
    const alertRecord = {
      id: `val-ai-${Date.now()}`,
      recordId: 'ai-detection',
      metric,
      project: 'Active Project',
      businessUnit: 'Active Unit',
      subsidiary: 'Active Subsidiary',
      category,
      currentValue: `${value}`,
      previousValue: `${result.expectedBaseline}`,
      rule: result.ruleCode || 'AI-STATISTICAL-OUTLIER',
      severity: result.severity,
      status: 'open',
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      details: result.explanation,
      justification: ''
    };
    db.insert('validation_results', alertRecord);
  }

  res.json(result);
});

app.get('/api/v1/validation/anomalies', (req, res) => {
  const valResults = db.getTable('validation_results');
  res.json(valResults);
});

// ==========================================
// 6b. EVIDENCE DOCUMENTS & INVOICES
// ==========================================
app.get('/api/v1/projects/:id/documents', (req, res) => {
  const { id } = req.params;
  const { category } = req.query;
  let docs = db.getTable('documents') || [];
  docs = docs.filter(d => d.projectId === id || d.projectCode === id || id === 'all');
  if (category && category !== 'all') {
    docs = docs.filter(d => d.category === category);
  }
  res.json(docs);
});

app.get('/api/v1/documents', (req, res) => {
  const { projectId, category } = req.query;
  let docs = db.getTable('documents') || [];
  if (projectId) {
    docs = docs.filter(d => d.projectId === projectId || d.projectCode === projectId);
  }
  if (category && category !== 'all') {
    docs = docs.filter(d => d.category === category);
  }
  res.json(docs);
});

app.post('/api/v1/projects/:id/documents', (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const projs = db.getTable('projects');
  const proj = projs.find(p => p.id === id || p.code === id);

  const newDoc = {
    id: `doc-${Date.now()}`,
    projectId: id,
    projectCode: proj ? proj.code : 'SMP-500',
    title: body.title || body.fileName || 'Untitled Document',
    fileName: body.fileName || 'Document.pdf',
    fileType: body.fileType || 'pdf',
    fileSize: body.fileSize || '1.5 MB',
    category: body.category || 'environmental',
    subCategory: body.subCategory || 'General Evidence',
    description: body.description || '',
    uploadedBy: body.uploadedBy || 'Rajesh Verma',
    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    verified: true,
    sha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  };

  db.insert('documents', newDoc);
  db.logAudit(newDoc.uploadedBy, 'Project Lead', 'Uploaded', 'Evidence Document', newDoc.id, `Uploaded ${newDoc.fileName} (${newDoc.category})`);

  res.status(201).json(newDoc);
});

app.delete('/api/v1/projects/:id/documents/:docId', (req, res) => {
  const { docId } = req.params;
  const deleted = db.delete('documents', docId);
  db.logAudit('Project User', 'Project Lead', 'Deleted', 'Evidence Document', docId, `Removed evidence record`);
  res.json({ success: !!deleted });
});

// ==========================================
// 7. BRSR SECTIONS & PRINCIPLES
// ==========================================
app.get('/api/v1/brsr/sections', (req, res) => {
  res.json(db.getTable('brsr_sections'));
});

app.get('/api/v1/brsr/principles', (req, res) => {
  res.json(db.getTable('brsr_principles'));
});

app.get('/api/v1/brsr/indicators', (req, res) => {
  const indicators = db.getTable('brsr_indicators');
  const responses = db.getTable('brsr_responses');
  const enriched = indicators.map(ind => {
    const resp = responses.find(r => r.indicatorCode === ind.code);
    return {
      ...ind,
      currentValue: resp ? resp.calculatedValue : 'Not recorded',
      status: resp ? resp.status : 'not_started',
      evidenceFile: resp ? resp.evidenceFile : null
    };
  });
  res.json(enriched);
});

app.get('/api/v1/brsr/responses', (req, res) => {
  res.json(db.getTable('brsr_responses'));
});

app.post('/api/v1/brsr/responses', (req, res) => {
  const body = req.body;
  const newResp = {
    id: `resp-${Date.now()}`,
    indicatorCode: body.indicatorCode,
    reportingPeriod: body.reportingPeriod || 'FY 2025-26',
    calculatedValue: body.calculatedValue,
    status: body.status || 'validated',
    evidenceFile: body.evidenceFile || '',
    auditorNotes: body.auditorNotes || ''
  };
  db.insert('brsr_responses', newResp);
  db.logAudit('ESG Team', 'Chief Sustainability Officer', 'Updated', 'BRSR Response', body.indicatorCode, `Response updated: ${body.calculatedValue}`);
  res.status(201).json(newResp);
});

// ==========================================
// 8. VALIDATION
// ==========================================
app.get('/api/v1/validation', (req, res) => {
  res.json(db.getTable('validation_results'));
});

app.get('/api/v1/validation/:id', (req, res) => {
  const item = db.getTable('validation_results').find(v => v.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Validation item not found' });
  res.json(item);
});

app.post('/api/v1/validation/run', (req, res) => {
  const envData = db.getTable('environmental_data');
  const valResults = db.getTable('validation_results');
  let newFlags = 0;

  envData.forEach(e => {
    if (e.waterRecycledKl > e.waterWithdrawalKl) {
      newFlags++;
    }
  });

  db.logAudit('System Engine', 'Automated Service', 'Validated', 'Validation Engine', 'All Records', `Validation scan completed: 0 critical errors`);
  res.json({
    status: 'success',
    scannedCount: envData.length,
    newFlags,
    message: 'Validation engine scanned all stored database records.'
  });
});

app.put('/api/v1/validation/:id', (req, res) => {
  const updated = db.update('validation_results', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Validation record not found' });
  db.logAudit('Auditor', 'Reviewer', 'Validated', 'Validation Flag', req.params.id, `Status updated to ${req.body.status}`);
  res.json(updated);
});

// ==========================================
// 9. APPROVALS WORKFLOW
// ==========================================
app.get('/api/v1/approvals', (req, res) => {
  res.json(db.getTable('approval_workflows'));
});

app.get('/api/v1/approvals/:id', (req, res) => {
  const workflows = db.getTable('approval_workflows');
  const item = workflows.find(a => 
    a.id === req.params.id || 
    (req.params.id === 'appr-1' && a.id === 'wf-smp-500-env') || 
    a.projectId === req.params.id
  ) || workflows[0];
  if (!item) return res.status(404).json({ error: 'Approval item not found' });
  res.json(item);
});

app.post('/api/v1/approvals/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, comments, userName = 'Current User', userRole = 'Approver' } = req.body;
  const workflows = db.getTable('approval_workflows');
  let wf = workflows.find(w => 
    w.id === id || 
    (id === 'appr-1' && w.id === 'wf-smp-500-env') || 
    w.projectId === id ||
    w.projectCode === id
  );

  // If no workflow found, auto-provision from project
  if (!wf) {
    const proj = db.getTable('projects').find(p => p.id === id || p.code === id);
    if (proj) {
      const subResult = handleProjectSubmission(proj.id, proj.leadPerson || 'Project User', 'Environmental');
      if (subResult) {
        wf = subResult.workflow;
      }
    }
  }

  if (!wf) {
    wf = workflows[0];
  }

  if (!wf) return res.status(404).json({ error: 'Workflow not found' });

  const currentIdx = wf.currentStepIndex;
  const steps = [...wf.steps];

  if (action === 'approve') {
    if (steps[currentIdx]) {
      steps[currentIdx] = {
        ...steps[currentIdx],
        status: 'approved',
        actionBy: userName,
        actionAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        comments: comments || 'Approved and validated in accordance with compliance standards.'
      };
    }
    const nextIdx = Math.min(currentIdx + 1, steps.length - 1);
    if (steps[nextIdx] && steps[nextIdx].status === 'pending') {
      steps[nextIdx].status = 'in_progress';
    }
    const isFinal = currentIdx >= steps.length - 1;

    let targetOverallStatus: string;
    if (isFinal) {
      targetOverallStatus = 'approved';
    } else if (currentIdx === 1) {
      // Step 1: BU Manager has validated -> Forwarded to Subsidiary Admin
      targetOverallStatus = 'under_subsidiary_review';
    } else if (currentIdx === 2) {
      // Step 2: Subsidiary Admin validated -> Forwarded to ESG Team
      targetOverallStatus = 'under_esg_review';
    } else {
      targetOverallStatus = 'under_review';
    }

    wf.currentStepIndex = nextIdx;
    wf.steps = steps;
    wf.overallStatus = targetOverallStatus;

    db.update('projects', wf.projectId, { approvalStatus: targetOverallStatus });
    db.logAudit(userName, userRole, 'Approved', 'Approval Workflow', id, `Step approved: ${steps[currentIdx]?.label} -> Forwarded to next stage`);
  } else if (action === 'request_correction' || action === 'reject') {
    if (steps[currentIdx]) {
      steps[currentIdx] = {
        ...steps[currentIdx],
        status: 'rejected',
        actionBy: userName,
        comments: comments || 'Correction required by reviewer.'
      };
    }
    wf.overallStatus = 'correction_required';
    db.update('projects', wf.projectId, { approvalStatus: 'correction_required' });
    db.logAudit(userName, userRole, 'Rejected', 'Approval Workflow', id, `Correction requested: ${comments}`);
  }

  db.setTable('approval_workflows', workflows);
  res.json(wf);
});

// ==========================================
// 10. ENTERPRISE CONSOLIDATION
// ==========================================
app.get('/api/v1/consolidation', (req, res) => {
  const subs = db.getTable('subsidiaries');
  const bus = db.getTable('business_units');
  const projs = db.getTable('projects');
  const env = db.getTable('environmental_data');

  // Compute rollups
  const subsidiaryRollups = subs.map(sub => {
    const subProjs = projs.filter(p => p.subsidiaryId === sub.id);
    const projIds = subProjs.map(p => p.id);
    const subEnv = env.filter(e => projIds.includes(e.projectId));

    const totalScope1 = subEnv.reduce((a, e) => a + (Number(e.scope1GhgTco2e) || 0), 0);
    const totalScope2 = subEnv.reduce((a, e) => a + (Number(e.scope2GhgTco2e) || 0), 0);
    const totalEnergy = subEnv.reduce((a, e) => a + (Number(e.totalEnergyGj) || 0), 0);
    const totalWater = subEnv.reduce((a, e) => a + (Number(e.waterWithdrawalKl) || 0), 0);

    return {
      subsidiaryId: sub.id,
      name: sub.name,
      code: sub.code,
      projectsCount: subProjs.length,
      esgCompletion: sub.esgCompletion,
      scope1Ghg: totalScope1,
      scope2Ghg: totalScope2,
      totalEnergyGj: totalEnergy,
      waterWithdrawalKl: totalWater,
      consolidationStatus: 'consolidated'
    };
  });

  res.json({
    reportingPeriod: 'FY 2025-26',
    organizationName: 'Apex Infrastructure Group Limited',
    subsidiaryRollups,
    eliminationAdjustments: 'Zero inter-company energy transfers required in current boundary.',
    consolidationReadinessPct: 91.2
  });
});

// ==========================================
// 11. REPORTS
// ==========================================
app.get('/api/v1/reports', (req, res) => {
  res.json(db.getTable('reports'));
});

app.post('/api/v1/reports/generate', (req, res) => {
  const body = req.body;
  const newReport = {
    id: `rep-${Date.now()}`,
    title: body.title || 'SEBI BRSR Comprehensive Annual Report FY 2025-26',
    type: body.type || 'SEBI Mandatory Regulatory Filing',
    format: 'PDF + XBRL',
    generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    fileSize: '4.2 MB',
    status: 'Final Approved',
    reportingBoundary: 'Consolidated (Top 1000 Listed Entities)'
  };
  db.insert('reports', newReport);
  db.logAudit('Group Admin', 'Compliance Officer', 'Generated Report', 'BRSR Report', newReport.id, `Report generated from approved database figures`);
  res.status(201).json(newReport);
});

// ==========================================
// 12. SDGs & AUDIT & USERS
// ==========================================
app.get('/api/v1/sdgs', (req, res) => {
  res.json({
    goals: db.getTable('sdg_goals'),
    mappings: db.getTable('esg_sdg_mapping')
  });
});

app.post('/api/v1/sdgs/map', (req, res) => {
  const newMap = {
    id: `map-${Date.now()}`,
    esgActivity: req.body.esgActivity,
    sdgNumber: Number(req.body.sdgNumber),
    reason: req.body.reason,
    reportingPeriod: req.body.reportingPeriod || 'FY 2025-26'
  };
  db.insert('esg_sdg_mapping', newMap);
  db.logAudit('ESG Team', 'Sustainability Lead', 'Created', 'SDG Mapping', newMap.id, `Mapped to SDG ${newMap.sdgNumber}`);
  res.status(201).json(newMap);
});

app.get('/api/v1/audit', (req, res) => {
  res.json(db.getTable('audit_logs'));
});

app.get('/api/v1/users', (req, res) => {
  res.json(db.getTable('users'));
});

app.post('/api/v1/users', (req, res) => {
  const newUser = {
    id: `u-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role || 'project_user',
    roleTitle: req.body.roleTitle || 'ESG Contributor',
    organization: 'Apex Infrastructure Group',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  };
  db.insert('users', newUser);
  db.logAudit('Group Admin', 'Admin', 'Created', 'User Account', newUser.id, `Created user ${newUser.name}`);
  res.status(201).json(newUser);
});

// ==========================================
// 13. REVIEW CENTER & CORRECTION REQUEST WORKFLOW
// ==========================================
app.get('/api/v1/reviews', (req, res) => {
  const { projectId, submissionId, status, isDraft, section } = req.query;
  let reviews = db.getTable('review_requests') || [];

  if (projectId && projectId !== 'all') {
    reviews = reviews.filter((r: any) => r.projectId === projectId || r.projectCode === projectId);
  }
  if (submissionId && submissionId !== 'all') {
    reviews = reviews.filter((r: any) => r.submissionId === submissionId);
  }
  if (status && status !== 'all') {
    reviews = reviews.filter((r: any) => r.status === status);
  }
  if (isDraft !== undefined) {
    const draftBool = isDraft === 'true' || isDraft === true;
    reviews = reviews.filter((r: any) => !!r.isDraft === draftBool);
  }
  if (section && section !== 'all') {
    reviews = reviews.filter((r: any) => r.section.toLowerCase() === (section as string).toLowerCase());
  }

  res.json(reviews);
});

app.get('/api/v1/reviews/:id', (req, res) => {
  const reviews = db.getTable('review_requests') || [];
  const review = reviews.find((r: any) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review request not found' });
  res.json(review);
});

app.post('/api/v1/reviews', (req, res) => {
  const body = req.body;
  const projects = db.getTable('projects') || [];
  const proj = projects.find((p: any) => p.id === body.projectId || p.code === body.projectId);

  const isDraft = body.isDraft ?? false;
  const status = isDraft ? 'OPEN' : 'CORRECTION_REQUESTED';
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newReview = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    submissionId: body.submissionId || (proj ? `subm-${proj.code.toLowerCase()}-fy26` : 'subm-1'),
    projectId: body.projectId || (proj ? proj.id : 'proj-1'),
    projectCode: proj ? proj.code : (body.projectCode || 'SMP-500'),
    projectName: proj ? proj.name : (body.projectName || 'Operational Facility'),
    reportingPeriod: body.reportingPeriod || 'FY 2025-26',
    reviewerId: body.reviewerId || 'usr-3',
    reviewerName: body.reviewerName || 'Vikram Malhotra',
    reviewerRole: body.reviewerRole || 'Business Unit Manager',
    assigneeId: body.assigneeId || 'usr-1',
    assigneeName: proj?.leadPerson || body.assigneeName || 'Rajesh Verma',
    assigneeRole: 'Project Manager',
    section: body.section || 'Environmental',
    category: body.category || 'General',
    metric: body.metric || 'Reported Value',
    fieldPath: body.fieldPath || 'environmental/energy',
    currentValue: body.currentValue || '',
    previousValue: body.previousValue || '',
    variancePct: body.variancePct || 0,
    aiAnomalySeverity: body.aiAnomalySeverity || 'low',
    issueType: body.issueType || 'Verification Required',
    priority: body.priority || 'Medium',
    comment: body.comment || '',
    requiredAction: body.requiredAction || 'Verify value and upload supporting evidence.',
    status,
    isDraft,
    thread: [
      {
        id: `th-${Date.now()}`,
        author: body.reviewerName || 'Vikram Malhotra',
        role: 'Business Unit Manager',
        message: body.comment || 'Correction requested on submitted metric.',
        timestamp,
        type: 'comment'
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.insert('review_requests', newReview);

  // If not draft, create notification for Project Manager
  if (!isDraft) {
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: 'usr-1',
      type: 'CORRECTION_REQUESTED',
      title: 'Correction Requested',
      message: newReview.comment,
      projectId: newReview.projectId,
      projectName: newReview.projectName,
      submissionId: newReview.submissionId,
      reviewRequestId: newReview.id,
      section: newReview.section,
      category: newReview.category,
      metric: newReview.metric,
      fieldPath: newReview.fieldPath,
      priority: newReview.priority,
      isRead: false,
      createdAt: 'Just now'
    };
    db.insert('notifications', newNotif);

    // Update project approvalStatus to correction_required if not already
    if (proj) {
      db.update('projects', proj.id, { approvalStatus: 'correction_required' });
    }
  }

  db.logAudit(
    newReview.reviewerName,
    'BU Manager',
    isDraft ? 'Review Draft Saved' : 'Correction Request Sent',
    'Review Request',
    newReview.id,
    `${newReview.section} -> ${newReview.metric}: ${newReview.comment}`
  );

  res.status(201).json(newReview);
});

app.put('/api/v1/reviews/:id', (req, res) => {
  const reviews = db.getTable('review_requests') || [];
  const existing = reviews.find((r: any) => r.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Review not found' });

  const updated = db.update('review_requests', req.params.id, {
    ...req.body,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  });

  res.json(updated);
});

app.post('/api/v1/reviews/:id/send', (req, res) => {
  const reviews = db.getTable('review_requests') || [];
  const review = reviews.find((r: any) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updated = db.update('review_requests', req.params.id, {
    isDraft: false,
    status: 'CORRECTION_REQUESTED',
    updatedAt: timestamp
  });

  // Create notification for Project Manager
  const notif = {
    id: `notif-${Date.now()}`,
    userId: 'usr-1',
    type: 'CORRECTION_REQUESTED',
    title: 'Correction Requested',
    message: review.comment,
    projectId: review.projectId,
    projectName: review.projectName,
    submissionId: review.submissionId,
    reviewRequestId: review.id,
    section: review.section,
    category: review.category,
    metric: review.metric,
    fieldPath: review.fieldPath,
    priority: review.priority,
    isRead: false,
    createdAt: 'Just now'
  };
  db.insert('notifications', notif);

  // Mark project as correction_required
  db.update('projects', review.projectId, { approvalStatus: 'correction_required' });

  db.logAudit(
    review.reviewerName || 'Vikram Malhotra',
    'BU Manager',
    'Correction Request Sent',
    'Review Request',
    review.id,
    `Sent correction request for ${review.section} -> ${review.metric}`
  );

  res.json(updated);
});

app.post('/api/v1/reviews/bulk-send', (req, res) => {
  const { submissionId, projectId, reviewerName = 'Vikram Malhotra' } = req.body;
  const reviews = db.getTable('review_requests') || [];
  let sentCount = 0;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

  reviews.forEach((r: any) => {
    const match = (submissionId && r.submissionId === submissionId) || (projectId && r.projectId === projectId);
    if (match && r.isDraft) {
      r.isDraft = false;
      r.status = 'CORRECTION_REQUESTED';
      r.updatedAt = timestamp;
      sentCount++;

      // Create notification for each
      db.insert('notifications', {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: 'usr-1',
        type: 'CORRECTION_REQUESTED',
        title: `Correction Requested (${r.metric})`,
        message: r.comment,
        projectId: r.projectId,
        projectName: r.projectName,
        submissionId: r.submissionId,
        reviewRequestId: r.id,
        section: r.section,
        category: r.category,
        metric: r.metric,
        fieldPath: r.fieldPath,
        priority: r.priority,
        isRead: false,
        createdAt: 'Just now'
      });
    }
  });

  if (sentCount > 0) {
    db.setTable('review_requests', reviews);
    if (projectId) {
      db.update('projects', projectId, { approvalStatus: 'correction_required' });
    }
    db.logAudit(
      reviewerName,
      'BU Manager',
      'Sent Bulk Review Comments',
      'Submission',
      submissionId || projectId,
      `Dispatched ${sentCount} correction requests to Project Manager`
    );
  }

  res.json({ success: true, sentCount });
});

app.post('/api/v1/reviews/:id/respond', (req, res) => {
  const { id } = req.params;
  const { response, correctedValue, evidenceName, responderName = 'Rajesh Verma' } = req.body;
  const reviews = db.getTable('review_requests') || [];
  const review = reviews.find((r: any) => r.id === id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const thread = Array.isArray(review.thread) ? [...review.thread] : [];

  thread.push({
    id: `th-${Date.now()}`,
    author: responderName,
    role: 'Project Manager',
    message: response || 'Corrected data and uploaded supporting verification.',
    timestamp,
    type: 'response',
    attachment: evidenceName
  });

  // If a correctedValue is provided, update underlying single-source-of-truth data
  if (correctedValue !== undefined) {
    if (review.metric === 'Grid Electricity' || review.fieldPath.includes('grid-electricity')) {
      const numVal = Number(String(correctedValue).replace(/[^0-9.]/g, ''));
      if (!isNaN(numVal) && numVal > 0) {
        const envTable = db.getTable('environmental_data') || [];
        const envItem = envTable.find((e: any) => e.projectId === review.projectId);
        if (envItem) {
          envItem.electricityKwh = numVal;
          db.setTable('environmental_data', envTable);
        }
      }
    } else if (review.metric.includes('Diesel') || review.fieldPath.includes('fuel')) {
      const numVal = Number(String(correctedValue).replace(/[^0-9.]/g, ''));
      if (!isNaN(numVal) && numVal > 0) {
        const envTable = db.getTable('environmental_data') || [];
        const envItem = envTable.find((e: any) => e.projectId === review.projectId);
        if (envItem) {
          envItem.fuelLitres = numVal;
          db.setTable('environmental_data', envTable);
        }
      }
    }
  }

  const updated = db.update('review_requests', id, {
    status: 'CORRECTION_SUBMITTED',
    currentValue: correctedValue !== undefined ? String(correctedValue) : review.currentValue,
    thread,
    updatedAt: timestamp
  });

  // Notify BU Manager Vikram Malhotra
  db.insert('notifications', {
    id: `notif-${Date.now()}`,
    userId: 'usr-3', // Vikram Malhotra
    type: 'CORRECTION_SUBMITTED',
    title: 'Correction Submitted',
    message: `${responderName} has responded to correction request on ${review.section} → ${review.metric}: "${response}"`,
    projectId: review.projectId,
    projectName: review.projectName,
    submissionId: review.submissionId,
    reviewRequestId: review.id,
    section: review.section,
    category: review.category,
    metric: review.metric,
    fieldPath: review.fieldPath,
    priority: review.priority,
    isRead: false,
    createdAt: 'Just now'
  });

  db.logAudit(
    responderName,
    'Project Manager',
    'Correction Submitted',
    'Review Request',
    review.id,
    `Responded with: ${response}`
  );

  res.json(updated);
});

app.post('/api/v1/reviews/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { resolutionComment, reviewerName = 'Vikram Malhotra', status = 'RESOLVED' } = req.body;
  const reviews = db.getTable('review_requests') || [];
  const review = reviews.find((r: any) => r.id === id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const thread = Array.isArray(review.thread) ? [...review.thread] : [];

  thread.push({
    id: `th-${Date.now()}`,
    author: reviewerName,
    role: 'Business Unit Manager',
    message: resolutionComment || (status === 'APPROVED' ? 'Approved by reviewer.' : 'Correction reviewed and accepted.'),
    timestamp,
    type: 'resolution'
  });

  const updated = db.update('review_requests', id, {
    status,
    thread,
    updatedAt: timestamp,
    resolvedAt: timestamp
  });

  // Notify Project Manager
  db.insert('notifications', {
    id: `notif-${Date.now()}`,
    userId: 'usr-1',
    type: 'REVIEW_RESOLVED',
    title: `Review Item ${status === 'APPROVED' ? 'Approved' : 'Resolved'}`,
    message: `${review.section} → ${review.metric} has been marked ${status} by BU Manager ${reviewerName}.`,
    projectId: review.projectId,
    projectName: review.projectName,
    submissionId: review.submissionId,
    reviewRequestId: review.id,
    section: review.section,
    category: review.category,
    metric: review.metric,
    fieldPath: review.fieldPath,
    priority: review.priority,
    isRead: false,
    createdAt: 'Just now'
  });

  db.logAudit(
    reviewerName,
    'BU Manager',
    `Review ${status}`,
    'Review Request',
    review.id,
    `Marked ${review.metric} as ${status}`
  );

  res.json(updated);
});

app.delete('/api/v1/reviews/:id', (req, res) => {
  const deleted = db.delete('review_requests', req.params.id);
  res.json({ success: !!deleted });
});

// ==========================================
// 14. NOTIFICATIONS
// ==========================================
app.get('/api/v1/notifications', (req, res) => {
  const { userId } = req.query;
  let notifs = db.getTable('notifications') || [];
  if (userId && userId !== 'all') {
    notifs = notifs.filter((n: any) => !n.userId || n.userId === userId || userId === 'all');
  }
  res.json(notifs);
});

app.put('/api/v1/notifications/:id/read', (req, res) => {
  const notifs = db.getTable('notifications') || [];
  const notif = notifs.find((n: any) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.isRead = true;
  db.setTable('notifications', notifs);
  res.json(notif);
});

app.put('/api/v1/notifications/read-all', (req, res) => {
  const notifs = db.getTable('notifications') || [];
  notifs.forEach((n: any) => { n.isRead = true; });
  db.setTable('notifications', notifs);
  res.json({ success: true, count: notifs.length });
});

app.post('/api/v1/notifications', (req, res) => {
  const newNotif = {
    id: `notif-${Date.now()}`,
    ...req.body,
    isRead: false,
    createdAt: 'Just now'
  };
  db.insert('notifications', newNotif);
  res.status(201).json(newNotif);
});

export { app };
export default app;

if (process.env.STANDALONE_SERVER === 'true') {
  app.listen(PORT, () => {
    console.log(`[ECO METRICS BACKEND] API server listening on http://localhost:${PORT}`);
  });
}

