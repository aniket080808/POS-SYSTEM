import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { getUserProfile } from "@/Redux Toolkit/features/user/userThunks";
import {
  fetchSystemSettings,
  updateSystemSetting,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  updateProfile,
  changePassword,
} from "@/Redux Toolkit/features/settings/settingsThunks";

export const useSettingsState = () => {
  const dispatch = useDispatch();
  const { userProfile, loading: userLoading } = useSelector((state) => state.user);
  const { systemSettings, notificationPreferences, loading: settingsLoading } = useSelector((state) => state.settings);
  const { toast } = useToast();

  const loading = userLoading || settingsLoading;

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      dispatch(getUserProfile(token));
      dispatch(fetchSystemSettings());
      dispatch(fetchNotificationPreferences());
    }
  }, [dispatch]);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleProfileUpdate = async () => {
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      dispatch(getUserProfile(localStorage.getItem("jwt")));
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error || "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = (key) => {
    const newValue = !notificationPreferences[key];
    dispatch(updateNotificationPreferences({
      ...notificationPreferences,
      [key]: newValue
    }));
  };

  const handleSystemSettingToggle = (key) => {
    const isCurrentlyTrue = systemSettings[key] === "true";
    const newValue = !isCurrentlyTrue;
    
    dispatch(updateSystemSetting({ key, value: newValue.toString() }))
      .unwrap()
      .then(() => {
        toast({
          title: "Setting Updated",
          description: `System setting updated successfully.`,
        });
      })
      .catch((error) => {
        toast({
          title: "Update Failed",
          description: error || "Failed to update setting.",
          variant: "destructive",
        });
      });
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleShowPasswordToggle = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  
  const formattedSystemSettings = {
    autoApproveStores: systemSettings.autoApproveStores === "true",
    requireDocumentVerification: systemSettings.requireDocumentVerification === "true",
    commissionAutoCalculation: systemSettings.commissionAutoCalculation === "true",
    maintenanceMode: systemSettings.maintenanceMode === "true",
  };

  return {
    profileData,
    loading,
    passwordData,
    showPasswords,
    notifications: notificationPreferences,
    systemSettings: formattedSystemSettings,
    handleProfileUpdate,
    handlePasswordChange,
    handleNotificationToggle,
    handleSystemSettingToggle,
    handleProfileFieldChange,
    handlePasswordFieldChange,
    handleShowPasswordToggle
  };
}; 