export type Specialty = "Cardiology" | "Pediatrics";

export type Badge = "100% Verified" | "Verified Patient" | "Unverified";

export type Doctor = {
  id: string;
  name: string;
  specialty: Specialty;
  license: string;
  rating: number;
  reviewCount: number;
  focus: string;
};

export type Hospital = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  beds: number;
  er: boolean;
  erLabel: string;
  rating: number;
  reviewCount: number;
  responseMs: number;
};

export type Affiliation = {
  doctorId: string;
  hospitalId: string;
  schedule: string;
};

export type Review = {
  id: string;
  doctorId: string;
  hospitalId: string;
  text: string;
  badge: Badge;
  createdAt: string;
};

export const LAUNCH_CITY = {
  label: "Indiranagar, Bangalore",
  lat: 12.9784,
  lng: 77.6408,
};

export const DOCTORS: Doctor[] = [
  {
    id: "asha-menon",
    name: "Dr. Asha Menon",
    specialty: "Cardiology",
    license: "KMC 2011-18422",
    rating: 4.8,
    reviewCount: 186,
    focus: "Echocardiography and heart-failure clinics",
  },
  {
    id: "neil-smith",
    name: "Dr. Neil Smith",
    specialty: "Cardiology",
    license: "KMC 2008-11094",
    rating: 4.4,
    reviewCount: 96,
    focus: "Interventional cardiology",
  },
  {
    id: "vikram-shah",
    name: "Dr. Vikram Shah",
    specialty: "Cardiology",
    license: "KMC 2014-22018",
    rating: 4.7,
    reviewCount: 164,
    focus: "Preventive cardiology and lipid disorders",
  },
  {
    id: "farhan-qureshi",
    name: "Dr. Farhan Qureshi",
    specialty: "Cardiology",
    license: "KMC 2016-27440",
    rating: 4.3,
    reviewCount: 88,
    focus: "Arrhythmia and device follow-up",
  },
  {
    id: "rohan-iyer",
    name: "Dr. Rohan Iyer",
    specialty: "Pediatrics",
    license: "KMC 2013-19880",
    rating: 4.6,
    reviewCount: 142,
    focus: "Newborn and toddler clinics",
  },
  {
    id: "meera-krishnan",
    name: "Dr. Meera Krishnan",
    specialty: "Pediatrics",
    license: "KMC 2009-14211",
    rating: 4.9,
    reviewCount: 210,
    focus: "Pediatric asthma and allergies",
  },
  {
    id: "leela-nair",
    name: "Dr. Leela Nair",
    specialty: "Pediatrics",
    license: "KMC 2012-17654",
    rating: 4.7,
    reviewCount: 121,
    focus: "Growth, nutrition, and adolescent care",
  },
  {
    id: "ananya-rao",
    name: "Dr. Ananya Rao",
    specialty: "Pediatrics",
    license: "KMC 2017-30112",
    rating: 4.5,
    reviewCount: 77,
    focus: "Pediatric infectious disease",
  },
];

export const HOSPITALS: Hospital[] = [
  {
    id: "manipal-oar",
    name: "Manipal Hospital, Old Airport Road",
    area: "Old Airport Road",
    lat: 12.9583,
    lng: 77.6483,
    beds: 600,
    er: true,
    erLabel: "Trauma ER",
    rating: 4.5,
    reviewCount: 340,
    responseMs: 1400,
  },
  {
    id: "fortis-cunningham",
    name: "Fortis Hospital, Cunningham Road",
    area: "Cunningham Road",
    lat: 12.989,
    lng: 77.6085,
    beds: 350,
    er: true,
    erLabel: "Trauma ER",
    rating: 4.4,
    reviewCount: 290,
    responseMs: 2300,
  },
  {
    id: "bowring",
    name: "Bowring and Lady Curzon Hospital",
    area: "Shivaji Nagar",
    lat: 12.9816,
    lng: 77.6048,
    beds: 680,
    er: true,
    erLabel: "Trauma ER",
    rating: 4.1,
    reviewCount: 180,
    responseMs: 2700,
  },
  {
    id: "cloudnine-oar",
    name: "Cloudnine Hospital, Old Airport Road",
    area: "Old Airport Road",
    lat: 12.9668,
    lng: 77.6438,
    beds: 80,
    er: false,
    erLabel: "Maternity and pediatrics, no trauma bay",
    rating: 4.7,
    reviewCount: 260,
    responseMs: 0,
  },
  {
    id: "apollo-bannerghatta",
    name: "Apollo Hospital, Bannerghatta Road",
    area: "Bannerghatta Road",
    lat: 12.8966,
    lng: 77.5982,
    beds: 250,
    er: true,
    erLabel: "Trauma ER",
    rating: 4.2,
    reviewCount: 410,
    responseMs: 1800,
  },
  {
    id: "narayana-health-city",
    name: "Narayana Health City",
    area: "Bommasandra",
    lat: 12.8596,
    lng: 77.658,
    beds: 1000,
    er: true,
    erLabel: "Trauma ER",
    rating: 4.6,
    reviewCount: 380,
    responseMs: 2100,
  },
];

export const AFFILIATIONS: Affiliation[] = [
  { doctorId: "asha-menon", hospitalId: "apollo-bannerghatta", schedule: "Mon / Wed / Fri, 9 AM–1 PM" },
  { doctorId: "asha-menon", hospitalId: "manipal-oar", schedule: "Tue / Thu, 2 PM–6 PM" },
  { doctorId: "neil-smith", hospitalId: "apollo-bannerghatta", schedule: "Mon / Wed / Fri, 9 AM–1 PM" },
  { doctorId: "vikram-shah", hospitalId: "fortis-cunningham", schedule: "Mon / Wed / Fri, 10 AM–2 PM" },
  { doctorId: "vikram-shah", hospitalId: "narayana-health-city", schedule: "Thu, 9 AM–1 PM" },
  { doctorId: "farhan-qureshi", hospitalId: "fortis-cunningham", schedule: "Tue / Thu, 3 PM–7 PM" },
  { doctorId: "rohan-iyer", hospitalId: "cloudnine-oar", schedule: "Daily, 10 AM–2 PM" },
  { doctorId: "rohan-iyer", hospitalId: "manipal-oar", schedule: "Sat, 9 AM–12 PM" },
  { doctorId: "meera-krishnan", hospitalId: "cloudnine-oar", schedule: "Mon–Sat, 9 AM–1 PM" },
  { doctorId: "leela-nair", hospitalId: "bowring", schedule: "Mon–Fri, 11 AM–3 PM" },
  { doctorId: "leela-nair", hospitalId: "cloudnine-oar", schedule: "Sun, 10 AM–1 PM" },
  { doctorId: "ananya-rao", hospitalId: "manipal-oar", schedule: "Mon / Wed / Fri, 9 AM–12 PM" },
];

export const SEED_REVIEWS: Review[] = [
  {
    id: "seed-smith-apollo",
    doctorId: "neil-smith",
    hospitalId: "apollo-bannerghatta",
    text: "The doctor was brilliant but the ward was dirty.",
    badge: "100% Verified",
    createdAt: "2026-09-12",
  },
  {
    id: "seed-menon-manipal",
    doctorId: "asha-menon",
    hospitalId: "manipal-oar",
    text: "Dr. Menon explained the echo clearly. The billing desk was slow.",
    badge: "Verified Patient",
    createdAt: "2026-09-18",
  },
  {
    id: "seed-iyer-cloudnine",
    doctorId: "rohan-iyer",
    hospitalId: "cloudnine-oar",
    text: "Very gentle with my son and the room was clean.",
    badge: "100% Verified",
    createdAt: "2026-09-02",
  },
  {
    id: "seed-shah-fortis",
    doctorId: "vikram-shah",
    hospitalId: "fortis-cunningham",
    text: "The doctor seemed rushed, though the nurses were excellent.",
    badge: "Unverified",
    createdAt: "2026-08-29",
  },
  {
    id: "seed-nair-bowring",
    doctorId: "leela-nair",
    hospitalId: "bowring",
    text: "She listened. The waiting hall was overcrowded.",
    badge: "Verified Patient",
    createdAt: "2026-09-21",
  },
  {
    id: "seed-krishnan-cloudnine",
    doctorId: "meera-krishnan",
    hospitalId: "cloudnine-oar",
    text: "Brilliant pediatrician. We barely waited.",
    badge: "100% Verified",
    createdAt: "2026-09-08",
  },
];

export function doctorById(id: string): Doctor | undefined {
  return DOCTORS.find((doctor) => doctor.id === id);
}

export function hospitalById(id: string): Hospital | undefined {
  return HOSPITALS.find((hospital) => hospital.id === id);
}

export function affiliationsForDoctor(doctorId: string): Affiliation[] {
  return AFFILIATIONS.filter((row) => row.doctorId === doctorId);
}

export function affiliationsForHospital(hospitalId: string): Affiliation[] {
  return AFFILIATIONS.filter((row) => row.hospitalId === hospitalId);
}
