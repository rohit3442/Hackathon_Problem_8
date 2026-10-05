export interface AnomalyCheckResult {
  isAnomaly: boolean;
  score: number; // 0 to 1
  severity: 'normal' | 'warning' | 'error';
  metric: string;
  category?: 'environmental' | 'social' | 'governance';
  currentValue: number;
  expectedBaseline: number;
  upperLimit?: number;
  variancePct: number;
  explanation: string;
  ruleCode?: string;
  recommendation?: string;
}

export function evaluateAnomaly(
  metricName: string,
  currentVal: number,
  historicalValues: number[] = [],
  options: {
    category?: 'environmental' | 'social' | 'governance';
    upperLimit?: number;
    lowerLimit?: number;
    baseline?: number;
    ruleCode?: string;
  } = {}
): AnomalyCheckResult {
  const normMetric = metricName.toLowerCase();

  // 1. STATUTORY ZERO-TOLERANCE RULES
  if (normMetric.includes('fatalit') || normMetric.includes('death')) {
    if (currentVal > 0) {
      return {
        isAnomaly: true,
        score: 1.0,
        severity: 'error',
        metric: metricName,
        category: 'social',
        currentValue: currentVal,
        expectedBaseline: 0,
        upperLimit: 0,
        variancePct: 100,
        ruleCode: 'SOC-FATAL-01',
        explanation: `CRITICAL STATUTORY BREACH: ${currentVal} workplace fatality reported. Factories Act & SEBI mandate immediate senior management inquiry and zero-tolerance EHS root-cause audit.`,
        recommendation: 'Immediate halt of affected work zone, submission of Form 18A to Chief Inspector of Factories, and comprehensive OSHA hazard analysis.'
      };
    }
  }

  // Physical non-negativity rule
  if (currentVal < 0 && !normMetric.includes('net') && !normMetric.includes('offset')) {
    return {
      isAnomaly: true,
      score: 1.0,
      severity: 'error',
      metric: metricName,
      category: options.category || 'environmental',
      currentValue: currentVal,
      expectedBaseline: 0,
      variancePct: -100,
      ruleCode: 'PHYS-NON-NEG',
      explanation: `Physical impossibility: ${metricName} entered as negative (${currentVal}). Physical resources and headcounts cannot be negative.`,
      recommendation: 'Review manual transcription or metering multiplier errors.'
    };
  }

  // 2. EXPLICIT CONFIGURED UPPER/LOWER LIMITS
  if (options.upperLimit !== undefined && currentVal > options.upperLimit) {
    const baseline = options.baseline || (options.upperLimit * 0.8);
    const variancePct = baseline > 0 ? Number((((currentVal - baseline) / baseline) * 100).toFixed(1)) : 100;
    const isCritical = currentVal > options.upperLimit * 1.25;
    return {
      isAnomaly: true,
      score: isCritical ? 0.95 : 0.65,
      severity: isCritical ? 'error' : 'warning',
      metric: metricName,
      category: options.category || 'environmental',
      currentValue: currentVal,
      expectedBaseline: baseline,
      upperLimit: options.upperLimit,
      variancePct,
      ruleCode: options.ruleCode || 'THRESHOLD-LIMIT',
      explanation: `Limit breach: Reported ${metricName} (${currentVal.toLocaleString()}) exceeds maximum allowed operational threshold (${options.upperLimit.toLocaleString()}) by ${Math.abs(variancePct)}%.`,
      recommendation: 'Verify utility metering log, calibrate field sensors, or submit an engineering justification note.'
    };
  }

  if (options.lowerLimit !== undefined && currentVal < options.lowerLimit) {
    const baseline = options.baseline || (options.lowerLimit * 1.2);
    const variancePct = baseline > 0 ? Number((((currentVal - baseline) / baseline) * 100).toFixed(1)) : -100;
    return {
      isAnomaly: true,
      score: 0.7,
      severity: 'warning',
      metric: metricName,
      category: options.category || 'environmental',
      currentValue: currentVal,
      expectedBaseline: baseline,
      upperLimit: options.upperLimit,
      variancePct,
      ruleCode: options.ruleCode || 'THRESHOLD-MIN-LIMIT',
      explanation: `Deficiency alert: Reported ${metricName} (${currentVal}) falls below minimum compliance threshold (${options.lowerLimit}).`,
      recommendation: 'Check that all operational shifts and subcontractor data points have been aggregated.'
    };
  }

  // 3. STATISTICAL OUTLIER DETECTION (Z-Score from historical data)
  if (historicalValues.length === 0) {
    const base = options.baseline || currentVal;
    return {
      isAnomaly: false,
      score: 0.0,
      severity: 'normal',
      metric: metricName,
      category: options.category || 'environmental',
      currentValue: currentVal,
      expectedBaseline: base,
      upperLimit: options.upperLimit,
      variancePct: 0,
      explanation: 'Value is within expected standard operational boundaries.',
      recommendation: 'Telemetry matches baseline bounds.'
    };
  }

  const sum = historicalValues.reduce((a, b) => a + b, 0);
  const mean = sum / historicalValues.length;
  const variance = historicalValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance) || (mean * 0.1) || 1;

  const diffFromMean = Math.abs(currentVal - mean);
  const zScore = diffFromMean / stdDev;
  const variancePct = Number((((currentVal - mean) / (mean || 1)) * 100).toFixed(1));

  // Severe anomaly: Z-Score > 2.8 or > 75% sudden spike
  if (zScore > 2.8 || Math.abs(variancePct) > 75) {
    const score = Math.min(0.99, Number((0.7 + (zScore * 0.08)).toFixed(2)));
    return {
      isAnomaly: true,
      score,
      severity: 'error',
      metric: metricName,
      category: options.category || 'environmental',
      currentValue: currentVal,
      expectedBaseline: Number(mean.toFixed(2)),
      upperLimit: Number((mean + 2 * stdDev).toFixed(2)),
      variancePct,
      ruleCode: 'STAT-ZSCORE-CRIT',
      explanation: `Critical statistical outlier: Value deviates by ${Math.abs(variancePct)}% from 5-cycle historical baseline (Z-Score: ${zScore.toFixed(2)}σ). Requires mandatory audit signoff.`,
      recommendation: 'Perform physical meter audit and attach vendor invoices before submitting to BU Manager.'
    };
  }

  // Moderate anomaly: Z-Score > 1.8 or > 25% deviation
  if (zScore > 1.8 || Math.abs(variancePct) > 25) {
    const score = Math.min(0.75, Number((0.4 + (zScore * 0.1)).toFixed(2)));
    return {
      isAnomaly: true,
      score,
      severity: 'warning',
      metric: metricName,
      category: options.category || 'environmental',
      currentValue: currentVal,
      expectedBaseline: Number(mean.toFixed(2)),
      upperLimit: Number((mean + 1.8 * stdDev).toFixed(2)),
      variancePct,
      ruleCode: 'STAT-ZSCORE-WARN',
      explanation: `Operational variance detected: Value is ${Math.abs(variancePct)}% ${variancePct > 0 ? 'above' : 'below'} expected baseline (mean: ${mean.toLocaleString()}).`,
      recommendation: 'Review equipment run-hours or seasonal demand shifts to confirm accuracy.'
    };
  }

  return {
    isAnomaly: false,
    score: Number((zScore * 0.15).toFixed(2)),
    severity: 'normal',
    metric: metricName,
    category: options.category || 'environmental',
    currentValue: currentVal,
    expectedBaseline: Number(mean.toFixed(2)),
    upperLimit: Number((mean + 2 * stdDev).toFixed(2)),
    variancePct,
    explanation: 'Value conforms with historical baseline distribution curves.',
    recommendation: 'Verified within normal standard operating deviation.'
  };
}
