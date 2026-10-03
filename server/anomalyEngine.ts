export interface AnomalyCheckResult {
  isAnomaly: boolean;
  score: number; // 0 to 1
  severity: 'normal' | 'warning' | 'error';
  metric: string;
  currentValue: number;
  expectedBaseline: number;
  variancePct: number;
  explanation: string;
}

export function evaluateAnomaly(
  metricName: string,
  currentVal: number,
  historicalValues: number[] = []
): AnomalyCheckResult {
  if (currentVal < 0) {
    return {
      isAnomaly: true,
      score: 1.0,
      severity: 'error',
      metric: metricName,
      currentValue: currentVal,
      expectedBaseline: 0,
      variancePct: -100,
      explanation: `Negative value detected for ${metricName}. Physical consumption cannot be negative.`
    };
  }

  // If no history, assume baseline is currentVal
  if (historicalValues.length === 0) {
    return {
      isAnomaly: false,
      score: 0.0,
      severity: 'normal',
      metric: metricName,
      currentValue: currentVal,
      expectedBaseline: currentVal,
      variancePct: 0,
      explanation: 'First measurement cycle established as baseline.'
    };
  }

  // Calculate mean and std deviation
  const sum = historicalValues.reduce((a, b) => a + b, 0);
  const mean = sum / historicalValues.length;
  const variance = historicalValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance) || (mean * 0.1) || 1;

  const diffFromMean = Math.abs(currentVal - mean);
  const zScore = diffFromMean / stdDev;
  const variancePct = ((currentVal - mean) / (mean || 1)) * 100;

  // Severe anomaly: Z-Score > 3.0 or > 100% sudden jump
  if (zScore > 2.8 || Math.abs(variancePct) > 80) {
    const score = Math.min(0.99, Number((0.7 + (zScore * 0.08)).toFixed(2)));
    return {
      isAnomaly: true,
      score,
      severity: 'error',
      metric: metricName,
      currentValue: currentVal,
      expectedBaseline: Number(mean.toFixed(2)),
      variancePct: Number(variancePct.toFixed(1)),
      explanation: `Critical statistical outlier detected: value is ${Math.abs(variancePct).toFixed(0)}% ${variancePct > 0 ? 'higher' : 'lower'} than historical baseline (mean: ${mean.toLocaleString()}). Requires engineering justification.`
    };
  }

  // Moderate anomaly: Z-Score > 1.8 or > 30% jump
  if (zScore > 1.8 || Math.abs(variancePct) > 30) {
    const score = Math.min(0.75, Number((0.4 + (zScore * 0.1)).toFixed(2)));
    return {
      isAnomaly: true,
      score,
      severity: 'warning',
      metric: metricName,
      currentValue: currentVal,
      expectedBaseline: Number(mean.toFixed(2)),
      variancePct: Number(variancePct.toFixed(1)),
      explanation: `Possible anomaly detected: value deviates by ${Math.abs(variancePct).toFixed(0)}% from historical operational pattern. Please verify meter telemetry logs.`
    };
  }

  return {
    isAnomaly: false,
    score: Number((zScore * 0.15).toFixed(2)),
    severity: 'normal',
    metric: metricName,
    currentValue: currentVal,
    expectedBaseline: Number(mean.toFixed(2)),
    variancePct: Number(variancePct.toFixed(1)),
    explanation: 'Value is within expected standard operational deviation boundaries.'
  };
}
