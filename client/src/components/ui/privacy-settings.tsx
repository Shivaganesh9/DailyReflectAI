import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Fingerprint,
  Cloud,
  Download,
  AlertTriangle
} from "lucide-react";

interface PrivacySettingsProps {
  preferences: any;
  onUpdate: (field: string, value: any) => void;
}

export function PrivacySettings({ preferences, onUpdate }: PrivacySettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <Shield className="w-5 h-5" />
            <span>Security Status</span>
            <Badge variant="default" className="bg-green-600">
              Protected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-300">Local Encryption</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-300">Secure Storage</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-300">Privacy Mode</span>
            <Badge variant={preferences?.privacyMode ? "default" : "secondary"}>
              {preferences?.privacyMode ? "On" : "Off"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="biometric" className="text-sm font-medium">
                Biometric Authentication
              </Label>
              <p className="text-xs text-muted-foreground">
                Use fingerprint or face recognition to secure your diary
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Fingerprint className="w-4 h-4 text-muted-foreground" />
              <Switch
                id="biometric"
                checked={preferences?.biometricEnabled || false}
                onCheckedChange={(checked) => onUpdate("biometricEnabled", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Privacy Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="privacy-mode" className="text-sm font-medium">
                Enhanced Privacy Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Hide entry previews and use additional security measures
              </p>
            </div>
            <Switch
              id="privacy-mode"
              checked={preferences?.privacyMode || false}
              onCheckedChange={(checked) => onUpdate("privacyMode", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="encryption" className="text-sm font-medium">
                Local Encryption
              </Label>
              <p className="text-xs text-muted-foreground">
                Encrypt all data stored on your device
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Always On
              </Badge>
              <Switch
                id="encryption"
                checked={true}
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="w-5 h-5" />
            <span>Data & Sync</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="offline-mode" className="text-sm font-medium">
                Offline Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Continue journaling without internet connection
              </p>
            </div>
            <Switch
              id="offline-mode"
              checked={preferences?.offlineMode !== false}
              onCheckedChange={(checked) => onUpdate("offlineMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sync-enabled" className="text-sm font-medium">
                Cloud Sync
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync entries across devices
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={preferences?.syncEnabled !== false}
              onCheckedChange={(checked) => onUpdate("syncEnabled", checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Export & Backup</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Advanced Settings</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Warning: These settings affect data security and app functionality. 
                Only modify if you understand the implications.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Data Retention</Label>
              <p className="text-xs text-muted-foreground">
                Your entries are stored locally and never shared without your permission.
                All AI analysis happens securely and your personal data remains private.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Security Audit</Label>
              <Button variant="outline" size="sm" className="w-full">
                Run Security Check
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}