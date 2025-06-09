interface PatientInfo {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

// Generate a deterministic avatar URL based on patient info
export const generatePatientAvatar = (patientInfo: PatientInfo): string => {
  const { name, age, gender } = patientInfo;
  
  // Create a seed from patient info for consistency
  const seed = name + age + gender;
  
  // Use DiceBear API for illustrated medical-appropriate avatars
  const style = 'avataaars'; // Professional illustration style
  const baseUrl = 'https://api.dicebear.com/7.x';
  
  // Configure avatar based on demographics
  const params = new URLSearchParams({
    seed: seed,
    backgroundColor: 'f0f9ff,dbeafe,e0e7ff', // Light blue tones
    backgroundType: 'solid',
    // Gender-appropriate styling
    ...(gender === 'female' && {
      hair: 'long01,long02,long03,long04,long05,long06',
      hairColor: '2c1b18,724133,a55728,c93305,d6a853',
    }),
    ...(gender === 'male' && {
      hair: 'short01,short02,short03,short04,short05,short06',
      hairColor: '2c1b18,724133,a55728,c93305,d6a853',
    }),
    // Age-appropriate features
    ...(age >= 60 && {
      hairColor: 'd1d5db,9ca3af', // Gray/silver for seniors
    }),
    // Professional medical context
    accessoriesChance: '20',
    accessories: 'prescription01,prescription02', // Medical glasses
  });
  
  return `${baseUrl}/${style}/svg?${params.toString()}`;
};

// Fallback avatar for when patient info is incomplete
export const getDefaultAvatar = (): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=medical&backgroundColor=f0f9ff&hair=short01&hairColor=724133&accessories=prescription01`;
};

// Generate avatar with medical context theming
export const generateMedicalAvatar = (patientInfo: Partial<PatientInfo>): string => {
  if (!patientInfo.name || !patientInfo.age || !patientInfo.gender) {
    return getDefaultAvatar();
  }
  
  return generatePatientAvatar(patientInfo as PatientInfo);
}; 