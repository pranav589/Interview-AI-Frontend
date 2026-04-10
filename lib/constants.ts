export const MESSAGES = {
  AUTH: {
    SIGNIN_SUCCESS: 'Signed in successfully!',
    SIGNIN_FAILED: 'Failed to sign in',
    SIGNUP_SUCCESS: 'Account created successfully!',
    SIGNUP_FAILED: 'Failed to create account',
    LOGOUT_SUCCESS: 'Logged out successfully!',
    TWO_FACTOR_REQUIRED: 'Please enter your 2FA code',
    VERIFICATION_SENT: "Check your inbox!",
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
    RESET_PASSWORD_SUCCESS: 'Password reset successfully!',
    RESET_PASSWORD_FAILED: 'Reset failed',
    INVALID_RESET_LINK: 'Invalid or expired reset link. Please request a new one.',
    CALLBACK_SUCCESS: 'Successfully authenticated',
    ERROR_OCCURRED: 'An error occurred',
  },
  RESUME: {
    UPLOAD_SUCCESS: 'Resume uploaded and analyzed!',
    UPLOAD_FAILED: 'Failed to upload resume',
    REMOVE_SUCCESS: 'Resume removed successfully!',
    REMOVE_FAILED: 'Failed to remove resume',
    PDF_ONLY: 'Please upload a PDF file.',
  },
  INTERVIEW: {
    START_SUCCESS: 'Interview started successfully!',
    START_FAILED: 'Failed to start interview',
    END_SUCCESS: 'Interview completed!',
    END_FAILED: 'Failed to end interview',
    FETCH_FAILED: 'Failed to fetch interview details',
    NO_INTERVIEW_ID: 'No interview ID provided',
    PREVIEW_SUCCESS: 'Preview created successfully!',
    CREDIT_LIMIT: 'You have run out of interview credits for this month. Please upgrade to Pro for unlimited access!',
    DATA_MISSING: 'Interview data missing',
  },
  INTERVIEW_ROOM: {
    PERMISSION_DENIED: 'Camera and microphone access denied. Please enable them in your browser settings.',
    PERMISSION_ERROR: 'Could not access camera/microphone. Please ensure they are connected.',
    RECONNECTING: 'Reconnecting to your interview session...',
    GETTING_TICKET: 'Obtaining secure access ticket...',
    TICKET_OBTAINED: 'Ticket obtained. Connecting to interview server...',
    CONNECTED: 'Connected. Initializing interviewer...',
    PAUSED: 'Interview paused. Take your time.',
    RESUMED: 'Interview resumed. Continue when ready.',
    COMPLETE: 'Interview complete. Generating your feedback...',
    PREVIOUS_RESTORED: 'Previous conversation restored. Ready to continue.',
    CONNECTION_FAILED: 'Connection failed. Please check your internet connection or server status.',
  },
  SETTINGS: {
    UPDATE_SUCCESS: 'Settings updated successfully',
    UPDATE_FAILED: 'Failed to update settings',
  },
  ONBOARDING: {
    COMPLETE_FAILED: 'Failed to complete onboarding',
  },
  PRICING: {
    FREE_DESC: 'Perfect for getting started with basic practice.',
    PRO_DESC: 'The ultimate prep tool for serious candidates.',
    ENTERPRISE_DESC: 'Tailored solutions for teams and organizations.',
  }
};

export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const DEFAULT_FREE_CREDITS = 3;

export const INTERVIEW_TYPES = [
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'Behavioral & HR questions',
    isComingSoon: false
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Coding & technical skills',
    isComingSoon: false
  },
  {
    id: 'system-design',
    label: 'System Design',
    description: 'Architecture & design problems',
    isComingSoon: true
  }
] as const;

export const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: '0-2 years experience'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: '2-5 years experience'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: '5+ years experience'
  }
] as const;

export const COMPANY_STYLES = [
  { id: 'standard', label: 'Standard Professional', description: 'Balanced and objective' },
  { id: 'google', label: 'Google-Style', description: 'First principles & problem solving' },
  { id: 'amazon', label: 'Amazon-Style', description: 'Leadership Principles & data' },
  { id: 'meta', label: 'Meta-Style', description: 'Fast execution & product sense' },
  { id: 'startup', label: 'High-Growth Startup', description: 'Ambiguity & high ownership' },
] as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
