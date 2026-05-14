import { z } from "zod";

export const createApplicationSchema = z.object({
  jobId: z.string().uuid().optional(),
  
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  
  gender: z.string().optional(),
  dob: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
  secondaryPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  
  objective: z.string().optional(),
  summary: z.string().optional(),
  
  totalExperience: z.string().optional(),
  currentCtc: z.string().optional(),
  expectedCtc: z.string().optional(),
  noticePeriod: z.string().optional(),
  employmentStatus: z.string().optional(),
  
  // 10th & 12th Specific Fields (Common in ATS forms)
  tenthBoard: z.string().optional(),
  tenthPercentage: z.string().optional(),
  tenthYear: z.string().optional(),
  twelfthBoard: z.string().optional(),
  twelfthPercentage: z.string().optional(),
  twelfthYear: z.string().optional(),
  twelfthStream: z.string().optional(),
  
  // Nested Arrays
  educations: z.array(z.object({
    level: z.string().min(1),
    schoolOrCollege: z.string().min(1),
    boardOrUniversity: z.string().optional(),
    streamOrSpecialization: z.string().optional(),
    passingYear: z.string().optional(),
    percentageOrCgpa: z.string().optional(),
    courseType: z.string().optional(),
    startYear: z.string().optional(),
  })).optional().default([]),

  experiences: z.array(z.object({
    jobTitle: z.string().min(1),
    companyName: z.string().min(1),
    role: z.string().optional(),
    employmentType: z.string().optional(),
  })).optional().default([]),

  projects: z.array(z.object({
    title: z.string().min(1),
    type: z.string().optional(),
    description: z.string().optional(),
    liveUrl: z.string().url().optional().or(z.literal("")),
    githubUrl: z.string().url().optional().or(z.literal("")),
  })).optional().default([]),

  certifications: z.array(z.object({
    name: z.string().min(1),
    issuingOrg: z.string().optional(),
  })).optional().default([]),

  achievements: z.array(z.object({
    title: z.string().min(1),
    orgName: z.string().optional(),
    dateReceived: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    description: z.string().optional(),
  })).optional().default([]),

  socialLinks: z.array(z.object({
    platform: z.string().min(1),
    url: z.string().url(),
  })).optional().default([]),

  skills: z.array(z.string()).optional().default([]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
