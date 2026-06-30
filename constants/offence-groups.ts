// Raw TPS `primary_offence` codes have heavy semantic overlap (many incident
// subtypes for the same underlying category). This groups them into a small
// set of buckets for the rankings chart aggregate view.
export const offenceGroups: Record<string, string> = {
  // Theft (Bicycle)
  "THEFT UNDER": "Theft (Bicycle)",
  "THEFT OVER": "Theft (Bicycle)",
  "THEFT UNDER - BICYCLE": "Theft (Bicycle)",
  "THEFT OVER - BICYCLE": "Theft (Bicycle)",
  "THEFT UNDER - SHOPLIFTING": "Theft (Bicycle)",
  "THEFT OVER - SHOPLIFTING": "Theft (Bicycle)",
  "THEFT UNDER - DISTRACTION": "Theft (Bicycle)",
  "THEFT OF EBIKE UNDER $5000": "Theft (Bicycle)",
  "THEFT OF EBIKE OVER $5000": "Theft (Bicycle)",
  "THEFT FROM MAIL / BAG / KEY": "Theft (Bicycle)",

  // Theft (Vehicle)
  "THEFT FROM MOTOR VEHICLE OVER": "Theft (Vehicle)",
  "THEFT FROM MOTOR VEHICLE UNDER": "Theft (Vehicle)",
  "THEFT OF MOTOR VEHICLE": "Theft (Vehicle)",

  // Robbery
  "ROBBERY - BUSINESS": "Robbery",
  "ROBBERY - DELIVERY PERSON": "Robbery",
  "ROBBERY - HOME INVASION": "Robbery",
  "ROBBERY - MUGGING": "Robbery",
  "ROBBERY - OTHER": "Robbery",
  "ROBBERY - SWARMING": "Robbery",
  "ROBBERY WITH WEAPON": "Robbery",

  // Break & Enter
  "B&E": "Break & Enter",
  "B&E OUT": "Break & Enter",
  "B&E W'INTENT": "Break & Enter",
  "POSSESSION HOUSE BREAK INSTRUM": "Break & Enter",
  "UNLAWFULLY IN DWELLING-HOUSE": "Break & Enter",

  // Fraud
  "FRAUD - IDENTITY/PERS W-INT": "Fraud",
  "FRAUD OVER": "Fraud",
  "FRAUD UNDER": "Fraud",

  // Assault
  ASSAULT: "Assault",
  "ASSAULT - FORCE/THRT/IMPEDE": "Assault",
  "ASSAULT - RESIST/ PREVENT SEIZ": "Assault",
  "ASSAULT BODILY HARM": "Assault",
  "ASSAULT PEACE OFFICER": "Assault",
  "ASSAULT WITH WEAPON": "Assault",
  "AGGRAVATED ASLT PEACE OFFICER": "Assault",
  "SEXUAL ASSAULT": "Assault",
  "OBSTRUCT PEACE OFFICER": "Assault",

  // Mischief / Property Damage
  "MISCHIEF - ENDANGER LIFE": "Mischief / Property Damage",
  "MISCHIEF - INTERFERE W-PROP": "Mischief / Property Damage",
  "MISCHIEF TO VEHICLE": "Mischief / Property Damage",
  "MISCHIEF UNDER": "Mischief / Property Damage",
  "PUBLIC MISCHIEF": "Mischief / Property Damage",
  "ARSON - DAMAGE PROP/OWN PROP": "Mischief / Property Damage",
  "FIRE - DETERMINED": "Mischief / Property Damage",

  // Weapons / Drugs
  "CARRYING CONCEALED WEAPON": "Weapons / Drugs",
  "FIREARM - UNAUTHORIZED POSSESS": "Weapons / Drugs",
  "WEAPON - POSS DANGEROUS PURP": "Weapons / Drugs",
  "DRUG - POSS COCAINE (SCHD I)": "Weapons / Drugs",
  "DRUG - POSS METH (SCHD I)": "Weapons / Drugs",
  "DRUG - TRAF CANNABIS (SCHD II)": "Weapons / Drugs",
  "DRUG - TRAF OTHER (SCHD I)": "Weapons / Drugs",

  // Property (Found/Lost/Stolen Goods)
  "PROPERTY - FOUND": "Property (Found/Lost/Stolen Goods)",
  "PROPERTY - LOST": "Property (Found/Lost/Stolen Goods)",
  "PROPERTY - RECOVERED": "Property (Found/Lost/Stolen Goods)",
  "POSSESSION PROPERTY OBC OVER": "Property (Found/Lost/Stolen Goods)",
  "POSSESSION PROPERTY OBC UNDER": "Property (Found/Lost/Stolen Goods)",
  "TRAFFICKING PROPERTY OBC OVER": "Property (Found/Lost/Stolen Goods)",
  "TRAFFICKING PROPERTY OBC UNDER": "Property (Found/Lost/Stolen Goods)",

  // Threats / Harassment
  "THREAT - PERSON": "Threats / Harassment",
  "HARASS/INDECENT COMMUNICATIONS": "Threats / Harassment",
  EXTORTION: "Threats / Harassment",
  "INTIMATE PARTNER INCIDENT": "Threats / Harassment",

  // Administrative / Compliance
  "FTC PROBATION ORDER": "Administrative / Compliance",
  "FTC WITH CONDITIONS": "Administrative / Compliance",
  "ARR/WARR EXECUTED NO ADDED CHG": "Administrative / Compliance",
  "MHA SEC 16 (FORM 2)": "Administrative / Compliance",
  "MHA SEC 17 (POWER OF APP)": "Administrative / Compliance",
  "INVALID GO - RMS ONLY": "Administrative / Compliance",
  "INFORMATION ONLY": "Administrative / Compliance",
  "OTHER FEDERAL STATUTE OFFENCES": "Administrative / Compliance",

  // Traffic
  "CARELESS DRIVING- HTA": "Traffic",
  "DRIVING COMPLAINT": "Traffic",
  "MVC-PERSONAL INJURY": "Traffic",

  // Other / Suspicious
  INCIDENT: "Other / Suspicious",
  "INCIDENT - BICYCLE": "Other / Suspicious",
  "SUSPICIOUS BEHAV - OTHER": "Other / Suspicious",
  "SUSPICIOUS INCIDENT": "Other / Suspicious",
  "LANDLORD / TENANT DISPUTE": "Other / Suspicious",
  "LIQUOR - INTOXICATED": "Other / Suspicious",
  "TRESPASS AT NIGHT": "Other / Suspicious"
};

export const OFFENCE_GROUP_FALLBACK = "Other / Suspicious";

export function groupOffence(rawOffence: string): string {
  return offenceGroups[rawOffence] ?? OFFENCE_GROUP_FALLBACK;
}
