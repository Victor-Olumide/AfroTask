import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  // If user is not loaded yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Try multiple possible ID properties
  const userId = user.id || user.uid || user._id || user.userId;
  
  console.log('Resolved userId:', userId);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: User ID not found</p>
          <p className="text-sm text-gray-600">User object: {JSON.stringify(user)}</p>
        </div>
      </div>
    );
  }

  // Redirect to public profile with user's ID
  return <Navigate to={`/profile/${userId}`} replace />;
};

export default ProfilePage;
