'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { FileUp, User, Download, Trash2 } from 'lucide-react';
import ResumeUploadModal from './resume-upload-modal';
import { MESSAGES } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [resumeModal, setResumeModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    router.push('/auth/signin');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDownloadResume = () => {
    if (user.resume) {
      alert(MESSAGES.RESUME.DOWNLOAD_SUCCESS);
    }
  };

  const handleRemoveResume = () => {
    if (user.resume) {
      alert(MESSAGES.RESUME.REMOVE_SUCCESS);
      // In a real app, update the backend
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account and interview preferences</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                    <Button variant="outline">Change Avatar</Button>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {editingName ? (
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={() => setEditingName(false)}>Save</Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center p-3 border border-border rounded-md bg-muted/30">
                        <span>{user.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingName(true)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="p-3 border border-border rounded-md bg-muted/30">
                      <span>{user.email}</span>
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="p-3 border border-border rounded-md bg-muted/30">
                      <span>February 2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resume Tab */}
            <TabsContent value="resume">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Management</CardTitle>
                  <CardDescription>Upload and manage your resume for interview preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.resume ? (
                    <div className="space-y-6">
                      {/* Resume Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border-2 border-primary/30 rounded-lg bg-primary/5"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{user.resume.filename}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Uploaded on {new Date(user.resume.uploadedAt).toLocaleDateString()}
                            </p>

                            {/* Extracted Data */}
                            {user.resume.extractedData && (
                              <div className="mt-4 space-y-4">
                                {/* Skills */}
                                <div>
                                  <p className="text-sm font-medium mb-2">Extracted Skills:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {user.resume.extractedData.skills.map((skill, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Experience */}
                                <div>
                                  <p className="text-sm font-medium mb-2">Experience:</p>
                                  <ul className="space-y-1">
                                    {user.resume.extractedData.experience.map((exp, i) => (
                                      <li key={i} className="text-sm text-muted-foreground">
                                        • {exp}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Education */}
                                <div>
                                  <p className="text-sm font-medium mb-2">Education:</p>
                                  <ul className="space-y-1">
                                    {user.resume.extractedData.education.map((edu, i) => (
                                      <li key={i} className="text-sm text-muted-foreground">
                                        • {edu}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadResume}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={handleRemoveResume}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>

                      {/* Upload New Resume */}
                      <div className="pt-4 border-t border-border">
                        <h4 className="font-semibold mb-4">Upload a new resume</h4>
                        <Button
                          onClick={() => setResumeModal(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <FileUp className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                        <FileUp className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">No Resume Uploaded</h3>
                      <p className="text-muted-foreground mb-6">
                        Upload your resume to personalize your interview practice
                      </p>
                      <Button onClick={() => setResumeModal(true)}>
                        <FileUp className="w-4 h-4 mr-2" />
                        Upload Resume
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Preferences</CardTitle>
                  <CardDescription>Set your default preferences for interviews</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Default Difficulty Level</Label>
                    <select
                      id="difficulty"
                      defaultValue="intermediate"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Preferred Interview Type</Label>
                    <select
                      id="type"
                      defaultValue="behavioral"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="system-design">System Design</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Default Interview Duration</Label>
                    <select
                      id="duration"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <Button>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Resume Upload Modal */}
      {resumeModal && (
        <ResumeUploadModal
          onClose={() => setResumeModal(false)}
          onUpload={(data) => {
            console.log('Resume uploaded:', data);
            setResumeModal(false);
          }}
        />
      )}
    </div>
  );
}
