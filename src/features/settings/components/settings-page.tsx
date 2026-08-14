"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  School,
  Calendar,
  Users,
  Shield,
  Upload,
  Plus,
  User,
  Loader2,
  Save,
} from "lucide-react";

import { useAdminProfile, useUpdateAdminProfile } from "@/features/admin/services/admin-profile.service";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const { data: adminProfile, isLoading: isAdminLoading, refetch: refetchAdmin } = useAdminProfile();
  const { mutate: updateAdmin, isPending: isUpdatingAdmin } = useUpdateAdminProfile();

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // Update local state when profile loads
  useEffect(() => {
    if (adminProfile) {
      setAdminName(adminProfile.name);
      setAdminEmail(adminProfile.email);
    }
  }, [adminProfile]);

  const handleAdminSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdmin({ name: adminName, email: adminEmail }, {
      onSuccess: () => {
        alert("Profile updated successfully!");
        refetchAdmin();
      },
      onError: (err: any) => alert(err.message),
    });
  };

  // General Settings
  const [schoolName, setSchoolName] = useState("Radora International School");
  const [schoolCode, setSchoolCode] = useState("RDRA2026");
  const [address, setAddress] = useState("123 Education Lane, Knowledge Park, New Delhi - 110001");
  const [phone, setPhone] = useState("+91 11 2345 6789");
  const [email, setEmail] = useState("admin@radora.edu");
  const [website, setWebsite] = useState("www.radora.edu");
  const [principal, setPrincipal] = useState("Dr. Sanjay Gupta");

  // Academic Settings
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [termStructure, setTermStructure] = useState("Semester");
  const [gradingSystem, setGradingSystem] = useState("Percentage");
  const [passingPercentage, setPassingPercentage] = useState("40");
  const [attendanceThreshold, setAttendanceThreshold] = useState("75");
  const [workingDays, setWorkingDays] = useState("6");

  // Security Settings
  const [twoFactor, setTwoFactor] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [minLength, setMinLength] = useState("8");
  const [reqUpper, setReqUpper] = useState(true);
  const [reqNumber, setReqNumber] = useState(true);
  const [reqSpecial, setReqSpecial] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert("Settings saved successfully!");
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Settings"
          description="Configure system settings and preferences."
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Profile</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB 0: Admin Profile ===== */}
          <TabsContent value="profile" className="mt-4">
            <form onSubmit={handleAdminSave}>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                  <CardDescription>
                    Manage your personal admin account settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isAdminLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">Full Name</Label>
                        <Input
                          id="adminName"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email Address</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                  <Button type="submit" disabled={isAdminLoading || isUpdatingAdmin}>
                    {isUpdatingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* ===== TAB 1: General ===== */}
          <TabsContent value="general" className="mt-4">
            <form onSubmit={handleSave}>
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>
                    Basic details about the institution used across the system and in reports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Upload className="h-6 w-6" />
                          <span className="text-xs font-medium">Upload Logo</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Recommended: 256x256px</p>
                    </div>

                    <div className="flex-1 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input
                          id="schoolName"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolCode">School Code</Label>
                        <Input
                          id="schoolCode"
                          value={schoolCode}
                          onChange={(e) => setSchoolCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="principal">Principal Name</Label>
                      <Input
                        id="principal"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* ===== TAB 2: Academic ===== */}
          <TabsContent value="academic" className="mt-4">
            <form onSubmit={handleSave}>
              <Card>
                <CardHeader>
                  <CardTitle>Academic Settings</CardTitle>
                  <CardDescription>
                    Configure the academic year structure, grading, and attendance rules.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Current Academic Year</Label>
                      <Input
                        id="academicYear"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="termStructure">Term Structure</Label>
                      <Select value={termStructure} onValueChange={(v) => setTermStructure(v ?? "Semester")}>
                        <SelectTrigger id="termStructure">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semester">Semester (2 Terms)</SelectItem>
                          <SelectItem value="Trimester">Trimester (3 Terms)</SelectItem>
                          <SelectItem value="Quarterly">Quarterly (4 Terms)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gradingSystem">Grading System</Label>
                      <Select value={gradingSystem} onValueChange={(v) => setGradingSystem(v ?? "Percentage")}>
                        <SelectTrigger id="gradingSystem">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="GPA">GPA (4.0 Scale)</SelectItem>
                          <SelectItem value="Letter Grade">Letter Grade (A-F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingPercentage">Passing Percentage (%)</Label>
                      <Input
                        id="passingPercentage"
                        type="number"
                        value={passingPercentage}
                        onChange={(e) => setPassingPercentage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attendanceThreshold">Attendance Threshold (%)</Label>
                      <Input
                        id="attendanceThreshold"
                        type="number"
                        value={attendanceThreshold}
                        onChange={(e) => setAttendanceThreshold(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingDays">Working Days/Week</Label>
                      <Select value={workingDays} onValueChange={(v) => setWorkingDays(v ?? "5")}>
                        <SelectTrigger id="workingDays">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Days (Mon-Fri)</SelectItem>
                          <SelectItem value="6">6 Days (Mon-Sat)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Class Structure</h4>
                      <p className="text-xs text-muted-foreground">Default sections and capacity per class.</p>
                    </div>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Classes</TableHead>
                            <TableHead>Sections</TableHead>
                            <TableHead className="text-right">Max Students/Section</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Primary (1 - 5)</TableCell>
                            <TableCell>A, B, C, D</TableCell>
                            <TableCell className="text-right">30</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Middle (6 - 8)</TableCell>
                            <TableCell>A, B, C, D</TableCell>
                            <TableCell className="text-right">35</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">High School (9 - 12)</TableCell>
                            <TableCell>A, B, C</TableCell>
                            <TableCell className="text-right">40</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* ===== TAB 3: Users ===== */}
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>User Roles & Management</CardTitle>
                  <CardDescription>
                    Manage roles, permissions, and active users in the system.
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Active Users</TableHead>
                        <TableHead>Permissions Summary</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Administrator</TableCell>
                        <TableCell>
                          <Badge variant="secondary">2 Users</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">Full system access, settings, user management.</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Teacher</TableCell>
                        <TableCell>
                          <Badge variant="secondary">25 Users</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">Manage classes, attendance, exams, student profiles.</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Student</TableCell>
                        <TableCell>
                          <Badge variant="secondary">50 Users</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">View timetable, grades, attendance, assignments.</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Parent</TableCell>
                        <TableCell>
                          <Badge variant="secondary">45 Users</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">View child's progress, pay fees, communicate with teachers.</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB 4: Security ===== */}
          <TabsContent value="security" className="mt-4">
            <form onSubmit={handleSave}>
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure authentication policies and access controls.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Access Control</h4>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication (2FA)</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for all staff accounts.</p>
                      </div>
                      <Checkbox
                        checked={twoFactor}
                        onCheckedChange={(checked) => setTwoFactor(checked === true)}
                        className="h-5 w-5"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Force Password Change</Label>
                        <p className="text-sm text-muted-foreground">Force users to change password every 90 days.</p>
                      </div>
                      <Checkbox
                        checked={forcePasswordChange}
                        onCheckedChange={(checked) => setForcePasswordChange(checked === true)}
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">Automatically log out inactive users after 30 minutes.</p>
                      </div>
                      <Checkbox
                        checked={sessionTimeout}
                        onCheckedChange={(checked) => setSessionTimeout(checked === true)}
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">IP Whitelisting</Label>
                        <p className="text-sm text-muted-foreground">Restrict admin access to specific IP addresses.</p>
                      </div>
                      <Checkbox
                        checked={ipWhitelist}
                        onCheckedChange={(checked) => setIpWhitelist(checked === true)}
                        className="h-5 w-5"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Password Policy</h4>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="minLength">Minimum Password Length</Label>
                        <Input
                          id="minLength"
                          type="number"
                          value={minLength}
                          onChange={(e) => setMinLength(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="reqUpper"
                          checked={reqUpper}
                          onCheckedChange={(c) => setReqUpper(c === true)}
                        />
                        <Label htmlFor="reqUpper" className="font-normal">Uppercase letter</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="reqNumber"
                          checked={reqNumber}
                          onCheckedChange={(c) => setReqNumber(c === true)}
                        />
                        <Label htmlFor="reqNumber" className="font-normal">Number</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="reqSpecial"
                          checked={reqSpecial}
                          onCheckedChange={(c) => setReqSpecial(c === true)}
                        />
                        <Label htmlFor="reqSpecial" className="font-normal">Special character</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Security Settings
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
