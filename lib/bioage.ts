export type BioAgeInput = {
  chronoAge: number
  sex: 'male' | 'female'
  height: number // cm
  weight: number // kg
  sleepHours: number
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor'
  hrv?: number
  vo2max?: number
  gripStrength?: number
  walkSpeed?: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
  stressLevel: 'low' | 'moderate' | 'high' | 'veryHigh'
  dietQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

export type BioAgeResult = {
  bioAge: number
  chronoAge: number
  metabolicScore: number
  cardioScore: number
  strengthScore: number
  recoveryScore: number
}

export function calculateBioAge(input: BioAgeInput): BioAgeResult {
  const {
    chronoAge, sex, height, weight, sleepHours, sleepQuality,
    hrv = 0, vo2max = 0, gripStrength = 0, walkSpeed = 0,
    activityLevel, stressLevel, dietQuality
  } = input

  const bmi = weight / Math.pow(height / 100, 2)

  let bioAge = chronoAge
  let metabolicScore = 50
  let cardioScore = 50
  let strengthScore = 50
  let recoveryScore = 50

  // Sleep hours impact
  if (sleepHours >= 7 && sleepHours <= 9) {
    bioAge -= 2
    recoveryScore += 20
  } else if (sleepHours < 6 || sleepHours > 10) {
    bioAge += 3
    recoveryScore -= 20
  }

  // Sleep quality impact
  const sleepQualityImpact: Record<BioAgeInput['sleepQuality'], number> = {
    excellent: -2,
    good: -1,
    fair: 1,
    poor: 3,
  }
  bioAge += sleepQualityImpact[sleepQuality] || 0
  recoveryScore += (sleepQualityImpact[sleepQuality] || 0) * -10

  // HRV impact (if provided)
  if (hrv > 0) {
    const expectedHRV = 100 - chronoAge * 0.8
    if (hrv > expectedHRV) {
      bioAge -= Math.min(3, (hrv - expectedHRV) / 10)
      recoveryScore += 15
    } else {
      bioAge += Math.min(3, (expectedHRV - hrv) / 10)
      recoveryScore -= 15
    }
  }

  // VO2max impact (if provided)
  if (vo2max > 0) {
    const expectedVO2 = sex === 'male' ? 50 - chronoAge * 0.4 : 45 - chronoAge * 0.35
    if (vo2max > expectedVO2) {
      bioAge -= Math.min(4, (vo2max - expectedVO2) / 5)
      cardioScore += 25
    } else {
      bioAge += Math.min(4, (expectedVO2 - vo2max) / 5)
      cardioScore -= 20
    }
  }

  // Grip strength impact (if provided)
  if (gripStrength > 0) {
    const expectedGrip = sex === 'male' ? 45 - chronoAge * 0.2 : 30 - chronoAge * 0.15
    if (gripStrength > expectedGrip) {
      bioAge -= Math.min(2, (gripStrength - expectedGrip) / 10)
      strengthScore += 20
    } else {
      bioAge += Math.min(3, (expectedGrip - gripStrength) / 10)
      strengthScore -= 20
    }
  }

  // Walking speed impact (if provided)
  if (walkSpeed > 0) {
    if (walkSpeed >= 1.2) {
      bioAge -= 2
      strengthScore += 15
    } else if (walkSpeed < 0.8) {
      bioAge += 3
      strengthScore -= 20
    }
  }

  // BMI impact
  if (bmi >= 18.5 && bmi <= 25) {
    bioAge -= 1
    metabolicScore += 20
  } else if (bmi > 30) {
    bioAge += 3
    metabolicScore -= 25
  }

  // Activity level impact
  const activityImpact: Record<BioAgeInput['activityLevel'], number> = {
    sedentary: 4,
    light: 2,
    moderate: 0,
    active: -2,
    veryActive: -3,
  }
  bioAge += activityImpact[activityLevel] || 0
  cardioScore += (activityImpact[activityLevel] || 0) * -8
  strengthScore += (activityImpact[activityLevel] || 0) * -5

  // Stress impact
  const stressImpact: Record<BioAgeInput['stressLevel'], number> = {
    low: -1,
    moderate: 0,
    high: 2,
    veryHigh: 4,
  }
  bioAge += stressImpact[stressLevel] || 0
  recoveryScore += (stressImpact[stressLevel] || 0) * -10

  // Diet quality impact
  const dietImpact: Record<BioAgeInput['dietQuality'], number> = {
    excellent: -2,
    good: -1,
    fair: 1,
    poor: 3,
  }
  bioAge += dietImpact[dietQuality] || 0
  metabolicScore += (dietImpact[dietQuality] || 0) * -10

  // Round and clamp
  bioAge = Math.round(bioAge)
  const clamp = (n: number) => Math.max(0, Math.min(100, n))

  return {
    bioAge,
    chronoAge,
    metabolicScore: clamp(metabolicScore),
    cardioScore: clamp(cardioScore),
    strengthScore: clamp(strengthScore),
    recoveryScore: clamp(recoveryScore),
  }
}
