// Mock data to populate screens that need lists
export const mockHistory = [
    { id: 101, patient: 'Alice Smith', date: '2025-10-24', drug: 'Amoxicillin', risk: 'SAFE' },
    { id: 102, patient: 'Bob Jones', date: '2025-10-23', drug: 'Warfarin + Aspirin', risk: 'HIGH' },
    { id: 103, patient: 'Charlie Brown', date: '2025-10-22', drug: 'Ibuprofen', risk: 'MEDIUM' },
];

export const mockPendingPrescriptions = [
    { id: 201, patient: 'David White', drugs: ['Metformin', 'Insulin'], status: 'Pending' },
    { id: 202, patient: 'Eva Green', drugs: ['Ciprofloxacin'], status: 'Pending' },
];
