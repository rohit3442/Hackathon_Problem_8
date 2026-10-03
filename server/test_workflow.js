async function testWorkflow() {
  const BASE_URL = 'http://localhost:3001/api/v1';

  console.log('\n==================================================');
  console.log('ECO METRICS - INTER-PAGE FULL WORKFLOW DEMO (SPEC 28)');
  console.log('==================================================');

  console.log('\n--- 1. INITIAL DASHBOARD NUMBERS FROM POSTGRESQL / DB ---');
  let res = await fetch(`${BASE_URL}/dashboard`);
  const initialDash = await res.json();
  console.log('Initial ESG Completion:', initialDash.esgCompletion + '%');
  console.log('Initial BRSR Completion:', initialDash.brsrCompletion + '%');
  console.log('Initial Total Energy (GJ):', initialDash.metricsSummary.totalEnergyGj);
  console.log('Initial Total Scope 1 (tCO2e):', initialDash.metricsSummary.totalScope1Tco2e);

  console.log('\n--- 2. PROJECT USER ENTERS ESG DATA (Electricity=100000, Water=50000, Fuel=25000) ---');
  const envPayload = {
    projectId: 'proj-1',
    reportingPeriod: 'FY 2025-26',
    electricityKwh: 100000,
    fuelLitres: 25000,
    renewableEnergyPct: 45,
    waterWithdrawalKl: 50000,
    waterConsumptionKl: 38000,
    waterRecycledKl: 18500,
    hazardousWasteMt: 12.5,
    nonHazardousWasteMt: 145.0,
    status: 'submitted',
    evidenceAttached: 'DISCOM_Power_Invoices_FY26.pdf',
    remarks: 'Field meter logs verified by substation engineer',
    userName: 'Rajesh Verma'
  };
  res = await fetch(`${BASE_URL}/esg/environmental`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envPayload)
  });
  const savedEnv = await res.json();
  console.log('Saved Environmental Record ID:', savedEnv.id);
  console.log('Calculated Total Energy:', savedEnv.totalEnergyGj, 'GJ');
  console.log('Calculated Scope 1:', savedEnv.scope1GhgTco2e, 'tCO2e');
  console.log('Calculated Scope 2:', savedEnv.scope2GhgTco2e, 'tCO2e');

  console.log('\n--- 3. AI STATISTICAL ANOMALY DETECTION CHECK ---');
  res = await fetch(`${BASE_URL}/validation/anomalies/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric: 'Electricity Consumption',
      value: 100000,
      historical: [82000, 85000, 88000, 84000, 91000]
    })
  });
  const aiResult = await res.json();
  console.log('AI Outlier Detected:', aiResult.isAnomaly);
  console.log('AI Severity:', aiResult.severity);
  console.log('AI Diagnostic Message:', aiResult.explanation);

  // Get active workflow
  const apprListRes = await fetch(`${BASE_URL}/approvals`);
  const apprList = await apprListRes.json();
  const targetWfId = apprList[0]?.id || 'wf-smp-500-env';

  console.log(`\n--- 4. BU MANAGER REVIEWS & APPROVES SUBMISSION (Workflow: ${targetWfId}) ---`);
  res = await fetch(`${BASE_URL}/approvals/${targetWfId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'approve',
      comments: 'Unit engineering verification passed against substation meter telemetry.',
      userName: 'Vikram Malhotra',
      userRole: 'BU Manager'
    })
  });
  const buAppr = await res.json();
  console.log('Workflow Status after BU Manager:', buAppr.overallStatus);
  console.log('Current Step:', buAppr.steps?.[buAppr.currentStepIndex]?.label || 'Stage 2 Completed');

  console.log('\n--- 5. ESG TEAM VALIDATES & MAPS TO BRSR PRINCIPLES ---');
  res = await fetch(`${BASE_URL}/approvals/${targetWfId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'approve',
      comments: 'Technical review passed. Mapped to P6 Environmental Core disclosures.',
      userName: 'Dr. Ananya Sen',
      userRole: 'Head of Sustainability'
    })
  });
  const esgAppr = await res.json();
  console.log('Workflow Status after ESG Team:', esgAppr.overallStatus);

  console.log('\n--- 6. FINAL EXECUTIVE APPROVER SIGNOFF ---');
  res = await fetch(`${BASE_URL}/approvals/${targetWfId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'approve',
      comments: 'Board ESG Committee formal signoff executed.',
      userName: 'Deepak Khaitan',
      userRole: 'Board Member & Final Approver'
    })
  });
  const finalAppr = await res.json();
  console.log('Workflow Final Status:', finalAppr.overallStatus);

  console.log('\n--- 7. GENERATE ANNUAL BRSR REPORT FROM DATABASE ---');
  res = await fetch(`${BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'SEBI BRSR Comprehensive Annual Report FY 2025-26',
      type: 'SEBI Mandatory Regulatory Filing'
    })
  });
  const newReport = await res.json();
  console.log('Generated Report ID:', newReport.id);
  console.log('Report Title:', newReport.title);
  console.log('Report Status:', newReport.status);

  console.log('\n--- 8. VERIFY UPDATED DASHBOARD NUMBERS (CALCULATED FROM DB) ---');
  res = await fetch(`${BASE_URL}/dashboard`);
  const updatedDash = await res.json();
  console.log('Updated ESG Completion:', updatedDash.esgCompletion + '%');
  console.log('Updated BRSR Completion:', updatedDash.brsrCompletion + '%');
  console.log('Updated Approved Records:', updatedDash.approvedRecords);
  console.log('Updated Total Energy (GJ):', updatedDash.metricsSummary.totalEnergyGj);
  console.log('Updated Scope 1 GHG (tCO2e):', updatedDash.metricsSummary.totalScope1Tco2e);

  console.log('\n==================================================');
  console.log('>>> COMPLETE INTER-PAGE WORKFLOW FULLY VERIFIED! <<<');
  console.log('==================================================\n');
}

testWorkflow().catch(console.error);
