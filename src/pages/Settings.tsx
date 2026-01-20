import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Database, Cloud, HardDrive, ShieldCheck, LogOut, User } from "lucide-react";

export default function Settings() {
  const isSyncEnabled = !!supabase;
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your data and preferences.</p>
      </div>
      
      <div className="grid gap-6">
        {/* User Account Section */}
        {isSyncEnabled && user && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account</CardTitle>
              </div>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10">
                <div className="space-y-1">
                  <p className="font-medium">Signed in as</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Synchronization Section */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle>Data Synchronization</CardTitle>
                </div>
                <CardDescription>
                    Control how your diary entries are stored and backed up.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-5 border rounded-xl bg-secondary/10 transition-colors hover:bg-secondary/20">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        {isSyncEnabled ? <Cloud className="h-4 w-4 text-green-600" /> : <HardDrive className="h-4 w-4 text-orange-600" />}
                        <p className="font-medium">Storage Mode</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isSyncEnabled 
                            ? "Your data is safely synced to the cloud." 
                            : "Data is stored locally on this device only."}
                    </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${
                    isSyncEnabled 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                    {isSyncEnabled ? "Cloud Sync Active" : "Local Mode"}
                </span>
            </div>

            {!isSyncEnabled && (
                <div className="flex gap-3 bg-muted/50 p-4 rounded-lg text-sm border border-border/50">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="space-y-1 text-muted-foreground">
                        <p>To enable sync, create a Supabase project and add your credentials to the <code className="bg-background px-1.5 py-0.5 rounded border text-foreground font-mono text-xs">.env</code> file.</p>
                        <p>See <span className="font-medium text-foreground">SUPABASE_SETUP.md</span> for details.</p>
                    </div>
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}