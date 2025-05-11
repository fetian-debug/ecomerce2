import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Helmet } from 'react-helmet-async';

const Profile: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    token,
    logout,
    showAuthModal
  } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    address: string;
  }>({
    fullName: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    // Update form data if user changes
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to update your profile',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await apiRequest(
        'PUT',
        '/api/user/profile',
        formData,
        {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      );

      // Log the full response for debugging
      console.log('Profile update response:', {
        status: response.status,
        ok: response.ok
      });

      const updatedUser = await response.json();

      // Log the updated user data
      console.log('Updated user data:', updatedUser);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated'
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);

      // More detailed error handling
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred while updating your profile';

      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Helmet>
          <title>Login Required | E-commerce Platform</title>
        </Helmet>
        <h1 className="text-2xl mb-4">Login Required</h1>
        <p className="mb-4">Please log in to view your profile</p>
        <Button onClick={showAuthModal}>
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>User Profile | E-commerce Platform</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      <form onSubmit={handleUpdateProfile} className="max-w-md">
        <div className="mb-4">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter your full name"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="address">Address</Label>
          <Input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter your address"
          />
        </div>

        <div className="flex space-x-4">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button type="submit" variant="default">
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original user data
                  setFormData({
                    fullName: user?.fullName || '',
                    email: user?.email || '',
                    address: user?.address || ''
                  });
                }}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="destructive"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
