import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileEdit, BarChart3 } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage ML Legend account listings</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border bg-card hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Upload account images for ML object detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gradient-primary hover:shadow-glow-primary">
                <Link to="/admin/upload">Upload Images</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-primary" />
                Add Account
              </CardTitle>
              <CardDescription>
                Manually input account data with heroes and skins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gradient-primary hover:shadow-glow-primary">
                <Link to="/admin/add-account">Add Account</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                View Analytics
              </CardTitle>
              <CardDescription>
                Check clustering analysis and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/analysis">View Analysis</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
