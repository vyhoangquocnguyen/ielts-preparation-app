

interface ProfileFormProps {
    user: {
        firstName: string | null;
        lastName: string | null;
        targetScore: number | null;
        studyGoal: string | null;
    }
}
const ProfileForm = ({ user }: ProfileFormProps) => {
    
  return (
    <div>ProfileForm</div>
  )
}

export default ProfileForm