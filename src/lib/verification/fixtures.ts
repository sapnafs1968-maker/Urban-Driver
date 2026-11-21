export interface DemoScenarioDefinition {
  id: string;
  label: string;
  description: string;
  expectedStatus: string;
  presetData: {
    dlNumber: string;
    fullName: string;
    dob: string;
    issuingState: string;
    issuingRto: string;
  };
}

export const DEMO_SCENARIOS: DemoScenarioDefinition[] = [
  {
    id: 'DEMO-VALID-001',
    label: 'Scenario 1: Valid Active Licence (Passes)',
    description: 'Active licence with matching name, DOB, and authorised vehicle classes (LMV, MCWG).',
    expectedStatus: 'DEMO_PASSED',
    presetData: {
      dlNumber: 'DEMO-VALID-001',
      fullName: 'Rajesh Kumar Sharma',
      dob: '1988-06-15',
      issuingState: 'Karnataka',
      issuingRto: 'KA-03 (Indiranagar, Bengaluru)',
    },
  },
  {
    id: 'DEMO-EXPIRED-001',
    label: 'Scenario 2: Expired Licence (Fails Validity Check)',
    description: 'Record exists in simulated database, but validity expired in 2021.',
    expectedStatus: 'DEMO_EXPIRED',
    presetData: {
      dlNumber: 'DEMO-EXPIRED-001',
      fullName: 'Suresh Babu Patel',
      dob: '1975-03-22',
      issuingState: 'Gujarat',
      issuingRto: 'GJ-01 (Ahmedabad West)',
    },
  },
  {
    id: 'DEMO-MISMATCH-001',
    label: 'Scenario 3: Details Mismatch (DOB / Name Mismatch)',
    description: 'Record exists (Amit Vikram Singh, 1992-11-04), but entered DOB is intentionally different.',
    expectedStatus: 'DEMO_DETAILS_MISMATCH',
    presetData: {
      dlNumber: 'DEMO-MISMATCH-001',
      fullName: 'Amit Vikram Singh',
      dob: '1995-01-01', // Intentionally mismatched from registry record (1992-11-04)
      issuingState: 'Maharashtra',
      issuingRto: 'MH-02 (Mumbai West)',
    },
  },
  {
    id: 'DEMO-NOTFOUND-001',
    label: 'Scenario 4: Licence Not Found (No Registry Record)',
    description: 'No matching record exists in the simulated Parivahan/Sarathi RTO database.',
    expectedStatus: 'DEMO_RECORD_NOT_FOUND',
    presetData: {
      dlNumber: 'DEMO-NOTFOUND-001',
      fullName: 'Vikramaditya Roy',
      dob: '1990-08-12',
      issuingState: 'West Bengal',
      issuingRto: 'WB-02 (Kolkata)',
    },
  },
  {
    id: 'DEMO-ERROR-001',
    label: 'Scenario 5: Service Outage / Retry (HTTP 503 Gateway Error)',
    description: 'Simulates transport gateway timeout with an interactive Retry button.',
    expectedStatus: 'DEMO_SERVICE_UNAVAILABLE',
    presetData: {
      dlNumber: 'DEMO-ERROR-001',
      fullName: 'Karan Malhotra',
      dob: '1986-12-05',
      issuingState: 'Delhi',
      issuingRto: 'DL-01 (Mall Road, Delhi)',
    },
  },
];

export const DEMO_REGISTRY_RECORDS: Record<
  string,
  {
    holderName: string;
    dob: string;
    fatherOrHusbandName: string;
    issueDate: string;
    validFrom: string;
    validUntil: string;
    isExpired: boolean;
    vehicleClasses: string[];
    issuingRto: string;
    issuingState: string;
  }
> = {
  'DEMO-VALID-001': {
    holderName: 'Rajesh Kumar Sharma',
    dob: '1988-06-15',
    fatherOrHusbandName: 'Manoj Kumar Sharma',
    issueDate: '2018-05-10',
    validFrom: '2018-05-10',
    validUntil: '2038-05-09',
    isExpired: false,
    vehicleClasses: ['LMV (Light Motor Vehicle)', 'MCWG (Motorcycle with Gear)'],
    issuingRto: 'KA-03 (Indiranagar, Bengaluru)',
    issuingState: 'Karnataka',
  },
  'DEMO-EXPIRED-001': {
    holderName: 'Suresh Babu Patel',
    dob: '1975-03-22',
    fatherOrHusbandName: 'Babu Bhai Patel',
    issueDate: '2001-01-15',
    validFrom: '2001-01-15',
    validUntil: '2021-01-14',
    isExpired: true,
    vehicleClasses: ['LMV (Light Motor Vehicle)'],
    issuingRto: 'GJ-01 (Ahmedabad West)',
    issuingState: 'Gujarat',
  },
  'DEMO-MISMATCH-001': {
    holderName: 'Amit Vikram Singh',
    dob: '1992-11-04',
    fatherOrHusbandName: 'Vikram Singh',
    issueDate: '2015-08-20',
    validFrom: '2015-08-20',
    validUntil: '2035-08-19',
    isExpired: false,
    vehicleClasses: ['LMV (Light Motor Vehicle)', 'MCWG (Motorcycle with Gear)'],
    issuingRto: 'MH-02 (Mumbai West)',
    issuingState: 'Maharashtra',
  },
};
